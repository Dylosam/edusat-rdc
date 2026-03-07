"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, PlayCircle } from "lucide-react";
import type { StudyStep } from "@/lib/study/type";
import { getChapterStudyState } from "@/lib/study/progress";

export default function StudyOutline({
  chapterId,
  steps,
  activeStepId,
  onPick,
}: {
  chapterId: string;
  steps: StudyStep[];
  activeStepId: string;
  onPick: (stepId: string) => void;
}) {
  const state = getChapterStudyState(chapterId, steps);

  return (
    <div className="space-y-2">
      {steps.map((s) => {
        const done = state.doneMap[s.id] === true;
        const active = s.id === activeStepId;

        return (
          <Button
            key={s.id}
            variant={active ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-2 text-left")}
            onClick={() => onPick(s.id)}
          >
            {done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <PlayCircle className="h-4 w-4 text-primary" />
            )}
            <span className="truncate">{s.title}</span>
          </Button>
        );
      })}
    </div>
  );
}