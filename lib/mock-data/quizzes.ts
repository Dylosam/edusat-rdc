export type QuizQuestion = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
};

export type Quiz = {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
};

export const quizzes: Quiz[] = [
  {
    id: "quiz-polynomes",
    chapterId: "chapter-polynomes",
    title: "Quiz - Polynômes",
    description:
      "Vérifie ta compréhension de la définition, du degré et des opérations sur les polynômes.",
    questions: [
      {
        id: "q1",
        question: "Laquelle des expressions suivantes est un polynôme ?",
        choices: ["1/x + 2", "√x + 1", "3x² - 5x + 1", "x⁻¹ + 4"],
        answerIndex: 2,
        explanation:
          "Un polynôme possède uniquement des exposants entiers naturels et aucune variable au dénominateur.",
      },
      {
        id: "q2",
        question: "Quel est le degré du polynôme 4x^5 - 2x^3 + x - 9 ?",
        choices: ["3", "4", "5", "9"],
        answerIndex: 2,
        explanation:
          "Le degré d’un polynôme est le plus grand exposant de x ayant un coefficient non nul.",
      },
      {
        id: "q3",
        question: "Quelle est la somme de 2x² + 3x et x² - x + 4 ?",
        choices: ["3x² + 2x + 4", "2x² + 2x + 4", "x² + 2x + 4", "3x² - 4x"],
        answerIndex: 0,
        explanation:
          "On additionne les termes semblables : 2x² + x² = 3x² et 3x - x = 2x.",
      },
      {
        id: "q4",
        question: "Le résultat de (x + 2)(x + 3) est :",
        choices: ["x² + 5", "x² + 5x + 6", "x² + 6x + 5", "2x² + 3x + 6"],
        answerIndex: 1,
        explanation:
          "On développe puis on réduit : x² + 3x + 2x + 6 = x² + 5x + 6.",
      },
      {
        id: "q5",
        question: "Quel est le degré du polynôme constant 7 ?",
        choices: ["0", "1", "7", "ABR"],
        answerIndex: 0,
        explanation: "Un polynôme constant non nul est de degré 0.",
      },
    ],
  },
  {
    id: "quiz-mm5-9",
    chapterId: "mm5-9",
    title: "Quiz - Domaine de définition d’une fonction",
    description:
      "Vérifie ta compréhension du domaine de définition : fractions, racines paires, racines impaires et combinaisons de contraintes.",
    questions: [
      {
        id: "q-mm59-1",
        question: "Quelle valeur est interdite pour f(x) = 1 / (x - 2) ?",
        choices: ["-2", "0", "2", "4"],
        answerIndex: 2,
        explanation:
          "Le dénominateur ne peut pas être nul. On impose x - 2 ≠ 0, donc x ≠ 2.",
      },
      {
        id: "q-mm59-2",
        question: "Quel est le domaine de définition de g(x) = 3x² - 5x + 1 ?",
        choices: ["ℝ", "ℝ \\ {0}", "[0,+∞[", "]−∞,1]"],
        answerIndex: 0,
        explanation:
          "Une fonction polynomiale est définie pour tous les réels.",
      },
      {
        id: "q-mm59-3",
        question: "Quel est le domaine de définition de h(x) = √(x - 3) ?",
        choices: ["x > 3", "x ≥ 3", "x < 3", "ℝ"],
        answerIndex: 1,
        explanation: "Pour une racine carrée, on impose x - 3 ≥ 0.",
      },
      {
        id: "q-mm59-4",
        question: "Quel est le domaine de définition de p(x) = ∛(x - 5) ?",
        choices: ["x ≥ 5", "x > 5", "ℝ", "]−∞,5]"],
        answerIndex: 2,
        explanation:
          "Une racine d’indice impair est définie pour tous les réels.",
      },
      {
        id: "q-mm59-5",
        question: "Quel est le domaine de définition de q(x) = 1 / √(x - 4) ?",
        choices: ["x ≥ 4", "x > 4", "x < 4", "x ≠ 4"],
        answerIndex: 1,
        explanation:
          "Une racine carrée au dénominateur impose x - 4 > 0.",
      },
      {
        id: "q-mm59-6",
        question:
          "Quel est le domaine de définition de r(x) = √(x + 1) / (x - 3) ?",
        choices: [
          "[-1,+∞[",
          "[-1,+∞[ \\ {3}",
          "]−1,+∞[",
          "ℝ \\ {3}",
        ],
        answerIndex: 1,
        explanation:
          "La racine impose x + 1 ≥ 0, donc x ≥ -1. Le dénominateur impose x ≠ 3.",
      },
      {
        id: "q-mm59-7",
        question:
          "Quel est le domaine de définition de s(x) = √(x + 2) / √(x - 1) ?",
        choices: ["x ≥ -2", "x > 1", "x ≥ 1", "x ≥ -2 et x ≠ 1"],
        answerIndex: 1,
        explanation:
          "Au numérateur, on impose x + 2 ≥ 0. Au dénominateur, on impose x - 1 > 0. L’intersection donne x > 1.",
      },
      {
        id: "q-mm59-8",
        question: "Quelle est la bonne méthode générale ?",
        choices: [
          "Chercher seulement les racines",
          "Chercher seulement les dénominateurs",
          "Repérer toutes les contraintes puis les combiner",
          "Toujours répondre ℝ sauf si on voit une fraction",
        ],
        answerIndex: 2,
        explanation:
          "La bonne méthode consiste à repérer toutes les restrictions puis à prendre leur intersection.",
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

export function getQuizById(id: string) {
  const key = normalizeKey(id);
  return quizzes.find((quiz) => normalizeKey(quiz.id) === key);
}

export function getQuizByChapterId(chapterId: string) {
  const key = normalizeKey(chapterId);
  return quizzes.find((quiz) => normalizeKey(quiz.chapterId) === key);
}