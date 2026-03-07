// lib/study/progress.ts

export type AnyStudyStep = { id: string; kind?: string };

type ChapterStudyRecord = {
  done?: Record<string, boolean>;
  lastActiveStepId?: string;
  updatedAt?: number;
};

type StudyStore = {
  chapters?: Record<string, ChapterStudyRecord>;
  version?: number;
};

const KEY = "edustat_study_v1";
const VERSION = 2; // ✅ bump version pour marquer le changement de logique

function safeRead(): StudyStore {
  if (typeof window === "undefined") return { version: VERSION, chapters: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { version: VERSION, chapters: {} };
    const parsed = JSON.parse(raw) as StudyStore;
    if (!parsed || typeof parsed !== "object") return { version: VERSION, chapters: {} };
    parsed.chapters = parsed.chapters ?? {};
    parsed.version = parsed.version ?? VERSION;
    return parsed;
  } catch {
    return { version: VERSION, chapters: {} };
  }
}

function safeWrite(next: StudyStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("edustat_study_updated"));
}

function getChapterRecord(chapterId: string): ChapterStudyRecord {
  const store = safeRead();
  return store.chapters?.[chapterId] ?? { done: {}, updatedAt: Date.now() };
}

function setChapterRecord(chapterId: string, record: ChapterStudyRecord) {
  const store = safeRead();
  const chapters = store.chapters ?? {};
  chapters[chapterId] = { ...record, updatedAt: Date.now() };
  safeWrite({ ...store, version: VERSION, chapters });
}

export function getChapterStudyState(chapterId: string, steps: AnyStudyStep[]) {
  const rec = getChapterRecord(chapterId);
  const doneMap = rec.done ?? {};

  const total = steps.length;
  const doneCount = steps.reduce((acc, s) => acc + (doneMap[s.id] ? 1 : 0), 0);
  const progressPercent = total > 0 ? (doneCount / total) * 100 : 0;

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
 * ✅ Validations = juste un marqueur perso (pas de verrouillage).
 */
export function markStepDone(chapterId: string, stepId: string) {
  const rec = getChapterRecord(chapterId);
  const done = rec.done ?? {};
  done[stepId] = true;
  setChapterRecord(chapterId, { ...rec, done, lastActiveStepId: stepId });
}

/**
 * ✅ FREE NAVIGATION:
 * - Tout est toujours accessible
 * - EduStat = consolidation / ciblage des faiblesses, pas un parcours imposé
 */
export function isStepUnlocked(_chapterId: string, _stepId: string, _steps: AnyStudyStep[]) {
  return true;
}

/**
 * ✅ Resume (sans notion unlock):
 * - Reprendre sur la 1ère étape non validée
 * - Sinon lastActive
 * - Sinon dernière étape
 */
export function getResumeStepId(chapterId: string, steps: AnyStudyStep[]) {
  const rec = getChapterRecord(chapterId);
  const done = rec.done ?? {};

  const firstNotDone = steps.find((s) => !done[s.id]);
  if (firstNotDone) return firstNotDone.id;

  if (rec.lastActiveStepId) return rec.lastActiveStepId;

  return steps[steps.length - 1]?.id ?? "intro";
}

export function resetChapterStudyState(chapterId: string) {
  const store = safeRead();
  const chapters = store.chapters ?? {};
  delete chapters[chapterId];
  safeWrite({ ...store, version: VERSION, chapters });
}