"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  ArrowRight,
  Lock,
} from "lucide-react";
import { mockGetCurrentUser } from "@/lib/mock-api/auth";
import { getSubjects } from "@/lib/supabase/queries";
import type { User } from "@/lib/types";
import { normalizeSubject, getSubjectIcon, type NormalizedSubject } from "@/lib/subjects";

type AuthUserLike = Partial<User> & {
  id?: string;
  name?: string;
  email?: string;
  level?: string;
  subscription?: string;
  joinDate?: string;
  totalTimeStudied?: number;
};

function mapAuthUserToUser(authUser: AuthUserLike): User {
  return {
    ...authUser,
    id: String(authUser.id ?? ""),
    name: String(authUser.name ?? "Élève"),
    email: String(authUser.email ?? ""),
    level: String(authUser.level ?? "Débutant"),
    subscription: String(authUser.subscription ?? "free"),
    joinDate: String(authUser.joinDate ?? new Date().toISOString()),
    totalTimeStudied: Number(authUser.totalTimeStudied ?? 0),
  } as User;
}

export default function DashboardPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<NormalizedSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const currentUser = await mockGetCurrentUser();

        if (!mounted) return;

        if (!currentUser) {
          router.push("/auth/login");
          return;
        }

        setUser(mapAuthUserToUser(currentUser as AuthUserLike));

        const subjectsData = await getSubjects();

        if (!mounted) return;

        const normalizedSubjects = Array.isArray(subjectsData)
          ? subjectsData.map((subject, index) => normalizeSubject(subject, index))
          : [];

        setSubjects(normalizedSubjects);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
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
  const firstName = user?.name?.split(" ")[0] ?? "élève";

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

          <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
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

            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-1 sm:p-6 sm:pb-2">
                <CardTitle className="pr-2 text-sm font-medium leading-snug">
                  Abonnement
                </CardTitle>
                <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
                <div className="text-2xl font-bold capitalize sm:text-3xl">
                  {user?.subscription}
                </div>

                {user?.subscription === "free" && (
                  <Link prefetch href="/subscription">
                    <Button variant="link" className="mt-1 h-auto p-0 text-xs">
                      Passer à Premium
                    </Button>
                  </Link>
                )}
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
            {subjects.map((subject, index) => {
              const IconComponent = getSubjectIcon(subject.icon);
              const isPremium = index > 5 && user?.subscription === "free";
              const href =
                isPremium || !subject.slug?.trim()
                  ? "/subscription"
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
                        className={`absolute inset-0 bg-gradient-to-br opacity-5 ${subject.color}`}
                      />

                      <CardHeader className="relative z-[1] p-4 sm:p-5 lg:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <IconComponent className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
                          <Badge variant="secondary" className="shrink-0">
                            {subject.chaptersCount} chapitre
                            {subject.chaptersCount > 1 ? "s" : ""}
                          </Badge>
                        </div>

                        <CardTitle className="mt-3 text-lg sm:mt-4 sm:text-xl">
                          {subject.name}
                        </CardTitle>

                        <p className="text-sm text-muted-foreground">
                          {subject.description ||
                            "Commence cette matière et progresse chapitre par chapitre."}
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

          {user?.subscription === "free" && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 sm:mt-10 lg:mt-12"
            >
              <Card className="rounded-2xl border-blue-600/20 bg-gradient-to-r from-blue-600/10 to-cyan-600/10">
                <CardContent className="p-5 text-center sm:p-6 lg:p-8">
                  <Trophy className="mx-auto mb-4 h-10 w-10 text-blue-600 sm:h-12 sm:w-12" />
                  <h3 className="mb-2 font-serif text-xl font-bold sm:text-2xl">
                    Passez à Premium
                  </h3>
                  <p className="mx-auto mb-5 max-w-md text-sm text-muted-foreground sm:mb-6 sm:text-base">
                    Débloquez toutes les matières, accédez à des contenus exclusifs et
                    bénéficiez d&apos;un suivi personnalisé
                  </p>
                  <Link prefetch href="/subscription">
                    <Button size="lg" className="w-full sm:w-auto">
                      Découvrir Premium
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}