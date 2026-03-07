'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getVisibleColumns } from '@/lib/tools/statistics/selectors';
import type {
  DynamicStatisticsRow,
  StatisticColumnDefinition,
  StatisticColumnKey,
  StatisticGoal,
  StatisticsSeriesType,
} from '@/lib/tools/statistics/types';

interface StatisticsGridProps {
  seriesType: StatisticsSeriesType;
  selectedGoals: StatisticGoal[];
  rows: DynamicStatisticsRow[];
  onChangeCell: (rowId: string, columnKey: string, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
}

function toNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatComputed(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

function sumColumn(rows: DynamicStatisticsRow[], key: string): number {
  return rows.reduce((sum, row) => sum + (toNumber(row[key]) ?? 0), 0);
}

function getComputedRows(
  seriesType: StatisticsSeriesType,
  rows: DynamicStatisticsRow[]
): Array<Record<string, number | null>> {
  if (seriesType === 'univariate_frequency') {
    const totalNi = sumColumn(rows, 'ni');
    let cumulative = 0;

    return rows.map((row) => {
      const xi = toNumber(row.xi);
      const ni = toNumber(row.ni);

      if (ni !== null) cumulative += ni;

      const niXi = xi !== null && ni !== null ? xi * ni : null;
      const xi2 = xi !== null ? xi * xi : null;
      const niXi2 = xi2 !== null && ni !== null ? xi2 * ni : null;
      const fi = ni !== null && totalNi > 0 ? ni / totalNi : null;
      const ncc = ni !== null ? cumulative : null;
      const ncd = ni !== null ? totalNi - cumulative + ni : null;

      return {
        xi,
        ni,
        fi,
        ncc,
        ncd,
        ni_xi: niXi,
        xi2,
        ni_xi2: niXi2,
      };
    });
  }

  if (seriesType === 'grouped_intervals') {
    const totalNi = sumColumn(rows, 'ni');
    let cumulative = 0;

    return rows.map((row) => {
      const borneInf = toNumber(row.borne_inf);
      const borneSup = toNumber(row.borne_sup);
      const ni = toNumber(row.ni);

      const centre =
        borneInf !== null && borneSup !== null ? (borneInf + borneSup) / 2 : null;

      const amplitude =
        borneInf !== null && borneSup !== null ? borneSup - borneInf : null;

      if (ni !== null) cumulative += ni;

      const fi = ni !== null && totalNi > 0 ? ni / totalNi : null;
      const ncc = ni !== null ? cumulative : null;
      const ncd = ni !== null ? totalNi - cumulative + ni : null;
      const niCentre = ni !== null && centre !== null ? ni * centre : null;
      const centre2 = centre !== null ? centre * centre : null;
      const niCentre2 =
        ni !== null && centre2 !== null ? ni * centre2 : null;

      return {
        borne_inf: borneInf,
        borne_sup: borneSup,
        ni,
        centre,
        amplitude,
        fi,
        ncc,
        ncd,
        ni_centre: niCentre,
        centre2,
        ni_centre2: niCentre2,
      };
    });
  }

  if (seriesType === 'bivariate') {
    return rows.map((row) => {
      const x = toNumber(row.x);
      const y = toNumber(row.y);

      const x2 = x !== null ? x * x : null;
      const y2 = y !== null ? y * y : null;
      const xy = x !== null && y !== null ? x * y : null;

      return {
        x,
        y,
        x2,
        y2,
        xy,
      };
    });
  }

  return rows.map(() => ({}));
}

function getColumnValue(
  row: DynamicStatisticsRow,
  computedRow: Record<string, number | null>,
  column: StatisticColumnDefinition
): string {
  if (column.editable) {
    return row[column.key] ?? '';
  }

  return formatComputed(computedRow[column.key] ?? null);
}

function getTotalsRow(
  seriesType: StatisticsSeriesType,
  columns: StatisticColumnDefinition[],
  rows: DynamicStatisticsRow[],
  computedRows: Array<Record<string, number | null>>
): Record<string, string> {
  const totals: Record<string, string> = {};

  const sumComputed = (key: string) =>
    computedRows.reduce((sum, row) => sum + (row[key] ?? 0), 0);

  columns.forEach((column) => {
    switch (column.key) {
      case 'ni':
        totals[column.key] = formatComputed(sumColumn(rows, 'ni'));
        break;
      case 'fi':
        totals[column.key] = seriesType !== 'bivariate' && rows.length ? '1' : '—';
        break;
      case 'ni_xi':
        totals[column.key] = formatComputed(sumComputed('ni_xi'));
        break;
      case 'ni_xi2':
        totals[column.key] = formatComputed(sumComputed('ni_xi2'));
        break;
      case 'ni_centre':
        totals[column.key] = formatComputed(sumComputed('ni_centre'));
        break;
      case 'ni_centre2':
        totals[column.key] = formatComputed(sumComputed('ni_centre2'));
        break;
      case 'x':
        totals[column.key] = formatComputed(sumColumn(rows, 'x'));
        break;
      case 'y':
        totals[column.key] = formatComputed(sumColumn(rows, 'y'));
        break;
      case 'x2':
        totals[column.key] = formatComputed(sumComputed('x2'));
        break;
      case 'y2':
        totals[column.key] = formatComputed(sumComputed('y2'));
        break;
      case 'xy':
        totals[column.key] = formatComputed(sumComputed('xy'));
        break;
      default:
        totals[column.key] = '—';
        break;
    }
  });

  return totals;
}

export function StatisticsGrid({
  seriesType,
  selectedGoals,
  rows,
  onChangeCell,
  onAddRow,
  onRemoveRow,
}: StatisticsGridProps) {
  const columns = getVisibleColumns(seriesType, selectedGoals);
  const computedRows = getComputedRows(seriesType, rows);
  const totalsRow = getTotalsRow(seriesType, columns, rows, computedRows);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-xl">Tableau statistique adaptatif</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Le tableau s’adapte automatiquement aux calculs demandés.
          </p>
        </div>

        <Button onClick={onAddRow}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une ligne
        </Button>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[72px] px-6">#</TableHead>

                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="min-w-[150px] px-6"
                    title={column.description}
                  >
                    {column.label}
                  </TableHead>
                ))}

                <TableHead className="w-[96px] px-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row, index) => {
                const computedRow = computedRows[index] ?? {};

                return (
                  <TableRow key={row.id}>
                    <TableCell className="px-6 font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    {columns.map((column) => (
                      <TableCell key={column.key} className="px-6">
                        {column.editable ? (
                          <Input
                            inputMode="decimal"
                            placeholder={column.label}
                            value={row[column.key] ?? ''}
                            onChange={(e) =>
                              onChangeCell(row.id, column.key, e.target.value)
                            }
                          />
                        ) : (
                          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                            {getColumnValue(row, computedRow, column)}
                          </div>
                        )}
                      </TableCell>
                    ))}

                    <TableCell className="px-6 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveRow(row.id)}
                        disabled={rows.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              <TableRow>
                <TableCell className="px-6 font-semibold text-foreground">
                  Total
                </TableCell>

                {columns.map((column) => (
                  <TableCell key={column.key} className="px-6 font-semibold">
                    {totalsRow[column.key] ?? '—'}
                  </TableCell>
                ))}

                <TableCell className="px-6" />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {rows.length} ligne{rows.length > 1 ? 's' : ''} dans le tableau
          </p>

          <Button variant="outline" onClick={onAddRow}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter encore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}