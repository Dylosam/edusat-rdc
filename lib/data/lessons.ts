// lib/data/lessons.ts

export type LessonContentBlock =
  | { type: "text"; value: string }
<<<<<<< HEAD
  | { type: "formula"; value: string }
=======
  | { type: "formula"; value: string } // LaTeX
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
  | { type: "tip"; value: string }
  | { type: "example"; title?: string; value: string };

export type Lesson = {
<<<<<<< HEAD
  id: string;
  chapterId: string; // doit matcher /chapters/[id]
=======
  id: string; // ex: "lesson-c1-1-01"
  chapterId: string; // ex: "c1-1"
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
  title: string;
  summary?: string;
  content: LessonContentBlock[];
  durationMin?: number;
  order: number;
  isPremium?: boolean;
};

<<<<<<< HEAD
function norm(v: any) {
  return String(v ?? "").trim().toLowerCase().replace(/\s+/g, "-");
}

export const lessons: Lesson[] = [
  // =========================
  // Chapitre: c1-1
  // =========================
=======
export const lessons: Lesson[] = [
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
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
<<<<<<< HEAD
        value:
          "Si f(x)=2x+1, alors f(3)=2×3+1=7. On remplace x par 3 et on calcule.",
=======
        value: "Si f(x)=2x+1, alors f(3)=2×3+1=7.",
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
      },
      { type: "formula", value: "f(3)=2\\times 3+1=7" },
    ],
  },
  {
    id: "lesson-c1-1-02",
    chapterId: "c1-1",
<<<<<<< HEAD
    title: "Notation et lecture de f(x)",
    summary: "Comment lire f(2), f(a), et traduire un énoncé en expression.",
=======
    title: "Les fractions (vraies fractions KaTeX)",
    summary: "Affichage correct des fractions en LaTeX.",
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
    durationMin: 10,
    order: 2,
    isPremium: false,
    content: [
<<<<<<< HEAD
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
  {
    id: "lesson-c1-1-03",
    chapterId: "c1-1",
    title: "Domaine de définition (les pièges classiques)",
    summary: "Les valeurs interdites : division par 0, racine carrée, etc.",
    durationMin: 14,
    order: 3,
    isPremium: false,
    content: [
      {
        type: "text",
        value:
          "Le domaine de définition, c’est l’ensemble des x pour lesquels f(x) a un sens. On retire les valeurs interdites.",
      },
      {
        type: "tip",
        value:
          "Interdits fréquents : (1) division par 0, (2) racine carrée d’un nombre négatif (au niveau collège/lycée), (3) logarithme d’un nombre ≤ 0.",
      },
      {
        type: "example",
        title: "Division par 0",
        value:
          "Si f(x)=1/(x−2), alors x=2 est interdit car le dénominateur devient 0.",
      },
      { type: "formula", value: "f(x)=\\frac{1}{x-2} \\Rightarrow x\\neq 2" },
      {
        type: "example",
        title: "Racine carrée",
        value: "Si h(x)=√(x−5), il faut x−5 ≥ 0 donc x ≥ 5.",
      },
      { type: "formula", value: "h(x)=\\sqrt{x-5} \\Rightarrow x\\ge 5" },
    ],
  },

  // =========================
  // Chapitre: c2-1 (EXEMPLE) ✅
  // =========================
  {
    id: "lesson-c2-1-01",
    chapterId: "c2-1",
    title: "Introduction (c2-1)",
    summary: "Objectif du chapitre et notions à retenir.",
    durationMin: 8,
    order: 1,
    isPremium: false,
    content: [
      {
        type: "text",
        value:
          "Dans ce chapitre, nous allons poser les bases essentielles. Suis les leçons dans l’ordre puis valide avec le quiz.",
      },
      {
        type: "tip",
        value:
          "Astuce : note les définitions importantes au fur et à mesure. Le quiz teste surtout les bases.",
      },
    ],
  },
  {
    id: "lesson-c2-1-02",
    chapterId: "c2-1",
    title: "Définitions (c2-1)",
    summary: "Les définitions clés du chapitre.",
    durationMin: 12,
    order: 2,
    isPremium: false,
    content: [
      {
        type: "text",
        value:
          "Voici les définitions clés que vous devez maîtriser pour ce chapitre.",
      },
      { type: "formula", value: "f(x)=ax^2+bx+c" },
      {
        type: "example",
        title: "Exemple",
        value:
          "Si f(x)=x^2+2x+1, alors f(1)=1+2+1=4.",
      },
=======
      { type: "text", value: "Voici une fraction simple :" },
      { type: "formula", value: "\\frac{1}{2}" },
      { type: "text", value: "Voici une fraction algébrique :" },
      { type: "formula", value: "\\frac{x+1}{x-2}" },
      { type: "text", value: "Addition de fractions :" },
      { type: "formula", value: "\\frac{a}{b}+\\frac{c}{d}=\\frac{ad+bc}{bd}" },
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
    ],
  },
];

// Helpers
export function getLessonsByChapter(chapterId: string) {
<<<<<<< HEAD
  const target = norm(chapterId);

  return lessons
    .filter((l) => {
      const cid = norm(l.chapterId);

      // ✅ match strict
      if (cid === target) return true;

      // ✅ match tolérant (au cas où tu as des prefix genre "chapter-c2-1")
      if (cid === `chapter-${target}`) return true;
      if (`chapter-${cid}` === target) return true;

      return false;
    })
=======
  return lessons
    .filter((l) => l.chapterId === chapterId)
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
    .sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string) {
  return lessons.find((l) => l.id === id) || null;
}

export function getPrevNextLesson(chapterId: string, currentLessonId: string) {
  const list = getLessonsByChapter(chapterId);
  const idx = list.findIndex((l) => l.id === currentLessonId);
<<<<<<< HEAD
  if (idx === -1) return { prev: null, next: null, index: 0, total: list.length };
=======

  if (idx === -1) return { prev: null, next: null, index: 0, total: list.length };

>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
    index: idx + 1,
    total: list.length,
  };
<<<<<<< HEAD
}
=======
}
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
