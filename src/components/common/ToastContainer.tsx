import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastListener = (toast: Toast) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: string, duration = 3000) =>
    emit({ id: crypto.randomUUID(), type: 'success', message, duration }),
  error: (message: string, duration = 4000) =>
    emit({ id: crypto.randomUUID(), type: 'error', message, duration }),
  info: (message: string, duration = 3000) =>
    emit({ id: crypto.randomUUID(), type: 'info', message, duration }),
  warning: (message: string, duration = 3500) =>
    emit({ id: crypto.randomUUID(), type: 'warning', message, duration }),
};

function emit(t: Toast) {
  listeners.forEach((l) => l(t));
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'border-green-200 bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-100',
  error: 'border-red-200 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-100',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler: ToastListener = (t) => {
      setToasts((prev) => [...prev, t]);
      if (t.duration) {
        setTimeout(() => remove(t.id), t.duration);
      }
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [remove]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = iconMap[t.type];
        return (
          <div
            key={t.id}
            role="alert"
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-coffee animate-slide-in-right dark:border-coffee-700',
              colorMap[t.type],
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              aria-label="Dismiss"
              onClick={() => remove(t.id)}
              className="rounded p-1 hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
