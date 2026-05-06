import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

export interface ProgressValues {
  testing: number;
  retrying: number;
}

interface ProgressCardsProps {
  values: ProgressValues;
}

export function ProgressCards({ values }: ProgressCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <ProgressCell
        label={t('testingLabel')}
        value={values.testing}
        valueClass="text-progress-test"
      />
      <ProgressCell
        label={t('retrying')}
        value={values.retrying}
        valueClass="text-progress-retry"
      />
    </div>
  );
}

interface CellProps {
  label: string;
  value: number;
  valueClass: string;
}

function ProgressCell({ label, value, valueClass }: CellProps) {
  return (
    <div className="flex flex-col items-stretch justify-center gap-2 h-[100px] rounded-card border border-border bg-card">
      <div className={cn('text-h1 font-bold text-center', valueClass)}>{value}</div>
      <div className="text-body text-fg text-center">{label}</div>
    </div>
  );
}
