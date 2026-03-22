export const lesson_mm59_racines = {
  id: "lesson-mm5-9-racines",
  chapterId: "mm5-9",
  title: "Racines carrées et contraintes",
  minutes: 22,
  order: 3,
  summary:
    "Comprendre pourquoi une racine carrée impose une condition sur x, savoir déterminer les valeurs autorisées, et éviter les erreurs classiques liées aux expressions sous la racine.",
  content: [
    {
      type: "text",
      value:
        "Petite question : que vaut √(-1) ? Essaie d’y répondre honnêtement avant de lire la suite."
    },
    {
      type: "text",
      value:
        "Si tu as essayé, tu as sûrement remarqué que ce calcul pose problème. En effet, en mathématiques classiques (au lycée), la racine carrée d’un nombre négatif n’existe pas."
    },
    {
      type: "tip",
      value:
        "Règle fondamentale : on ne peut pas calculer la racine carrée d’un nombre négatif."
    },
    {
      type: "definition",
      value:
        "Pour une expression de la forme √(A), on doit toujours avoir A ≥ 0."
    },
    {
      type: "text",
      value:
        "Cela veut dire que tout ce qui est sous la racine carrée doit être positif ou nul. Sinon, le calcul est impossible."
    },
    {
      type: "example",
      title: "Exemple simple",
      value:
        "Considérons f(x) = √x. Pour que cette expression ait un sens, on doit avoir x ≥ 0. Donc toutes les valeurs négatives sont interdites."
    },
    {
      type: "formula",
      value: "f(x)=\\sqrt{x}"
    },
    {
      type: "formula",
      value: "x\\geq 0"
    },
    {
      type: "formula",
      value: "D_f=[0,+\\infty["
    },
    {
      type: "text",
      value:
        "Contrairement aux fractions, ici on ne retire pas une valeur précise. On impose une condition sur tout un intervalle."
    },
    {
      type: "example",
      title: "Exemple avec expression",
      value:
        "Considérons g(x) = √(x - 3). On impose que l’intérieur de la racine soit positif ou nul : x - 3 ≥ 0. Donc x ≥ 3."
    },
    {
      type: "formula",
      value: "g(x)=\\sqrt{x-3}"
    },
    {
      type: "solutionSteps",
      title: "Étapes de résolution",
      steps: [
        "On repère la racine carrée √(x - 3).",
        "On impose x - 3 ≥ 0.",
        "On ajoute 3 des deux côtés.",
        "On obtient x ≥ 3.",
        "Conclusion : seules les valeurs supérieures ou égales à 3 sont autorisées."
      ]
    },
    {
      type: "formula",
      value: "D_g=[3,+\\infty["
    },
    {
      type: "tip",
      value:
        "Pattern expert : racine carrée → expression ≥ 0. Toujours."
    },
    {
      type: "example",
      title: "Exemple plus complexe",
      value:
        "Soit h(x) = √(2x + 1). On impose 2x + 1 ≥ 0. Donc 2x ≥ -1, puis x ≥ -1/2."
    },
    {
      type: "formula",
      value: "h(x)=\\sqrt{2x+1}"
    },
    {
      type: "solutionSteps",
      title: "Détail du raisonnement",
      steps: [
        "On repère la racine √(2x + 1).",
        "On impose 2x + 1 ≥ 0.",
        "On soustrait 1 : 2x ≥ -1.",
        "On divise par 2 : x ≥ -1/2.",
        "Conclusion : x ≥ -1/2."
      ]
    },
    {
      type: "formula",
      value: "D_h=[-\\frac{1}{2},+\\infty["
    },
    {
      type: "text",
      value:
        "Attention : ici, la difficulté n’est pas la racine, mais la résolution de l’inéquation."
    },
    {
      type: "example",
      title: "Piège fréquent",
      value:
        "Certains élèves écrivent x - 4 ≠ 0 pour √(x - 4). C’est faux. Ce n’est pas une fraction. Il faut écrire x - 4 ≥ 0."
    },
    {
      type: "tip",
      value:
        "Ne confonds jamais : fraction → ≠ 0, racine → ≥ 0."
    },
    {
      type: "example",
      title: "Autre piège",
      value:
        "Dans √(x² - 9), il ne faut pas dire x² - 9 ≥ 0 sans résoudre. Il faut résoudre complètement l’inéquation."
    },
    {
      type: "formula",
      value: "x^2-9\\geq 0"
    },
    {
      type: "solutionSteps",
      title: "Résolution complète",
      steps: [
        "On a x² - 9 ≥ 0.",
        "On reconnaît une différence de carrés : (x - 3)(x + 3) ≥ 0.",
        "On étudie le signe du produit.",
        "On trouve que x ≤ -3 ou x ≥ 3.",
        "Conclusion : deux intervalles sont autorisés."
      ]
    },
    {
      type: "formula",
      value: "D=[-\\infty,-3]\\cup[3,+\\infty["
    },
    {
      type: "exercise",
      title: "Exercice 1 — Facile",
      prompt: "Soit f(x)=√(x+2). Quel est son domaine ?",
      choices: [
        "D_f = ℝ",
        "D_f = [−2,+∞[",
        "D_f = ℝ \\ {−2}",
        "D_f = ]−∞,−2]"
      ],
      correctChoiceIndex: 1,
      hint: "Impose x+2 ≥ 0.",
      solutionSteps: [
        "On impose x + 2 ≥ 0.",
        "Donc x ≥ -2.",
        "Conclusion : D_f = [−2,+∞[."
      ]
    },
    {
      type: "exercise",
      title: "Exercice 2 — Moyen",
      prompt: "Soit g(x)=√(3x−6). Quel est son domaine ?",
      choices: [
        "D_g = [2,+∞[",
        "D_g = ℝ",
        "D_g = ]−∞,2]",
        "D_g = ℝ \\ {2}"
      ],
      correctChoiceIndex: 0,
      hint: "Impose 3x - 6 ≥ 0.",
      solutionSteps: [
        "On impose 3x - 6 ≥ 0.",
        "Donc 3x ≥ 6.",
        "Puis x ≥ 2.",
        "Conclusion : D_g = [2,+∞[."
      ]
    },
    {
      type: "exercise",
      title: "Exercice 3 — Piège",
      prompt: "Soit h(x)=√(x²−4). Quel est son domaine ?",
      choices: [
        "D_h = [−2,+∞[",
        "D_h = ℝ",
        "D_h = ]−∞,−2] ∪ [2,+∞[",
        "D_h = ℝ \\ {−2,2}"
      ],
      correctChoiceIndex: 2,
      hint: "Résous x² - 4 ≥ 0.",
      solutionSteps: [
        "On impose x² - 4 ≥ 0.",
        "On factorise : (x - 2)(x + 2) ≥ 0.",
        "On étudie le signe.",
        "Solution : x ≤ -2 ou x ≥ 2.",
        "Conclusion : D_h = ]−∞,−2] ∪ [2,+∞[."
      ]
    },
    {
      type: "text",
      value:
        "Bilan : une racine carrée impose toujours une inéquation. Tu dois résoudre cette inéquation pour trouver le domaine."
    }
  ]
};