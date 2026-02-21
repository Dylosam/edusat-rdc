// lib/progress/quiz.ts
import type { QuizResult } from "@/lib/types";

export function scorePercent(result: QuizResult) {
  if (!result.totalQuestions) return 0;
  return (result.score / result.totalQuestions) * 100;
}

export function isQuizPassed(result: QuizResult, passPercent = 60) {
  return scorePercent(result) >= passPercent;
}