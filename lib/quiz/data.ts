// lib/quiz/data.ts
import type { Quiz } from "@/lib/types/quiz";
import { adaptQuiz } from "@/lib/quiz/quiz-adapter";
import { quizzes as RAW_QUIZZES } from "@/lib/data/quizzes";

function norm(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function matchesAnyId(raw: any, idLike: string) {
  const target = norm(idLike);
  if (!target) return false;

  const candidates = [
    raw?.id,
    raw?._id,
    raw?.quizId,
    raw?.slug,
    raw?.code,
    raw?.ref,
    raw?.chapterId ? `quiz-${raw.chapterId}` : null,
    raw?.chapterId,
  ]
    .filter(Boolean)
    .map(norm);

  const targetVariants = Array.from(
    new Set([
      target,
      target.replace(/^quiz-/, ""),
      target.replace(/^chapter-/, ""),
      `quiz-${target}`,
      `quiz-${target.replace(/^quiz-/, "")}`,
      `quiz-${target.replace(/^chapter-/, "")}`,
      `chapter-${target}`,
      `chapter-${target.replace(/^quiz-/, "")}`,
    ])
  );

  return targetVariants.some((t) => candidates.includes(t));
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const arr = Array.isArray(RAW_QUIZZES) ? RAW_QUIZZES : [];
  return arr.map((q: any) => adaptQuiz(q));
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  if (!id?.trim()) return null;
  const arr = Array.isArray(RAW_QUIZZES) ? RAW_QUIZZES : [];
  const found = arr.find((q: any) => matchesAnyId(q, id));
  return found ? adaptQuiz(found) : null;
}

export async function getQuizByChapterId(chapterId: string): Promise<Quiz | null> {
  if (!chapterId?.trim()) return null;
  const arr = Array.isArray(RAW_QUIZZES) ? RAW_QUIZZES : [];
  const found = arr.find(
    (q: any) => matchesAnyId(q, `quiz-${chapterId}`) || matchesAnyId(q, chapterId)
  );
  return found ? adaptQuiz(found) : null;
}

export async function hasQuiz(idOrChapterId: string): Promise<boolean> {
  const q1 = await getQuizById(idOrChapterId);
  if (q1) return true;
  const q2 = await getQuizByChapterId(idOrChapterId);
  return !!q2;
}