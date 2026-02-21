// lib/progress.ts

export type ChapterStatus = "locked" | "available" | "in_progress" | "completed";

const STORAGE_KEY = "edusat_progress_v1";

/**
 * Shape (MVP localStorage):
 * {
 *   lessons: { "<chapterId>::<lessonId>": true }
 *   quizzes:  { "<quizId>": { completed: true, chapterId: "..." } }
 *   chapters: { "<chapterId>": "completed" | ... }
 * }
 */
type ProgressState = {
  lessons?: Record<string, boolean>;
  quizzes?: Record<string, { completed: boolean; chapterId?: string }>;
  chapters?: Record<string, ChapterStatus>;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage(): ProgressState {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressState) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: ProgressState) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // ✅ notifier l’UI (LessonPage écoute ça)
  window.dispatchEvent(new Event("edustat_progress_updated"));
}

/* ---------------------------
 * Chapters (optionnel MVP)
 * -------------------------- */
export function getChapterStatus(chapterId: string): ChapterStatus {
  const s = readStorage();
  return s.chapters?.[chapterId] ?? "available";
}

export function setChapterStatus(chapterId: string, status: ChapterStatus) {
  const s = readStorage();
  s.chapters = s.chapters ?? {};
  s.chapters[chapterId] = status;
  writeStorage(s);
}

export function markChapterCompleted(chapterId: string) {
  setChapterStatus(chapterId, "completed");
}

/* ---------------------------
 * Lessons
 * -------------------------- */
function lessonKey(chapterId: string, lessonId: string) {
  return `${chapterId}::${lessonId}`;
}

export function isLessonCompleted(chapterId: string, lessonId: string): boolean {
  const s = readStorage();
  return Boolean(s.lessons?.[lessonKey(chapterId, lessonId)]);
}

export function toggleLessonCompleted(chapterId: string, lessonId: string): boolean {
  const s = readStorage();
  s.lessons = s.lessons ?? {};
  const key = lessonKey(chapterId, lessonId);
  const next = !Boolean(s.lessons[key]);
  s.lessons[key] = next;
  writeStorage(s);

  // bonus: si une leçon est complétée, tu peux mettre le chapitre "in_progress"
  if (next && getChapterStatus(chapterId) === "available") {
    setChapterStatus(chapterId, "in_progress");
  }

  return next;
}

/* ---------------------------
 * Quizzes
 * -------------------------- */
export function markQuizCompleted(quizId: string, chapterId?: string) {
  const s = readStorage();
  s.quizzes = s.quizzes ?? {};
  s.quizzes[quizId] = { completed: true, chapterId };
  writeStorage(s);

  // Si tu veux: un quiz réussi peut compléter le chapitre direct
  if (chapterId) {
    markChapterCompleted(chapterId);
  }
}

export function isQuizCompleted(quizId: string): boolean {
  const s = readStorage();
  return Boolean(s.quizzes?.[quizId]?.completed);
}