'use client';

import { supabaseBrowser } from '@/lib/supabase/client';

export async function getSubjects() {
  const { data, error } = await supabaseBrowser
    .from('subjects')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('[supabase][client] getSubjects error:', error);
    return [];
  }

  return data ?? [];
}

export async function getSubjectBySlug(slug: string) {
  const { data, error } = await supabaseBrowser
    .from('subjects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('[supabase][client] getSubjectBySlug error:', error);
    return null;
  }

  return data;
}

export async function getChaptersBySubjectId(subjectId: string) {
  const { data, error } = await supabaseBrowser
    .from('chapters')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('[supabase][client] getChaptersBySubjectId error:', error);
    return [];
  }

  return data ?? [];
}

export async function getChaptersBySubject(subjectId: string) {
  return getChaptersBySubjectId(subjectId);
}

export async function getChapterById(chapterId: string) {
  const { data, error } = await supabaseBrowser
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .single();

  if (error) {
    console.error('[supabase][client] getChapterById error:', error);
    return null;
  }

  return data;
}

export async function getLessonsByChapterId(chapterId: string) {
  const { data, error } = await supabaseBrowser
    .from('lessons')
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
    .eq('chapter_id', chapterId)
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('[supabase][client] getLessonsByChapterId error:', error);
    return [];
  }

  return (data ?? []).map((lesson) => ({
    ...lesson,
    content_blocks: Array.isArray(lesson.content_blocks)
      ? [...lesson.content_blocks].sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
        )
      : [],
  }));
}

export async function getLessonsByChapter(chapterId: string) {
  return getLessonsByChapterId(chapterId);
}

export async function getLessonById(lessonId: string) {
  const { data, error } = await supabaseBrowser
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) {
    console.error('[supabase][client] getLessonById error:', error);
    return null;
  }

  return data;
}

export async function getLessonBlocks(lessonId: string) {
  const { data, error } = await supabaseBrowser
    .from('lesson_content_blocks')
    .select(`
      id,
      lesson_id,
      order_index,
      type,
      payload
    `)
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('[supabase][client] getLessonBlocks error:', error);
    return [];
  }

  return data ?? [];
}

export async function getQuizzesByChapterId(chapterId: string) {
  const { data, error } = await supabaseBrowser
    .from('quizzes')
    .select('*')
    .eq('chapter_id', chapterId)
    .eq('is_published', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[supabase][client] getQuizzesByChapterId error:', error);
    return [];
  }

  return data ?? [];
}

export async function getQuizById(quizId: string) {
  const { data, error } = await supabaseBrowser
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (error) {
    console.error('[supabase][client] getQuizById error:', error);
    return null;
  }

  return data;
}