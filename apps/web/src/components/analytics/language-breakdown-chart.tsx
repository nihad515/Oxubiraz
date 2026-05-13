'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useString } from '@/hooks/use-string';

interface DataPoint {
  language: string;
  sessions: number;
  avg_wpm?: number;
}

interface Props {
  data?: DataPoint[];
  height?: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e'];
const LANG_LABELS: Record<string, string> = { az: 'Azərbaycan', ru: 'Русский', en: 'English' };

export function LanguageBreakdownChart({ data, height = 240 }: Props) {
  const { t } = useString();

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-muted-foreground">{t('analytics.no_data', {}, 'No data available')}</p>
      </div>
    );
  }

  const formatted = data.map(d => ({
    name: LANG_LABELS[d.language] ?? d.language,
    value: d.sessions,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%"
          cy="45%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {formatted.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`${value} ${t('analytics.sessions', {}, 'sessions')}`, '']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
