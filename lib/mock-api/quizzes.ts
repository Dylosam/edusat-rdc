// lib/mock-api/quizzes.ts
import type { Quiz } from "@/lib/types/quiz";

export const mockQuizzes: Quiz[] = [
  {
    id: "quiz-c1-1",
    chapterId: "c1",
    title: "Quiz Chapitre 1 - Niveau 1",
    description: "Teste tes bases.",
    timeLimitSec: 600,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    questions: [
      {
        id: "q1",
        type: "single_choice",
        question: "2 + 2 = ?",
        options: ["3", "4", "5"],
        correctAnswer: "4",
        explanation: "Addition simple.",
        points: 1,

        // ✅ NEW: si l'élève rate, on lui propose direct la leçon
        // Mets ici l'ID réel d'une leçon dans lib/data/lessons.ts
        lessonId: "l1",
      },
    ],
  },
];