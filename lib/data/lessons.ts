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
          value: "2x(3x² - x + 4) = 6x³ - 2x² + 8x",
        },
        {
          type: "tip",
          value:
            "En addition, rassemble les mêmes degrés. En multiplication, développe puis réduis.",
        },
      ],
    },
  ],

  "mm5-9": [
    {
      id: "lesson-mm5-9-introduction",
      chapterId: "mm5-9",
      title: "Introduction au domaine de définition",
      summary: "Comprendre ce qu’est le domaine de définition d’une fonction.",
      durationMin: 8,
      order: 1,
      content: [
        {
          type: "richText",
          segments: [
            {
              type: "text",
              value:
                "Le domaine de définition d’une fonction est l’ensemble des valeurs de ",
            },
            { type: "math", value: "x" },
            {
              type: "text",
              value:
                " pour lesquelles l’expression mathématique de la fonction a un sens.",
            },
          ],
        },
        {
          type: "richText",
          segments: [
            {
              type: "text",
              value:
                "Autrement dit, ce sont toutes les valeurs que l’on peut remplacer dans la fonction sans provoquer d’impossibilité mathématique.",
            },
          ],
        },
        {
          type: "example",
          title: "Exemple",
          value:
            "Dans $f(x)=\\frac{1}{x-2}$, on ne peut pas prendre $x=2$, car cela donnerait une division par zéro.",
        },
        {
          type: "solutionSteps",
          title: "Lecture correcte de l’exemple",
          steps: [
            "On regarde l’expression $f(x)=\\frac{1}{x-2}$.",
            "On remarque qu’il y a un dénominateur : $x-2$.",
            "Or un dénominateur ne peut jamais être nul.",
            "On impose donc $x-2\\neq 0$.",
            "Cela donne $x\\neq 2$.",
            "Donc la valeur $2$ ne fait pas partie du domaine de définition.",
          ],
        },
        {
          type: "tip",
          value:
            "Pour trouver un domaine de définition, il faut toujours repérer les opérations interdites.",
        },
        {
          type: "exercise",
          title: "Exercice guidé 1",
          prompt:
            "Quelle est la valeur interdite pour la fonction $g(x)=\\frac{4}{x+5}$ ?",
          choices: ["$x=5$", "$x=-5$", "$x=0$", "$x=4$"],
          correctChoiceIndex: 1,
          hint:
            "Cherche la valeur de $x$ qui annule le dénominateur $x+5$.",
          solutionSteps: [
            "On écrit le dénominateur : $x+5$.",
            "On impose $x+5\\neq 0$.",
            "Donc $x\\neq -5$.",
            "La valeur interdite est donc $-5$.",
          ],
        },
      ],
    },

    {
      id: "lesson-mm5-9-polynomes",
      chapterId: "mm5-9",
      title: "Cas des fonctions polynomiales",
      summary: "Voir pourquoi les polynômes sont définis sur tous les réels.",
      durationMin: 6,
      order: 2,
      content: [
        {
          type: "richText",
          segments: [
            {
              type: "text",
              value:
                "Une fonction polynomiale est définie pour tout nombre réel, car elle ne contient ni division par une expression, ni racine paire, ni autre contrainte particulière.",
            },
          ],
        },
        {
          type: "formula",
          value: String.raw`f(x)=3x^2-5x+1`,
        },
        {
          type: "richText",
          segments: [
            {
              type: "text",
              value:
                "Dans cette expression, il n’y a ni dénominateur, ni racine carrée, ni logarithme. On peut donc remplacer ",
            },
            { type: "math", value: "x" },
            {
              type: "text",
              value: " par n’importe quel réel.",
            },
          ],
        },
        {
          type: "example",
          title: "Conclusion",
          value: "Le domaine de définition est $D=\\mathbb{R}$.",
        },
        {
          type: "solutionSteps",
          title: "Pourquoi le domaine est tout ℝ",
          steps: [
            "On observe la fonction $f(x)=3x^2-5x+1$.",
            "Elle contient seulement des puissances entières positives de $x$, des additions et des multiplications.",
            "Aucune opération interdite n’apparaît.",
            "Donc aucun réel n’est exclu.",
            "Ainsi $D=\\mathbb{R}$.",
          ],
        },
        {
          type: "exercise",
          title: "Exercice guidé 2",
          prompt: "Quel est le domaine de définition de $h(x)=2x^3-7x+9$ ?",
          choices: [
            "$D=\\mathbb{R}$",
            "$D=[0,+\\infty[$",
            "$D=\\mathbb{R}\\setminus\\{0\\}$",
            "$D=]-\\infty,9]$",
          ],
          correctChoiceIndex: 0,
          hint:
            "Demande-toi s’il y a un dénominateur ou une racine paire dans l’expression.",
          solutionSteps: [
            "On observe $h(x)=2x^3-7x+9$.",
            "Il n’y a ni dénominateur, ni racine paire.",
            "Donc aucune restriction n’apparaît.",
            "Ainsi $D=\\mathbb{R}$.",
          ],
        },
      ],
    },

    {
      id: "lesson-mm5-9-rationnelles",
      chapterId: "mm5-9",
      title: "Cas des fonctions rationnelles",
      summary:
        "Apprendre à exclure les valeurs qui annulent le dénominateur.",
      durationMin: 10,
      order: 3,
      content: [
        {
          type: "richText",
          segments: [
            {
              type: "text",
              value:
                "Lorsqu’une fonction contient une fraction, le dénominateur ne doit jamais être égal à ",
            },
            { type: "math", value: "0" },
            {
              type: "text",
              value: ".",
            },
          ],
        },
        {
          type: "formula",
          value: String.raw`f(x)=\frac{1}{x-2}`,
        },
        {
          type: "solutionSteps",
          title: "Résolution détaillée",
          steps: [
            "On repère le dénominateur : $x-2$.",
            "On impose la condition $x-2\\neq 0$.",
            "On résout : $x\\neq 2$.",
            "La valeur $2$ est interdite.",
            "Donc le domaine est $D=\\mathbb{R}\\setminus\\{2\\}$.",
          ],
        },
        {
          type: "formula",
          value: String.raw`g(x)=\frac{x+1}{x^2-9}`,
        },
        {
          type: "solutionSteps",
          title: "Deuxième exemple détaillé",
          steps: [
            "On repère le dénominateur : $x^2-9$.",
            "On impose $x^2-9\\neq 0$.",
            "On factorise : $x^2-9=(x-3)(x+3)$.",
            "Donc $(x-3)(x+3)\\neq 0$.",
            "Cela impose $x\\neq 3$ et $x\\neq -3$.",
            "Le domaine est donc $D=\\mathbb{R}\\setminus\\{-3,3\\}$.",
          ],
        },
        {
          type: "exercise",
          title: "Exercice guidé 3",
          prompt:
            "Quel est le domaine de définition de $p(x)=\\frac{2x-1}{x^2-4}$ ?",
          choices: [
            "$D=\\mathbb{R}$",
            "$D=\\mathbb{R}\\setminus\\{-2,2\\}$",
            "$D=\\mathbb{R}\\setminus\\{2\\}$",
            "$D=[-2,2]$",
          ],
          correctChoiceIndex: 1,
          hint: "Commence par résoudre $x^2-4\\neq 0$.",
          solutionSteps: [
            "On impose $x^2-4\\neq 0$.",
            "On factorise : $x^2-4=(x-2)(x+2)$.",
            "Donc $(x-2)(x+2)\\neq 0$.",
            "Cela donne $x\\neq 2$ et $x\\neq -2$.",
            "Ainsi $D=\\mathbb{R}\\setminus\\{-2,2\\}$.",
          ],
        },
      ],
    },

    {
      id: "lesson-mm5-9-racines-paires",
      chapterId: "mm5-9",
      title: "Cas des racines d’indice pair",
      summary: "Comprendre la condition imposée par la racine carrée.",
      durationMin: 10,
      order: 4,
      content: [
        {
          type: "richText",
          segments: [
            {
              type: "text",
              value:
                "Pour une racine carrée, l’expression placée à l’intérieur doit être positive ou nulle.",
            },
          ],
        },
        {
          type: "formula",
          value: String.raw`f(x)=\sqrt{x-3}`,
        },
        {
          type: "solutionSteps",
          title: "Résolution détaillée",
          steps: [
            "On repère la racine carrée : $\\sqrt{x-3}$.",
            "On impose donc la condition $x-3\\ge 0$.",
            "On résout cette inégalité : $x\\ge 3$.",
            "Le domaine de définition est donc $D=[3,+\\infty[$.",
          ],
        },
        {
          type: "formula",
          value: String.raw`g(x)=\sqrt{5-2x}`,
        },
        {
          type: "solutionSteps",
          title: "Deuxième exemple détaillé",
          steps: [
            "On impose $5-2x\\ge 0$.",
            "On soustrait $5$ des deux côtés : $-2x\\ge -5$.",
            "On divise par $-2$, donc on inverse le sens de l’inégalité.",
            "On obtient $x\\le \\frac{5}{2}$.",
            "Le domaine est donc $D=]-\\infty,\\frac{5}{2}]$.",
          ],
        },
        {
          type: "exercise",
          title: "Exercice guidé 4",
          prompt:
            "Quel est le domaine de définition de $q(x)=\\sqrt{2x+8}$ ?",
          choices: [
            "$D=[-4,+\\infty[$",
            "$D=]-\\infty,-4]$",
            "$D=]-4,+\\infty[$",
            "$D=\\mathbb{R}$",
          ],
          correctChoiceIndex: 0,
          hint: "Écris d’abord la condition $2x+8\\ge 0$.",
          solutionSteps: [
            "On impose $2x+8\\ge 0$.",
            "On soustrait $8$ : $2x\\ge -8$.",
            "On divise par $2$ : $x\\ge -4$.",
            "Donc $D=[-4,+\\infty[$.",
          ],
        },
      ],
    },

    {
      id: "lesson-mm5-9-racines-impaires",
      chapterId: "mm5-9",
      title: "Cas des racines d’indice impair",
      summary:
        "Voir pourquoi les racines cubiques n’imposent pas de restriction.",
      durationMin: 6,
      order: 5,
      content: [
        {
          type: "richText",
          segments: [
            {
              type: "text",
              value:
                "Les racines d’indice impair, comme la racine cubique, sont définies pour tous les nombres réels.",
            },
          ],
        },
        {
          type: "formula",
          value: String.raw`f(x)=\sqrt[3]{x-2}`,
        },
        {
          type: "solutionSteps",
          title: "Pourquoi il n’y a pas de restriction",
          steps: [
            "On observe la racine cubique $\\sqrt[3]{x-2}$.",
            "Une racine d’indice impair accepte des nombres positifs, nuls et négatifs.",
            "Il n’y a donc aucune condition à imposer à $x$.",
            "Ainsi le domaine est $D=\\mathbb{R}$.",
          ],
        },
        {
          type: "exercise",
          title: "Exercice guidé 5",
          prompt:
            "Quel est le domaine de définition de $r(x)=\\sqrt[3]{5x-1}$ ?",
          choices: [
            "$D=\\mathbb{R}$",
            "$D=[\\frac{1}{5},+\\infty[$",
            "$D=]-\\infty,\\frac{1}{5}]$",
            "$D=\\mathbb{R}\\setminus\\{0\\}$",
          ],
          correctChoiceIndex: 0,
          hint:
            "Rappelle-toi qu’une racine cubique est définie pour tout réel.",
          solutionSteps: [
            "On observe la racine cubique $\\sqrt[3]{5x-1}$.",
            "Une racine d’indice impair n’impose aucune restriction réelle.",
            "Donc aucun réel n’est exclu.",
            "Ainsi $D=\\mathbb{R}$.",
          ],
        },
      ],
    },

    {
      id: "lesson-mm5-9-racines-denominateur",
      chapterId: "mm5-9",
      title: "Racine au dénominateur",
      summary:
        "Apprendre pourquoi la condition devient strictement positive.",
      durationMin: 8,
      order: 6,
      content: [
        {
          type: "richText",
          segments: [
            {
              type: "text",
              value:
                "Quand une racine carrée se trouve au dénominateur, l’expression à l’intérieur doit être strictement positive.",
            },
          ],
        },
        {
          type: "formula",
          value: String.raw`f(x)=\frac{1}{\sqrt{x-4}}`,
        },
        {
          type: "solutionSteps",
          title: "Résolution détaillée",
          steps: [
            "On repère une racine carrée au dénominateur : $\\sqrt{x-4}$.",
            "Le dénominateur ne peut pas être nul.",
            "On ne peut donc pas écrire seulement $x-4\\ge 0$ ; il faut écrire $x-4>0$.",
            "On résout : $x>4$.",
            "Le domaine est donc $D=]4,+\\infty[$.",
          ],
        },
        {
          type: "tip",
          value:
            "Sous une racine au numérateur : on impose $\\ge 0$. Sous une racine au dénominateur : on impose $>0$.",
        },
        {
          type: "exercise",
          title: "Exercice guidé 6",
          prompt:
            "Quel est le domaine de définition de $s(x)=\\frac{3}{\\sqrt{2x+6}}$ ?",
          choices: [
            "$D=[-3,+\\infty[$",
            "$D=]-3,+\\infty[$",
            "$D=]-\\infty,-3[$",
            "$D=\\mathbb{R}\\setminus\\{-3\\}$",
          ],
          correctChoiceIndex: 1,
          hint:
            "Comme la racine est au dénominateur, écris $2x+6>0$.",
          solutionSteps: [
            "On impose $2x+6>0$.",
            "On soustrait $6$ : $2x>-6$.",
            "On divise par $2$ : $x>-3$.",
            "Donc $D=]-3,+\\infty[$.",
          ],
        },
      ],
    },

    {
      id: "lesson-mm5-9-combinaisons",
      chapterId: "mm5-9",
      title: "Combinaisons de plusieurs contraintes",
      summary: "Combiner plusieurs conditions dans une même fonction.",
      durationMin: 12,
      order: 7,
      content: [
        {
          type: "formula",
          value: String.raw`f(x)=\frac{\sqrt{x+1}}{x-3}`,
        },
        {
          type: "solutionSteps",
          title: "Exemple 1 détaillé",
          steps: [
            "La racine impose $x+1\\ge 0$.",
            "Donc $x\\ge -1$.",
            "Le dénominateur impose $x-3\\neq 0$.",
            "Donc $x\\neq 3$.",
            "On combine les deux conditions.",
            "Le domaine est $D=[-1,+\\infty[\\setminus\\{3\\}$.",
          ],
        },
        {
          type: "formula",
          value: String.raw`g(x)=\frac{\sqrt{x+2}}{\sqrt{x-1}}`,
        },
        {
          type: "solutionSteps",
          title: "Exemple 2 détaillé",
          steps: [
            "Au numérateur, la racine impose $x+2\\ge 0$ donc $x\\ge -2$.",
            "Au dénominateur, la racine impose $x-1>0$ donc $x>1$.",
            "On garde l’intersection des deux conditions.",
            "Ainsi le domaine est $D=]1,+\\infty[$.",
          ],
        },
        {
          type: "formula",
          value: String.raw`h(x)=\frac{\sqrt[3]{x+2}}{\sqrt{x-1}}`,
        },
        {
          type: "solutionSteps",
          title: "Exemple 3 détaillé",
          steps: [
            "La racine cubique $\\sqrt[3]{x+2}$ n’impose aucune restriction.",
            "La racine carrée au dénominateur impose $x-1>0$.",
            "Donc $x>1$.",
            "Le domaine est $D=]1,+\\infty[$.",
          ],
        },
        {
          type: "exercise",
          title: "Exercice guidé 7",
          prompt:
            "Quel est le domaine de définition de $u(x)=\\frac{\\sqrt{x+4}}{x+2}$ ?",
          choices: [
            "$D=[-4,+\\infty[$",
            "$D=[-4,+\\infty[\\setminus\\{-2\\}$",
            "$D=]-4,+\\infty[$",
            "$D=\\mathbb{R}\\setminus\\{-2\\}$",
          ],
          correctChoiceIndex: 1,
          hint:
            "Traite séparément la racine puis le dénominateur, puis combine.",
          solutionSteps: [
            "La racine impose $x+4\\ge 0$ donc $x\\ge -4$.",
            "Le dénominateur impose $x+2\\neq 0$ donc $x\\neq -2$.",
            "On combine ces deux contraintes.",
            "Le domaine est $D=[-4,+\\infty[\\setminus\\{-2\\}$.",
          ],
        },
      ],
    },

    {
      id: "lesson-mm5-9-methode",
      chapterId: "mm5-9",
      title: "Méthode générale et erreurs fréquentes",
      summary: "Retenir la méthode complète pour ne pas se tromper.",
      durationMin: 9,
      order: 8,
      content: [
        {
          type: "richText",
          segments: [
            {
              type: "text",
              value:
                "Pour trouver le domaine de définition d’une fonction, il faut d’abord repérer toutes les opérations qui imposent une restriction.",
            },
          ],
        },
        {
          type: "solutionSteps",
          title: "Méthode générale",
          steps: [
            "Chercher les dénominateurs et imposer qu’ils soient différents de $0$.",
            "Chercher les racines paires et imposer que leur intérieur soit $\\ge 0$.",
            "Si une racine paire est au dénominateur, imposer que son intérieur soit $>0$.",
            "Combiner toutes les conditions obtenues.",
            "Écrire le domaine final proprement.",
          ],
        },
        {
          type: "example",
          title: "Erreurs fréquentes",
          value:
            "Oublier qu’un dénominateur ne peut pas être nul ; écrire $>0$ au lieu de $\\ge 0$ pour une racine carrée simple ; oublier de combiner les contraintes.",
        },
        {
          type: "tip",
          value:
            "Le domaine final est toujours l’intersection de toutes les conditions obtenues.",
        },
        {
          type: "exercise",
          title: "Exercice bilan",
          prompt:
            "Quel est le domaine de définition de $v(x)=\\frac{\\sqrt{x-2}}{\\sqrt{x+1}}$ ?",
          choices: [
            "$D=[2,+\\infty[$",
            "$D=]2,+\\infty[$",
            "$D=]-1,+\\infty[$",
            "$D=[-1,+\\infty[$",
          ],
          correctChoiceIndex: 0,
          hint:
            "Fais bien la différence entre la racine au numérateur et la racine au dénominateur.",
          solutionSteps: [
            "Au numérateur, la racine impose $x-2\\ge 0$ donc $x\\ge 2$.",
            "Au dénominateur, la racine impose $x+1>0$ donc $x>-1$.",
            "On prend l’intersection des deux conditions.",
            "L’intersection est $x\\ge 2$.",
            "Donc $D=[2,+\\infty[$.",
          ],
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
