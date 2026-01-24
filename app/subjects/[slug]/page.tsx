'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { getSubjectBySlug, getChaptersBySubject } from '@/lib/mock-api/data';
import { Subject, Chapter } from '@/lib/types';

export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const subjectData = await getSubjectBySlug(slug);
      if (!subjectData) {
        router.push('/subjects');
        return;
      }
      setSubject(subjectData);

      const chaptersData = await getChaptersBySubject(subjectData.id);
      setChapters(chaptersData);
      setIsLoading(false);
    };

    loadData();
  }, [slug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subject) {
    return null;
  }

  const completedChapters = chapters.filter((c) => c.status === 'completed').length;

  const getStatusIcon = (status: Chapter['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Chapter['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Terminé</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-600">En cours</Badge>;
      default:
        return <Badge variant="secondary">Non commencé</Badge>;
    }
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
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 font-serif">
              {subject.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">{subject.description}</p>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chapitres</p>
                      <p className="text-2xl font-bold">{chapters.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Terminés</p>
                      <p className="text-2xl font-bold">{completedChapters}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Progression</p>
                      <p className="text-2xl font-bold">{subject.progress}%</p>
                    </div>
                    <div className="h-8 w-8">
                      <Progress value={subject.progress} className="h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold font-serif">Chapitres</h2>
          </div>

          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        {getStatusIcon(chapter.status)}
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            Chapitre {chapter.order}: {chapter.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {chapter.estimatedTime} min
                            </div>
                            {getStatusBadge(chapter.status)}
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
                      {chapter.hasExercises && (
                        <Link href={`/chapters/${chapter.id}?tab=exercises`}>
                          <Button variant="outline" size="sm">
                            <PenTool className="mr-2 h-4 w-4" />
                            Exercices
                          </Button>
                        </Link>
                      )}
                      {chapter.hasQuiz && (
                        <Link href={`/chapters/${chapter.id}?tab=quiz`}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={chapter.status === 'not-started'}
                          >
                            <Brain className="mr-2 h-4 w-4" />
                            Quiz
                          </Button>
                        </Link>
                      )}
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
