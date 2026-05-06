import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { ChevronDown, Check } from 'lucide-react';
import type { ProviderConfig, ProviderType } from '@/types/provider';
import { PROVIDER_PRESETS } from '@/data/providerPresets';
import { toast } from '@/lib/toast';

const PROVIDER_TYPES = Object.keys(PROVIDER_PRESETS) as ProviderType[];

export interface ConfigEditorData {
  name: string;
  provider: ProviderType;
  baseUrl: string;
  presetModels: string;
  testEndpoint: string;
  authHeader: string;
  authPrefix: string;
  extraHeaders: string;
  queryParamAuth: boolean;
}

interface ConfigEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ConfigEditorData) => void;
  config?: ProviderConfig;
}

export function ConfigEditorModal({ open, onClose, onSave, config }: ConfigEditorModalProps) {
  const { t } = useTranslation();
  const isEdit = !!config;

  const getInitialProvider = () => config?.provider ?? 'openai';
  const initialProvider = getInitialProvider();
  const initialPreset = PROVIDER_PRESETS[initialProvider];

  const [name, setName] = useState(config?.name || initialPreset.name);
  const [provider, setProvider] = useState<ProviderType>(initialProvider);
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl ?? '');
  const [presetModels, setPresetModels] = useState(config?.presetModels || initialPreset.modelOptions.join(', '));
  const [testEndpoint, setTestEndpoint] = useState(config?.advanced?.testEndpoint || initialPreset.defaultEndpoint);
  const [authHeader, setAuthHeader] = useState(config?.advanced?.authHeader || initialPreset.defaultAuthHeader);
  const [authPrefix, setAuthPrefix] = useState(
    config?.advanced?.authPrefix !== undefined ? config.advanced.authPrefix : initialPreset.defaultAuthPrefix,
  );
  const [extraHeaders, setExtraHeaders] = useState(config?.extraHeaders || initialPreset.defaultExtraHeaders);
  const [queryParamAuth, setQueryParamAuth] = useState(config?.queryParamAuth ?? false);

  const preset = PROVIDER_PRESETS[provider];

  const handleProviderChange = (p: ProviderType) => {
    setProvider(p);
    const pr = PROVIDER_PRESETS[p];
    setBaseUrl(pr.defaultBaseUrl);
    setPresetModels(pr.modelOptions.join(', '));
    setTestEndpoint(pr.defaultEndpoint);
    setAuthHeader(pr.defaultAuthHeader);
    setAuthPrefix(pr.defaultAuthPrefix ?? '');
    setExtraHeaders(pr.defaultExtraHeaders);
    setQueryParamAuth(pr.defaultQueryParamAuth);
    if (!isEdit) {
      setName(pr.name);
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedBaseUrl = baseUrl.trim();
    if (!trimmedName) { toast.error(t('emptyConfigName')); return; }
    if (!trimmedBaseUrl) { toast.error(t('emptyBaseUrl')); return; }
    onSave({
      name: trimmedName,
      provider,
      baseUrl: trimmedBaseUrl,
      presetModels: presetModels.trim(),
      testEndpoint: testEndpoint.trim(),
      authHeader: authHeader.trim(),
      authPrefix,
      extraHeaders: extraHeaders.trim(),
      queryParamAuth,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? t('modal.editConfig') : t('modal.newConfig')}>
      <div className="flex flex-col gap-4">
        {/* 名称 + 提供商 */}
        <Field label={t('modal.configName')} required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label={t('selectApi')}>
          <Dropdown
            align="left" triggerClassName="w-full"
            trigger={
              <span className="flex w-full items-center justify-between h-10 px-3 rounded-card border border-border bg-surface text-body text-fg">
                <span className="flex items-center gap-2">{preset.icon}<span>{preset.name}</span></span>
                <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-fg-muted" />
              </span>
            }
            panelClassName="w-full min-w-[200px]"
          >
            {(close) => (
              <>
                {PROVIDER_TYPES.map((t) => {
                  const p = PROVIDER_PRESETS[t];
                  return (
                    <DropdownItem key={t} active={t === provider} icon={p.icon}
                      trailing={t === provider ? <Check size={18} className="text-primary" /> : undefined}
                      onClick={() => { handleProviderChange(t); close(); }}>
                      {p.name}
                    </DropdownItem>
                  );
                })}
              </>
            )}
          </Dropdown>
        </Field>

        {/* API 地址 */}
        <Field label={t('modal.apiAddress')} required>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </Field>

        {/* 测试端点 */}
        <Field label={t('modal.testEndpoint')}>
          <Input value={testEndpoint} onChange={(e) => setTestEndpoint(e.target.value)} />
        </Field>

        {/* Auth 配置 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('modal.authHeader')}>
            <Input value={authHeader} onChange={(e) => setAuthHeader(e.target.value)} />
          </Field>
          <Field label={t('modal.authPrefix')}>
            <Input value={authPrefix} onChange={(e) => setAuthPrefix(e.target.value)} />
          </Field>
        </div>

        {/* Query Param Auth */}
        <div className="flex items-center justify-between gap-4 py-1">
          <span className="text-btn font-bold text-fg">{t('modal.queryParamAuth')}</span>
          <Toggle checked={queryParamAuth} onChange={setQueryParamAuth} label={t('modal.queryParamAuthLabel')} />
        </div>

        {/* 额外 Headers */}
        <Field label={t('modal.extraHeaders')}>
          <Input value={extraHeaders} onChange={(e) => setExtraHeaders(e.target.value)} />
        </Field>

        {/* 预设模型 */}
        <Field label={t('modal.presetModels')}>
          <Input value={presetModels} onChange={(e) => setPresetModels(e.target.value)} />
        </Field>

        {/* 按钮 */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
          <Button variant="primary" onClick={handleSave}>{isEdit ? t('modal.saveChanges') : t('modal.create')}</Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-btn font-bold text-fg">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
