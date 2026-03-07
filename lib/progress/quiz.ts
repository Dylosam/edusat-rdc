// lib/progress/quiz.ts

/**
 * Retourne le score en pourcentage (0-100)
 */
export function scorePercent(input: { correct?: number; total?: number } | null | undefined): number {
  const correct = Number(input?.correct ?? 0);
  const total = Number(input?.total ?? 0);
  if (!total || total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Détermine si un quiz est "réussi"
 * - Par défaut: 60% minimum
 */
export function isQuizPassed(
  input: { correct?: number; total?: number } | null | undefined,
  passMarkPercent = 60
): boolean {
  return scorePercent(input) >= passMarkPercent;
}