"use client";

import { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ================= TYPES =================

type TextMark = {
  text: string;
  color?: string;
};

type RichValue = string | TextMark[];

type Choice = {
  text: RichValue;
  correct: boolean;
};

type Step = {
  text?: RichValue;
  formula?: string;
  explanation?: RichValue;
};

export type LessonBlock = {
  type: "text" | "katex" | "example" | "tip" | "exercise";
  title?: RichValue;

  // text
  text?: RichValue;
  segments?: TextMark[];

  // katex
  formula?: string;
  explanation?: RichValue;

  // example
  steps?: Step[];

  // exercise
  question?: RichValue;
  choices?: Choice[];
};

// ================= HELPERS =================

function splitMath(text: string) {
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g;
  const parts: Array<
    | { type: "text"; value: string }
    | { type: "inline"; value: string }
    | { type: "block"; value: string }
  > = [];

  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }

    const token = match[0];

    if (token.startsWith("$$")) {
      parts.push({ type: "block", value: token.slice(2, -2) });
    } else {
      parts.push({ type: "inline", value: token.slice(1, -1) });
    }

    last = regex.lastIndex;
  }

  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }

  return parts;
}

function sanitizeColor(color?: string) {
  if (!color) return undefined;

  const trimmed = color.trim();

  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed;
  }

  const safeNames = new Set([
    "red",
    "blue",
    "green",
    "orange",
    "purple",
    "pink",
    "yellow",
    "teal",
    "indigo",
    "gray",
    "black",
    "white",
  ]);

  if (safeNames.has(trimmed.toLowerCase())) {
    return trimmed.toLowerCase();
  }

  return undefined;
}

function renderTextWithMath(text: string) {
  if (!text) return null;

  const parts = splitMath(text);

  return parts.map((p, i) => {
    if (p.type === "inline") return <InlineMath key={i} math={p.value} />;

    if (p.type === "block") {
      return (
        <div key={i} className="my-4 overflow-x-auto">
          <BlockMath math={p.value} />
        </div>
      );
    }

    return <span key={i}>{p.value}</span>;
  });
}

function RichText({
  value,
  text,
  segments,
}: {
  value?: RichValue;
  text?: string;
  segments?: TextMark[];
}) {
  const resolved =
    value !== undefined
      ? value
      : Array.isArray(segments) && segments.length > 0
      ? segments
      : text;

  if (Array.isArray(resolved) && resolved.length > 0) {
    return (
      <>
        {resolved.map((segment, i) => {
          const safeColor = sanitizeColor(segment.color);
          const content = typeof segment.text === "string" ? segment.text : "";

          if (!content) return null;

          return (
            <span
              key={i}
              style={safeColor ? ({ color: safeColor } as React.CSSProperties) : undefined}
            >
              {renderTextWithMath(content)}
            </span>
          );
        })}
      </>
    );
  }

  if (typeof resolved === "string" && resolved.trim()) {
    return <>{renderTextWithMath(resolved)}</>;
  }

  return null;
}

// ================= EXERCISE =================

function Exercise({ block }: { block: LessonBlock }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const choices = block.choices || [];

  const isCorrect = () => {
    if (selected === null) return false;
    return choices[selected]?.correct === true;
  };

  return (
    <div className="my-10 space-y-4">
      {block.title && (
        <h3 className="text-lg font-semibold">
          <RichText value={block.title} />
        </h3>
      )}

      <div className="text-lg">
        <RichText value={block.question} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {choices.map((c, i) => {
          const isSel = selected === i;

          let style =
            "border-gray-300 bg-white text-gray-900 hover:border-gray-400";

          if (checked) {
            if (c.correct) {
              style = "border-green-600 bg-green-600 text-white";
            } else if (isSel) {
              style = "border-red-600 bg-red-600 text-white";
            }
          } else if (isSel) {
            style = "border-gray-900 bg-gray-100 text-gray-900";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (checked) return;
                setSelected(i);
              }}
              className={`flex min-h-[56px] w-full items-center justify-center rounded-lg border px-4 py-3 text-center text-sm font-medium transition-all duration-150 shadow-none outline-none active:scale-[0.99] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${style}`}
            >
              <RichText value={c.text} />
            </button>
          );
        })}
      </div>

      {!checked ? (
        <Button onClick={() => setChecked(true)} disabled={selected === null}>
          Vérifier
        </Button>
      ) : (
        <div className="space-y-2">
          {isCorrect() ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={18} /> Bonne réponse
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle size={18} /> Mauvaise réponse
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              setChecked(false);
              setSelected(null);
            }}
          >
            Recommencer
          </Button>

          {block.explanation && (
            <div className="text-sm text-gray-600">
              <RichText value={block.explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ================= MAIN =================

export default function LessonRenderer({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "text":
            return (
              <div key={i} className="my-8">
                {block.title && (
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
                    <RichText value={block.title} />
                  </h3>
                )}

                <div className="leading-relaxed text-[15.5px] md:text-base">
                  <RichText
                    value={block.text}
                    text={typeof block.text === "string" ? block.text : undefined}
                    segments={block.segments}
                  />
                </div>
              </div>
            );

          case "katex":
            return (
              <div key={i} className="my-6">
                {block.title && (
                  <h3 className="mb-2 text-lg font-semibold">
                    <RichText value={block.title} />
                  </h3>
                )}

                <BlockMath math={block.formula || ""} />

                {block.explanation && (
                  <div className="mt-2 text-sm text-gray-600">
                    <RichText value={block.explanation} />
                  </div>
                )}
              </div>
            );

          case "example":
            return (
              <div key={i} className="my-8">
                {block.title && (
                  <h3 className="mb-2 text-lg font-semibold">
                    <RichText value={block.title} />
                  </h3>
                )}

                {block.text && (
                  <p className="mb-3">
                    <RichText value={block.text} />
                  </p>
                )}

                {block.steps?.map((step, idx) => (
                  <div key={idx} className="mb-2">
                    {step.text && <RichText value={step.text} />}
                    {step.formula && <BlockMath math={step.formula} />}
                    {step.explanation && (
                      <div className="text-sm text-gray-600">
                        <RichText value={step.explanation} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );

          case "tip":
            return (
              <div
                key={i}
                className="my-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4"
              >
                {block.title && (
                  <div className="mb-1 text-lg font-semibold">
                    <RichText value={block.title} />
                  </div>
                )}
                <RichText value={block.text} segments={block.segments} />
              </div>
            );

          case "exercise":
            return <Exercise key={i} block={block} />;

          default:
            return null;
        }
      })}
    </div>
  );
}