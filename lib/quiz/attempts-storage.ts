export type QuizAttempt = {
  id: string;
  quizId: string;
  createdAt: number; // Date.now()
  durationSec: number;
  totalScore: number;
  maxScore: number;
  percentage: number; // 0..100
  passed: boolean;
  answers: Record<string, any>;
};

const KEY_PREFIX = "edustat_quiz_attempts_v1:";

function key(quizId: string) {
  return `${KEY_PREFIX}${quizId}`;
}

export function loadAttempts(quizId: string): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(key(quizId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuizAttempt[];
    if (!Array.isArray(parsed)) return [];
    // ✅ normalize + sort newest-first
    return parsed
      .filter((a) => a && a.quizId === quizId)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  } catch {
    return [];
  }
}

export function saveAttempt(quizId: string, attempt: QuizAttempt) {
  const attempts = loadAttempts(quizId);
  const next = [attempt, ...attempts].slice(0, 50); // garde 50 tentatives max (safe)
  try {
    localStorage.setItem(key(quizId), JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function clearAttempts(quizId: string) {
  try {
    localStorage.removeItem(key(quizId));
  } catch {
    // ignore
  }
}

export function getBestAttempt(quizId: string): QuizAttempt | null {
  const attempts = loadAttempts(quizId);
  if (attempts.length === 0) return null;

  let best = attempts[0];
  for (let i = 1; i < attempts.length; i++) {
    const a = attempts[i];
    if ((a.percentage ?? 0) > (best.percentage ?? 0)) best = a;
    // tie-break: plus récent
    if ((a.percentage ?? 0) === (best.percentage ?? 0) && (a.createdAt ?? 0) > (best.createdAt ?? 0)) best = a;
  }
  return best;
}

export function getLastAttempt(quizId: string): QuizAttempt | null {
  const attempts = loadAttempts(quizId);
  if (attempts.length === 0) return null;
  return attempts[0]; // newest-first
}