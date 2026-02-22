export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  level: string;
  subscription: 'free' | 'premium';
  joinDate: string;
  totalTimeStudied: number;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  chaptersCount: number;
  progress: number;
  icon: string;
  color: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  status: 'not-started' | 'in-progress' | 'completed';
  estimatedTime: number;
  hasQuiz: boolean;
  hasCourse: boolean;
  hasExercises: boolean;
}

export interface CourseContent {
  id: string;
  chapterId: string;
  content: string;
  sections: CourseSection[];
}

export interface CourseSection {
  title: string;
  content: string;
  latex?: string;
}

export interface Exercise {
  id: string;
  chapterId: string;
  question: string;
  solution: string;
  difficulty: 'easy' | 'medium' | 'hard';
  latex?: string;
}

export interface Quiz {
  id: string;
  chapterId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'numeric' | 'text';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  latex?: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string | number>;
  completedAt: string;
}

export interface SchoolPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: 'term' | 'exam' | 'holiday';
}

export interface Progress {
  subjectId: string;
  chaptersCompleted: number;
  totalChapters: number;
  quizzesPassed: number;
  averageScore: number;
  timeSpent: number;
}
