import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import type { AdvancedSettings } from '@/types/provider';

export type { AdvancedSettings };

interface AdvancedSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: AdvancedSettings;
  onChange: (next: AdvancedSettings) => void;
  provider?: string;
}

export function AdvancedSettingsModal({
  open,
  onClose,
  settings,
  onChange,
  provider,
}: AdvancedSettingsModalProps) {
  const { t } = useTranslation();

  const update = <K extends keyof AdvancedSettings>(k: K, v: AdvancedSettings[K]) => {
    onChange({ ...settings, [k]: v });
  };

  return (
    <Modal open={open} onClose={onClose} title={t('advancedSettings')}>
      <div className="flex flex-col gap-6">
        <SliderRow
          label={t('concurrencyControl')}
          min={1}
          max={50}
          value={settings.concurrency}
          onChange={(v) => update('concurrency', v)}
        />
        <SliderRow
          label={t('retryControl')}
          min={0}
          max={5}
          value={settings.retries}
          onChange={(v) => update('retries', v)}
        />
        <ToggleRow
          label={t('showDetailedLogs')}
          checked={settings.verboseLog}
          onChange={(v) => update('verboseLog', v)}
        />
        {provider === 'gemini' && (
          <ToggleRow
            label={t('paidDetection')}
            checked={settings.paidCheck}
            onChange={(v) => update('paidCheck', v)}
          />
        )}

        {/* Balance endpoint */}
        <div className="flex flex-col gap-2">
          <label className="text-body font-bold text-fg">{t('balance.title')} URL</label>
          <div className="rounded-card border border-border p-3">
            <input
              type="text"
              value={settings.balanceEndpoint || ''}
              onChange={(e) => update('balanceEndpoint', e.target.value)}
              className="w-full h-8 px-2 rounded-card border border-border bg-surface text-body text-fg placeholder:text-fg-subtle outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, min, max, value, onChange }: SliderRowProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-body font-bold text-fg">{label}</label>
      <div className="rounded-card border border-border p-4">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <Slider min={min} max={max} value={value} onChange={onChange} />
          </div>
          <div className="w-20 h-9 rounded-card border border-border bg-surface flex items-center justify-center">
            <span className="text-body font-bold text-fg">{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-body font-bold text-fg">{label}</span>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
