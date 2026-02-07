// lib/data/quizzes.ts
import type { Quiz } from "@/lib/types";
import { QUIZZES_DATA } from "./quizzes-data";

/**
 * Liste des quiz (mock local)
 */
export const quizzes: Quiz[] = QUIZZES_DATA;

export function getQuizById(id: string): Quiz | null {
  return quizzes.find((q: Quiz) => q.id === id) ?? null;
}

export function getQuizByChapterId(chapterId: string): Quiz | null {
  return quizzes.find((q: Quiz) => q.chapterId === chapterId) ?? null;
}
