import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { PROVIDER_PRESETS } from '@/data/providerPresets';
import type { ProviderType } from '@/types/provider';

interface ProxyAndModelCardProps {
  proxyUrl: string;
  onProxyUrlChange: (v: string) => void;
  model: string;
  onModelChange: (m: string) => void;
  providerType: ProviderType;
  presetModels?: string;
  detectedModels?: string;
  isCustomModel?: boolean;
  onCustomize?: () => void;
  onFetchModels?: () => void;
  isFetchingModels?: boolean;
}

export function ProxyAndModelCard({
  proxyUrl,
  onProxyUrlChange,
  model,
  onModelChange,
  providerType,
  presetModels,
  detectedModels,
  isCustomModel,
  onCustomize,
  onFetchModels,
  isFetchingModels,
}: ProxyAndModelCardProps) {
  const { t } = useTranslation();
  const presetList = (presetModels || PROVIDER_PRESETS[providerType]?.modelOptions.join(', ') || '')
    .split(/\s*,\s*/)
    .filter(Boolean);
  const detectedList = (detectedModels || '')
    .split(/\s*,\s*/)
    .filter(Boolean)
    .filter((m) => !presetList.includes(m)); // dedupe against presets

  const hasDetected = detectedList.length > 0;

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <label className="text-h2 font-bold text-fg" htmlFor="proxy-url">
            {t('proxyUrl')}
          </label>
          <Input
            id="proxy-url"
            value={proxyUrl}
            onChange={(e) => onProxyUrlChange(e.target.value)}
          />
        </div>

        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <label className="text-h2 font-bold text-fg">{t('selectModel')}</label>
          <div className="flex gap-1 min-w-0">
            {isCustomModel ? (
              <div className="flex-1 min-w-0">
                <Input
                  value={model}
                  onChange={(e) => onModelChange(e.target.value)}
                  placeholder={t('modelInputPlaceholder')}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <Dropdown
                  align="left"
                  block
                  triggerClassName="w-full"
                  trigger={
                    <span className="flex w-full items-center justify-between h-8 px-2 rounded-card border border-border bg-surface text-body text-fg">
                      <span className="truncate">{model}</span>
                      <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-fg-muted" />
                    </span>
                  }
                  panelClassName="w-full min-w-[160px] max-h-[260px] overflow-y-auto"
                >
                  {(close) => (
                    <>
                      {presetList.map((m) => (
                        <DropdownItem
                          key={m}
                          active={m === model}
                          onClick={() => {
                            onModelChange(m);
                            close();
                          }}
                        >
                          {m}
                        </DropdownItem>
                      ))}
                      {hasDetected && (
                        <>
                          <div className="border-t border-border my-1" />
                          {detectedList.map((m) => (
                            <DropdownItem
                              key={m}
                              active={m === model}
                              onClick={() => {
                                onModelChange(m);
                                close();
                              }}
                            >
                              {m}
                            </DropdownItem>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </Dropdown>
              </div>
            )}

            <Button variant="secondary" size="sm" onClick={onCustomize} className="shrink-0">
              {isCustomModel ? t('presetModel') : t('customModel')}
            </Button>
            <Button variant="success" size="sm" onClick={onFetchModels} className="shrink-0" disabled={isFetchingModels}>
              {isFetchingModels ? t('detecting') : t('detectModels')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
