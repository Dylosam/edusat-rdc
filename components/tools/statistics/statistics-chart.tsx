'use client';

import { useMemo } from 'react';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterChart as ScatterIcon,
} from 'lucide-react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type {
  DynamicStatisticsRow,
  StatisticChartType,
  StatisticsSeriesType,
} from '@/lib/tools/statistics/types';

interface StatisticsChartProps {
  rows: DynamicStatisticsRow[];
  chartType: StatisticChartType;
  seriesType: StatisticsSeriesType;
}

interface ChartRow {
  x: number;
  y: number;
  label?: string;
}

function toNumber(value: string | undefined): number | null {
  if (!value) return null;

  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseUnivariateRows(rows: DynamicStatisticsRow[]): ChartRow[] {
  return rows
    .map((row) => {
      const xi = toNumber(row.xi);
      const ni = toNumber(row.ni);

      if (xi === null || ni === null) return null;

      return {
        x: xi,
        y: ni,
        label: String(xi),
      };
    })
    .filter(Boolean) as ChartRow[];
}

function parseGroupedRows(rows: DynamicStatisticsRow[]): ChartRow[] {
  return rows
    .map((row) => {
      const inf = toNumber(row.borne_inf);
      const sup = toNumber(row.borne_sup);
      const ni = toNumber(row.ni);

      if (inf === null || sup === null || ni === null) return null;

      const centre = (inf + sup) / 2;

      return {
        x: centre,
        y: ni,
        label: `${inf}-${sup}`,
      };
    })
    .filter(Boolean) as ChartRow[];
}

function parseBivariateRows(rows: DynamicStatisticsRow[]): ChartRow[] {
  return rows
    .map((row) => {
      const x = toNumber(row.x);
      const y = toNumber(row.y);

      if (x === null || y === null) return null;

      return { x, y };
    })
    .filter(Boolean) as ChartRow[];
}

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const BAR_FILL = 'hsl(var(--chart-1))';
const BAR_STROKE = 'hsl(var(--primary))';
const HISTOGRAM_FILL = 'hsl(var(--chart-2))';
const HISTOGRAM_STROKE = 'hsl(var(--chart-2))';
const LINE_STROKE = 'hsl(var(--chart-1))';
const SCATTER_FILL = 'hsl(var(--chart-1))';

const GRID_STROKE = 'hsl(var(--border))';
const AXIS_STROKE = 'hsl(var(--muted-foreground))';
const TICK_FILL = 'hsl(var(--muted-foreground))';

const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '12px',
  color: 'hsl(var(--foreground))',
};

export function StatisticsChart({
  rows,
  chartType,
  seriesType,
}: StatisticsChartProps) {
  const data = useMemo(() => {
    if (seriesType === 'bivariate') return parseBivariateRows(rows);
    if (seriesType === 'grouped_intervals') return parseGroupedRows(rows);
    return parseUnivariateRows(rows);
  }, [rows, seriesType]);

  const icon =
    chartType === 'bar' ? (
      <BarChart3 className="h-4 w-4 text-muted-foreground" />
    ) : chartType === 'line' ? (
      <LineChartIcon className="h-4 w-4 text-muted-foreground" />
    ) : chartType === 'pie' ? (
      <PieChartIcon className="h-4 w-4 text-muted-foreground" />
    ) : chartType === 'scatter' ? (
      <ScatterIcon className="h-4 w-4 text-muted-foreground" />
    ) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-xl">Graphique</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualisation des données statistiques.
          </p>
        </div>

        {icon}
      </CardHeader>

      <CardContent>
        {chartType === 'none' ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Sélectionnez un type de graphique.
          </div>
        ) : !data.length ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Ajoutez des données pour générer un graphique.
          </div>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={data}>
                  <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <YAxis
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: 'hsl(var(--muted) / 0.25)' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="y"
                    name="Effectif"
                    radius={[8, 8, 0, 0]}
                    fill={BAR_FILL}
                    stroke={BAR_STROKE}
                    strokeWidth={1.5}
                  />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={data}>
                  <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <YAxis
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="y"
                    name="Effectif"
                    stroke={LINE_STROKE}
                    strokeWidth={3}
                    dot={{ r: 4, fill: LINE_STROKE }}
                    activeDot={{ r: 6, fill: LINE_STROKE }}
                  />
                </LineChart>
              ) : chartType === 'pie' ? (
                <PieChart>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Pie
                    data={data}
                    dataKey="y"
                    nameKey="label"
                    outerRadius={120}
                    label
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              ) : chartType === 'histogram' ? (
                <BarChart data={data}>
                  <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <YAxis
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: 'hsl(var(--muted) / 0.25)' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="y"
                    name="Classe"
                    fill={HISTOGRAM_FILL}
                    stroke={HISTOGRAM_STROKE}
                    strokeWidth={1.5}
                  />
                </BarChart>
              ) : chartType === 'scatter' ? (
                <ScatterChart>
                  <CartesianGrid stroke={GRID_STROKE} />
                  <XAxis
                    dataKey="x"
                    name="X"
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <YAxis
                    dataKey="y"
                    name="Y"
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Scatter data={data} fill={SCATTER_FILL} />
                </ScatterChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <YAxis
                    stroke={AXIS_STROKE}
                    tick={{ fill: TICK_FILL }}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar
                    dataKey="y"
                    fill={BAR_FILL}
                    stroke={BAR_STROKE}
                    strokeWidth={1.5}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}