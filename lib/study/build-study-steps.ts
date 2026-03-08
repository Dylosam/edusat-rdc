import type { StudyStep } from "@/lib/study/type";
import { getLessonsByChapterId } from "@/lib/data/lessons";
import { findQuizByChapterId } from "@/lib/study/quiz-link";

function extractPreviewFromContent(content: any): string {
  if (!Array.isArray(content)) return "";

  const textBlock = content.find(
    (block) => block?.type === "text" && typeof block?.value === "string"
  );

  if (!textBlock?.value) return "";

  const clean = String(textBlock.value).trim();
  return clean.length > 140 ? `${clean.slice(0, 140)}...` : clean;
}

function extractKatexPreview(content: any): string | undefined {
  if (!Array.isArray(content)) return undefined;

  const formulaBlock = content.find(
    (block) => block?.type === "formula" && typeof block?.value === "string"
  );

  return formulaBlock?.value;
}

export function buildStudySteps(chapterId: string): StudyStep[] {
  const lessons = getLessonsByChapterId(chapterId);

  const lessonSteps: StudyStep[] = lessons.map((lesson: any, idx: number) => ({
    id: `lesson:${lesson.id}`,
    kind: "lesson",
    kindLabel: "Leçon",
    title: `${idx + 1}. ${lesson.title ?? "Leçon"}`,
    subtitle: lesson.summary ?? "Lecture guidée",
    minutes:
      typeof lesson.durationMin === "number"
        ? lesson.durationMin
        : typeof lesson.minutes === "number"
        ? lesson.minutes
        : 10,
    katexPreview: extractKatexPreview(lesson.content),
    body: extractPreviewFromContent(lesson.content),
    href: `/lessons/${lesson.id}`,
  }));

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
            body: "Deux questions pour identifier ton point faible. Ensuite tu choisis librement quoi réviser.",
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
          href: `/quiz/${quiz.id}?fresh=1`,
          body: "Le quiz sert à repérer tes erreurs et guider ta révision.",
        },
      ]
    : [];

  return [...lessonSteps, ...diagnostic, ...summary, ...quizStep];
}