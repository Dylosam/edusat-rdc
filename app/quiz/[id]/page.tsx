// app/quiz/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Quiz, QuizQuestion } from "@/lib/types/quiz";
import { getQuizById } from "@/lib/quiz/data";
import { computeQuizResult } from "@/lib/quiz/score";
import {
<<<<<<< HEAD
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
=======
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { getQuiz, submitQuiz } from '@/lib/mock-api/data';
import type { Quiz, QuizResult } from '@/lib/types';
import { toast } from 'sonner';

import { LatexBlock } from '@/components/math/latex';
import { normalizeLatex } from '@/lib/utils/latex';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.id as string;
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)

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

<<<<<<< HEAD
    const savedResult = loadQuizResult(quizId);
    if (savedResult) setSubmitted(true);
  }, [quizId]);
=======
  if (!quiz) return null;
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)

  useEffect(() => {
    saveQuizAnswers(quizId, answers);
  }, [quizId, answers]);

<<<<<<< HEAD
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
=======
  const handleAnswerChange = (value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    // ✅ Fix: si la réponse est 0, !answers[q.id] la considérait vide
    const unanswered = quiz.questions.filter(
      (q) => answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === ''
    );

    if (unanswered.length > 0) {
      toast.error(`Il reste ${unanswered.length} question(s) sans réponse`);
      return;
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
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

<<<<<<< HEAD
=======
  if (isSubmitted && result) {
    const scorePercentage = (result.score / result.totalQuestions) * 100;
    const passed = scorePercentage >= 60;

    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4">
                  {passed ? (
                    <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-green-600" />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <RotateCcw className="h-10 w-10 text-yellow-600" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-3xl font-serif">
                  {passed ? 'Félicitations !' : 'Continuez vos efforts !'}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="text-5xl font-bold mb-2">{scorePercentage.toFixed(0)}%</div>
                  <p className="text-muted-foreground">
                    {result.score} bonnes réponses sur {result.totalQuestions}
                  </p>
                </div>

                <div className="space-y-3">
                  {quiz.questions.map((question) => {
                    const userAnswer = String(answers[question.id]);
                    const correctAnswer = String(question.correctAnswer);
                    const isCorrect = userAnswer === correctAnswer;

                    const latex = normalizeLatex(question.latex);

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border ${
                          isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : 'border-red-500 bg-red-50 dark:bg-red-950'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}

                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm mb-2">{question.question}</p>

                            {latex ? (
                              <div className="rounded-lg border border-border/50 bg-muted/30 p-3 mb-2">
                                <LatexBlock value={latex} />
                              </div>
                            ) : null}

                            {!isCorrect && (
                              <p className="text-xs text-muted-foreground">
                                Votre réponse: {userAnswer} • Bonne réponse: {correctAnswer}
                              </p>
                            )}

                            {question.explanation && !isCorrect && (
                              <p className="text-xs mt-2 text-muted-foreground">
                                {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={handleRetake} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Refaire le quiz
                  </Button>
                  <Button onClick={() => router.back()}>
                    Retour au chapitre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  const latex = normalizeLatex(currentQuestion.latex);

>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
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

<<<<<<< HEAD
              <div className="text-sm text-muted-foreground">
                {currentIndex + 1} / {questions.length}
              </div>

              <button
                className="px-3 py-2 border rounded-lg disabled:opacity-50"
                onClick={goNext}
                disabled={currentIndex === questions.length - 1}
                type="button"
              >
=======
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>

                  {latex ? (
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4 mt-4">
                      <LatexBlock value={latex} />
                    </div>
                  ) : null}
                </CardHeader>

                <CardContent className="space-y-4">
                  {currentQuestion.type === 'mcq' && currentQuestion.options && (
                    <RadioGroup
                      value={String(answers[currentQuestion.id] ?? '')}
                      onValueChange={handleAnswerChange}
                    >
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                        >
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === 'numeric' && (
                    <div>
                      <Label htmlFor="numeric-answer" className="mb-2 block">
                        Votre réponse :
                      </Label>
                      <Input
                        id="numeric-answer"
                        type="number"
                        placeholder="Entrez votre réponse"
                        value={String(answers[currentQuestion.id] ?? '')}
                        onChange={(e) => {
                          const v = e.target.value;
                          handleAnswerChange(v === '' ? '' : Number(v));
                        }}
                        className="text-lg"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button onClick={handleSubmit} size="lg">
                Soumettre le quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
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