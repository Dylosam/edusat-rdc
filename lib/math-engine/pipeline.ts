import { classifyMathInput } from "./classifier";
import { normalizeMathInput } from "./normalize";
import type { MathSolveRequest, MathSolveResponse } from "./types";
import {
  solveDomainOfDefinitionFraction,
  solveDomainOfDefinitionFractionSqrt,
  solveDomainOfDefinitionLog,
  solveDomainOfDefinitionSqrt,
} from "./solvers/analysis/domain-of-definition";

export function solveMathExpression(
  input: MathSolveRequest
): MathSolveResponse {
  const normalized = normalizeMathInput(input.expression);

  if (!normalized.cleanedExpression) {
    return {
      success: false,
      subject: input.subject,
      chapter: input.chapter,
      exerciseType: "domain_unknown",
      rawInput: input.expression,
      normalizedInput: normalized.normalizedInput,
      steps: [],
      finalAnswer: "",
      warnings: normalized.warnings,
      error: "Expression vide ou invalide.",
    };
  }

  const classified = classifyMathInput({
    subject: input.subject,
    chapter: input.chapter,
    expression: normalized.cleanedExpression,
  });

  const commonPayload = {
    rawInput: normalized.rawInput,
    normalizedInput: normalized.normalizedInput,
    cleanedExpression: normalized.cleanedExpression,
    warnings: normalized.warnings,
  };

  switch (classified.exerciseType) {
    case "domain_fraction":
      return solveDomainOfDefinitionFraction(commonPayload);

    case "domain_sqrt":
      return solveDomainOfDefinitionSqrt(commonPayload);

    case "domain_log":
      return solveDomainOfDefinitionLog(commonPayload);

    case "domain_fraction_sqrt":
      return solveDomainOfDefinitionFractionSqrt(commonPayload);

    default:
      return {
        success: false,
        subject: input.subject,
        chapter: input.chapter,
        exerciseType: "domain_unknown",
        rawInput: input.expression,
        normalizedInput: normalized.normalizedInput,
        steps: [],
        finalAnswer: "",
        warnings: [
          ...normalized.warnings,
          "Type d’exercice non encore pris en charge dans cette V1.",
        ],
        error:
          "Expression reconnue, mais aucun solveur compatible n’est encore disponible.",
      };
  }
}