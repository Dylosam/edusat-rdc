import { supabaseServer } from "./server";

// =========================
// SUBJECTS
// =========================

export async function getSubjects() {
  const { data, error } = await supabaseServer
    .from("subjects")
    .select(`
      *,
      chapters (
        id
      )
    `)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((subject: any) => ({
    ...subject,
    chaptersCount: Array.isArray(subject.chapters) ? subject.chapters.length : 0,
  }));
}

export async function getSubjectBySlug(slug: string) {
  const { data, error } = await supabaseServer
    .from("subjects")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getSubjectById(id: string) {
  const { data, error } = await supabaseServer
    .from("subjects")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

// =========================
// CHAPTERS
// =========================

export async function getChaptersBySubject(subjectId: string) {
  const { data, error } = await supabaseServer
    .from("chapters")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getChapterById(id: string) {
  const { data: chapter, error: chapterError } = await supabaseServer
    .from("chapters")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (chapterError) throw new Error(chapterError.message);
  if (!chapter) return null;

  let subject: any = null;

  if (chapter.subject_id) {
    const { data: subjectData, error: subjectError } = await supabaseServer
      .from("subjects")
      .select("id, slug, title")
      .eq("id", chapter.subject_id)
      .eq("is_published", true)
      .maybeSingle();

    if (subjectError) throw new Error(subjectError.message);
    subject = subjectData ?? null;
  }

  return {
    ...chapter,
    subjects: subject,
  };
}

// =========================
// LESSONS
// =========================

export async function getLessonsByChapter(chapterId: string) {
  const { data, error } = await supabaseServer
    .from("lessons")
    .select(`
      *,
      content_blocks:lesson_content_blocks (
        id,
        lesson_id,
        order_index,
        type,
        payload
      )
    `)
    .eq("chapter_id", chapterId)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);

  const normalized =
    data?.map((lesson) => ({
      ...lesson,
      content_blocks: Array.isArray(lesson.content_blocks)
        ? [...lesson.content_blocks].sort(
            (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
          )
        : [],
    })) ?? [];

  return normalized;
}

export async function getLessonById(id: string) {
  const { data, error } = await supabaseServer
    .from("lessons")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getLessonBlocks(lessonId: string) {
  const { data, error } = await supabaseServer
    .from("lesson_content_blocks")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// =========================
// QUIZZES
// =========================

export async function getQuizzesByChapterId(chapterId: string) {
  const { data, error } = await supabaseServer
    .from("quizzes")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQuizById(id: string) {
  const { data, error } = await supabaseServer
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getQuizQuestions(quizId: string) {
  const { data, error } = await supabaseServer
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQuizChoices(questionId: string) {
  const { data, error } = await supabaseServer
    .from("quiz_choices")
    .select("*")
    .eq("question_id", questionId)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFullQuizById(quizId: string) {
  const { data: quiz, error: quizError } = await supabaseServer
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .eq("is_published", true)
    .maybeSingle();

  if (quizError) throw new Error(quizError.message);
  if (!quiz) return null;

  const { data: questions, error: questionsError } = await supabaseServer
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true });

  if (questionsError) throw new Error(questionsError.message);

  const questionIds = (questions ?? []).map((q) => q.id);

  let choices: any[] = [];
  if (questionIds.length > 0) {
    const { data: choicesData, error: choicesError } = await supabaseServer
      .from("quiz_choices")
      .select("*")
      .in("question_id", questionIds)
      .order("order_index", { ascending: true });

    if (choicesError) throw new Error(choicesError.message);
    choices = choicesData ?? [];
  }

  const rebuiltQuestions = (questions ?? []).map((question) => {
    const relatedChoices = choices
      .filter((choice) => choice.question_id === question.id)
      .sort((a, b) => a.order_index - b.order_index);

    const options = relatedChoices.map((choice) => choice.label);
    const correctAnswer =
      typeof question.answer_index === "number"
        ? options[question.answer_index] ?? ""
        : "";

    return {
      id: question.id,
      question: question.question,
      explanation: question.explanation ?? "",
      type: "single_choice" as const,
      options,
      correctAnswer,
    };
  });

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description ?? "",
    chapterId: quiz.chapter_id,
    lessonId: quiz.lesson_id ?? null,
    isFinal: quiz.is_final ?? false,
    questions: rebuiltQuestions,
    shuffleQuestions: false,
    shuffleOptions: false,
    timeLimitSec: 0,
  };
}