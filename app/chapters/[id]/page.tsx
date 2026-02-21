"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  PenTool,
  Play,
} from "lucide-react";

import { DashboardNav } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  getChapterById,
  getCourseContent,
  getExercises,
  getQuiz,
} from "@/lib/mock-api/data";
import type { Chapter, CourseContent, Exercise, Quiz } from "@/lib/types";

import type { Lesson } from "@/lib/data/lessons";
import { getLessonsByChapter } from "@/lib/data/lessons";

import { isLessonCompleted } from "@/lib/progress";
import { LatexBlock } from "@/components/math/latex";
import { normalizeLatex } from "@/lib/utils/latex";

import { QuizHubCard } from "@/components/quiz/quiz-hub";

function getQuizTimeLabel(quiz: any) {
  // Supporte plusieurs noms possibles sans casser
  const sec =
    (typeof quiz?.timeLimitSec === "number" && quiz.timeLimitSec > 0
      ? quiz.timeLimitSec
      : undefined) ??
    (typeof quiz?.timeLimit === "number" && quiz.timeLimit > 0
      ? quiz.timeLimit
      : undefined);

  if (!sec) return "Illimité";
  const min = Math.round(sec / 60);
  return `${min} minutes`;
}

export default function ChapterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const chapterId = params?.id as string;
  const initialTab = searchParams?.get("tab") || "course";

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercisesState] = useState<Exercise[]>([]);
  const [quiz, setQuizState] = useState<Quiz | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Pour recalculer quand une leçon est cochée depuis /lessons
  const [progressTick, setProgressTick] = useState(0);

  useEffect(() => {
    const handler = () => setProgressTick((x) => x + 1);
    window.addEventListener("edustat_progress_updated", handler);
    return () =>
      window.removeEventListener("edustat_progress_updated", handler);
  }, []);

  // Leçons liées au chapitre (synchrone)
  const lessonsForChapter = useMemo(() => {
    return getLessonsByChapter(chapterId);
  }, [chapterId]);

  const lessonIds = useMemo(
    () => lessonsForChapter.map((l) => l.id),
    [lessonsForChapter]
  );

  // ✅ Progression calculée sans dépendre d'un type ChapterProgress
  const lessonProgress = useMemo(() => {
    const total = lessonIds.length;
    const completed = lessonIds.reduce((acc, id) => {
      return acc + (isLessonCompleted(chapterId, id) ? 1 : 0);
    }, 0);

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [chapterId, lessonIds, progressTick]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const chapterData = await getChapterById(chapterId);
      if (!chapterData) {
        router.push("/subjects");
        return;
      }

      setChapter(chapterData);

      // lessons (synchro)
      const lessonsData = getLessonsByChapter(chapterId);
      setLessons(lessonsData);

      const [course, exs, qz] = await Promise.all([
        getCourseContent(chapterId),
        getExercises(chapterId),
        chapterData.hasQuiz ? getQuiz(chapterId) : Promise.resolve(null),
      ]);

      setCourseContent(course);
      setExercisesState(exs);
      setQuizState(qz);

      setIsLoading(false);
    };

    loadData();
  }, [chapterId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!chapter) return null;

  const showCompletedBadge =
    chapter.status === "completed" || lessonProgress.percent === 100;

  // ✅ Important : on utilise l’ID réel du quiz si dispo (évite “Quiz introuvable” + clé storage incohérente)
  const quizIdForHub = quiz?.id ?? `quiz-${chapter.id}`;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
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

              {showCompletedBadge ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Chapitre terminé
                </div>
              ) : null}
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
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
                        <span>{lessonProgress.percent}%</span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${lessonProgress.percent}%` }}
                        />
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        {lessonProgress.completed}/{lessonProgress.total} leçons
                        terminées
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
                                {idx + 1}. {lesson.title}{" "}
                                {done ? (
                                  <span className="text-green-600">✓</span>
                                ) : null}
                              </p>

                              {lesson.summary ? (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {lesson.summary}
                                </p>
                              ) : null}

                              <div className="text-xs text-muted-foreground mt-2">
                                {lesson.durationMin
                                  ? `${lesson.durationMin} min`
                                  : "Durée : —"}
                                {lesson.isPremium ? " • Premium" : ""}
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

                {/* Contenu cours */}
                {courseContent ? (
                  <div className="max-w-4xl">
                    {courseContent.sections.map((section, index) => {
                      const latex = normalizeLatex(section.latex);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.08 }}
                        >
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle>{section.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="prose dark:prose-invert max-w-none">
                              <p className="leading-relaxed">{section.content}</p>

                              {latex ? (
                                <div className="mt-4 rounded-lg border bg-muted/40 p-4 overflow-x-auto">
                                  <LatexBlock value={latex} />
                                </div>
                              ) : null}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}

                    <div className="flex justify-end mt-8">
                      <Button onClick={() => setActiveTab("exercises")}>
                        Passer aux exercices
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </TabsContent>

            {/* =========================
                ONGLET EXERCICES
               ========================= */}
            <TabsContent value="exercises" className="space-y-6">
              <div className="max-w-4xl">
                {exercises.map((exercise, index) => {
                  const latex = normalizeLatex(exercise.latex);

                  return (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                    >
                      <Card className="mb-6">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Exercice {index + 1}</CardTitle>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                exercise.difficulty === "easy"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : exercise.difficulty === "medium"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {exercise.difficulty === "easy"
                                ? "Facile"
                                : exercise.difficulty === "medium"
                                ? "Moyen"
                                : "Difficile"}
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Question :</h4>
                            <p>{exercise.question}</p>

                            {latex ? (
                              <div className="mt-3 rounded-lg border border-border/50 bg-muted/30 p-4 overflow-x-auto">
                                <LatexBlock value={latex} />
                              </div>
                            ) : null}
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
                  );
                })}

                {chapter.hasQuiz ? (
                  <div className="flex justify-end mt-8">
                    <Button onClick={() => setActiveTab("quiz")}>
                      Passer au quiz
                    </Button>
                  </div>
                ) : null}
              </div>
            </TabsContent>

            {/* =========================
                ONGLET QUIZ
               ========================= */}
            {/* ONGLET QUIZ */}
<TabsContent value="quiz" className="space-y-6">
  <div className="max-w-4xl space-y-6">
    {quiz ? (
      <QuizHubCard
        chapterId={chapter.id}
        quizId={quiz.id}                 // ✅ vrai quizId
        title="Quiz du chapitre"
        passPercent={70}
        courseHref={`/chapters/${chapter.id}?tab=course`}
      />
    ) : (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Chargement du quiz...
        </CardContent>
      </Card>
    )}

    {/* Card de validation */}
    {quiz ? (
      <Card> ... </Card>
    ) : null}
  </div>
</TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}