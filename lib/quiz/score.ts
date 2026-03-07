// lib/quiz/score.ts
import type { QuizQuestion } from "@/lib/types/quiz";

export type QuizResultDetail = {
  questionId: string;
  isCorrect: boolean;
  userAnswer: any;
  correctAnswer: any;
  score: number;
  maxScore: number;
};

export type QuizResult = {
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  details: QuizResultDetail[];
  answers: Record<string, any>;
};

function asArray(v: any): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

function equalsLoose(a: any, b: any): boolean {
  // compare arrays ignoring order (for multiple choice)
  if (Array.isArray(a) && Array.isArray(b)) {
    const A = a.map(String).sort();
    const B = b.map(String).sort();
    if (A.length !== B.length) return false;
    for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return false;
    return true;
  }
  return String(a ?? "") === String(b ?? "");
}

/**
 * ✅ computeQuizResult
 * - passMarkPercent: ex 70
 * - score: 1 point par question (MVP)
 */
export function computeQuizResult(
  questions: QuizQuestion[],
  answers: Record<string, any>,
  passMarkPercent = 70
): QuizResult {
  const details: QuizResultDetail[] = [];

  let totalScore = 0;
  let maxScore = 0;

  for (const q of questions) {
    const userAnswer = answers[q.id];
    const correctAnswer: any = (q as any).correctAnswer;

    const max = 1;
    let score = 0;

    if (q.type === "multiple_choice") {
      const ua = asArray(userAnswer);
      const ca = asArray(correctAnswer);
      score = equalsLoose(ua, ca) ? 1 : 0;
    } else {
      score = equalsLoose(userAnswer, correctAnswer) ? 1 : 0;
    }

    totalScore += score;
    maxScore += max;

    details.push({
      questionId: q.id,
      isCorrect: score === 1,
      userAnswer,
      correctAnswer,
      score,
      maxScore: max,
    });
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = percentage >= passMarkPercent;

  return {
    totalScore,
    maxScore,
    percentage,
    passed,
    details,
    answers,
  };
}