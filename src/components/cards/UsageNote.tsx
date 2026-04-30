import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';

export function UsageNote() {
  const { t } = useTranslation();

  return (
    <Card tone="info">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Info size={20} strokeWidth={2} className="text-primary-strong" />
          <h2 className="text-h2 font-bold text-primary-strong">{t('usageTitle')}</h2>
        </div>
        <ul className="text-body text-primary leading-5 space-y-0.5">
          <li>{t('usage1')}</li>
          <li>{t('usage2')}</li>
        </ul>
      </div>
    </Card>
  );
}
