'use client';

import { BlockMath, InlineMath } from 'react-katex';

type Props = {
  latex: string;
  inline?: boolean;
  className?: string;
};

export function Latex({ latex, inline = false, className }: Props) {
  try {
    if (inline) {
      return (
        <span className={className}>
          <InlineMath math={latex} />
        </span>
      );
    }

    return (
      <div className={className}>
        <BlockMath math={latex} />
      </div>
    );
  } catch {
    // fallback sûr si une formule est mal écrite
    return (
      <pre className={`text-sm font-mono whitespace-pre-wrap ${className || ''}`}>
        {latex}
      </pre>
    );
  }
}
