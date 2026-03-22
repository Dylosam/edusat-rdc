import { lesson_mm59_domain } from "./analyse/mm5-9/lesson-mm5-9-intro";
import { lesson_mm59_fractions } from "./analyse/mm5-9/lesson-mm5-9-fractions";
import { lesson_mm59_racines } from "./analyse/mm5-9/lesson-mm5-9-racines";
import { lesson_mm59_racine_denominateur } from "./analyse/mm5-9/lesson-mm5-9-racine-denominateur";
import { lesson_mm5_9_combinations } from "./analyse/mm5-9/lesson-mm5-9-combinaisons";
import { lesson_mm5_9_methode } from "./analyse/mm5-9/lesson-mm5-9-methode";
import { lesson_mm5_9_synthese } from "./analyse/mm5-9/lesson-mm5-9-synthese";
import { lesson_mm5_9_exam } from "./analyse/mm5-9/lesson-mm5-9-examen";

export const lessonsByChapter = {
  "mm5-9": [
    lesson_mm59_domain,
    lesson_mm59_fractions,
    lesson_mm59_racines,
    lesson_mm59_racine_denominateur,
    lesson_mm5_9_combinations,
    lesson_mm5_9_methode,
    lesson_mm5_9_synthese,
    lesson_mm5_9_exam,
  ],
};

// Flatten global
export const lessons = Object.values(lessonsByChapter)
  .flat()
  .sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999));

// Normalisation pour éviter bugs (slug, majuscules, accents)
function normalizeKey(value: string) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Get lessons by chapter
export function getLessonsByChapterId(chapterId: string) {
  const key = normalizeKey(chapterId);

  return (
    Object.entries(lessonsByChapter).find(
      ([k]) => normalizeKey(k) === key
    )?.[1]?.slice().sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999)) ?? []
  );
}

// Get single lesson
export function getLessonById(lessonId: string) {
  const key = normalizeKey(lessonId);

  return lessons.find((lesson) => normalizeKey(lesson.id) === key) ?? null;
}