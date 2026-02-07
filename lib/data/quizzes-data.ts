// lib/data/quizzes-data.ts
import type { Quiz } from "@/lib/types";

export const QUIZZES_DATA: Quiz[] = [
  {
    id: "quiz-c1-1",
    chapterId: "c1-1",
    title: "Quiz — Introduction aux fonctions",
    timeLimit: 10 * 60,
    questions: [
      {
        id: "q1",
        type: "mcq",
        question: "Une fonction associe à chaque x…",
        options: [
          "Plusieurs résultats possibles",
          "Un seul résultat f(x)",
          "Toujours 0",
          "Uniquement des lettres",
        ],
        correctAnswer: "Un seul résultat f(x)",
        explanation: "Par définition, une fonction associe à chaque x une unique image f(x).",
      },
      {
        id: "q2",
        type: "numeric",
        question: "Si f(x)=2x+1, calcule f(3).",
        correctAnswer: 7,
        explanation: "f(3)=2×3+1=7",
        latex: "f(3)=2\\times 3 + 1 = 7",
      },
    ],
  },
];
