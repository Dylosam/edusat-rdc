'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Sigma, Sparkles, Table2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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

  const chartLabel =
    chartType === 'none'
      ? 'Aucun'
      : chartType === 'bar'
      ? 'Barres'
      : chartType === 'line'
      ? 'Courbe'
      : chartType === 'pie'
      ? 'Camembert'
      : chartType === 'histogram'
      ? 'Histogramme'
      : 'Nuage';

  return (
    <div className="space-y-5 sm:space-y-7">
      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">
          Tableau statistique intelligent
        </h1>

        <p className="max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          Choisissez le type de série et les calculs souhaités. EduStat adapte
          automatiquement le tableau, ajoute les colonnes nécessaires comme
          ni·Xi, NCC, Xi², ni·Xi², XY, puis génère les résultats et les graphiques.
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sigma className="h-3.5 w-3.5" />
            {currentSeries?.label ?? '—'}
          </Badge>

          <Badge variant="outline" className="gap-1">
            <Table2 className="h-3.5 w-3.5" />
            {visibleColumns.length} colonnes
          </Badge>

          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            {selectedGoals.length} calculs
          </Badge>

          <Badge variant="outline" className="gap-1">
            <BarChart3 className="h-3.5 w-3.5" />
            {chartLabel}
          </Badge>
        </div>
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

      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="min-w-0"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold sm:text-xl">Tableau</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Saisie et calculs adaptatifs, pensés pour mobile et desktop.
              </p>
            </div>
          </div>

          <div className="min-w-0 overflow-x-auto rounded-2xl border bg-background">
            <div className="min-w-[720px] sm:min-w-0">
              <StatisticsGrid
                seriesType={seriesType}
                selectedGoals={selectedGoals}
                rows={rows}
                onChangeCell={handleChangeCell}
                onAddRow={handleAddRow}
                onRemoveRow={handleRemoveRow}
              />
            </div>
          </div>
        </motion.section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_1fr]">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="min-w-0"
          >
            <div className="mb-3">
              <h2 className="text-lg font-semibold sm:text-xl">Graphique</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Représentation visuelle des données saisies.
              </p>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border bg-background">
              <StatisticsChart
                rows={rows}
                chartType={chartType}
                seriesType={seriesType}
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="min-w-0 space-y-6"
          >
            {hasAtLeastOneFilledValue ? (
              <>
                <div className="overflow-hidden rounded-2xl border bg-background">
                  <StatisticsResults
                    rows={statisticRows}
                    dynamicRows={rows}
                    selectedGoals={selectedGoals}
                    seriesType={seriesType}
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border bg-background">
                  <StatisticsSummary
                    rows={statisticRows}
                    dynamicRows={rows}
                    seriesType={seriesType}
                  />
                </div>
              </>
            ) : (
              <div className="overflow-hidden rounded-2xl border bg-background">
                <StatisticsEmptyState onReset={handleResetRows} />
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}