import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { KeyLog } from '@/types/log';

interface LogsPreviewPanelProps {
  logs: KeyLog[];
  onSelectKey: (keyId: string) => void;
}

export function LogsPreviewPanel({ logs, onSelectKey }: LogsPreviewPanelProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (logs.length === 0) return null;

  return (
    <section className="rounded-card border border-border bg-card px-4 py-2 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full cursor-pointer"
      >
        <span className="text-h2 font-bold text-fg">{t('logs')}</span>
        {expanded ? (
          <ChevronUp size={20} strokeWidth={2} className="text-fg-muted" />
        ) : (
          <ChevronDown size={20} strokeWidth={2} className="text-fg-muted" />
        )}
      </button>

      {expanded && (
        <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1">
          {logs.map((l) => (
            <button
              key={l.keyId}
              type="button"
              onClick={() => onSelectKey(l.keyId)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-card text-left transition-colors cursor-pointer',
                'text-body text-fg hover:bg-hover',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  l.events.some((e) => e.stage === 'error')
                    ? 'bg-error'
                    : 'bg-success',
                )}
              />
              <span className="truncate font-mono text-xs">{l.keyId}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
