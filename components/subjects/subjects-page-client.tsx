'use client';

import { useMemo, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import {
  BookOpen,
  Search,
  TrendingUp,
  Layers3,
  ArrowRight,
  Lock,
} from 'lucide-react';

import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type RawSubject = {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  label?: string;
  description?: string;
  desc?: string;
  icon?: string;
  color?: string;
  chaptersCount?: number;
  chapters_count?: number;
  chapters?: unknown[];
  progress?: number;
  is_published?: boolean;
};

type SubjectVM = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  chaptersCount: number;
  progress: number;
};

type Props = {
  initialSubjects: RawSubject[];
};

type IconComponentType = ComponentType<{ className?: string }>;

const fallbackGradients = [
  'from-primary/20 to-primary/5',
  'from-blue-500/20 to-cyan-500/5',
  'from-violet-500/20 to-fuchsia-500/5',
  'from-emerald-500/20 to-teal-500/5',
  'from-amber-500/20 to-orange-500/5',
  'from-rose-500/20 to-pink-500/5',
];

function normalizeSubject(subject: RawSubject, index: number): SubjectVM {
  return {
    id: String(subject.id ?? subject.slug ?? `subject-${index}`),
    slug: String(subject.slug ?? subject.id ?? ''),
    name: String(subject.name ?? subject.title ?? subject.label ?? 'Matière'),
    description: String(subject.description ?? subject.desc ?? ''),
    icon: String(subject.icon ?? 'BookOpen'),
    color: String(subject.color ?? fallbackGradients[index % fallbackGradients.length]),
    chaptersCount: Array.isArray(subject.chapters)
      ? subject.chapters.length
      : Number(subject.chaptersCount ?? subject.chapters_count ?? 0),
    progress: Math.max(0, Math.min(100, Number(subject.progress ?? 0))),
  };
}

export default function SubjectsPageClient({ initialSubjects }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = useMemo(
    () => (Array.isArray(initialSubjects) ? initialSubjects.map(normalizeSubject) : []),
    [initialSubjects]
  );

  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subjects;

    return subjects.filter((subject) => {
      return (
        subject.name.toLowerCase().includes(q) ||
        subject.description.toLowerCase().includes(q)
      );
    });
  }, [subjects, searchQuery]);

  const totalProgress =
    filteredSubjects.length > 0
      ? filteredSubjects.reduce((acc, subject) => acc + subject.progress, 0) /
        filteredSubjects.length
      : 0;

  const totalChapters = filteredSubjects.reduce(
    (acc, subject) => acc + subject.chaptersCount,
    0
  );

  const iconsMap = LucideIcons as unknown as Record<string, IconComponentType>;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="mb-1 text-3xl font-bold font-serif leading-tight sm:mb-2 sm:text-4xl">
              Toutes les matières
            </h1>
            <p className="text-muted-foreground">
              Explore tes matières, ouvre leurs chapitres et avance à ton rythme.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-1 sm:p-6 sm:pb-2">
                <CardTitle className="pr-2 text-sm font-medium leading-snug">
                  Matières trouvées
                </CardTitle>
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
                <div className="text-2xl font-bold sm:text-3xl">
                  {filteredSubjects.length}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Disponibles</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-1 sm:p-6 sm:pb-2">
                <CardTitle className="pr-2 text-sm font-medium leading-snug">
                  Chapitres
                </CardTitle>
                <Layers3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
                <div className="text-2xl font-bold sm:text-3xl">{totalChapters}</div>
                <p className="mt-1 text-xs text-muted-foreground">Au total</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-1 sm:p-6 sm:pb-2">
                <CardTitle className="pr-2 text-sm font-medium leading-snug">
                  Progression moyenne
                </CardTitle>
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
                <div className="text-2xl font-bold sm:text-3xl">
                  {Math.round(totalProgress)}%
                </div>
                <Progress value={totalProgress} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-1 sm:p-6 sm:pb-2">
                <CardTitle className="pr-2 text-sm font-medium leading-snug">
                  Recherche
                </CardTitle>
                <Search className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
                <div className="text-sm text-muted-foreground">
                  Filtre rapidement par nom ou description
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold font-serif">Catalogue des matières</h2>

            <div className="w-full sm:w-[340px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une matière..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {filteredSubjects.map((subject, index) => {
              const IconComponent = iconsMap[subject.icon] ?? BookOpen;
              const isPremium = false;
              const href =
                isPremium || !subject.slug?.trim()
                  ? '/subscription'
                  : `/subjects/${subject.slug}`;

              return (
                <motion.div
                  key={subject.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link prefetch href={href}>
                    <Card className="group relative overflow-hidden rounded-2xl transition-all hover:border-primary/50 hover:shadow-lg">
                      {isPremium && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                          <div className="text-center">
                            <Lock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                            <Badge variant="secondary">Premium</Badge>
                          </div>
                        </div>
                      )}

                      <div
                        className={`absolute inset-0 opacity-5 bg-gradient-to-br ${subject.color}`}
                      />

                      <CardHeader className="relative z-[1] p-4 sm:p-5 lg:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <IconComponent className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
                          <Badge variant="secondary" className="shrink-0">
                            {subject.chaptersCount} chapitre
                            {subject.chaptersCount > 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <CardTitle className="mt-3 text-lg sm:mt-4 sm:text-xl">
                          {subject.name}
                        </CardTitle>

                        <p className="text-sm text-muted-foreground">
                          {subject.description ||
                            'Commence cette matière et progresse chapitre par chapitre.'}
                        </p>
                      </CardHeader>

                      <CardContent className="relative z-[1] p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progression</span>
                              <span className="font-semibold">{subject.progress}%</span>
                            </div>
                            <Progress value={subject.progress} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-muted-foreground">
                              Parcours disponible
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-primary hover:bg-transparent"
                            >
                              Ouvrir
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {filteredSubjects.length === 0 && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-8 sm:mt-10"
            >
              <Card className="rounded-2xl">
                <CardContent className="p-6 text-center sm:p-8">
                  <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-bold font-serif">
                    Aucune matière trouvée
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground">
                    Essaie un autre mot-clé pour afficher les matières disponibles.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}