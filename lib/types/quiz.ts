// lib/types/quiz.ts

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "numeric"
  | "text";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;

  options?: string[];

  // réponse correcte
  correctAnswer: string | string[] | number;

  explanation?: string;
  points?: number; // défaut 1
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;

  // ✅ IMPORTANT pour progression
  chapterId: string;

  // ✅ PLUS DE passPercent
  questions: QuizQuestion[];
}
