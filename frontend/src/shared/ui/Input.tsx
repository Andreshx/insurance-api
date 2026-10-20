import type { InputHTMLAttributes } from 'react';

interface FieldWrapperProps {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, error, htmlFor, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-status-cancelled">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function Input({ id, label, error, className = '', ...props }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} htmlFor={id}>
      <input
        id={id}
        className={`rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none ${
          error ? 'border-status-cancelled' : 'border-line'
        } ${className}`}
        {...props}
      />
    </FieldWrapper>
  );
}
