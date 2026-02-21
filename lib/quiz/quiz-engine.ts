// lib/quiz/quiz-engine.ts
import type { Quiz, QuizQuestion } from "@/lib/types/quiz";

/**
 * Réponses utilisateur :
 * - single_choice / true_false : string
 * - text : string
 * - numeric : number
 * - multiple_choice : string[]
 */
export type QuizAnswerMap = Record<string, string | number | string[]>;

export type Correction = {
  questionId: string;
  isCorrect: boolean;
  chosen: string | number | string[] | null;
  correct: string | number | string[];
  pointsEarned: number;
};

export type GradeResult = {
  quizId: string;
  score: number; // points gagnés
  totalPoints: number; // points possibles
  totalQuestions: number;
  corrections: Correction[];
  createdAt: string; // ISO
};

/**
 * Mini "DB" en mémoire (MVP)
 * 👉 IMPORTANT : ton type Quiz doit contenir chapterId (voir lib/types/quiz.ts).
 * 👉 On a supprimé passPercent de Quiz (seuil géré ailleurs).
 */
const ENGINE_QUIZZES: Quiz[] = [
  {
    id: "demo-1",
    title: "Quiz Démo",
    description: "Juste pour tester le moteur",
    chapterId: "chapter-demo-1",
    questions: [
      {
        id: "q1",
        type: "single_choice",
        question: "2 + 2 = ?",
        options: ["3", "4", "5"],
        correctAnswer: "4",
        points: 1,
      },
      {
        id: "q2",
        type: "true_false",
        question: "Le soleil est une étoile.",
        options: ["true", "false"],
        correctAnswer: "true",
        points: 1,
      },
      {
        id: "q3",
        type: "numeric",
        question: "Racine carrée de 9 = ?",
        correctAnswer: 3,
        points: 1,
      },
      {
        id: "q4",
        type: "text",
        question: "Écris 'bonjour' en anglais.",
        correctAnswer: "hello",
        points: 1,
      },
      {
        id: "q5",
        type: "multiple_choice",
        question: "Choisis les nombres pairs.",
        options: ["1", "2", "3", "4"],
        correctAnswer: ["2", "4"],
        points: 2,
      },
    ],
  },
];

export function getEngineQuizById(id: string): Quiz | null {
  const q = ENGINE_QUIZZES.find((x) => String(x.id) === String(id));
  return q ?? null;
}

export function gradeQuiz(quiz: Quiz, answers: QuizAnswerMap): GradeResult {
  let score = 0;
  let totalPoints = 0;

  const corrections: Correction[] = quiz.questions.map((q) => {
    const pts = typeof q.points === "number" ? q.points : 1;
    totalPoints += pts;

    const chosen = (answers[q.id] ?? null) as any;

    const isCorrect = isAnswerCorrect(q, chosen);

    const pointsEarned = isCorrect ? pts : 0;
    score += pointsEarned;

    return {
      questionId: q.id,
      isCorrect,
      chosen: chosen === undefined ? null : chosen,
      correct: q.correctAnswer,
      pointsEarned,
    };
  });

  // ✅ IMPORTANT : pas de logique "progression" ici.
  // Tu l'appelles dans app/quiz/[id]/page.tsx après avoir calculé le résultat.

  return {
    quizId: quiz.id,
    score,
    totalPoints,
    totalQuestions: quiz.questions.length,
    corrections,
    createdAt: new Date().toISOString(),
  };
}

function isAnswerCorrect(q: QuizQuestion, chosen: any): boolean {
  if (chosen === null || chosen === undefined) return false;

  // évite les réponses vides
  if (typeof chosen === "string" && chosen.trim().length === 0) return false;
  if (Array.isArray(chosen) && chosen.length === 0) return false;

  const type = q.type;

  if (type === "numeric") {
    const n = typeof chosen === "number" ? chosen : Number(chosen);
    const expected =
      typeof q.correctAnswer === "number" ? q.correctAnswer : Number(q.correctAnswer);

    if (!Number.isFinite(n) || !Number.isFinite(expected)) return false;

    // ✅ tolérance légère (plus fiable)
    const tolerance = 0.01;
    return Math.abs(n - expected) <= tolerance;
  }

  if (type === "multiple_choice") {
    const expected = Array.isArray(q.correctAnswer)
      ? q.correctAnswer.map(String)
      : [String(q.correctAnswer)];

    const picked = Array.isArray(chosen) ? chosen.map(String) : [String(chosen)];

    // même contenu (ordre ignoré)
    const a = [...expected].map((x) => x.trim().toLowerCase()).sort().join("|");
    const b = [...picked].map((x) => x.trim().toLowerCase()).sort().join("|");

    return a === b;
  }

  // text / single_choice / true_false
  const expected = String(q.correctAnswer ?? "").trim().toLowerCase();
  const got = String(chosen ?? "").trim().toLowerCase();
  return expected === got;
}
