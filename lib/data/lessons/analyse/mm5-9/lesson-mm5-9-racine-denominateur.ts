export const lesson_mm59_racine_denominateur = {
  id: "lesson-mm5-9-racine-denominateur",
  chapterId: "mm5-9",
  title: "Racine au dénominateur",
  minutes: 25,
  order: 4,
  summary:
    "Comprendre les fonctions avec racine carrée au dénominateur, savoir combiner plusieurs contraintes et éviter les erreurs les plus fréquentes.",
  content: [
    {
      type: "text",
      value:
        "On arrive maintenant à une situation très importante : quand une racine carrée se trouve AU DÉNOMINATEUR."
    },
    {
      type: "text",
      value:
        "Ici, il ne suffit plus d’imposer une seule condition. Il faut en imposer deux en même temps."
    },
    {
      type: "tip",
      value:
        "Règle clé : si une racine est au dénominateur → expression STRICTEMENT positive."
    },
    {
      type: "definition",
      value:
        "Pour une expression de la forme 1 / √(A), on doit avoir A > 0."
    },
    {
      type: "text",
      value:
        "Pourquoi strictement positif ? Parce que : (1) une racine carrée ne peut pas être négative, (2) un dénominateur ne peut jamais être égal à 0."
    },
    {
      type: "example",
      title: "Exemple simple",
      value:
        "Considérons f(x) = 1 / √x. Ici, deux règles s’appliquent : x ≥ 0 (à cause de la racine) ET x ≠ 0 (à cause du dénominateur). En combinant, on obtient x > 0."
    },
    {
      type: "formula",
      value: "f(x)=\\frac{1}{\\sqrt{x}}"
    },
    {
      type: "solutionSteps",
      title: "Analyse des contraintes",
      steps: [
        "On repère une racine √x.",
        "Condition 1 : x ≥ 0.",
        "Mais la racine est au dénominateur.",
        "Condition 2 : √x ≠ 0 donc x ≠ 0.",
        "On combine : x ≥ 0 ET x ≠ 0.",
        "Conclusion : x > 0."
      ]
    },
    {
      type: "formula",
      value: "D_f=]0,+\\infty["
    },
    {
      type: "text",
      value:
        "Tu vois la différence avec une racine normale ? Ici, on exclut aussi 0."
    },
    {
      type: "example",
      title: "Exemple avec expression",
      value:
        "Soit g(x) = 1 / √(x - 4). On impose x - 4 > 0. Donc x > 4."
    },
    {
      type: "formula",
      value: "g(x)=\\frac{1}{\\sqrt{x-4}}"
    },
    {
      type: "solutionSteps",
      title: "Résolution",
      steps: [
        "On repère √(x - 4) au dénominateur.",
        "On impose x - 4 > 0.",
        "On ajoute 4 : x > 4.",
        "Conclusion : seules les valeurs strictement supérieures à 4 sont autorisées."
      ]
    },
    {
      type: "formula",
      value: "D_g=]4,+\\infty["
    },
    {
      type: "tip",
      value:
        "Pattern expert : racine seule → ≥ 0 ; racine au dénominateur → > 0."
    },
    {
      type: "example",
      title: "Exemple combiné",
      value:
        "Soit h(x) = √(x+2) / √(x-1). Ici, on a deux racines. Une au numérateur, une au dénominateur."
    },
    {
      type: "formula",
      value: "h(x)=\\frac{\\sqrt{x+2}}{\\sqrt{x-1}}"
    },
    {
      type: "solutionSteps",
      title: "Analyse complète",
      steps: [
        "Racine au numérateur → x + 2 ≥ 0 → x ≥ -2.",
        "Racine au dénominateur → x - 1 > 0 → x > 1.",
        "On combine les deux conditions.",
        "Intersection : x > 1."
      ]
    },
    {
      type: "formula",
      value: "D_h=]1,+\\infty["
    },
    {
      type: "text",
      value:
        "Attention : quand on combine plusieurs conditions, on garde uniquement les valeurs qui respectent TOUTES les contraintes."
    },
    {
      type: "example",
      title: "Piège fréquent",
      value:
        "Certains élèves écrivent x ≥ 1 au lieu de x > 1. C’est faux. À cause du dénominateur, la valeur 1 est interdite."
    },
    {
      type: "tip",
      value:
        "Erreur classique : oublier le « strict ». Dès qu’il y a une racine au dénominateur → toujours strictement positif."
    },
    {
      type: "example",
      title: "Cas avancé",
      value:
        "Soit p(x) = 1 / √(x² - 9). On impose x² - 9 > 0."
    },
    {
      type: "formula",
      value: "p(x)=\\frac{1}{\\sqrt{x^2-9}}"
    },
    {
      type: "solutionSteps",
      title: "Résolution complète",
      steps: [
        "On impose x² - 9 > 0.",
        "On factorise : (x - 3)(x + 3) > 0.",
        "On étudie le signe.",
        "Solution : x < -3 ou x > 3.",
        "Conclusion : deux intervalles."
      ]
    },
    {
      type: "formula",
      value: "D_p=]-\\infty,-3[\\cup]3,+\\infty["
    },
    {
      type: "exercise",
      title: "Exercice 1 — Facile",
      prompt: "Soit f(x)=1/√(x+1). Quel est son domaine ?",
      choices: [
        "D_f = [−1,+∞[",
        "D_f = ]−1,+∞[",
        "D_f = ℝ",
        "D_f = ℝ \\ {−1}"
      ],
      correctChoiceIndex: 1,
      hint: "Racine au dénominateur → strict.",
      solutionSteps: [
        "On impose x + 1 > 0.",
        "Donc x > -1.",
        "Conclusion : D_f = ]−1,+∞[."
      ]
    },
    {
      type: "exercise",
      title: "Exercice 2 — Moyen",
      prompt: "Soit g(x)=1/√(2x−6). Quel est son domaine ?",
      choices: [
        "D_g = ]3,+∞[",
        "D_g = [3,+∞[",
        "D_g = ℝ",
        "D_g = ℝ \\ {3}"
      ],
      correctChoiceIndex: 0,
      hint: "Résous 2x - 6 > 0.",
      solutionSteps: [
        "On impose 2x - 6 > 0.",
        "Donc 2x > 6.",
        "Puis x > 3.",
        "Conclusion : D_g = ]3,+∞[."
      ]
    },
    {
      type: "exercise",
      title: "Exercice 3 — Difficile",
      prompt: "Soit h(x)=√(x+4)/√(x−2). Quel est son domaine ?",
      choices: [
        "D_h = [−4,+∞[",
        "D_h = ]2,+∞[",
        "D_h = [−4,+∞[ \\ {2}",
        "D_h = ℝ"
      ],
      correctChoiceIndex: 1,
      hint: "Combine ≥ et >.",
      solutionSteps: [
        "x + 4 ≥ 0 → x ≥ -4.",
        "x - 2 > 0 → x > 2.",
        "Intersection → x > 2.",
        "Conclusion : D_h = ]2,+∞[."
      ]
    },
    {
      type: "text",
      value:
        "Bilan : dès qu’une racine est au dénominateur, tu dois être très vigilant. C’est l’un des pièges les plus fréquents en analyse."
    }
  ]
};