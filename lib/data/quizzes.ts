// lib/data/quizzes.ts

export const quizzes = [
  {
    id: "quiz-c2-1",
    title: "Quiz - Chapitre c2-1",
    chapterId: "c2-1",
    questions: [
      {
        id: "q1",
        type: "single_choice",
        question: "2 + 3 = ?",
        options: ["4", "5", "6"],
        correctAnswer: "5",
        points: 1,
      },
      {
        id: "q2",
        type: "true_false",
        question: "Une fonction peut associer 2 sorties au même x.",
        options: ["true", "false"],
        correctAnswer: "false",
        points: 1,
      },
    ],
  },
];
