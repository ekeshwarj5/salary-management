import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Employee } from '@salary/shared';
import { EmployeesTable } from './EmployeesTable';
import { EmployeesFilters, type FilterValues } from './EmployeesFilters';
import { EmployeeFormDialog } from './EmployeeFormDialog';
import { EmployeeDeleteDialog } from './EmployeeDeleteDialog';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { useEmployeeFilterMetaQuery, useEmployeesQuery } from './hooks';

const PAGE_SIZE = 20;
const EMPTY_META = { countries: [], jobTitles: [] };

export const EmployeesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  const filters: FilterValues = {
    search: searchParams.get('search') ?? '',
    country: searchParams.get('country') ?? '',
    jobTitle: searchParams.get('jobTitle') ?? '',
  };
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const meta = useEmployeeFilterMetaQuery();
  const list = useEmployeesQuery({
    page,
    pageSize: PAGE_SIZE,
    ...(filters.search && { search: filters.search }),
    ...(filters.country && { country: filters.country }),
    ...(filters.jobTitle && { jobTitle: filters.jobTitle }),
  });

  const updateParams = (mutator: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    mutator(next);
    setSearchParams(next, { replace: true });
  };

  const setFilters = (updates: Partial<FilterValues>) => {
    updateParams((p) => {
      for (const [key, value] of Object.entries(updates)) {
        if (value) p.set(key, value);
        else p.delete(key);
      }
      p.delete('page'); // filter changes always reset pagination
    });
  };

  const resetFilters = () =>
    updateParams((p) => {
      p.delete('search');
      p.delete('country');
      p.delete('jobTitle');
      p.delete('page');
    });

  const setPage = (next: number) =>
    updateParams((p) => {
      p.set('page', String(next));
    });

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Browse, filter, and manage your organisation's headcount.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>+ Add employee</Button>
      </header>

      <EmployeeFormDialog
        open={isAddOpen}
        onClose={() => setAddOpen(false)}
        initialValue={null}
      />
      <EmployeeFormDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        initialValue={editing}
      />
      <EmployeeDeleteDialog employee={deleting} onClose={() => setDeleting(null)} />

      <EmployeesFilters
        values={filters}
        onChange={setFilters}
        onReset={resetFilters}
        options={meta.data ?? EMPTY_META}
        isLoadingOptions={meta.isLoading}
      />

      {list.isError && (
        <div className="rounded-md border border-[var(--color-danger)] bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]">
          Failed to load employees. {list.error.message}
        </div>
      )}

      <EmployeesTable
        rows={list.data?.items ?? []}
        isLoading={list.isLoading}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={list.data?.total ?? 0}
        onPageChange={setPage}
      />
    </section>
  );
};
