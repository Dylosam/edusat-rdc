// lib/quiz/quiz-adapter.ts
import type { Quiz as AppQuiz } from "@/lib/types";
import { getQuizById } from "@/lib/data/quizzes";

import type { Quiz as EngineQuiz } from "./quiz-engine";

/**
 * Adaptateur:
 * - Convertit le Quiz "App" (lib/types) vers le Quiz "Engine" (lib/quiz/quiz-engine)
 * - Ne dépend PAS de passPercent car ton type Quiz ne l'a pas.
 */
export function getEngineQuizById(quizId: string): EngineQuiz | null {
  const q: AppQuiz | null = getQuizById(quizId);
  if (!q) return null;

  return {
    id: q.id,
    title: q.title,

    // ✅ ton Quiz App a chapterId, donc on le garde
    chapterId: q.chapterId,

    // ✅ pas de passPercent ici (ton type ne l'a pas)
    // le moteur utilisera 70 par défaut

    questions: q.questions.map((qq) => ({
      id: qq.id,
      type: qq.type,
      question: qq.question,
      options: qq.options,
      correctAnswer: qq.correctAnswer,
      lessonIds: (qq as any).lessonIds ?? [], // au cas où tu l'as dans tes data mais pas dans le type
    })),
  };
}
