// lib/quiz/quiz-storage.ts

const ANSWERS_KEY = (quizId: string) => `edusat_quiz_answers:${quizId}`;
const RESULT_KEY = (quizId: string) => `edusat_quiz_result:${quizId}`;

export function saveQuizAnswers(quizId: string, answers: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ANSWERS_KEY(String(quizId)), JSON.stringify(answers ?? {}));
}

export function loadQuizAnswers(quizId: string): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ANSWERS_KEY(String(quizId)));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearQuizAnswers(quizId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ANSWERS_KEY(String(quizId)));
}

export function saveQuizResult(quizId: string, result: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RESULT_KEY(String(quizId)), JSON.stringify(result ?? null));
}

export function loadQuizResult(quizId: string): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(RESULT_KEY(String(quizId)));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearQuizResult(quizId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RESULT_KEY(String(quizId)));
}
