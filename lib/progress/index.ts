// lib/progress/index.ts
import type { Chapter, Progress, QuizResult } from "@/lib/types";

type ChapterStatus = Chapter["status"];

export type ProgressStore = {
  version: 1;
  updatedAt: string;

  // subjectId -> { chapterId -> status }
  chapters: Record<string, Record<string, ChapterStatus>>;

  // quizId -> QuizResult
  quizResults: Record<string, QuizResult>;

  // subjectId -> seconds
  timeSpentBySubject: Record<string, number>;
};

const LS_KEY = "edusat:progress:v1";

function nowISO() {
  return new Date().toISOString();
}

function defaultStore(): ProgressStore {
  return {
    version: 1,
    updatedAt: nowISO(),
    chapters: {},
    quizResults: {},
    timeSpentBySubject: {},
  };
}

export function readProgressStore(): ProgressStore {
  if (typeof window === "undefined") return defaultStore();

  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultStore();

    const parsed = JSON.parse(raw) as ProgressStore;
    if (!parsed || parsed.version !== 1) return defaultStore();

    // sanity
    parsed.chapters ||= {};
    parsed.quizResults ||= {};
    parsed.timeSpentBySubject ||= {};
    parsed.updatedAt ||= nowISO();

    return parsed;
  } catch {
    return defaultStore();
  }
}

export function writeProgressStore(next: ProgressStore) {
  if (typeof window === "undefined") return;
  next.updatedAt = nowISO();
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

export function getChapterStatus(subjectId: string, chapterId: string): ChapterStatus | null {
  const store = readProgressStore();
  return store.chapters?.[subjectId]?.[chapterId] ?? null;
}

export function setChapterStatus(subjectId: string, chapterId: string, status: ChapterStatus) {
  const store = readProgressStore();
  store.chapters[subjectId] ||= {};
  store.chapters[subjectId][chapterId] = status;
  writeProgressStore(store);
}

export function addTimeSpent(subjectId: string, seconds: number) {
  const store = readProgressStore();
  store.timeSpentBySubject[subjectId] ||= 0;
  store.timeSpentBySubject[subjectId] += Math.max(0, Math.floor(seconds));
  writeProgressStore(store);
}

export function saveQuizResult(result: QuizResult) {
  const store = readProgressStore();
  store.quizResults[result.quizId] = result;
  writeProgressStore(store);
}

export function getQuizResult(quizId: string): QuizResult | null {
  const store = readProgressStore();
  return store.quizResults?.[quizId] ?? null;
}

export function computeSubjectProgress(opts: {
  subjectId: string;
  totalChapters: number;
}): Progress {
  const store = readProgressStore();
  const chapterMap = store.chapters[opts.subjectId] || {};

  const chaptersCompleted = Object.values(chapterMap).filter((s) => s === "completed").length;

  // quiz passed = score% >= 60
  const quizResults = Object.values(store.quizResults || {});
  const passedForSubject = quizResults.filter((r) => {
    // on ne sait pas subjectId depuis quizResult -> on filtre via quizId qui contient chapterId,
    // et un chapitre appartient à un subjectId (on le saura au moment du mock-api)
    // => ici on laisse le mock-api faire la granularité exacte.
    return true;
  });

  const totalChapters = opts.totalChapters || 0;

  return {
    subjectId: opts.subjectId,
    chaptersCompleted,
    totalChapters,
    quizzesPassed: passedForSubject.length, // sera recalculé côté mock-api avec filtre réel
    averageScore: 0, // idem mock-api
    timeSpent: store.timeSpentBySubject[opts.subjectId] || 0,
  };
}