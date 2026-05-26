import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { OverviewCards } from './OverviewCards';
import { HeadcountBarChart } from './HeadcountBarChart';
import { ByCountryTable } from './ByCountryTable';
import { useInsightsByCountryQuery, useOverviewQuery } from './hooks';

export const InsightsPage = () => {
  const overview = useOverviewQuery();
  const byCountry = useInsightsByCountryQuery();

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

      <Card>
        <CardHeader>
          <CardTitle>Salary by country</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {byCountry.isError ? (
            <div className="mx-4 mb-4 rounded-md border border-[var(--color-danger)] bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)]">
              {byCountry.error.message}
            </div>
          ) : (
            <ByCountryTable rows={byCountry.data ?? []} isLoading={byCountry.isLoading} />
          )}
        </CardContent>
      </Card>
    </section>
  );
};
