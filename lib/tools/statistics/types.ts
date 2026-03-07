export type StatisticMetricKey =
  | "count"
  | "sum"
  | "mean"
  | "median"
  | "mode"
  | "min"
  | "max"
  | "range"
  | "q1"
  | "q3"
  | "iqr"
  | "variance"
  | "stdDev"
  | "frequency"
  | "cumulativeCount"
  | "cumulativeFrequency";

export type StatisticMode = "raw" | "frequency";

export interface StatisticRow {
  id: string;
  value: string;
  count?: string;
}

export interface StatisticMetricDefinition {
  key: StatisticMetricKey;
  label: string;
  shortLabel: string;
  description: string;
  category: "position" | "dispersion" | "frequency" | "basic";
}

export interface StatisticResultItem {
  key: StatisticMetricKey;
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