import { useMemo, useState, type ChangeEvent } from 'react';
import type { CountrySalaryInsight, TitleSalaryInsight } from '@salary/shared';
import { Select } from '../../components/ui/Select';
import { formatCurrency, formatNumber } from '../../lib/format';
import { useInsightsByTitleInCountryQuery } from './hooks';

export interface ByTitleDrilldownProps {
  byCountry: CountrySalaryInsight[];
}

const Empty = ({ children }: { children: string }) => (
  <div className="py-6 text-center text-sm text-[var(--color-muted)]">{children}</div>
);

const TitleRow = ({ row }: { row: TitleSalaryInsight }) => (
  <tr className="border-t border-[var(--color-border)]">
    <td className="px-3 py-2 font-medium">{row.jobTitle}</td>
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
);

export const ByTitleDrilldown = ({ byCountry }: ByTitleDrilldownProps) => {
  const countries = useMemo(
    () => [...new Set(byCountry.map((row) => row.country))].sort(),
    [byCountry],
  );
  const [country, setCountry] = useState<string>('');

  const query = useInsightsByTitleInCountryQuery(country);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => setCountry(e.target.value);

  const rows = query.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="w-56">
          <label htmlFor="drilldown-country" className="mb-1 block text-sm font-medium">
            Country
          </label>
          <Select
            id="drilldown-country"
            value={country}
            onChange={handleChange}
            disabled={countries.length === 0}
          >
            <option value="">Select a country…</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        {country && !query.isLoading && rows.length > 0 && (
          <p className="text-xs text-[var(--color-muted)]">
            {rows.length} title{rows.length === 1 ? '' : 's'} in {country}.
          </p>
        )}
      </div>

      {country === '' ? (
        <Empty>Pick a country to see salary aggregates per job title.</Empty>
      ) : query.isError ? (
        <div className="mx-1 rounded-md border border-[var(--color-danger)] bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)]">
          {query.error.message}
        </div>
      ) : query.isLoading ? (
        <Empty>Loading…</Empty>
      ) : rows.length === 0 ? (
        <Empty>No employees in this country yet.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Job title</th>
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
                <TitleRow key={`${row.jobTitle}-${row.currency}`} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
