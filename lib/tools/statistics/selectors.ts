import { STATISTIC_METRICS } from "./constants";
import { computeStatistics, formatNumber } from "./utils";
import type {
  StatisticMetricKey,
  StatisticResultItem,
  StatisticRow,
} from "./types";

export function getMetricDefinition(key: StatisticMetricKey) {
  return STATISTIC_METRICS.find((metric) => metric.key === key);
}

export function buildStatisticResults(
  rows: StatisticRow[],
  selectedMetrics: StatisticMetricKey[]
): StatisticResultItem[] {
  const computed = computeStatistics(rows);

  return selectedMetrics
    .map((metricKey) => {
      const def = getMetricDefinition(metricKey);
      if (!def) return null;

      switch (metricKey) {
        case "count":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.totalCount),
            rawValue: computed.totalCount,
            description: def.description,
          };

        case "sum":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.sum),
            rawValue: computed.sum,
            description: def.description,
          };

        case "mean":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.mean),
            rawValue: computed.mean,
            description: def.description,
          };

        case "median":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.median),
            rawValue: computed.median,
            description: def.description,
          };

        case "mode":
          return {
            key: metricKey,
            label: def.label,
            value: computed.mode?.length ? computed.mode.join(", ") : "Aucun mode",
            rawValue: computed.mode?.[0] ?? null,
            description: def.description,
          };

        case "min":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.min),
            rawValue: computed.min,
            description: def.description,
          };

        case "max":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.max),
            rawValue: computed.max,
            description: def.description,
          };

        case "range":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.range),
            rawValue: computed.range,
            description: def.description,
          };

        case "q1":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.q1),
            rawValue: computed.q1,
            description: def.description,
          };

        case "q3":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.q3),
            rawValue: computed.q3,
            description: def.description,
          };

        case "iqr":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.iqr),
            rawValue: computed.iqr,
            description: def.description,
          };

        case "variance":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.variance),
            rawValue: computed.variance,
            description: def.description,
          };

        case "stdDev":
          return {
            key: metricKey,
            label: def.label,
            value: formatNumber(computed.stdDev),
            rawValue: computed.stdDev,
            description: def.description,
          };

        case "frequency":
          return {
            key: metricKey,
            label: def.label,
            value: `${computed.frequencyTable.length} ligne(s)`,
            rawValue: computed.frequencyTable.length,
            description: def.description,
          };

        case "cumulativeCount":
          return {
            key: metricKey,
            label: def.label,
            value: `${computed.frequencyTable.length} ligne(s)`,
            rawValue: computed.frequencyTable.length,
            description: def.description,
          };

        case "cumulativeFrequency":
          return {
            key: metricKey,
            label: def.label,
            value: `${computed.frequencyTable.length} ligne(s)`,
            rawValue: computed.frequencyTable.length,
            description: def.description,
          };

        default:
          return null;
      }
    })
    .filter(Boolean) as StatisticResultItem[];
}