import type { CountrySalaryInsight } from '@salary/shared';
import { formatCurrency, formatNumber } from '../../lib/format';

export interface ByCountryTableProps {
  rows: CountrySalaryInsight[];
  isLoading: boolean;
}

export const ByCountryTable = ({ rows, isLoading }: ByCountryTableProps) => {
  if (rows.length === 0 && !isLoading) {
    return (
      <div className="py-6 text-center text-sm text-[var(--color-muted)]">
        No employees to aggregate yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
          <tr>
            <th className="px-3 py-2 font-medium">Country</th>
            <th className="px-3 py-2 font-medium">Currency</th>
            <th className="px-3 py-2 text-right font-medium">Headcount</th>
            <th className="px-3 py-2 text-right font-medium">Min</th>
            <th className="px-3 py-2 text-right font-medium">Median</th>
            <th className="px-3 py-2 text-right font-medium">Average</th>
            <th className="px-3 py-2 text-right font-medium">Max</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.country}-${row.currency}`}
              className="border-t border-[var(--color-border)]"
            >
              <td className="px-3 py-2 font-medium">{row.country}</td>
              <td className="px-3 py-2 text-[var(--color-muted)]">{row.currency}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatNumber(row.count)}</td>
              <td className="px-3 py-2 text-right tabular-nums">
                {formatCurrency(row.minSalary, row.currency)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium">
                {formatCurrency(row.medianSalary, row.currency)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {formatCurrency(row.avgSalary, row.currency)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {formatCurrency(row.maxSalary, row.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 px-3 text-xs text-[var(--color-muted)]">
        Median is highlighted because salary distributions are right-skewed; mean alone can
        mislead.
      </p>
    </div>
  );
};
