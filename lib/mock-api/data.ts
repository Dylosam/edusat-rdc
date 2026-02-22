import {
  Subject,
  Chapter,
  CourseContent,
  Exercise,
  Quiz,
  QuizResult,
  Progress,
  SchoolPeriod,
} from '../types';
import { mockSubjects, mockChapters } from '../mock-data/subjects';

export const getSubjects = async (): Promise<Subject[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockSubjects;
};

export const getSubjectBySlug = async (slug: string): Promise<Subject | null> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockSubjects.find(s => s.slug === slug) || null;
};

export const getChaptersBySubject = async (subjectId: string): Promise<Chapter[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockChapters[subjectId] || [];
};

export const getChapterById = async (chapterId: string): Promise<Chapter | null> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  for (const chapters of Object.values(mockChapters)) {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) return chapter;
  }

  return null;
};

export const getCourseContent = async (chapterId: string): Promise<CourseContent> => {
  await new Promise(resolve => setTimeout(resolve, 700));

  return {
    id: chapterId,
    chapterId,
    content: 'Contenu du cours',
    sections: [
      {
        title: 'Introduction',
        content:
          'Dans ce chapitre, nous allons explorer les concepts fondamentaux nécessaires pour comprendre ce sujet en profondeur.',
      },
      {
        title: 'Définitions',
        content: 'Voici les définitions clés que vous devez maîtriser.',
        latex: '$$f(x) = ax^2 + bx + c$$',
      },
      {
        title: 'Exemples',
        content: 'Étudions quelques exemples concrets pour bien comprendre.',
      },
      {
        title: 'Applications',
        content:
          'Ces concepts trouvent de nombreuses applications dans la vie quotidienne et dans d\'autres domaines scientifiques.',
      },
    ],
  };
};

export const getExercises = async (chapterId: string): Promise<Exercise[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  return [
    {
      id: 'ex1',
      chapterId,
      question: 'Résolvez l\'équation suivante :',
      solution: 'x = 5',
      difficulty: 'easy',
      latex: '$$2x + 5 = 15$$',
    },
    {
      id: 'ex2',
      chapterId,
      question: 'Calculez la dérivée de la fonction :',
      solution: 'f\'(x) = 2x + 3',
      difficulty: 'medium',
      latex: '$$f(x) = x^2 + 3x + 1$$',
    },
    {
      id: 'ex3',
      chapterId,
      question: 'Déterminez l\'intégrale suivante :',
      solution: '(1/3)x³ + C',
      difficulty: 'hard',
      latex: '$$\\int x^2 dx$$',
    },
  ];
};

export const getQuiz = async (chapterId: string): Promise<Quiz> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    id: `quiz-${chapterId}`,
    chapterId,
    title: 'Quiz de validation',
    timeLimit: 600,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'Quelle est la dérivée de x² ?',
        options: ['x', '2x', 'x²', '2x²'],
        correctAnswer: '2x',
        explanation: 'La dérivée de x² est 2x selon la règle de dérivation des puissances.',
      },
      {
        id: 'q2',
        type: 'numeric',
        question: 'Résolvez : 3x + 7 = 22. Quelle est la valeur de x ?',
        correctAnswer: 5,
        explanation: '3x = 22 - 7 = 15, donc x = 15/3 = 5',
      },
      {
        id: 'q3',
        type: 'mcq',
        question: 'Laquelle de ces fonctions est croissante sur ℝ ?',
        options: ['f(x) = -x', 'f(x) = x²', 'f(x) = 2x + 1', 'f(x) = -x²'],
        correctAnswer: 'f(x) = 2x + 1',
        explanation: 'Une fonction affine avec un coefficient positif est toujours croissante.',
      },
      {
        id: 'q4',
        type: 'numeric',
        question: 'Calculez : 5 × 8 + 12 ÷ 4',
        correctAnswer: 43,
        explanation: '5 × 8 = 40, puis 12 ÷ 4 = 3, donc 40 + 3 = 43',
      },
    ],
  };
};

export const submitQuiz = async (
  quizId: string,
  answers: Record<string, string | number>
): Promise<QuizResult> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const quiz = await getQuiz(quizId.replace('quiz-', ''));

  let correct = 0;
  quiz.questions.forEach(q => {
    if (String(answers[q.id]) === String(q.correctAnswer)) {
      correct++;
    }
  });

  return {
    quizId,
    score: correct,
    totalQuestions: quiz.questions.length,
    answers,
    completedAt: new Date().toISOString(),
  };
};

export const getProgress = async (subjectId: string): Promise<Progress> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  const subject = mockSubjects.find(s => s.id === subjectId);

  return {
    subjectId,
    chaptersCompleted: Math.floor((subject?.progress || 0) * (subject?.chaptersCount || 0) / 100),
    totalChapters: subject?.chaptersCount || 0,
    quizzesPassed: Math.floor(Math.random() * 10),
    averageScore: 70 + Math.random() * 20,
    timeSpent: Math.floor(Math.random() * 3000),
  };
};

export const getSchoolPeriods = async (): Promise<SchoolPeriod[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  return [
    {
      id: '1',
      name: 'Premier Trimestre',
      startDate: '2024-09-15',
      endDate: '2024-12-20',
      type: 'term',
    },
    {
      id: '2',
      name: 'Examens Trimestriels',
      startDate: '2024-12-10',
      endDate: '2024-12-20',
      type: 'exam',
    },
    {
      id: '3',
      name: 'Vacances de Noël',
      startDate: '2024-12-21',
      endDate: '2025-01-05',
      type: 'holiday',
    },
    {
      id: '4',
      name: 'Deuxième Trimestre',
      startDate: '2025-01-06',
      endDate: '2025-03-28',
      type: 'term',
    },
    {
      id: '5',
      name: 'Examens de Pâques',
      startDate: '2025-03-20',
      endDate: '2025-03-28',
      type: 'exam',
    },
  ];
};

export const updateChapterStatus = async (
  chapterId: string,
  status: Chapter['status']
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
};
