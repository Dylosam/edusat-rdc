<<<<<<< HEAD
// lib/mock-api/data.ts
import type { Subject } from "@/lib/types";

/**
 * Mock subjects pour le dashboard / subjects list.
 * Assure-toi que les champs matchent ton type Subject.
 */
const SUBJECTS: Subject[] = [
  {
    id: "sub-math",
    slug: "mathematiques",
    name: "Mathématiques",
    description: "Algèbre, fonctions, géométrie, trigonométrie…",
    icon: "Sigma", // doit exister dans lucide-react (sinon ça retombe sur BookOpen)
    color: "from-indigo-500 to-purple-500",
    chaptersCount: 12,
    progress: 18,
  },
  {
    id: "sub-phys",
    slug: "physique",
    name: "Physique",
    description: "Mécanique, électricité, optique, énergie…",
    icon: "Zap",
    color: "from-amber-500 to-orange-500",
    chaptersCount: 10,
    progress: 7,
  },
  {
    id: "sub-chim",
    slug: "chimie",
    name: "Chimie",
    description: "Réactions, atomes, solutions, stœchiométrie…",
    icon: "FlaskConical",
    color: "from-emerald-500 to-teal-500",
    chaptersCount: 9,
    progress: 0,
  },
  {
    id: "sub-bio",
    slug: "biologie",
    name: "Biologie",
    description: "Cellules, génétique, physiologie…",
    icon: "Dna",
    color: "from-sky-500 to-cyan-500",
    chaptersCount: 8,
    progress: 0,
  },
];

/**
 * API mock: retourne la liste des matières.
 * Le dashboard l'appelle via: const subjectsData = await getSubjects();
 */
export async function getSubjects(): Promise<Subject[]> {
  // Simule un petit délai réseau (facultatif)
  // await new Promise((r) => setTimeout(r, 150));
  return SUBJECTS;
}

/**
 * Optionnel : si tu as besoin d'une matière par slug.
 */
export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const found = SUBJECTS.find((s) => s.slug === slug);
  return found ?? null;
}
=======
import {
  Subject,
  Chapter,
  CourseContent,
  Exercise,
  Quiz,
  QuizResult,
  Progress,
  SchoolPeriod,
} from "../types";
import { mockSubjects, mockChapters } from "../mock-data/subjects";

import {
  getChapterStatus,
  setChapterStatus,
  saveQuizResult,
  readProgressStore,
} from "@/lib/progress";
import { isQuizPassed, scorePercent } from "@/lib/progress/quiz";

export const getSubjects = async (): Promise<Subject[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockSubjects;
};

export const getSubjectBySlug = async (slug: string): Promise<Subject | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockSubjects.find((s) => s.slug === slug) || null;
};

function applyChapterStatus(chapter: Chapter): Chapter {
  const stored = getChapterStatus(chapter.subjectId, chapter.id);
  if (!stored) return chapter;
  return { ...chapter, status: stored };
}

export const getChaptersBySubject = async (subjectId: string): Promise<Chapter[]> => {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const list = (mockChapters[subjectId] || []).map(applyChapterStatus);
  return list;
};

export const getChapterById = async (chapterId: string): Promise<Chapter | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  for (const chapters of Object.values(mockChapters)) {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (chapter) return applyChapterStatus(chapter);
  }

  return null;
};

export const getCourseContent = async (chapterId: string): Promise<CourseContent> => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  return {
    id: chapterId,
    chapterId,
    content: "Contenu du cours",
    sections: [
      {
        title: "Introduction",
        content:
          "Dans ce chapitre, nous allons explorer les concepts fondamentaux nécessaires pour comprendre ce sujet en profondeur.",
      },
      {
        title: "Définitions",
        content: "Voici les définitions clés que vous devez maîtriser.",
        latex: "$$f(x) = ax^2 + bx + c$$",
      },
      {
        title: "Exemples",
        content: "Étudions quelques exemples concrets pour bien comprendre.",
      },
      {
        title: "Applications",
        content:
          "Ces concepts trouvent de nombreuses applications dans la vie quotidienne et dans d'autres domaines scientifiques.",
      },
    ],
  };
};

export const getExercises = async (chapterId: string): Promise<Exercise[]> => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  return [
    {
      id: "ex1",
      chapterId,
      question: "Résolvez l'équation suivante :",
      solution: "x = 5",
      difficulty: "easy",
      latex: "$$2x + 5 = 15$$",
    },
    {
      id: "ex2",
      chapterId,
      question: "Calculez la dérivée de la fonction :",
      solution: "f'(x) = 2x + 3",
      difficulty: "medium",
      latex: "$$f(x) = x^2 + 3x + 1$$",
    },
    {
      id: "ex3",
      chapterId,
      question: "Déterminez l'intégrale suivante :",
      solution: "(1/3)x³ + C",
      difficulty: "hard",
      latex: "$$\\int x^2 \\, dx$$",
    },
  ];
};

export const getQuiz = async (chapterId: string): Promise<Quiz> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    id: `quiz-${chapterId}`,
    chapterId,
    title: "Quiz de validation",
    timeLimit: 600,
    questions: [
      {
        id: "q1",
        type: "mcq",
        question: "Quelle est la dérivée de x² ?",
        latex: "$$\\frac{d}{dx}(x^2)=?$$",
        options: ["x", "2x", "x²", "2x²"],
        correctAnswer: "2x",
        explanation: "La dérivée de x² est 2x selon la règle de dérivation des puissances.",
      },
      {
        id: "q2",
        type: "numeric",
        question: "Résolvez : 3x + 7 = 22. Quelle est la valeur de x ?",
        latex: "$$3x+7=22$$",
        correctAnswer: 5,
        explanation: "3x = 22 - 7 = 15, donc x = 15/3 = 5",
      },
      {
        id: "q3",
        type: "mcq",
        question: "Laquelle de ces fonctions est croissante sur ℝ ?",
        options: ["f(x) = -x", "f(x) = x²", "f(x) = 2x + 1", "f(x) = -x²"],
        correctAnswer: "f(x) = 2x + 1",
        explanation: "Une fonction affine avec un coefficient positif est toujours croissante.",
      },
      {
        id: "q4",
        type: "numeric",
        question: "Calculez : 5 × 8 + 12 ÷ 4",
        correctAnswer: 43,
        explanation: "5 × 8 = 40, puis 12 ÷ 4 = 3, donc 40 + 3 = 43",
      },
    ],
  };
};

export const submitQuiz = async (
  quizId: string,
  answers: Record<string, string | number>
): Promise<QuizResult> => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const chapterId = quizId.replace("quiz-", "");
  const quiz = await getQuiz(chapterId);

  let correct = 0;
  quiz.questions.forEach((q) => {
    if (String(answers[q.id]) === String(q.correctAnswer)) correct++;
  });

  const result: QuizResult = {
    quizId,
    score: correct,
    totalQuestions: quiz.questions.length,
    answers,
    completedAt: new Date().toISOString(),
  };

  // ✅ 1) Save quiz result
  saveQuizResult(result);

  // ✅ 2) Mark chapter completed if passed (>=60%)
  const chapter = await getChapterById(chapterId);
  if (chapter) {
    if (isQuizPassed(result, 60)) {
      setChapterStatus(chapter.subjectId, chapter.id, "completed");
    } else {
      // si pas réussi, au minimum "in-progress"
      const current = getChapterStatus(chapter.subjectId, chapter.id);
      if (!current || current === "not-started") {
        setChapterStatus(chapter.subjectId, chapter.id, "in-progress");
      }
    }
  }

  return result;
};

export const getProgress = async (subjectId: string): Promise<Progress> => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const subject = mockSubjects.find((s) => s.id === subjectId);
  const chapters = mockChapters[subjectId] || [];
  const totalChapters = subject?.chaptersCount || chapters.length || 0;

  // chaptersCompleted
  const chaptersCompleted = chapters.filter((c) => {
    const status = getChapterStatus(subjectId, c.id) ?? c.status;
    return status === "completed";
  }).length;

  // quizzes passed + averageScore (filter only quizzes that belong to chapters of this subject)
  const store = readProgressStore();

  const chapterIds = new Set(chapters.map((c) => c.id));
  const quizResults = Object.values(store.quizResults || {}).filter((r) => {
    // quizId format: quiz-{chapterId}
    const chId = r.quizId.replace("quiz-", "");
    return chapterIds.has(chId);
  });

  const passed = quizResults.filter((r) => isQuizPassed(r, 60)).length;

  const avgScore =
    quizResults.length === 0
      ? 0
      : quizResults.reduce((acc, r) => acc + scorePercent(r), 0) / quizResults.length;

  return {
    subjectId,
    chaptersCompleted,
    totalChapters,
    quizzesPassed: passed,
    averageScore: Math.round(avgScore),
    timeSpent: store.timeSpentBySubject?.[subjectId] || 0,
  };
};

export const getSchoolPeriods = async (): Promise<SchoolPeriod[]> => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  return [
    {
      id: "1",
      name: "Premier Trimestre",
      startDate: "2024-09-15",
      endDate: "2024-12-20",
      type: "term",
    },
    {
      id: "2",
      name: "Examens Trimestriels",
      startDate: "2024-12-10",
      endDate: "2024-12-20",
      type: "exam",
    },
    {
      id: "3",
      name: "Vacances de Noël",
      startDate: "2024-12-21",
      endDate: "2025-01-05",
      type: "holiday",
    },
    {
      id: "4",
      name: "Deuxième Trimestre",
      startDate: "2025-01-06",
      endDate: "2025-03-28",
      type: "term",
    },
    {
      id: "5",
      name: "Examens de Pâques",
      startDate: "2025-03-20",
      endDate: "2025-03-28",
      type: "exam",
    },
  ];
};

export const updateChapterStatus = async (
  chapterId: string,
  status: Chapter["status"]
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const chapter = await getChapterById(chapterId);
  if (!chapter) return;

  setChapterStatus(chapter.subjectId, chapter.id, status);
};
>>>>>>> 5ccb2c3 (feat: add lessons module, math components and quiz refactor)
