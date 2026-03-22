import { supabaseServer } from "@/lib/supabase/server";

export type AiTutorContextInput = {
  lessonId?: string | null;
  chapterId?: string | null;
  quizId?: string | null;
};

export type AiTutorResolvedContext = {
  lessonId: string | null;
  chapterId: string | null;
  quizId: string | null;
  lessonTitle: string | null;
  chapterTitle: string | null;
  quizTitle: string | null;
  lessonSummary: string | null;
  chapterSummary: string | null;
  quizSummary: string | null;
  lessonContentText: string | null;
};

function cleanText(value: unknown) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function truncateText(value: string | null, maxLength = 1800) {
  if (!value) return null;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}…`;
}

function extractLessonContentText(row: Record<string, unknown> | null | undefined) {
  if (!row) return null;

  const directFields = [
    "content",
    "body",
    "lesson_text",
    "content_text",
    "explanation",
    "description",
    "summary",
  ];

  for (const field of directFields) {
    const value = cleanText(row[field]);
    if (value) return truncateText(value, 2500);
  }

  const blocks = row["content_blocks"];

  if (Array.isArray(blocks)) {
    const parts: string[] = [];

    for (const block of blocks) {
      if (!block || typeof block !== "object") continue;
      const typedBlock = block as Record<string, unknown>;

      const title = cleanText(typedBlock.title);
      const value =
        cleanText(typedBlock.value) ||
        cleanText(typedBlock.content) ||
        cleanText(typedBlock.text);

      if (title) parts.push(title);
      if (value) parts.push(value);
    }

    const joined = cleanText(parts.join("\n"));
    return truncateText(joined, 2500);
  }

  return null;
}

async function fetchLessonById(lessonId: string) {
  const { data, error } = await supabaseServer
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) {
    console.error("[AI_CONTEXT_LESSON_ERROR]", error);
    return null;
  }

  return data;
}

async function fetchChapterById(chapterId: string) {
  const { data, error } = await supabaseServer
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .maybeSingle();

  if (error) {
    console.error("[AI_CONTEXT_CHAPTER_ERROR]", error);
    return null;
  }

  return data;
}

async function fetchQuizById(quizId: string) {
  const { data, error } = await supabaseServer
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .maybeSingle();

  if (error) {
    console.error("[AI_CONTEXT_QUIZ_ERROR]", error);
    return null;
  }

  return data;
}

export async function resolveAiTutorContext(
  input: AiTutorContextInput
): Promise<AiTutorResolvedContext> {
  const lessonId = input.lessonId ?? null;
  const chapterId = input.chapterId ?? null;
  const quizId = input.quizId ?? null;

  const [lessonRow, chapterRow, quizRow] = await Promise.all([
    lessonId ? fetchLessonById(lessonId) : Promise.resolve(null),
    chapterId ? fetchChapterById(chapterId) : Promise.resolve(null),
    quizId ? fetchQuizById(quizId) : Promise.resolve(null),
  ]);

  const lessonTitle =
    cleanText(lessonRow?.title) ||
    cleanText(lessonRow?.name) ||
    cleanText(lessonRow?.label) ||
    null;

  const chapterTitle =
    cleanText(chapterRow?.title) ||
    cleanText(chapterRow?.name) ||
    cleanText(chapterRow?.label) ||
    null;

  const quizTitle =
    cleanText(quizRow?.title) ||
    cleanText(quizRow?.name) ||
    cleanText(quizRow?.label) ||
    null;

  const lessonSummary =
    cleanText(lessonRow?.summary) ||
    cleanText(lessonRow?.description) ||
    null;

  const chapterSummary =
    cleanText(chapterRow?.summary) ||
    cleanText(chapterRow?.description) ||
    null;

  const quizSummary =
    cleanText(quizRow?.description) ||
    cleanText(quizRow?.summary) ||
    null;

  const lessonContentText = extractLessonContentText(lessonRow);

  return {
    lessonId,
    chapterId,
    quizId,
    lessonTitle,
    chapterTitle,
    quizTitle,
    lessonSummary: truncateText(lessonSummary, 700),
    chapterSummary: truncateText(chapterSummary, 700),
    quizSummary: truncateText(quizSummary, 700),
    lessonContentText,
  };
}