export type ElementCategory =
  | 'alkali_metal'
  | 'alkaline_earth_metal'
  | 'transition_metal'
  | 'post_transition_metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble_gas'
  | 'lanthanide'
  | 'actinide'
  | string;

export interface PeriodicElementBase {
  z: number;
  symbol: string;
  name: string;
  weight?: string | number | null;
  period?: number | null;
  group?: number | null;
  category?: ElementCategory | null;
}

export interface PeriodicElementExtra {
  electronegativity?: string | number | null;
  ionizationEnergyKJ?: string | number | null;
  valence?: string | number | null;
  commonOxidation?: string | number | null;
  oxidationStates?: Array<string | number> | null;
  state?: string | null;
  electronConfig?: string | null;
}

export type PeriodicElement = PeriodicElementBase & PeriodicElementExtra;