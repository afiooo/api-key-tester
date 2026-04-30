import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';

const STORAGE_KEY = 'api-key-tester-hide-paid-prompt';

interface PaidDetectionPromptProps {
  open: boolean;
  onConfirm: (dontShowAgain: boolean) => void;
  onCancel: () => void;
}

export function PaidDetectionPrompt({
  open,
  onConfirm,
  onCancel,
}: PaidDetectionPromptProps) {
  const { t } = useTranslation();
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    setDontShow(false);
  }, [open]);

  return (
    <Modal open={open} onClose={onCancel} title={t('paidDetectionDialog.title')}>
      <div className="flex flex-col gap-5">
        <p className="text-body text-fg leading-5">
          {t('paidDetectionDialog.description')}
        </p>
        <div className="rounded-card border border-warning bg-warning-soft p-3">
          <p className="text-body text-warning">{t('paidDetectionDialog.warning')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Toggle
            checked={dontShow}
            onChange={setDontShow}
            label={t('paidDetectionDialog.dontShowAgain')}
          />
          <span className="text-body text-fg-muted">
            {t('paidDetectionDialog.dontShowAgain')}
          </span>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel}>
            {t('paidDetectionDialog.cancelButton')}
          </Button>
          <Button variant="primary" onClick={() => onConfirm(dontShow)}>
            {t('paidDetectionDialog.confirmButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Check if the paid detection prompt should be shown */
export function shouldShowPaidPrompt(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== 'true';
}

/** Persist the "don't show again" preference */
export function hidePaidPrompt(): void {
  localStorage.setItem(STORAGE_KEY, 'true');
}

/** Reset the prompt preference (for advanced settings) */
export function resetPaidPrompt(): void {
  localStorage.removeItem(STORAGE_KEY);
}
