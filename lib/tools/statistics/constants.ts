import type { StatisticMetricDefinition, StatisticMode } from "./types";

export const STATISTIC_MODES: Array<{
  key: StatisticMode;
  label: string;
  description: string;
}> = [
  {
    key: "raw",
    label: "Liste simple",
    description: "L'élève saisit chaque valeur une à une.",
  },
  {
    key: "frequency",
    label: "Valeurs avec effectifs",
    description: "L'élève saisit chaque valeur Xi avec son effectif ni.",
  },
];

export const STATISTIC_METRICS: StatisticMetricDefinition[] = [
  {
    key: "count",
    label: "Effectif total",
    shortLabel: "N",
    description: "Nombre total de données.",
    category: "basic",
  },
  {
    key: "sum",
    label: "Somme",
    shortLabel: "Σx",
    description: "Somme de toutes les valeurs.",
    category: "basic",
  },
  {
    key: "mean",
    label: "Moyenne",
    shortLabel: "x̄",
    description: "Moyenne arithmétique de la série.",
    category: "position",
  },
  {
    key: "median",
    label: "Médiane",
    shortLabel: "Med",
    description: "Valeur qui partage la série ordonnée en deux parties égales.",
    category: "position",
  },
  {
    key: "mode",
    label: "Mode",
    shortLabel: "Mo",
    description: "Valeur la plus fréquente.",
    category: "position",
  },
  {
    key: "min",
    label: "Minimum",
    shortLabel: "Min",
    description: "Plus petite valeur de la série.",
    category: "basic",
  },
  {
    key: "max",
    label: "Maximum",
    shortLabel: "Max",
    description: "Plus grande valeur de la série.",
    category: "basic",
  },
  {
    key: "range",
    label: "Étendue",
    shortLabel: "E",
    description: "Différence entre la plus grande et la plus petite valeur.",
    category: "dispersion",
  },
  {
    key: "q1",
    label: "Premier quartile",
    shortLabel: "Q1",
    description: "Valeur en dessous de laquelle se trouvent 25% des données.",
    category: "position",
  },
  {
    key: "q3",
    label: "Troisième quartile",
    shortLabel: "Q3",
    description: "Valeur en dessous de laquelle se trouvent 75% des données.",
    category: "position",
  },
  {
    key: "iqr",
    label: "Écart interquartile",
    shortLabel: "IQR",
    description: "Différence entre Q3 et Q1.",
    category: "dispersion",
  },
  {
    key: "variance",
    label: "Variance",
    shortLabel: "Var",
    description: "Mesure de dispersion autour de la moyenne.",
    category: "dispersion",
  },
  {
    key: "stdDev",
    label: "Écart-type",
    shortLabel: "σ",
    description: "Racine carrée de la variance.",
    category: "dispersion",
  },
  {
    key: "frequency",
    label: "Fréquences",
    shortLabel: "fi",
    description: "Proportion de chaque valeur dans la série.",
    category: "frequency",
  },
  {
    key: "cumulativeCount",
    label: "Effectifs cumulés",
    shortLabel: "Ni",
    description: "Somme progressive des effectifs.",
    category: "frequency",
  },
  {
    key: "cumulativeFrequency",
    label: "Fréquences cumulées",
    shortLabel: "Fi",
    description: "Somme progressive des fréquences.",
    category: "frequency",
  },
];

export const DEFAULT_STATISTIC_METRICS = [
  "count",
  "mean",
  "median",
  "mode",
  "q1",
  "q3",
  "iqr",
] as const;

export const STATISTIC_PRESET_GROUPS = [
  {
    key: "basic",
    label: "Base",
    metrics: ["count", "sum", "min", "max", "range"],
  },
  {
    key: "position",
    label: "Position",
    metrics: ["mean", "median", "mode", "q1", "q3"],
  },
  {
    key: "dispersion",
    label: "Dispersion",
    metrics: ["range", "variance", "stdDev", "iqr"],
  },
  {
    key: "frequency",
    label: "Fréquences",
    metrics: ["frequency", "cumulativeCount", "cumulativeFrequency"],
  },
];