import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import type { StageStatus } from '@/data/devops';

const statusConfig: Record<
  StageStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  success: {
    label: 'Thành công',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  failed: {
    label: 'Thất bại',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  running: {
    label: 'Đang chạy',
    icon: Loader2,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  pending: {
    label: 'Chờ',
    icon: Clock,
    className: 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-stone-400',
  },
};

export function StatusBadge({ status }: { status: StageStatus }) {
  const { label, icon: Icon, className } = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${status === 'running' ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );
}

export function StatusDot({ status }: { status: StageStatus }) {
  const color =
    status === 'success'
      ? 'bg-green-500'
      : status === 'failed'
        ? 'bg-red-500'
        : status === 'running'
          ? 'bg-blue-500'
          : 'bg-stone-400';

  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}
