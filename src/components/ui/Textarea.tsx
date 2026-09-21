import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          className={`
            w-full rounded-lg border bg-white dark:bg-zinc-800
            text-stone-800 dark:text-stone-100
            placeholder:text-stone-400 dark:placeholder:text-stone-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
            disabled:bg-stone-100 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed
            ${error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-stone-200 dark:border-zinc-700'
            }
            px-4 py-2.5 min-h-[100px] resize-y
          `}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
