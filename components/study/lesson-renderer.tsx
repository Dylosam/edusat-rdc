"use client";

import { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ================= TYPES =================

type Choice = {
  text: string;
  correct: boolean;
};

type Step = {
  text?: string;
  formula?: string;
  explanation?: string;
};

type TextMark = {
  text: string;
  color?: string;
};

export type LessonBlock = {
  type: "text" | "katex" | "example" | "tip" | "exercise";
  title?: string;

  // text
  text?: string;
  segments?: TextMark[];

  // katex
  formula?: string;
  explanation?: string;

  // example
  steps?: Step[];

  // exercise
  question?: string;
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
  text,
  segments,
}: {
  text?: string;
  segments?: TextMark[];
}) {
  if (Array.isArray(segments) && segments.length > 0) {
    return (
      <>
        {segments.map((segment, i) => {
          const safeColor = sanitizeColor(segment.color);
          const content = typeof segment.text === "string" ? segment.text : "";

          if (!content) return null;

          return (
            <span
              key={i}
              style={safeColor ? { color: safeColor } : undefined}
            >
              {renderTextWithMath(content)}
            </span>
          );
        })}
      </>
    );
  }

  if (typeof text === "string" && text.trim()) {
    return <>{renderTextWithMath(text)}</>;
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
      {block.title && <h3 className="font-semibold text-lg">{block.title}</h3>}

      <div className="text-lg">
        <RichText text={block.question} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              className={`w-full h-14 px-4 rounded-lg border text-sm font-medium transition-all duration-150 flex items-center justify-center text-center shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:scale-[0.99] ${style}`}
            >
              <RichText text={c.text} />
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
            <div className="text-green-600 flex items-center gap-2">
              <CheckCircle2 size={18} /> Bonne réponse
            </div>
          ) : (
            <div className="text-red-600 flex items-center gap-2">
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
              <RichText text={block.explanation} />
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
                  <h3 className="font-semibold text-lg mb-3 text-foreground">
                    {block.title}
                  </h3>
                )}

                <div className="leading-relaxed text-[15.5px] md:text-base">
                  <RichText text={block.text} segments={block.segments} />
                </div>
              </div>
            );

          case "katex":
            return (
              <div key={i} className="my-6">
                {block.title && (
                  <h3 className="font-semibold text-lg mb-2">{block.title}</h3>
                )}
                <BlockMath math={block.formula || ""} />
                {block.explanation && (
                  <div className="text-sm text-gray-600 mt-2">
                    <RichText text={block.explanation} />
                  </div>
                )}
              </div>
            );

          case "example":
            return (
              <div key={i} className="my-8">
                {block.title && (
                  <h3 className="font-semibold text-lg mb-2">{block.title}</h3>
                )}

                {block.text && (
                  <p className="mb-3">
                    <RichText text={block.text} />
                  </p>
                )}

                {block.steps?.map((step, idx) => (
                  <div key={idx} className="mb-2">
                    {step.text && <RichText text={step.text} />}
                    {step.formula && <BlockMath math={step.formula} />}
                    {step.explanation && (
                      <div className="text-sm text-gray-600">
                        <RichText text={step.explanation} />
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
                className="my-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200"
              >
                {block.title && (
                  <div className="font-semibold mb-1 text-lg">{block.title}</div>
                )}
                <RichText text={block.text} />
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