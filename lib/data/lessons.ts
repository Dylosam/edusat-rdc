export type LessonContentBlock =
  | { type: "text"; value: string }
  | { type: "tip"; value: string }
  | { type: "example"; title?: string; value: string }
  | { type: "formula"; value: string };

export type Lesson = {
  id: string;
  chapterId: string;
  title: string;
  summary?: string;
  durationMin?: number;
  minutes?: number;
  order: number;
  isPremium?: boolean;
  content: LessonContentBlock[];
};

export const lessonsByChapter: Record<string, Lesson[]> = {
  "chapter-polynomes": [
    {
      id: "lesson-definition-polynome",
      chapterId: "chapter-polynomes",
      title: "Définition d’un polynôme",
      summary: "Comprendre ce qu’est un polynôme et reconnaître ses formes.",
      durationMin: 8,
      order: 1,
      content: [
        {
          type: "text",
          value:
            "Un polynôme est une expression algébrique formée d’une somme de termes. Chaque terme est généralement de la forme coefficient × puissance de x.",
        },
        {
          type: "formula",
          value: String.raw`P(x)=a_nx^n+a_{n-1}x^{n-1}+\cdots+a_1x+a_0`,
        },
        {
          type: "text",
          value:
            "Dans un polynôme, les exposants de x doivent être des entiers naturels : 0, 1, 2, 3, ...",
        },
        {
          type: "example",
          title: "Exemples",
          value: "3x² + 5x - 7, 2x³ - x + 4 et 9 sont des polynômes.",
        },
        {
          type: "tip",
          value:
            "Une expression comme 1/x ou √x n’est pas un polynôme, car la variable est au dénominateur ou sous une racine.",
        },
      ],
    },
    {
      id: "lesson-degre-polynome",
      chapterId: "chapter-polynomes",
      title: "Degré d’un polynôme",
      summary: "Identifier le plus grand exposant d’un polynôme.",
      durationMin: 7,
      order: 2,
      content: [
        {
          type: "text",
          value:
            "Le degré d’un polynôme est le plus grand exposant de x dont le coefficient est non nul.",
        },
        {
          type: "formula",
          value: String.raw`\deg(P)=\max\{n\in\mathbb{N}\mid a_n\neq0\}`,
        },
        {
          type: "example",
          title: "Exemple",
          value:
            "Le degré de 5x⁴ + 3x² - 8 est 4. Le degré de -2x + 9 est 1. Le degré de 6 est 0.",
        },
        {
          type: "tip",
          value:
            "Pense toujours à repérer le terme avec la plus grande puissance de x.",
        },
      ],
    },
    {
      id: "lesson-operations-polynomes",
      chapterId: "chapter-polynomes",
      title: "Addition et multiplication des polynômes",
      summary: "Additionner et multiplier correctement deux polynômes.",
      durationMin: 10,
      order: 3,
      content: [
        {
          type: "text",
          value:
            "Pour additionner deux polynômes, on regroupe les termes semblables. Pour multiplier, on distribue soigneusement chaque terme.",
        },
        {
          type: "formula",
          value: String.raw`\left(3x^2+2x+1\right)+\left(5x^2-x+4\right)=8x^2+x+5`,
        },
        {
          type: "formula",
          value: String.raw`(x+2)(x+3)=x^2+5x+6`,
        },
        {
          type: "example",
          title: "Exemple",
          value:
            "2x(3x² - x + 4) = 6x³ - 2x² + 8x",
        },
        {
          type: "tip",
          value:
            "En addition, rassemble les mêmes degrés. En multiplication, développe puis réduis.",
        },
      ],
    },
  ],
};

export const LESSONS_BY_CHAPTER = lessonsByChapter;

export function getLessonsByChapterId(chapterId: string): Lesson[] {
  return lessonsByChapter[chapterId] ?? [];
}

export function getLessonById(lessonId: string): Lesson | null {
  for (const lessons of Object.values(lessonsByChapter)) {
    const found = lessons.find((lesson) => lesson.id === lessonId);
    if (found) return found;
  }
  return null;
}

export function getPrevNextLesson(chapterId: string, lessonId: string) {
  const lessons = getLessonsByChapterId(chapterId).sort(
    (a, b) => (a.order ?? 9999) - (b.order ?? 9999)
  );

  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

  if (currentIndex === -1) {
    return {
      prev: null,
      next: null,
      index: 0,
      total: lessons.length,
    };
  }

  return {
    prev: currentIndex > 0 ? lessons[currentIndex - 1] : null,
    next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null,
    index: currentIndex + 1,
    total: lessons.length,
  };
}

