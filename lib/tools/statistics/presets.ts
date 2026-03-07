import type { StatisticMetricKey } from "./types";

export const STATISTIC_PRESETS: Array<{
  key: string;
  label: string;
  metrics: StatisticMetricKey[];
}> = [
  {
    key: "essential",
    label: "Essentiel",
    metrics: ["count", "mean", "median", "mode"],
  },
  {
    key: "quartiles",
    label: "Quartiles",
    metrics: ["q1", "median", "q3", "iqr"],
  },
  {
    key: "dispersion",
    label: "Dispersion",
    metrics: ["min", "max", "range", "variance", "stdDev"],
  },
  {
    key: "full",
    label: "Analyse complète",
    metrics: ["count", "sum", "mean", "median", "mode", "q1", "q3", "iqr", "variance", "stdDev"],
  },
];