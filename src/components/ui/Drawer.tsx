import { useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

const positionClasses = {
  left: 'inset-y-0 left-0',
  right: 'inset-y-0 right-0',
};

const sizeClasses = {
  sm: 'max-w-sm w-80',
  md: 'max-w-md w-96',
  lg: 'max-w-lg w-[28rem]',
  xl: 'max-w-xl w-[36rem]',
};

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  closeOnBackdrop = true,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: position === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: position === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
            className={cn(
              'fixed h-full bg-white shadow-xl dark:bg-zinc-800',
              positionClasses[position],
              sizeClasses[size]
            )}
          >
            <div className="flex h-full flex-col">
              {(title || isOpen) && (
                <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-700">
                  {title && (
                    <h2
                      id="drawer-title"
                      className="text-lg font-semibold text-stone-900 dark:text-stone-100"
                    >
                      {title}
                    </h2>
                  )}
                  <button
                    onClick={onClose}
                    className="ml-auto rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-zinc-700 dark:hover:text-stone-200"
                    aria-label="Close drawer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
}
