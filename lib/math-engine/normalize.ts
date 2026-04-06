import type { NormalizedMathInput } from "./types";

function normalizeSqrtSyntax(input: string): string {
  let result = input;

  // √x => sqrt(x)
  result = result.replace(/√\s*([a-zA-Z0-9]+)/g, "sqrt($1)");

  // √(x+1) => sqrt(x+1)
  result = result.replace(/√\s*\(([^)]+)\)/g, "sqrt($1)");

  return result;
}

function stripFunctionPrefix(input: string): string {
  // enlève f(x)=..., g(x)=..., y=...
  return input
    .replace(/^[a-zA-Z]\s*\(\s*x\s*\)\s*=\s*/i, "")
    .replace(/^y\s*=\s*/i, "")
    .trim();
}

export function normalizeMathInput(raw: string): NormalizedMathInput {
  const warnings: string[] = [];

  if (!raw || !raw.trim()) {
    return {
      rawInput: raw,
      normalizedInput: "",
      cleanedExpression: "",
      warnings: ["Aucune expression fournie."],
    };
  }

  let normalized = raw.trim();

  normalized = normalized.replace(/,/g, ".");
  normalized = normalized.replace(/\s+/g, "");
  normalized = normalized.replace(/\\sqrt\s*\{/g, "sqrt(");
  normalized = normalized.replace(/\}/g, ")");
  normalized = normalized.replace(/\\ln/g, "ln");
  normalized = normalized.replace(/\\log/g, "log");
  normalized = normalized.replace(/\\cdot/g, "*");
  normalized = normalized.replace(/\\times/g, "*");
  normalized = normalized.replace(/\\left/g, "");
  normalized = normalized.replace(/\\right/g, "");
  normalized = normalized.replace(/\[/g, "(").replace(/\]/g, ")");
  normalized = normalizeSqrtSyntax(normalized);

  // \frac{a}{b} -> ((a)/(b))
  normalized = normalized.replace(
    /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
    "(($1)/($2))"
  );

  if (normalized.includes("^")) {
    warnings.push(
      "Les puissances sont conservées telles quelles. La V1 ne traite pas encore tous les cas avancés."
    );
  }

  const cleanedExpression = stripFunctionPrefix(normalized);

  return {
    rawInput: raw,
    normalizedInput: normalized,
    cleanedExpression,
    warnings,
  };
}