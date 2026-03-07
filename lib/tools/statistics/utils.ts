import type {
  FrequencyTableRow,
  ParsedStatisticRow,
  StatisticComputationResult,
  StatisticRow,
} from "./types";

function round(value: number, precision = 4) {
  return Number(value.toFixed(precision));
}

export function createStatisticRow(): StatisticRow {
  return {
    id: crypto.randomUUID(),
    value: "",
    count: "",
  };
}

export function parseStatisticRows(rows: StatisticRow[]): ParsedStatisticRow[] {
  return rows
    .map((row) => {
      const value = Number(row.value);
      const count =
        row.count === undefined || row.count === "" ? 1 : Number(row.count);

      return {
        id: row.id,
        value,
        count,
      };
    })
    .filter(
      (row) =>
        Number.isFinite(row.value) &&
        Number.isFinite(row.count) &&
        row.count > 0
    );
}

export function expandRowsToValues(rows: ParsedStatisticRow[]): number[] {
  const values: number[] = [];

  for (const row of rows) {
    for (let i = 0; i < row.count; i += 1) {
      values.push(row.value);
    }
  }

  return values.sort((a, b) => a - b);
}

export function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return sum(values) / values.length;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

export function quartile(values: number[], q: 1 | 3): number | null {
  if (!values.length) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const target =
    q === 1
      ? Math.ceil(sorted.length / 4)
      : Math.ceil((3 * sorted.length) / 4);

  return sorted[Math.max(0, target - 1)] ?? null;
}

export function mode(values: number[]): number[] | null {
  if (!values.length) return null;

  const map = new Map<number, number>();

  for (const value of values) {
    map.set(value, (map.get(value) ?? 0) + 1);
  }

  let maxCount = 0;
  for (const count of Array.from(map.values())) {
    if (count > maxCount) maxCount = count;
  }

  if (maxCount <= 1) return null;

  return Array.from(map.entries())
    .filter(([, count]) => count === maxCount)
    .map(([value]) => value)
    .sort((a, b) => a - b);
}

export function variance(values: number[]): number | null {
  if (!values.length) return null;

  const avg = mean(values);
  if (avg === null) return null;

  const squaredDiffs = values.map((value) => (value - avg) ** 2);
  return sum(squaredDiffs) / values.length;
}

export function standardDeviation(values: number[]): number | null {
  const v = variance(values);
  if (v === null) return null;
  return Math.sqrt(v);
}

export function buildFrequencyTable(
  rows: ParsedStatisticRow[]
): FrequencyTableRow[] {
  const totalCount = rows.reduce((acc, row) => acc + row.count, 0);
  if (!totalCount) return [];

  const grouped = rows.reduce((map, row) => {
    map.set(row.value, (map.get(row.value) ?? 0) + row.count);
    return map;
  }, new Map<number, number>());

  let cumulativeCount = 0;

  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([value, count]) => {
      cumulativeCount += count;
      const frequency = count / totalCount;
      const cumulativeFrequency = cumulativeCount / totalCount;

      return {
        value,
        count,
        frequency: round(frequency),
        cumulativeCount,
        cumulativeFrequency: round(cumulativeFrequency),
      };
    });
}

export function computeStatistics(
  rows: StatisticRow[]
): StatisticComputationResult {
  const parsedRows = parseStatisticRows(rows);
  const expandedValues = expandRowsToValues(parsedRows);
  const frequencyTable = buildFrequencyTable(parsedRows);

  const totalCount = expandedValues.length;
  const distinctCount = new Set(expandedValues).size;
  const totalSum = totalCount ? sum(expandedValues) : 0;
  const avg = mean(expandedValues);
  const med = median(expandedValues);
  const min = totalCount ? expandedValues[0] : null;
  const max = totalCount ? expandedValues[expandedValues.length - 1] : null;
  const q1 = quartile(expandedValues, 1);
  const q3 = quartile(expandedValues, 3);
  const v = variance(expandedValues);
  const stdDev = standardDeviation(expandedValues);

  return {
    totalCount,
    distinctCount,
    sum: round(totalSum),
    mean: avg === null ? null : round(avg),
    median: med === null ? null : round(med),
    mode: mode(expandedValues),
    min,
    max,
    range: min !== null && max !== null ? round(max - min) : null,
    q1: q1 === null ? null : round(q1),
    q3: q3 === null ? null : round(q3),
    iqr: q1 !== null && q3 !== null ? round(q3 - q1) : null,
    variance: v === null ? null : round(v),
    stdDev: stdDev === null ? null : round(stdDev),
    frequencyTable,
    expandedValues,
  };
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number.isInteger(value) ? String(value) : String(value);
}