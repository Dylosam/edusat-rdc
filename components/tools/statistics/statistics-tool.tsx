'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Sigma, Sparkles, Table2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatisticsChart } from '@/components/tools/statistics/statistics-chart';
import { StatisticsEmptyState } from '@/components/tools/statistics/statistics-empty-state';
import { StatisticsGrid } from '@/components/tools/statistics/statistics-grid';
import { StatisticsResults } from '@/components/tools/statistics/statistics-results';
import { StatisticsSummary } from '@/components/tools/statistics/statistics-summary';
import { StatisticsToolbar } from '@/components/tools/statistics/statistics-toolbar';

import {
  DEFAULT_GOALS_BY_SERIES,
  STATISTICS_SERIES_TYPES,
} from '@/lib/tools/statistics/constants';
import { getVisibleColumns } from '@/lib/tools/statistics/selectors';
import type {
  DynamicStatisticsRow,
  StatisticChartType,
  StatisticGoal,
  StatisticsSeriesType,
  StatisticRow,
} from '@/lib/tools/statistics/types';

function createDynamicRow(seriesType: StatisticsSeriesType): DynamicStatisticsRow {
  const id = crypto.randomUUID();

  switch (seriesType) {
    case 'grouped_intervals':
      return {
        id,
        borne_inf: '',
        borne_sup: '',
        ni: '',
      };

    case 'bivariate':
      return {
        id,
        x: '',
        y: '',
      };

    case 'univariate_frequency':
    default:
      return {
        id,
        xi: '',
        ni: '',
      };
  }
}

function buildInitialRows(seriesType: StatisticsSeriesType): DynamicStatisticsRow[] {
  return [
    createDynamicRow(seriesType),
    createDynamicRow(seriesType),
    createDynamicRow(seriesType),
    createDynamicRow(seriesType),
  ];
}

function convertDynamicRowsToStatisticRows(
  rows: DynamicStatisticsRow[],
  seriesType: StatisticsSeriesType
): StatisticRow[] {
  if (seriesType === 'grouped_intervals') {
    return rows.map((row) => {
      const inf = row.borne_inf ?? '';
      const sup = row.borne_sup ?? '';
      const center =
        inf.trim() !== '' && sup.trim() !== ''
          ? String((Number(inf.replace(',', '.')) + Number(sup.replace(',', '.'))) / 2)
          : '';

      return {
        id: row.id,
        value: center,
        count: row.ni ?? '',
      };
    });
  }

  if (seriesType === 'bivariate') {
    return rows.map((row) => ({
      id: row.id,
      value: row.x ?? '',
      count: '1',
    }));
  }

  return rows.map((row) => ({
    id: row.id,
    value: row.xi ?? '',
    count: row.ni ?? '',
  }));
}

export function StatisticsTool() {
  const [seriesType, setSeriesType] =
    useState<StatisticsSeriesType>('univariate_frequency');

  const [rows, setRows] = useState<DynamicStatisticsRow[]>(() =>
    buildInitialRows('univariate_frequency')
  );

  const [selectedGoals, setSelectedGoals] = useState<StatisticGoal[]>(
    DEFAULT_GOALS_BY_SERIES.univariate_frequency
  );

  const [search, setSearch] = useState('');
  const [chartType, setChartType] = useState<StatisticChartType>('bar');

  const visibleColumns = useMemo(
    () => getVisibleColumns(seriesType, selectedGoals),
    [seriesType, selectedGoals]
  );

  const statisticRows = useMemo(
    () => convertDynamicRowsToStatisticRows(rows, seriesType),
    [rows, seriesType]
  );

  const hasAtLeastOneFilledValue = useMemo(() => {
    return rows.some((row) =>
      Object.entries(row).some(([key, value]) => key !== 'id' && String(value).trim() !== '')
    );
  }, [rows]);

  function handleSeriesTypeChange(nextSeriesType: StatisticsSeriesType) {
  setSeriesType(nextSeriesType);
  setSelectedGoals(DEFAULT_GOALS_BY_SERIES[nextSeriesType] ?? []);
  setRows(buildInitialRows(nextSeriesType));

  if (nextSeriesType === 'bivariate') {
    setChartType('scatter');
  } else if (nextSeriesType === 'grouped_intervals') {
    setChartType('histogram');
  } else {
    setChartType('bar');
  }
}

  function handleChangeCell(rowId: string, columnKey: string, value: string) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [columnKey]: value,
            }
          : row
      )
    );
  }

  function handleAddRow() {
    setRows((currentRows) => [...currentRows, createDynamicRow(seriesType)]);
  }

  function handleRemoveRow(rowId: string) {
    setRows((currentRows) => {
      if (currentRows.length <= 1) return currentRows;
      return currentRows.filter((row) => row.id !== rowId);
    });
  }

  function handleToggleGoal(goal: StatisticGoal) {
    setSelectedGoals((current) => {
      const exists = current.includes(goal);
      if (exists) {
        return current.filter((item) => item !== goal);
      }
      return [...current, goal];
    });
  }

  function handleApplyGoals(goals: StatisticGoal[]) {
    setSelectedGoals(goals);
  }

  function handleClearGoals() {
    setSelectedGoals([]);
  }

  function handleResetRows() {
    setRows(buildInitialRows(seriesType));
  }

  const currentSeries = STATISTICS_SERIES_TYPES.find(
    (item) => item.key === seriesType
  );

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="mb-2 font-serif text-3xl font-bold sm:text-4xl">
          Tableau statistique intelligent
        </h1>
        <p className="max-w-4xl leading-7 text-muted-foreground">
          Choisissez le type de série et les calculs souhaités. EduStat adapte
          automatiquement le tableau, ajoute les colonnes nécessaires comme
          ni·Xi, NCC, Xi², ni·Xi², XY, puis génère les résultats et les graphiques.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Type de série</CardTitle>
            <Sigma className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {currentSeries?.label ?? '—'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentSeries?.description ?? 'Tableau adaptatif'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Colonnes actives</CardTitle>
            <Table2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visibleColumns.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Colonnes affichées automatiquement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Calculs demandés</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedGoals.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Objectifs de calcul sélectionnés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Graphique</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold capitalize">
              {chartType === 'none'
                ? 'Aucun'
                : chartType === 'bar'
                ? 'Barres'
                : chartType === 'line'
                ? 'Courbe'
                : chartType === 'pie'
                ? 'Camembert'
                : chartType === 'histogram'
                ? 'Histogramme'
                : 'Nuage'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Représentation visuelle des données
            </p>
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <StatisticsToolbar
          seriesType={seriesType}
          onSeriesTypeChange={handleSeriesTypeChange}
          search={search}
          onSearchChange={setSearch}
          selectedGoals={selectedGoals}
          onToggleGoal={handleToggleGoal}
          onApplyGoals={handleApplyGoals}
          onClearGoals={handleClearGoals}
          chartType={chartType}
          onChartTypeChange={setChartType}
        />
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="space-y-6"
        >
          <StatisticsGrid
            seriesType={seriesType}
            selectedGoals={selectedGoals}
            rows={rows}
            onChangeCell={handleChangeCell}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
          />

          <StatisticsChart
  rows={rows}
  chartType={chartType}
  seriesType={seriesType}
/>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-6"
        >
          {hasAtLeastOneFilledValue ? (
            <>
              <StatisticsResults
  rows={statisticRows}
  dynamicRows={rows}
  selectedGoals={selectedGoals}
  seriesType={seriesType}
/>
              <StatisticsSummary
  rows={statisticRows}
  dynamicRows={rows}
  seriesType={seriesType}
/>
            </>
          ) : (
            <StatisticsEmptyState onReset={handleResetRows} />
          )}
        </motion.div>
      </div>
    </div>
  );
}