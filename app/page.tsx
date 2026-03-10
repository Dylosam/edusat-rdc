'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
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
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Cours structurés',
    description: 'Contenus pédagogiques organisés par niveau, matière et chapitre',
  },
  {
    icon: Target,
    title: 'Exercices pratiques',
    description: 'Entraînez-vous avec des exercices adaptés à votre progression',
  },
  {
    icon: Award,
    title: 'Quiz de validation',
    description: 'Testez vos connaissances et validez votre maîtrise de chaque chapitre',
  },
  {
    icon: BarChart3,
    title: 'Suivi de progression',
    description: 'Visualisez votre avancement et identifiez vos points d’amélioration',
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
];

const subjects = [
  'Analyse',
  'Algèbre',
  'Trigonométrie',
  'Géométrie',
  'Statistique',
  'Physique',
  'Chimie',
  'Biologie / Écologie',
  'Géographie économique',
];

const steps = [
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
];

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
};

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-serif">EduStat-RDC</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Fonctionnalités
              </Link>
              <Link
                href="#subjects"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Matières
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                À propos
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Commencer</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.10),transparent_30%)]" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="space-y-6">
                <motion.h1
                  initial={prefersReducedMotion ? false : 'hidden'}
                  animate={prefersReducedMotion ? 'visible' : 'visible'}
                  variants={fadeUpVariants}
                  transition={{ duration: 0.4 }}
                  className="text-4xl font-bold tracking-tight sm:text-6xl font-serif"
                >
                  Réussir l&apos;école avec{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    méthode, discipline
                  </span>{' '}
                  et intelligence
                </motion.h1>

                <motion.p
                  initial={prefersReducedMotion ? false : 'hidden'}
                  animate={prefersReducedMotion ? 'visible' : 'visible'}
                  variants={fadeUpVariants}
                  transition={{ duration: 0.45, delay: 0.05 }}
                  className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
                >
                  Une plateforme éducative structurée pour les élèves congolais.
                  Maîtrisez vos matières grâce à des cours structurés, des exercices pratiques
                  et des quiz de validation.
                </motion.p>

                <motion.div
                  initial={prefersReducedMotion ? false : 'hidden'}
                  animate={prefersReducedMotion ? 'visible' : 'visible'}
                  variants={fadeUpVariants}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link href="/auth/register">
                    <Button size="lg" className="text-base px-8">
                      Commencer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="text-base px-8">
                      J&apos;ai déjà un compte
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUpVariants}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-2xl text-center mb-16"
            >
              <h2 className="text-3xl font-bold sm:text-4xl mb-4 font-serif">
                Une approche structurée de l&apos;apprentissage
              </h2>
              <p className="text-lg text-muted-foreground">
                Développez la discipline et la rigueur nécessaires pour exceller dans vos études
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={prefersReducedMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.12 }}
                  variants={fadeUpVariants}
                  transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : index * 0.04 }}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="subjects" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUpVariants}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-2xl text-center mb-16"
            >
              <h2 className="text-3xl font-bold sm:text-4xl mb-4 font-serif">
                Toutes vos matières en un seul endroit
              </h2>
              <p className="text-lg text-muted-foreground">
                Mathématiques, Sciences, et plus encore
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject}
                  initial={prefersReducedMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={fadeUpVariants}
                  transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : index * 0.03 }}
                  className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
                >
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">{subject}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <motion.div
                initial={prefersReducedMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={fadeUpVariants}
                transition={{ duration: 0.45 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold sm:text-4xl mb-4 font-serif">
                  Comment ça marche ?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Un parcours d&apos;apprentissage simple et efficace
                </p>
              </motion.div>

              <div className="space-y-8">
                {steps.map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={prefersReducedMotion ? false : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={fadeLeftVariants}
                    transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : index * 0.04 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeLeftVariants}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="text-3xl font-bold sm:text-4xl mb-6 font-serif">
                Prêt à commencer votre parcours ?
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Rejoignez des milliers d&apos;élèves qui progressent chaque jour avec EduStat-RDC
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="text-base px-10">
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold font-serif">EduStat-RDC</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 EduStat-RDC. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}