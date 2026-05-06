import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visually style the confirm button as destructive. Default: false */
  danger?: boolean;
  className?: string;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  className,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onCancel} title={title} className={className}>
      <div className="flex flex-col gap-6">
        {message && <p className="text-body text-fg leading-relaxed">{message}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel ?? t('cancel')}
          </Button>
          <Button
            variant={danger ? 'ghost' : 'primary'}
            className={danger ? '!text-error hover:!bg-error-soft' : undefined}
            onClick={onConfirm}
          >
            {confirmLabel ?? (danger ? t('modal.deleteConfig') : t('confirm'))}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
