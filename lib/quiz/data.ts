// lib/quiz/data.ts
import type { Quiz } from "@/lib/types/quiz";
import { mockQuizzes } from "@/lib/mock-api/quizzes";

/**
 * ✅ Règle d'or:
 * - L'URL /quiz/[id] DOIT recevoir exactement quiz.id
 * - Le storage (answers/result/session) utilise exactement ce même id
 *
 * Donc ici: aucun "normalize", aucun "strip", aucun fallback slug.
 */
export async function getQuizById(id: string): Promise<Quiz | null> {
  const cleanId = decodeURIComponent(String(id ?? "")).trim();

  if (!cleanId) return null;

  const found = (mockQuizzes as Quiz[]).find((q) => q.id === cleanId);
  return found ?? null;
}

/**
 * Optionnel: utilitaire pour vérifier rapidement si un quiz existe.
 * (peut t'aider dans le Hub / chapitre pour éviter des routes cassées)
 */
export function quizExists(id: string): boolean {
  const cleanId = decodeURIComponent(String(id ?? "")).trim();
  if (!cleanId) return false;
  return (mockQuizzes as Quiz[]).some((q) => q.id === cleanId);
}

/**
 * Optionnel: récupérer un quiz par chapterId (si tu veux un mapping automatique).
 * Attention: si un chapitre peut avoir plusieurs quiz, adapte la logique.
 */
export function getQuizByChapterId(chapterId: string): Quiz | null {
  const clean = decodeURIComponent(String(chapterId ?? "")).trim();
  if (!clean) return null;

  const found = (mockQuizzes as Quiz[]).find((q) => q.chapterId === clean);
  return found ?? null;
}