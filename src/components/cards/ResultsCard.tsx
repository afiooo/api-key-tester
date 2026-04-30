import { Search, Copy } from 'lucide-react';
import { useMemo, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/Button';
import { KeyResultRow, type KeyResult } from './KeyResultRow';
import { toast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/cn';

type Tab = 'all' | 'valid' | 'invalid' | 'rate-limited' | 'paid';

const COPY_LABEL: Record<Tab, string> = {
  all: 'copyAll',
  valid: 'copyValid',
  invalid: 'copyInvalid',
  'rate-limited': 'copyRateLimited',
  paid: 'copyPaidKeys',
};

interface ResultsCardProps {
  results: KeyResult[];
  onStatusClick?: (keyId: string) => void;
  showPaidTab?: boolean;
}

export function ResultsCard({ results, onStatusClick, showPaidTab }: ResultsCardProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const TABS: { id: Tab; label: string }[] = useMemo(() => {
    const tabs: { id: Tab; label: string }[] = [
      { id: 'all', label: t('all') },
      { id: 'valid', label: t('validKeys') },
    ];
    if (showPaidTab) {
      tabs.push({ id: 'paid', label: t('paidKeys') });
    }
    tabs.push(
      { id: 'invalid', label: t('invalidKeys') },
      { id: 'rate-limited', label: t('rateLimitedKeys') },
    );
    return tabs;
  }, [t, showPaidTab]);

  const filtered = useMemo(() => {
    const tested = results.filter((r) => r.status !== 'pending');
    if (tab === 'all') return tested;
    return tested.filter((r) => r.status === tab);
  }, [tab, results]);

  const handleCopyCurrentTab = useCallback(async () => {
    const keys = filtered.map((r) => r.key);
    if (keys.length === 0) { toast.error(t('noKeysToCopy')); return; }
    try {
      await navigator.clipboard.writeText(keys.join('\n'));
      toast.success(t('keysCopied', { count: keys.length }));
    } catch { toast.error(t('clipboardError')); }
  }, [filtered, t]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 3,
  });

  return (
    <section className="rounded-card border border-border bg-card px-4 py-2 flex flex-col gap-2">
      <div className="flex items-center gap-1 px-1 overflow-x-auto">
        {TABS.map((tabInfo) => (
          <button
            key={tabInfo.id}
            type="button"
            onClick={() => setTab(tabInfo.id)}
            className={cn(
              'px-2 py-2 rounded-card text-body font-bold transition-colors whitespace-nowrap cursor-pointer',
              tab === tabInfo.id
                ? 'bg-primary-soft text-primary'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            {tabInfo.label}
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="rounded-card border border-border bg-surface h-[300px] flex flex-col p-2 overflow-y-auto"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 min-h-[200px]">
            <Search size={48} strokeWidth={2} className="text-fg-muted" />
            <p className="text-body text-fg-muted text-center">{t('resultsWillShow')}</p>
          </div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((vi) => (
              <div
                key={filtered[vi.index].id}
                data-index={vi.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vi.start}px)`,
                }}
              >
                <div className="pb-2">
                  <KeyResultRow
                    data={filtered[vi.index]}
                    onStatusClick={onStatusClick}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={handleCopyCurrentTab}
        iconLeft={<Copy size={20} strokeWidth={2} />}
        block
      >
        {t(COPY_LABEL[tab])}
      </Button>
    </section>
  );
}
