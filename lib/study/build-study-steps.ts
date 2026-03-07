import type { StudyStep } from "@/lib/study/type";
import { getLessonsByChapterId } from "@/lib/data/lessons";
import { findQuizByChapterId } from "@/lib/study/quiz-link";

export function buildStudySteps(chapterId: string): StudyStep[] {
  const lessons = getLessonsByChapterId(chapterId);

  const lessonSteps: StudyStep[] = lessons.map((l: any, idx: number) => ({
    id: `lesson:${l.id}`,
    kind: "lesson",
    kindLabel: "Leçon",
    title: `${idx + 1}. ${l.title ?? "Leçon"}`,
    subtitle: l.subtitle ?? "Lecture guidée",
    minutes: typeof l.minutes === "number" ? l.minutes : 10,
    katexPreview: l.katexPreview,
    body: l.preview,
  }));

  // ✅ On garde kind = "checkpoint" (déjà dans StudyStepKind)
  // mais on l'affiche comme "Diagnostic"
  const diagnostic: StudyStep[] =
    lessons.length >= 2
      ? [
          {
            id: `checkpoint:${chapterId}:1`,
            kind: "checkpoint",
            kindLabel: "Diagnostic",
            title: "Diagnostic rapide (2 questions)",
            subtitle: "Repère vite ce qui te bloque.",
            minutes: 3,
            body: "Deux questions pour identifier ton point faible. Ensuite tu choisis librement quoi réviser (pas de verrouillage).",
          },
        ]
      : [];

  const summary: StudyStep[] = [
    {
      id: `summary:${chapterId}`,
      kind: "summary",
      kindLabel: "Résumé",
      title: "Résumé & points clés",
      subtitle: "Ce que tu dois retenir + erreurs fréquentes.",
      minutes: 2,
      body: "On récapitule l’essentiel et on te donne les pièges à éviter.",
    },
  ];

  const quiz = findQuizByChapterId(chapterId);
  const quizStep: StudyStep[] = quiz
    ? [
        {
          id: `quiz:${quiz.id}`,
          kind: "quiz",
          kindLabel: "Quiz",
          title: "Quiz (diagnostic de maîtrise)",
          subtitle: "Mesure ton niveau et consolide tes faiblesses.",
          minutes: 8,
          href: `/quiz/${quiz.id}`,
          body: "Le quiz sert à repérer tes erreurs et guider ta révision. Pas de verrouillage.",
        },
      ]
    : [];

  // ✅ quiz à la fin
  return [...lessonSteps, ...diagnostic, ...summary, ...quizStep];
}