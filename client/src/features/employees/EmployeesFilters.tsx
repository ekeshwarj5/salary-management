import type { ChangeEvent } from 'react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

export interface FilterValues {
  search: string;
  country: string;
  jobTitle: string;
}

export interface EmployeesFiltersProps {
  values: FilterValues;
  onChange: (updates: Partial<FilterValues>) => void;
  onReset: () => void;
  options: { countries: string[]; jobTitles: string[] };
  isLoadingOptions: boolean;
}

export const EmployeesFilters = ({
  values,
  onChange,
  onReset,
  options,
  isLoadingOptions,
}: EmployeesFiltersProps) => {
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ search: e.target.value });
  const handleCountry = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange({ country: e.target.value });
  const handleJobTitle = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange({ jobTitle: e.target.value });

  const hasAnyFilter = values.search !== '' || values.country !== '' || values.jobTitle !== '';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[14rem] flex-1">
        <Input
          type="search"
          aria-label="Search by name"
          placeholder="Search by name…"
          value={values.search}
          onChange={handleSearch}
        />
      </div>
      <Select
        aria-label="Filter by country"
        value={values.country}
        onChange={handleCountry}
        disabled={isLoadingOptions}
        className="w-44"
      >
        <option value="">All countries</option>
        {options.countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Filter by job title"
        value={values.jobTitle}
        onChange={handleJobTitle}
        disabled={isLoadingOptions}
        className="w-56"
      >
        <option value="">All job titles</option>
        {options.jobTitles.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
      <Button variant="ghost" size="sm" onClick={onReset} disabled={!hasAnyFilter}>
        Clear
      </Button>
    </div>
  );
};
