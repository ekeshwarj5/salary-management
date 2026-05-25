import clsx, { type ClassValue } from 'clsx';

/**
 * Tiny wrapper around `clsx` so component code reads `cn(...)` instead
 * of `clsx(...)`. If we ever adopt tailwind-merge for de-duplicating
 * conflicting Tailwind classes, this is the one place to update.
 */
export const cn = (...inputs: ClassValue[]): string => clsx(inputs);
