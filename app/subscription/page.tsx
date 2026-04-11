'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Check,
  Zap,
  Star,
  Users,
  BookOpen,
  Award,
  TrendingUp,
} from 'lucide-react';
import { mockGetCurrentUser } from '@/lib/mock-api/auth';
import type { User } from '@/lib/types';
import { toast } from 'sonner';

function normalizeUser(rawUser: any): User {
  return {
    id: String(rawUser?.id ?? ''),
    name: String(
      rawUser?.name ??
        rawUser?.fullName ??
        [rawUser?.firstName, rawUser?.lastName].filter(Boolean).join(' ') ??
        'Utilisateur'
    ),
    email: rawUser?.email ? String(rawUser.email) : '',
    phone: rawUser?.phone ? String(rawUser.phone) : '',
    level: String(rawUser?.level ?? rawUser?.classLevel ?? 'Non défini'),
    subscription:
      rawUser?.subscription === 'premium' || rawUser?.subscription === 'free'
        ? rawUser.subscription
        : 'free',
    joinDate: String(rawUser?.joinDate ?? rawUser?.createdAt ?? new Date().toISOString()),
    totalTimeStudied: Number(rawUser?.totalTimeStudied ?? 0),
  };
}

export default function SubscriptionPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const currentUser = await mockGetCurrentUser();

        if (!mounted) return;

        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        const normalizedUser = normalizeUser(currentUser);
        setUser(normalizedUser);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleUpgrade = () => {
    toast.info('La fonctionnalité de paiement sera bientôt disponible');
  };

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

  if (!user) {
    return null;
  }

  const freeFeatures = [
    'Accès à 6 matières',
    'Cours structurés',
    'Exercices pratiques',
    'Quiz de validation',
    'Suivi de progression basique',
  ];

  const premiumFeatures = [
    'Accès illimité à toutes les matières',
    'Tous les cours et chapitres',
    'Exercices illimités',
    'Quiz avancés avec explications détaillées',
    'Suivi de progression avancé',
    'Statistiques détaillées',
    'Contenu exclusif',
    'Support prioritaire',
    'Sans publicité',
    'Certificats de réussite',
  ];

  const benefits = [
    {
      icon: BookOpen,
      title: 'Accès illimité',
      description: 'Toutes les matières et chapitres disponibles',
    },
    {
      icon: Star,
      title: 'Contenu exclusif',
      description: 'Exercices et quiz avancés réservés aux Premium',
    },
    {
      icon: TrendingUp,
      title: 'Progression accélérée',
      description: 'Outils avancés pour suivre vos progrès',
    },
    {
      icon: Award,
      title: 'Certificats',
      description: 'Obtenez des certificats de réussite',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-12 text-center">
            <Badge className="mb-4" variant="secondary">
              Abonnement
            </Badge>

            <h1 className="mb-4 font-serif text-3xl font-bold sm:text-5xl">
              Choisissez votre formule
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Débloquez tout votre potentiel avec l&apos;abonnement Premium et accédez à tous les
              contenus éducatifs
            </p>
          </div>

          <div className="mx-auto mb-12 grid max-w-5xl gap-8 md:grid-cols-2">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <CardTitle className="text-2xl">Gratuit</CardTitle>
                    {user?.subscription === 'free' && (
                      <Badge variant="secondary">Actuel</Badge>
                    )}
                  </div>

                  <CardDescription>Pour commencer votre apprentissage</CardDescription>

                  <div className="mt-4">
                    <span className="text-4xl font-bold">0 $</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {freeFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="mt-0.5 h-5 w-5 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {user?.subscription === 'free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Formule actuelle
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Déjà inscrit
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="relative h-full overflow-hidden border-2 border-primary">
                <div className="absolute right-0 top-0 rounded-bl-lg bg-gradient-to-l from-yellow-400 to-orange-500 px-4 py-1 text-xs font-semibold text-white">
                  POPULAIRE
                </div>

                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <CardTitle className="flex items-center text-2xl">
                      <Crown className="mr-2 h-6 w-6 text-yellow-500" />
                      Premium
                    </CardTitle>

                    {user?.subscription === 'premium' && <Badge>Actuel</Badge>}
                  </div>

                  <CardDescription>Pour exceller dans vos études</CardDescription>

                  <div className="mt-4">
                    <span className="text-4xl font-bold">5 $</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="mt-0.5 h-5 w-5 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {user?.subscription === 'premium' ? (
                    <Button className="w-full" disabled>
                      <Crown className="mr-2 h-4 w-4" />
                      Formule actuelle
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={handleUpgrade}>
                      <Zap className="mr-2 h-4 w-4" />
                      Passer à Premium
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="mx-auto mb-12 max-w-5xl">
            <h2 className="mb-6 text-center font-serif text-2xl font-bold">
              Pourquoi choisir Premium ?
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit.title}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="h-full text-center">
                    <CardContent className="pt-6">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <Card className="mx-auto max-w-5xl border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 font-serif text-2xl font-bold">
                Rejoignez des milliers d&apos;élèves Premium
              </h3>
              <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
                Investissez dans votre éducation et donnez-vous les moyens de réussir brillamment
                vos études avec EduStat-RDC Premium
              </p>

              {user?.subscription === 'free' && (
                <Button size="lg" onClick={handleUpgrade}>
                  <Crown className="mr-2 h-5 w-5" />
                  Commencer avec Premium
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}