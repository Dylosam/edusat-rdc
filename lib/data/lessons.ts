// lib/data/lessons.ts
import * as data from "@/lib/mock-api/data";

// On cherche un export "lessons" ou "mockLessons" dans ton data.ts sans te bloquer
const lessonsArray: any[] =
  (data as any).lessons ??
  (data as any).mockLessons ??
  [];

export function getLessonsByChapterId(chapterId: string) {
  return (lessonsArray ?? []).filter((l: any) => l.chapterId === chapterId);
}