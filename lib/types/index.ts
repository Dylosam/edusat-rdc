// lib/types/index.ts

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  level: string;
  subscription: "free" | "premium";
  joinDate: string;
  totalTimeStudied: number;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  chaptersCount: number;
  progress: number;
  icon: string;
  color: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  status: "not-started" | "in-progress" | "completed";
  estimatedTime: number;
  hasQuiz: boolean;
  hasCourse: boolean;
  hasExercises: boolean;
}

/**
 * ✅ Leçon (utilisé dans lib/data/lessons.ts)
 */
export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  summary?: string;
  durationMin?: number;
  isPremium?: boolean;
  content: LessonContentBlock[];
}

export type LessonContentBlock =
  | { type: "text"; value: string }
  | { type: "tip"; value: string }
  | { type: "example"; title?: string; value: string }
  | { type: "formula"; value: string };

export interface CourseContent {
  id: string;
  chapterId: string;
  content: string;
  sections: CourseSection[];
}

export interface CourseSection {
  title: string;
  content: string;
  latex?: string;
}

export interface Exercise {
  id: string;
  chapterId: string;
  question: string;
  solution: string;
  difficulty: "easy" | "medium" | "hard";
  latex?: string;
}

export interface Quiz {
  id: string;
  chapterId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit?: number; // en secondes si tu veux
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "numeric" | "text";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  latex?: string;

  /**
   * ✅ optionnel : pour recommander des leçons
   * (utile au moteur, mais n'oblige personne à le remplir)
   */
  lessonIds?: string[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string | number>;
  completedAt: string;

  /**
   * ✅ optionnel : pour suivre réussite/échec
   */
  passed?: boolean;

  /**
   * ✅ optionnel : pour exploiter les recommandations
   */
  weakLessonIds?: string[];
}

export interface SchoolPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: "term" | "exam" | "holiday";
}

export interface Progress {
  subjectId: string;
  chaptersCompleted: number;
  totalChapters: number;
  quizzesPassed: number;
  averageScore: number;
  timeSpent: number;
}

/* ------------------------------------------------------------------ */
/* ✅ Types utilitaires pour le moteur de quiz (sans casser tes types) */
/* ------------------------------------------------------------------ */

/**
 * Représentation "engine" pour corriger facilement (index-based).
 * On ne remplace pas ton Quiz. On crée une version dédiée au moteur.
 */
export type EngineQuiz = {
  id: string;
  chapterId: string;
  title: string;
  passPercent?: number; // default 70
  questions: EngineQuizQuestion[];
};

export type EngineQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  lessonIds?: string[];
};

export type EngineAnswerMap = Record<string, number | null>;

export type EngineCorrectionItem = {
  questionId: string;
  isCorrect: boolean;
  chosenIndex: number | null;
  correctIndex: number;
  lessonIds: string[];
};

export type EngineQuizResult = {
  quizId: string;
  chapterId: string;
  total: number;
  correct: number;
  percent: number;
  passed: boolean;
  passPercent: number;
  corrections: EngineCorrectionItem[];
  weakLessonIds: string[];
  createdAt: string;
};
