import { useSearchParams } from 'react-router-dom';
import { EmployeesTable } from './EmployeesTable';
import { Pagination } from '../../components/ui/Pagination';
import { useEmployeesQuery } from './hooks';

const PAGE_SIZE = 20;

export const EmployeesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const query = useEmployeesQuery({ page, pageSize: PAGE_SIZE });

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(next));
    setSearchParams(params);
  };

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Browse, filter, and manage your organisation's headcount.
          </p>
        </div>
      </header>

      {query.isError && (
        <div className="rounded-md border border-[var(--color-danger)] bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]">
          Failed to load employees. {query.error.message}
        </div>
      )}

      <EmployeesTable rows={query.data?.items ?? []} isLoading={query.isLoading} />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={query.data?.total ?? 0}
        onPageChange={setPage}
      />
    </section>
  );
};
