"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Play, ArrowRight, Clock, Eye, RotateCcw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { loadQuizResult, clearQuizAnswers, clearQuizResult } from "@/lib/quiz/quiz-storage";
import { getBestAttempt, getLastAttempt } from "@/lib/quiz/attempts-storage";
import { loadQuizSession, clearQuizSession } from "@/lib/quiz/quiz-session-storage";

function fmtDuration(sec?: number) {
  if (!sec || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function statusLabel(
  bestPct: number | null,
  hasSession: boolean,
  hasResult: boolean,
  passPercent: number
) {
  if (hasSession && !hasResult) return { text: "En cours", variant: "secondary" as const };
  if (bestPct === null) return { text: "Non tenté", variant: "outline" as const };
  if (bestPct >= passPercent) return { text: "Réussi", variant: "secondary" as const };
  return { text: "À améliorer", variant: "destructive" as const };
}

export function QuizHubCard({
  chapterId,
  quizId,
  title = "Quiz du chapitre",
  passPercent = 70,
  courseHref,
}: {
  chapterId: string;
  quizId: string;
  title?: string;
  passPercent?: number;
  courseHref?: string;
}) {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  // Refresh léger quand on revient du quiz (focus + storage + event custom)
  useEffect(() => {
    const bump = () => setTick((x) => x + 1);

    window.addEventListener("focus", bump);
    window.addEventListener("storage", bump);
    window.addEventListener("edustat_progress_updated", bump);

    return () => {
      window.removeEventListener("focus", bump);
      window.removeEventListener("storage", bump);
      window.removeEventListener("edustat_progress_updated", bump);
    };
  }, []);

  const best = useMemo(() => getBestAttempt(quizId), [quizId, tick]);
  const last = useMemo(() => getLastAttempt(quizId), [quizId, tick]);

  const hasSession = useMemo(() => Boolean(loadQuizSession(quizId)), [quizId, tick]);
  const hasResult = useMemo(() => Boolean(loadQuizResult(quizId)), [quizId, tick]);

  const bestPct = best ? best.percentage : null;
  const lastPct = last ? last.percentage : null;

  const status = statusLabel(bestPct, hasSession, hasResult, passPercent);

  const trophy = bestPct !== null && bestPct >= 95;
  const perfect = bestPct !== null && Math.round(bestPct) === 100;

  const progressValue = bestPct === null ? 0 : Math.max(0, Math.min(100, bestPct));

  const quizHref = `/quiz/${encodeURIComponent(quizId)}`;
  const courseLink = courseHref ?? `/chapters/${encodeURIComponent(chapterId)}?tab=course`;

  // ✅ Reset HARD + fresh param (évite de retomber sur l’écran résultat)
  const restartFresh = () => {
    clearQuizAnswers(quizId);
    clearQuizResult(quizId);
    clearQuizSession(quizId);
    router.push(`${quizHref}?fresh=${Date.now()}`);
  };

  // ✅ Actions
  // - En cours -> Reprendre (ne reset pas)
  // - Jamais tenté -> Commencer (fresh start)
  // - Perfect -> Voir le résultat (ne reset pas)
  // - Sinon -> Refaire (fresh start)
  const primary =
    hasSession && !hasResult
      ? {
          label: "Reprendre",
          icon: <Play className="mr-2 h-4 w-4" />,
          onClick: () => router.push(quizHref),
        }
      : bestPct === null
      ? {
          label: "Commencer",
          icon: <Play className="mr-2 h-4 w-4" />,
          onClick: restartFresh,
        }
      : perfect
      ? {
          label: "Voir le résultat",
          icon: <Eye className="mr-2 h-4 w-4" />,
          onClick: () => router.push(quizHref),
        }
      : {
          label: "Refaire",
          icon: <RotateCcw className="mr-2 h-4 w-4" />,
          onClick: restartFresh,
        };

  return (
    <Card className="border-border/60 bg-muted/10">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-serif">{title}</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">
              Seuil de réussite : <b className="text-foreground">{passPercent}%</b>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status.variant} className="rounded-full px-3">
              {status.text}
            </Badge>

            {trophy ? (
              <Badge variant="outline" className="rounded-full px-3 flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                Trophée
              </Badge>
            ) : null}

            {perfect ? (
              <Badge variant="outline" className="rounded-full px-3">
                ⭐ 100%
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Meilleur score</span>
            <span className="text-foreground font-semibold tabular-nums">
              {bestPct === null ? "—" : `${bestPct.toFixed(0)}%`}
            </span>
          </div>
          <Progress value={progressValue} className="h-3" />
        </div>

        {/* Stats cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/30 p-5">
            <div className="text-xs text-muted-foreground">Dernière tentative</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {lastPct === null ? "—" : `${lastPct.toFixed(0)}%`}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/30 p-5">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Durée
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {fmtDuration(last?.durationSec)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="bg-white text-black hover:bg-white/90" onClick={primary.onClick}>
            {primary.icon}
            {primary.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(courseLink)}
          >
            Revoir le cours
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}