// lib/progress.ts

export type UserProgress = {
  completedChapters: string[];
  completedQuizzes: string[];
  completedLessons: string[];
};

export type ChapterProgress = {
  chapterId: string;
  totalLessons: number;
  completedLessons: number;
  percent: number; // 0..100
  isCompleted: boolean;
};

const KEY = "edusat_progress";

function emptyProgress(): UserProgress {
  return { completedChapters: [], completedQuizzes: [], completedLessons: [] };
}

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return emptyProgress();

  const raw = localStorage.getItem(KEY);
  if (!raw) return emptyProgress();

  try {
    const parsed = JSON.parse(raw);
    return {
      completedChapters: Array.isArray(parsed?.completedChapters)
        ? parsed.completedChapters.map(String)
        : [],
      completedQuizzes: Array.isArray(parsed?.completedQuizzes)
        ? parsed.completedQuizzes.map(String)
        : [],
      completedLessons: Array.isArray(parsed?.completedLessons)
        ? parsed.completedLessons.map(String)
        : [],
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

/**
 * ✅ Quiz réussi => quiz complété + chapitre validé
 */
export function markQuizCompleted(quizId: string, chapterId: string) {
  const progress = getProgress();

  const qid = String(quizId ?? "");
  const cid = String(chapterId ?? "");

  if (qid && !progress.completedQuizzes.includes(qid)) {
    progress.completedQuizzes.push(qid);
  }

  if (cid && !progress.completedChapters.includes(cid)) {
    progress.completedChapters.push(cid);
  }

  saveProgress(progress);
}

/**
 * 🔁 COMPAT :
 * - isLessonCompleted(lessonId)
 * - isLessonCompleted(anything, lessonId)
 */
export function isLessonCompleted(a: string, b?: string): boolean {
  const lessonId = b ?? a;
  const progress = getProgress();
  return progress.completedLessons.includes(String(lessonId));
}

/**
 * 🔁 COMPAT :
 * - toggleLessonCompleted(lessonId)
 * - toggleLessonCompleted(anything, lessonId)
 *
 * ✅ retourne boolean (nouvel état)
 */
export function toggleLessonCompleted(a: string, b?: string): boolean {
  const lessonId = b ?? a;
  const progress = getProgress();
  const id = String(lessonId);

  let nowCompleted = false;

  if (progress.completedLessons.includes(id)) {
    progress.completedLessons = progress.completedLessons.filter((x) => x !== id);
    nowCompleted = false;
  } else {
    progress.completedLessons.push(id);
    nowCompleted = true;
  }

  saveProgress(progress);
  return nowCompleted;
}

/**
 * ✅ Fonction manquante : utilisée par app/chapters/[id]/page.tsx
 * getChapterProgress(chapterId, lessonIds)
 */
export function getChapterProgress(chapterId: string, lessonIds: string[]): ChapterProgress {
  const progress = getProgress();

  const ids = Array.isArray(lessonIds) ? lessonIds.map(String) : [];
  const totalLessons = ids.length;

  let completedLessons = 0;
  for (const id of ids) {
    if (progress.completedLessons.includes(String(id))) completedLessons += 1;
  }

  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  // un chapitre est "completed" soit parce qu'il est marqué via quiz,
  // soit parce que toutes les leçons sont cochées.
  const isCompleted =
    progress.completedChapters.includes(String(chapterId)) ||
    (totalLessons > 0 && completedLessons === totalLessons);

  return {
    chapterId: String(chapterId),
    totalLessons,
    completedLessons,
    percent,
    isCompleted,
  };
}

/**
 * Helpers optionnels
 */
export function isChapterCompleted(chapterId: string): boolean {
  const progress = getProgress();
  return progress.completedChapters.includes(String(chapterId));
}

export function isQuizCompleted(quizId: string): boolean {
  const progress = getProgress();
  return progress.completedQuizzes.includes(String(quizId));
}

/**
 * ✅ Optionnel : si ton UI a un "progressTick" pour forcer un re-render
 * (tu peux l'utiliser ou pas)
 */
export function bumpProgressTick(prev: number): number {
  return prev + 1;
}
