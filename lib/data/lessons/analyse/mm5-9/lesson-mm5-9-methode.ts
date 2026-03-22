export const lesson_mm5_9_methode = {
  id: "lesson-mm5-9-methode",
  chapterId: "mm5-9",
  title: "Méthode complète pour déterminer un domaine de définition",
  minutes: 22,
  order: 6,
  summary:
    "Apprendre une méthode claire, structurée et infaillible pour déterminer le domaine de définition de n’importe quelle fonction, même dans les cas complexes.",
  content: [
    {
      type: "text",
      value:
        "Jusqu’ici, tu as vu plusieurs types de fonctions. Maintenant, on va réunir tout ce que tu as appris dans une méthode unique que tu peux appliquer à n’importe quel exercice."
    },
    {
      type: "tip",
      value:
        "Objectif : ne plus jamais te tromper sur un domaine de définition."
    },

    {
      type: "definition",
      value:
        "Méthode générale : pour trouver le domaine de définition, il faut repérer toutes les contraintes, les résoudre, puis faire leur intersection."
    },

    // ================= ETAPES =================

    {
      type: "text",
      value: "Voici la méthode complète en 5 étapes :"
    },

    {
      type: "solutionSteps",
      steps: [
        "Étape 1 : écrire clairement la fonction.",
        "Étape 2 : repérer les éléments dangereux (fraction, racine, etc.).",
        "Étape 3 : traduire chaque danger en condition mathématique.",
        "Étape 4 : résoudre les conditions.",
        "Étape 5 : faire l’intersection et conclure."
      ]
    },

    // ================= EXEMPLE COMPLET =================

    {
      type: "example",
      title: "Exemple complet guidé",
      value:
        "Soit f(x) = √(x - 2) / (x - 4). On va appliquer la méthode étape par étape."
    },

    {
      type: "formula",
      value: "f(x)=\\frac{\\sqrt{x-2}}{x-4}"
    },

    {
      type: "solutionSteps",
      title: "Application de la méthode",
      steps: [
        "Étape 1 : on observe la fonction.",
        "Étape 2 : il y a une racine et un dénominateur.",
        "Étape 3 : racine → x - 2 ≥ 0 ; dénominateur → x - 4 ≠ 0.",
        "Étape 4 : on résout → x ≥ 2 et x ≠ 4.",
        "Étape 5 : on combine → x ≥ 2 sauf 4."
      ]
    },

    {
      type: "formula",
      value: "D_f=[2,+\\infty[\\setminus\\{4\\}"
    },

    {
      type: "text",
      value:
        "Tu remarques que la méthode fonctionne toujours, même quand il y a plusieurs contraintes."
    },

    // ================= CAS AVEC TABLEAU DE SIGNE =================

    {
      type: "example",
      title: "Cas avec inéquation plus complexe",
      value:
        "Soit g(x) = √(x² - 9). Ici, on doit résoudre une inéquation."
    },

    {
      type: "formula",
      value: "g(x)=\\sqrt{x^2-9}"
    },

    {
      type: "solutionSteps",
      steps: [
        "On impose x² - 9 ≥ 0.",
        "On factorise : (x - 3)(x + 3) ≥ 0.",
        "On étudie le signe.",
        "Solution : x ≤ -3 ou x ≥ 3.",
        "Conclusion : deux intervalles."
      ]
    },

    {
      type: "formula",
      value: "D_g=]-\\infty,-3]\\cup[3,+\\infty["
    },

    // ================= PIÈGES =================

    {
      type: "text",
      value: "Voici les erreurs les plus fréquentes :"
    },

    {
      type: "example",
      title: "Erreur 1",
      value:
        "Oublier une contrainte (par exemple ne regarder que la racine et oublier le dénominateur)."
    },
    {
      type: "example",
      title: "Erreur 2",
      value:
        "Ne pas faire l’intersection (écrire deux conditions séparées sans les combiner)."
    },
    {
      type: "example",
      title: "Erreur 3",
      value:
        "Confondre ≥ et > (très grave en examen)."
    },

    {
      type: "tip",
      value:
        "Réflexe expert : dès que tu vois une fonction → tu scans immédiatement les contraintes."
    },

    // ================= EXERCICES =================

    {
      type: "exercise",
      title: "Exercice 1",
      prompt: "Soit f(x)=√(x-1)/(x+2). Trouver le domaine.",
      choices: [
        "[1,+∞[",
        "[1,+∞[ \\ {-2}",
        "]1,+∞[",
        "ℝ"
      ],
      correctChoiceIndex: 1,
      hint: "Deux contraintes.",
      solutionSteps: [
        "x - 1 ≥ 0 → x ≥ 1.",
        "x + 2 ≠ 0 → x ≠ -2.",
        "-2 n’est pas dans x ≥ 1.",
        "Donc domaine = [1,+∞[."
      ]
    },

    {
      type: "exercise",
      title: "Exercice 2",
      prompt: "Soit g(x)=√(x²-4)/(x-2). Domaine ?",
      choices: [
        "]−∞,−2] ∪ ]2,+∞[",
        "]−∞,−2] ∪ [2,+∞[",
        "ℝ",
        "]−∞,−2[ ∪ ]2,+∞["
      ],
      correctChoiceIndex: 0,
      hint: "Attention à x = 2.",
      solutionSteps: [
        "x² - 4 ≥ 0 → x ≤ -2 ou x ≥ 2.",
        "x - 2 ≠ 0 → x ≠ 2.",
        "On enlève 2.",
        "Conclusion : ]−∞,−2] ∪ ]2,+∞[."
      ]
    },

    {
      type: "exercise",
      title: "Exercice 3 (niveau examen)",
      prompt: "Soit h(x)=√(x+1)/√(x-3). Domaine ?",
      choices: [
        "[−1,+∞[",
        "]3,+∞[",
        "[3,+∞[",
        "ℝ"
      ],
      correctChoiceIndex: 1,
      hint: "Racine au dénominateur = strict.",
      solutionSteps: [
        "x + 1 ≥ 0 → x ≥ -1.",
        "x - 3 > 0 → x > 3.",
        "Intersection → x > 3.",
        "Conclusion : ]3,+∞[."
      ]
    },

    {
      type: "text",
      value:
        "Bilan : si tu maîtrises cette méthode, tu peux résoudre tous les exercices sur le domaine de définition."
    }
  ]
};