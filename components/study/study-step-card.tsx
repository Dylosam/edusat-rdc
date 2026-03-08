"use client";

import { motion } from "framer-motion";
import { ExternalLink, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StudyStep } from "@/lib/study/type";
import { Latex } from "@/components/math/latex";
import { Badge } from "@/components/ui/badge";

interface StudyStepCardProps {
  step: StudyStep;
  done: boolean;
  unlocked: boolean;
  onComplete: () => void;
  onFocus: () => void;
}

export default function StudyStepCard({
  step,
  done,
  unlocked,
  onComplete,
  onFocus,
}: StudyStepCardProps) {
  const isQuiz = step.kind === "quiz";
  const canOpen = Boolean(step.href) && unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={onFocus}
    >
      <Card
        className={`overflow-hidden transition-all ${
          !unlocked ? "opacity-70" : ""
        }`}
      >
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-semibold">{step.title}</div>

                <Badge variant="outline">{step.kindLabel}</Badge>

                {typeof step.minutes === "number" ? (
                  <Badge variant="secondary">{step.minutes} min</Badge>
                ) : null}

                {!unlocked ? (
                  <Badge variant="destructive" className="gap-1">
                    <Lock className="h-3.5 w-3.5" />
                    Verrouillé
                  </Badge>
                ) : null}
              </div>

              {step.subtitle ? (
                <div className="mt-1 text-sm text-muted-foreground">
                  {step.subtitle}
                </div>
              ) : null}

              {step.katexPreview ? (
                <div className="mt-3 rounded-md border bg-muted/30 p-3 text-sm">
                  <Latex math={step.katexPreview} />
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {done ? (
                <Button variant="secondary" className="gap-2" disabled>
                  <Check className="h-4 w-4" />
                  Validé
                </Button>
              ) : !unlocked ? (
                <Button variant="outline" className="gap-2" disabled>
                  <Lock className="h-4 w-4" />
                  Débloquez cette étape
                </Button>
              ) : isQuiz ? (
                canOpen ? (
                  <Button asChild className="gap-2">
                    <a href={step.href!}>
                      <ExternalLink className="h-4 w-4" />
                      Commencer le quiz
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="gap-2">
                    Quiz indisponible
                  </Button>
                )
              ) : (
                <>
                  {canOpen ? (
                    <Button asChild variant="outline" className="gap-2">
                      <a href={step.href!}>
                        <ExternalLink className="h-4 w-4" />
                        Ouvrir
                      </a>
                    </Button>
                  ) : null}

                  <Button onClick={onComplete} className="gap-2">
                    <Check className="h-4 w-4" />
                    J’ai compris
                  </Button>
                </>
              )}
            </div>
          </div>

          {step.body ? (
            <div className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}