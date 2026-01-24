'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { getQuiz, submitQuiz } from '@/lib/mock-api/data';
import { Quiz, QuizResult } from '@/lib/types';
import { toast } from 'sonner';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const chapterId = quizId.replace('quiz-', '');
      const quizData = await getQuiz(chapterId);
      setQuiz(quizData);
      setIsLoading(false);
    };

    loadData();
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerChange = (value: string | number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Il reste ${unanswered.length} question(s) sans réponse`);
      return;
    }

    const quizResult = await submitQuiz(quiz.id, answers);
    setResult(quizResult);
    setIsSubmitted(true);
    toast.success('Quiz soumis avec succès !');
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setResult(null);
  };

  if (isSubmitted && result) {
    const scorePercentage = (result.score / result.totalQuestions) * 100;
    const passed = scorePercentage >= 60;

    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4">
                  {passed ? (
                    <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-green-600" />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <RotateCcw className="h-10 w-10 text-yellow-600" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-3xl font-serif">
                  {passed ? 'Félicitations !' : 'Continuez vos efforts !'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-5xl font-bold mb-2">{scorePercentage.toFixed(0)}%</div>
                  <p className="text-muted-foreground">
                    {result.score} bonnes réponses sur {result.totalQuestions}
                  </p>
                </div>

                <div className="space-y-3">
                  {quiz.questions.map((question) => {
                    const userAnswer = String(answers[question.id]);
                    const correctAnswer = String(question.correctAnswer);
                    const isCorrect = userAnswer === correctAnswer;

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border ${
                          isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : 'border-red-500 bg-red-50 dark:bg-red-950'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm mb-1">{question.question}</p>
                            {!isCorrect && (
                              <p className="text-xs text-muted-foreground">
                                Votre réponse: {userAnswer} • Bonne réponse: {correctAnswer}
                              </p>
                            )}
                            {question.explanation && !isCorrect && (
                              <p className="text-xs mt-2 text-muted-foreground">
                                {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={handleRetake} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Refaire le quiz
                  </Button>
                  <Button onClick={() => router.back()}>
                    Retour au chapitre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Abandonner le quiz
          </Button>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">
                Question {currentQuestionIndex + 1} sur {totalQuestions}
              </h2>
              <span className="text-sm text-muted-foreground">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={progressPercentage} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                  {currentQuestion.latex && (
                    <div className="bg-muted p-4 rounded-lg mt-4 text-center font-mono text-lg">
                      {currentQuestion.latex}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentQuestion.type === 'mcq' && currentQuestion.options && (
                    <RadioGroup
                      value={String(answers[currentQuestion.id] || '')}
                      onValueChange={handleAnswerChange}
                    >
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                        >
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === 'numeric' && (
                    <div>
                      <Label htmlFor="numeric-answer" className="mb-2 block">
                        Votre réponse :
                      </Label>
                      <Input
                        id="numeric-answer"
                        type="number"
                        placeholder="Entrez votre réponse"
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(Number(e.target.value))}
                        className="text-lg"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button onClick={handleSubmit} size="lg">
                Soumettre le quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
