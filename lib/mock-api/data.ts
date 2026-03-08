import * as SubjectsModule from "@/lib/mock-data/subjects";
import * as ChaptersModule from "@/lib/mock-data/chapters";
import * as LessonsModule from "@/lib/data/lessons";
import * as QuizzesModule from "@/lib/mock-api/quizzes";

import { readProgressStore } from "@/lib/progress/index";
import { isQuizPassed } from "@/lib/progress/quiz";

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
  quizId?: string;
};

export type Lesson = {
  id: string;
  chapterId: string;
  title: string;
  minutes?: number;
  content?: string;
  katex?: string;
  order?: number;
  summary?: string;
  videoUrl?: string;
};

export type Quiz = {
  id: string;
  chapterId?: string;
  title?: string;
  passMarkPercent?: number;
  questions?: any[];
};

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
  for (const value of Object.values(moduleObj)) {
    if (Array.isArray(value)) return value;
  }

  for (const value of Object.values(moduleObj)) {
    if (value && typeof value === "object") {
      for (const nested of Object.values(value)) {
        if (Array.isArray(nested)) return nested;
      }
    }
  }

  return [];
}

function normalizeSubjects(raw: any[]): Subject[] {
  const arr = Array.isArray(raw) ? raw : [];

  return arr.map((item: AnyObj, idx: number) => {
    const id = toStr(item.id || item.slug || idx);
    const slug = slugify(item.slug || item.id || item.title || item.name || id);
    const title = toStr(item.title || item.name || `Matière ${idx + 1}`);

    return {
      ...item,
      id,
      slug,
      title,
    };
  });
}

function normalizeChapters(raw: any[], subject?: Subject | null): Chapter[] {
  const arr = Array.isArray(raw) ? raw : [];

  const normalized = arr.map((item: AnyObj, idx: number) => ({
    ...item,
    id: toStr(item.id || item.chapterId || idx),
    subjectId: item.subjectId ? toStr(item.subjectId) : subject?.id,
    subjectSlug: item.subjectSlug ? toStr(item.subjectSlug) : subject?.slug,
    title: toStr(item.title || item.name || `Chapitre ${idx + 1}`),
    description: item.description,
    estimatedMinutes: item.estimatedMinutes ?? item.minutes,
    order: item.order ?? idx + 1,
    quizId: item.quizId,
  }));

  return normalized.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

function normalizeLessons(raw: any[], chapterId: string): Lesson[] {
  const arr = Array.isArray(raw) ? raw : [];

  const normalized = arr.map((item: AnyObj, idx: number) => ({
    ...item,
    id: toStr(item.id || item.lessonId || idx),
    chapterId: toStr(item.chapterId || chapterId),
    title: toStr(item.title || item.name || `Leçon ${idx + 1}`),
    minutes: item.minutes ?? item.estimatedMinutes,
    content: item.content,
    katex: item.katex,
    order: item.order ?? idx + 1,
    summary: item.summary,
    videoUrl: item.videoUrl,
  }));

  return normalized.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

export async function getSubjects(): Promise<Subject[]> {
  const raw = pickFirstArray(SubjectsModule as AnyObj);
  return normalizeSubjects(raw);
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  const key = slugify(slug);

  return (
    subjects.find((subject) => slugify(subject.slug) === key) ??
    subjects.find((subject) => slugify(subject.id) === key) ??
    null
  );
}

export async function getChaptersBySubject(subjectIdOrSlug: string): Promise<Chapter[]> {
  const key = slugify(subjectIdOrSlug);

  const subjects = await getSubjects();
  const subject =
    subjects.find(
      (item) => slugify(item.slug) === key || slugify(item.id) === key
    ) ?? null;

  const chaptersRaw = pickFirstArray(ChaptersModule as AnyObj) as AnyObj[];
  const list = Array.isArray(chaptersRaw) ? chaptersRaw : [];

  const filtered = list.filter((chapter) => {
    const subjectId = slugify(chapter?.subjectId);
    const subjectSlug = slugify(chapter?.subjectSlug);

    if (subject) {
      return (
        subjectId === slugify(subject.id) ||
        subjectSlug === slugify(subject.slug)
      );
    }

    return subjectId === key || subjectSlug === key;
  });

  return normalizeChapters(filtered, subject);
}

export async function getChapterById(chapterId: string): Promise<Chapter | null> {
  const target = slugify(chapterId);
  const chaptersRaw = pickFirstArray(ChaptersModule as AnyObj) as AnyObj[];
  const list = Array.isArray(chaptersRaw) ? chaptersRaw : [];

  const found =
    list.find(
      (chapter) =>
        slugify(chapter?.id) === target || slugify(chapter?.chapterId) === target
    ) ?? null;

  if (!found) {
    return null;
  }

  const allSubjects = await getSubjects();

  const subject =
    allSubjects.find(
      (item) =>
        slugify(item.id) === slugify(found?.subjectId) ||
        slugify(item.slug) === slugify(found?.subjectSlug)
    ) ?? null;

  return normalizeChapters([found], subject)[0] ?? null;
}

export async function getLessonsByChapterId(chapterId: string): Promise<Lesson[]> {
  const id = toStr(chapterId);

  const fn = (LessonsModule as AnyObj).getLessonsByChapterId;
  if (typeof fn === "function") {
    const raw = await fn(id);
    return normalizeLessons(raw, id);
  }

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
    for (const lessons of Object.values(map)) {
      if (Array.isArray(lessons)) {
        const found = (lessons as AnyObj[]).find(
          (lesson) =>
            slugify(lesson?.id) === target ||
            slugify(lesson?.lessonId) === target
        );

        if (found) {
          return normalizeLessons(
            [found],
            toStr(found.chapterId || "")
          )[0] ?? null;
        }
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

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const target = slugify(quizId);

  const fn = (QuizzesModule as AnyObj).getQuizById;
  if (typeof fn === "function") {
    return (await fn(quizId)) ?? null;
  }

  const arr = pickFirstArray(QuizzesModule as AnyObj) as AnyObj[];
  const found = (arr || []).find((quiz) => slugify(quiz?.id) === target) ?? null;

  return found ? (found as Quiz) : null;
}

export async function getDashboardSnapshot() {
  const subjects = await getSubjects();

  const store = readProgressStore() as AnyObj;
  const chaptersStatus: AnyObj = store?.chapters ?? store?.chapterStatus ?? {};
  const quizzes: AnyObj = store?.quizzes ?? store?.quizResults ?? {};
  const minutes = Number(store?.stats?.minutesStudied ?? store?.minutesStudied ?? 0);

  const chapterIds = Object.keys(chaptersStatus || {});
  const totalChapters = chapterIds.length;

  const doneChapters = chapterIds.filter((id) => {
    const state = chaptersStatus[id];
    return Boolean(
      state?.completed || state?.isCompleted || state === "done" || state === true
    );
  }).length;

  const progressPercent =
    totalChapters > 0 ? Math.round((doneChapters / totalChapters) * 100) : 0;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const quizEntries = Object.values(quizzes || {}) as AnyObj[];
  const passed = quizEntries.filter((result) => {
    const correct = Number(result?.correct ?? 0);
    const total = Number(result?.total ?? 0);
    const passMark = Number(result?.passMarkPercent ?? 60);
    return isQuizPassed({ correct, total }, passMark);
  }).length;

  const quizPassPercent = quizEntries.length
    ? Math.round((passed / quizEntries.length) * 100)
    : 0;

  return {
    subjectsCount: subjects.length,
    progressPercent,
    studiedTimeLabel: `${hours}h ${mins}m`,
    quizPassPercent,
  };
}

export const getStats = getDashboardSnapshot;