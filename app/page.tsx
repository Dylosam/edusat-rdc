'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  TrendingUp,
  Award,
  Target,
  Users,
  BarChart3,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { getPublicPlatformSettings } from '@/lib/platform-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Cours structurés',
    description: 'Contenus pédagogiques organisés par niveau, matière et chapitre',
  },
  {
    icon: Target,
    title: 'Exercices pratiques',
    description: "Entraînez-vous avec des exercices adaptés à votre progression",
  },
  {
    icon: Award,
    title: 'Quiz de validation',
    description: 'Testez vos connaissances et validez votre maîtrise de chaque chapitre',
  },
  {
    icon: BarChart3,
    title: 'Suivi de progression',
    description: "Visualisez votre avancement et identifiez vos points d'amélioration",
  },
  {
    icon: TrendingUp,
    title: 'Méthode éprouvée',
    description: 'Une approche pédagogique basée sur la répétition et la validation',
  },
  {
    icon: Users,
    title: 'Conçu pour vous',
    description: 'Adapté au programme scolaire congolais et aux réalités locales',
  },
] as const;

const SUBJECTS = [
  'Analyse',
  'Algèbre',
  'Trigonométrie',
  'Géométrie',
  'Statistique',
  'Physique',
  'Chimie',
  'Biologie / Écologie',
  'Géographie économique',
] as const;

const STEPS = [
  {
    step: '1',
    title: 'Choisissez votre matière',
    description: 'Sélectionnez la matière que vous souhaitez étudier parmi notre catalogue',
  },
  {
    step: '2',
    title: 'Lisez le cours',
    description: 'Étudiez le contenu pédagogique de chaque chapitre à votre rythme',
  },
  {
    step: '3',
    title: 'Faites les exercices',
    description: 'Pratiquez avec des exercices pour consolider vos connaissances',
  },
  {
    step: '4',
    title: 'Passez le quiz',
    description: 'Validez votre maîtrise du chapitre avec un quiz de validation',
  },
] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
};

const fadeUpSoft: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.985 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export default async function LandingPage() {
  const settings = await getPublicPlatformSettings();
  const canRegister = settings.allow_registrations;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <GraduationCap className="h-8 w-8 shrink-0 text-primary" />
              <span className="truncate font-serif text-xl font-bold">
                {settings.platform_name}
              </span>
            </div>

            <nav className="hidden items-center gap-8 md:flex">
              <Link
                href="#features"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Fonctionnalités
              </Link>
              <Link
                href="#subjects"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Matières
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                À propos
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Se connecter
                </Button>
              </Link>

              {canRegister ? (
                <Link href="/auth/register">
                  <Button size="sm">Commencer</Button>
                </Link>
              ) : (
                <Button size="sm" disabled>
                  Inscriptions fermées
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {!canRegister && (
          <section className="border-b border-amber-500/20 bg-amber-500/10 py-3">
            <div className="container mx-auto px-4 text-center text-sm text-amber-700 dark:text-amber-300">
              Les inscriptions sont temporairement fermées. Pour toute demande, contacte-nous à{' '}
              <a
                href={`mailto:${settings.support_email}`}
                className="font-medium underline underline-offset-4"
              >
                {settings.support_email}
              </a>
              .
            </div>
          </section>
        )}

        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight sm:text-6xl">
                {settings.platform_name},{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {settings.platform_tagline}
                </span>
              </h1>

              <p className="mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Une plateforme éducative structurée pour les élèves congolais.
                Maîtrisez vos matières grâce à des cours structurés, des exercices pratiques
                et des quiz de validation.
              </p>

              <motion.div
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={fadeUpSoft}>
                  {canRegister ? (
                    <Link href="/auth/register">
                      <Button size="lg" className="px-8 text-base">
                        Commencer
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <Button size="lg" className="px-8 text-base" disabled>
                      Inscriptions fermées
                    </Button>
                  )}
                </motion.div>

                <motion.div variants={fadeUpSoft}>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="px-8 text-base">
                      J&apos;ai déjà un compte
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {!canRegister && (
                <motion.div
                  className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  variants={fadeUpSoft}
                  initial="hidden"
                  animate="visible"
                >
                  <Mail className="h-4 w-4" />
                  <span>Support : {settings.support_email}</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        <section id="features" className="bg-muted/30 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto mb-16 max-w-2xl text-center"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="mb-4 font-serif text-3xl font-bold sm:text-4xl">
                Une approche structurée de l&apos;apprentissage
              </h2>
              <p className="text-lg text-muted-foreground">
                Développez la discipline et la rigueur nécessaires pour exceller dans vos études
              </p>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
            >
              {FEATURES.map((feature) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeUpSoft}
                    className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                  >
                    <Icon className="mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section id="subjects" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto mb-16 max-w-2xl text-center"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="mb-4 font-serif text-3xl font-bold sm:text-4xl">
                Toutes vos matières en un seul endroit
              </h2>
              <p className="text-lg text-muted-foreground">
                Mathématiques, Sciences, et plus encore
              </p>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
            >
              {SUBJECTS.map((subject) => (
                <motion.div
                  key={subject}
                  variants={scaleIn}
                  className="rounded-lg border border-border bg-gradient-to-br from-card to-muted/30 p-6 text-center transition-colors hover:border-primary/50"
                >
                  <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-600" />
                  <h3 className="text-lg font-semibold">{subject}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="about" className="bg-muted/30 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <motion.div
                className="mb-12 text-center"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <h2 className="mb-4 font-serif text-3xl font-bold sm:text-4xl">
                  Comment ça marche ?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Un parcours d&apos;apprentissage simple et efficace
                </p>
              </motion.div>

              <motion.div
                className="space-y-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.12 }}
              >
                {STEPS.map((item) => (
                  <motion.div
                    key={item.step}
                    variants={fadeUpSoft}
                    className="flex items-start space-x-4"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              <h2 className="mb-6 font-serif text-3xl font-bold sm:text-4xl">
                Prêt à commencer votre parcours ?
              </h2>
              <p className="mb-10 text-lg text-muted-foreground">
                Rejoignez des milliers d&apos;élèves qui progressent chaque jour avec {settings.platform_name}
              </p>

              {canRegister ? (
                <Link href="/auth/register">
                  <Button size="lg" className="px-10 text-base">
                    Créer un compte
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="px-10 text-base" disabled>
                  Inscriptions fermées
                </Button>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-serif font-bold">{settings.platform_name}</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2026 {settings.platform_name}. Tous droits réservés.
              </p>
              <p className="text-xs text-muted-foreground">
                Contact : {settings.support_email}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}