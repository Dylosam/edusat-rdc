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

import { formatNumber } from '@/lib/tools/statistics/utils';

export interface StatisticSheetRow {
  id: string;
  xi: string;
  ni: string;
}

export interface StatisticSheetComputedRow {
  id: string;
  xi: number | null;
  ni: number | null;
  fi: number | null;
  cumulativeNi: number | null;
  cumulativeFi: number | null;
}

interface StatisticsSheetProps {
  rows: StatisticSheetRow[];
  onChangeCell: (
    rowId: string,
    field: keyof Pick<StatisticSheetRow, 'xi' | 'ni'>,
    value: string
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
}

function parseSheetRows(rows: StatisticSheetRow[]): StatisticSheetComputedRow[] {
  const parsedBase = rows.map((row) => {
    const xi = row.xi.trim() === '' ? null : Number(row.xi);
    const ni = row.ni.trim() === '' ? null : Number(row.ni);

    return {
      id: row.id,
      xi: Number.isFinite(xi) ? xi : null,
      ni: Number.isFinite(ni) && (ni ?? 0) >= 0 ? ni : null,
      fi: null,
      cumulativeNi: null,
      cumulativeFi: null,
    };
  });

  const totalNi = parsedBase.reduce((sum, row) => sum + (row.ni ?? 0), 0);

  let cumulativeNi = 0;

  return parsedBase.map((row) => {
    const ni = row.ni ?? null;

    if (ni !== null) {
      cumulativeNi += ni;
    }

    const fi =
      ni !== null && totalNi > 0 ? Number((ni / totalNi).toFixed(4)) : null;

    const cumulativeFi =
      ni !== null && totalNi > 0
        ? Number((cumulativeNi / totalNi).toFixed(4))
        : null;

    return {
      ...row,
      fi,
      cumulativeNi: ni !== null ? cumulativeNi : null,
      cumulativeFi,
    };
  });
}

export function StatisticsSheet({
  rows,
  onChangeCell,
  onAddRow,
  onRemoveRow,
}: StatisticsSheetProps) {
  const computedRows = parseSheetRows(rows);
  const totalNi = computedRows.reduce((sum, row) => sum + (row.ni ?? 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-xl">Tableau statistique</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Saisissez les valeurs Xi et les effectifs ni. Les fréquences et cumuls
            sont calculés automatiquement.
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
                <TableHead className="w-[70px] px-6">#</TableHead>
                <TableHead className="min-w-[180px] px-6">Xi</TableHead>
                <TableHead className="min-w-[180px] px-6">ni</TableHead>
                <TableHead className="min-w-[140px] px-6">fi</TableHead>
                <TableHead className="min-w-[150px] px-6">Ni</TableHead>
                <TableHead className="min-w-[150px] px-6">Fi</TableHead>
                <TableHead className="w-[100px] px-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row, index) => {
                const computed = computedRows[index];

                return (
                  <TableRow key={row.id}>
                    <TableCell className="px-6 font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="px-6">
                      <Input
                        inputMode="decimal"
                        placeholder="Ex. 12"
                        value={row.xi}
                        onChange={(e) => onChangeCell(row.id, 'xi', e.target.value)}
                      />
                    </TableCell>

                    <TableCell className="px-6">
                      <Input
                        inputMode="numeric"
                        placeholder="Ex. 3"
                        value={row.ni}
                        onChange={(e) => onChangeCell(row.id, 'ni', e.target.value)}
                      />
                    </TableCell>

                    <TableCell className="px-6">
                      <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        {formatNumber(computed?.fi)}
                      </div>
                    </TableCell>

                    <TableCell className="px-6">
                      <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        {formatNumber(computed?.cumulativeNi)}
                      </div>
                    </TableCell>

                    <TableCell className="px-6">
                      <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        {formatNumber(computed?.cumulativeFi)}
                      </div>
                    </TableCell>

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
                <TableCell className="px-6 font-semibold" colSpan={2}>
                  Total
                </TableCell>
                <TableCell className="px-6 font-semibold">
                  {formatNumber(totalNi)}
                </TableCell>
                <TableCell className="px-6 font-semibold">
                  {totalNi > 0 ? '1' : '—'}
                </TableCell>
                <TableCell className="px-6 font-semibold">
                  {formatNumber(totalNi)}
                </TableCell>
                <TableCell className="px-6 font-semibold">
                  {totalNi > 0 ? '1' : '—'}
                </TableCell>
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