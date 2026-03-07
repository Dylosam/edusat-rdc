import {
  AVAILABLE_GOALS_BY_SERIES,
  BASE_COLUMNS_BY_SERIES,
  BIVARIATE_REQUIRED_COLUMNS_BY_GOAL,
  GROUPED_SERIES_REQUIRED_COLUMNS_BY_GOAL,
  REQUIRED_COLUMNS_BY_GOAL,
  STATISTIC_COLUMNS,
} from './constants';

import type {
  StatisticColumnDefinition,
  StatisticColumnKey,
  StatisticGoal,
  StatisticsSeriesType,
} from './types';

function uniqueColumns(columns: StatisticColumnKey[]): StatisticColumnKey[] {
  return Array.from(new Set(columns));
}

export function getAvailableGoals(
  seriesType: StatisticsSeriesType
): StatisticGoal[] {
  return AVAILABLE_GOALS_BY_SERIES[seriesType] ?? [];
}

export function sanitizeGoalsForSeries(
  seriesType: StatisticsSeriesType,
  selectedGoals: StatisticGoal[]
): StatisticGoal[] {
  const allowed = getAvailableGoals(seriesType);
  return selectedGoals.filter((goal) => allowed.includes(goal));
}

export function getRequiredColumns(
  seriesType: StatisticsSeriesType,
  selectedGoals: StatisticGoal[]
): StatisticColumnKey[] {
  const cleanGoals = sanitizeGoalsForSeries(seriesType, selectedGoals);
  const baseColumns = BASE_COLUMNS_BY_SERIES[seriesType] ?? [];

  const goalColumns = cleanGoals.flatMap((goal) => {
    if (seriesType === 'grouped_intervals') {
      return (
        GROUPED_SERIES_REQUIRED_COLUMNS_BY_GOAL[goal] ??
        REQUIRED_COLUMNS_BY_GOAL[goal] ??
        []
      );
    }

    if (seriesType === 'bivariate') {
      return BIVARIATE_REQUIRED_COLUMNS_BY_GOAL[goal] ?? [];
    }

    return REQUIRED_COLUMNS_BY_GOAL[goal] ?? [];
  });

  return uniqueColumns([...baseColumns, ...goalColumns]);
}

export function getVisibleColumns(
  seriesType: StatisticsSeriesType,
  selectedGoals: StatisticGoal[]
): StatisticColumnDefinition[] {
  const keys = getRequiredColumns(seriesType, selectedGoals);

  return keys
    .map((key) => STATISTIC_COLUMNS[key])
    .filter(Boolean);
}

export function isEditableColumn(key: StatisticColumnKey): boolean {
  return STATISTIC_COLUMNS[key]?.editable ?? false;
}