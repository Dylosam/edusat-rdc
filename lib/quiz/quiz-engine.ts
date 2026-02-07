// lib/quiz/quiz-engine.ts

export type QuizQuestionType = "mcq" | "numeric" | "text";

export type QuizQuestion = {
  id: string;

  // ✅ OBLIGATOIRE pour que l'UI sache quel input afficher
  type: QuizQuestionType;

  // ✅ texte affiché
  question: string;

  // ✅ QCM
  options?: string[];

  // ✅ réponse attendue (string pour mcq/text, number pour numeric)
  correctAnswer: string | number;

  // ✅ optionnel : sert au feedback "revoir telle leçon"
  lessonIds?: string[];
};

export type Quiz = {
  id: string;
  title: string;

  // ✅ IMPORTANT : quiz lié à un chapitre
  chapterId: string;

  // seuil de réussite
  passPercent?: number; // défaut 70

  questions: QuizQuestion[];
};

export type QuizAnswerValue = string | number | null;
export type QuizAnswerMap = Record<string, QuizAnswerValue>;

export type QuizCorrectionItem = {
  questionId: string;
  isCorrect: boolean;
  chosen: QuizAnswerValue;
  correctAnswer: string | number;
  lessonIds: string[];
};

export type QuizResult = {
  // ✅ Identité
  quizId: string;
  chapterId: string;

  // ✅ Champs "compat UI" (ceux que ton UI utilisait déjà)
  score: number; // = correct
  totalQuestions: number; // = total
  answers: Record<string, string | number>; // valeurs non-null
  completedAt: string; // ISO

  // ✅ Champs "moteur"
  total: number;
  correct: number;
  percent: number;
  passed: boolean;
  passPercent: number;

  corrections: QuizCorrectionItem[];
  weakLessonIds: string[];

  createdAt: string; // ISO (alias de completedAt)
};

function normalizeText(s: string) {
  return s.trim().toLowerCase();
}

export function normalizeAnswers(quiz: Quiz, answers: QuizAnswerMap): QuizAnswerMap {
  const out: QuizAnswerMap = {};
  for (const q of quiz.questions) {
    const v = answers[q.id];
    out[q.id] = v === undefined ? null : v;
  }
  return out;
}

function isAnswerCorrect(q: QuizQuestion, chosen: QuizAnswerValue): boolean {
  if (chosen === null) return false;

  if (q.type === "mcq") {
    // on compare la string choisie à la bonne string
    return String(chosen) === String(q.correctAnswer);
  }

  if (q.type === "numeric") {
    const chosenNum = typeof chosen === "number" ? chosen : Number(chosen);
    const correctNum = typeof q.correctAnswer === "number" ? q.correctAnswer : Number(q.correctAnswer);
    if (Number.isNaN(chosenNum) || Number.isNaN(correctNum)) return false;
    return chosenNum === correctNum;
  }

  // text
  return normalizeText(String(chosen)) === normalizeText(String(q.correctAnswer));
}

export function gradeQuiz(quiz: Quiz, answers: QuizAnswerMap): QuizResult {
  const passPercent = typeof quiz.passPercent === "number" ? quiz.passPercent : 70;
  const normalized = normalizeAnswers(quiz, answers);

  let correct = 0;
  const corrections: QuizCorrectionItem[] = [];

  for (const q of quiz.questions) {
    const chosen = normalized[q.id] ?? null;
    const ok = isAnswerCorrect(q, chosen);
    if (ok) correct += 1;

    corrections.push({
      questionId: q.id,
      isCorrect: ok,
      chosen,
      correctAnswer: q.correctAnswer,
      lessonIds: q.lessonIds ?? [],
    });
  }

  const total = quiz.questions.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  const passed = percent >= passPercent;

  // ✅ recos: lessonIds des questions ratées (dédupliqués)
  const weakLessonIds = Array.from(
    new Set(
      corrections
        .filter((c) => !c.isCorrect)
        .flatMap((c) => c.lessonIds)
        .filter(Boolean)
    )
  );

  const createdAt = new Date().toISOString();

  // ✅ answers "compat UI": on enlève les null/undefined
  const answersNonNull: Record<string, string | number> = {};
  for (const q of quiz.questions) {
    const v = normalized[q.id];
    if (v !== null && v !== undefined && String(v).length > 0) {
      answersNonNull[q.id] = typeof v === "number" ? v : String(v);
    }
  }

  return {
    quizId: quiz.id,
    chapterId: quiz.chapterId,

    // compat UI
    score: correct,
    totalQuestions: total,
    answers: answersNonNull,
    completedAt: createdAt,

    // moteur
    total,
    correct,
    percent,
    passed,
    passPercent,
    corrections,
    weakLessonIds,
    createdAt,
  };
}

export function buildQuizFeedback(result: QuizResult): { headline: string; detail: string } {
  if (result.total === 0) {
    return { headline: "Quiz vide", detail: "Aucune question trouvée." };
  }

  if (result.passed) {
    return {
      headline: `Bravo ✅ ${result.percent}%`,
      detail: `Tu as réussi (${result.correct}/${result.total}). Chapitre validé.`,
    };
  }

  const missing = result.total - result.correct;
  return {
    headline: `Encore un effort ⚠️ ${result.percent}%`,
    detail: `Tu as ${missing} erreur(s). Revois les leçons recommandées puis retente.`,
  };
}
