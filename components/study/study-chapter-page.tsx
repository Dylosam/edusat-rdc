"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  Trophy,
  RotateCcw,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import LessonRenderer from "@/components/study/lesson-renderer";
import { readProgressStore } from "@/lib/progress/index";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

type StudyChapterPageProps = {
  chapterId: string;
};

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

type RawTextSegment = {
  text?: unknown;
  color?: unknown;
};

type RawStep = {
  text?: unknown;
  formula?: unknown;
  explanation?: unknown;
};

type RawChoice = {
  text?: unknown;
  correct?: unknown;
};

type RawPayload = {
  id?: unknown;
  title?: unknown;

  text?: unknown;
  content?: unknown;
  value?: unknown;
  segments?: unknown;

  formula?: unknown;
  explanation?: unknown;
  question?: unknown;
  choices?: unknown;
  assertions?: unknown;
  answers?: unknown;
  correctIndex?: unknown;
  correctChoiceIndex?: unknown;
  steps?: unknown;

  [key: string]: unknown;
};

type RawLessonBlock = {
  id?: unknown;
  type?: unknown;
  order_index?: unknown;
  payload?: RawPayload | null;
};

type RendererTextSegment = {
  text: string;
  color?: string;
};

type RendererLessonBlock =
  | {
      type: "text";
      title?: string;
      text?: string;
      segments?: RendererTextSegment[];
    }
  | {
      type: "katex";
      title?: string;
      formula: string;
      explanation?: string;
    }
  | {
      type: "example";
      title?: string;
      text?: string;
      steps?: {
        text?: string;
        formula?: string;
        explanation?: string;
      }[];
    }
  | {
      type: "tip";
      title?: string;
      text: string;
    }
  | {
      type: "exercise";
      title?: string;
      question: string;
      choices: {
        text: string;
        correct: boolean;
      }[];
      explanation?: string;
    };

type RawLesson = {
  id?: unknown;
  title?: unknown;
  minutes?: unknown;
  order_index?: unknown;
  order?: unknown;
  content_blocks?: RawLessonBlock[] | null;
};

type RawQuiz = {
  id?: unknown;
  title?: unknown;
};

type RawChapter = {
  id?: unknown;
  title?: unknown;
  estimated_minutes?: unknown;
  estimatedMinutes?: unknown;
  order_index?: unknown;
  order?: unknown;
  subject_id?: unknown;
  subjects?: {
    slug?: unknown;
    title?: unknown;
  } | null;
};

type LessonVM = {
  id: string;
  title: string;
  minutes: number;
  contentBlocks: RendererLessonBlock[];
  order: number;
};

type ChapterVM = {
  id: string;
  title: string;
  estimatedMinutes: number;
  subjectId?: string;
  subjectSlug?: string;
  subjectTitle?: string;
  order: number;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSegments(value: unknown): RendererTextSegment[] {
  if (!Array.isArray(value)) return [];

  const result: RendererTextSegment[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const raw = item as RawTextSegment;
    const text = asString(raw.text).trim();
    const color = asString(raw.color).trim() || undefined;

    if (!text) continue;

    result.push({
      text,
      color,
    });
  }

  return result;
}

function normalizeSteps(
  value: unknown
): { text?: string; formula?: string; explanation?: string }[] {
  if (!Array.isArray(value)) return [];

  const result: { text?: string; formula?: string; explanation?: string }[] = [];

  for (const step of value) {
    if (!step || typeof step !== "object") continue;

    const raw = step as RawStep;

    const text = asString(raw.text) || undefined;
    const formula = asString(raw.formula) || undefined;
    const explanation = asString(raw.explanation) || undefined;

    if (!text && !formula && !explanation) continue;

    result.push({
      text,
      formula,
      explanation,
    });
  }

  return result;
}

function normalizeChoicesFromObjects(
  value: unknown
): { text: string; correct: boolean }[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((choice) => {
      if (!choice || typeof choice !== "object") return null;

      const raw = choice as RawChoice;
      const text = asString(raw.text).trim();
      const correct = raw.correct === true;

      if (!text) return null;

      return { text, correct };
    })
    .filter(
      (choice): choice is { text: string; correct: boolean } => choice !== null
    );
}

function normalizeChoicesFromLegacy(
  answersValue: unknown,
  correctIndexValue: unknown
): { text: string; correct: boolean }[] {
  if (!Array.isArray(answersValue)) return [];

  const correctIndex = asNumberOrNull(correctIndexValue);

  return answersValue
    .map((answer, index) => {
      if (typeof answer !== "string" || !answer.trim()) return null;

      return {
        text: answer,
        correct: index === correctIndex,
      };
    })
    .filter(
      (choice): choice is { text: string; correct: boolean } => choice !== null
    );
}

function transformToRendererBlocks(
  blocks: RawLessonBlock[] | null | undefined
): RendererLessonBlock[] {
  if (!Array.isArray(blocks)) return [];

  const sortedBlocks = [...blocks].sort(
    (a, b) => asNumber(a.order_index, 0) - asNumber(b.order_index, 0)
  );

  const result: RendererLessonBlock[] = [];

  for (const block of sortedBlocks) {
    const payload: RawPayload = isObject(block.payload) ? block.payload : {};
    const type = asString(block.type).toLowerCase();

    if (type === "text") {
      const text =
        asString(payload.text) ||
        asString(payload.content) ||
        asString(payload.value);

      const segments = normalizeSegments(payload.segments);

      if (text.trim() || segments.length > 0) {
        result.push({
          type: "text",
          title: asString(payload.title) || undefined,
          text: text || undefined,
          segments: segments.length > 0 ? segments : undefined,
        });
      }
      continue;
    }

    if (type === "katex") {
      const formula = asString(payload.formula);

      if (formula.trim()) {
        result.push({
          type: "katex",
          title: asString(payload.title) || undefined,
          formula,
          explanation: asString(payload.explanation) || undefined,
        });
      }
      continue;
    }

    if (type === "example") {
      const text = asString(payload.text) || undefined;
      const steps = normalizeSteps(payload.steps);

      if (text || steps.length > 0) {
        result.push({
          type: "example",
          title: asString(payload.title) || undefined,
          text,
          steps,
        });
      }
      continue;
    }

    if (type === "tip") {
      const text = asString(payload.text);

      if (text.trim()) {
        result.push({
          type: "tip",
          title: asString(payload.title) || undefined,
          text,
        });
      }
      continue;
    }

    if (type === "exercise") {
      const question = asString(payload.question);

      let choices = normalizeChoicesFromObjects(payload.choices);

      if (choices.length === 0) {
        choices = normalizeChoicesFromObjects(payload.assertions);
      }

      if (choices.length === 0) {
        choices = normalizeChoicesFromLegacy(
          payload.answers,
          payload.correctIndex ?? payload.correctChoiceIndex
        );
      }

      if (question.trim()) {
        result.push({
          type: "exercise",
          title: asString(payload.title) || undefined,
          question,
          choices,
          explanation: asString(payload.explanation) || undefined,
        });
      }
    }
  }

  return result;
}

export default function StudyChapterPage({
  chapterId,
}: StudyChapterPageProps) {
  const router = useRouter();

  const [quizzesRaw, setQuizzesRaw] = useState<RawQuiz[]>([]);
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(EMPTY_STATE);

  const [chapterRaw, setChapterRaw] = useState<RawChapter | null>(null);
  const [lessonsRaw, setLessonsRaw] = useState<RawLesson[]>([]);
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

        setChapterRaw(chapterData as RawChapter);
        setLessonsRaw(Array.isArray(lessonsData) ? (lessonsData as RawLesson[]) : []);
        setQuizzesRaw(Array.isArray(quizzesData) ? (quizzesData as RawQuiz[]) : []);
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
    const result = (store?.quizResults ?? {})[String(chapterQuiz.id)] as
      | { percentage?: unknown }
      | undefined;

    return typeof result?.percentage === "number"
      ? Math.round(result.percentage)
      : null;
  }, [mounted, chapterQuiz?.id]);

  const lessonSteps = useMemo(
    () => steps.filter((step) => String(step.kind) === "lesson"),
    [steps]
  );

  const quizStep = useMemo(
    () => steps.find((step) => String(step.kind) === "quiz") ?? null,
    [steps]
  );

  const chapter: ChapterVM | null = useMemo(() => {
    if (!chapterRaw) return null;

    return {
      id: asString(chapterRaw.id),
      title: asString(chapterRaw.title) || "Chapitre",
      estimatedMinutes:
        asNumber(chapterRaw.estimated_minutes, 0) ||
        asNumber(chapterRaw.estimatedMinutes, 0),
      subjectId: chapterRaw.subject_id
        ? asString(chapterRaw.subject_id)
        : undefined,
      subjectSlug: chapterRaw.subjects?.slug
        ? asString(chapterRaw.subjects.slug)
        : undefined,
      subjectTitle: chapterRaw.subjects?.title
        ? asString(chapterRaw.subjects.title)
        : undefined,
      order: asNumber(chapterRaw.order_index, 1) || asNumber(chapterRaw.order, 1),
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
      (lesson, index) => ({
        id: asString(lesson.id),
        title: asString(lesson.title) || `Leçon ${index + 1}`,
        minutes: asNumber(lesson.minutes, 10),
        contentBlocks: transformToRendererBlocks(lesson.content_blocks),
        order:
          asNumber(lesson.order_index, index + 1) ||
          asNumber(lesson.order, index + 1),
      })
    );

    normalizedLessons.sort((a, b) => a.order - b.order);

    return normalizedLessons.map((lesson) => {
      const matchingStep =
        lessonSteps.find(
          (step) => String(step.id).replace("lesson:", "") === lesson.id
        ) ??
        ({
          id: `lesson:${lesson.id}`,
          kind: "lesson",
          title: lesson.title,
          minutes: lesson.minutes,
        } as {
          id: string;
          kind: string;
          title: string;
          minutes: number;
        });

      return { step: matchingStep, lesson };
    });
  }, [lessonsRaw, lessonSteps]);

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

  function scrollToLesson(lessonId: string) {
    const target = document.getElementById(`lesson-${lessonId}`);
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  function resetStudy() {
    if (!chapterId) return;
    resetChapterStudyState(chapterId);
    setState(getChapterStudyState(chapterId, steps));
  }

  if (contentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="mb-4 text-xl font-medium text-red-500">
            {errorMessage}
          </p>
          <Button
            onClick={handleBack}
            variant="outline"
            className="rounded-full"
          >
            Retour aux matières
          </Button>
        </div>
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <Progress
          value={progress}
          className="h-1 w-full rounded-none bg-transparent"
        />
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour
          </button>

          <div className="hidden text-sm font-semibold tracking-wide text-foreground md:block">
            {chapter.title}
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <span className={isCompleted ? "text-emerald-500" : "text-primary"}>
              {Math.round(progress)}% complété
            </span>
            <button
              onClick={resetStudy}
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="Réinitialiser"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:py-24">
        <header className="mb-24 text-center">
          <div className="mb-6 flex items-center justify-center gap-2 text-primary">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-[0.2em]">
              {chapter.subjectTitle ?? state.meta.subjectLabel}
            </span>
          </div>

          <h1 className="font-serif text-4xl font-bold leading-[1.15] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {chapter.title}
          </h1>

          <p className="mt-6 text-base leading-8 text-muted-foreground md:text-lg">
            Concentrez-vous sur l essentiel. Lisez attentivement, pratiquez.
            les blocs interactifs, et validez vos acquis à votre rythme.
          </p>
        </header>

        <div className="space-y-32">
          {lessonsWithData.length > 0 ? (
            lessonsWithData.map(({ lesson, step }, index) => {
              const isDone = state.doneMap[step.id];

              return (
                <article
                  key={lesson.id}
                  id={`lesson-${lesson.id}`}
                  className="group scroll-mt-32"
                >
                  <header className="mb-12">
                    <div className="mb-4 flex items-center gap-3 text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">
                        Leçon {index + 1}
                      </span>
                      <span>—</span>
                      <span className="text-sm">
                        {lesson.minutes ?? step.minutes ?? 10} min de lecture
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                      {lesson.title}
                    </h2>
                  </header>

                  <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:leading-relaxed prose-a:text-primary">
                    {Array.isArray(lesson.contentBlocks) &&
                    lesson.contentBlocks.length > 0 ? (
                      <LessonRenderer blocks={lesson.contentBlocks} />
                    ) : (
                      <p className="italic text-muted-foreground">
                        Contenu de la leçon en cours de préparation.
                      </p>
                    )}
                  </div>

                  <div className="mt-16 flex flex-col items-center justify-center border-t border-border/40 pt-10">
                    <Button
                      size="lg"
                      variant={isDone ? "outline" : "default"}
                      onClick={() => handleMarkLessonDone(step.id)}
                      className={`gap-3 rounded-full px-8 py-6 text-base font-medium transition-all ${
                        isDone
                          ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-50/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                          : ""
                      }`}
                    >
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          isDone ? "text-emerald-500" : ""
                        }`}
                      />
                      {isDone ? "Leçon assimilée" : "J'ai compris cette leçon"}
                    </Button>

                    {index < lessonsWithData.length - 1 && (
                      <button
                        onClick={() =>
                          scrollToLesson(lessonsWithData[index + 1].lesson.id)
                        }
                        className="mt-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        Passer à la leçon suivante
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground">
              Aucune leçon disponible pour le moment.
            </div>
          )}
        </div>

        {quizzesRaw.length > 0 && (
          <section
            id="quiz-section"
            className="mt-32 border-t-2 border-primary/20 pt-20"
          >
            <div className="mb-4 flex items-center gap-2 text-primary">
              <Trophy className="h-6 w-6" />
              <span className="text-sm font-bold uppercase tracking-[0.2em]">
                Validation Finale
              </span>
            </div>

            <h3 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Vérifiez votre maîtrise
            </h3>

            <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
              Maintenant que vous avez parcouru les concepts, passez au quiz
              final pour valider définitivement ce chapitre. {quizStep?.body}
            </p>

            <div className="mt-12 space-y-4">
              {quizzesRaw.map((quiz) => (
                <Link
                  key={String(quiz.id)}
                  href={`/quiz/${String(quiz.id)}?fresh=1`}
                  className="group flex flex-col justify-between gap-6 rounded-3xl border border-border/40 p-8 transition-all hover:border-primary hover:bg-primary/5 sm:flex-row sm:items-center"
                >
                  <div>
                    <h4 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                      {asString(quiz.title)}
                    </h4>

                    {lastQuizPercent !== null && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                        Dernier score : {lastQuizPercent}%
                      </span>
                    )}
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}