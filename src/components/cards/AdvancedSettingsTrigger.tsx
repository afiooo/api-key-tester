import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface AdvancedSettingsTriggerProps {
  onClick: () => void;
}

export function AdvancedSettingsTrigger({ onClick }: AdvancedSettingsTriggerProps) {
  const { t } = useTranslation();

  return (
    <Button
      variant="secondary"
      size="md"
      onClick={onClick}
      block
      iconLeft={<Settings size={20} strokeWidth={2} />}
    >
      {t('advancedSettings')}
    </Button>
  );
}
