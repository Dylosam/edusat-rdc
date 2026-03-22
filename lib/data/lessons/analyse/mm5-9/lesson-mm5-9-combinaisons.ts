export const lesson_mm5_9_combinations = {
  id: "lesson-mm5-9-combinaisons",
  chapterId: "mm5-9",
  title: "Combinaisons de contraintes (niveau avancé)",
  minutes: 30,
  order: 5,
  summary:
    "Maîtriser les fonctions avec plusieurs contraintes simultanées (racines, dénominateurs, expressions combinées) et savoir résoudre les cas complexes comme en examen.",
  content: [
    {
      type: "text",
      value:
        "Jusqu’ici, tu as vu des contraintes séparées. Maintenant, on passe au niveau supérieur : plusieurs contraintes dans une seule fonction."
    },
    {
      type: "text",
      value:
        "Dans ce cas, il faut appliquer toutes les règles en même temps, puis garder uniquement les valeurs qui respectent tout."
    },
    {
      type: "definition",
      value:
        "Le domaine de définition d’une fonction avec plusieurs contraintes est l’intersection de toutes les conditions obtenues."
    },
    {
      type: "tip",
      value:
        "Mot-clé à retenir : INTERSECTION = valeurs qui respectent toutes les règles."
    },

    // ===== EXEMPLE 1 =====
    {
      type: "example",
      title: "Exemple 1 — Fraction + racine",
      value:
        "Soit f(x) = √(x - 1) / (x - 3). On a une racine et un dénominateur."
    },
    {
      type: "formula",
      value: "f(x)=\\frac{\\sqrt{x-1}}{x-3}"
    },
    {
      type: "solutionSteps",
      title: "Résolution complète",
      steps: [
        "Racine → x - 1 ≥ 0 donc x ≥ 1.",
        "Dénominateur → x - 3 ≠ 0 donc x ≠ 3.",
        "On combine les deux conditions.",
        "On garde x ≥ 1 mais on enlève 3.",
        "Conclusion : domaine = [1,+∞[ privé de 3."
      ]
    },
    {
      type: "formula",
      value: "D_f=[1,+\\infty[\\setminus\\{3\\}"
    },

    // ===== EXEMPLE 2 =====
    {
      type: "example",
      title: "Exemple 2 — Racine au dénominateur + autre racine",
      value:
        "Soit g(x) = √(x + 2) / √(x - 1). Ici, il y a deux contraintes différentes."
    },
    {
      type: "formula",
      value: "g(x)=\\frac{\\sqrt{x+2}}{\\sqrt{x-1}}"
    },
    {
      type: "solutionSteps",
      steps: [
        "Numérateur → x + 2 ≥ 0 donc x ≥ -2.",
        "Dénominateur → x - 1 > 0 donc x > 1.",
        "Intersection des deux conditions.",
        "La condition la plus restrictive est x > 1.",
        "Conclusion : x > 1."
      ]
    },
    {
      type: "formula",
      value: "D_g=]1,+\\infty["
    },

    // ===== EXEMPLE 3 (NIVEAU EXAM) =====
    {
      type: "example",
      title: "Exemple 3 — Niveau examen",
      value:
        "Soit h(x) = √(x² - 4) / (x - 2)."
    },
    {
      type: "formula",
      value: "h(x)=\\frac{\\sqrt{x^2-4}}{x-2}"
    },
    {
      type: "solutionSteps",
      title: "Résolution détaillée",
      steps: [
        "On analyse la racine : x² - 4 ≥ 0.",
        "On factorise : (x - 2)(x + 2) ≥ 0.",
        "Solution : x ≤ -2 ou x ≥ 2.",
        "Ensuite : dénominateur x - 2 ≠ 0 donc x ≠ 2.",
        "On combine les deux.",
        "On garde x ≤ -2 ou x > 2.",
        "Conclusion : deux intervalles."
      ]
    },
    {
      type: "formula",
      value: "D_h=]-\\infty,-2]\\cup]2,+\\infty["
    },

    {
      type: "tip",
      value:
        "Très important : même si une valeur est autorisée par une condition, elle peut être interdite par une autre."
    },

    // ===== ERREURS =====
    {
      type: "example",
      title: "Erreur fréquente 1",
      value:
        "Ne pas combiner les conditions. Beaucoup d’élèves écrivent les deux résultats séparément sans faire l’intersection."
    },
    {
      type: "example",
      title: "Erreur fréquente 2",
      value:
        "Oublier d’exclure une valeur interdite (comme x = 2 dans un dénominateur)."
    },
    {
      type: "example",
      title: "Erreur fréquente 3",
      value:
        "Confondre ≥ et >. Une racine au dénominateur impose toujours strictement >."
    },

    // ===== METHODE =====
    {
      type: "text",
      value:
        "Méthode complète (niveau expert) :"
    },
    {
      type: "solutionSteps",
      steps: [
        "Étape 1 : repérer toutes les contraintes.",
        "Étape 2 : écrire chaque condition séparément.",
        "Étape 3 : résoudre chaque condition.",
        "Étape 4 : faire l’intersection.",
        "Étape 5 : écrire la réponse proprement."
      ]
    },

    // ===== EXERCICES =====
    {
      type: "exercise",
      title: "Exercice 1 — Niveau moyen",
      prompt:
        "Soit f(x)=√(x−3)/(x+1). Quel est le domaine ?",
      choices: [
        "[3,+∞[",
        "[3,+∞[ \\ {-1}",
        "]3,+∞[",
        "ℝ"
      ],
      correctChoiceIndex: 1,
      hint: "Pense à enlever -1.",
      solutionSteps: [
        "x - 3 ≥ 0 → x ≥ 3.",
        "x + 1 ≠ 0 → x ≠ -1.",
        "Mais -1 n’est pas dans x ≥ 3.",
        "Donc domaine = [3,+∞[."
      ]
    },

    {
      type: "exercise",
      title: "Exercice 2 — Niveau difficile",
      prompt:
        "Soit g(x)=√(x²−1)/(x−1). Quel est le domaine ?",
      choices: [
        "]−∞,−1] ∪ ]1,+∞[",
        "]−∞,−1] ∪ [1,+∞[",
        "ℝ",
        "]−∞,−1[ ∪ ]1,+∞["
      ],
      correctChoiceIndex: 0,
      hint: "Attention à x = 1.",
      solutionSteps: [
        "x² - 1 ≥ 0 → x ≤ -1 ou x ≥ 1.",
        "x - 1 ≠ 0 → x ≠ 1.",
        "On enlève 1.",
        "Conclusion : ]−∞,−1] ∪ ]1,+∞[."
      ]
    },

    {
      type: "exercise",
      title: "Exercice 3 — Niveau expert",
      prompt:
        "Soit h(x)=√(x−2)/√(x−5). Quel est le domaine ?",
      choices: [
        "[2,+∞[",
        "]5,+∞[",
        "[5,+∞[",
        "]2,+∞["
      ],
      correctChoiceIndex: 1,
      hint: "Racine au dénominateur = strict.",
      solutionSteps: [
        "x - 2 ≥ 0 → x ≥ 2.",
        "x - 5 > 0 → x > 5.",
        "Intersection → x > 5.",
        "Conclusion : ]5,+∞[."
      ]
    },

    {
      type: "text",
      value:
        "Bilan final : plus il y a de contraintes, plus tu dois être rigoureux. Le secret est simple : analyser → résoudre → croiser."
    }
  ]
};