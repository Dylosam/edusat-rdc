import { lesson_mm59_domain } from "./mm5-9-domain";

export const lessonsByChapter = {
  "mm5-9": [lesson_mm59_domain],
};

export const lessons = Object.values(lessonsByChapter).flat();

export function getLessonsByChapterId(chapterId: string) {
  return lessonsByChapter[chapterId as keyof typeof lessonsByChapter] ?? [];
}

export function getLessonById(lessonId: string) {
  return lessons.find((lesson) => lesson.id === lessonId) ?? null;
}