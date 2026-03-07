// lib/study/types.ts

export type StudyStepKind = "lesson" | "checkpoint" | "summary" | "quiz";

export type StudyStep = {
  id: string;

  kind: StudyStepKind;
  kindLabel: string;

  title: string;
  subtitle?: string;

  minutes?: number;

  href?: string;

  // aperçu latex optionnel
  katexPreview?: string;

  // petit contenu/preview
  body?: string;

  // optionnel si plus tard tu veux un contenu riche
  data?: Record<string, unknown>;
};