"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, PlayCircle, Sparkles, ChevronLeft } from "lucide-react";
import { readProgressStore } from "@/lib/progress/index";
import { findQuizByChapterId } from "@/lib/study/quiz-link";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { buildStudySteps } from "@/lib/study/build-study-steps";
import {
  getChapterStudyState,
  markStepDone,
  getResumeStepId,
  resetChapterStudyState,
} from "@/lib/study/progress";

import StudyOutline from "@/components/study/study-outline";
import StudyStepCard from "@/components/study/study-step-card";
import StudyCoachPanel from "@/components/study/study-coach-panel";

export default function StudyChapterPage() {
  const params = useParams();
  const chapterId = params.id as string;

  const steps = useMemo(() => buildStudySteps(chapterId), [chapterId]);

  const [state, setState] = useState(() => getChapterStudyState(chapterId, steps));
  const [activeStepId, setActiveStepId] = useState(() => getResumeStepId(chapterId, steps));

  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setState(getChapterStudyState(chapterId, steps));
    setActiveStepId(getResumeStepId(chapterId, steps));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, steps]);

  const progress = state.progressPercent;

  function scrollToStep(stepId: string) {
    setActiveStepId(stepId);
    const el = stepRefs.current[stepId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  
  const quiz = useMemo(() => findQuizByChapterId(chapterId), [chapterId]);

const lastQuizPercent = useMemo(() => {
  if (!quiz?.id) return null;
  const store = readProgressStore();
  const r = (store.quizResults ?? {})[String(quiz.id)] as any;
  return typeof r?.percentage === "number" ? Math.round(r.percentage) : null;
}, [quiz?.id]);

  function onCompleteStep(stepId: string) {
    markStepDone(chapterId, stepId);

    const next = getChapterStudyState(chapterId, steps);
    setState(next);

    // ✅ navigation simple : step suivante dans la liste
    const idx = steps.findIndex((s) => s.id === stepId);
    const nextStep = steps[idx + 1];
    if (nextStep) scrollToStep(nextStep.id);
  }

  {quiz?.id ? (
  <Button asChild variant="default" className="gap-2">
    <Link href={`/quiz/${String(quiz.id)}`}>
      <PlayCircle className="h-4 w-4" />
      Aller au quiz
      {lastQuizPercent !== null ? <span className="ml-2 opacity-80">({lastQuizPercent}%)</span> : null}
    </Link>
  </Button>
) : null}

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <div className="flex items-center gap-3">
            <Link href="/subjects" className="text-sm text-muted-foreground hover:text-foreground">
              <span className="inline-flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Retour
              </span>
            </Link>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{state.meta.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{state.meta.estimatedMinutes} min</span>
                  <span>•</span>
                  {progress >= 100 ? (
                    <div className="text-xs text-muted-foreground">
  Objectif : consolider tes points faibles. Tu peux aller au quiz quand tu veux.
</div>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" />
                      En cours
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => scrollToStep(getResumeStepId(chapterId, steps))}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Reprendre
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    resetChapterStudyState(chapterId);
                    const next = getChapterStudyState(chapterId, steps);
                    setState(next);

                    const first = steps[0]?.id ?? "intro";
                    setActiveStepId(first);
                    scrollToStep(first);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Progress value={progress} className="h-2" />
              <div className="w-12 text-right text-sm text-muted-foreground">
                {Math.round(progress)}%
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{state.meta.subjectLabel}</Badge>
              <Badge variant="outline">{steps.length} étapes</Badge>
              <Badge variant="outline">
                {state.doneCount}/{steps.length} validées
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_320px]">
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-96px)]">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="text-sm font-semibold">Plan du chapitre</div>
                <div className="text-xs text-muted-foreground">
                  Tout est accessible. Choisis ce qui te renforce.
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <StudyOutline
                  chapterId={chapterId}
                  steps={steps}
                  activeStepId={activeStepId}
                  onPick={scrollToStep}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-0 h-full w-px bg-border" />
              <div className="space-y-4">
                {steps.map((step) => {
                  const done = state.doneMap[step.id] === true;

                  return (
                    <div
                      key={step.id}
                      ref={(el) => {
                        stepRefs.current[step.id] = el;
                      }}
                    >
                      <div className="relative pl-12">
                        <div className="absolute left-[10px] top-6">
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <PlayCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>

                        <StudyStepCard
                          step={step}
                          done={done}
                          unlocked={true}
                          onFocus={() => setActiveStepId(step.id)}
                          onComplete={() => onCompleteStep(step.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <Card>
              <CardContent className="py-5">
                <div className="text-sm text-muted-foreground">
                  Astuce : Indice 1 → Indice 2 → Exemple RDC → Solution.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-96px)]">
            <StudyCoachPanel chapterId={chapterId} activeStepId={activeStepId} />
          </div>
        </div>
      </div>
    </div>
  );
}