import { DEFAULT_CONCURRENCY } from '@/constants/defaults';
import {
  testKey,
  testPaidKey,
  shouldRetry,
  getRetryDelay,
  buildUrlWithAuth,
  type TestConfig,
  type TestResult,
} from '@/services/api/tester';

// ── Message types ─────────────────────────────────────────────────────

type Status = 'testing' | 'retrying' | 'valid' | 'invalid' | 'rate-limited' | 'paid' | 'cancelled';

interface StartPayload {
  keys: string[];
  config: TestConfig & {
    maxRetries?: number;
    concurrency?: number;
    enablePaidDetection?: boolean;
    verboseLog?: boolean;
  };
}

interface KeyStatusUpdate {
  type: 'KEY_STATUS_UPDATE';
  payload: {
    key: string;
    status: Status;
    error?: string;
    retryCount: number;
    isPaid?: boolean | null;
    cacheApiStatus?: number | null;
    statusCode?: number;
  };
}

interface LogEvent {
  type: 'LOG_EVENT';
  payload: {
    key: string;
    stage: string;
    attempt: number;
    message: string;
    statusCode?: number;
    durationMs?: number;
    error?: string;
    requestUrl?: string;
    responseBody?: string;
    extra?: Record<string, unknown>;
  };
}

type WorkerMessage = KeyStatusUpdate | LogEvent | { type: 'TESTING_COMPLETE' } | { type: 'PONG' };

// ── State ─────────────────────────────────────────────────────────────

let shouldCancel = false;
let isProcessing = false;

// ── Concurrency engine ────────────────────────────────────────────────

async function processKeysWithConcurrency(
  keys: string[],
  config: StartPayload['config'],
): Promise<void> {
  const concurrency = Math.min(config.concurrency || DEFAULT_CONCURRENCY, keys.length);
  const queue = [...keys];
  const slots: Array<Promise<void> | null> = Array(concurrency).fill(null);

  const fillSlot = (index: number) => {
    if (queue.length === 0 || shouldCancel) {
      slots[index] = null;
      return;
    }
    const key = queue.shift()!;
    slots[index] = processKeyWithRetry(key, config, index).then(() => {
      fillSlot(index);
    });
  };

  // Fill all slots
  for (let i = 0; i < concurrency; i++) {
    fillSlot(i);
  }

  // Wait for all slots to finish
  while (slots.some((s) => s !== null) && !shouldCancel) {
    const active = slots.filter((s): s is Promise<void> => s !== null);
    if (active.length === 0) break;
    await Promise.race(active.map((p, i) => p.then(() => i)));
  }
}

// ── Retry + test engine ───────────────────────────────────────────────

async function processKeyWithRetry(
  apiKey: string,
  config: StartPayload['config'],
  _slotIndex: number,
): Promise<void> {
  const maxRetries = config.maxRetries ?? 3;
  const enablePaidDetection = config.enablePaidDetection ?? false;
  const startTime = Date.now();

  // Emit testing status
  postMsg({ type: 'KEY_STATUS_UPDATE', payload: { key: apiKey, status: 'testing', retryCount: 0 } });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (shouldCancel) {
      postMsg({ type: 'KEY_STATUS_UPDATE', payload: { key: apiKey, status: 'cancelled', retryCount: attempt } });
      return;
    }

    if (attempt > 0) {
      // Retry delay
      postMsg({ type: 'KEY_STATUS_UPDATE', payload: { key: apiKey, status: 'retrying', retryCount: attempt } });
      await sleep(getRetryDelay());
      if (shouldCancel) {
        postMsg({ type: 'KEY_STATUS_UPDATE', payload: { key: apiKey, status: 'cancelled', retryCount: attempt } });
        return;
      }
    }

    try {
      const requestUrl = buildUrl(apiKey, config);
      const result: TestResult = await testKey(apiKey, config);

      // Handle success
      if (result.valid) {
        if (config.provider === 'gemini' && enablePaidDetection) {
          const paidResult = await testPaidKey(apiKey, config.baseUrl);
          const isPaid = paidResult.isPaid === true;
          const status: Status = isPaid ? 'paid' : 'valid';
          postMsg({
            type: 'KEY_STATUS_UPDATE',
            payload: { key: apiKey, status, retryCount: attempt, isPaid: paidResult.isPaid, cacheApiStatus: paidResult.cacheApiStatus, statusCode: result.statusCode },
          });
          postResultLog(apiKey, attempt, isPaid ? '付费密钥' : '免费有效密钥', result, requestUrl, Date.now() - startTime);
        } else {
          postMsg({
            type: 'KEY_STATUS_UPDATE',
            payload: { key: apiKey, status: 'valid', retryCount: attempt, statusCode: result.statusCode },
          });
          postResultLog(apiKey, attempt, '有效密钥', result, requestUrl, Date.now() - startTime);
        }
        return;
      }

      if (result.isRateLimit) {
        postMsg({
          type: 'KEY_STATUS_UPDATE',
          payload: { key: apiKey, status: 'rate-limited', retryCount: attempt, error: result.error || 'rateLimited', statusCode: result.statusCode },
        });
        postResultLog(apiKey, attempt, '速率限制', result, requestUrl, Date.now() - startTime);
        return;
      }

      if (!shouldRetry(result.error, result.statusCode)) {
        postMsg({
          type: 'KEY_STATUS_UPDATE',
          payload: { key: apiKey, status: 'invalid', retryCount: attempt, error: result.error || 'unknown', statusCode: result.statusCode },
        });
        postResultLog(apiKey, attempt, result.error || '无效密钥', result, requestUrl, Date.now() - startTime);
        return;
      }

      if (attempt >= maxRetries) {
        postMsg({
          type: 'KEY_STATUS_UPDATE',
          payload: { key: apiKey, status: 'invalid', retryCount: attempt, error: result.error || 'unknown', statusCode: result.statusCode },
        });
        postResultLog(apiKey, attempt, `失败（已重试${maxRetries}次）: ${result.error}`, result, requestUrl, Date.now() - startTime);
        return;
      }

      // Will retry
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!shouldRetry(msg) || attempt >= maxRetries) {
        postMsg({
          type: 'KEY_STATUS_UPDATE',
          payload: { key: apiKey, status: 'invalid', retryCount: attempt, error: msg },
        });
        return;
      }
    }
  }
}

// ── Message helpers ────────────────────────────────────────────────────

function postMsg(msg: WorkerMessage) {
  (self as unknown as Worker).postMessage(msg);
}

function postResultLog(key: string, attempt: number, message: string, result: TestResult, requestUrl: string, durationMs: number) {
  postMsg({
    type: 'LOG_EVENT',
    payload: {
      key,
      stage: result.valid ? 'final' : 'error',
      attempt,
      message,
      requestUrl,
      responseBody: result.responseBody || undefined,
      statusCode: result.statusCode,
      durationMs,
    },
  });
}

function buildUrl(apiKey: string, config: StartPayload['config']): string {
  return buildUrlWithAuth(
    config.baseUrl,
    config.endpoint,
    config.model,
    apiKey,
    config.queryParamAuth || false,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Error boundary ─────────────────────────────────────────────────────

self.addEventListener('error', (e: Event) => {
  const msg = e instanceof ErrorEvent ? e.message : String(e);
  postMsg({ type: 'LOG_EVENT', payload: { key: '__worker__', stage: 'error', attempt: 0, message: `Worker error: ${msg}` } });
});

self.onunhandledrejection = (e: PromiseRejectionEvent) => {
  const msg = e.reason instanceof Error ? e.reason.message : String(e.reason);
  postMsg({ type: 'LOG_EVENT', payload: { key: '__worker__', stage: 'error', attempt: 0, message: `Unhandled rejection: ${msg}` } });
};

// ── Message handler ────────────────────────────────────────────────────

self.onmessage = async (event: MessageEvent) => {
  const msg = event.data;

  switch (msg.type) {
    case 'START_TESTING': {
      if (isProcessing) {
        postMsg({ type: 'LOG_EVENT', payload: { key: '__worker__', stage: 'error', attempt: 0, message: 'Worker busy, ignoring START_TESTING' } });
        return;
      }
      isProcessing = true;
      shouldCancel = false;

      try {
        const { keys, config } = msg.payload as StartPayload;
        if (!keys || keys.length === 0) {
          postMsg({ type: 'LOG_EVENT', payload: { key: '__worker__', stage: 'error', attempt: 0, message: 'No keys provided' } });
        } else {
          await processKeysWithConcurrency(keys, config);
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        postMsg({ type: 'LOG_EVENT', payload: { key: '__worker__', stage: 'error', attempt: 0, message: `Worker crash: ${errMsg}` } });
      } finally {
        isProcessing = false;
        postMsg({ type: 'TESTING_COMPLETE' });
      }
      break;
    }

    case 'CANCEL_TESTING':
      shouldCancel = true;
      break;

    case 'PING':
      postMsg({ type: 'PONG' });
      break;
  }
};
