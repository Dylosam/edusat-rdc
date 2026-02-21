'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Trophy, TrendingUp, ArrowRight, Lock } from 'lucide-react';

import { mockGetCurrentUser } from '@/lib/mock-api/auth';
import { getSubjects } from '@/lib/mock-api/data';
import type { User, Subject } from '@/lib/types';
import * as LucideIcons from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      try {
        const currentUser = await mockGetCurrentUser();

        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        if (!alive) return;
        setUser(currentUser);

        const subjectsData = await getSubjects();
        if (!alive) return;
        setSubjects(subjectsData ?? []);
      } catch (e) {
        // En dev, tu peux log pour tracer
        console.error('[Dashboard] loadData error:', e);
        if (!alive) return;
        setSubjects([]);
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      alive = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const totalProgress =
    subjects.length > 0
      ? subjects.reduce((acc, subject) => acc + (subject.progress ?? 0), 0) / subjects.length
      : 0;

  const totalTime = user?.totalTimeStudied ?? 0; // minutes
  const hoursStudied = Math.floor(totalTime / 60);
  const minutesStudied = totalTime % 60;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-serif">
              Bonjour, {user?.name?.split(' ')[0] ?? '...' } !
            </h1>
            <p className="text-muted-foreground">
              Niveau : <span className="font-semibold">{user?.level ?? '—'}</span>
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progression globale</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(totalProgress)}%</div>
                <Progress value={totalProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps étudié</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hoursStudied}h {minutesStudied}m
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ce mois-ci</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Matières actives</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Disponibles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abonnement</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{user?.subscription ?? 'free'}</div>
                {user?.subscription === 'free' && (
                  <Link href="/subscription">
                    <Button variant="link" className="p-0 h-auto text-xs mt-1">
                      Passer à Premium
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold font-serif">Vos matières</h2>
            <Link href="/subjects">
              <Button variant="ghost" size="sm">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, index) => {
              const IconComponent = (LucideIcons as any)[subject.icon as any] || BookOpen;
              const isPremium = index > 5 && user?.subscription === 'free';

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={isPremium ? '/subscription' : `/subjects/${subject.slug}`}>
                    <Card className="group hover:shadow-lg transition-all hover:border-primary/50 relative overflow-hidden">
                      {isPremium && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                          <div className="text-center">
                            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <Badge variant="secondary">Premium</Badge>
                          </div>
                        </div>
                      )}

                      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${subject.color}`} />

                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <IconComponent className="h-8 w-8 text-primary" />
                          <Badge variant="secondary">{subject.chaptersCount} chapitres</Badge>
                        </div>
                        <CardTitle className="text-xl mt-4">{subject.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{subject.description}</p>
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

          {user?.subscription === 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12"
            >
              <Card className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border-blue-600/20">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-2xl font-bold mb-2 font-serif">Passez à Premium</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Débloquez toutes les matières, accédez à des contenus exclusifs et
                    bénéficiez d&apos;un suivi personnalisé
                  </p>
                  <Link href="/subscription">
                    <Button size="lg">
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