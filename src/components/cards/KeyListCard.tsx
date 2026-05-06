import { FileText, Clipboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';

interface KeyListCardProps {
  value: string;
  onChange: (v: string) => void;
  onUpload?: () => void;
  onCopy?: () => void;
}

const iconButtonClass =
  'shrink-0 inline-flex items-center justify-center w-7 h-7 rounded border border-border bg-surface text-fg-muted hover:text-fg hover:bg-hover cursor-pointer transition-colors';

export function KeyListCard({ value, onChange, onUpload, onCopy }: KeyListCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between py-2">
          <h2 className="text-h2 font-bold text-fg">
            {t('apiKeys')}
          </h2>
          <button
            type="button"
            onClick={onUpload}
            aria-label={t('importFile')}
            className={iconButtonClass}
          >
            <FileText size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="relative rounded-card border border-border bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            placeholder={t('apiKeysPlaceholder')}
            className="block w-full px-3 py-2 pr-10 bg-transparent border-0 outline-none resize-none text-body text-fg placeholder:text-fg-subtle font-mono leading-5 rounded-card"
          />
          <button
            type="button"
            onClick={onCopy}
            aria-label={t('copyAll')}
            className="absolute top-2 right-3 inline-flex items-center justify-center text-fg-muted hover:text-fg cursor-pointer transition-colors"
          >
            <Clipboard size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </Card>
  );
}
