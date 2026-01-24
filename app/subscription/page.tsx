'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Check,
  Lock,
  Zap,
  Star,
  Users,
  BookOpen,
  Award,
  TrendingUp,
} from 'lucide-react';
import { mockGetCurrentUser } from '@/lib/mock-api/auth';
import { User } from '@/lib/types';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await mockGetCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      setUser(currentUser);
      setIsLoading(false);
    };

    loadData();
  }, [router]);

  const handleUpgrade = () => {
    toast.info('La fonctionnalité de paiement sera bientôt disponible');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12 text-center">
            <Badge className="mb-4" variant="secondary">
              Abonnement
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 font-serif">
              Choisissez votre formule
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Débloquez tout votre potentiel avec l'abonnement Premium et accédez à tous les
              contenus éducatifs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
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
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {user?.subscription === 'free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Formule actuelle
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full">
                      Déjà inscrit
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full border-2 border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-500 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                  POPULAIRE
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl flex items-center">
                      <Crown className="h-6 w-6 mr-2 text-yellow-500" />
                      Premium
                    </CardTitle>
                    {user?.subscription === 'premium' && (
                      <Badge>Actuel</Badge>
                    )}
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
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
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

          <div className="max-w-5xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center font-serif">
              Pourquoi choisir Premium ?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
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
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="text-center h-full">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <Card className="max-w-5xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2 font-serif">
                Rejoignez des milliers d'élèves Premium
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Investissez dans votre éducation et donnez-vous les moyens de réussir
                brillamment vos études avec EduStat-RDC Premium
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
