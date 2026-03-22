"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

type AskAiButtonProps = {
  subject: "math" | "physics" | "chemistry" | "biology";
  lessonId?: string | null;
  chapterId?: string | null;
  quizId?: string | null;
  label?: string;
  className?: string;
};

export default function AskAiButton({
  subject,
  lessonId,
  chapterId,
  quizId,
  label = "Demander à l’IA",
  className = "",
}: AskAiButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams();
    params.set("subject", subject);

    if (lessonId) params.set("lessonId", lessonId);
    if (chapterId) params.set("chapterId", chapterId);
    if (quizId) params.set("quizId", quizId);

    router.push(`/ai?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 ${className}`}
    >
      <Sparkles className="h-4 w-4" />
      {label}
    </button>
  );
}