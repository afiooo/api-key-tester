import { useRef, useEffect, useCallback, useState } from 'react';
import type { TestConfig } from '@/services/api/tester';

// ── Types ─────────────────────────────────────────────────────────────

export type KeyStatus = 'testing' | 'retrying' | 'valid' | 'invalid' | 'rate-limited' | 'paid' | 'cancelled' | 'pending';

export interface KeyStatusUpdate {
  key: string;
  status: KeyStatus;
  error?: string;
  retryCount: number;
  isPaid?: boolean | null;
  cacheApiStatus?: number | null;
  statusCode?: number;
}

export interface LogEventPayload {
  key: string;
  stage: string;
  attempt: number;
  message: string;
  statusCode?: number;
  durationMs?: number;
  error?: string;
  requestUrl?: string;
  responseBody?: string;
}

export interface WorkerConfig {
  keys: string[];
  config: TestConfig & {
    maxRetries?: number;
    concurrency?: number;
    enablePaidDetection?: boolean;
    verboseLog?: boolean;
  };
}

interface UseWebWorkerOptions {
  onKeyUpdate: (update: KeyStatusUpdate) => void;
  onLogEvent: (event: LogEventPayload) => void;
  onComplete: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────

export function useWebWorker({ onKeyUpdate, onLogEvent, onComplete }: UseWebWorkerOptions) {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Keep latest callbacks in refs to avoid stale closure
  const callbacksRef = useRef({ onKeyUpdate, onLogEvent, onComplete });
  callbacksRef.current = { onKeyUpdate, onLogEvent, onComplete };

  // Create worker once on mount
  useEffect(() => {
    const worker = new Worker(
      new URL('@/workers/tester.worker.ts', import.meta.url),
      { type: 'module' },
    );

    const handleMessage = (e: MessageEvent) => {
      const msg = e.data;
      const cb = callbacksRef.current;
      switch (msg.type) {
        case 'PONG':
          setIsReady(true);
          break;
        case 'KEY_STATUS_UPDATE':
          cb.onKeyUpdate(msg.payload);
          break;
        case 'LOG_EVENT':
          cb.onLogEvent(msg.payload);
          break;
        case 'TESTING_COMPLETE':
          cb.onComplete();
          break;
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: 'PING' });
    workerRef.current = worker;

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
      workerRef.current = null;
      setIsReady(false);
    };
  }, []);

  const startTesting = useCallback((cfg: WorkerConfig) => {
    if (!workerRef.current || !isReady) {
      throw new Error('Worker not ready');
    }
    workerRef.current.postMessage({
      type: 'START_TESTING',
      payload: cfg,
    });
  }, [isReady]);

  const cancelTesting = useCallback(() => {
    workerRef.current?.postMessage({ type: 'CANCEL_TESTING' });
  }, []);

  return { startTesting, cancelTesting, isReady };
}
