import type { MathSolveResponse, SolveStep } from "../../types";

interface DomainSolverParams {
  rawInput: string;
  normalizedInput: string;
  cleanedExpression: string;
  warnings?: string[];
}

function extractSimpleDenominator(expression: string): string | null {
  // Cas simple : a/(...)
  const match = expression.match(/\/\(([^()]+)\)/);
  if (match?.[1]) return match[1];

  // Cas simple : a/(x-2)
  const match2 = expression.match(/\/([a-zA-Z0-9+\-*/^]+)/);
  if (match2?.[1]) return match2[1];

  return null;
}

function extractSimpleSqrtContent(expression: string): string | null {
  const match = expression.match(/sqrt\((.+)\)/);
  if (!match?.[1]) return null;

  return match[1];
}

function extractSimpleLogContent(expression: string): string | null {
  const match = expression.match(/(?:ln|log)\((.+)\)/);
  if (!match?.[1]) return null;

  return match[1];
}

function solveLinearZero(expr: string): string | null {
  // mini solveur ultra simple pour :
  // x-a, x+a, ax+b
  const compact = expr.replace(/\s+/g, "");

  if (compact === "x") return "0";

  const match1 = compact.match(/^x([+-]\d+(?:\.\d+)?)$/);
  if (match1) {
    const n = Number(match1[1]);
    return String(-n);
  }

  const match2 = compact.match(/^(\d+(?:\.\d+)?)x([+-]\d+(?:\.\d+)?)$/);
  if (match2) {
    const a = Number(match2[1]);
    const b = Number(match2[2]);
    if (a !== 0) return String(-b / a);
  }

  return null;
}

function solveLinearGeZero(expr: string): string | null {
  const compact = expr.replace(/\s+/g, "");

  if (compact === "x") return "x ≥ 0";

  const match1 = compact.match(/^x([+-]\d+(?:\.\d+)?)$/);
  if (match1) {
    const n = Number(match1[1]);
    return `x ≥ ${-n}`;
  }

  const match2 = compact.match(/^(\d+(?:\.\d+)?)x([+-]\d+(?:\.\d+)?)$/);
  if (match2) {
    const a = Number(match2[1]);
    const b = Number(match2[2]);
    if (a > 0) return `x ≥ ${-b / a}`;
    if (a < 0) return `x ≤ ${-b / a}`;
  }

  return null;
}

function solveLinearGtZero(expr: string): string | null {
  const compact = expr.replace(/\s+/g, "");

  if (compact === "x") return "x > 0";

  const match1 = compact.match(/^x([+-]\d+(?:\.\d+)?)$/);
  if (match1) {
    const n = Number(match1[1]);
    return `x > ${-n}`;
  }

  const match2 = compact.match(/^(\d+(?:\.\d+)?)x([+-]\d+(?:\.\d+)?)$/);
  if (match2) {
    const a = Number(match2[1]);
    const b = Number(match2[2]);
    if (a > 0) return `x > ${-b / a}`;
    if (a < 0) return `x < ${-b / a}`;
  }

  return null;
}

export function solveDomainOfDefinitionFraction({
  rawInput,
  normalizedInput,
  cleanedExpression,
  warnings = [],
}: DomainSolverParams): MathSolveResponse {
  const steps: SolveStep[] = [];
  const denominator = extractSimpleDenominator(cleanedExpression);

  if (!denominator) {
    return {
      success: false,
      subject: "analyse",
      chapter: "mm5-9",
      exerciseType: "domain_fraction",
      rawInput,
      normalizedInput,
      steps: [],
      finalAnswer: "",
      warnings: [
        ...warnings,
        "Impossible d’identifier clairement le dénominateur dans cette V1.",
      ],
      error: "Expression non reconnue pour une fraction rationnelle simple.",
    };
  }

  const forbiddenValue = solveLinearZero(denominator);

  steps.push({
    title: "Identifier la contrainte",
    content: "Le dénominateur d’une fraction doit être différent de zéro.",
    latex: `${denominator} \\neq 0`,
  });

  if (!forbiddenValue) {
    steps.push({
      title: "Analyser le dénominateur",
      content:
        "Le dénominateur a été détecté, mais la V1 ne sait pas encore résoudre automatiquement cette forme.",
    });

    return {
      success: true,
      subject: "analyse",
      chapter: "mm5-9",
      exerciseType: "domain_fraction",
      rawInput,
      normalizedInput,
      steps,
      finalAnswer: `D = \\mathbb{R} \\setminus \\{x \\mid ${denominator}=0\\}`,
      warnings: [
        ...warnings,
        "Résolution partielle : la valeur interdite n’a pas pu être calculée automatiquement.",
      ],
    };
  }

  steps.push({
    title: "Chercher la valeur interdite",
    content: `On résout ${denominator} = 0, ce qui donne x = ${forbiddenValue}.`,
    latex: `${denominator}=0 \\Rightarrow x=${forbiddenValue}`,
  });

  steps.push({
    title: "Déduire le domaine",
    content: `Toutes les valeurs réelles sont admises sauf x = ${forbiddenValue}.`,
    latex: `D = \\mathbb{R} \\setminus \\{${forbiddenValue}\\}`,
  });

  return {
    success: true,
    subject: "analyse",
    chapter: "mm5-9",
    exerciseType: "domain_fraction",
    rawInput,
    normalizedInput,
    steps,
    finalAnswer: `D = \\mathbb{R} \\setminus \\{${forbiddenValue}\\}`,
    warnings,
  };
}

export function solveDomainOfDefinitionSqrt({
  rawInput,
  normalizedInput,
  cleanedExpression,
  warnings = [],
}: DomainSolverParams): MathSolveResponse {
  const steps: SolveStep[] = [];
  const radicand = extractSimpleSqrtContent(cleanedExpression);

  if (!radicand) {
    return {
      success: false,
      subject: "analyse",
      chapter: "mm5-9",
      exerciseType: "domain_sqrt",
      rawInput,
      normalizedInput,
      steps: [],
      finalAnswer: "",
      warnings: [
        ...warnings,
        "Impossible d’identifier clairement le contenu de la racine dans cette V1.",
      ],
      error: "Expression non reconnue pour une racine simple.",
    };
  }

  const inequality = solveLinearGeZero(radicand);

  steps.push({
    title: "Identifier la contrainte",
    content: "Le contenu d’une racine carrée doit être positif ou nul.",
    latex: `${radicand} \\geq 0`,
  });

  if (!inequality) {
    return {
      success: true,
      subject: "analyse",
      chapter: "mm5-9",
      exerciseType: "domain_sqrt",
      rawInput,
      normalizedInput,
      steps,
      finalAnswer: `D = \\{x \\in \\mathbb{R} \\mid ${radicand} \\geq 0\\}`,
      warnings: [
        ...warnings,
        "Résolution partielle : l’inéquation n’a pas pu être simplifiée automatiquement.",
      ],
    };
  }

  steps.push({
    title: "Résoudre l’inéquation",
    content: `On résout ${radicand} ≥ 0, ce qui donne ${inequality}.`,
    latex: `${radicand} \\geq 0`,
  });

  steps.push({
    title: "Déduire le domaine",
    content: `Le domaine de définition est : ${inequality}.`,
  });

  return {
    success: true,
    subject: "analyse",
    chapter: "mm5-9",
    exerciseType: "domain_sqrt",
    rawInput,
    normalizedInput,
    steps,
    finalAnswer: `D : ${inequality}`,
    warnings,
  };
}

export function solveDomainOfDefinitionLog({
  rawInput,
  normalizedInput,
  cleanedExpression,
  warnings = [],
}: DomainSolverParams): MathSolveResponse {
  const steps: SolveStep[] = [];
  const logArg = extractSimpleLogContent(cleanedExpression);

  if (!logArg) {
    return {
      success: false,
      subject: "analyse",
      chapter: "mm5-9",
      exerciseType: "domain_log",
      rawInput,
      normalizedInput,
      steps: [],
      finalAnswer: "",
      warnings: [
        ...warnings,
        "Impossible d’identifier clairement l’argument du logarithme dans cette V1.",
      ],
      error: "Expression non reconnue pour un logarithme simple.",
    };
  }

  const inequality = solveLinearGtZero(logArg);

  steps.push({
    title: "Identifier la contrainte",
    content: "L’argument d’un logarithme doit être strictement positif.",
    latex: `${logArg} > 0`,
  });

  if (!inequality) {
    return {
      success: true,
      subject: "analyse",
      chapter: "mm5-9",
      exerciseType: "domain_log",
      rawInput,
      normalizedInput,
      steps,
      finalAnswer: `D = \\{x \\in \\mathbb{R} \\mid ${logArg} > 0\\}`,
      warnings: [
        ...warnings,
        "Résolution partielle : l’inéquation n’a pas pu être simplifiée automatiquement.",
      ],
    };
  }

  steps.push({
    title: "Résoudre l’inéquation",
    content: `On résout ${logArg} > 0, ce qui donne ${inequality}.`,
    latex: `${logArg} > 0`,
  });

  steps.push({
    title: "Déduire le domaine",
    content: `Le domaine de définition est : ${inequality}.`,
  });

  return {
    success: true,
    subject: "analyse",
    chapter: "mm5-9",
    exerciseType: "domain_log",
    rawInput,
    normalizedInput,
    steps,
    finalAnswer: `D : ${inequality}`,
    warnings,
  };
}

export function solveDomainOfDefinitionFractionSqrt({
  rawInput,
  normalizedInput,
  cleanedExpression,
  warnings = [],
}: DomainSolverParams): MathSolveResponse {
  const steps: SolveStep[] = [];
  const radicand = extractSimpleSqrtContent(cleanedExpression);

  if (!radicand) {
    return {
      success: false,
      subject: "analyse",
      chapter: "mm5-9",
      exerciseType: "domain_fraction_sqrt",
      rawInput,
      normalizedInput,
      steps: [],
      finalAnswer: "",
      warnings: [...warnings],
      error: "Impossible d’identifier le radicand.",
    };
  }

  steps.push({
    title: "Identifier les contraintes",
    content:
      "Comme il y a une racine contenant une fraction, il faut que le contenu de la racine soit positif ou nul, et la fraction elle-même doit être définie.",
    latex: `${radicand} \\geq 0`,
  });

  steps.push({
    title: "Limitation actuelle de la V1",
    content:
      "La V1 reconnaît ce type d’exercice, mais la résolution complète des inéquations rationnelles sous racine sera ajoutée dans l’étape suivante.",
  });

  return {
    success: true,
    subject: "analyse",
    chapter: "mm5-9",
    exerciseType: "domain_fraction_sqrt",
    rawInput,
    normalizedInput,
    steps,
    finalAnswer: `D = \\{x \\in \\mathbb{R} \\mid ${radicand} \\geq 0\\}`,
    warnings: [
      ...warnings,
      "Cas détecté mais partiellement résolu : inéquation rationnelle sous racine non développée dans cette V1.",
    ],
  };
}