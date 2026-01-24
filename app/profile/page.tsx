'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Crown,
} from 'lucide-react';
import { mockGetCurrentUser } from '@/lib/mock-api/auth';
import { getSubjects, getProgress } from '@/lib/mock-api/data';
import { User, Subject, Progress as ProgressType } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progressData, setProgressData] = useState<ProgressType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await mockGetCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      setUser(currentUser);

      const subjectsData = await getSubjects();
      setSubjects(subjectsData);

      const progressPromises = subjectsData.map((s) => getProgress(s.id));
      const progressResults = await Promise.all(progressPromises);
      setProgressData(progressResults);

      setIsLoading(false);
    };

    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalChaptersCompleted = progressData.reduce(
    (acc, p) => acc + p.chaptersCompleted,
    0
  );
  const totalQuizzesPassed = progressData.reduce((acc, p) => acc + p.quizzesPassed, 0);
  const averageScore =
    progressData.reduce((acc, p) => acc + p.averageScore, 0) / progressData.length;
  const hoursStudied = Math.floor((user.totalTimeStudied || 0) / 60);
  const minutesStudied = (user.totalTimeStudied || 0) % 60;

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
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-serif">Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations et suivez vos statistiques
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <Badge variant={user.subscription === 'premium' ? 'default' : 'secondary'}>
                      {user.subscription === 'premium' ? (
                        <><Crown className="h-3 w-3 mr-1" />Premium</>
                      ) : (
                        'Gratuit'
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                  {user.email && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>Niveau: {user.level}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Membre depuis {new Date(user.joinDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {user.subscription === 'free' && (
                  <div className="pt-4 border-t">
                    <Link href="/subscription">
                      <Button className="w-full">
                        <Crown className="mr-2 h-4 w-4" />
                        Passer à Premium
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Temps étudié</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {hoursStudied}h {minutesStudied}m
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Temps total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Chapitres terminés</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalChaptersCompleted}</div>
                    <p className="text-xs text-muted-foreground mt-1">Tous sujets confondus</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quiz réussis</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalQuizzesPassed}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total de quiz</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{averageScore.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Tous quiz confondus</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Progression par matière</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subjects.slice(0, 6).map((subject) => {
                    const progress = progressData.find((p) => p.subjectId === subject.id);
                    return (
                      <div key={subject.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{subject.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {progress?.chaptersCompleted || 0}/{progress?.totalChapters || 0}{' '}
                            chapitres
                          </span>
                        </div>
                        <Progress value={subject.progress} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
