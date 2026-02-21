"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

import { DashboardNav } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Clock,
} from "lucide-react";

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
import { saveAttempt } from "@/lib/quiz/attempts-storage";

import { useQuizTimer, formatTime } from "@/lib/quiz/use-quiz-timer";
import {
  loadQuizSession,
  saveQuizSession,
  clearQuizSession,
  type QuizSessionState,
} from "@/lib/quiz/quiz-session-storage";

const PASS_PERCENT = 70;

type StoredQuizResult = ReturnType<typeof computeQuizResult>;

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeAnswer(value: any, q: QuizQuestion) {
  if (q.type === "multiple_choice") return Array.isArray(value) ? value : [];
  if (q.type === "numeric")
    return value === "" || value === null || value === undefined
      ? ""
      : String(value);
  return value ?? "";
}

function formatAnswer(val: any): string {
  if (val === null || val === undefined) return "—";
  if (Array.isArray(val)) return val.map(String).join(", ");
  return String(val);
}

function isAnswered(q: QuizQuestion, value: any) {
  if (q.type === "multiple_choice") return Array.isArray(value) && value.length > 0;
  if (q.type === "numeric") return value !== "" && value !== null && value !== undefined;
  if (q.type === "text") return String(value ?? "").trim().length > 0;
  return value !== "" && value !== null && value !== undefined;
}

function buildSessionFromQuiz(quiz: Quiz): {
  questions: QuizQuestion[];
  questionOrder?: string[];
  optionsOrder?: Record<string, string[]>;
} {
  let qs = [...(quiz.questions ?? [])];
  let questionOrder: string[] | undefined;
  let optionsOrder: Record<string, string[]> | undefined;

  if (quiz.shuffleQuestions) {
    qs = shuffle(qs);
    questionOrder = qs.map((q) => q.id);
  }

  if (quiz.shuffleOptions) {
    optionsOrder = {};
    qs = qs.map((q) => {
      if (!q.options) return q;
      const shuffled = shuffle(q.options);
      optionsOrder![q.id] = shuffled;
      return { ...q, options: shuffled };
    });
  }

  return { questions: qs, questionOrder, optionsOrder };
}

function applyOrderFromSession(quiz: Quiz, session: QuizSessionState): QuizQuestion[] {
  const base = [...(quiz.questions ?? [])];

  let ordered = base;
  if (session.questionOrder?.length) {
    const map = new Map(base.map((q) => [q.id, q] as const));
    const rebuilt: QuizQuestion[] = [];
    for (let i = 0; i < session.questionOrder.length; i++) {
      const q = map.get(session.questionOrder[i]);
      if (q) rebuilt.push(q);
    }
    if (rebuilt.length > 0) {
      const used = new Set(rebuilt.map((q) => q.id));
      const missing = base.filter((q) => !used.has(q.id));
      ordered = [...rebuilt, ...missing];
    }
  }

  if (session.optionsOrder) {
    ordered = ordered.map((q) => {
      const ord = session.optionsOrder?.[q.id];
      if (!ord || !q.options) return q;

      const set = new Set(q.options);
      const clean = ord.filter((x) => set.has(x));
      const used = new Set(clean);
      const missing = q.options.filter((x) => !used.has(x));
      return { ...q, options: [...clean, ...missing] };
    });
  }

  return ordered;
}

/** 🔒 sécurise chapterId pour éviter le redirect /subjects */
function resolveChapterId(quiz: Quiz | null, quizId: string): string | null {
  const fromQuiz = (quiz as any)?.chapterId;
  if (typeof fromQuiz === "string" && fromQuiz.trim().length) return fromQuiz;

  // patterns fréquents
  if (quizId.startsWith("quiz-")) {
    const guess = quizId.replace(/^quiz-/, "");
    if (guess.trim().length) return guess;
  }

  // si ton quizId est déjà le chapterId
  if (quizId.trim().length) return quizId;

  return null;
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const quizId = params?.id as string;
  const fresh = searchParams.get("fresh"); // ✅ dépendance clé

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ✅ SOURCE DE VÉRITÉ pour l'écran résultat (évite 0% quand answers vides)
  const [storedResult, setStoredResult] = useState<StoredQuizResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const startedAtRef = useRef<number | null>(null);

  /** ✅ Reset "hard" (utilisé pour "Refaire") */
  const hardReset = () => {
    clearQuizAnswers(quizId);
    clearQuizResult(quizId);
    clearQuizSession(quizId);

    setAnswers({});
    setIsSubmitted(false);
    setStoredResult(null);
    setCurrentQuestionIndex(0);
    setSessionQuestions([]);
    startedAtRef.current = null;
  };

  /**
   * ✅ IMPORTANT :
   * si fresh existe => reset AVANT de recharger answers/result/session
   */
  useEffect(() => {
    if (!fresh) return;
    hardReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, fresh]);

  // Load quiz
  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const q = await getQuizById(quizId);
      if (!alive) return;
      setQuiz(q);
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [quizId]);

  // Load stored answers/result (après reset éventuel via fresh)
  useEffect(() => {
    const savedAnswers = loadQuizAnswers(quizId);
    if (savedAnswers) setAnswers(savedAnswers);

    const savedResult = loadQuizResult(quizId) as StoredQuizResult | null;
    if (savedResult) {
      setStoredResult(savedResult);
      setIsSubmitted(true);
    } else {
      setStoredResult(null);
      setIsSubmitted(false);
    }
  }, [quizId, fresh]);

  // Restore session (order + index + timer) or create a fresh one
  useEffect(() => {
    if (!quiz) return;

    // si résultat stocké => pas de session, juste questions dans l'ordre original
    const savedResult = loadQuizResult(quizId);
    if (savedResult) {
      clearQuizSession(quizId);
      setSessionQuestions(quiz.questions ?? []);
      return;
    }

    const s = loadQuizSession(quizId);
    if (s) {
      const qs = applyOrderFromSession(quiz, s);
      setSessionQuestions(qs);
      setCurrentQuestionIndex(
        Math.min(Math.max(0, s.currentIndex ?? 0), Math.max(0, qs.length - 1))
      );
      startedAtRef.current = s.startedAt;
      return;
    }

    // create new session
    const built = buildSessionFromQuiz(quiz);
    setSessionQuestions(built.questions);
    setCurrentQuestionIndex(0);

    const startedAt = Date.now();
    startedAtRef.current = startedAt;

    saveQuizSession(quizId, {
      quizId,
      startedAt,
      remainingSec: quiz.timeLimitSec ? quiz.timeLimitSec : 0,
      running: Boolean(quiz.timeLimitSec),
      currentIndex: 0,
      questionOrder: built.questionOrder,
      optionsOrder: built.optionsOrder,
    });
  }, [quiz, quizId, fresh]);

  const questions = sessionQuestions.length ? sessionQuestions : quiz?.questions ?? [];
  const totalQuestions = questions.length;

  // Timer
  const timeLimitSec = quiz?.timeLimitSec ?? 0;

  const initialRemaining = useMemo(() => {
    if (!quiz) return 1;
    if (!quiz.timeLimitSec) return 1;
    const s = loadQuizSession(quizId);
    if (s && typeof s.remainingSec === "number") return Math.max(0, s.remainingSec);
    return quiz.timeLimitSec;
  }, [quiz, quizId, fresh]);

  const timer = useQuizTimer({
    enabled: Boolean(timeLimitSec),
    initialRemainingSec: initialRemaining,
    onTimeUp: () => {
      if (!isSubmitted && quiz) handleSubmit(true);
    },
    onRemainingChange: (remaining, running) => {
      if (!quiz?.timeLimitSec) return;
      if (isSubmitted) return;

      const s = loadQuizSession(quizId);
      saveQuizSession(quizId, {
        quizId,
        startedAt: startedAtRef.current ?? Date.now(),
        remainingSec: remaining,
        running,
        currentIndex: s?.currentIndex ?? currentQuestionIndex,
        questionOrder: s?.questionOrder,
        optionsOrder: s?.optionsOrder,
      });
    },
  });

  // Start timer
  useEffect(() => {
    if (!quiz?.timeLimitSec) return;
    if (isSubmitted) return;
    const s = loadQuizSession(quizId);
    if (s?.running) timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.timeLimitSec, quizId, isSubmitted]);

  // Persist answers
  useEffect(() => {
    if (isSubmitted) return;
    saveQuizAnswers(quizId, answers);
  }, [quizId, answers, isSubmitted]);

  // Persist navigation index
  useEffect(() => {
    if (!quiz) return;
    if (isSubmitted) return;

    const s = loadQuizSession(quizId);
    saveQuizSession(quizId, {
      quizId,
      startedAt: startedAtRef.current ?? Date.now(),
      remainingSec: quiz.timeLimitSec ? timer.remaining : 0,
      running: quiz.timeLimitSec ? timer.running : false,
      currentIndex: currentQuestionIndex,
      questionOrder: s?.questionOrder,
      optionsOrder: s?.optionsOrder,
    });
  }, [currentQuestionIndex, quiz, quizId, isSubmitted, timer.remaining, timer.running]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!quiz || totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Quiz introuvable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Le quiz n’existe pas ou ne contient aucune question.
              </p>
              <Button asChild variant="outline">
                <Link href="/subjects">Retour aux matières</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerChange = (value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = (auto = false) => {
    if (!auto) {
      const unanswered = questions.filter((q) => !isAnswered(q, answers[q.id]));
      if (unanswered.length > 0) {
        toast.error(`Il reste ${unanswered.length} question(s) sans réponse`);
        return;
      }
    }

    const res = computeQuizResult(questions, answers, PASS_PERCENT);
    setIsSubmitted(true);
    setStoredResult(res);

    // ✅ progression : chapitre validé si réussi
    if (res.passed) {
      // markQuizCompleted attend (quizId, chapterId) chez toi d'après ton code
      markQuizCompleted(quiz.id, (quiz as any).chapterId);
    }

    // ✅ stats locales
    const startedAt = startedAtRef.current ?? Date.now();
    const durationSec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    saveAttempt(quizId, {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      quizId,
      createdAt: Date.now(),
      durationSec,
      totalScore: res.totalScore,
      maxScore: res.maxScore,
      percentage: res.percentage,
      passed: res.passed,
      answers,
    });

    saveQuizResult(quizId, res);

    if (quiz.timeLimitSec) timer.pause();
    clearQuizSession(quizId);

    toast.success(auto ? "Temps écoulé — quiz soumis." : "Quiz soumis avec succès !");
  };

  const handleRetake = () => {
    hardReset();

    // rebuild order
    const built = buildSessionFromQuiz(quiz);
    setSessionQuestions(built.questions);

    const startedAt = Date.now();
    startedAtRef.current = startedAt;

    saveQuizSession(quizId, {
      quizId,
      startedAt,
      remainingSec: quiz.timeLimitSec ? quiz.timeLimitSec : 0,
      running: Boolean(quiz.timeLimitSec),
      currentIndex: 0,
      questionOrder: built.questionOrder,
      optionsOrder: built.optionsOrder,
    });

    if (quiz.timeLimitSec) {
      timer.reset(quiz.timeLimitSec);
      timer.start();
    }

    // ✅ optionnel : rester sur /quiz/[id] sans changer de route
    toast.success("Nouvelle tentative prête ✅");
  };

  // RESULT VIEW
  if (isSubmitted) {
    const res = storedResult ?? (loadQuizResult(quizId) as StoredQuizResult | null)
      ?? computeQuizResult(questions, answers, PASS_PERCENT);

    const scorePercentage = res.percentage;
    const passed = res.passed;

    const chapterIdResolved = resolveChapterId(quiz, quizId);

    const goBackToChapter = () => {
      if (!chapterIdResolved) {
        router.push("/subjects");
        return;
      }
      router.push(`/chapters/${chapterIdResolved}?tab=quiz`);
    };

    const isPerfect = Math.round(res.percentage) === 100;

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
                  {passed ? "Félicitations !" : "Continuez vos efforts !"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="text-5xl font-bold mb-2">
                    {scorePercentage.toFixed(0)}%
                  </div>
                  <p className="text-muted-foreground">
                    {res.totalScore} points sur {res.maxScore}
                  </p>
                </div>

                <div className="space-y-3">
                  {questions.map((question) => {
                    const userAnswer = (res as any)?.answers?.[question.id] ?? answers[question.id];
                    const correctAnswer = question.correctAnswer;

                    const d = res.details?.find((x: any) => x.questionId === question.id);
                    const isCorrect = d ? Boolean(d.isCorrect) : String(userAnswer) === String(correctAnswer);

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border ${
                          isCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                            : "border-red-500 bg-red-50 dark:bg-red-950"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm mb-1">
                              {question.question}
                            </p>

                            {!isCorrect ? (
                              <p className="text-xs text-muted-foreground">
                                Votre réponse: {formatAnswer(userAnswer)} • Bonne réponse:{" "}
                                {formatAnswer(correctAnswer)}
                              </p>
                            ) : null}

                            {question.explanation && !isCorrect ? (
                              <p className="text-xs mt-2 text-muted-foreground">
                                {question.explanation}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ✅ actions clean (pas de doublon, pas de refaire si 100%) */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  {!isPerfect ? (
                    <Button variant="outline" onClick={handleRetake}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Refaire le quiz
                    </Button>
                  ) : null}

                  <Button className="bg-white text-black hover:bg-white/90" onClick={goBackToChapter}>
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

  // QUIZ VIEW
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Abandonner le quiz
          </Button>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">
                Question {currentQuestionIndex + 1} sur {totalQuestions}
              </h2>

              <div className="flex items-center gap-3">
                {quiz.timeLimitSec ? (
                  <span className="text-sm text-muted-foreground inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatTime(timer.remaining)}
                  </span>
                ) : null}

                <span className="text-sm text-muted-foreground">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <Progress value={progressPercentage} />
          </div>

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
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* SINGLE CHOICE */}
                  {currentQuestion.type === "single_choice" && currentQuestion.options ? (
                    <RadioGroup
                      value={String(answers[currentQuestion.id] ?? "")}
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
                  ) : null}

                  {/* MULTIPLE CHOICE */}
                  {currentQuestion.type === "multiple_choice" && currentQuestion.options ? (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => {
                        const arr = Array.isArray(answers[currentQuestion.id])
                          ? (answers[currentQuestion.id] as string[])
                          : [];
                        const checked = arr.includes(option);

                        return (
                          <label
                            key={index}
                            className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) handleAnswerChange(arr.filter((x) => x !== option));
                                else handleAnswerChange([...arr, option]);
                              }}
                            />
                            <span className="flex-1 cursor-pointer text-sm">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* TRUE / FALSE */}
                  {currentQuestion.type === "true_false" ? (
                    <RadioGroup
                      value={String(answers[currentQuestion.id] ?? "")}
                      onValueChange={handleAnswerChange}
                    >
                      {["true", "false"].map((v, index) => (
                        <div
                          key={v}
                          className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                        >
                          <RadioGroupItem value={v} id={`tf-${index}`} />
                          <Label htmlFor={`tf-${index}`} className="flex-1 cursor-pointer">
                            {v === "true" ? "Vrai" : "Faux"}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : null}

                  {/* NUMERIC */}
                  {currentQuestion.type === "numeric" ? (
                    <div>
                      <Label htmlFor="numeric-answer" className="mb-2 block">
                        Votre réponse :
                      </Label>
                      <Input
                        id="numeric-answer"
                        type="number"
                        placeholder="Entrez votre réponse"
                        value={normalizeAnswer(answers[currentQuestion.id], currentQuestion)}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="text-lg"
                      />
                    </div>
                  ) : null}

                  {/* TEXT */}
                  {currentQuestion.type === "text" ? (
                    <div>
                      <Label htmlFor="text-answer" className="mb-2 block">
                        Votre réponse :
                      </Label>
                      <Input
                        id="text-answer"
                        type="text"
                        placeholder="Entrez votre réponse"
                        value={normalizeAnswer(answers[currentQuestion.id], currentQuestion)}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="text-lg"
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button onClick={() => handleSubmit(false)} size="lg">
                Soumettre le quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {quiz.timeLimitSec ? (
            <p className="mt-6 text-xs text-muted-foreground">
              Anti-refresh activé : ton timer et ta progression sont sauvegardés.
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}