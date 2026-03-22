export const lesson_mm59_domain = {
  "id": "lesson-mm5-9-intro",
  "chapterId": "mm5-9",
  "title": "Introduction au domaine de définition",
  "minutes": 18,
  "order": 1,
  "summary": "Cette leçon t’apprend à comprendre ce qu’est le domaine de définition d’une fonction, pourquoi il est important, comment repérer les valeurs interdites, et comment éviter les erreurs les plus fréquentes grâce à une méthode simple et progressive.",
  "content": [
    {
      "type": "text",
      "value": "Petite question : si x = 2 dans f(x)=1/(x-2), que se passe-t-il ? Essaie de calculer mentalement avant de lire la suite."
    },
    {
      "type": "text",
      "value": "Avant de calculer une fonction, il faut d’abord se poser une question très importante : « Est-ce que j’ai le droit de remplacer x par n’importe quel nombre ? » La réponse est non. Certaines valeurs de x peuvent rendre le calcul impossible. Le domaine de définition sert justement à repérer toutes les valeurs que l’on a le droit d’utiliser."
    },
    {
      "type": "text",
      "value": "Imagine une machine. Tu mets un nombre à l’entrée, et la machine te donne un résultat à la sortie. Mais attention : cette machine n’accepte pas toujours tous les nombres. Certains nombres bloquent la machine. Le domaine de définition, c’est la liste de tous les nombres que la machine accepte."
    },
    {
      "type": "tip",
      "value": "Image mentale utile : une fonction est comme une porte avec des règles d’entrée. Le domaine de définition te dit qui peut entrer."
    },
    {
      "type": "text",
      "value": "Définition claire : le domaine de définition d’une fonction est l’ensemble de toutes les valeurs de x pour lesquelles l’expression de la fonction a un sens, c’est-à-dire pour lesquelles on peut faire le calcul sans erreur mathématique."
    },
    {
      "type": "text",
      "value": "Autrement dit, pour trouver le domaine de définition, on cherche les valeurs autorisées de x, puis on enlève les valeurs interdites."
    },
    {
      "type": "example",
      "title": "Exemple simple",
      "value": "Considérons la fonction f(x) = 2x + 3. Ici, on peut remplacer x par n’importe quel nombre : 0, 5, -2, 100, 1/3… À chaque fois, le calcul est possible. Donc le domaine de définition de cette fonction est l’ensemble de tous les nombres réels."
    },
    {
      "type": "formula",
      "value": "f(x)=2x+3"
    },
    {
      "type": "formula",
      "value": "D_f=\\mathbb{R}"
    },
    {
      "type": "text",
      "value": "Pourquoi ici tous les nombres sont autorisés ? Parce qu’il n’y a ni division par une expression contenant x, ni racine carrée dangereuse, ni autre opération qui pourrait poser problème. On calcule simplement une multiplication puis une addition."
    },
    {
      "type": "example",
      "title": "Exemple expliqué étape par étape",
      "value": "Considérons maintenant la fonction g(x) = 1 / (x - 4). Cherchons son domaine de définition. Étape 1 : on repère ce qui peut poser problème. Ici, c’est une division. Étape 2 : on rappelle une règle essentielle : on n’a jamais le droit de diviser par 0. Étape 3 : on cherche quand le dénominateur vaut 0. On résout x - 4 = 0, donc x = 4. Étape 4 : on conclut que la valeur 4 est interdite. Tous les autres nombres sont autorisés."
    },
    {
      "type": "formula",
      "value": "g(x)=\\frac{1}{x-4}"
    },
    {
      "type": "formula",
      "value": "x-4\\neq 0"
    },
    {
      "type": "formula",
      "value": "x\\neq 4"
    },
    {
      "type": "formula",
      "value": "D_g=\\mathbb{R}\\setminus\\{4\\}"
    },
    {
      "type": "text",
      "value": "Cette étape est très importante : on ne cherche pas d’abord ce qui marche, on cherche surtout ce qui ne marche pas. Ensuite, on enlève seulement les valeurs interdites."
    },
    {
      "type": "tip",
      "value": "Réflexe expert : dès que tu vois une fraction, vérifie immédiatement le dénominateur."
    },
    {
      "type": "text",
      "value": "Pourquoi le domaine de définition est-il si important ? Parce qu’une fonction n’existe pas partout. Si tu utilises une valeur interdite, tu fais un calcul impossible. Et si le calcul de départ est impossible, tout le reste devient faux. Le domaine de définition est donc la première vérification à faire avant de commencer une étude de fonction."
    },
    {
      "type": "tip",
      "value": "Réflexe à adopter : avant tout calcul, demande-toi toujours « Quelles sont les valeurs interdites ? »"
    },
    {
      "type": "text",
      "value": "En classe, beaucoup d’élèves veulent aller trop vite. Ils remplacent directement x par des nombres sans vérifier si c’est autorisé. C’est une erreur fréquente. En analyse, la rigueur commence par le domaine."
    },
    {
      "type": "text",
      "value": "Voici maintenant les pièges fréquents à éviter."
    },
    {
      "type": "example",
      "title": "Piège fréquent 1",
      "value": "Oublier qu’on ne peut pas diviser par 0. Par exemple, dans h(x) = 5 / (x + 2), certains élèves écrivent directement D_h = R. C’est faux. Il faut exclure x = -2."
    },
    {
      "type": "formula",
      "value": "h(x)=\\frac{5}{x+2}"
    },
    {
      "type": "formula",
      "value": "x+2\\neq 0 \\Rightarrow x\\neq -2"
    },
    {
      "type": "example",
      "title": "Piège fréquent 2",
      "value": "Chercher les valeurs autorisées une par une, au lieu de chercher les valeurs interdites. Cela fait perdre du temps et augmente le risque d’erreur."
    },
    {
      "type": "example",
      "title": "Piège fréquent 3",
      "value": "Confondre « valeur interdite » et « résultat interdit ». Le domaine concerne les valeurs de x, pas les résultats."
    },
    {
      "type": "text",
      "value": "Méthode générale pour trouver un domaine de définition : Étape 1 : écrire l’expression. Étape 2 : repérer les opérations dangereuses. Étape 3 : poser les conditions. Étape 4 : résoudre. Étape 5 : conclure proprement."
    },
    {
      "type": "example",
      "title": "Méthode appliquée",
      "value": "Soit p(x) = (x + 1) / (2x - 6). On impose 2x - 6 ≠ 0, donc x ≠ 3. Conclusion : tous les réels sauf 3."
    },
    {
      "type": "formula",
      "value": "p(x)=\\frac{x+1}{2x-6}"
    },
    {
      "type": "formula",
      "value": "x\\neq 3"
    },
    {
      "type": "formula",
      "value": "D_p=\\mathbb{R}\\setminus\\{3\\}"
    },
    {
      "type": "exercise",
      "title": "Exercice 1 — Facile",
      "prompt": "Soit f(x) = \\frac{3}{x-1}. Quel est son domaine ?",
      "choices": [
        "D_f = \\mathbb{R}",
        "D_f = \\mathbb{R}\\setminus\\{1\\}",
        "D_f = \\{1\\}",
        "D_f = \\mathbb{R}\\setminus\\{-1\\}"
      ],
      "correctChoiceIndex": 1,
      "hint": "Regarde le dénominateur.",
      "solutionSteps": [
        "Le dénominateur est x - 1.",
        "On impose x - 1 ≠ 0.",
        "Donc x ≠ 1.",
        "Conclusion : D_f = ℝ \\ {1}."
      ]
    },
    {
      "type": "exercise",
      "title": "Exercice 2 — Moyen",
      "prompt": "Soit g(x) = \\frac{2x+5}{x+3}. Quel est son domaine ?",
      "choices": [
        "D_g = \\mathbb{R}\\setminus\\{3\\}",
        "D_g = \\mathbb{R}\\setminus\\{-3\\}",
        "D_g = \\mathbb{R}",
        "D_g = \\{-3\\}"
      ],
      "correctChoiceIndex": 1,
      "hint": "Commence par x+3.",
      "solutionSteps": [
        "Le dénominateur est x + 3.",
        "On impose x + 3 ≠ 0.",
        "Donc x ≠ -3.",
        "Conclusion : D_g = ℝ \\ {-3}."
      ]
    }
  ]
}