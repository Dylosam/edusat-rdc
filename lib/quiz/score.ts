// lib/quiz/score.ts
import type { QuizQuestion } from "../types/quiz";
import { gradeQuestion } from "./grading";

export interface QuizResultDetail {
  questionId: string;
  isCorrect: boolean;
  score: number;
}

export interface QuizResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  details: QuizResultDetail[];
}

export function computeQuizResult(
  questions: QuizQuestion[],
  userAnswers: Record<string, any>,
  passMarkPercent = 50
): QuizResult {
  let totalScore = 0;
  let maxScore = 0;

  const details: QuizResultDetail[] = questions.map((q) => {
    const { isCorrect, score } = gradeQuestion(q, userAnswers[q.id]);
    const pts = q.points ?? 1;

    maxScore += pts;
    totalScore += score;

    return { questionId: q.id, isCorrect, score };
  });

  const percentage = maxScore === 0 ? 0 : (totalScore / maxScore) * 100;

  return {
    totalScore,
    maxScore,
    percentage,
    passed: percentage >= passMarkPercent,
    details,
  };
}
