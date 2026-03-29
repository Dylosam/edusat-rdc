import type { StudyStep } from "@/lib/study/type";

export function buildStudySteps(
  chapterId: string,
  lessons: any[] = [],
  quizzes: any[] = []
): StudyStep[] {
  const lessonSteps: StudyStep[] = lessons.map((lesson: any, idx: number) => ({
    id: `lesson:${lesson.id}`,
    kind: "lesson",
    kindLabel: "Leçon",
    title: `${idx + 1}. ${lesson.title ?? "Leçon"}`,
    subtitle: lesson.summary ?? "Lecture guidée",
    minutes: lesson.minutes ?? 10,
    href: `/lessons/${lesson.id}`,
  }));

  const summary: StudyStep[] = [
    {
      id: `summary:${chapterId}`,
      kind: "summary",
      kindLabel: "Résumé",
      title: "Résumé & points clés",
      subtitle: "Ce que tu dois retenir",
      minutes: 2,
    },
  ];

  const quizSteps: StudyStep[] = quizzes.map((quiz: any, idx: number) => ({
    id: `quiz:${quiz.id}`,
    kind: "quiz",
    kindLabel: quiz.is_final ? "Quiz final" : "Quiz",
    title: quiz.title ?? `Quiz ${idx + 1}`,
    minutes: 8,
    href: `/quiz/${quiz.id}`,
  }));

  return [...lessonSteps, ...summary, ...quizSteps];
}