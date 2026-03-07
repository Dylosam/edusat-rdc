// lib/study/progress.ts
// Progression "study" (steps) par chapitre — localStorage first (MVP solide)

export type StudyStep = {
  id: string;
  title?: string;
  type?: string;
};

type ChapterStudyRecord = {
  // steps done map
  done?: Record<string, boolean>;
  // last focused/visited step
  lastActiveStepId?: string;
  // when updated
  updatedAt?: number;
};

type StudyStore = {
  chapters?: Record<string, ChapterStudyRecord>;
  version?: number;
};

const KEY = "edustat_study_v1";
const VERSION = 1;

function safeRead(): StudyStore {
  if (typeof window === "undefined") return { version: VERSION, chapters: {} };

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { version: VERSION, chapters: {} };

    const parsed = JSON.parse(raw) as StudyStore;
    // migration guard (simple)
    if (!parsed || typeof parsed !== "object") return { version: VERSION, chapters: {} };
    if (!parsed.chapters) parsed.chapters = {};
    parsed.version = parsed.version ?? VERSION;
    return parsed;
  } catch {
    return { version: VERSION, chapters: {} };
  }
}

function safeWrite(next: StudyStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
  // utile si tu veux écouter globalement la progression
  window.dispatchEvent(new Event("edustat_study_updated"));
}

function getChapterRecord(chapterId: string): ChapterStudyRecord {
  const store = safeRead();
  const chapters = store.chapters ?? {};
  return chapters[chapterId] ?? { done: {}, updatedAt: Date.now() };
}

function setChapterRecord(chapterId: string, record: ChapterStudyRecord) {
  const store = safeRead();
  const chapters = store.chapters ?? {};
  chapters[chapterId] = { ...record, updatedAt: Date.now() };
  safeWrite({ ...store, version: VERSION, chapters });
}

/**
 * Calcule l’état complet du chapitre pour l’UI.
 */
export function getChapterStudyState(chapterId: string, steps: StudyStep[]) {
  const rec = getChapterRecord(chapterId);
  const doneMap = rec.done ?? {};

  const total = steps.length;
  const doneCount = steps.reduce((acc, s) => acc + (doneMap[s.id] ? 1 : 0), 0);
  const progressPercent = total > 0 ? (doneCount / total) * 100 : 0;

  // meta: tu peux enrichir via buildStudySteps() ou ailleurs
  const meta = {
    title: "Chapitre",
    estimatedMinutes: 2,
    subjectLabel: "Matière",
  };

  return {
    chapterId,
    meta,
    steps,
    doneMap,
    doneCount,
    totalCount: total,
    progressPercent,
    lastActiveStepId: rec.lastActiveStepId ?? null,
  };
}

/**
 * Marque une étape comme terminée.
 */
export function markStepDone(chapterId: string, stepId: string) {
  const rec = getChapterRecord(chapterId);
  const done = rec.done ?? {};
  done[stepId] = true;
  setChapterRecord(chapterId, { ...rec, done, lastActiveStepId: stepId });
}

/**
 * Pour garder un “focus” stable si tu veux (optionnel)
 */
export function setLastActiveStep(chapterId: string, stepId: string) {
  const rec = getChapterRecord(chapterId);
  setChapterRecord(chapterId, { ...rec, lastActiveStepId: stepId });
}

/**
 * “Reprendre” = première étape non faite et débloquée.
 * Si tout est fait -> dernière (ou première).
 */
export function getResumeStepId(chapterId: string, steps: StudyStep[]) {
  const rec = getChapterRecord(chapterId);
  const done = rec.done ?? {};

  // reprendre sur la 1ère étape non terminée
  const firstUndone = steps.find((s) => !done[s.id]);
  if (firstUndone) return firstUndone.id;

  // tout terminé -> revenir sur la dernière visitée, sinon dernière step, sinon "intro"
  if (rec.lastActiveStepId) return rec.lastActiveStepId;
  return steps[steps.length - 1]?.id ?? "intro";
}

/**
 * Unlock rule (simple et fiable) :
 * - Step 0 toujours unlocked
 * - Step i unlocked si step i-1 est done
 *
 * Ça garantit “avance étape par étape”.
 */
export function isStepUnlocked(chapterId: string, stepId: string, steps: StudyStep[]) {
  const rec = getChapterRecord(chapterId);
  const done = rec.done ?? {};

  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx <= 0) return true; // step 0 ou non trouvé
  const prevId = steps[idx - 1]?.id;
  if (!prevId) return true;
  return done[prevId] === true;
}

/**
 * Reset complet du chapitre (toutes les steps + lastActive)
 */
export function resetChapterStudyState(chapterId: string) {
  const store = safeRead();
  const chapters = store.chapters ?? {};
  delete chapters[chapterId];
  safeWrite({ ...store, version: VERSION, chapters });
}