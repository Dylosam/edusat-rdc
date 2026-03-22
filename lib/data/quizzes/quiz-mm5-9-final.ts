export const quiz_mm5_9_final = {
  id: "quiz-mm5-9-final",
  chapterId: "mm5-9",
  title: "Quiz final — Domaine de définition",
  description:
    "Teste ta maîtrise complète du domaine de définition avec des questions progressives (facile → examen).",
  questions: [
    // ========= NIVEAU 1 =========
    {
      id: "q1",
      question: "Quelle valeur est interdite pour f(x)=1/(x−3) ?",
      choices: ["-3", "0", "3", "1"],
      answerIndex: 2,
      explanation:
        "Le dénominateur ne doit jamais être nul. Donc x − 3 ≠ 0 → x ≠ 3."
    },

    {
      id: "q2",
      question: "Quel est le domaine de g(x)=√(x−2) ?",
      choices: ["x > 2", "x ≥ 2", "ℝ", "x ≠ 2"],
      answerIndex: 1,
      explanation:
        "Une racine carrée impose x − 2 ≥ 0 → x ≥ 2."
    },

    // ========= NIVEAU 2 =========
    {
      id: "q3",
      question: "Quel est le domaine de h(x)=1/√(x−1) ?",
      choices: ["x ≥ 1", "x > 1", "x ≠ 1", "ℝ"],
      answerIndex: 1,
      explanation:
        "Racine au dénominateur → strictement positif → x − 1 > 0 → x > 1."
    },

    {
      id: "q4",
      question: "Quel est le domaine de f(x)=√(x+2)/(x−3) ?",
      choices: [
        "x ≥ -2",
        "x ≥ -2 et x ≠ 3",
        "x > 3",
        "ℝ"
      ],
      answerIndex: 1,
      explanation:
        "Racine → x ≥ -2 ; dénominateur → x ≠ 3 ; on combine."
    },

    // ========= NIVEAU 3 =========
    {
      id: "q5",
      question: "Quel est le domaine de g(x)=√(x²−4) ?",
      choices: [
        "]−∞,−2] ∪ [2,+∞[",
        "ℝ",
        "[−2,2]",
        "]−∞,−2[ ∪ ]2,+∞["
      ],
      answerIndex: 0,
      explanation:
        "x² − 4 ≥ 0 → x ≤ -2 ou x ≥ 2."
    },

    {
      id: "q6",
      question: "Quel est le domaine de h(x)=√(x²−1)/(x−1) ?",
      choices: [
        "]−∞,−1] ∪ ]1,+∞[",
        "]−∞,−1[ ∪ ]1,+∞[",
        "ℝ",
        "]−∞,−1] ∪ [1,+∞["
      ],
      answerIndex: 0,
      explanation:
        "x²−1 ≥ 0 → x ≤ -1 ou x ≥ 1 ; x ≠ 1 → on enlève 1."
    },

    // ========= NIVEAU EXAM =========
    {
      id: "q7",
      question: "Quel est le domaine de f(x)=√(x−2)/(x−2) ?",
      choices: [
        "[2,+∞[",
        "]2,+∞[",
        "ℝ",
        "[2,+∞[ \\ {2}"
      ],
      answerIndex: 1,
      explanation:
        "x ≥ 2 et x ≠ 2 → x > 2."
    },

    {
      id: "q8",
      question: "Quel est le domaine de g(x)=1/√(x²−9) ?",
      choices: [
        "]−∞,−3[ ∪ ]3,+∞[",
        "]−∞,−3] ∪ ]3,+∞[",
        "ℝ",
        "[−3,3]"
      ],
      answerIndex: 0,
      explanation:
        "x²−9 > 0 → x < -3 ou x > 3."
    }
  ]
};