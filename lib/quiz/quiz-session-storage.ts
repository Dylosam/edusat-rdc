// lib/quiz/quiz-session-storage.ts

const KEY_PREFIX = "edusat_quiz_session_v1";

export type QuizSessionState = {
  quizId: string;

  // timer/session
  startedAt: number; // Date.now() when started
  remainingSec: number; // remaining seconds
  running: boolean;

  // navigation
  currentIndex: number;

  // shuffle persistence
  questionOrder?: string[]; // array of question ids
  optionsOrder?: Record<string, string[]>; // questionId -> options order (strings)

  // last saved
  updatedAt: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function key(quizId: string) {
  return `${KEY_PREFIX}:${quizId}`;
}

function safeGet<T>(k: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(k: string, v: unknown) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

function safeRemove(k: string) {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(k);
  } catch {}
}

export function loadQuizSession(quizId: string): QuizSessionState | null {
  return safeGet<QuizSessionState>(key(quizId));
}

export function saveQuizSession(quizId: string, session: Omit<QuizSessionState, "updatedAt">) {
  safeSet(key(quizId), { ...session, updatedAt: Date.now() } satisfies QuizSessionState);
}

export function clearQuizSession(quizId: string) {
  safeRemove(key(quizId));
}