// app/quiz/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Quiz, QuizQuestion } from "@/lib/types/quiz";
import { getQuizById } from "@/lib/quiz/data";
import { computeQuizResult } from "@/lib/quiz/score";
import {
  saveQuizAnswers,
  loadQuizAnswers,
  saveQuizResult,
  loadQuizResult,
  clearQuizAnswers,
  clearQuizResult,
} from "@/lib/quiz/quiz-storage";
import { markQuizCompleted } from "@/lib/progress";

type Props = {
  params: { id: string };
};

const PASS_PERCENT = 70;

export default function QuizPage({ params }: Props) {
  const quizId = params.id;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!quiz || !submitted) return null;
    return computeQuizResult(quiz.questions, answers, PASS_PERCENT);
  }, [quiz, submitted, answers]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const q = await getQuizById(quizId);
      setQuiz(q);
      setLoading(false);
    })();
  }, [quizId]);

  useEffect(() => {
    const savedAnswers = loadQuizAnswers(quizId);
    if (savedAnswers) setAnswers(savedAnswers);

    const savedResult = loadQuizResult(quizId);
    if (savedResult) setSubmitted(true);
  }, [quizId]);

  useEffect(() => {
    saveQuizAnswers(quizId, answers);
  }, [quizId, answers]);

  if (loading) return <div className="p-4">Chargement…</div>;
  if (!quiz) return <div className="p-4">Quiz introuvable.</div>;

  const questions = quiz.questions;
  const current = questions[currentIndex];

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  const onSubmit = () => {
    const res = computeQuizResult(questions, answers, PASS_PERCENT);

    // ✅ progression : chapitre validé si réussi
    if (res.passed) {
      markQuizCompleted(quiz.id, quiz.chapterId);
    }

    saveQuizResult(quizId, res);
    setSubmitted(true);
  };

  const onReset = () => {
    clearQuizAnswers(quizId);
    clearQuizResult(quizId);
    setAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">{quiz.title}</h1>
      {quiz.description && (
        <p className="text-muted-foreground mt-1">{quiz.description}</p>
      )}

      <div className="mt-6 border rounded-xl p-4">
        {!submitted ? (
          <>
            <QuestionBlock
              question={current}
              value={answers[current.id]}
              onChange={(val) =>
                setAnswers((prev) => ({ ...prev, [current.id]: val }))
              }
            />

            <div className="flex items-center justify-between mt-6">
              <button
                className="px-3 py-2 border rounded-lg disabled:opacity-50"
                onClick={goPrev}
                disabled={currentIndex === 0}
                type="button"
              >
                Précédent
              </button>

              <div className="text-sm text-muted-foreground">
                {currentIndex + 1} / {questions.length}
              </div>

              <button
                className="px-3 py-2 border rounded-lg disabled:opacity-50"
                onClick={goNext}
                disabled={currentIndex === questions.length - 1}
                type="button"
              >
                Suivant
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-black text-white"
                onClick={onSubmit}
                type="button"
              >
                Valider
              </button>
              <button
                className="px-4 py-2 rounded-lg border"
                onClick={onReset}
                type="button"
              >
                Réinitialiser
              </button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Seuil de réussite : {PASS_PERCENT}%
            </div>
          </>
        ) : (
          <ResultBlock quiz={quiz} answers={answers} onReset={onReset} />
        )}
      </div>

      {result && (
        <div className="mt-4 text-sm text-muted-foreground">
          Score: <b>{result.totalScore}</b> / {result.maxScore} —{" "}
          <b>{result.percentage.toFixed(2)}%</b>
        </div>
      )}
    </div>
  );
}

function QuestionBlock({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: any;
  onChange: (val: any) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold text-lg">{question.question}</h3>

      {question.type === "single_choice" && (
        <div className="mt-3 grid gap-2">
          {(question.options ?? []).map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name={question.id}
                checked={String(value ?? "") === opt}
                onChange={() => onChange(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === "multiple_choice" && (
        <div className="mt-3 grid gap-2">
          {(question.options ?? []).map((opt) => {
            const arr = Array.isArray(value) ? value : [];
            const checked = arr.includes(opt);

            return (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    if (checked) onChange(arr.filter((x: string) => x !== opt));
                    else onChange([...arr, opt]);
                  }}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === "true_false" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className={`px-3 py-2 rounded-lg border ${
              value === "true" ? "bg-black text-white" : ""
            }`}
            onClick={() => onChange("true")}
          >
            Vrai
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded-lg border ${
              value === "false" ? "bg-black text-white" : ""
            }`}
            onClick={() => onChange("false")}
          >
            Faux
          </button>
        </div>
      )}

      {question.type === "numeric" && (
        <input
          className="mt-3 w-full border rounded-lg px-3 py-2"
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Réponse"
        />
      )}

      {question.type === "text" && (
        <input
          className="mt-3 w-full border rounded-lg px-3 py-2"
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Réponse"
        />
      )}
    </div>
  );
}

function ResultBlock({
  quiz,
  answers,
  onReset,
}: {
  quiz: Quiz;
  answers: Record<string, any>;
  onReset: () => void;
}) {
  const res = computeQuizResult(quiz.questions, answers, PASS_PERCENT);

  return (
    <div>
      <h2 className="text-xl font-bold">Résultat</h2>

      <div className="mt-3 grid gap-1">
        <div>
          Score: <b>{res.totalScore}</b> / {res.maxScore}
        </div>
        <div>
          Pourcentage: <b>{res.percentage.toFixed(2)}%</b>
        </div>
        <div>
          Statut: <b>{res.passed ? "Réussi" : "Échoué"}</b>
        </div>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer">Détails</summary>
        <div className="mt-3 grid gap-3">
          {quiz.questions.map((q) => {
            const d = res.details.find((x) => x.questionId === q.id);
            const user = answers[q.id];

            return (
              <div key={q.id} className="border rounded-xl p-3">
                <div className="font-semibold">{q.question}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Ta réponse:{" "}
                  <b>
                    {Array.isArray(user) ? user.join(", ") : String(user ?? "")}
                  </b>
                </div>
                <div className="mt-2">
                  {d?.isCorrect ? "✅ Correct" : "❌ Faux"} — {d?.score ?? 0}/
                  {q.points ?? 1}
                </div>
                {q.explanation && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Explication: {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </details>

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 rounded-lg border" onClick={onReset}>
          Recommencer
        </button>
      </div>
    </div>
  );
}
