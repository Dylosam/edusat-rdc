import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  PenTool,
  Brain,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import {
  getSubjectBySlug,
  getChaptersBySubject,
  getQuizzesByChapterId,
} from "@/lib/supabase/queries";
import { normalizeSubject } from "@/lib/subjects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: {
    slug: string;
  };
};

type ChapterVM = {
  id: string;
  order: number;
  title: string;
  description?: string;
  estimatedMinutes: number;
  hasExercises: boolean;
  hasQuiz: boolean;
};

const PASS_PERCENT = 70;
type Strength = "weak" | "ok" | "strong" | "unknown";

function strengthFromPercent(percent: number | null): Strength {
  if (percent === null || Number.isNaN(percent)) return "unknown";
  if (percent < 50) return "weak";
  if (percent < PASS_PERCENT) return "ok";
  return "strong";
}

function strengthBadge(strength: Strength) {
  switch (strength) {
    case "weak":
      return (
        <Badge className="border-0 bg-red-500/15 text-red-400 hover:bg-red-500/20">
          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
          Faible
        </Badge>
      );
    case "ok":
      return (
        <Badge className="border-0 bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/20">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          OK
        </Badge>
      );
    case "strong":
      return (
        <Badge className="border-0 bg-green-500/15 text-green-400 hover:bg-green-500/20">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Fort
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="border-0 bg-muted/60 text-muted-foreground">
          Pas encore évalué
        </Badge>
      );
  }
}

function statusIconFromStrength(strength: Strength) {
  switch (strength) {
    case "strong":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "ok":
      return <Brain className="h-5 w-5 text-blue-500" />;
    case "weak":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const subjectRaw = await getSubjectBySlug(params.slug);

  if (!subjectRaw) {
    notFound();
  }

  const normalizedSubject = normalizeSubject(subjectRaw);

  const chaptersRaw = await getChaptersBySubject(subjectRaw.id);

  const quizEntries = await Promise.all(
    (chaptersRaw ?? []).map(async (chapter: any) => {
      const quizzes = await getQuizzesByChapterId(String(chapter.id));
      return [String(chapter.id), Array.isArray(quizzes) ? quizzes : []] as const;
    })
  );

  const quizMap = new Map<string, any[]>(quizEntries);

  const chapters: ChapterVM[] = (chaptersRaw ?? []).map(
    (chapter: any, index: number) => ({
      id: String(chapter.id),
      order: Number(chapter.order_index ?? chapter.order ?? index + 1),
      title: String(chapter.title ?? `Chapitre ${index + 1}`),
      description: String(chapter.summary ?? chapter.description ?? ""),
      estimatedMinutes: Number(
        chapter.estimated_minutes ?? chapter.estimatedMinutes ?? 10
      ),
      hasExercises: Boolean(
        chapter.has_exercises ?? chapter.hasExercises ?? false
      ),
      hasQuiz: (quizMap.get(String(chapter.id))?.length ?? 0) > 0,
    })
  );

  const enriched = chapters.map((chapter) => {
    const quizzes = quizMap.get(chapter.id) ?? [];
    const percent = null;
    const strength = strengthFromPercent(percent);

    return {
      chapter,
      quizzes,
      percent,
      strength,
    };
  });

  const stats = {
    total: chapters.length || normalizedSubject.chaptersCount,
    evaluated: 0,
    weak: enriched.filter((item) => item.strength === "weak").length,
    ok: enriched.filter((item) => item.strength === "ok").length,
    strong: enriched.filter((item) => item.strength === "strong").length,
    average: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Button
            asChild
            variant="ghost"
            className="mb-6 rounded-xl border border-border/60 bg-background/60 hover:bg-muted/60"
          >
            <Link href="/subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>

          <div className="mb-8 rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
            <h1 className="mb-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              {normalizedSubject.name}
            </h1>

            {normalizedSubject.description ? (
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {normalizedSubject.description}
              </p>
            ) : null}
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Chapitres</p>
                    <p className="mt-1 text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Évalués</p>
                    <p className="mt-1 text-2xl font-bold">{stats.evaluated}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Faible: {stats.weak} • OK: {stats.ok} • Fort: {stats.strong}
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Moyenne quiz</p>
                    <p className="mt-1 text-2xl font-bold">{stats.average}%</p>
                  </div>
                  <div className="w-24">
                    <Progress value={stats.average} className="h-2.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {enriched.map(({ chapter, quizzes, percent, strength }) => (
              <Card
                key={chapter.id}
                className="border-border/60 transition-all duration-200 hover:border-primary/20 hover:shadow-md"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-1 items-start space-x-4">
                      <div className="mt-0.5 rounded-xl bg-muted/60 p-2.5">
                        {statusIconFromStrength(strength)}
                      </div>

                      <div className="flex-1">
                        <CardTitle className="mb-2 text-lg leading-snug">
                          Chapitre {chapter.order} : {chapter.title}
                        </CardTitle>

                        {chapter.description ? (
                          <p className="mb-3 text-sm leading-6 text-muted-foreground">
                            {chapter.description}
                          </p>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <div className="inline-flex items-center rounded-full bg-muted/50 px-2.5 py-1">
                            <Clock className="mr-1.5 h-4 w-4" />
                            {chapter.estimatedMinutes} min
                          </div>

                          {strengthBadge(strength)}

                          {percent !== null ? (
                            <Badge variant="outline" className="rounded-full">
                              Score: {percent}%
                            </Badge>
                          ) : null}

                          {quizzes.length > 0 ? (
                            <Badge variant="outline" className="rounded-full">
                              {quizzes.length} quiz
                              {quizzes.length > 1 ? "s" : ""}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="default" size="sm" className="rounded-xl">
                      <Link href={`/chapters/${chapter.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Lire le cours
                      </Link>
                    </Button>

                    {chapter.hasExercises ? (
                      <Button asChild variant="outline" size="sm" className="rounded-xl">
                        <Link href={`/chapters/${chapter.id}?tab=exercises`}>
                          <PenTool className="mr-2 h-4 w-4" />
                          Exercices
                        </Link>
                      </Button>
                    ) : null}

                    {chapter.hasQuiz && quizzes.length > 0
                      ? quizzes.map((quiz: any) => (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            key={String(quiz.id)}
                          >
                            <Link href={`/quiz/${String(quiz.id)}?fresh=1`}>
                              <Brain className="mr-2 h-4 w-4" />
                              {quizzes.length === 1
                                ? "Quiz"
                                : `Quiz${quiz.title ? ` : ${quiz.title}` : ""}`}
                            </Link>
                          </Button>
                        ))
                      : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {enriched.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Aucun chapitre trouvé</h3>
              <p className="text-muted-foreground">
                Cette matière n’a pas encore de chapitres publiés.
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}