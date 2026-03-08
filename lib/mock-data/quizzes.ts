export type QuizQuestion = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
};

export type Quiz = {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
};

export const quizzes: Quiz[] = [
  {
    id: 'quiz-polynomes',
    chapterId: 'chapter-polynomes',
    title: 'Quiz - Polynômes',
    description:
      'Vérifie ta compréhension de la définition, du degré et des opérations sur les polynômes.',
    questions: [
      {
        id: 'q1',
        question: 'Laquelle des expressions suivantes est un polynôme ?',
        choices: ['1/x + 2', '√x + 1', '3x² - 5x + 1', 'x⁻¹ + 4'],
        answerIndex: 2,
        explanation:
          'Un polynôme possède uniquement des exposants entiers naturels et aucune variable au dénominateur.',
      },
      {
        id: 'q2',
        question: 'Quel est le degré du polynôme 4x^5 - 2x^3 + x - 9 ?',
        choices: ['3', '4', '5', '9'],
        answerIndex: 2,
        explanation:
          'Le degré d’un polynôme est le plus grand exposant de x ayant un coefficient non nul.',
      },
      {
        id: 'q3',
        question: 'Quelle est la somme de 2x² + 3x et x² - x + 4 ?',
        choices: ['3x² + 2x + 4', '2x² + 2x + 4', 'x² + 2x + 4', '3x² - 4x'],
        answerIndex: 0,
        explanation:
          'On additionne les termes semblables : 2x² + x² = 3x² et 3x - x = 2x.',
      },
      {
        id: 'q4',
        question: 'Le résultat de (x + 2)(x + 3) est :',
        choices: ['x² + 5', 'x² + 5x + 6', 'x² + 6x + 5', '2x² + 3x + 6'],
        answerIndex: 1,
        explanation:
          'On développe puis on réduit : x² + 3x + 2x + 6 = x² + 5x + 6.',
      },
      {
        id: 'q5',
        question: 'Quel est le degré du polynôme constant 7 ?',
        choices: ['0', '1', '7', 'ABR'],
        answerIndex: 0,
        explanation: 'Un polynôme constant non nul est de degré 0.',
      },
    ],
  },
];

export function getQuizById(id: string) {
  return quizzes.find((quiz) => quiz.id === id);
}

export function getQuizByChapterId(chapterId: string) {
  return quizzes.find((quiz) => quiz.chapterId === chapterId);
}