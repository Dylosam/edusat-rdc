// lib/study/quiz-link.ts
import { mockQuizzes } from "@/lib/mock-api/quizzes";

export type QuizLike = {
  id: string | number;
  chapterId?: string;
  questions?: Array<{
    id: string;
    // ✅ optionnel : si tu veux pointer vers une leçon précise
    // ex: lessonId: "alg-deriv-01" (id venant de lib/data/lessons.ts)
    lessonId?: string;
  }>;
};

export function findQuizByChapterId(chapterId: string): QuizLike | null {
  const quizzes = mockQuizzes as unknown as QuizLike[];
  return quizzes.find((q) => String(q.chapterId) === String(chapterId)) ?? null;
}

export function getQuizIdByChapterId(chapterId: string): string | null {
  const q = findQuizByChapterId(chapterId);
  if (!q?.id) return null;
  return String(q.id);
}

/**
 * ✅ Optionnel: si tes questions ont un champ `lessonId`,
 * on peut renvoyer la leçon à réviser quand une question est fausse.
 */
export function getLessonIdFromQuestion(
  chapterId: string,
  questionId: string
): string | null {
  const quiz = findQuizByChapterId(chapterId);
  const q = quiz?.questions?.find((x) => String(x.id) === String(questionId));
  return q?.lessonId ? String(q.lessonId) : null;
}