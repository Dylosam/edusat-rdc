import { mockQuizzes } from "@/lib/mock-api/quizzes";

export function findQuizByChapterId(chapterId: string) {
  return mockQuizzes.find((q: any) => q.chapterId === chapterId) ?? null;
}