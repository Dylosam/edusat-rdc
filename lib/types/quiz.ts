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

// lib/types/quiz.ts
// ... garde tout ce que tu as déjà ...

export type Quiz = {
  id: string;
  chapterId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];

  // ✅ Quiz v2 (optionnel -> ne casse rien)
  timeLimitSec?: number;  // ex: 600 (10 minutes)
  maxAttempts?: number;   // ex: 3
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
};
// ---- ADD THIS AT THE END OF lib/types/quiz.ts ----

export type QuizResultDetail = {
  questionId: string;
  isCorrect: boolean;
  score: number;
};

export type QuizResult = {
  totalScore: number;
  maxScore: number;
  percentage: number; // ex: 72.5
  passed: boolean;
  details: QuizResultDetail[];
};
// lib/types/quiz.ts
// ... garde tout ce que tu as déjà ...
