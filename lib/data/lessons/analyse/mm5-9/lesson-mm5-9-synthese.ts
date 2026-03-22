export const lesson_mm5_9_synthese = {
  id: "lesson-mm5-9-synthese",
  chapterId: "mm5-9",
  title: "Synthèse — Domaine de définition (fiche rapide)",
  minutes: 10,
  order: 7,
  summary:
    "Une fiche de révision claire et rapide pour retenir l’essentiel du domaine de définition et éviter les erreurs le jour de l’examen.",
  content: [
    {
      type: "text",
      value:
        "Cette leçon est une fiche mentale. Elle te permet de revoir tout le chapitre en quelques minutes avant un contrôle ou un examen."
    },

    // ================= REGLES =================

    {
      type: "definition",
      value:
        "Le domaine de définition est l’ensemble des valeurs de x pour lesquelles une fonction a un sens."
    },

    {
      type: "text",
      value:
        "Règle générale : on cherche ce qui est interdit, puis on enlève ces valeurs."
    },

    // ================= TABLEAU MENTAL =================

    {
      type: "text",
      value: "Règles à retenir absolument :"
    },

    {
      type: "solutionSteps",
      steps: [
        "Fraction → le dénominateur ne doit jamais être égal à 0.",
        "Racine carrée → l’intérieur doit être ≥ 0.",
        "Racine au dénominateur → l’intérieur doit être > 0.",
        "Polynôme → toujours défini sur ℝ.",
        "Plusieurs contraintes → faire l’intersection."
      ]
    },

    {
      type: "tip",
      value:
        "Astuce : si tu vois une fraction → pense immédiatement “≠ 0”. Si tu vois une racine → pense “≥ 0”."
    },

    // ================= EXEMPLES RAPIDES =================

    {
      type: "example",
      title: "Exemple 1",
      value:
        "f(x) = 1 / (x - 3) → x ≠ 3 → D = ℝ \\ {3}"
    },
    {
      type: "example",
      title: "Exemple 2",
      value:
        "g(x) = √(x - 2) → x ≥ 2 → D = [2,+∞["
    },
    {
      type: "example",
      title: "Exemple 3",
      value:
        "h(x) = 1 / √(x - 4) → x > 4 → D = ]4,+∞["
    },
    {
      type: "example",
      title: "Exemple 4",
      value:
        "p(x) = √(x+1)/(x-2) → x ≥ -1 et x ≠ 2"
    },

    // ================= ERREURS =================

    {
      type: "text",
      value: "Erreurs à éviter absolument :"
    },

    {
      type: "solutionSteps",
      steps: [
        "Oublier une contrainte.",
        "Ne pas combiner les conditions.",
        "Confondre ≥ et >.",
        "Oublier d’exclure une valeur interdite.",
        "Se tromper entre domaine et image."
      ]
    },

    {
      type: "tip",
      value:
        "Erreur classique : écrire x ≥ 4 au lieu de x > 4 quand la racine est au dénominateur."
    },

    // ================= METHODE EXPRESS =================

    {
      type: "text",
      value: "Méthode express (à utiliser en examen) :"
    },

    {
      type: "solutionSteps",
      steps: [
        "1. Je repère les dangers.",
        "2. J’écris les conditions.",
        "3. Je résous.",
        "4. Je fais l’intersection.",
        "5. Je conclus proprement."
      ]
    },

    {
      type: "tip",
      value:
        "Si tu fais ça systématiquement, tu ne peux pas te tromper."
    },

    // ================= EXERCICE FLASH =================

    {
      type: "exercise",
      title: "Test rapide",
      prompt:
        "Soit f(x)=√(x−2)/(x−5). Quel est le domaine ?",
      choices: [
        "[2,+∞[",
        "[2,+∞[ \\ {5}",
        "]2,+∞[",
        "ℝ"
      ],
      correctChoiceIndex: 1,
      hint: "Deux contraintes.",
      solutionSteps: [
        "x - 2 ≥ 0 → x ≥ 2.",
        "x - 5 ≠ 0 → x ≠ 5.",
        "Conclusion : [2,+∞[ privé de 5."
      ]
    },

    // ================= BILAN FINAL =================

    {
      type: "text",
      value:
        "Bilan final : le domaine de définition est toujours une question de logique. Si tu sais repérer les dangers et appliquer les règles, tu peux résoudre n’importe quel exercice."
    },

    {
      type: "tip",
      value:
        "Objectif examen : reconnaître le type de fonction en moins de 5 secondes."
    }
  ]
};