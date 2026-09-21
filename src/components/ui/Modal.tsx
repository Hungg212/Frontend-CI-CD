import React, { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscape]);

  // Focus trap
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            tabIndex={-1}
            onKeyDown={handleTabKey}
            className={cn(
              'relative w-full rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800',
              sizeClasses[size]
            )}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-zinc-700 dark:hover:text-stone-200"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {title && (
              <h2
                id="modal-title"
                className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="modal-description"
                className="mb-4 text-sm text-stone-500 dark:text-stone-400"
              >
                {description}
              </p>
            )}
            <div className="max-h-[60vh] overflow-y-auto">{children}</div>
            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
