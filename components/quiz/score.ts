// lib/quiz/score.ts
export function computeScore(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}