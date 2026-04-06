"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getSubjects } from "@/lib/supabase/queries";
import { normalizeSubject, getSubjectIcon, type NormalizedSubject } from "@/lib/subjects";
import { BookOpen, Search, ArrowRight } from "lucide-react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<NormalizedSubject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSubjects = async () => {
      try {
        setIsLoading(true);
        const subjectsRaw = await getSubjects();

        if (!mounted) return;

        const mapped = Array.isArray(subjectsRaw)
          ? subjectsRaw.map((subject, index) => normalizeSubject(subject, index))
          : [];

        setSubjects(mapped);
      } catch (error) {
        console.error("Erreur lors du chargement des matières :", error);
        setSubjects([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadSubjects();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSubjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    if (!q) return subjects;

    return subjects.filter((subject) => {
      const name = subject.name.toLowerCase();
      const description = subject.description.toLowerCase();
      const slug = subject.slug.toLowerCase();

      return name.includes(q) || description.includes(q) || slug.includes(q);
    });
  }, [subjects, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 font-serif text-3xl font-bold sm:text-4xl">
              Toutes les matières
            </h1>
            <p className="text-muted-foreground">
              Explorez et maîtrisez toutes vos matières scolaires
            </p>
          </div>

          {!isLoading && subjects.length > 0 ? (
            <div className="inline-flex w-fit items-center rounded-xl border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {filteredSubjects.length} matière
              {filteredSubjects.length > 1 ? "s" : ""} trouvée
              {filteredSubjects.length > 1 ? "s" : ""}
            </div>
          ) : null}
        </div>

        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une matière..."
              className="h-11 rounded-2xl pl-10 pr-4"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="h-[240px] animate-pulse rounded-2xl border bg-card"
              >
                <CardHeader className="space-y-4">
                  <div className="h-8 w-8 rounded-md bg-muted" />
                  <div className="h-5 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-4/5 rounded bg-muted" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 w-1/3 rounded bg-muted" />
                  <div className="h-2 w-full rounded bg-muted" />
                  <div className="h-6 w-24 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSubjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => {
              const IconComponent = getSubjectIcon(subject.icon);

              return (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.slug}`}
                  className="group block h-full"
                >
                  <Card className="relative h-full overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br opacity-5 ${subject.color}`}
                    />

                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary transition group-hover:bg-primary/15">
                          <IconComponent className="h-6 w-6" />
                        </div>

                        <Badge variant="secondary" className="rounded-xl">
                          {subject.chaptersCount} chapitre
                          {subject.chaptersCount > 1 ? "s" : ""}
                        </Badge>
                      </div>

                      <CardTitle className="mt-4 text-xl transition-colors group-hover:text-primary">
                        {subject.name}
                      </CardTitle>

                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {subject.description ||
                          "Découvrez cette matière et avancez chapitre par chapitre."}
                      </p>
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

                        <div className="flex items-center justify-between pt-2 text-sm">
                          <span className="text-muted-foreground transition group-hover:text-primary">
                            Continuer
                          </span>

                          <ArrowRight className="h-4 w-4 translate-x-0 text-primary transition-all duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : subjects.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Aucune matière trouvée</h3>
            <p className="text-muted-foreground">
              Aucune matière publiée n’est disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Aucun résultat</h3>
            <p className="text-muted-foreground">
              Aucune matière ne correspond à votre recherche.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}