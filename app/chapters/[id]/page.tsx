'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, FileText, PenTool, Brain, CheckCircle2 } from 'lucide-react';
import {
  getChapterById,
  getCourseContent,
  getExercises,
  getQuiz,
} from '@/lib/mock-api/data';
import { Chapter, CourseContent, Exercise, Quiz } from '@/lib/types';
import Link from 'next/link';

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

  if (!chapter) {
    return null;
  }

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
              {chapter.status === 'completed' && (
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
              <TabsTrigger
                value="quiz"
                className="flex items-center"
                disabled={!chapter.hasQuiz}
              >
                <Brain className="h-4 w-4 mr-2" />
                Quiz
              </TabsTrigger>
            </TabsList>

            <TabsContent value="course" className="space-y-6">
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
                            <div className="bg-muted p-4 rounded-lg mt-4 text-center font-mono text-lg">
                              {section.latex}
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
            </TabsContent>

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
                            <div className="bg-muted p-4 rounded-lg mt-2 text-center font-mono text-lg">
                              {exercise.latex}
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
                    <Button onClick={() => setActiveTab('quiz')}>
                      Passer au quiz
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

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
