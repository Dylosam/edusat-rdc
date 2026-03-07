'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  FileText,
  PenTool,
  Brain,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

import { getSubjectBySlug, getChaptersBySubject } from '@/lib/mock-api/data';

// ✅ source des résultats quiz (progress store)
import { readProgressStore } from '@/lib/progress/index';
// ✅ relier chapitre -> quiz
import { findQuizByChapterId } from '@/lib/study/quiz-link';

type SubjectVM = {
  id: string;
  name: string;
  description?: string;
  progress: number;
};

type ChapterVM = {
  id: string;
  order: number;
  title: string;
  estimatedTime: number;
  hasExercises: boolean;
  hasQuiz: boolean;
};

const PASS_PERCENT = 70;

type Strength = 'weak' | 'ok' | 'strong' | 'unknown';

function strengthFromPercent(pct: number | null): Strength {
  if (pct === null || Number.isNaN(pct)) return 'unknown';
  if (pct < 50) return 'weak';
  if (pct < PASS_PERCENT) return 'ok';
  return 'strong';
}

function strengthLabel(s: Strength) {
  switch (s) {
    case 'weak':
      return 'Faible';
    case 'ok':
      return 'OK';
    case 'strong':
      return 'Fort';
    default:
      return '—';
  }
}

function strengthBadge(s: Strength) {
  switch (s) {
    case 'weak':
      return (
        <Badge className="bg-red-600">
          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
          Faible
        </Badge>
      );
    case 'ok':
      return (
        <Badge className="bg-yellow-600 text-black">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          OK
        </Badge>
      );
    case 'strong':
      return (
        <Badge className="bg-green-600">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Fort
        </Badge>
      );
    default:
      return <Badge variant="secondary">Pas encore évalué</Badge>;
  }
}

function statusIconFromStrength(s: Strength) {
  switch (s) {
    case 'strong':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'ok':
      return <PlayCircle className="h-5 w-5 text-blue-600" />;
    case 'weak':
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  // ✅ on stocke le RAW (mock-api) pour éviter le conflit de types
  const [subjectRaw, setSubjectRaw] = useState<any>(null);
  const [chaptersRaw, setChaptersRaw] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ tri faibles d’abord (par défaut)
  const [weakFirst, setWeakFirst] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const subjectData = await getSubjectBySlug(slug);
      if (!subjectData) {
        router.push('/subjects');
        return;
      }
      setSubjectRaw(subjectData);

      const chaptersData = await getChaptersBySubject((subjectData as any).id);
      setChaptersRaw(chaptersData ?? []);

      setIsLoading(false);
    };

    loadData();
  }, [slug, router]);

  // ✅ adapter Subject -> SubjectVM (UI stable)
  const subject: SubjectVM | null = useMemo(() => {
    if (!subjectRaw) return null;

    return {
      id: String(subjectRaw.id),
      name: String(subjectRaw.name ?? subjectRaw.title ?? subjectRaw.label ?? 'Matière'),
      description: subjectRaw.description ?? subjectRaw.desc ?? '',
      progress: Number(subjectRaw.progress ?? 0),
    };
  }, [subjectRaw]);

  // ✅ adapter Chapter -> ChapterVM (UI stable)
  const chapters: ChapterVM[] = useMemo(() => {
    return (chaptersRaw ?? []).map((c: any, idx: number) => ({
      id: String(c.id),
      order: Number(c.order ?? c.position ?? idx + 1),
      title: String(c.title ?? c.name ?? `Chapitre ${idx + 1}`),
      estimatedTime: Number(c.estimatedTime ?? c.minutes ?? c.duration ?? 10),
      hasExercises: Boolean(c.hasExercises ?? c.hasExercise ?? c.exercises?.length),
      hasQuiz: Boolean(c.hasQuiz ?? c.quizId ?? c.quiz?.id ?? findQuizByChapterId(String(c.id))?.id),
    }));
  }, [chaptersRaw]);

  // ✅ lecture store progress (quiz results)
  const quizResultsByQuizId = useMemo(() => {
    const store = readProgressStore();
    return store.quizResults ?? {};
  }, []);

  // ✅ enrichir chaque chapitre avec score quiz (si existe)
  const enriched = useMemo(() => {
    return chapters.map((chapter) => {
      const quiz = findQuizByChapterId(chapter.id);
      const quizId = quiz?.id ? String(quiz.id) : null;

      const rawResult = quizId ? (quizResultsByQuizId as any)[quizId] : null;
      const percent =
        rawResult && typeof rawResult.percentage === 'number'
          ? Math.round(rawResult.percentage)
          : null;

      const passed = percent !== null ? percent >= PASS_PERCENT : false;
      const strength = strengthFromPercent(percent);

      return {
        chapter,
        quizId,
        percent,
        passed,
        strength,
      };
    });
  }, [chapters, quizResultsByQuizId]);

  // ✅ stats sujet : basées sur quiz (pas de lock)
  const stats = useMemo(() => {
    const total = enriched.length;

    const evaluated = enriched.filter((x) => x.percent !== null).length;
    const weak = enriched.filter((x) => x.strength === 'weak').length;
    const ok = enriched.filter((x) => x.strength === 'ok').length;
    const strong = enriched.filter((x) => x.strength === 'strong').length;

    const completed = enriched.filter((x) => {
      if (!x.chapter.hasQuiz) return false;
      return x.passed;
    }).length;

    const avg =
      total > 0
        ? Math.round(enriched.reduce((acc, x) => acc + (x.percent ?? 0), 0) / total)
        : 0;

    return { total, evaluated, weak, ok, strong, completed, avg };
  }, [enriched]);

  const sorted = useMemo(() => {
    const arr = [...enriched];

    if (!weakFirst) {
      arr.sort((a, b) => (a.chapter.order ?? 0) - (b.chapter.order ?? 0));
      return arr;
    }

    const rank = (s: Strength) => {
      if (s === 'weak') return 0;
      if (s === 'ok') return 1;
      if (s === 'unknown') return 2;
      return 3;
    };

    arr.sort((a, b) => {
      const ra = rank(a.strength);
      const rb = rank(b.strength);
      if (ra !== rb) return ra - rb;

      const pa = a.percent ?? 999;
      const pb = b.percent ?? 999;
      if (pa !== pb) return pa - pb;

      return (a.chapter.order ?? 0) - (b.chapter.order ?? 0);
    });

    return arr;
  }, [enriched, weakFirst]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 font-serif">
              {subject.name}
            </h1>
            {subject.description ? (
              <p className="text-lg text-muted-foreground mb-6">{subject.description}</p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chapitres</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Évalués (quiz)</p>
                      <p className="text-2xl font-bold">{stats.evaluated}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Faible: {stats.weak} • OK: {stats.ok} • Fort: {stats.strong}
                      </p>
                    </div>
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Indice global</p>
                      <p className="text-2xl font-bold">{stats.avg}%</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Basé sur les derniers scores quiz
                      </p>
                    </div>
                    <div className="h-8 w-8">
                      <Progress value={stats.avg} className="h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Objectif : consolider tes points faibles. Tout est accessible.
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={weakFirst ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWeakFirst(true)}
                >
                  Faibles d’abord
                </Button>
                <Button
                  variant={!weakFirst ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWeakFirst(false)}
                >
                  Ordre normal
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold font-serif">Chapitres</h2>
          </div>

          <div className="space-y-4">
            {sorted.map(({ chapter, percent, strength }, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        {statusIconFromStrength(strength)}
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            Chapitre {chapter.order}: {chapter.title}
                          </CardTitle>

                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {chapter.estimatedTime} min
                            </div>

                            {strengthBadge(strength)}

                            {percent !== null ? (
                              <Badge variant="outline">
                                Score: {percent}% ({strengthLabel(strength)})
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/chapters/${chapter.id}`}>
                        <Button variant="default" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Lire le cours
                        </Button>
                      </Link>

                      {chapter.hasExercises ? (
                        <Link href={`/chapters/${chapter.id}?tab=exercises`}>
                          <Button variant="outline" size="sm">
                            <PenTool className="mr-2 h-4 w-4" />
                            Exercices
                          </Button>
                        </Link>
                      ) : null}

                      {chapter.hasQuiz ? (
                        <Link href={`/chapters/${chapter.id}?tab=quiz`}>
                          <Button variant="outline" size="sm">
                            <Brain className="mr-2 h-4 w-4" />
                            Quiz
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}