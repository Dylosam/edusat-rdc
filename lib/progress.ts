// lib/progress.ts
export type ProgressStore = {
  // clé: chapterId, valeur: array de lessonId terminées
  completedByChapter: Record<string, string[]>;
};

const KEY = "edustat_progress_v1";

function safeParse(json: string | null): ProgressStore {
  try {
    if (!json) return { completedByChapter: {} };
    const data = JSON.parse(json);
    if (!data || typeof data !== "object") return { completedByChapter: {} };
    if (!data.completedByChapter || typeof data.completedByChapter !== "object") {
      return { completedByChapter: {} };
    }
    return data as ProgressStore;
  } catch {
    return { completedByChapter: {} };
  }
}

export function getProgressStore(): ProgressStore {
  if (typeof window === "undefined") return { completedByChapter: {} };
  return safeParse(window.localStorage.getItem(KEY));
}

export function setProgressStore(store: ProgressStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
  // Permet aux autres composants de réagir
  window.dispatchEvent(new Event("edustat_progress_updated"));
}

export function isLessonCompleted(chapterId: string, lessonId: string): boolean {
  const store = getProgressStore();
  const list = store.completedByChapter[chapterId] || [];
  return list.includes(lessonId);
}

export function toggleLessonCompleted(chapterId: string, lessonId: string): boolean {
  const store = getProgressStore();
  const list = new Set(store.completedByChapter[chapterId] || []);
  if (list.has(lessonId)) list.delete(lessonId);
  else list.add(lessonId);

  store.completedByChapter[chapterId] = Array.from(list);
  setProgressStore(store);

  return store.completedByChapter[chapterId].includes(lessonId);
}

export function getChapterProgress(chapterId: string, chapterLessonIds: string[]) {
  const store = getProgressStore();
  const done = new Set(store.completedByChapter[chapterId] || []);
  const total = chapterLessonIds.length;
  const completed = chapterLessonIds.filter((id) => done.has(id)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent };
}

// Ajoute à la fin de lib/progress.ts

export function markChapterCompleted(chapterId: string) {
  if (typeof window === "undefined") return;
  const KEY = "edustat_chapters_done_v1";

  const read = () => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const list = new Set(read());
  list.add(chapterId);
  window.localStorage.setItem(KEY, JSON.stringify(Array.from(list)));
  window.dispatchEvent(new Event("edustat_progress_updated"));
}

export function isChapterCompleted(chapterId: string): boolean {
  if (typeof window === "undefined") return false;
  const KEY = "edustat_chapters_done_v1";
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(arr) ? arr.includes(chapterId) : false;
  } catch {
    return false;
  }
}
