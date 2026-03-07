// lib/mock-api/data.ts
// ✅ “Back to normal” data gateway (subjects + chapters + lessons + quiz + dashboard)

import * as SubjectsModule from "@/lib/mock-data/subjects";
import * as ChaptersModule from "@/lib/mock-data/chapters";
import * as LessonsModule from "@/lib/data/lessons";
import * as QuizzesModule from "@/lib/mock-api/quizzes";

import { readProgressStore } from "@/lib/progress/index";
import { isQuizPassed, scorePercent } from "@/lib/progress/quiz";

type AnyObj = Record<string, any>;

export type Subject = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  level?: string;
  icon?: string;
  color?: string;
};

export type Chapter = {
  id: string;
  subjectId?: string;
  subjectSlug?: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  order?: number;
};

export type Lesson = {
  id: string;
  chapterId: string;
  title: string;
  minutes?: number;
  content?: string;
  katex?: string;
  order?: number;
};

export type Quiz = {
  id: string;
  chapterId?: string;
  title?: string;
  passMarkPercent?: number;
  questions?: any[];
};

// -------------------- helpers --------------------

function toStr(x: any): string {
  return String(x ?? "").trim();
}

function slugify(s: string): string {
  return toStr(s)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

function pickFirstArray(moduleObj: AnyObj): any[] {
  // 1) direct array exports
  for (const v of Object.values(moduleObj)) {
    if (Array.isArray(v)) return v;
  }
  // 2) object exports containing an array
  for (const v of Object.values(moduleObj)) {
    if (v && typeof v === "object") {
      for (const vv of Object.values(v)) {
        if (Array.isArray(vv)) return vv;
      }
    }
  }
  return [];
}

function normalizeSubjects(raw: any[]): Subject[] {
  const arr = Array.isArray(raw) ? raw : [];

  return arr.map((x: AnyObj, idx: number) => {
    const id = toStr(x.id || x.slug || idx);
    const slug = slugify(x.slug || x.id || x.title || x.name || id);
    const title = toStr(x.title || x.name || `Matière ${idx + 1}`);

    return { id, slug, title, ...x };
  });
}

function normalizeChapters(raw: any[], subject?: Subject | null): Chapter[] {
  const arr = Array.isArray(raw) ? raw : [];

  const out = arr.map((x: AnyObj, idx: number) => ({
    id: toStr(x.id || x.chapterId || idx),
    subjectId: x.subjectId ? toStr(x.subjectId) : subject?.id,
    subjectSlug: x.subjectSlug ? toStr(x.subjectSlug) : subject?.slug,
    title: toStr(x.title || x.name || `Chapitre ${idx + 1}`),
    description: x.description,
    estimatedMinutes: x.estimatedMinutes ?? x.minutes,
    order: x.order ?? idx + 1,
    ...x,
  }));

  return out.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

function normalizeLessons(raw: any[], chapterId: string): Lesson[] {
  const arr = Array.isArray(raw) ? raw : [];

  const out = arr.map((x: AnyObj, idx: number) => ({
    id: toStr(x.id || x.lessonId || idx),
    chapterId: toStr(x.chapterId || chapterId),
    title: toStr(x.title || x.name || `Leçon ${idx + 1}`),
    minutes: x.minutes ?? x.estimatedMinutes,
    content: x.content,
    katex: x.katex,
    order: x.order ?? idx + 1,
    ...x,
  }));

  return out.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

// -------------------- SUBJECTS --------------------

export async function getSubjects(): Promise<Subject[]> {
  const raw = pickFirstArray(SubjectsModule as AnyObj);
  return normalizeSubjects(raw);
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  const key = slugify(slug);

  return (
    subjects.find((s) => slugify(s.slug) === key) ??
    subjects.find((s) => slugify(s.id) === key) ??
    null
  );
}

// -------------------- CHAPTERS --------------------

/**
 * ✅ attendu par app/subjects/[slug]/page.tsx
 */
export async function getChaptersBySubject(subjectIdOrSlug: string): Promise<Chapter[]> {
  const key = slugify(subjectIdOrSlug);

  const subjects = await getSubjects();
  const subject =
    subjects.find((s) => slugify(s.slug) === key || slugify(s.id) === key) ?? null;

  // Chapters source = lib/mock-data/chapters.ts
  const chaptersRaw = pickFirstArray(ChaptersModule as AnyObj) as AnyObj[];
  const list = Array.isArray(chaptersRaw) ? chaptersRaw : [];

  // Filtrage robuste:
  // - subjectSlug == slug
  // - subjectId == id
  const filtered = list.filter((c) => {
    const sid = slugify(c?.subjectId);
    const sslug = slugify(c?.subjectSlug);

    if (subject) {
      return sid === slugify(subject.id) || sslug === slugify(subject.slug);
    }
    // fallback si on n’a pas trouvé le subject
    return sid === key || sslug === key;
  });

  return normalizeChapters(filtered, subject);
}

export async function getChapterById(chapterId: string): Promise<Chapter | null> {
  const id = slugify(chapterId);
  const chaptersRaw = pickFirstArray(ChaptersModule as AnyObj) as AnyObj[];
  const list = Array.isArray(chaptersRaw) ? chaptersRaw : [];

  const found =
    list.find((c) => slugify(c?.id) === id || slugify(c?.chapterId) === id) ?? null;

  if (!found) return null;

  // complète subject info si possible
  const subjectSlug = toStr(found?.subjectSlug);
  const subject = subjectSlug ? await getSubjectBySlug(subjectSlug) : null;

  return normalizeChapters([found], subject)[0] ?? null;
}

// -------------------- LESSONS --------------------

export async function getLessonsByChapterId(chapterId: string): Promise<Lesson[]> {
  const id = toStr(chapterId);

  // 1) si le module expose une fonction
  const fn = (LessonsModule as AnyObj).getLessonsByChapterId;
  if (typeof fn === "function") {
    const raw = await fn(id);
    return normalizeLessons(raw, id);
  }

  // 2) si le module expose une map
  const map =
    (LessonsModule as AnyObj).lessonsByChapter ??
    (LessonsModule as AnyObj).LESSONS_BY_CHAPTER ??
    null;

  if (map && typeof map === "object" && Array.isArray(map[id])) {
    return normalizeLessons(map[id], id);
  }

  return [];
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  const target = slugify(lessonId);

  const map =
    (LessonsModule as AnyObj).lessonsByChapter ??
    (LessonsModule as AnyObj).LESSONS_BY_CHAPTER ??
    null;

  if (map && typeof map === "object") {
    for (const arr of Object.values(map)) {
      if (Array.isArray(arr)) {
        const found = (arr as AnyObj[]).find(
          (l) => slugify(l?.id) === target || slugify(l?.lessonId) === target
        );
        if (found) return normalizeLessons([found], toStr(found.chapterId || ""))[0] ?? null;
      }
    }
  }

  const fn = (LessonsModule as AnyObj).getLessonById;
  if (typeof fn === "function") {
    const raw = await fn(lessonId);
    if (!raw) return null;
    return normalizeLessons([raw], toStr(raw.chapterId || ""))[0] ?? null;
  }

  return null;
}

// -------------------- QUIZZES --------------------

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const target = slugify(quizId);

  const fn = (QuizzesModule as AnyObj).getQuizById;
  if (typeof fn === "function") {
    return (await fn(quizId)) ?? null;
  }

  const arr = pickFirstArray(QuizzesModule as AnyObj) as AnyObj[];
  const found = (arr || []).find((q) => slugify(q?.id) === target) ?? null;

  return found ? (found as Quiz) : null;
}

// -------------------- DASHBOARD / STATS --------------------

export async function getDashboardSnapshot() {
  const subjects = await getSubjects();

  const store = readProgressStore() as AnyObj;
  const chaptersStatus: AnyObj = store?.chapters ?? store?.chapterStatus ?? {};
  const quizzes: AnyObj = store?.quizzes ?? store?.quizResults ?? {};
  const minutes = Number(store?.stats?.minutesStudied ?? store?.minutesStudied ?? 0);

  const chapterIds = Object.keys(chaptersStatus || {});
  const totalChapters = chapterIds.length;

  const doneChapters = chapterIds.filter((id) => {
    const s = chaptersStatus[id];
    return Boolean(s?.completed || s?.isCompleted || s === "done" || s === true);
  }).length;

  const progressPercent = totalChapters > 0 ? Math.round((doneChapters / totalChapters) * 100) : 0;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const quizEntries = Object.values(quizzes || {}) as AnyObj[];
  const passed = quizEntries.filter((r) => {
    const correct = Number(r?.correct ?? 0);
    const total = Number(r?.total ?? 0);
    const passMark = Number(r?.passMarkPercent ?? 60);
    return isQuizPassed({ correct, total }, passMark);
  }).length;

  const quizPassPercent = quizEntries.length ? Math.round((passed / quizEntries.length) * 100) : 0;

  return {
    subjectsCount: subjects.length,
    progressPercent,
    studiedTimeLabel: `${hours}h ${mins}m`,
    quizPassPercent,
  };
}

// Alias rétro-compat si ton dashboard utilise encore getStats()
export const getStats = getDashboardSnapshot;