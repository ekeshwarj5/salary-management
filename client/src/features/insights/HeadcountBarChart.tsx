import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface HeadcountBarChartProps<K extends string> {
  data: Array<Record<K, string> & { count: number }>;
  xKey: K;
  ariaLabel: string;
}

export const HeadcountBarChart = <K extends string>({
  data,
  xKey,
  ariaLabel,
}: HeadcountBarChartProps<K>) => {
  return (
    <div aria-label={ariaLabel} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 16, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: 'oklch(50% 0.015 248)', fontSize: 12 }}
            interval={0}
            angle={data.length > 6 ? -25 : 0}
            textAnchor={data.length > 6 ? 'end' : 'middle'}
            height={data.length > 6 ? 60 : 30}
          />
          <YAxis
            tick={{ fill: 'oklch(50% 0.015 248)', fontSize: 12 }}
            allowDecimals={false}
            width={48}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            contentStyle={{
              borderRadius: 6,
              border: '1px solid oklch(91% 0.005 247)',
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" fill="oklch(56% 0.18 264)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
