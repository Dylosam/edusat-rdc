"use client";

import { useMemo, useState } from "react";
import { Sparkles, Send, Lightbulb, GraduationCap, MapPin, Target } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { buildStudySteps } from "@/lib/study/build-study-steps";
import { findQuizByChapterId } from "@/lib/study/quiz-link";
import { readProgressStore } from "@/lib/progress/index";

const PASS_PERCENT = 70;

export default function StudyCoachPanel({
  chapterId,
  activeStepId,
}: {
  chapterId: string;
  activeStepId: string;
}) {
  const [q, setQ] = useState("");

  // ✅ récupérer le titre de l’étape active
  const steps = useMemo(() => buildStudySteps(chapterId), [chapterId]);
  const activeStep = useMemo(
    () => steps.find((s) => s.id === activeStepId) ?? null,
    [steps, activeStepId]
  );

  // ✅ récupérer dernier résultat quiz (si existe)
  const quizInsight = useMemo(() => {
    const quiz = findQuizByChapterId(chapterId);
    if (!quiz?.id) return null;

    const store = readProgressStore();
    const res = (store.quizResults ?? {})[String(quiz.id)] as any;

    if (!res || typeof res.percentage !== "number") {
      return { quizId: String(quiz.id), percentage: null as number | null, failed: [] as string[] };
    }

    const failed = Array.isArray(res.details)
      ? res.details
          .filter((d: any) => d && d.isCorrect === false && d.questionId)
          .map((d: any) => String(d.questionId))
      : [];

    return {
      quizId: String(quiz.id),
      percentage: Math.round(res.percentage),
      failed,
    };
  }, [chapterId]);

  const scoreBadge = useMemo(() => {
    if (!quizInsight || quizInsight.percentage === null) {
      return <Badge variant="secondary">Pas encore évalué</Badge>;
    }
    const pct = quizInsight.percentage;
    if (pct < 50) return <Badge className="bg-red-600">Faible • {pct}%</Badge>;
    if (pct < PASS_PERCENT) return <Badge className="bg-yellow-600 text-black">OK • {pct}%</Badge>;
    return <Badge className="bg-green-600">Fort • {pct}%</Badge>;
  }, [quizInsight]);

  function injectPrompt(kind: "simple" | "rdc" | "mini") {
    const stepTitle = activeStep?.title ?? activeStepId;

    if (kind === "simple") {
      setQ(`Explique-moi très simplement l’étape "${stepTitle}" avec une logique claire et un mini-exemple.`);
      return;
    }
    if (kind === "rdc") {
      setQ(`Donne-moi un exemple RDC concret pour l’étape "${stepTitle}" (chiffres réels, situation quotidienne) puis explique.`);
      return;
    }
    setQ(`Fais-moi une mini-interro (3 questions) sur l’étape "${stepTitle}" avec correction et explication.`);
  }

  return (
    <div className="space-y-4">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Coach IA
            </div>

            <div className="flex items-center gap-2">
              {scoreBadge}
              <Badge variant="outline" className="text-xs">
                {activeStep?.kindLabel ?? "Step"} • {activeStepId}
              </Badge>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Objectif : consolider tes points faibles. Pose une question, demande un exemple, ou une mini-interro.
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <Textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Ex: Explique-moi "${activeStep?.title ?? "cette étape"}" simplement…`}
            className="min-h-[110px]"
          />

          <Button className="w-full gap-2" disabled={!q.trim()}>
            <Send className="h-4 w-4" />
            Envoyer (placeholder)
          </Button>

          <Separator />

          <div className="grid grid-cols-1 gap-2">
            <Button variant="secondary" className="justify-start gap-2" onClick={() => injectPrompt("simple")}>
              <Lightbulb className="h-4 w-4" />
              Explique plus simplement
            </Button>
            <Button variant="secondary" className="justify-start gap-2" onClick={() => injectPrompt("rdc")}>
              <MapPin className="h-4 w-4" />
              Donne un exemple RDC
            </Button>
            <Button variant="secondary" className="justify-start gap-2" onClick={() => injectPrompt("mini")}>
              <GraduationCap className="h-4 w-4" />
              Mini-interro
            </Button>
          </div>

          {/* ✅ mini “insight” basé sur le dernier quiz */}
          {quizInsight && quizInsight.percentage !== null ? (
            <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Target className="h-4 w-4" />
                Diagnostic
              </div>
              <div className="mt-1">
                Dernier score : <span className="font-medium text-foreground">{quizInsight.percentage}%</span>
                {quizInsight.failed.length ? (
                  <>
                    {" "}
                    • Questions à renforcer :{" "}
                    <span className="font-medium text-foreground">{quizInsight.failed.length}</span>
                  </>
                ) : (
                  <> • Rien à renforcer détecté ✅</>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
              Chapter: {chapterId}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}