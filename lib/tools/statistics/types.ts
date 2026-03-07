export type StatisticsSeriesType =
  | "univariate_frequency"
  | "grouped_intervals"
  | "bivariate";

export type StatisticGoal =
  | "mean"
  | "median"
  | "mode"
  | "variance"
  | "stdDev"
  | "quartiles"
  | "frequency"
  | "correlation";

export type StatisticChartType =
  | "bar"
  | "line"
  | "pie"
  | "histogram"
  | "scatter"
  | "none";

export type StatisticColumnKey =
  | "xi"
  | "ni"
  | "fi"
  | "ni_xi"
  | "xi2"
  | "ni_xi2"
  | "ncc"
  | "ncd"
  | "borne_inf"
  | "borne_sup"
  | "centre"
  | "amplitude"
  | "ni_centre"
  | "centre2"
  | "ni_centre2"
  | "x"
  | "y"
  | "x2"
  | "y2"
  | "xy";

export interface StatisticColumnDefinition {
  key: StatisticColumnKey;
  label: string;
  description: string;
  editable: boolean;
  category:
    | "base"
    | "frequency"
    | "position"
    | "dispersion"
    | "grouped"
    | "bivariate";
}

export interface StatisticGoalDefinition {
  key: StatisticGoal;
  label: string;
  description: string;
}

export interface StatisticsSeriesDefinition {
  key: StatisticsSeriesType;
  label: string;
  description: string;
}

export interface DynamicStatisticsRow {
  id: string;
  [key: string]: string;
}

export interface StatisticMetricKeyLegacyCompatible {
  key: string;
}

export interface StatisticRow {
  id: string;
  value: string;
  count?: string;
}

export interface StatisticMetricDefinition {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  category: "position" | "dispersion" | "frequency" | "basic";
}

export interface StatisticResultItem {
  key: string;
  label: string;
  value: string;
  rawValue?: number | null;
  description?: string;
}

export interface ParsedStatisticRow {
  id: string;
  value: number;
  count: number;
}

export interface FrequencyTableRow {
  value: number;
  count: number;
  frequency: number;
  cumulativeCount: number;
  cumulativeFrequency: number;
}

export interface StatisticComputationResult {
  totalCount: number;
  distinctCount: number;
  sum: number;
  mean: number | null;
  median: number | null;
  mode: number[] | null;
  min: number | null;
  max: number | null;
  range: number | null;
  q1: number | null;
  q3: number | null;
  iqr: number | null;
  variance: number | null;
  stdDev: number | null;
  frequencyTable: FrequencyTableRow[];
  expandedValues: number[];
}