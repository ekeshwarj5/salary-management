import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight wrapper around the native <dialog> element. Focus trap,
 * Esc-to-close, and inert background are handled by the browser; we
 * only sync open/close to the DOM and surface a close callback.
 */
export const Dialog = ({ open, onClose, title, description, children, className }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={cn(
        'w-full max-w-lg rounded-lg bg-[var(--color-surface)] p-0 shadow-xl backdrop:bg-black/40',
        className,
      )}
    >
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
        )}
      </header>
      <div className="px-6 py-4">{children}</div>
    </dialog>
  );
};
