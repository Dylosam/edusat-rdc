// lib/quiz/quiz-adapter.ts
import type { Quiz, QuizQuestion, QuestionType } from "@/lib/types/quiz";

/**
 * Adaptateur "tolérant" : prend n'importe quel format backend/mock
 * et retourne notre format Quiz/QuizQuestion unifié.
 *
 * ✅ pas de passPercent
 */
export function adaptQuiz(raw: any): Quiz {
  const questionsRaw =
    raw?.questions ??
    raw?.items ??
    raw?.data?.questions ??
    raw?.quiz?.questions ??
    [];

  return {
    id: String(raw?.id ?? raw?._id ?? raw?.quizId ?? ""),
    title: String(raw?.title ?? raw?.name ?? "Quiz"),
    description: raw?.description ? String(raw.description) : undefined,
    questions: Array.isArray(questionsRaw)
      ? questionsRaw.map(adaptQuestion).filter(Boolean)
      : [],
  };
}

function adaptQuestion(q: any): QuizQuestion {
  const type = normalizeType(q?.type ?? q?.questionType ?? q?.kind);

  const id = String(q?.id ?? q?._id ?? q?.questionId ?? "");
  const questionText = String(q?.question ?? q?.label ?? q?.text ?? "");

  // options pour QCM
  const options =
    Array.isArray(q?.options)
      ? q.options.map(String)
      : Array.isArray(q?.choices)
      ? q.choices.map(String)
      : Array.isArray(q?.answers)
      ? q.answers.map(String)
      : undefined;

  // correctAnswer : supporte plusieurs noms côté data
  const correctAnswer =
    q?.correctAnswer ??
    q?.correct ??
    q?.answer ??
    q?.solution ??
    q?.expected ??
    "";

  // points
  const points =
    typeof q?.points === "number"
      ? q.points
      : typeof q?.score === "number"
      ? q.score
      : typeof q?.weight === "number"
      ? q.weight
      : 1;

  // explanation
  const explanation = q?.explanation
    ? String(q.explanation)
    : q?.reason
    ? String(q.reason)
    : q?.hint
    ? String(q.hint)
    : undefined;

  // fallback id si manquant
  const finalId = id || safeIdFromText(questionText);

  // normalisation correctAnswer selon type
  const normalizedCorrect = normalizeCorrectAnswer(type, correctAnswer);

  // true_false : si pas d'options, on met par défaut
  const finalOptions =
    type === "true_false" ? ["true", "false"] : options;

  return {
    id: finalId,
    type,
    question: questionText,
    options: finalOptions,
    correctAnswer: normalizedCorrect,
    explanation,
    points,
  };
}

function normalizeType(v: any): QuestionType {
  const t = String(v ?? "").trim().toLowerCase();

  if (["single", "single_choice", "qcm", "mcq", "one"].includes(t))
    return "single_choice";
  if (["multi", "multiple", "multiple_choice", "checkbox"].includes(t))
    return "multiple_choice";
  if (["tf", "truefalse", "true_false", "boolean"].includes(t))
    return "true_false";
  if (["num", "numeric", "number"].includes(t)) return "numeric";
  if (["text", "free", "input", "short_text"].includes(t)) return "text";

  return "single_choice";
}

function normalizeCorrectAnswer(
  type: QuestionType,
  raw: any
): string | string[] | number {
  if (type === "multiple_choice") {
    if (Array.isArray(raw)) return raw.map(String);
    const s = String(raw ?? "").trim();
    if (!s) return [];
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
    return [s];
  }

  if (type === "numeric") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }

  if (type === "true_false") {
    const s = String(raw ?? "").trim().toLowerCase();
    if (["true", "1", "vrai", "yes"].includes(s)) return "true";
    if (["false", "0", "faux", "no"].includes(s)) return "false";
    return s || "false";
  }

  return String(raw ?? "");
}

function safeIdFromText(text: string) {
  const base = (text || "q")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "q"}-${Math.random().toString(16).slice(2, 10)}`;
}

/**
 * ✅ Fix de ton erreur:
 * Tu importes getEngineQuizById depuis quiz-adapter,
 * donc on le ré-exporte depuis quiz-engine.
 */
export { getEngineQuizById } from "@/lib/quiz/quiz-engine";
