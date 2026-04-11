import { readProgressStore } from "@/lib/progress/index";
import { isQuizPassed } from "@/lib/progress/quiz";

import { subjects } from "@/lib/mock-data/subjects";
import { chapters } from "@/lib/mock-data/chapters";
import { lessonsByChapter } from "@/lib/data/lessons";
import * as QuizzesModule from "@/lib/mock-api/quizzes";

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

export type LessonContentBlock =
  | { type: "text"; value: string }
  | { type: "tip"; value: string }
  | { type: "example"; title?: string; value: string }
  | { type: "formula"; value: string }
  | {
      type: "richText";
      segments: Array<
        | { type: "text"; value: string }
        | { type: "math"; value: string }
      >;
    }
  | {
      type: "solutionSteps";
      title?: string;
      steps: string[];
    }
  | {
      type: "exercise";
      title: string;
      prompt: string;
      choices: string[];
      correctChoiceIndex: number;
      hint?: string;
      solutionSteps?: string[];
    };

export type Lesson = {
  id: string;
  chapterId: string;
  title: string;
  minutes?: number;
  order?: number;
  summary?: string;
  videoUrl?: string;
  contentBlocks?: LessonContentBlock[];
};

export type Quiz = {
  id: string;
  chapterId?: string;
  title?: string;
  passMarkPercent?: number;
  questions?: any[];
};

function toStr(value: unknown): string {
  return String(value ?? "").trim();
}

function slugify(value: unknown): string {
  return toStr(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

function safeArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getSubjectsRaw(): AnyObj[] {
  return subjects as AnyObj[];
}

function getChaptersRaw(): AnyObj[] {
  return chapters as AnyObj[];
}

function getLessonsMap(): Record<string, AnyObj[]> {
  return lessonsByChapter as Record<string, AnyObj[]>;
}

function normalizeSubject(item: AnyObj, index: number): Subject {
  const id = toStr(item.id || item.slug || `subject-${index + 1}`);
  const slug = slugify(item.slug || item.id || item.title || item.name || id);
  const title = toStr(item.title || item.name || `Matière ${index + 1}`);

  return {
    ...item,
    id,
    slug,
    title,
    description: item.description,
    level: item.level,
    icon: item.icon,
    color: item.color,
  };
}

function normalizeChapter(
  item: AnyObj,
  index: number,
  subject?: Subject | null
): Chapter {
  return {
    ...item,
    id: toStr(item.id || item.chapterId || `chapter-${index + 1}`),
    subjectId: toStr(item.subjectId || subject?.id || ""),
    subjectSlug: toStr(item.subjectSlug || subject?.slug || ""),
    title: toStr(item.title || item.name || `Chapitre ${index + 1}`),
    description: item.description,
    estimatedMinutes:
      Number(item.estimatedMinutes ?? item.minutes ?? 0) || undefined,
    order: Number(item.order ?? index + 1),
    quizId: item.quizId ? toStr(item.quizId) : undefined,
  };
}

function normalizeLesson(item: AnyObj, index: number, chapterId: string): Lesson {
  return {
    ...item,
    id: toStr(item.id || item.lessonId || `lesson-${index + 1}`),
    chapterId: toStr(item.chapterId || chapterId),
    title: toStr(item.title || item.name || `Leçon ${index + 1}`),
    minutes: Number(item.minutes ?? item.estimatedMinutes ?? item.durationMin ?? 0) || undefined,
    contentBlocks: Array.isArray(item.content)
      ? item.content
      : Array.isArray(item.contentBlocks)
      ? item.contentBlocks
      : Array.isArray(item.blocks)
      ? item.blocks
      : [],
    order: Number(item.order ?? index + 1),
    summary: item.summary,
    videoUrl: item.videoUrl,
  };
}

function normalizeQuiz(item: AnyObj): Quiz {
  return {
    ...item,
    id: toStr(item.id),
    chapterId: item.chapterId ? toStr(item.chapterId) : undefined,
    title: item.title ? toStr(item.title) : undefined,
    passMarkPercent:
      Number(item.passMarkPercent ?? item.passingScore ?? item.passScore ?? 60) || 60,
    questions: safeArray(item.questions),
  };
}

export async function getSubjects(): Promise<Subject[]> {
  return getSubjectsRaw().map(normalizeSubject);
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const key = slugify(slug);
  const list = await getSubjects();

  return (
    list.find((subject) => slugify(subject.slug) === key) ??
    list.find((subject) => slugify(subject.id) === key) ??
    null
  );
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const key = slugify(id);
  const list = await getSubjects();

  return list.find((subject) => slugify(subject.id) === key) ?? null;
}

export async function getChaptersBySubject(subjectIdOrSlug: string): Promise<Chapter[]> {
  const key = slugify(subjectIdOrSlug);
  const subjectList = await getSubjects();

  const subject =
    subjectList.find(
      (item) => slugify(item.id) === key || slugify(item.slug) === key
    ) ?? null;

  const chapterList = getChaptersRaw()
    .filter((chapter) => {
      const chapterSubjectId = slugify(chapter.subjectId);
      const chapterSubjectSlug = slugify(chapter.subjectSlug);

      if (subject) {
        return (
          chapterSubjectId === slugify(subject.id) ||
          chapterSubjectSlug === slugify(subject.slug)
        );
      }

      return chapterSubjectId === key || chapterSubjectSlug === key;
    })
    .map((chapter, index) => normalizeChapter(chapter, index, subject))
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  return chapterList;
}

export async function getChapterById(chapterId: string): Promise<Chapter | null> {
  const key = slugify(chapterId);

  const rawChapter =
    getChaptersRaw().find(
      (chapter) =>
        slugify(chapter.id) === key || slugify(chapter.chapterId) === key
    ) ?? null;

  if (!rawChapter) return null;

  const subjectList = await getSubjects();
  const subject =
    subjectList.find(
      (item) =>
        slugify(item.id) === slugify(rawChapter.subjectId) ||
        slugify(item.slug) === slugify(rawChapter.subjectSlug)
    ) ?? null;

  return normalizeChapter(rawChapter, 0, subject);
}

export async function getLessonsByChapterId(chapterId: string): Promise<Lesson[]> {
  const key = toStr(chapterId);
  const lessonsMap = getLessonsMap();
  const rawLessons = safeArray<AnyObj>(lessonsMap[key]);

  return rawLessons
    .map((lesson, index) => normalizeLesson(lesson, index, key))
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  const key = slugify(lessonId);
  const lessonsMap = getLessonsMap();

  for (const [chapterId, lessons] of Object.entries(lessonsMap)) {
    const found = safeArray<AnyObj>(lessons).find(
      (lesson) =>
        slugify(lesson.id) === key || slugify(lesson.lessonId) === key
    );

    if (found) {
      return normalizeLesson(found, 0, chapterId);
    }
  }

  return null;
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const exportedFn = (QuizzesModule as AnyObj).getQuizById;

  if (typeof exportedFn === "function") {
    const raw = await exportedFn(quizId);
    return raw ? normalizeQuiz(raw) : null;
  }

  return null;
}

export async function getQuizByChapterId(chapterId: string): Promise<Quiz | null> {
  const chapter = await getChapterById(chapterId);

  if (!chapter?.quizId) {
    return null;
  }

  return getQuizById(chapter.quizId);
}

export async function getDashboardSnapshot() {
  const subjectList = await getSubjects();

  const store = (readProgressStore() ?? {}) as AnyObj;
  const chaptersStatus: AnyObj = store.chapters ?? store.chapterStatus ?? {};
  const quizzes: AnyObj = store.quizzes ?? store.quizResults ?? {};
  const minutesStudied = Number(
    store.stats?.minutesStudied ?? store.minutesStudied ?? 0
  );

  const chapterEntries = Object.entries(chaptersStatus);
  const totalTrackedChapters = chapterEntries.length;

  const completedChapters = chapterEntries.filter(([, state]) => {
    return Boolean(
      (state as AnyObj)?.completed ||
        (state as AnyObj)?.isCompleted ||
        state === "done" ||
        state === true
    );
  }).length;

  const progressPercent =
    totalTrackedChapters > 0
      ? Math.round((completedChapters / totalTrackedChapters) * 100)
      : 0;

  const quizEntries = Object.values(quizzes ?? {}) as AnyObj[];
  const passedQuizzes = quizEntries.filter((result) => {
    const correct = Number(result?.correct ?? 0);
    const total = Number(result?.total ?? 0);
    const passMark = Number(result?.passMarkPercent ?? 60);

    return isQuizPassed({ correct, total }, passMark);
  }).length;

  const quizPassPercent =
    quizEntries.length > 0
      ? Math.round((passedQuizzes / quizEntries.length) * 100)
      : 0;

  const hours = Math.floor(minutesStudied / 60);
  const minutes = minutesStudied % 60;

  return {
    subjectsCount: subjectList.length,
    progressPercent,
    studiedTimeLabel: `${hours}h ${minutes}m`,
    quizPassPercent,
  };
}

export const getStats = getDashboardSnapshot;