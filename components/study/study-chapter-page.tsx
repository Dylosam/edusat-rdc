"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  PlayCircle,
  Sparkles,
  ChevronLeft,
  Trophy,
  BookOpen,
  Clock3,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

import LessonRenderer from "@/components/study/lesson-renderer";
import { readProgressStore } from "@/lib/progress/index";
import { findQuizByChapterId } from "@/lib/study/quiz-link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { buildStudySteps } from "@/lib/study/build-study-steps";
import {
  getChapterStudyState,
  markStepDone,
  getResumeStepId,
  resetChapterStudyState,
} from "@/lib/study/progress";

import StudyOutline from "@/components/study/study-outline";
import { getLessonById } from "@/lib/data/lessons";
import { LatexBlock } from "@/components/math/latex";

const EMPTY_STATE = {
  progressPercent: 0,
  doneCount: 0,
  doneMap: {} as Record<string, boolean>,
  meta: {
    title: "Chapitre",
    estimatedMinutes: 0,
    subjectLabel: "Matière",
  },
};

function ContentBlock({ block }: { block: any }) {
  if (!block) return null;

  if (block.type === "text") {
    return (
      <p className="leading-8 text-[16px] text-muted-foreground">
        {block.value}
      </p>
    );
  }

  if (block.type === "formula") {
    return (
      <div className="my-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Formule
        </div>

        <div className="flex justify-center py-4">
          <LatexBlock value={String(block.value ?? "")} />
        </div>
      </div>
    );
  }

  if (block.type === "example") {
    return (
      <div className="my-6">
        <div className="mb-2 text-sm font-semibold">Exemple</div>

        <p className="leading-8 text-[16px] text-muted-foreground">
          {block.value}
        </p>
      </div>
    );
  }

  if (block.type === "tip") {
    return (
      <div className="my-6 border-l-4 border-amber-400 pl-4">
        <div className="mb-1 text-sm font-semibold">Astuce</div>

        <p className="leading-8 text-[16px] text-muted-foreground">
          {block.value}
        </p>
      </div>
    );
  }

  return null;
}

export default function StudyChapterPage() {
  const params = useParams();
  const chapterId = params.id as string;

  const steps = useMemo(() => buildStudySteps(chapterId), [chapterId]);

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(EMPTY_STATE);
  const [activeStepId, setActiveStepId] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setState(getChapterStudyState(chapterId, steps));
    setActiveStepId(getResumeStepId(chapterId, steps));
  }, [mounted, chapterId, steps]);

  const progress = mounted ? state.progressPercent : 0;
  const isCompleted = progress >= 100;

  const quiz = useMemo(() => findQuizByChapterId(chapterId), [chapterId]);

  const lastQuizPercent = useMemo(() => {
    if (!mounted || !quiz?.id) return null;
    const store = readProgressStore();
    const result = (store.quizResults ?? {})[String(quiz.id)] as any;
    return typeof result?.percentage === "number"
      ? Math.round(result.percentage)
      : null;
  }, [mounted, quiz?.id]);

  const resumeStepId = mounted
    ? getResumeStepId(chapterId, steps)
    : steps[0]?.id ?? "";

  const activeStep =
    steps.find((step) => step.id === activeStepId) ?? steps[0] ?? null;

  const activeLesson = useMemo(() => {
    if (!activeStep?.id?.startsWith("lesson:")) return null;
    const lessonId = activeStep.id.replace("lesson:", "");
    return getLessonById(lessonId);
  }, [activeStep]);

  function onCompleteStep(stepId: string) {
    markStepDone(chapterId, stepId);
    const next = getChapterStudyState(chapterId, steps);
    setState(next);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/subjects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Link>

          <div className="mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{state.meta.subjectLabel}</Badge>
                <Badge variant="outline">{steps.length} étapes</Badge>
                <Badge variant="outline">
                  {state.doneCount}/{steps.length} validées
                </Badge>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {state.meta.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {state.meta.estimatedMinutes} min
                </span>

                <span>•</span>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Chapitre complété
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <PlayCircle className="h-4 w-4" />
                    En cours
                  </span>
                )}
              </div>

              <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
                {isCompleted
                  ? "Tu as terminé ce chapitre. Tu peux revoir les points clés ou passer directement au quiz."
                  : "Choisis une étape dans le plan du chapitre et concentre-toi sur son contenu complet dans la zone de lecture."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setActiveStepId(resumeStepId)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Reprendre
              </Button>

              {quiz?.id ? (
                <Button asChild className="gap-2">
                  <Link href={`/quiz/${String(quiz.id)}?fresh=1`}>
                    <Trophy className="h-4 w-4" />
                    Aller au quiz
                    {lastQuizPercent !== null ? (
                      <span className="ml-1 opacity-80">({lastQuizPercent}%)</span>
                    ) : null}
                  </Link>
                </Button>
              ) : null}

              <Button
                variant="outline"
                onClick={() => {
                  resetChapterStudyState(chapterId);
                  const next = getChapterStudyState(chapterId, steps);
                  setState(next);
                  setActiveStepId(steps[0]?.id ?? "");
                }}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Progress value={progress} className="h-2.5" />
            <div className="w-12 shrink-0 text-right text-sm text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-20 xl:h-[calc(100vh-110px)]">
            <Card className="h-full overflow-hidden">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <BookOpen className="h-4 w-4" />
                  Plan du chapitre
                </div>
                <div className="text-sm text-muted-foreground">
                  Sélectionne une leçon, un résumé, un diagnostic ou le quiz.
                </div>
              </CardHeader>

              <CardContent className="max-h-[70vh] overflow-y-auto p-4 xl:max-h-[calc(100vh-220px)]">
                <StudyOutline
                  steps={steps}
                  activeStepId={activeStepId}
                  onPick={setActiveStepId}
                  doneMap={state.doneMap}
                />
              </CardContent>
            </Card>
          </aside>

          <section className="min-w-0">
            {!activeStep ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Sélectionne une étape pour commencer.
                </CardContent>
              </Card>
            ) : activeStep.kind === "lesson" && activeLesson ? (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <CardHeader className="border-b pb-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {activeStep.kindLabel || "Leçon"}
                          </Badge>
                          {activeLesson.durationMin ? (
                            <Badge variant="outline">
                              {activeLesson.durationMin} min
                            </Badge>
                          ) : null}
                          {state.doneMap[activeStep.id] ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                              Terminée
                            </Badge>
                          ) : null}
                        </div>

                        <h2 className="text-2xl font-semibold tracking-tight">
                          {activeLesson.title}
                        </h2>

                        {activeLesson.summary ? (
                          <p className="mt-2 text-muted-foreground">
                            {activeLesson.summary}
                          </p>
                        ) : null}
                      </div>

                      <div className="shrink-0">
                        <Button
                          onClick={() => onCompleteStep(activeStep.id)}
                          className="gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {state.doneMap[activeStep.id]
                            ? "Leçon validée"
                            : "J’ai compris"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 py-8">
                    {Array.isArray((activeLesson as any).blocks) &&
                    (activeLesson as any).blocks.length > 0 ? (
                      <LessonRenderer blocks={(activeLesson as any).blocks} />
                    ) : Array.isArray((activeLesson as any).content) &&
                      (activeLesson as any).content.length > 0 ? (
                      (activeLesson as any).content.map(
                        (block: any, index: number) => (
                          <ContentBlock
                            key={`${activeLesson.id}-${index}`}
                            block={block}
                          />
                        )
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Contenu de la leçon en cours de préparation.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : activeStep.kind === "quiz" ? (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <CardHeader className="border-b pb-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">Quiz</Badge>
                          {activeStep.minutes ? (
                            <Badge variant="outline">{activeStep.minutes} min</Badge>
                          ) : null}
                        </div>

                        <h2 className="text-2xl font-semibold tracking-tight">
                          {activeStep.title}
                        </h2>
                        {activeStep.subtitle ? (
                          <p className="mt-2 text-muted-foreground">
                            {activeStep.subtitle}
                          </p>
                        ) : null}
                      </div>

                      {quiz?.id ? (
                        <Button asChild className="gap-2">
                          <Link href={`/quiz/${String(quiz.id)}?fresh=1`}>
                            <Trophy className="h-4 w-4" />
                            Commencer le quiz
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>

                  <CardContent className="py-6">
                    <p className="leading-8 text-[15px] text-muted-foreground">
                      {activeStep.body ||
                        "Teste maintenant ta compréhension du chapitre avec une série de questions ciblées."}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <CardHeader className="border-b pb-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {activeStep.kindLabel || "Étape"}
                          </Badge>
                          {activeStep.minutes ? (
                            <Badge variant="outline">{activeStep.minutes} min</Badge>
                          ) : null}
                          {state.doneMap[activeStep.id] ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                              Terminée
                            </Badge>
                          ) : null}
                        </div>

                        <h2 className="text-2xl font-semibold tracking-tight">
                          {activeStep.title}
                        </h2>

                        {activeStep.subtitle ? (
                          <p className="mt-2 text-muted-foreground">
                            {activeStep.subtitle}
                          </p>
                        ) : null}
                      </div>

                      <div className="shrink-0">
                        <Button
                          onClick={() => onCompleteStep(activeStep.id)}
                          className="gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {state.doneMap[activeStep.id]
                            ? "Étape validée"
                            : "J’ai compris"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="py-6">
                    <div className="space-y-4">
                      {activeStep.katexPreview ? (
                        <div className="overflow-x-auto rounded-xl border bg-muted/30 p-4">
                          <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                            Aperçu
                          </div>
                          <LatexBlock value={String(activeStep.katexPreview)} />
                        </div>
                      ) : null}

                      <p className="whitespace-pre-line leading-8 text-[15px] text-muted-foreground">
                        {activeStep.body || "Contenu en cours de préparation."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="mt-5">
              <Card>
                <CardContent className="py-5 text-sm text-muted-foreground">
                  Astuce : choisis une étape à gauche, lis son contenu complet à
                  droite, puis valide-la quand tu l’as vraiment comprise.
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}