/**
 * Locale-aware salary formatter. Falls back gracefully when the runtime
 * doesn't know a currency (some currencies are missing in older ICU).
 */
export const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
};

export const formatNumber = (value: number): string => value.toLocaleString();

/**
 * Render a YYYY-MM-DD date string in the user's locale. Anchored to UTC
 * so the displayed day matches the stored value regardless of timezone.
 */
export const formatDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};
