'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Clock,
  FileText,
  PenTool,
  Brain,
  CheckCircle2,
  Play,
} from 'lucide-react';
import {
  getChapterById,
  getCourseContent,
  getExercises,
  getQuiz,
} from '@/lib/mock-api/data';
import { Chapter, CourseContent, Exercise, Quiz } from '@/lib/types';
import Link from 'next/link';

// Leçons
import { getLessonsByChapter } from '@/lib/data/lessons';

import { Latex } from '@/components/math/latex';


// Progression
import { getChapterProgress, isLessonCompleted } from '@/lib/progress';

export default function ChapterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const chapterId = params?.id as string;
  const initialTab = searchParams?.get('tab') || 'course';

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Pour recalculer quand une leçon est cochée depuis /lessons
  const [progressTick, setProgressTick] = useState(0);

  useEffect(() => {
    const handler = () => setProgressTick((x) => x + 1);
    window.addEventListener('edustat_progress_updated', handler);
    return () => window.removeEventListener('edustat_progress_updated', handler);
  }, []);

  // Leçons liées au chapitre (même id que /chapters/[id])
  const lessonsForChapter = useMemo(() => {
    return getLessonsByChapter(chapterId);
  }, [chapterId]);

  const lessonIds = useMemo(() => lessonsForChapter.map((l) => l.id), [lessonsForChapter]);

  const chapterProgress = useMemo(() => {
    return getChapterProgress(chapterId, lessonIds);
  }, [chapterId, lessonIds, progressTick]);

  useEffect(() => {
    const loadData = async () => {
      const chapterData = await getChapterById(chapterId);
      if (!chapterData) {
        router.push('/subjects');
        return;
      }
      setChapter(chapterData);

      const [content, exercisesData, quizData] = await Promise.all([
        getCourseContent(chapterId),
        getExercises(chapterId),
        chapterData.hasQuiz ? getQuiz(chapterId) : Promise.resolve(null),
      ]);

      setCourseContent(content);
      setExercises(exercisesData);
      setQuiz(quizData);
      setIsLoading(false);
    };

    loadData();
  }, [chapterId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 font-serif">
              {chapter.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Temps estimé: {chapter.estimatedTime} minutes
              </div>

              {(chapter.status === 'completed' || chapterProgress.percent === 100) && (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Chapitre terminé
                </div>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="course" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Cours
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center">
                <PenTool className="h-4 w-4 mr-2" />
                Exercices
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center" disabled={!chapter.hasQuiz}>
                <Brain className="h-4 w-4 mr-2" />
                Quiz
              </TabsTrigger>
            </TabsList>

            {/* =========================
                ONGLET COURS
               ========================= */}
            <TabsContent value="course" className="space-y-6">
              <div className="max-w-4xl space-y-6">
                {/* Leçons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Leçons</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Suis les leçons une par une, puis valide avec le quiz.
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Progression */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Progression du chapitre</span>
                        <span>{chapterProgress.percent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${chapterProgress.percent}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {chapterProgress.completed}/{chapterProgress.total} leçons terminées
                      </div>
                    </div>

                    {lessonsForChapter.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Aucune leçon n’est encore liée à ce chapitre.
                      </div>
                    ) : (
                      lessonsForChapter.map((lesson, idx) => {
                        const done = isLessonCompleted(chapterId, lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4"
                          >
                            <div>
                              <p className="font-semibold">
                                {idx + 1}. {lesson.title}{' '}
                                {done ? <span className="text-green-600">✓</span> : null}
                              </p>

                              {lesson.summary ? (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {lesson.summary}
                                </p>
                              ) : null}

                              <div className="text-xs text-muted-foreground mt-2">
                                {lesson.durationMin ? `${lesson.durationMin} min` : 'Durée : —'}
                                {lesson.isPremium ? ' • Premium' : ''}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Link href={`/lessons/${lesson.id}`}>
                                <Button>
                                  <Play className="mr-2 h-4 w-4" />
                                  Ouvrir
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>

                {/* Contenu cours existant */}
                {courseContent && (
                  <div className="max-w-4xl">
                    {courseContent.sections.map((section, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="mb-6">
                          <CardHeader>
                            <CardTitle>{section.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="leading-relaxed">{section.content}</p>
                            {section.latex && (
  <div className="mt-4 rounded-lg border bg-muted/40 p-4 overflow-x-auto">
    <Latex latex={section.latex} />
  </div>
)}

                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    <div className="flex justify-end mt-8">
                      <Button onClick={() => setActiveTab('exercises')}>
                        Passer aux exercices
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* =========================
                ONGLET EXERCICES
               ========================= */}
            <TabsContent value="exercises" className="space-y-6">
              <div className="max-w-4xl">
                {exercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="mb-6">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Exercice {index + 1}</CardTitle>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              exercise.difficulty === 'easy'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : exercise.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {exercise.difficulty === 'easy'
                              ? 'Facile'
                              : exercise.difficulty === 'medium'
                              ? 'Moyen'
                              : 'Difficile'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Question :</h4>
                          <p>{exercise.question}</p>
                          {exercise.latex && (
  <div className="mt-2 rounded-lg border bg-muted/40 p-4 overflow-x-auto">
    <Latex latex={exercise.latex} />
  </div>
)}

                        </div>
                        <details className="border-t pt-4">
                          <summary className="cursor-pointer font-semibold hover:text-primary">
                            Voir la solution
                          </summary>
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="font-mono">{exercise.solution}</p>
                          </div>
                        </details>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {chapter.hasQuiz && (
                  <div className="flex justify-end mt-8">
                    <Button onClick={() => setActiveTab('quiz')}>Passer au quiz</Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* =========================
                ONGLET QUIZ
               ========================= */}
            <TabsContent value="quiz">
              {quiz && (
                <div className="max-w-4xl">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                      <p className="text-muted-foreground">
                        {quiz.questions.length} questions • Temps limite:{' '}
                        {quiz.timeLimit ? `${quiz.timeLimit / 60} minutes` : 'Illimité'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-6">
                        Testez vos connaissances et validez votre maîtrise de ce chapitre.
                      </p>
                      <Link href={`/quiz/${quiz.id}`}>
                        <Button size="lg" className="w-full sm:w-auto">
                          <Brain className="mr-2 h-5 w-5" />
                          Commencer le quiz
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
