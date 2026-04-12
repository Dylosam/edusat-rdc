'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { getSubjects } from '@/lib/supabase/queries.client';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { User } from '@/lib/types';
import { normalizeSubject, getSubjectIcon, type NormalizedSubject } from '@/lib/subjects';

export default function DashboardPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<NormalizedSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const buildUserFromSession = (authUser: any): User => ({
      id: String(authUser.id ?? ''),
      name:
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'Élève',
      email: authUser.email || '',
      phone: authUser.user_metadata?.phone || authUser.phone || '',
      level: authUser.user_metadata?.level || 'Débutant',
      joinDate: authUser.created_at || new Date().toISOString(),
      totalTimeStudied: 0,
    });

    const init = async () => {
      console.log('[dashboard] checking session...');

      const {
        data: { session },
        error,
      } = await supabaseBrowser.auth.getSession();

      if (error) {
        console.error('[dashboard] session error =', error);
      }

      console.log('[dashboard] session =', session);

      if (!mounted) return;

      if (!session?.user) {
        router.replace('/auth/login');
        return;
      }

      setUser(buildUserFromSession(session.user));

      const subjectsData = await getSubjects();

      if (!mounted) return;

      const normalizedSubjects = Array.isArray(subjectsData)
        ? subjectsData.map((subject, index) => normalizeSubject(subject, index))
        : [];

      setSubjects(normalizedSubjects);
      setIsLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      console.log('[dashboard] auth event =', event);

      if (!mounted) return;

      if (!session?.user) {
        router.replace('/auth/login');
        return;
      }

      setUser(buildUserFromSession(session.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary sm:h-12 sm:w-12" />
        </div>
      </div>
    );
  }

  const totalProgress =
    subjects.length > 0
      ? subjects.reduce((acc, subject) => acc + subject.progress, 0) / subjects.length
      : 0;

  const hoursStudied = Math.floor((user?.totalTimeStudied || 0) / 60);
  const minutesStudied = (user?.totalTimeStudied || 0) % 60;
  const firstName = user?.name?.split(' ')[0] ?? 'élève';

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
            <h1 className="mb-1 font-serif text-3xl font-bold leading-tight sm:mb-2 sm:text-4xl">
              Bonjour, {firstName} !
            </h1>
            <p className="text-muted-foreground">
              Niveau : <span className="font-semibold">{user?.level}</span>
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-1 sm:p-6 sm:pb-2">
                <CardTitle className="pr-2 text-sm font-medium leading-snug">
                  Progression globale
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
                  Temps étudié
                </CardTitle>
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
                <div className="text-2xl font-bold sm:text-3xl">
                  {hoursStudied}h {minutesStudied}m
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Ce mois-ci</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-1 sm:p-6 sm:pb-2">
                <CardTitle className="pr-2 text-sm font-medium leading-snug">
                  Matières actives
                </CardTitle>
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
                <div className="text-2xl font-bold sm:text-3xl">{subjects.length}</div>
                <p className="mt-1 text-xs text-muted-foreground">Disponibles</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-2xl font-bold">Vos matières</h2>
            <Link prefetch href="/subjects" className="w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="w-full justify-center sm:w-auto">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {subjects.map((subject) => {
              const IconComponent = getSubjectIcon(subject.icon);
              const href = subject.slug?.trim() ? `/subjects/${subject.slug}` : '/subjects';

              return (
                <motion.div
                  key={subject.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link prefetch href={href}>
                    <Card className="group relative overflow-hidden rounded-2xl transition-all hover:border-primary/50 hover:shadow-lg">
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-5 ${subject.color}`} />

                      <CardHeader className="relative z-[1] p-4 sm:p-5 lg:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <IconComponent className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
                          <Badge variant="secondary" className="shrink-0">
                            {subject.chaptersCount} chapitre{subject.chaptersCount > 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <CardTitle className="mt-3 text-lg sm:mt-4 sm:text-xl">
                          {subject.name}
                        </CardTitle>

                        <p className="text-sm text-muted-foreground">
                          {subject.description || 'Commence cette matière et progresse chapitre par chapitre.'}
                        </p>
                      </CardHeader>

                      <CardContent className="relative z-[1] p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-semibold">{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}