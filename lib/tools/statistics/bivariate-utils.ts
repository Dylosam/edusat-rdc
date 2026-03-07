import type { DynamicStatisticsRow } from './types';

export interface ParsedBivariateRow {
  id: string;
  x: number;
  y: number;
}

export interface BivariateComputationResult {
  count: number;
  meanX: number | null;
  meanY: number | null;
  pointMean: { x: number; y: number } | null;
  varianceX: number | null;
  varianceY: number | null;
  stdDevX: number | null;
  stdDevY: number | null;
  covariance: number | null;
  correlation: number | null;
  sumX: number;
  sumY: number;
  sumX2: number;
  sumY2: number;
  sumXY: number;
}

function round(value: number, precision = 4) {
  return Number(value.toFixed(precision));
}

function toNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

export function parseBivariateRows(
  rows: DynamicStatisticsRow[]
): ParsedBivariateRow[] {
  return rows
    .map((row) => {
      const x = toNumber(row.x);
      const y = toNumber(row.y);

      return {
        id: row.id,
        x,
        y,
      };
    })
    .filter(
      (row): row is ParsedBivariateRow =>
        row.x !== null && row.y !== null
    );
}

export function computeBivariateStatistics(
  rows: DynamicStatisticsRow[]
): BivariateComputationResult {
  const parsed = parseBivariateRows(rows);
  const n = parsed.length;

  if (!n) {
    return {
      count: 0,
      meanX: null,
      meanY: null,
      pointMean: null,
      varianceX: null,
      varianceY: null,
      stdDevX: null,
      stdDevY: null,
      covariance: null,
      correlation: null,
      sumX: 0,
      sumY: 0,
      sumX2: 0,
      sumY2: 0,
      sumXY: 0,
    };
  }

  const sumX = parsed.reduce((acc, row) => acc + row.x, 0);
  const sumY = parsed.reduce((acc, row) => acc + row.y, 0);
  const sumX2 = parsed.reduce((acc, row) => acc + row.x * row.x, 0);
  const sumY2 = parsed.reduce((acc, row) => acc + row.y * row.y, 0);
  const sumXY = parsed.reduce((acc, row) => acc + row.x * row.y, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const varianceX =
    parsed.reduce((acc, row) => acc + (row.x - meanX) ** 2, 0) / n;
  const varianceY =
    parsed.reduce((acc, row) => acc + (row.y - meanY) ** 2, 0) / n;

  const stdDevX = Math.sqrt(varianceX);
  const stdDevY = Math.sqrt(varianceY);

  const covariance =
    parsed.reduce(
      (acc, row) => acc + (row.x - meanX) * (row.y - meanY),
      0
    ) / n;

  const denominator = stdDevX * stdDevY;
  const correlation =
    denominator === 0 ? null : covariance / denominator;

  return {
    count: n,
    meanX: round(meanX),
    meanY: round(meanY),
    pointMean: {
      x: round(meanX),
      y: round(meanY),
    },
    varianceX: round(varianceX),
    varianceY: round(varianceY),
    stdDevX: round(stdDevX),
    stdDevY: round(stdDevY),
    covariance: round(covariance),
    correlation: correlation === null ? null : round(correlation),
    sumX: round(sumX),
    sumY: round(sumY),
    sumX2: round(sumX2),
    sumY2: round(sumY2),
    sumXY: round(sumXY),
  };
}

export function formatBivariatePair(
  x: number | null,
  y: number | null,
  prefix = '(',
  suffix = ')'
): string {
  if (x === null || y === null) return '—';
  return `${prefix}${x} ; ${y}${suffix}`;
}