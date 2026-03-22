"use client";

import { Fragment, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Lightbulb,
  PencilRuler,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Latex } from "@/components/math/latex";

type InlineSegment =
  | { type: "text"; value: string }
  | { type: "math"; value: string }
  | { type: "inlineMath"; value: string }
  | { type: "strong"; value: string };

type TextBlock = {
  type: "text";
  value: string;
};

type FormulaBlock = {
  type: "formula";
  value: string;
};

type ExampleBlock = {
  type: "example";
  title?: string;
  value: string;
};

type TipBlock = {
  type: "tip";
  value: string;
};

type DefinitionBlock = {
  type: "definition";
  value: string;
};

type RichTextBlock = {
  type: "richText";
  segments: InlineSegment[];
};

type SolutionStepsBlock = {
  type: "solutionSteps";
  title?: string;
  steps: string[];
};

type ExerciseBlock = {
  type: "exercise";
  title: string;
  prompt: string;
  choices: string[];
  correctChoiceIndex: number;
  hint?: string;
  solutionSteps?: string[];
};

type LegacyBlock = {
  type: string;
  content?: string;
  math?: string;
  value?: string;
  title?: string;
};

type Block =
  | TextBlock
  | FormulaBlock
  | ExampleBlock
  | TipBlock
  | DefinitionBlock
  | RichTextBlock
  | SolutionStepsBlock
  | ExerciseBlock
  | LegacyBlock;

function parseInlineMath(input: string): InlineSegment[] {
  if (!input) return [{ type: "text", value: "" }];

  const segments: InlineSegment[] = [];
  const regex = /\$(.+?)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;

    if (start > lastIndex) {
      segments.push({
        type: "text",
        value: input.slice(lastIndex, start),
      });
    }

    segments.push({
      type: "math",
      value: match[1],
    });

    lastIndex = end;
  }

  if (lastIndex < input.length) {
    segments.push({
      type: "text",
      value: input.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: input }];
}

function InlineRichText({ text }: { text: string }) {
  const segments = useMemo(() => parseInlineMath(text), [text]);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "math" || segment.type === "inlineMath") {
          return (
            <span key={index} className="mx-0.5 inline-block align-middle">
              <Latex math={segment.value} />
            </span>
          );
        }

        if (segment.type === "strong") {
          return <strong key={index}>{segment.value}</strong>;
        }

        return <Fragment key={index}>{segment.value}</Fragment>;
      })}
    </>
  );
}

function SegmentedRichText({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "math" || segment.type === "inlineMath") {
          return (
            <span key={index} className="mx-0.5 inline-block align-middle">
              <Latex math={segment.value} />
            </span>
          );
        }

        if (segment.type === "strong") {
          return <strong key={index}>{segment.value}</strong>;
        }

        return <Fragment key={index}>{segment.value}</Fragment>;
      })}
    </>
  );
}

function SolutionSteps({
  title,
  steps,
}: {
  title?: string;
  steps: string[];
}) {
  return (
    <section className="my-8">
      <div className="mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-foreground">
          {title || "Résolution étape par étape"}
        </h3>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="border-l-2 border-border pl-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Étape {index + 1}
            </div>
            <div className="text-[15px] leading-8 text-foreground/90 sm:text-[16px] lg:text-[17px]">
              <InlineRichText text={step} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Exercise({
  title,
  prompt,
  choices,
  correctChoiceIndex,
  hint,
  solutionSteps,
}: ExerciseBlock) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<"idle" | "correct" | "incorrect">("idle");
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  function handleCheck() {
    if (selectedIndex === null) {
      setResult("incorrect");
      return;
    }

    setResult(selectedIndex === correctChoiceIndex ? "correct" : "incorrect");
  }

  function handleReset() {
    setSelectedIndex(null);
    setResult("idle");
    setShowHint(false);
    setShowSteps(false);
  }

  return (
    <section className="my-10 border-t border-dashed border-border pt-8">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <PencilRuler className="h-4 w-4" />
        <span className="text-sm font-semibold uppercase tracking-[0.18em]">
          Exercice interactif
        </span>
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      <div className="mt-4 text-[15px] leading-8 text-foreground/90 sm:text-[16px] lg:text-[17px]">
        <InlineRichText text={prompt} />
      </div>

      <div className="mt-6 space-y-3">
        {choices.map((choice, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === correctChoiceIndex;

          const showCorrectState = result !== "idle" && isCorrect;
          const showIncorrectState =
            result === "incorrect" && isSelected && !isCorrect;

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                setSelectedIndex(index);
                if (result !== "idle") setResult("idle");
              }}
              className={[
                "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                isSelected
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-background hover:bg-muted/40",
                showCorrectState ? "border-emerald-500 bg-emerald-500/10" : "",
                showIncorrectState ? "border-rose-500 bg-rose-500/10" : "",
              ].join(" ")}
            >
              <div
                className={[
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40 text-transparent",
                  showCorrectState
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "",
                  showIncorrectState
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "",
                ].join(" ")}
              >
                {showCorrectState ? "✓" : showIncorrectState ? "✕" : "•"}
              </div>

              <div className="text-[15px] leading-7 text-foreground/90 sm:text-[16px]">
                <InlineRichText text={choice} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCheck}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <CircleHelp className="h-4 w-4" />
          Vérifier
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </button>

        {hint ? (
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Lightbulb className="h-4 w-4" />
            {showHint ? "Masquer l’indice" : "Voir l’indice"}
          </button>
        ) : null}

        {solutionSteps?.length ? (
          <button
            type="button"
            onClick={() => setShowSteps((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showSteps ? "rotate-180" : ""
              }`}
            />
            {showSteps ? "Masquer les étapes" : "Voir les étapes"}
          </button>
        ) : null}
      </div>

      {result === "correct" ? (
        <div className="mt-5 border-l-2 border-emerald-500 pl-4 text-[15px] leading-8 text-emerald-500 sm:text-[16px]">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Bonne réponse
          </div>
          <p>Tu as choisi la bonne réponse.</p>
        </div>
      ) : null}

      {result === "incorrect" ? (
        <div className="mt-5 border-l-2 border-rose-500 pl-4 text-[15px] leading-8 text-rose-500 sm:text-[16px]">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <XCircle className="h-4 w-4" />
            Réponse à revoir
          </div>
          <p>Relis bien l’énoncé, demande un indice ou affiche les étapes.</p>
        </div>
      ) : null}

      {showHint && hint ? (
        <div className="mt-5 border-l-2 border-amber-400 pl-4 text-[15px] leading-8 text-foreground/85 sm:text-[16px]">
          <div className="mb-2 text-sm font-semibold text-amber-500">
            Indice
          </div>
          <InlineRichText text={hint} />
        </div>
      ) : null}

      {showSteps && solutionSteps?.length ? (
        <div className="mt-6">
          <SolutionSteps title="Correction détaillée" steps={solutionSteps} />
        </div>
      ) : null}
    </section>
  );
}

export default function LessonRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-5 text-[15px] leading-8 sm:space-y-6 sm:text-[16px] lg:space-y-7 lg:text-[17px]">
        {blocks.map((block, i) => {
          if (block.type === "richText" && "segments" in block) {
            return (
              <p key={i} className="break-words text-foreground/90">
                <SegmentedRichText segments={block.segments} />
              </p>
            );
          }

          if (block.type === "text") {
            const text = ("value" in block && block.value) || ("content" in block && block.content) || "";
            return (
              <p key={i} className="break-words text-foreground/90">
                <InlineRichText text={text} />
              </p>
            );
          }

          if (block.type === "formula") {
            const math = ("value" in block && block.value) || ("math" in block && block.math) || "";
            return (
              <div key={i} className="my-5 overflow-x-auto py-2">
                <div className="flex min-w-max justify-center">
                  <Latex math={math} />
                </div>
              </div>
            );
          }

          if (block.type === "example") {
            const title = ("title" in block && block.title) || "Exemple";
            const text = ("value" in block && block.value) || ("content" in block && block.content) || "";

            return (
              <div
                key={i}
                className="border-l-2 border-border pl-4 text-foreground/90"
              >
                <div className="mb-2 font-semibold text-foreground">{title}</div>
                <div className="break-words">
                  <InlineRichText text={text} />
                </div>
              </div>
            );
          }

          if (block.type === "tip") {
            const text = ("value" in block && block.value) || ("content" in block && block.content) || "";
            return (
              <div
                key={i}
                className="border-l-2 border-amber-400/70 pl-4 text-foreground/85"
              >
                <div className="mb-2 text-sm font-semibold text-amber-500">
                  Astuce
                </div>
                <div className="break-words">
                  <InlineRichText text={text} />
                </div>
              </div>
            );
          }

          if (block.type === "definition") {
            const text = ("value" in block && block.value) || ("content" in block && block.content) || "";
            return (
              <div key={i} className="break-words font-semibold text-foreground">
                <InlineRichText text={text} />
              </div>
            );
          }

          if (block.type === "solutionSteps" && "steps" in block) {
            return (
              <SolutionSteps
                key={i}
                title={block.title}
                steps={block.steps}
              />
            );
          }

          if (
            block.type === "exercise" &&
            "title" in block &&
            "prompt" in block &&
            "choices" in block &&
            "correctChoiceIndex" in block
          ) {
            return <Exercise key={i} {...block} />;
          }

          return null;
        })}
      </div>
    </div>
  );
}