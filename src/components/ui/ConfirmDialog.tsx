import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'danger' | 'warning' | 'default';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
}

const variantConfig: Record<
  ConfirmVariant,
  { confirmClass: string; iconBg: string }
> = {
  danger: {
    confirmClass: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
  },
  warning: {
    confirmClass: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  default: {
    confirmClass: 'bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700',
    iconBg: 'bg-stone-100 dark:bg-zinc-800',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className={cn('mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full', config.iconBg)}>
          <svg
            className={cn(
              'h-6 w-6',
              variant === 'danger' && 'text-red-600 dark:text-red-400',
              variant === 'warning' && 'text-amber-600 dark:text-amber-400',
              variant === 'default' && 'text-stone-600 dark:text-stone-400'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
        {description && (
          <p className="mb-6 text-sm text-stone-500 dark:text-stone-400">{description}</p>
        )}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            className={config.confirmClass}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
