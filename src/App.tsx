import { useState, useEffect, useRef, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ProxyAndModelCard } from '@/components/cards/ProxyAndModelCard';
import { KeyListCard } from '@/components/cards/KeyListCard';
import { ActionButtons } from '@/components/cards/ActionButtons';
import { UsageNote } from '@/components/cards/UsageNote';
import { AdvancedSettingsTrigger } from '@/components/cards/AdvancedSettingsTrigger';
import { StatsCards } from '@/components/cards/StatsCards';
import { ProgressCards } from '@/components/cards/ProgressCards';
import { ResultsCard } from '@/components/cards/ResultsCard';
import { KeyLogModal } from '@/components/cards/KeyLogModal';
import { AdvancedSettingsModal, type AdvancedSettings } from '@/components/modals/AdvancedSettingsModal';
import { PaidDetectionPrompt, shouldShowPaidPrompt, hidePaidPrompt, resetPaidPrompt } from '@/components/cards/PaidDetectionPrompt';
import { PROVIDER_PRESETS } from '@/data/providerPresets';
import { useConfig } from '@/contexts/ConfigContext';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useModelFetcher } from '@/hooks/useModelFetcher';
import { useApiTester } from '@/hooks/useApiTester';
import { fetchBalance } from '@/services/api/tester';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/components/ui/ToastProvider';
import { DEFAULT_ADVANCED } from '@/constants/defaults';
import type { KeyLog } from '@/types/log';

function parseExtraHeaders(raw: string): Record<string, string> {
  if (!raw?.trim()) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export default function App() {
  const { t } = useLanguage();
  const { configs, activeConfig, activeConfigId, setActiveConfig, updateConfig } = useConfig();

  // ── API Tester ────────────────────────────────────────────────────

  const {
    results, isTesting, logs, stats, progress,
    startTesting, cancelTesting, clearResults, updateResult,
  } = useApiTester(activeConfigId ?? 'default');

  // ── Local working state ──────────────────────────────────────────

  const [proxyUrl, setProxyUrl] = useState(activeConfig?.proxyUrl ?? '');
  const [model, setModel] = useState(activeConfig?.model ?? 'gpt-4o-mini');
  const [keysText, setKeysText] = useState(activeConfig?.apiKeys ?? '');
  const [advanced, setAdvanced] = useState<AdvancedSettings>(
    { ...DEFAULT_ADVANCED, ...(activeConfig?.advanced || {}) },
  );
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [detectedModels, setDetectedModels] = useState<string[]>([]);

  // ── Log state ────────────────────────────────────────────────────

  const [selectedLogKey, setSelectedLogKey] = useState<string | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const selectedLog: KeyLog | null = logs.find((l) => l.keyId === selectedLogKey) ?? null;

  // ── Paid detection prompt ────────────────────────────────────────

  const [paidPromptOpen, setPaidPromptOpen] = useState(false);

  // ── File handler ─────────────────────────────────────────────────

  const { fileInputRef, handleFileUpload, handleFileChange, handlePaste } =
    useFileHandler({ onKeysLoaded: setKeysText, t });

  // ── Model fetcher ────────────────────────────────────────────────

  const { fetchModels, isFetching: isFetchingModels } = useModelFetcher({ t });

  const handleFetchModels = useCallback(async () => {
    const baseUrl = proxyUrl || activeConfig?.baseUrl || PROVIDER_PRESETS[activeConfig?.provider ?? 'openai']?.defaultBaseUrl || '';
    if (!baseUrl) { toast.error(t('enterApiKeysFirst')); return; }
    // Use first key from the list for auth
    const firstKey = keysText.split('\n').map((l) => l.trim()).filter(Boolean)[0] || '';
    const models = await fetchModels(
      baseUrl, firstKey,
      advanced.authHeader || 'Authorization',
      advanced.authPrefix || 'Bearer ',
      activeConfig?.queryParamAuth ?? false,
    );
    if (models.length > 0) {
      setDetectedModels((prev) => Array.from(new Set([...prev, ...models])));
    }
  }, [activeConfig, proxyUrl, keysText, advanced, fetchModels, t]);

  const skipSaveRef = useRef(false);

  // ── Auto-select first config ─────────────────────────────────────

  useEffect(() => {
    if (configs.length > 0 && !activeConfigId) {
      setActiveConfig(configs[0].id);
    }
  }, [configs.length, activeConfigId, setActiveConfig]);

  // ── Sync config → local on switch ────────────────────────────────

  useEffect(() => {
    if (activeConfig) {
      skipSaveRef.current = true;
      setProxyUrl(activeConfig.proxyUrl || '');
      setModel(activeConfig.model);
      setKeysText(activeConfig.apiKeys);
      setAdvanced({ ...DEFAULT_ADVANCED, ...(activeConfig.advanced || {}) });
      setIsCustomModel(false);
      if (activeConfig.provider === 'gemini' && shouldShowPaidPrompt()) {
        setPaidPromptOpen(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConfigId]);

  // ── Debounce-save local → config ─────────────────────────────────

  useEffect(() => {
    if (!activeConfigId) return;
    if (skipSaveRef.current) { skipSaveRef.current = false; return; }
    const timer = setTimeout(() => {
      updateConfig(activeConfigId, { proxyUrl, model, apiKeys: keysText, advanced, baseUrl: proxyUrl });
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyUrl, model, keysText, advanced]);

  // ── Balance query after testing completes ────────────────────────

  // Keep latest refs for balance query effect
  const balanceRef = useRef({ proxyUrl, activeConfig, advanced, results, updateResult });
  balanceRef.current = { proxyUrl, activeConfig, advanced, results, updateResult };

  const prevTestingRef = useRef(isTesting);
  useEffect(() => {
    const { proxyUrl: pu, activeConfig: ac, advanced: adv, results: res, updateResult: upd } = balanceRef.current;
    const balanceEp = adv.balanceEndpoint || PROVIDER_PRESETS[ac?.provider ?? 'openai']?.defaultBalanceEndpoint;
    if (prevTestingRef.current && !isTesting && balanceEp) {
      const validKeys = res.filter(
        (r) => r.status === 'valid' || r.status === 'paid',
      );
      if (validKeys.length === 0) return;

      (async () => {
        for (const r of validKeys.slice(0, 5)) {
          try {
            const result = await fetchBalance(
              r.key,
              pu || ac?.baseUrl || PROVIDER_PRESETS[ac?.provider ?? 'openai']?.defaultBaseUrl || '',
              balanceEp,
              adv.authHeader,
              adv.authPrefix,
            );
            if (result.success && result.balance) {
              upd(r.key, { balance: result.balance });
            }
          } catch { /* skip */ }
        }
      })();
    }
    prevTestingRef.current = isTesting;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTesting]);

  // ── Handlers ─────────────────────────────────────────────────────

  const handleStart = () => {
    if (isTesting) {
      cancelTesting();
      return;
    }
    const lines = keysText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) { toast.error(t('enterApiKeysFirst')); return; }

    const baseUrl = proxyUrl || activeConfig?.baseUrl || PROVIDER_PRESETS[activeConfig?.provider ?? 'openai']?.defaultBaseUrl || '';
    const extraHeaders = parseExtraHeaders(activeConfig?.extraHeaders ?? '');

    const preset = PROVIDER_PRESETS[activeConfig?.provider ?? 'openai'];

    startTesting({
      keys: lines,
      config: {
        baseUrl,
        endpoint: advanced.testEndpoint || preset?.defaultEndpoint || '/chat/completions',
        model,
        authHeader: advanced.authHeader || preset?.defaultAuthHeader || 'Authorization',
        authPrefix: advanced.authPrefix !== undefined ? advanced.authPrefix : (preset?.defaultAuthPrefix ?? 'Bearer '),
        extraHeaders,
        queryParamAuth: activeConfig?.queryParamAuth ?? false,
        provider: activeConfig?.provider,
        maxRetries: advanced.retries,
        concurrency: advanced.concurrency,
        enablePaidDetection: advanced.paidCheck,
        verboseLog: advanced.verboseLog,
      },
    });
  };

  const handleClear = () => {
    setKeysText('');
    setDetectedModels([]);
    clearResults();
    toast.success(t('cleared'));
  };

  const handleDedupe = () => {
    const lines = keysText.split('\n').map((l) => l.trim()).filter(Boolean);
    const unique = Array.from(new Set(lines));
    const removed = lines.length - unique.length;
    if (removed > 0) {
      setKeysText(unique.join('\n'));
      toast.success(t('dedupeSuccess', { removed, kept: unique.length }));
    } else {
      toast(t('noDuplicatesFound'));
    }
  };

  const handleStatusClick = useCallback((keyId: string) => {
    if (!advanced.verboseLog) return;
    setSelectedLogKey(keyId);
    setLogModalOpen(true);
  }, [advanced.verboseLog]);

  const showPaid = activeConfig?.provider === 'gemini' && advanced.paidCheck;

  const handlePaidConfirm = (dontShowAgain: boolean) => {
    if (dontShowAgain) hidePaidPrompt();
    setAdvanced((prev) => ({ ...prev, paidCheck: true }));
    setPaidPromptOpen(false);
  };

  const handleAdvancedResetPaidPrompt = () => {
    resetPaidPrompt();
    toast.success(t('paidDetectionSettings.resetDescription'));
  };

  return (
    <AppShell>
      <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleFileChange} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-8 max-w-[1376px] mx-auto">
        <div className="flex flex-col gap-4 min-w-0">
          <ProxyAndModelCard
            proxyUrl={proxyUrl}
            onProxyUrlChange={setProxyUrl}
            model={model}
            onModelChange={setModel}
            providerType={activeConfig?.provider ?? 'openai'}
            presetModels={activeConfig?.presetModels}
            detectedModels={detectedModels.join(', ')}
            isCustomModel={isCustomModel}
            onCustomize={() => setIsCustomModel((v) => !v)}
            onFetchModels={handleFetchModels}
            isFetchingModels={isFetchingModels}
            baseUrlPlaceholder={activeConfig?.baseUrl || PROVIDER_PRESETS[activeConfig?.provider ?? 'openai']?.defaultBaseUrl}
          />
          <KeyListCard value={keysText} onChange={setKeysText} onUpload={handleFileUpload} onCopy={handlePaste} />
          <ActionButtons isTesting={isTesting} onStart={handleStart} onDedupe={handleDedupe} onClear={handleClear} />
          <UsageNote />
          <AdvancedSettingsTrigger onClick={() => setAdvancedOpen(true)} />
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <StatsCards values={stats} showPaid={showPaid} />
          <ProgressCards values={progress} />
          <ResultsCard
            results={results}
            onStatusClick={handleStatusClick}
            showPaidTab={showPaid}
          />
        </div>
      </div>

      <AdvancedSettingsModal
        open={advancedOpen} onClose={() => setAdvancedOpen(false)}
        settings={advanced} onChange={setAdvanced}
        onResetPaidPrompt={handleAdvancedResetPaidPrompt}
        provider={activeConfig?.provider}
        balancePlaceholder={PROVIDER_PRESETS[activeConfig?.provider ?? 'openai']?.defaultBalanceEndpoint}
      />

      <PaidDetectionPrompt
        open={paidPromptOpen}
        onConfirm={handlePaidConfirm}
        onCancel={() => setPaidPromptOpen(false)}
      />

      {advanced.verboseLog && (
        <KeyLogModal open={logModalOpen} onClose={() => setLogModalOpen(false)} log={selectedLog} />
      )}
    </AppShell>
  );
}
