// lib/quiz/grading.ts
import type { QuizQuestion } from "../types/quiz";

function normalizeText(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeArray(arr: any[]) {
  return (arr ?? [])
    .map((x) => normalizeText(x))
    .filter(Boolean)
    .sort();
}

export function gradeQuestion(
  question: QuizQuestion,
  userAnswer: any
): { isCorrect: boolean; score: number } {
  const points = question.points ?? 1;

  switch (question.type) {
    case "single_choice":
    case "true_false": {
      const ok =
        normalizeText(userAnswer) === normalizeText(question.correctAnswer);
      return { isCorrect: ok, score: ok ? points : 0 };
    }

    case "multiple_choice": {
      const correct = normalizeArray(question.correctAnswer as string[]);
      const user = normalizeArray(Array.isArray(userAnswer) ? userAnswer : []);
      const ok =
        correct.length === user.length &&
        correct.every((val, i) => val === user[i]);
      return { isCorrect: ok, score: ok ? points : 0 };
    }

    case "numeric": {
      const tolerance = 0.01;
      const ua = Number(userAnswer);
      const ca = Number(question.correctAnswer);

      if (!Number.isFinite(ua) || !Number.isFinite(ca)) {
        return { isCorrect: false, score: 0 };
      }
      const ok = Math.abs(ua - ca) <= tolerance;
      return { isCorrect: ok, score: ok ? points : 0 };
    }

    case "text": {
      const ok =
        normalizeText(userAnswer) === normalizeText(question.correctAnswer);
      return { isCorrect: ok, score: ok ? points : 0 };
    }

    default:
      return { isCorrect: false, score: 0 };
  }
}
