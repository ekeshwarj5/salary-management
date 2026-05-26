import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { OverviewCards } from './OverviewCards';
import { HeadcountBarChart } from './HeadcountBarChart';
import { useOverviewQuery } from './hooks';

export const InsightsPage = () => {
  const overview = useOverviewQuery();

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Insights</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Headcount and salary aggregates for the organisation.
        </p>
      </header>

      {overview.isError && (
        <div className="rounded-md border border-[var(--color-danger)] bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]">
          Failed to load overview. {overview.error.message}
        </div>
      )}

      <OverviewCards data={overview.data} isLoading={overview.isLoading} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top countries by headcount</CardTitle>
          </CardHeader>
          <CardContent>
            <HeadcountBarChart
              data={overview.data?.topCountriesByHeadcount ?? []}
              xKey="country"
              ariaLabel="Top countries by headcount"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top job titles by headcount</CardTitle>
          </CardHeader>
          <CardContent>
            <HeadcountBarChart
              data={overview.data?.topJobTitlesByHeadcount ?? []}
              xKey="jobTitle"
              ariaLabel="Top job titles by headcount"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
