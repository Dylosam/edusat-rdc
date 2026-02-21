// components/math/latex.tsx
"use client";

import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

export function LatexInline({ value }: { value: string }) {
  try {
    return <InlineMath math={value} />;
  } catch {
    return <code className="px-1 py-0.5 rounded bg-muted">{value}</code>;
  }
}

export function LatexBlock({ value }: { value: string }) {
  try {
    return (
      <div className="my-4 text-lg overflow-x-auto">
        <BlockMath math={value} />
      </div>
    );
  } catch {
    return (
      <pre className="my-4 text-sm overflow-x-auto rounded-lg bg-muted p-3">
        {value}
      </pre>
    );
  }
}

// ✅ compat: ancien usage <Latex latex="..." />
export function Latex({ latex }: { latex: string }) {
  return <LatexBlock value={latex} />;
}