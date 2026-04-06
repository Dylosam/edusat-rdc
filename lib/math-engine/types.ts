export type MathSubject =
  | "analyse"
  | "trigonometrie"
  | "geometrie"
  | "algebre";

export type MathChapter =
  | "mm5-9"
  | "mm5-10"
  | "mm5-11"
  | "mm5-12"
  | "mm5-13"
  | "mm5-14"
  | "mm5-15"
  | "mm5-16"
  | "mm5-17"
  | "trig-1"
  | "trig-2"
  | "trig-3"
  | "trig-4"
  | "geo-1"
  | "geo-2"
  | "geo-3"
  | "geo-4"
  | "geo-5"
  | "geo-6"
  | "geo-7"
  | "geo-8"
  | "geo-9"
  | "alg-1"
  | "alg-2"
  | "alg-3"
  | "alg-4"
  | "alg-5"
  | "alg-6"
  | "alg-7";

export type DetectedExerciseType =
  | "domain_fraction"
  | "domain_sqrt"
  | "domain_log"
  | "domain_fraction_sqrt"
  | "domain_unknown";

export interface SolveStep {
  title: string;
  content: string;
  latex?: string;
}

export interface MathSolveRequest {
  subject?: MathSubject;
  chapter?: MathChapter;
  expression: string;
}

export interface MathSolveResponse {
  success: boolean;
  subject?: MathSubject;
  chapter?: MathChapter;
  exerciseType: DetectedExerciseType;
  rawInput: string;
  normalizedInput: string;
  steps: SolveStep[];
  finalAnswer: string;
  warnings?: string[];
  error?: string;
}

export interface NormalizedMathInput {
  rawInput: string;
  normalizedInput: string;
  cleanedExpression: string;
  warnings: string[];
}

export interface ClassifiedMathInput {
  exerciseType: DetectedExerciseType;
  subject?: MathSubject;
  chapter?: MathChapter;
}