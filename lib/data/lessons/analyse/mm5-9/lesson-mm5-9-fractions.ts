export const lesson_mm59_fractions ={
  "id": "lesson-mm5-9-fractions",
  "chapterId": "mm5-9",
  "title": "Fonctions rationnelles et dénominateur nul",
  "minutes": 20,
  "order": 2,
  "summary": "Cette leçon explique en détail pourquoi un dénominateur ne doit jamais être nul, comment repérer rapidement les valeurs interdites dans une fonction rationnelle, et comment éviter les erreurs les plus fréquentes.",
  "content": [
    {
      "type": "text",
      "value": "Dans cette leçon, nous allons approfondir une règle essentielle : dans une fraction, le dénominateur ne doit jamais être égal à 0."
    },
    {
      "type": "text",
      "value": "Beaucoup d’erreurs en domaine de définition viennent d’un oubli très simple : l’élève voit une fraction, mais ne pense pas immédiatement à vérifier le dénominateur."
    },
    {
      "type": "tip",
      "value": "Réflexe automatique à adopter : dès que tu vois une fraction, pense immédiatement à la règle 'dénominateur ≠ 0'."
    },
    {
      "type": "definition",
      "value": "Une fonction rationnelle est une fonction qui contient une fraction dans laquelle x apparaît au dénominateur."
    },
    {
      "type": "text",
      "value": "Pourquoi le dénominateur ne peut-il pas être nul ? Parce qu’en mathématiques, la division par 0 n’a pas de sens. C’est un calcul impossible."
    },
    {
      "type": "example",
      "title": "Exemple très simple",
      "value": "Considérons la fonction f(x) = 1 / x. Si x = 0, alors on obtient 1 / 0, ce qui est impossible. Donc 0 est une valeur interdite."
    },
    {
      "type": "formula",
      "value": "f(x)=\\frac{1}{x}"
    },
    {
      "type": "formula",
      "value": "x\\neq 0"
    },
    {
      "type": "formula",
      "value": "D_f=\\mathbb{R}\\setminus\\{0\\}"
    },
    {
      "type": "text",
      "value": "Remarque importante : ici, le problème ne vient pas du numérateur. Même si le numérateur vaut 0, cela ne pose pas de problème. C’est uniquement le dénominateur qui décide s’il y a une valeur interdite."
    },
    {
      "type": "example",
      "title": "Exemple avec expression au dénominateur",
      "value": "Considérons maintenant g(x) = 3 / (x - 5). Pour trouver le domaine, on cherche quand le dénominateur devient nul. On résout x - 5 = 0, donc x = 5. Cette valeur est interdite."
    },
    {
      "type": "formula",
      "value": "g(x)=\\frac{3}{x-5}"
    },
    {
      "type": "solutionSteps",
      "title": "Étapes de résolution",
      "steps": [
        "Repérer la partie dangereuse : le dénominateur x - 5.",
        "Rappeler la règle : le dénominateur ne doit jamais être nul.",
        "Poser la condition : x - 5 ≠ 0.",
        "Résoudre : x ≠ 5.",
        "Conclure : tous les réels sont autorisés sauf 5."
      ]
    },
    {
      "type": "formula",
      "value": "D_g=\\mathbb{R}\\setminus\\{5\\}"
    },
    {
      "type": "text",
      "value": "Tu remarques que la méthode est toujours la même : repérer le dénominateur, poser qu’il est différent de 0, résoudre, puis conclure."
    },
    {
      "type": "example",
      "title": "Exemple avec coefficient",
      "value": "Soit h(x) = (2x + 1) / (4x - 8). Le dénominateur est 4x - 8. On impose 4x - 8 ≠ 0. Donc 4x ≠ 8, puis x ≠ 2. La seule valeur interdite est 2."
    },
    {
      "type": "formula",
      "value": "h(x)=\\frac{2x+1}{4x-8}"
    },
    {
      "type": "solutionSteps",
      "title": "Détail du raisonnement",
      "steps": [
        "Le dénominateur est 4x - 8.",
        "On impose 4x - 8 ≠ 0.",
        "On ajoute 8 des deux côtés : 4x ≠ 8.",
        "On divise par 4 : x ≠ 2.",
        "Conclusion : 2 est interdit."
      ]
    },
    {
      "type": "formula",
      "value": "D_h=\\mathbb{R}\\setminus\\{2\\}"
    },
    {
      "type": "tip",
      "value": "Même si le dénominateur est plus compliqué, la logique ne change jamais : on cherche les valeurs qui l’annulent."
    },
    {
      "type": "text",
      "value": "Attention à une confusion fréquente : certains élèves pensent qu’il faut aussi exclure les valeurs qui annulent le numérateur. C’est faux."
    },
    {
      "type": "example",
      "title": "Erreur fréquente",
      "value": "Dans p(x) = (x - 3) / (x + 1), certains disent que x = 3 est interdit parce que le numérateur vaut 0. C’est faux. Si x = 3, on obtient 0 / 4 = 0, ce qui est parfaitement possible. La seule valeur interdite est x = -1."
    },
    {
      "type": "formula",
      "value": "p(x)=\\frac{x-3}{x+1}"
    },
    {
      "type": "formula",
      "value": "x+1\\neq 0 \\Rightarrow x\\neq -1"
    },
    {
      "type": "text",
      "value": "Retenons donc ceci : le numérateur peut valoir 0, mais le dénominateur ne peut jamais valoir 0."
    },
    {
      "type": "example",
      "title": "Méthode générale à mémoriser",
      "value": "Pour toute fonction rationnelle, tu peux suivre cette méthode : 1) repérer le dénominateur ; 2) poser qu’il est différent de 0 ; 3) résoudre la condition ; 4) exclure les valeurs trouvées."
    },
    {
      "type": "tip",
      "value": "Pattern expert : fraction = dénominateur ≠ 0. Cette association doit devenir immédiate dans ton esprit."
    },
    {
      "type": "exercise",
      "title": "Exercice 1 — Facile",
      "prompt": "Soit f(x)=\\frac{7}{x+2}. Quel est son domaine de définition ?",
      "choices": [
        "D_f=\\mathbb{R}",
        "D_f=\\mathbb{R}\\setminus\\{2\\}",
        "D_f=\\mathbb{R}\\setminus\\{-2\\}",
        "D_f=\\{-2\\}"
      ],
      "correctChoiceIndex": 2,
      "hint": "Cherche la valeur qui annule x+2.",
      "solutionSteps": [
        "Le dénominateur est x + 2.",
        "On impose x + 2 ≠ 0.",
        "Donc x ≠ -2.",
        "Conclusion : D_f = ℝ \\ {-2}."
      ]
    },
    {
      "type": "exercise",
      "title": "Exercice 2 — Moyen",
      "prompt": "Soit g(x)=\\frac{2x-1}{3x+6}. Quel est son domaine de définition ?",
      "choices": [
        "D_g=\\mathbb{R}\\setminus\\{-2\\}",
        "D_g=\\mathbb{R}\\setminus\\{2\\}",
        "D_g=\\mathbb{R}",
        "D_g=\\{-2\\}"
      ],
      "correctChoiceIndex": 0,
      "hint": "Commence uniquement par le dénominateur 3x+6.",
      "solutionSteps": [
        "Le dénominateur est 3x + 6.",
        "On impose 3x + 6 ≠ 0.",
        "Donc 3x ≠ -6.",
        "Puis x ≠ -2.",
        "Le numérateur 2x - 1 n’interdit rien pour le domaine.",
        "Conclusion : D_g = ℝ \\ {-2}."
      ]
    },
    {
      "type": "exercise",
      "title": "Exercice 3 — Piège classique",
      "prompt": "Soit h(x)=\\frac{x-4}{x-1}. Quelle affirmation est correcte ?",
      "choices": [
        "Les valeurs interdites sont 4 et 1",
        "La seule valeur interdite est 4",
        "La seule valeur interdite est 1",
        "Il n’y a aucune valeur interdite"
      ],
      "correctChoiceIndex": 2,
      "hint": "Ne confonds pas numérateur et dénominateur.",
      "solutionSteps": [
        "Le numérateur est x - 4 : ce n’est pas lui qui crée une interdiction.",
        "Le dénominateur est x - 1.",
        "On impose x - 1 ≠ 0.",
        "Donc x ≠ 1.",
        "Conclusion : la seule valeur interdite est 1."
      ]
    },
    {
      "type": "text",
      "value": "Bilan : dans une fonction rationnelle, la question essentielle est toujours la même : quand est-ce que le dénominateur devient nul ? Les valeurs qui annulent le dénominateur sont interdites ; toutes les autres sont autorisées."
    }
  ]
}