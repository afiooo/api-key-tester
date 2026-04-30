import { Play, RefreshCw, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface ActionButtonsProps {
  isTesting?: boolean;
  onStart?: () => void;
  onDedupe?: () => void;
  onClear?: () => void;
}

export function ActionButtons({ isTesting, onStart, onDedupe, onClear }: ActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3 md:gap-4">
      <Button
        variant={isTesting ? 'danger' : 'primary'}
        size="lg"
        onClick={onStart}
        iconLeft={
          isTesting ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <Play size={20} strokeWidth={2} />
          )
        }
        className="flex-1 min-w-[160px]"
      >
        {isTesting ? t('cancelTest') : t('startTest')}
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={onDedupe}
        disabled={isTesting}
        iconLeft={<RefreshCw size={20} strokeWidth={2} />}
        className="flex-1 min-w-[160px]"
      >
        {t('dedupeKeys')}
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={onClear}
        disabled={isTesting}
        iconLeft={<Trash size={20} strokeWidth={2} />}
        className="flex-1 min-w-[160px]"
      >
        {t('clear')}
      </Button>
    </div>
  );
}
