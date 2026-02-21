// lib/data/lessons.ts

export type LessonContentBlock =
  | { type: "text"; value: string }
  | { type: "formula"; value: string } // LaTeX
  | { type: "tip"; value: string }
  | { type: "example"; title?: string; value: string };

export type Lesson = {
  id: string; // ex: "lesson-c1-1-01"
  chapterId: string; // DOIT matcher /chapters/[id] (ex: "c1-1")
  title: string;
  summary?: string;
  content: LessonContentBlock[];
  durationMin?: number;
  order: number;
  isPremium?: boolean;
};

// Normalisation (pour match tolérant sur chapterId)
function norm(v: any) {
  return String(v ?? "").trim().toLowerCase().replace(/\s+/g, "-");
}

export const lessons: Lesson[] = [
  // =========================
  // Chapitre: c1-1 (Introduction aux fonctions)
  // =========================
  {
    id: "lesson-c1-1-01",
    chapterId: "c1-1",
    title: "Comprendre une fonction (définition intuitive)",
    summary: "Ce qu’est une fonction, comment la lire et l’écrire.",
    durationMin: 12,
    order: 1,
    isPremium: false,
    content: [
      {
        type: "text",
        value:
          "Une fonction associe à chaque nombre x un seul nombre f(x). Imagine une machine : tu mets x, elle te donne f(x).",
      },
      {
        type: "tip",
        value:
          "Si pour un même x tu obtiens deux résultats différents, alors ce n’est pas une fonction.",
      },
      {
        type: "example",
        title: "Exemple",
        value: "Si f(x)=2x+1, alors f(3)=2×3+1=7.",
      },
      { type: "formula", value: "f(3)=2\\times 3+1=7" },
    ],
  },
  {
    id: "lesson-c1-1-02",
    chapterId: "c1-1",
    title: "Notation et lecture de f(x)",
    summary: "Comment lire f(2), f(a), et traduire un énoncé en expression.",
    durationMin: 10,
    order: 2,
    isPremium: false,
    content: [
      {
        type: "text",
        value:
          "La notation f(x) signifie : « la valeur de la fonction f pour l’entrée x ». Donc f(2) est la sortie quand on met 2.",
      },
      {
        type: "tip",
        value:
          "Lis f(2) comme : « f de 2 ». Ça t’évite de confondre avec une multiplication.",
      },
      {
        type: "example",
        title: "Mini-traduction",
        value:
          "« Le double d’un nombre augmenté de 5 » → 2x + 5. « Le carré d’un nombre diminué de 1 » → x² − 1.",
      },
      {
        type: "formula",
        value: "g(x)=x^2-1 \\quad \\Rightarrow \\quad g(4)=16-1=15",
      },
    ],
  },

  // =========================
  // Chapitre: c1-1 (bonus KaTeX)
  // =========================
  {
    id: "lesson-c1-1-03",
    chapterId: "c1-1",
    title: "Les fractions (KaTeX)",
    summary: "Affichage correct des fractions en LaTeX.",
    durationMin: 8,
    order: 3,
    isPremium: false,
    content: [
      { type: "text", value: "Voici une fraction simple :" },
      { type: "formula", value: "\\frac{1}{2}" },
      { type: "text", value: "Voici une fraction algébrique :" },
      { type: "formula", value: "\\frac{x+1}{x-2}" },
      { type: "text", value: "Addition de fractions :" },
      { type: "formula", value: "\\frac{a}{b}+\\frac{c}{d}=\\frac{ad+bc}{bd}" },
    ],
  },
];

// Helpers
export function getLessonsByChapter(chapterId: string) {
  const target = norm(chapterId);

  return lessons
    .filter((l) => {
      const cid = norm(l.chapterId);

      // match strict
      if (cid === target) return true;

      // match tolérant (au cas où tu as des prefix genre "chapter-c2-1")
      if (cid === `chapter-${target}`) return true;
      if (`chapter-${cid}` === target) return true;

      return false;
    })
    .sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string) {
  return lessons.find((l) => l.id === id) || null;
}

export function getPrevNextLesson(chapterId: string, currentLessonId: string) {
  const list = getLessonsByChapter(chapterId);
  const idx = list.findIndex((l) => l.id === currentLessonId);

  if (idx === -1) return { prev: null, next: null, index: 0, total: list.length };

  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
    index: idx + 1,
    total: list.length,
  };
}