import Link from "next/link";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getSubjects } from "@/lib/supabase/queries";
import {
  BookOpen,
  Search,
  Calculator,
  Sigma,
  Atom,
  FlaskConical,
  BarChart3,
  Triangle,
  Globe,
  Leaf,
  Sparkles,
} from "lucide-react";

type SubjectVM = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  color?: string;
  chaptersCount: number;
  progress: number;
};

const iconMap = {
  BookOpen,
  Calculator,
  Sigma,
  Atom,
  FlaskConical,
  BarChart3,
  Triangle,
  Globe,
  Leaf,
} as const;

function mapSubjectToAiSubject(name?: string, slug?: string) {
  const source = `${name ?? ""} ${slug ?? ""}`.toLowerCase().trim();

  if (
    source.includes("math") ||
    source.includes("alg") ||
    source.includes("géom") ||
    source.includes("geom") ||
    source.includes("trigo") ||
    source.includes("analyse")
  ) {
    return "math";
  }

  if (source.includes("phys")) {
    return "physics";
  }

  if (source.includes("chim")) {
    return "chemistry";
  }

  if (
    source.includes("bio") ||
    source.includes("écologie") ||
    source.includes("ecologie")
  ) {
    return "biology";
  }

  return "math";
}

export default async function SubjectsPage() {
  const subjectsRaw = await getSubjects();

  const subjects: SubjectVM[] = (subjectsRaw ?? []).map((s: any, idx: number) => {
    const id = String(s.id ?? idx);
    const slug = String(s.slug ?? s.code ?? s.id ?? id);
    const name = String(s.name ?? s.title ?? s.label ?? "Matière");
    const description = s.description ?? s.desc ?? "";
    const icon = typeof s.icon === "string" ? s.icon : "BookOpen";
    const color =
      typeof s.color === "string" && s.color.trim().length
        ? s.color
        : "from-primary/30 to-primary/5";

    const chaptersCount = Number(
      s.chaptersCount ??
        s.chapters_count ??
        (Array.isArray(s.chapters) ? s.chapters.length : 0) ??
        0
    );

    const progress = Number(s.progress ?? 0);

    return {
      id,
      slug,
      name,
      description,
      icon,
      color,
      chaptersCount,
      progress,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-3xl font-bold sm:text-4xl">
            Toutes les matières
          </h1>
          <p className="text-muted-foreground">
            Explorez et maîtrisez toutes vos matières scolaires
          </p>
        </div>

        <div className="mb-8 max-w-md">
          <div className="relative opacity-70">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Recherche bientôt disponible..."
              className="pl-9"
              disabled
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const IconComponent =
              iconMap[subject.icon as keyof typeof iconMap] ?? BookOpen;

            const aiSubject = mapSubjectToAiSubject(subject.name, subject.slug);

            return (
              <div key={subject.id} className="group relative">
                <Link href={`/subjects/${subject.slug}`} className="block h-full">
                  <Card className="relative h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br opacity-5 ${subject.color}`}
                    />

                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <IconComponent className="h-8 w-8 text-primary" />
                        <Badge variant="secondary">
                          {subject.chaptersCount} chapitres
                        </Badge>
                      </div>

                      <CardTitle className="mt-4 text-xl">{subject.name}</CardTitle>

                      {subject.description ? (
                        <p className="text-sm text-muted-foreground">
                          {subject.description}
                        </p>
                      ) : null}
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-semibold">{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground">
                            Ouvrir la matière
                          </span>

                          <span className="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition group-hover:bg-primary/10">
                            Explorer
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link
                  href={`/ai?subject=${aiSubject}`}
                  className="absolute bottom-5 right-5 z-10 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" />
                  Demander à l’IA
                </Link>
              </div>
            );
          })}
        </div>

        {subjects.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Aucune matière trouvée</h3>
            <p className="text-muted-foreground">
              Aucune matière publiée n’est disponible pour le moment.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}