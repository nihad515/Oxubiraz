'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useString } from '@/hooks/use-string';

interface DataPoint {
  date: string;
  sessions?: number;
  [key: string]: any;
}

interface Props {
  data?: DataPoint[];
  color?: string;
  height?: number;
}

export function DailyActivityChart({ data, color = '#8b5cf6', height = 240 }: Props) {
  const { t } = useString();

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-muted-foreground">{t('analytics.no_data', {}, 'No data available')}</p>
      </div>
    );
  }

  const formatted = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar
          dataKey="sessions"
          fill={color}
          radius={[4, 4, 0, 0]}
          name={t('analytics.sessions', {}, 'Sessions')}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
