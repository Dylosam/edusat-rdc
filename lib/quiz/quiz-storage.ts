// lib/quiz/quiz-storage.ts

import type { QuizResult } from "@/lib/types/quiz";

const KEY_PREFIX = "edusat_quiz_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function keyAnswers(quizId: string) {
  return `${KEY_PREFIX}:answers:${quizId}`;
}

function keyResult(quizId: string) {
  return `${KEY_PREFIX}:result:${quizId}`;
}

function safeGet<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function safeRemove(key: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// Answers
export function saveQuizAnswers(quizId: string, answers: Record<string, any>) {
  safeSet(keyAnswers(quizId), answers ?? {});
}

export function loadQuizAnswers(quizId: string): Record<string, any> | null {
  return safeGet<Record<string, any>>(keyAnswers(quizId));
}

export function clearQuizAnswers(quizId: string) {
  safeRemove(keyAnswers(quizId));
}

// Result
export function saveQuizResult(quizId: string, result: QuizResult) {
  safeSet(keyResult(quizId), result);
}

export function loadQuizResult(quizId: string): QuizResult | null {
  return safeGet<QuizResult>(keyResult(quizId));
}

export function clearQuizResult(quizId: string) {
  safeRemove(keyResult(quizId));
}

export function clearQuizAll(quizId: string) {
  clearQuizAnswers(quizId);
  clearQuizResult(quizId);
}