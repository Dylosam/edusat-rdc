"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  PlayCircle,
  Sparkles,
  ChevronLeft,
  Trophy,
  Clock3,
  RotateCcw,
  GraduationCap,
  Search,
  ClipboardCheck,
  ListChecks,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  Target,
} from "lucide-react";
import Link from "next/link";

import LessonRenderer from "@/components/study/lesson-renderer";
import { readProgressStore } from "@/lib/progress/index";

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

import {
  getChapterById,
  getLessonsByChapter,
  getQuizzesByChapterId,
} from "@/lib/supabase/queries";

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

type LessonBlock = {
  id?: string;
  type: string;
  value?: string;
  title?: string;
  content?: string;
  prompt?: string;
  question?: string;
  choices?: string[];
  answerIndex?: number;
  explanation?: string;
  steps?: string[];
  segments?: Array<{ value?: string }>;
  [key: string]: any;
};

type LessonVM = {
  id: string;
  title: string;
  summary?: string;
  minutes: number;
  contentBlocks: LessonBlock[];
  order: number;
};

type ChapterVM = {
  id: string;
  title: string;
  summary?: string;
  estimatedMinutes: number;
  subjectId?: string;
  subjectSlug?: string;
  subjectTitle?: string;
  order: number;
};

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
        "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all duration-200",
        active
          ? "border-primary/20 bg-primary/10 text-primary shadow-sm"
          : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40 hover:text-foreground",
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

  const chapterId = useMemo(() => {
    const raw = params?.id;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw) && raw.length > 0) return raw[0];
    return "";
  }, [params]);

  const [quizzesRaw, setQuizzesRaw] = useState<any[]>([]);

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(EMPTY_STATE);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<MainSection>("overview");

  const [chapterRaw, setChapterRaw] = useState<any | null>(null);
  const [lessonsRaw, setLessonsRaw] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const steps = useMemo(
    () => (chapterId ? buildStudySteps(chapterId, lessonsRaw, quizzesRaw) : []),
    [chapterId, lessonsRaw, quizzesRaw]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !chapterId) return;
    setState(getChapterStudyState(chapterId, steps));
  }, [mounted, chapterId, steps]);

  useEffect(() => {
    let active = true;

    async function loadContent() {
      if (!chapterId) {
        if (active) {
          setContentLoading(false);
          setErrorMessage("ID de chapitre manquant.");
        }
        return;
      }

      try {
        setContentLoading(true);
        setErrorMessage("");

        const [chapterData, lessonsData, quizzesData] = await Promise.all([
          getChapterById(chapterId),
          getLessonsByChapter(chapterId),
          getQuizzesByChapterId(chapterId),
        ]);

        if (!active) return;

        if (!chapterData) {
          setErrorMessage("Chapitre introuvable dans la base.");
          setChapterRaw(null);
          setLessonsRaw([]);
          setQuizzesRaw([]);
          return;
        }

        setChapterRaw(chapterData);
        setLessonsRaw(Array.isArray(lessonsData) ? lessonsData : []);
        setQuizzesRaw(Array.isArray(quizzesData) ? quizzesData : []);
      } catch (error) {
        console.error("Erreur chargement chapitre:", error);

        if (!active) return;

        setErrorMessage(
          error instanceof Error ? error.message : "Erreur inconnue"
        );
      } finally {
        if (active) {
          setContentLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      active = false;
    };
  }, [chapterId]);

  const progress = mounted ? state.progressPercent : 0;
  const isCompleted = progress >= 100;

  const chapterQuiz = useMemo(() => {
    return quizzesRaw.length > 0 ? quizzesRaw[0] : null;
  }, [quizzesRaw]);

  const lastQuizPercent = useMemo(() => {
    if (!mounted || !chapterQuiz?.id) return null;

    const store = readProgressStore();
    const result = (store?.quizResults ?? {})[String(chapterQuiz.id)] as any;

    return typeof result?.percentage === "number"
      ? Math.round(result.percentage)
      : null;
  }, [mounted, chapterQuiz?.id]);

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

  const chapter: ChapterVM | null = useMemo(() => {
    if (!chapterRaw) return null;

    return {
      id: String(chapterRaw.id),
      title: String(chapterRaw.title ?? "Chapitre"),
      summary: String(chapterRaw.summary ?? chapterRaw.description ?? ""),
      estimatedMinutes: Number(
        chapterRaw.estimated_minutes ?? chapterRaw.estimatedMinutes ?? 0
      ),
      subjectId: chapterRaw.subject_id
        ? String(chapterRaw.subject_id)
        : undefined,
      subjectSlug: chapterRaw.subjects?.slug
        ? String(chapterRaw.subjects.slug)
        : undefined,
      subjectTitle: chapterRaw.subjects?.title
        ? String(chapterRaw.subjects.title)
        : undefined,
      order: Number(chapterRaw.order_index ?? chapterRaw.order ?? 1),
    };
  }, [chapterRaw]);

  useEffect(() => {
    if (!chapter) return;

    setState((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        title: chapter.title,
        estimatedMinutes:
          chapter.estimatedMinutes || prev.meta.estimatedMinutes,
        subjectLabel: chapter.subjectTitle ?? prev.meta.subjectLabel,
      },
    }));
  }, [chapter]);

  const lessonsWithData = useMemo(() => {
    const normalizedLessons: LessonVM[] = (lessonsRaw ?? []).map(
      (lesson: any, index: number) => ({
        id: String(lesson.id),
        title: String(lesson.title ?? `Leçon ${index + 1}`),
        summary: String(lesson.summary ?? ""),
        minutes: Number(lesson.minutes ?? 10),
        contentBlocks: Array.isArray(lesson.content_blocks)
          ? lesson.content_blocks.map((block: any) => ({
              id: String(block.id),
              type: String(block.type),
              ...(block.payload ?? {}),
            }))
          : Array.isArray(lesson.contentBlocks)
          ? lesson.contentBlocks
          : [],
        order: Number(lesson.order_index ?? lesson.order ?? index + 1),
      })
    );

    normalizedLessons.sort((a, b) => a.order - b.order);

    return normalizedLessons.map((lesson, index) => {
      const matchingStep =
        lessonSteps.find(
          (step) => String(step.id).replace("lesson:", "") === lesson.id
        ) ??
        ({
          id: `lesson:${lesson.id}`,
          kind: "lesson",
          title: lesson.title,
          subtitle: lesson.summary,
          minutes: lesson.minutes,
        } as any);

      return {
        step: matchingStep,
        lesson,
        index,
      };
    });
  }, [lessonsRaw, lessonSteps]);

  const filteredLessons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lessonsWithData;

    return lessonsWithData.filter(({ lesson, step }) => {
      const title = String(lesson?.title ?? step?.title ?? "").toLowerCase();
      const summary = String(
        lesson?.summary ?? step?.subtitle ?? ""
      ).toLowerCase();

      const blocksText = Array.isArray(lesson?.contentBlocks)
        ? lesson.contentBlocks
            .map((block: LessonBlock) => {
              if (typeof block?.value === "string") return block.value;
              if (typeof block?.content === "string") return block.content;
              if (typeof block?.prompt === "string") return block.prompt;
              if (typeof block?.question === "string") return block.question;
              if (typeof block?.title === "string") return block.title;
              if (typeof block?.explanation === "string")
                return block.explanation;
              if (Array.isArray(block?.choices)) return block.choices.join(" ");
              if (Array.isArray(block?.steps)) return block.steps.join(" ");
              if (Array.isArray(block?.segments)) {
                return block.segments
                  .map((seg) => String(seg?.value ?? ""))
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
    chapter?.estimatedMinutes ||
    lessonsWithData.reduce((acc, item) => {
      return acc + Number(item.lesson?.minutes ?? item.step?.minutes ?? 0);
    }, 0);

  function handleBack() {
    if (chapter?.subjectSlug) {
      router.push(`/subjects/${chapter.subjectSlug}`);
      return;
    }

    router.push("/subjects");
  }

  function handleMarkLessonDone(stepId: string) {
    if (!chapterId) return;
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
    if (!chapterId) return;
    resetChapterStudyState(chapterId);
    const next = getChapterStudyState(chapterId, steps);
    setState(next);
  }

  if (contentLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            {errorMessage}
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-full max-w-5xl text-center">
              <div className="flex justify-start">
  <button
    type="button"
    onClick={handleBack}
    className="group flex items-center justify-center rounded-full border border-border/50 bg-background/70 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-muted/50 hover:scale-105"
  >
    <ChevronLeft className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-0.5" />
  </button>
</div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                  {chapter.subjectTitle ?? state.meta.subjectLabel}
                </Badge>

                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {filteredLessons.length} leçon
                  {filteredLessons.length > 1 ? "s" : ""}
                </Badge>

                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {state.doneCount}/{steps.length} validées
                </Badge>
              </div>

              <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {chapter.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/40 px-3 py-1.5">
                  <Clock3 className="h-4 w-4" />
                  {totalEstimatedMinutes} min
                </span>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Chapitre complété
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-blue-600">
                    <PlayCircle className="h-4 w-4" />
                    En progression
                  </span>
                )}
              </div>

              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                {chapter.summary ||
                  "Tout le chapitre se lit maintenant dans une seule grande page. Tu avances comme dans un vrai parcours d’apprentissage, avec les exercices et les corrections détaillées au fil de la lecture."}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="gap-2 rounded-full border-border/60 bg-background/60"
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

                {chapterQuiz?.id ? (
                  <Button asChild className="gap-2 rounded-full">
                    <Link href={`/quiz/${String(chapterQuiz.id)}?fresh=1`}>
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
                  className="gap-2 rounded-full border-border/60 bg-background/60"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl">
        <aside
          className={[
            "shrink-0 border-r border-border/60 bg-background transition-all duration-300",
            sidebarOpen
              ? "w-[78px] md:w-[280px]"
              : "w-0 overflow-hidden border-r-0",
          ].join(" ")}
        >
          <div className="sidebar-scroll sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="px-3 py-5 md:px-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted/60">
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
                    className="rounded-full border-border/60 bg-background pl-10"
                  />
                </div>
              </div>

              <div className="mb-6 rounded-2xl border border-border/60 bg-card/40 p-4">
                <div className="mb-3 hidden md:block">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Progression
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {Math.round(progress)}%
                  </p>
                </div>

                <div className="mb-4">
                  <Progress value={progress} className="h-2.5" />
                </div>

                <div className="hidden grid-cols-2 gap-3 text-sm md:grid">
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

              <div className="space-y-2 border-t border-border/60 pt-4">
                <SectionAnchorButton
                  label="Aperçu"
                  icon={Target}
                  active={activeSection === "overview"}
                  compact={!sidebarOpen}
                  onClick={() => scrollToSection("overview")}
                />
                <SectionAnchorButton
                  label="Leçons"
                  icon={BookOpen}
                  active={activeSection === "lessons"}
                  compact={!sidebarOpen}
                  onClick={() => scrollToSection("lessons")}
                />
                <SectionAnchorButton
                  label="Résumé"
                  icon={ListChecks}
                  active={activeSection === "summary"}
                  compact={!sidebarOpen}
                  onClick={() => scrollToSection("summary")}
                />
                <SectionAnchorButton
                  label="Quiz final"
                  icon={ClipboardCheck}
                  active={activeSection === "quiz"}
                  compact={!sidebarOpen}
                  onClick={() => scrollToSection("quiz")}
                />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-background">
          <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-4xl">
              <section
                id="main-section-overview"
                className="scroll-mt-24 border-b border-border/60 pb-10"
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
              </section>

              <section
                id="main-section-lessons"
                className="scroll-mt-24 pt-10"
              >
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
                        className="scroll-mt-24 border-b border-border/60 pb-12"
                      >
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            Leçon {index + 1}
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            {lesson.minutes ?? step.minutes ?? 10} min
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/30 p-5 sm:flex-row sm:items-start sm:justify-between">
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
                          {Array.isArray(lesson.contentBlocks) &&
                          lesson.contentBlocks.length > 0 ? (
                            <LessonRenderer blocks={lesson.contentBlocks} />
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
                  <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
                    <p className="text-[15px] leading-8 text-muted-foreground sm:text-[16px]">
                      Aucune leçon ne correspond à la recherche actuelle.
                    </p>
                  </div>
                )}
              </section>

              <section
                id="main-section-summary"
                className="scroll-mt-24 border-t border-border/60 pt-14"
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

                <div className="mt-5 rounded-2xl border border-border/60 bg-card/30 p-5 sm:p-6">
                  {summaryStep ? (
                    <div className="space-y-4">
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
                    <p className="text-[15px] leading-8 text-muted-foreground sm:text-[16px]">
                      Le résumé sera ajouté ici.
                    </p>
                  )}
                </div>
              </section>

              <section
                id="main-section-quiz"
                className="scroll-mt-24 border-t border-border/60 pt-14"
              >
                <div className="mb-4 flex items-center gap-2 text-primary">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Quiz du chapitre
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                  Vérifie ta maîtrise
                </h3>

                <div className="mt-6 space-y-4">
                  {quizzesRaw.length > 0 ? (
                    quizzesRaw.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/30 p-4 transition-colors hover:bg-card/50"
                      >
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold">
                            {quiz.title}
                          </h3>
                          {quiz.description ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {quiz.description}
                            </p>
                          ) : null}
                        </div>

                        <Button asChild className="shrink-0 rounded-full">
                          <Link href={`/quiz/${quiz.id}`}>Lancer</Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
                      <p className="text-sm text-muted-foreground">Aucun quiz</p>
                    </div>
                  )}
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