import type {
  StatisticColumnDefinition,
  StatisticGoalDefinition,
  StatisticGoal,
  StatisticColumnKey,
  StatisticsSeriesDefinition,
  StatisticsSeriesType,
} from './types';

export const STATISTICS_SERIES_TYPES: StatisticsSeriesDefinition[] = [
  {
    key: 'univariate_frequency',
    label: 'Série à effectifs',
    description: 'Valeurs Xi avec effectifs ni.',
  },
  {
    key: 'grouped_intervals',
    label: 'Série par intervalles',
    description: 'Classes statistiques avec bornes et effectifs.',
  },
  {
    key: 'bivariate',
    label: 'Série bivariée',
    description: 'Deux variables X et Y pour moyenne, variance, covariance et corrélation.',
  },
];

export const STATISTIC_GOALS: StatisticGoalDefinition[] = [
  {
    key: 'mean',
    label: 'Moyenne',
    description: 'Calcule la moyenne de la série.',
  },
  {
    key: 'median',
    label: 'Médiane',
    description: 'Repère la valeur centrale de la série.',
  },
  {
    key: 'mode',
    label: 'Mode',
    description: 'Détermine la valeur la plus fréquente.',
  },
  {
    key: 'variance',
    label: 'Variance',
    description: 'Mesure la dispersion autour de la moyenne.',
  },
  {
    key: 'stdDev',
    label: 'Écart-type',
    description: 'Racine carrée de la variance.',
  },
  {
    key: 'quartiles',
    label: 'Quartiles',
    description: 'Détermine Q1, Q2, Q3.',
  },
  {
    key: 'frequency',
    label: 'Fréquences',
    description: 'Affiche fréquences et cumuls.',
  },
  {
    key: 'correlation',
    label: 'Corrélation',
    description: 'Mesure la liaison entre X et Y.',
  },
];

export const STATISTIC_COLUMNS: Record<
  StatisticColumnKey,
  StatisticColumnDefinition
> = {
  xi: {
    key: 'xi',
    label: 'Xi',
    description: 'Valeur statistique.',
    editable: true,
    category: 'base',
  },
  ni: {
    key: 'ni',
    label: 'ni',
    description: 'Effectif associé à la valeur ou à la classe.',
    editable: true,
    category: 'base',
  },
  fi: {
    key: 'fi',
    label: 'fi',
    description: 'Fréquence de la valeur.',
    editable: false,
    category: 'frequency',
  },
  ni_xi: {
    key: 'ni_xi',
    label: 'ni·Xi',
    description: 'Produit utile pour calculer la moyenne.',
    editable: false,
    category: 'position',
  },
  xi2: {
    key: 'xi2',
    label: 'Xi²',
    description: 'Carré de Xi, utile pour la variance.',
    editable: false,
    category: 'dispersion',
  },
  ni_xi2: {
    key: 'ni_xi2',
    label: 'ni·Xi²',
    description: 'Produit utile pour la variance.',
    editable: false,
    category: 'dispersion',
  },
  ncc: {
    key: 'ncc',
    label: 'NCC',
    description: 'Nombre cumulé croissant.',
    editable: false,
    category: 'frequency',
  },
  ncd: {
    key: 'ncd',
    label: 'NCD',
    description: 'Nombre cumulé décroissant.',
    editable: false,
    category: 'frequency',
  },
  borne_inf: {
    key: 'borne_inf',
    label: 'Borne inf.',
    description: 'Borne inférieure de la classe.',
    editable: true,
    category: 'grouped',
  },
  borne_sup: {
    key: 'borne_sup',
    label: 'Borne sup.',
    description: 'Borne supérieure de la classe.',
    editable: true,
    category: 'grouped',
  },
  centre: {
    key: 'centre',
    label: 'Centre',
    description: 'Centre de classe.',
    editable: false,
    category: 'grouped',
  },
  amplitude: {
    key: 'amplitude',
    label: 'Amplitude',
    description: 'Amplitude de la classe.',
    editable: false,
    category: 'grouped',
  },
  ni_centre: {
    key: 'ni_centre',
    label: 'ni·cᵢ',
    description: 'Produit effectif × centre de classe.',
    editable: false,
    category: 'grouped',
  },
  centre2: {
    key: 'centre2',
    label: 'cᵢ²',
    description: 'Carré du centre de classe.',
    editable: false,
    category: 'grouped',
  },
  ni_centre2: {
    key: 'ni_centre2',
    label: 'ni·cᵢ²',
    description: 'Produit utile pour la variance par classes.',
    editable: false,
    category: 'grouped',
  },
  x: {
    key: 'x',
    label: 'X',
    description: 'Première variable.',
    editable: true,
    category: 'bivariate',
  },
  y: {
    key: 'y',
    label: 'Y',
    description: 'Deuxième variable.',
    editable: true,
    category: 'bivariate',
  },
  x2: {
    key: 'x2',
    label: 'X²',
    description: 'Carré de X.',
    editable: false,
    category: 'bivariate',
  },
  y2: {
    key: 'y2',
    label: 'Y²',
    description: 'Carré de Y.',
    editable: false,
    category: 'bivariate',
  },
  xy: {
    key: 'xy',
    label: 'XY',
    description: 'Produit X×Y, utile pour la corrélation.',
    editable: false,
    category: 'bivariate',
  },
};

export const BASE_COLUMNS_BY_SERIES: Record<
  StatisticsSeriesType,
  StatisticColumnKey[]
> = {
  univariate_frequency: ['xi', 'ni'],
  grouped_intervals: ['borne_inf', 'borne_sup', 'ni'],
  bivariate: ['x', 'y'],
};

export const REQUIRED_COLUMNS_BY_GOAL: Record<
  StatisticGoal,
  StatisticColumnKey[]
> = {
  mean: ['ni_xi'],
  median: ['ncc'],
  mode: [],
  variance: ['ni_xi', 'xi2', 'ni_xi2'],
  stdDev: ['ni_xi', 'xi2', 'ni_xi2'],
  quartiles: ['ncc'],
  frequency: ['fi', 'ncc', 'ncd'],
  correlation: ['x2', 'y2', 'xy'],
};

export const GROUPED_SERIES_REQUIRED_COLUMNS_BY_GOAL: Partial<
  Record<StatisticGoal, StatisticColumnKey[]>
> = {
  mean: ['centre', 'ni_centre'],
  variance: ['centre', 'ni_centre', 'centre2', 'ni_centre2'],
  stdDev: ['centre', 'ni_centre', 'centre2', 'ni_centre2'],
  median: ['amplitude', 'ncc'],
  quartiles: ['amplitude', 'ncc'],
  frequency: ['centre', 'fi', 'ncc', 'ncd'],
};

export const BIVARIATE_REQUIRED_COLUMNS_BY_GOAL: Partial<
  Record<StatisticGoal, StatisticColumnKey[]>
> = {
  mean: [],
  variance: ['x2', 'y2'],
  stdDev: ['x2', 'y2'],
  correlation: ['x2', 'y2', 'xy'],
};

export const AVAILABLE_GOALS_BY_SERIES: Record<
  StatisticsSeriesType,
  StatisticGoal[]
> = {
  univariate_frequency: [
    'mean',
    'median',
    'mode',
    'variance',
    'stdDev',
    'quartiles',
    'frequency',
  ],
  grouped_intervals: [
    'mean',
    'median',
    'variance',
    'stdDev',
    'quartiles',
    'frequency',
  ],
  bivariate: ['mean', 'variance', 'stdDev', 'correlation'],
};

export const DEFAULT_GOALS_BY_SERIES: Record<
  StatisticsSeriesType,
  StatisticGoal[]
> = {
  univariate_frequency: ['mean', 'frequency'],
  grouped_intervals: ['mean', 'frequency'],
  bivariate: ['mean', 'correlation'],
};