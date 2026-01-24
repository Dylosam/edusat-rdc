'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, BookOpen, Trophy, Umbrella } from 'lucide-react';
import { mockGetCurrentUser } from '@/lib/mock-api/auth';
import { getSchoolPeriods } from '@/lib/mock-api/data';
import { SchoolPeriod } from '@/lib/types';

export default function CalendarPage() {
  const router = useRouter();
  const [periods, setPeriods] = useState<SchoolPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await mockGetCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      const periodsData = await getSchoolPeriods();
      setPeriods(periodsData);
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

  const getPeriodIcon = (type: SchoolPeriod['type']) => {
    switch (type) {
      case 'term':
        return <BookOpen className="h-6 w-6" />;
      case 'exam':
        return <Trophy className="h-6 w-6" />;
      case 'holiday':
        return <Umbrella className="h-6 w-6" />;
    }
  };

  const getPeriodColor = (type: SchoolPeriod['type']) => {
    switch (type) {
      case 'term':
        return 'from-blue-500 to-cyan-500';
      case 'exam':
        return 'from-orange-500 to-red-500';
      case 'holiday':
        return 'from-green-500 to-emerald-500';
    }
  };

  const getPeriodBadge = (type: SchoolPeriod['type']) => {
    switch (type) {
      case 'term':
        return <Badge className="bg-blue-600">Trimestre</Badge>;
      case 'exam':
        return <Badge className="bg-orange-600">Examens</Badge>;
      case 'holiday':
        return <Badge className="bg-green-600">Vacances</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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
              Calendrier scolaire
            </h1>
            <p className="text-muted-foreground">
              Consultez les périodes scolaires et planifiez vos études
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            {periods.map((period, index) => (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div
                    className={`h-2 bg-gradient-to-r ${getPeriodColor(period.type)}`}
                  />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-br ${getPeriodColor(
                            period.type
                          )} text-white`}
                        >
                          {getPeriodIcon(period.type)}
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-2">{period.name}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              Du {formatDate(period.startDate)} au {formatDate(period.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {getPeriodBadge(period.type)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {period.type === 'exam' && (
                      <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <p className="text-sm">
                          Les quiz de cette période seront disponibles uniquement pendant la
                          fenêtre d'examens. Préparez-vous bien !
                        </p>
                      </div>
                    )}
                    {period.type === 'holiday' && (
                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <p className="text-sm">
                          Profitez de vos vacances pour réviser à votre rythme et consolider
                          vos acquis.
                        </p>
                      </div>
                    )}
                    {period.type === 'term' && (
                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm">
                          Période de cours active. Suivez régulièrement vos matières et
                          validez vos chapitres.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle>À propos du calendrier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Le calendrier scolaire vous aide à planifier votre année d'études. Les
                périodes d'examens sont des fenêtres spéciales pendant lesquelles les quiz
                de validation sont disponibles.
              </p>
              <p>
                Pendant les trimestres, concentrez-vous sur l'apprentissage et la pratique.
                Utilisez les vacances pour réviser et combler vos lacunes.
              </p>
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-foreground mb-2">Légende :</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <span>Trimestre - Période de cours normale</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
                    <span>Examens - Fenêtre de validation des quiz</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    <span>Vacances - Période de révision libre</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
