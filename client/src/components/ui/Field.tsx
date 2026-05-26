import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Labelled form field with optional hint and error message. Pair the
 * input's id with htmlFor so click-on-label focuses the control and
 * screen readers announce the relationship.
 */
export const Field = ({ label, htmlFor, error, hint, className, children }: FieldProps) => {
  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--color-muted)]">{hint}</p>
      ) : null}
    </div>
  );
};
