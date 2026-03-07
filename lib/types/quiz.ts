// lib/types/quiz.ts

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "numeric"
  | "text";

export type QuizQuestion = {
  id: string;
  type: "single_choice" | "multiple_choice" | "true_false" | "numeric" | "text";
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation?: string;
  points?: number;

  // ✅ NEW (optionnel): question -> leçon à réviser
  lessonId?: string;
};

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
// lib/types/quiz.ts
