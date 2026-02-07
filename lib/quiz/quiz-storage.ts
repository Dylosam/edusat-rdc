// lib/quiz/quiz-storage.ts
import type { QuizResult } from "./quiz-engine";

const KEY = "edusat.quizResults.v1";

type Store = Record<string, QuizResult[]>; // chapterId -> results[]

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  const parsed = safeParse<Store>(window.localStorage.getItem(KEY));
  return parsed ?? {};
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
}

export function saveQuizResult(result: QuizResult) {
  const store = readStore();
  const list = store[result.chapterId] ?? [];
  store[result.chapterId] = [result, ...list].slice(0, 50);
  writeStore(store);
}

export function getChapterQuizResults(chapterId: string): QuizResult[] {
  const store = readStore();
  return store[chapterId] ?? [];
}

export function getLastChapterQuizResult(chapterId: string): QuizResult | null {
  const list = getChapterQuizResults(chapterId);
  return list.length ? list[0] : null;
}
