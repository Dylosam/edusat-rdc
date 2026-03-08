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
        lessonId: "lesson-definition-polynome",
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
        lessonId: "lesson-degre-polynome",
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
        lessonId: "lesson-operations-polynomes",
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
        lessonId: "lesson-operations-polynomes",
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
        lessonId: "lesson-degre-polynome",
      },
    ],
  },
];

export async function getQuizById(id: string): Promise<Quiz | null> {
  return mockQuizzes.find((quiz) => quiz.id === id) ?? null;
}

export async function getQuizByChapterId(chapterId: string): Promise<Quiz | null> {
  return mockQuizzes.find((quiz) => quiz.chapterId === chapterId) ?? null;
}