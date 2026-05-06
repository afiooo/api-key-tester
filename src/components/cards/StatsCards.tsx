import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

export interface StatsValues {
  total: number;
  valid: number;
  invalid: number;
  rateLimited: number;
  paid?: number;
}

interface StatsCardsProps {
  values: StatsValues;
  showPaid?: boolean;
}

export function StatsCards({ values, showPaid }: StatsCardsProps) {
  const { t } = useTranslation();

  return (
    <div className={`grid grid-cols-2 ${showPaid ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-3 sm:gap-4`}>
      <StatCell label={t('total')} value={values.total} valueClass="text-info" />
      <StatCell label={t('valid')} value={values.valid} valueClass="text-success" />
      {showPaid && (
        <StatCell label={t('paidKeys')} value={values.paid ?? 0} valueClass="text-primary" />
      )}
      <StatCell label={t('invalid')} value={values.invalid} valueClass="text-error" />
      <StatCell label={t('rateLimited')} value={values.rateLimited} valueClass="text-warning" />
    </div>
  );
}

interface StatCellProps {
  label: string;
  value: number;
  valueClass: string;
}

function StatCell({ label, value, valueClass }: StatCellProps) {
  return (
    <div className="flex flex-col items-stretch justify-center gap-2 h-[100px] rounded-card border border-border bg-card">
      <div className={cn('text-h1 font-bold text-center', valueClass)}>{value}</div>
      <div className="text-body text-fg text-center">{label}</div>
    </div>
  );
}
