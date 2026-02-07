'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Brain,
  CheckCircle, // ✅ icône validation (cercle + check)
} from 'lucide-react';

import { Latex } from '@/components/math/latex';
import { toast } from 'sonner';

import { getLessonById, getPrevNextLesson } from '@/lib/data/lessons';
import { isLessonCompleted, toggleLessonCompleted } from '@/lib/progress';

function ContentBlock({ block }: { block: any }) {
  if (block.type === 'text') {
    return <p className="text-muted-foreground leading-relaxed">{block.value}</p>;
  }

  if (block.type === 'tip') {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 flex gap-3">
        <div className="mt-0.5">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm leading-relaxed">
          <span className="font-semibold">Astuce :</span> {block.value}
        </p>
      </div>
    );
  }

  if (block.type === 'example') {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <p className="font-semibold">{block.title || 'Exemple'}</p>
        </div>
        <p className="text-muted-foreground leading-relaxed">{block.value}</p>
      </div>
    );
  }

  if (block.type === 'formula') {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 overflow-x-auto">
        <div className="text-sm text-muted-foreground mb-2">Formule</div>
        <Latex latex={block.value} />
      </div>
    );
  }

  return null;
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.id as string;

  const lesson = useMemo(() => getLessonById(lessonId), [lessonId]);

  const nav = useMemo(() => {
    if (!lesson) return { prev: null, next: null, index: 0, total: 0 };
    return getPrevNextLesson(lesson.chapterId, lesson.id);
  }, [lesson]);

  // ✅ anti-hydration mismatch: localStorage uniquement après mount
  const [mounted, setMounted] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!lesson) return;
    setCompleted(isLessonCompleted(lesson.chapterId, lesson.id));
  }, [lesson]);

  useEffect(() => {
    const handler = () => {
      if (!lesson) return;
      setCompleted(isLessonCompleted(lesson.chapterId, lesson.id));
    };

    window.addEventListener('edustat_progress_updated', handler);
    return () => window.removeEventListener('edustat_progress_updated', handler);
  }, [lesson]);

  const onToggleComplete = () => {
    if (!lesson) return;
    const nowCompleted = toggleLessonCompleted(lesson.chapterId, lesson.id);
    setCompleted(nowCompleted);
    toast(nowCompleted ? 'Leçon marquée comme terminée ✅' : 'Leçon remise en cours ↩️');
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Card>
            <CardHeader>
              <CardTitle>Leçon introuvable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Cette leçon n’existe pas (ou son identifiant est incorrect).
              </p>
              <Button asChild>
                <Link href="/subjects">Retour aux matières</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-4xl"
        >
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">Leçon</Badge>

              <Badge variant="outline">
                {nav.total > 0 ? `Leçon ${nav.index}/${nav.total}` : 'Leçon'}
              </Badge>

              {lesson.durationMin ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {lesson.durationMin} min
                </Badge>
              ) : null}

              {lesson.isPremium ? <Badge>Premium</Badge> : null}

              {mounted && completed ? (
                <Badge className="flex items-center gap-1 bg-green-600 text-white">
                  <CheckCircle className="h-4 w-4" />
                  Terminée
                </Badge>
              ) : null}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-serif">
              {lesson.title}
            </h1>

            {lesson.summary ? <p className="text-muted-foreground">{lesson.summary}</p> : null}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contenu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lesson.content.map((block: any, i: number) => (
                <ContentBlock key={i} block={block} />
              ))}
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onToggleComplete}
                variant={mounted && completed ? 'secondary' : 'default'}
                className="w-full sm:w-auto"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {mounted && completed ? 'Marquée terminée (annuler)' : 'Marquer comme terminé'}
              </Button>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={`/chapters/${lesson.chapterId}?tab=course`}>Revenir au chapitre</Link>
              </Button>

              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href={`/quiz/${lesson.id}`}>
                  <Brain className="mr-2 h-4 w-4" />
                  Faire le quiz de la leçon
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div>
                {nav.prev ? (
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={`/lessons/${nav.prev.id}`}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Leçon précédente
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full sm:w-auto" disabled>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Leçon précédente
                  </Button>
                )}
              </div>

              <div>
                {nav.next ? (
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/lessons/${nav.next.id}`}>
                      Leçon suivante
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full sm:w-auto" disabled>
                    Fin des leçons
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/subjects">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Retour aux matières
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
