import type { Quiz } from "@/lib/types/quiz";

export const mockQuizzes: Quiz[] = [
  {
    id: "quiz-polynomes",
    chapterId: "chapter-polynomes",
    title: "Quiz - Polynômes",
    description:
      "Teste ta compréhension de la définition, du degré et des opérations sur les polynômes.",
    timeLimitSec: 600,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleOptions: false,
    questions: [
      {
        id: "q-polynome-1",
        type: "single_choice",
        question: "Laquelle des expressions suivantes est un polynôme ?",
        options: ["1/x + 2", "√x + 1", "3x² - 5x + 1", "x⁻¹ + 4"],
        correctAnswer: "3x² - 5x + 1",
        explanation:
          "Un polynôme possède uniquement des exposants entiers naturels et aucune variable au dénominateur.",
        points: 1,
      },
      {
        id: "q-polynome-2",
        type: "single_choice",
        question: "Quel est le degré du polynôme suivant ?",
        katex: "P(x)=4x^5-2x^3+x-9",
        options: ["3", "4", "5", "9"],
        correctAnswer: "5",
        explanation:
          "Le degré d’un polynôme est le plus grand exposant de x dont le coefficient est non nul.",
        points: 1,
      },
      {
        id: "q-polynome-3",
        type: "single_choice",
        question: "Quelle est la somme des deux polynômes suivants ?",
        katex: "(2x^2+3x)+(x^2-x+4)",
        options: ["3x² + 2x + 4", "2x² + 2x + 4", "x² + 2x + 4", "3x² - 4x"],
        correctAnswer: "3x² + 2x + 4",
        explanation:
          "On additionne les termes semblables : 2x² + x² = 3x² et 3x - x = 2x.",
        points: 1,
      },
      {
        id: "q-polynome-4",
        type: "single_choice",
        question: "Développe l’expression suivante :",
        katex: "(x+2)(x+3)",
        options: ["x² + 5", "x² + 5x + 6", "x² + 6x + 5", "2x² + 3x + 6"],
        correctAnswer: "x² + 5x + 6",
        explanation:
          "On développe : (x + 2)(x + 3) = x² + 3x + 2x + 6 = x² + 5x + 6.",
        points: 1,
      },
      {
        id: "q-polynome-5",
        type: "single_choice",
        question: "Quel est le degré du polynôme constant suivant ?",
        katex: "P(x)=7",
        options: ["0", "1", "7", "ABR"],
        correctAnswer: "0",
        explanation: "Un polynôme constant non nul est de degré 0.",
        points: 1,
      },
    ],
  },

  {
    id: "quiz-mm5-9",
    chapterId: "mm5-9",
    title: "Quiz - Domaine de définition d’une fonction",
    description:
      "Teste ta compréhension du domaine de définition : fractions, racines paires, racines impaires et combinaisons de contraintes.",
    timeLimitSec: 900,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleOptions: false,
    questions: [
      {
        id: "q-mm59-1",
        type: "single_choice",
        question: "Quelle valeur est interdite pour la fonction suivante ?",
        katex: "f(x)=\\frac{1}{x-2}",
        options: ["-2", "0", "2", "4"],
        correctAnswer: "2",
        explanation:
          "Le dénominateur ne peut pas être nul. On impose x - 2 ≠ 0, donc x ≠ 2.",
        points: 1,
      },
      {
        id: "q-mm59-2",
        type: "single_choice",
        question: "Quel est le domaine de définition de la fonction suivante ?",
        katex: "g(x)=3x^2-5x+1",
        options: ["ℝ", "ℝ \\ {0}", "[0,+∞[", "]−∞,1]"],
        correctAnswer: "ℝ",
        explanation:
          "Une fonction polynomiale est définie pour tous les réels.",
        points: 1,
      },
      {
        id: "q-mm59-3",
        type: "single_choice",
        question: "Quel est le domaine de définition de la fonction suivante ?",
        katex: "h(x)=\\sqrt{x-3}",
        options: ["x > 3", "x ≥ 3", "x < 3", "ℝ"],
        correctAnswer: "x ≥ 3",
        explanation:
          "Pour une racine carrée, on impose que l’intérieur soit positif ou nul : x - 3 ≥ 0.",
        points: 1,
      },
      {
        id: "q-mm59-4",
        type: "single_choice",
        question: "Quel est le domaine de définition de la fonction suivante ?",
        katex: "p(x)=\\sqrt[3]{x-5}",
        options: ["x ≥ 5", "x > 5", "ℝ", "]−∞,5]"],
        correctAnswer: "ℝ",
        explanation:
          "Une racine d’indice impair est définie pour tous les réels.",
        points: 1,
      },
      {
        id: "q-mm59-5",
        type: "single_choice",
        question: "Quel est le domaine de définition de la fonction suivante ?",
        katex: "q(x)=\\frac{1}{\\sqrt{x-4}}",
        options: ["x ≥ 4", "x > 4", "x < 4", "x ≠ 4"],
        correctAnswer: "x > 4",
        explanation:
          "Une racine carrée au dénominateur impose une condition stricte : x - 4 > 0.",
        points: 1,
      },
      {
        id: "q-mm59-6",
        type: "single_choice",
        question: "Quel est le domaine de définition de la fonction suivante ?",
        katex: "r(x)=\\frac{\\sqrt{x+1}}{x-3}",
        options: [
          "[-1,+∞[",
          "[-1,+∞[ \\setminus \\{3\\}",
          "]−1,+∞[",
          "ℝ \\setminus \\{3\\}",
        ],
        correctAnswer: "[-1,+∞[ \\setminus \\{3\\}",
        explanation:
          "La racine impose x + 1 ≥ 0, donc x ≥ -1. Le dénominateur impose x ≠ 3. On combine les deux.",
        points: 1,
      },
      {
        id: "q-mm59-7",
        type: "single_choice",
        question: "Quel est le domaine de définition de la fonction suivante ?",
        katex: "s(x)=\\frac{\\sqrt{x+2}}{\\sqrt{x-1}}",
        options: ["x ≥ -2", "x > 1", "x ≥ 1", "x ≥ -2 et x ≠ 1"],
        correctAnswer: "x > 1",
        explanation:
          "Au numérateur, on impose x + 2 ≥ 0. Au dénominateur, on impose x - 1 > 0. L’intersection donne x > 1.",
        points: 1,
      },
      {
        id: "q-mm59-8",
        type: "single_choice",
        question: "Quelle est la bonne méthode générale ?",
        options: [
          "Chercher seulement les racines",
          "Chercher seulement les dénominateurs",
          "Repérer toutes les contraintes puis les combiner",
          "Toujours répondre ℝ sauf si on voit une fraction",
        ],
        correctAnswer: "Repérer toutes les contraintes puis les combiner",
        explanation:
          "La bonne méthode consiste à repérer toutes les restrictions puis à prendre leur intersection.",
        points: 1,
      },
    ],
  },
];

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const key = normalizeKey(id);
  return mockQuizzes.find((quiz) => normalizeKey(quiz.id) === key) ?? null;
}

export async function getQuizByChapterId(
  chapterId: string
): Promise<Quiz | null> {
  const key = normalizeKey(chapterId);
  return (
    mockQuizzes.find((quiz) => normalizeKey(quiz.chapterId) === key) ?? null
  );
}