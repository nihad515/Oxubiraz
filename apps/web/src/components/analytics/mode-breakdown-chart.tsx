'use client';

import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useString } from '@/hooks/use-string';

interface DataPoint {
  mode: string;
  sessions: number;
  avg_wpm?: number;
}

interface Props {
  data?: DataPoint[];
  height?: number;
}

const MODE_LABELS: Record<string, string> = {
  random_words: 'Random',
  text_reading: 'Text',
  sentence_reading: 'Sentence',
  memory: 'Memory',
  ai: 'AI',
};

const MODE_COLORS: Record<string, string> = {
  random_words: '#3b82f6',
  text_reading: '#8b5cf6',
  sentence_reading: '#22c55e',
  memory: '#f59e0b',
  ai: '#ef4444',
};

export function ModeBreakdownChart({ data, height = 240 }: Props) {
  const { t } = useString();

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-muted-foreground">{t('analytics.no_data', {}, 'No data available')}</p>
      </div>
    );
  }

  const formatted = data.map(d => ({
    name: MODE_LABELS[d.mode] ?? d.mode,
    sessions: d.sessions,
    avg_wpm: Math.round(d.avg_wpm ?? 0),
    fill: MODE_COLORS[d.mode] ?? '#6b7280',
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="name"
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
        />
        <Bar dataKey="sessions" name={t('analytics.sessions', {}, 'Sessions')} radius={[4, 4, 0, 0]}>
          {formatted.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
