import type { OverviewInsight } from '@salary/shared';
import { Card, CardHeader, CardTitle, CardValue, CardContent } from '../../components/ui/Card';
import { formatNumber } from '../../lib/format';

export interface OverviewCardsProps {
  data: OverviewInsight | undefined;
  isLoading: boolean;
}

const Skeleton = () => (
  <span className="inline-block h-7 w-20 animate-pulse rounded bg-slate-200" />
);

export const OverviewCards = ({ data, isLoading }: OverviewCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total employees</CardTitle>
          <CardValue>{isLoading ? <Skeleton /> : formatNumber(data?.totalCount ?? 0)}</CardValue>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[var(--color-muted)]">Across all countries and titles.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Countries</CardTitle>
          <CardValue>
            {isLoading ? <Skeleton /> : formatNumber(data?.countriesRepresented ?? 0)}
          </CardValue>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[var(--color-muted)]">
            Distinct ISO codes in the directory.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Job titles</CardTitle>
          <CardValue>
            {isLoading ? <Skeleton /> : formatNumber(data?.jobTitlesRepresented ?? 0)}
          </CardValue>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[var(--color-muted)]">Distinct roles currently filled.</p>
        </CardContent>
      </Card>
    </div>
  );
};
