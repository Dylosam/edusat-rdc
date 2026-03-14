export type Chapter = {
  id: string;
  subjectId: string;
  subjectSlug: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes?: number;
  quizId?: string;
};

export const chapters: Chapter[] = [
  {
    id: "chapter-polynomes",
    subjectId: "subject-algebre",
    subjectSlug: "algebre",
    title: "Polynômes",
    description:
      "Découvrez la définition d’un polynôme, son degré et les opérations essentielles à maîtriser.",
    order: 1,
    estimatedMinutes: 25,
    quizId: "quiz-polynomes",
  },

  {
    id: "mm5-9",
    subjectId: "subject-analyse",
    subjectSlug: "analyse",
    title: "Domaine de définition d'une fonction",
    description:
      "Apprendre à déterminer toutes les valeurs de x pour lesquelles une fonction est définie.",
    order: 1,
    estimatedMinutes: 50,
    quizId: "quiz-mm5-9",
  },
];

export function getAllChapters() {
  return chapters;
}

export function getChapterById(id: string) {
  return chapters.find((chapter) => chapter.id === id);
}

export function getChaptersBySubjectId(subjectId: string) {
  return chapters
    .filter((chapter) => chapter.subjectId === subjectId)
    .sort((a, b) => a.order - b.order);
}