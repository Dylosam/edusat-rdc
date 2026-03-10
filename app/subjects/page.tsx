'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Search,
  Lock,
  Calculator,
  Sigma,
  Atom,
  FlaskConical,
  BarChart3,
  Triangle,
  Globe,
  Leaf,
} from 'lucide-react';

import { mockGetCurrentUser } from '@/lib/mock-api/auth';
import { getSubjects } from '@/lib/mock-api/data';

import type { User } from '@/lib/types';

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

export default function SubjectsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [subjectsRaw, setSubjectsRaw] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [currentUser, subjectsData] = await Promise.all([
          mockGetCurrentUser(),
          getSubjects(),
        ]);

        if (!mounted) return;

        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser as User);
        setSubjectsRaw(Array.isArray(subjectsData) ? subjectsData : []);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [router]);

  const subjects: SubjectVM[] = useMemo(() => {
    return (subjectsRaw ?? []).map((s: any, idx: number) => {
      const id = String(s.id ?? idx);
      const slug = String(s.slug ?? s.code ?? s.id ?? id);
      const name = String(s.name ?? s.title ?? s.label ?? 'Matière');
      const description = s.description ?? s.desc ?? '';
      const icon = typeof s.icon === 'string' ? s.icon : 'BookOpen';
      const color =
        typeof s.color === 'string' && s.color.trim().length
          ? s.color
          : 'from-primary/30 to-primary/5';

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
  }, [subjectsRaw]);

  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subjects;

    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(q)
    );
  }, [subjects, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-10 w-64 rounded-md bg-muted animate-pulse mb-3" />
            <div className="h-5 w-96 max-w-full rounded-md bg-muted animate-pulse" />
          </div>

          <div className="mb-8 max-w-md">
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border bg-card p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                  <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-40 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-10 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-2.5 w-full rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-serif">
              Toutes les matières
            </h1>
            <p className="text-muted-foreground">
              Explorez et maîtrisez toutes vos matières scolaires
            </p>
          </div>

          <div className="mb-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une matière..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject, index) => {
              const IconComponent =
                iconMap[subject.icon as keyof typeof iconMap] ?? BookOpen;

              const isPremium = index > 5 && user?.subscription === 'free';

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.02 }}
                >
                  <Link href={isPremium ? '/subscription' : `/subjects/${subject.slug}`}>
                    <Card className="group hover:shadow-lg transition-all hover:border-primary/50 relative overflow-hidden h-full">
                      {isPremium && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                          <div className="text-center">
                            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <Badge variant="secondary">Premium</Badge>
                          </div>
                        </div>
                      )}

                      <div
                        className={`absolute inset-0 opacity-5 bg-gradient-to-br ${subject.color}`}
                      />

                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <IconComponent className="h-8 w-8 text-primary" />
                          <Badge variant="secondary">
                            {subject.chaptersCount} chapitres
                          </Badge>
                        </div>

                        <CardTitle className="text-xl mt-4">
                          {subject.name}
                        </CardTitle>

                        {subject.description ? (
                          <p className="text-sm text-muted-foreground">
                            {subject.description}
                          </p>
                        ) : null}
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-semibold">{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucune matière trouvée</h3>
              <p className="text-muted-foreground">
                Essayez de modifier votre recherche
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}