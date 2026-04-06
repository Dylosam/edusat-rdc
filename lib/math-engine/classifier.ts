import type {
  ClassifiedMathInput,
  DetectedExerciseType,
  MathChapter,
  MathSubject,
} from "./types";

interface ClassifierParams {
  subject?: MathSubject;
  chapter?: MathChapter;
  expression: string;
}

export function classifyMathInput({
  subject,
  chapter,
  expression,
}: ClassifierParams): ClassifiedMathInput {
  const exp = expression.toLowerCase();

  const hasSqrt = exp.includes("sqrt(");
  const hasLn = exp.includes("ln(") || exp.includes("log(");
  const hasDivision = exp.includes("/");

  let exerciseType: DetectedExerciseType = "domain_unknown";

  // priorité forte si on est déjà dans MM5.9
  if (subject === "analyse" && chapter === "mm5-9") {
    if (hasSqrt && hasDivision) {
      exerciseType = "domain_fraction_sqrt";
    } else if (hasSqrt) {
      exerciseType = "domain_sqrt";
    } else if (hasLn) {
      exerciseType = "domain_log";
    } else if (hasDivision) {
      exerciseType = "domain_fraction";
    }
  } else {
    // fallback simple
    if (hasSqrt && hasDivision) {
      exerciseType = "domain_fraction_sqrt";
    } else if (hasSqrt) {
      exerciseType = "domain_sqrt";
    } else if (hasLn) {
      exerciseType = "domain_log";
    } else if (hasDivision) {
      exerciseType = "domain_fraction";
    }
  }

  return {
    subject,
    chapter,
    exerciseType,
  };
}