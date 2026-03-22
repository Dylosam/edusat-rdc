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
  getQuizByChapterId,
} from "@/lib/supabase/queries";

type PageProps = {
  params: {
    slug: string;
  };
};

type SubjectVM = {
  id: string;
  title: string;
  description?: string;
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
        <Badge className="bg-red-600">
          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
          Faible
        </Badge>
      );
    case "ok":
      return (
        <Badge className="bg-yellow-500 text-black">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          OK
        </Badge>
      );
    case "strong":
      return (
        <Badge className="bg-green-600">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Fort
        </Badge>
      );
    default:
      return <Badge variant="secondary">Pas encore évalué</Badge>;
  }
}

function statusIconFromStrength(strength: Strength) {
  switch (strength) {
    case "strong":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "ok":
      return <Brain className="h-5 w-5 text-blue-600" />;
    case "weak":
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const subjectRaw = await getSubjectBySlug(params.slug);

  if (!subjectRaw) {
    notFound();
  }

  const chaptersRaw = await getChaptersBySubject(subjectRaw.id);

  const quizEntries = await Promise.all(
    (chaptersRaw ?? []).map(async (chapter: any) => {
      const quiz = await getQuizByChapterId(String(chapter.id));
      return [String(chapter.id), quiz] as const;
    })
  );

  const quizMap = new Map(quizEntries);

  const subject: SubjectVM = {
    id: String(subjectRaw.id),
    title: String(subjectRaw.title ?? subjectRaw.name ?? "Matière"),
    description: String(subjectRaw.description ?? ""),
  };

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
      hasQuiz: Boolean(quizMap.get(String(chapter.id))),
    })
  );

  const enriched = chapters.map((chapter) => {
    const quiz = quizMap.get(chapter.id);
    const percent = null;
    const strength = strengthFromPercent(percent);

    return {
      chapter,
      percent,
      strength,
    };
  });

  const stats = {
    total: enriched.length,
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
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="mb-4 font-serif text-3xl font-bold sm:text-4xl">
              {subject.title}
            </h1>

            {subject.description ? (
              <p className="mb-6 text-lg text-muted-foreground">
                {subject.description}
              </p>
            ) : null}

            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chapitres</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Évalués</p>
                      <p className="text-2xl font-bold">{stats.evaluated}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Faible: {stats.weak} • OK: {stats.ok} • Fort: {stats.strong}
                      </p>
                    </div>
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Moyenne quiz</p>
                      <p className="text-2xl font-bold">{stats.average}%</p>
                    </div>
                    <div className="w-20">
                      <Progress value={stats.average} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            {enriched.map(({ chapter, percent, strength }) => (
              <Card key={chapter.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-1 items-start space-x-4">
                      {statusIconFromStrength(strength)}

                      <div className="flex-1">
                        <CardTitle className="mb-2 text-lg">
                          Chapitre {chapter.order}: {chapter.title}
                        </CardTitle>

                        {chapter.description ? (
                          <p className="mb-3 text-sm text-muted-foreground">
                            {chapter.description}
                          </p>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {chapter.estimatedMinutes} min
                          </div>

                          {strengthBadge(strength)}

                          {percent !== null ? (
                            <Badge variant="outline">Score: {percent}%</Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="default" size="sm">
                      <Link href={`/chapters/${chapter.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Lire le cours
                      </Link>
                    </Button>

                    {chapter.hasExercises ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/chapters/${chapter.id}?tab=exercises`}>
                          <PenTool className="mr-2 h-4 w-4" />
                          Exercices
                        </Link>
                      </Button>
                    ) : null}

                    {chapter.hasQuiz ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/chapters/${chapter.id}?tab=quiz`}>
                          <Brain className="mr-2 h-4 w-4" />
                          Quiz
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {enriched.length === 0 ? (
            <div className="py-12 text-center">
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