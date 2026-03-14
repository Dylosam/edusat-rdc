"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  PlayCircle,
  Sparkles,
  ChevronLeft,
  Trophy,
  Clock3,
  RotateCcw,
  GraduationCap,
  BarChart3,
  Search,
  ClipboardCheck,
  ListChecks,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getChapterById } from "@/lib/mock-data/chapters";
import LessonRenderer from "@/components/study/lesson-renderer";
import { readProgressStore } from "@/lib/progress/index";
import { findQuizByChapterId } from "@/lib/study/quiz-link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { buildStudySteps } from "@/lib/study/build-study-steps";
import {
  getChapterStudyState,
  markStepDone,
  resetChapterStudyState,
} from "@/lib/study/progress";

import { getLessonById } from "@/lib/data/lessons";

const EMPTY_STATE = {
  progressPercent: 0,
  doneCount: 0,
  doneMap: {} as Record<string, boolean>,
  meta: {
    title: "Chapitre",
    estimatedMinutes: 0,
    subjectLabel: "Matière",
  },
};

type MainSection = "overview" | "lessons" | "summary" | "quiz";

function SectionAnchorButton({
  label,
  icon: Icon,
  active,
  compact,
  onClick,
}: {
  label: string;
  icon: any;
  active: boolean;
  compact: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-left transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        compact ? "justify-center px-2" : "",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!compact ? (
        <span className="truncate text-sm font-medium">{label}</span>
      ) : null}
    </button>
  );
}

export default function StudyChapterPage() {
  const params = useParams();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const chapterId = params.id as string;

  const steps = useMemo(() => buildStudySteps(chapterId), [chapterId]);

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(EMPTY_STATE);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<MainSection>("overview");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setState(getChapterStudyState(chapterId, steps));
  }, [mounted, chapterId, steps]);

  const progress = mounted ? state.progressPercent : 0;
  const isCompleted = progress >= 100;

  const quiz = useMemo(() => findQuizByChapterId(chapterId), [chapterId]);

  const lastQuizPercent = useMemo(() => {
    if (!mounted || !quiz?.id) return null;

    const store = readProgressStore();
    const result = (store.quizResults ?? {})[String(quiz.id)] as any;

    return typeof result?.percentage === "number"
      ? Math.round(result.percentage)
      : null;
  }, [mounted, quiz?.id]);

  const lessonSteps = useMemo(
    () => steps.filter((step) => String(step.kind) === "lesson"),
    [steps]
  );

  const summaryStep = useMemo(
    () => steps.find((step) => String(step.kind) === "summary") ?? null,
    [steps]
  );

  const quizStep = useMemo(
    () => steps.find((step) => String(step.kind) === "quiz") ?? null,
    [steps]
  );
  const chapter = useMemo(() => getChapterById(chapterId), [chapterId]);

  const lessonsWithData = useMemo(() => {
    return lessonSteps
      .map((step) => {
        const lessonId = String(step.id).replace("lesson:", "");
        const lesson = getLessonById(lessonId);

        return lesson
          ? {
              step,
              lesson,
            }
          : null;
      })
      .filter(Boolean) as Array<{ step: any; lesson: any }>;
  }, [lessonSteps]);

  const filteredLessons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lessonsWithData;

    return lessonsWithData.filter(({ lesson, step }) => {
      const title = String(lesson?.title ?? step?.title ?? "").toLowerCase();
      const summary = String(
        lesson?.summary ?? step?.subtitle ?? ""
      ).toLowerCase();

      const blocksText = Array.isArray(lesson?.content)
        ? lesson.content
            .map((block: any) => {
              if (typeof block?.value === "string") return block.value;
              if (typeof block?.content === "string") return block.content;
              if (typeof block?.prompt === "string") return block.prompt;
              if (Array.isArray(block?.steps)) return block.steps.join(" ");
              if (Array.isArray(block?.segments)) {
                return block.segments
                  .map((seg: any) => String(seg?.value ?? ""))
                  .join(" ");
              }
              return "";
            })
            .join(" ")
            .toLowerCase()
        : "";

      return (
        title.includes(q) ||
        summary.includes(q) ||
        blocksText.includes(q)
      );
    });
  }, [lessonsWithData, search]);

  const totalEstimatedMinutes =
    state.meta.estimatedMinutes ||
    lessonsWithData.reduce((acc, item) => {
      return acc + Number(item.lesson?.durationMin ?? item.step?.minutes ?? 0);
    }, 0);

  function handleBack() {
  if (chapter?.subjectSlug) {
    router.push(`/subjects/${chapter.subjectSlug}`);
    return;
  }

  router.push("/subjects");
}



  function handleMarkLessonDone(stepId: string) {
    markStepDone(chapterId, stepId);
    const next = getChapterStudyState(chapterId, steps);
    setState(next);
  }

  function scrollToSection(section: MainSection) {
    setActiveSection(section);
    const target = document.getElementById(`main-section-${section}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function resetStudy() {
    resetChapterStudyState(chapterId);
    const next = getChapterStudyState(chapterId, steps);
    setState(next);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="border-b border-border/70 bg-background/95">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Retour
              </button>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                  {state.meta.subjectLabel}
                </Badge>

                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {filteredLessons.length} leçon
                  {filteredLessons.length > 1 ? "s" : ""}
                </Badge>

                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {state.doneCount}/{steps.length} validées
                </Badge>
              </div>

              <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {state.meta.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {totalEstimatedMinutes} min
                </span>

                <span className="hidden sm:inline text-muted-foreground/50">
                  •
                </span>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Chapitre complété
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-blue-600">
                    <PlayCircle className="h-4 w-4" />
                    En progression
                  </span>
                )}
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                Tout le chapitre se lit maintenant dans une seule grande page.
                Tu avances comme dans un vrai parcours d’apprentissage, avec les
                exercices et les corrections détaillées au fil de la lecture.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="gap-2 rounded-full"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
                {sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
              </Button>

              <Button
                variant="secondary"
                onClick={() => scrollToSection("lessons")}
                className="gap-2 rounded-full"
              >
                <Sparkles className="h-4 w-4" />
                Commencer
              </Button>

              {quiz?.id ? (
                <Button asChild className="gap-2 rounded-full">
                  <Link prefetch href={`/quiz/${String(quiz.id)}?fresh=1`}>
                    <Trophy className="h-4 w-4" />
                    Quiz final
                    {lastQuizPercent !== null ? (
                      <span className="ml-1 opacity-80">
                        ({lastQuizPercent}%)
                      </span>
                    ) : null}
                  </Link>
                </Button>
              ) : null}

              <Button
                variant="outline"
                onClick={resetStudy}
                className="gap-2 rounded-full"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl">
        <aside
          className={[
            "shrink-0 border-r border-border/70 bg-background transition-all duration-300",
            sidebarOpen
              ? "w-[78px] md:w-[280px]"
              : "w-0 overflow-hidden border-r-0",
          ].join(" ")}
        >
          <div className="sidebar-scroll sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="px-3 py-5 md:px-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
                  <PanelLeft className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold">Menu du chapitre</p>
                  <p className="text-xs text-muted-foreground">
                    Navigation rapide
                  </p>
                </div>
              </div>

              <div className="mb-6 hidden md:block">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher dans le chapitre..."
                    className="rounded-full border-border/70 bg-background pl-10"
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-3 hidden md:block">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Progression
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {Math.round(progress)}%
                  </p>
                </div>

                <div className="mb-4">
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="hidden md:grid grid-cols-2 gap-3 text-sm">
                  <div className="border-b border-border/60 pb-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Fait
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {state.doneCount}
                    </div>
                  </div>
                  <div className="border-b border-border/60 pb-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Restant
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {Math.max(steps.length - state.doneCount, 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-border/70 pt-4">
                <SectionAnchorButton
                  label="Aperçu"
                  icon={Target}
                  active={activeSection === "overview"}
                  compact={!sidebarOpen || false}
                  onClick={() => scrollToSection("overview")}
                />
                <SectionAnchorButton
                  label="Leçons"
                  icon={BookOpen}
                  active={activeSection === "lessons"}
                  compact={!sidebarOpen || false}
                  onClick={() => scrollToSection("lessons")}
                />
                <SectionAnchorButton
                  label="Résumé"
                  icon={ListChecks}
                  active={activeSection === "summary"}
                  compact={!sidebarOpen || false}
                  onClick={() => scrollToSection("summary")}
                />
                <SectionAnchorButton
                  label="Quiz final"
                  icon={ClipboardCheck}
                  active={activeSection === "quiz"}
                  compact={!sidebarOpen || false}
                  onClick={() => scrollToSection("quiz")}
                />
              </div>

              <div className="mt-6 hidden border-t border-border/70 pt-4 md:block">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Vue actuelle
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Les leçons ne sont plus découpées dans le menu. Tout le
                  contenu est désormais affiché dans la page principale.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-background">
          <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-4xl">
              <section
                id="main-section-overview"
                className="scroll-mt-24 border-b border-border/70 pb-10"
              >
                <div className="mb-4 flex items-center gap-2 text-primary">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Aperçu du chapitre
                  </span>
                </div>

                <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  Comprendre avant de pratiquer
                </h2>

                <p className="mt-4 text-[15px] leading-8 text-foreground/90 sm:text-[16px] lg:text-[17px]">
                  Dans cette page, toutes les leçons restent visibles dans un
                  flux continu. Tu lis, tu comprends, puis tu t’exerces juste
                  après. L’objectif est d’avoir un parcours naturel, plus
                  pédagogique, plus clair, et plus proche d’une vraie expérience
                  d’apprentissage progressive.
                </p>

                <div className="mt-6 space-y-3 text-[15px] leading-8 text-muted-foreground sm:text-[16px]">
                  <p>• Tu lis les notions dans l’ordre.</p>
                  <p>• Les exercices apparaissent au fur et à mesure.</p>
                  <p>• Les résolutions détaillées sont visibles étape par étape.</p>
                  <p>• Le quiz final mesure ta maîtrise réelle.</p>
                </div>
              </section>

              <section className="mt-10 border-b border-border/70 pb-10">
  <div className="mb-4 flex items-center gap-2 text-primary">
    <BarChart3 className="h-4 w-4" />
    <span className="text-sm font-semibold uppercase tracking-[0.18em]">
      Ta progression
    </span>
  </div>

  <div className="grid gap-6 sm:grid-cols-3">
    
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs uppercase text-muted-foreground">Progression</p>
      <p className="mt-2 text-2xl font-bold">{Math.round(progress)}%</p>
      <Progress value={progress} className="mt-3 h-2" />
    </div>

    <div className="rounded-xl border border-border p-4">
      <p className="text-xs uppercase text-muted-foreground">Leçons terminées</p>
      <p className="mt-2 text-2xl font-bold">
        {state.doneCount}/{steps.length}
      </p>
    </div>

    <div className="rounded-xl border border-border p-4">
      <p className="text-xs uppercase text-muted-foreground">Dernier quiz</p>
      <p className="mt-2 text-2xl font-bold">
        {lastQuizPercent !== null ? `${lastQuizPercent}%` : "—"}
      </p>
    </div>

  </div>

  <div className="mt-6">
    <Button
      className="rounded-full gap-2"
      onClick={() => scrollToSection("lessons")}
    >
      <PlayCircle className="h-4 w-4" />
      Reprendre la leçon
    </Button>
  </div>
</section>


              <section id="main-section-lessons" className="scroll-mt-24 pt-10">
                <div className="mb-6 flex items-center gap-2 text-primary">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Parcours du chapitre
                  </span>
                </div>

                {filteredLessons.length > 0 ? (
                  <div className="space-y-16">
                    {filteredLessons.map(({ lesson, step }, index) => (
                      <article
                        key={lesson.id}
                        id={`lesson-${lesson.id}`}
                        className="scroll-mt-24 border-b border-border/70 pb-12"
                      >
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            Leçon {index + 1}
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            {lesson.durationMin ?? step.minutes ?? 10} min
                          </Badge>
                          {state.doneMap[step.id] ? (
                            <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                              Terminée
                            </Badge>
                          ) : null}
                        </div>

                        <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                              {lesson.title}
                            </h3>
                            {lesson.summary ? (
                              <p className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground sm:text-base">
                                {lesson.summary}
                              </p>
                            ) : null}
                          </div>

                          <div className="shrink-0">
                            <Button
                              onClick={() => handleMarkLessonDone(step.id)}
                              className="gap-2 rounded-full"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {state.doneMap[step.id]
                                ? "Leçon validée"
                                : "J’ai compris"}
                            </Button>
                          </div>
                        </div>

                        <div className="pt-8">
                          {Array.isArray(lesson.content) &&
                          lesson.content.length > 0 ? (
                            <LessonRenderer blocks={lesson.content} />
                          ) : (
                            <p className="text-[15px] leading-8 text-muted-foreground sm:text-[16px]">
                              Contenu de la leçon en cours de préparation.
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="border-b border-border/70 pb-8">
                    <p className="text-[15px] leading-8 text-muted-foreground sm:text-[16px]">
                      Aucune leçon ne correspond à la recherche actuelle.
                    </p>
                  </div>
                )}
              </section>

              <section
                id="main-section-summary"
                className="scroll-mt-24 border-t border-border/70 pt-14"
              >
                <div className="mb-4 flex items-center gap-2 text-primary">
                  <ListChecks className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Résumé du chapitre
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                  Ce qu’il faut retenir
                </h3>

                {summaryStep ? (
                  <div className="mt-5 space-y-4">
                    {summaryStep.subtitle ? (
                      <p className="text-[15px] leading-8 text-muted-foreground sm:text-[16px]">
                        {summaryStep.subtitle}
                      </p>
                    ) : null}

                    <p className="text-[15px] leading-8 text-foreground/90 sm:text-[16px]">
                      {summaryStep.body ||
                        "On récapitule ici les idées essentielles, les règles à retenir et les erreurs fréquentes à éviter."}
                    </p>
                  </div>
                ) : (
                  <p className="mt-5 text-[15px] leading-8 text-muted-foreground sm:text-[16px]">
                    Le résumé sera ajouté ici.
                  </p>
                )}
              </section>

              <section
                id="main-section-quiz"
                className="scroll-mt-24 border-t border-border/70 pt-14"
              >
                <div className="mb-4 flex items-center gap-2 text-primary">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Quiz final
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                  Vérifie ta maîtrise
                </h3>

                <p className="mt-4 text-[15px] leading-8 text-muted-foreground sm:text-[16px]">
                  Quand tu as terminé la lecture et les exercices, passe au quiz
                  final pour mesurer ton niveau réel sur l’ensemble du chapitre.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {quiz?.id ? (
                    <Button asChild className="gap-2 rounded-full">
                      <Link prefetch href={`/quiz/${String(quiz.id)}?fresh=1`}>
                        <Trophy className="h-4 w-4" />
                        Lancer le quiz final
                      </Link>
                    </Button>
                  ) : null}

                  {lastQuizPercent !== null ? (
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                      Dernier score : {lastQuizPercent}%
                    </span>
                  ) : null}
                </div>

                {quizStep?.body ? (
                  <p className="mt-5 text-[15px] leading-8 text-foreground/90 sm:text-[16px]">
                    {quizStep.body}
                  </p>
                ) : null}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}