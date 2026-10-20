import type { SelectHTMLAttributes } from 'react';
import { FieldWrapper } from './Input';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  options: SelectOption[];
  error?: string;
}

export function Select({ id, label, options, error, className = '', ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} error={error} htmlFor={id}>
      <select
        id={id}
        className={`rounded-md border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none ${
          error ? 'border-status-cancelled' : 'border-line'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
