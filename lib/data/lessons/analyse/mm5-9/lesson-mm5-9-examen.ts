export const lesson_mm5_9_exam = {
  id: "lesson-mm5-9-examen",
  chapterId: "mm5-9",
  title: "Exercices type examen (niveau avancé)",
  minutes: 30,
  order: 8,
  summary:
    "S'entraîner avec des exercices de niveau examen pour maîtriser toutes les situations possibles et éviter les pièges classiques.",
  content: [
    {
      type: "text",
      value:
        "Cette leçon contient des exercices de niveau examen. Ici, les pièges sont volontairement présents."
    },
    {
      type: "tip",
      value:
        "Objectif : être capable de résoudre n’importe quel exercice le jour du contrôle."
    },

    // ================= EXERCICE 1 =================

    {
      type: "exercise",
      title: "Exercice 1 — Classique piégé",
      prompt:
        "Soit f(x)=√(x−2)/(x−2). Quel est le domaine de définition ?",
      choices: [
        "[2,+∞[",
        "]2,+∞[",
        "ℝ",
        "[2,+∞[ \\ {2}"
      ],
      correctChoiceIndex: 1,
      hint: "Attention : même expression en haut et en bas.",
      solutionSteps: [
        "Racine → x - 2 ≥ 0 donc x ≥ 2.",
        "Dénominateur → x - 2 ≠ 0 donc x ≠ 2.",
        "On combine → x > 2.",
        "Conclusion : ]2,+∞[."
      ]
    },

    // ================= EXERCICE 2 =================

    {
      type: "exercise",
      title: "Exercice 2 — Factorisation obligatoire",
      prompt:
        "Soit g(x)=√(x²−4)/(x+2). Domaine ?",
      choices: [
        "]−∞,−2] ∪ ]2,+∞[",
        "]−∞,−2[ ∪ ]2,+∞[",
        "ℝ",
        "]−∞,−2] ∪ [2,+∞["
      ],
      correctChoiceIndex: 1,
      hint: "Factorise x² - 4.",
      solutionSteps: [
        "x² - 4 ≥ 0 → (x - 2)(x + 2) ≥ 0.",
        "Solution → x ≤ -2 ou x ≥ 2.",
        "Dénominateur → x ≠ -2.",
        "On enlève -2.",
        "Conclusion : ]−∞,−2[ ∪ ]2,+∞[."
      ]
    },

    // ================= EXERCICE 3 =================

    {
      type: "exercise",
      title: "Exercice 3 — Racine au dénominateur",
      prompt:
        "Soit h(x)=1/√(x²−1). Domaine ?",
      choices: [
        "]−∞,−1[ ∪ ]1,+∞[",
        "]−∞,−1] ∪ ]1,+∞[",
        "ℝ",
        "[-1,+∞["
      ],
      correctChoiceIndex: 0,
      hint: "Strictement > 0.",
      solutionSteps: [
        "x² - 1 > 0.",
        "Factorisation → (x - 1)(x + 1) > 0.",
        "Solution → x < -1 ou x > 1.",
        "Conclusion : ]−∞,−1[ ∪ ]1,+∞[."
      ]
    },

    // ================= EXERCICE 4 =================

    {
      type: "exercise",
      title: "Exercice 4 — Double contrainte",
      prompt:
        "Soit p(x)=√(x+3)/√(x−2). Domaine ?",
      choices: [
        "[−3,+∞[",
        "]2,+∞[",
        "[2,+∞[",
        "]−3,+∞["
      ],
      correctChoiceIndex: 1,
      hint: "Intersection.",
      solutionSteps: [
        "x + 3 ≥ 0 → x ≥ -3.",
        "x - 2 > 0 → x > 2.",
        "Intersection → x > 2.",
        "Conclusion : ]2,+∞[."
      ]
    },

    // ================= EXERCICE 5 =================

    {
      type: "exercise",
      title: "Exercice 5 — Niveau bac",
      prompt:
        "Soit q(x)=√(x²−9)/(x−3). Domaine ?",
      choices: [
        "]−∞,−3] ∪ ]3,+∞[",
        "]−∞,−3[ ∪ ]3,+∞[",
        "ℝ",
        "]−∞,−3] ∪ [3,+∞["
      ],
      correctChoiceIndex: 0,
      hint: "Attention à x = 3.",
      solutionSteps: [
        "x² - 9 ≥ 0 → x ≤ -3 ou x ≥ 3.",
        "x - 3 ≠ 0 → x ≠ 3.",
        "On enlève 3.",
        "Conclusion : ]−∞,−3] ∪ ]3,+∞[."
      ]
    },

    // ================= EXERCICE 6 =================

    {
      type: "exercise",
      title: "Exercice 6 — Piège classique",
      prompt:
        "Soit r(x)=√(x−1)/(x²−1). Domaine ?",
      choices: [
        "[1,+∞[ \\ {1}",
        "]1,+∞[",
        "ℝ",
        "[1,+∞["
      ],
      correctChoiceIndex: 1,
      hint: "Factorise x² - 1.",
      solutionSteps: [
        "x - 1 ≥ 0 → x ≥ 1.",
        "x² - 1 ≠ 0 → (x - 1)(x + 1) ≠ 0.",
        "Donc x ≠ 1 et x ≠ -1.",
        "Intersection avec x ≥ 1 → x > 1.",
        "Conclusion : ]1,+∞[."
      ]
    },

    // ================= BILAN =================

    {
      type: "text",
      value:
        "Si tu arrives à résoudre ces exercices, tu es prêt pour un examen sur le domaine de définition."
    },
    {
      type: "tip",
      value:
        "En examen : prends ton temps, applique la méthode, et vérifie toujours les valeurs interdites."
    }
  ]
};