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
  // =========================
  // ALGÈBRE
  // =========================
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
    id: "chapter-equations-premier-degre",
    subjectId: "subject-algebre",
    subjectSlug: "algebre",
    title: "Équations du premier degré",
    description:
      "Apprenez à résoudre les équations du premier degré et à vérifier les solutions trouvées.",
    order: 2,
    estimatedMinutes: 30,
    quizId: "quiz-equations-premier-degre",
  },

  // =========================
  // ANALYSE
  // =========================
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
  {
    id: "chapter-limites-introduction",
    subjectId: "subject-analyse",
    subjectSlug: "analyse",
    title: "Introduction aux limites",
    description:
      "Comprenez l’idée de limite et apprenez à interpréter le comportement d’une fonction près d’un point.",
    order: 2,
    estimatedMinutes: 35,
    quizId: "quiz-limites-introduction",
  },

  // =========================
  // TRIGONOMÉTRIE
  // =========================
  {
    id: "chapter-angles-remarquables",
    subjectId: "subject-trigonometrie",
    subjectSlug: "trigonometrie",
    title: "Angles remarquables",
    description:
      "Maîtrisez les principales valeurs trigonométriques des angles remarquables.",
    order: 1,
    estimatedMinutes: 30,
    quizId: "quiz-angles-remarquables",
  },

  // =========================
  // GÉOMÉTRIE
  // =========================
  {
    id: "chapter-droites-plan",
    subjectId: "subject-geometrie",
    subjectSlug: "geometrie",
    title: "Droites dans le plan",
    description:
      "Étudiez les positions relatives de droites, les parallélismes et les intersections dans le plan.",
    order: 1,
    estimatedMinutes: 30,
    quizId: "quiz-droites-plan",
  },

  // =========================
  // STATISTIQUE
  // =========================
  {
    id: "chapter-moyenne-mediane",
    subjectId: "subject-statistique",
    subjectSlug: "statistique",
    title: "Moyenne, médiane et mode",
    description:
      "Découvrez les indicateurs de tendance centrale et apprenez à les calculer et les interpréter.",
    order: 1,
    estimatedMinutes: 35,
    quizId: "quiz-moyenne-mediane",
  },

  // =========================
  // PHYSIQUE
  // =========================
  {
    id: "chapter-gaz-parfaits",
    subjectId: "subject-physique",
    subjectSlug: "physique",
    title: "Gaz parfaits",
    description:
      "Étudiez les grandeurs fondamentales des gaz parfaits et la relation entre pression, volume et température.",
    order: 1,
    estimatedMinutes: 40,
    quizId: "quiz-gaz-parfaits",
  },

  // =========================
  // CHIMIE
  // =========================
  {
    id: "chapter-structure-atomique",
    subjectId: "subject-chimie",
    subjectSlug: "chimie",
    title: "Structure atomique",
    description:
      "Comprenez la composition de l’atome, le rôle du noyau et la répartition des électrons.",
    order: 1,
    estimatedMinutes: 35,
    quizId: "quiz-structure-atomique",
  },
];

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getAllChapters() {
  return chapters;
}

export function getChapterById(id: string) {
  const key = normalizeKey(id);
  return chapters.find((chapter) => normalizeKey(chapter.id) === key);
}

export function getChaptersBySubjectId(subjectId: string) {
  const key = normalizeKey(subjectId);

  return chapters
    .filter((chapter) => normalizeKey(chapter.subjectId) === key)
    .sort((a, b) => a.order - b.order);
}

export function getChaptersBySubjectSlug(subjectSlug: string) {
  const key = normalizeKey(subjectSlug);

  return chapters
    .filter((chapter) => normalizeKey(chapter.subjectSlug) === key)
    .sort((a, b) => a.order - b.order);
}