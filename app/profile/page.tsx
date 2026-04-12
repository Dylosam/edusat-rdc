'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Clock,
  Trophy,
  BookOpen,
  Target,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getSubjects } from '@/lib/mock-api/data';
import type { User } from '@/lib/types';

type ProfileSubject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  chaptersCount: number;
  progress: number;
};

type ProfileProgress = {
  subjectId: string;
  chaptersCompleted: number;
  totalChapters: number;
  quizzesPassed: number;
  averageScore: number;
};

function normalizeSubject(subject: any): ProfileSubject {
  const chaptersCount = Array.isArray(subject?.chapters)
    ? subject.chapters.length
    : Number(subject?.chaptersCount ?? 0);

  return {
    id: String(subject?.id ?? subject?.slug ?? ''),
    slug: String(subject?.slug ?? subject?.id ?? ''),
    name: String(subject?.name ?? subject?.title ?? 'Matière'),
    description: String(subject?.description ?? subject?.summary ?? ''),
    chaptersCount,
    progress: Number(subject?.progress ?? 0),
  };
}

function buildProgressFromSubjects(subjects: ProfileSubject[]): ProfileProgress[] {
  return subjects.map((subject) => {
    const totalChapters = Math.max(subject.chaptersCount, 0);
    const chaptersCompleted = totalChapters
      ? Math.round((subject.progress / 100) * totalChapters)
      : 0;

    return {
      subjectId: subject.id,
      chaptersCompleted,
      totalChapters,
      quizzesPassed: chaptersCompleted,
      averageScore: subject.progress || 0,
    };
  });
}

function buildUserFromSession(authUser: any): User {
  return {
    id: String(authUser?.id ?? ''),
    name:
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      authUser?.email?.split('@')[0] ||
      'Utilisateur',
    email: authUser?.email ? String(authUser.email) : '',
    phone: authUser?.user_metadata?.phone
      ? String(authUser.user_metadata.phone)
      : '',
    level: String(authUser?.user_metadata?.level ?? 'Non défini'),
    joinDate: String(authUser?.created_at ?? new Date().toISOString()),
    totalTimeStudied: 0,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<ProfileSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session?.user) {
          router.replace('/auth/login');
          return;
        }

        const normalizedUser = buildUserFromSession(session.user);

        const subjectsData = await getSubjects();

        if (!mounted) return;

        const normalizedSubjects = Array.isArray(subjectsData)
          ? subjectsData.map(normalizeSubject)
          : [];

        setUser(normalizedUser);
        setSubjects(normalizedSubjects);
      } catch (error) {
        console.error('[profile] load error:', error);
        if (mounted) {
          router.replace('/auth/login');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const progressData = useMemo(() => buildProgressFromSubjects(subjects), [subjects]);

  const totalChaptersCompleted = useMemo(
    () => progressData.reduce((acc, p) => acc + p.chaptersCompleted, 0),
    [progressData]
  );

  const totalQuizzesPassed = useMemo(
    () => progressData.reduce((acc, p) => acc + p.quizzesPassed, 0),
    [progressData]
  );

  const averageScore = useMemo(
    () =>
      progressData.length > 0
        ? progressData.reduce((acc, p) => acc + p.averageScore, 0) / progressData.length
        : 0,
    [progressData]
  );

  const hoursStudied = Math.floor((user?.totalTimeStudied || 0) / 60);
  const minutesStudied = (user?.totalTimeStudied || 0) % 60;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="mb-8">
            <h1 className="mb-2 font-serif text-3xl font-bold sm:text-4xl">Profil</h1>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone || 'Non renseigné'}</span>
                  </div>

                  {user.email && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{user.level}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(user.joinDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard
                  title="Temps étudié"
                  value={`${hoursStudied}h ${minutesStudied}m`}
                  icon={<Clock />}
                />
                <StatCard
                  title="Chapitres terminés"
                  value={totalChaptersCompleted}
                  icon={<BookOpen />}
                />
                <StatCard
                  title="Quiz réussis"
                  value={totalQuizzesPassed}
                  icon={<Trophy />}
                />
                <StatCard
                  title="Score moyen"
                  value={`${averageScore.toFixed(0)}%`}
                  icon={<Target />}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Progression par matière</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {subjects.map((subject) => (
                    <div key={subject.id}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{subject.name}</span>
                        <span>{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}