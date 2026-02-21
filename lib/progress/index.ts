// lib/progress/index.ts

export type ChapterStatus = "not-started" | "in-progress" | "completed";

export type ProgressStore = {
  chapterStatusBySubject?: Record<string, Record<string, ChapterStatus>>;
  lessonDoneByChapter?: Record<string, Record<string, boolean>>;
  quizResults?: Record<string, any>;
  timeSpentBySubject?: Record<string, number>;
};

const KEY = "edustat_progress_v1";

export function readProgressStore(): ProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

function writeProgressStore(next: ProgressStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("edustat_progress_updated"));
}

// -----------------------
// Chapter status
// -----------------------
export function getChapterStatus(subjectId: string, chapterId: string): ChapterStatus | null {
  const store = readProgressStore();
  return store.chapterStatusBySubject?.[subjectId]?.[chapterId] ?? null;
}

export function setChapterStatus(subjectId: string, chapterId: string, status: ChapterStatus) {
  const store = readProgressStore();
  const bySubject = store.chapterStatusBySubject ?? {};
  const subjectMap = bySubject[subjectId] ?? {};
  subjectMap[chapterId] = status;
  bySubject[subjectId] = subjectMap;
  writeProgressStore({ ...store, chapterStatusBySubject: bySubject });
}

// -----------------------
// Lessons completion
// -----------------------
export function isLessonCompleted(chapterId: string, lessonId: string): boolean {
  const store = readProgressStore();
  return !!store.lessonDoneByChapter?.[chapterId]?.[lessonId];
}

export function toggleLessonCompleted(chapterId: string, lessonId: string): boolean {
  const store = readProgressStore();
  const byChapter = store.lessonDoneByChapter ?? {};
  const chapterMap = byChapter[chapterId] ?? {};

  const nextVal = !chapterMap[lessonId];
  chapterMap[lessonId] = nextVal;
  byChapter[chapterId] = chapterMap;

  writeProgressStore({ ...store, lessonDoneByChapter: byChapter });
  return nextVal;
}

export function getChapterProgress(chapterId: string, lessonIds: string[]) {
  const store = readProgressStore();
  const doneMap = store.lessonDoneByChapter?.[chapterId] ?? {};

  const totalLessons = lessonIds.length;
  const completedLessons = lessonIds.reduce((acc, id) => acc + (doneMap[id] ? 1 : 0), 0);

  return {
    chapterId,
    totalLessons,
    completedLessons,
    isCompleted: totalLessons > 0 && completedLessons === totalLessons,
  };
}

// -----------------------
// Quiz results
// -----------------------
export function saveQuizResult(result: any) {
  const store = readProgressStore();
  const qr = store.quizResults ?? {};
  qr[String(result.quizId)] = result;
  writeProgressStore({ ...store, quizResults: qr });
}