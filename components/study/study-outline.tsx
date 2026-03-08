"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, PlayCircle } from "lucide-react";
import type { StudyStep } from "@/lib/study/type";

export default function StudyOutline({
  steps,
  activeStepId,
  onPick,
  doneMap,
}: {
  steps: StudyStep[];
  activeStepId: string;
  onPick: (stepId: string) => void;
  doneMap: Record<string, boolean>;
}) {
  return (
    <div className="space-y-2">
      {steps.map((step) => {
        const done = doneMap[step.id] === true;
        const active = step.id === activeStepId;

        return (
          <Button
            key={step.id}
            variant={active ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-2 text-left")}
            onClick={() => onPick(step.id)}
          >
            {done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <PlayCircle className="h-4 w-4 text-primary" />
            )}
            <span className="truncate">{step.title}</span>
          </Button>
        );
      })}
    </div>
  );
}