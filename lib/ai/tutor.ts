import {
  buildAiTutorSystemPrompt,
  type AiTutorLevel,
  type AiTutorSubject,
} from "./system-prompt";
import { resolveAiTutorContext } from "./context";
import { generateAiText } from "./provider";
import { buildAiTutorUserPrompt } from "./user-prompt";

export type AiTutorInput = {
  subject: AiTutorSubject;
  question: string;
  level: AiTutorLevel;
  lessonId?: string | null;
  chapterId?: string | null;
  quizId?: string | null;
  lessonTitle?: string | null;
  chapterTitle?: string | null;
  quizTitle?: string | null;
};

export type AiTutorOutput = {
  answer: string;
  meta: {
    provider: "llm" | "fallback-local";
    subject: AiTutorSubject;
    level: AiTutorLevel;
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
    systemPrompt: string;
  };
};

function normalizeQuestion(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getSubjectLabel(subject: AiTutorSubject) {
  switch (subject) {
    case "math":
      return "Mathématiques";
    case "physics":
      return "Physique";
    case "chemistry":
      return "Chimie";
    case "biology":
      return "Biologie";
  }
}

function getLevelLabel(level: AiTutorLevel) {
  switch (level) {
    case "simple":
      return "Explique simplement";
    case "step_by_step":
      return "Étape par étape";
    case "short":
      return "Réponse courte";
  }
}

function buildEduStatContextLines(params: {
  lessonId?: string | null;
  chapterId?: string | null;
  quizId?: string | null;
  lessonTitle?: string | null;
  chapterTitle?: string | null;
  quizTitle?: string | null;
  lessonSummary?: string | null;
  chapterSummary?: string | null;
  quizSummary?: string | null;
  lessonContentText?: string | null;
}) {
  const parts: string[] = [];

  if (params.chapterTitle || params.chapterId) {
    parts.push(
      `- Chapitre : ${params.chapterTitle || "Titre indisponible"}${
        params.chapterId ? ` (${params.chapterId})` : ""
      }`
    );
  }

  if (params.chapterSummary) {
    parts.push(`- Résumé du chapitre : ${params.chapterSummary}`);
  }

  if (params.lessonTitle || params.lessonId) {
    parts.push(
      `- Leçon : ${params.lessonTitle || "Titre indisponible"}${
        params.lessonId ? ` (${params.lessonId})` : ""
      }`
    );
  }

  if (params.lessonSummary) {
    parts.push(`- Résumé de la leçon : ${params.lessonSummary}`);
  }

  if (params.lessonContentText) {
    parts.push(`- Extrait utile de la leçon : ${params.lessonContentText}`);
  }

  if (params.quizTitle || params.quizId) {
    parts.push(
      `- Quiz : ${params.quizTitle || "Titre indisponible"}${
        params.quizId ? ` (${params.quizId})` : ""
      }`
    );
  }

  if (params.quizSummary) {
    parts.push(`- Résumé du quiz : ${params.quizSummary}`);
  }

  return parts;
}

function buildFallbackAnswer(input: AiTutorInput, contextLines: string[]) {
  const subjectLabel = getSubjectLabel(input.subject);
  const levelLabel = getLevelLabel(input.level);

  return [
    `Matière : ${subjectLabel}`,
    `Mode : ${levelLabel}`,
    "",
    "1. Réponse directe",
    `J’ai bien reçu ta question : "${input.question}".`,
    "",
    "2. Explication simple",
    "Le moteur IA réel n’a pas pu répondre cette fois. La plateforme bascule donc sur un mode de secours.",
    "",
    "3. Étapes ou raisonnement",
    "- La question a bien été reçue.",
    "- Le contexte EduStat a été analysé.",
    "- L’appel au modèle a échoué ou n’était pas configuré.",
    "",
    "4. Exemple",
    "Dès que la clé API et le provider seront actifs, cette section sera produite par le modèle.",
    "",
    "5. À retenir",
    contextLines.length > 0
      ? `Contexte récupéré :\n${contextLines.join("\n")}`
      : "Aucun contexte Supabase précis n’a été trouvé.",
  ].join("\n");
}

function sanitizeAnswer(text: string) {
  return text.trim();
}

export async function runAiTutor(input: AiTutorInput): Promise<AiTutorOutput> {
  const normalizedQuestion = normalizeQuestion(input.question);

  const resolvedContext = await resolveAiTutorContext({
    lessonId: input.lessonId ?? null,
    chapterId: input.chapterId ?? null,
    quizId: input.quizId ?? null,
  });

  const lessonTitle = input.lessonTitle ?? resolvedContext.lessonTitle;
  const chapterTitle = input.chapterTitle ?? resolvedContext.chapterTitle;
  const quizTitle = input.quizTitle ?? resolvedContext.quizTitle;

  const systemPrompt = buildAiTutorSystemPrompt({
    subject: input.subject,
    level: input.level,
    lessonTitle,
    chapterTitle,
    quizTitle,
  });

  const contextLines = buildEduStatContextLines({
    lessonId: resolvedContext.lessonId,
    chapterId: resolvedContext.chapterId,
    quizId: resolvedContext.quizId,
    lessonTitle,
    chapterTitle,
    quizTitle,
    lessonSummary: resolvedContext.lessonSummary,
    chapterSummary: resolvedContext.chapterSummary,
    quizSummary: resolvedContext.quizSummary,
    lessonContentText: resolvedContext.lessonContentText,
  });

  const userPrompt = buildAiTutorUserPrompt({
    question: normalizedQuestion,
    subjectLabel: getSubjectLabel(input.subject),
    chapterTitle,
    lessonTitle,
    quizTitle,
    chapterSummary: resolvedContext.chapterSummary,
    lessonSummary: resolvedContext.lessonSummary,
    quizSummary: resolvedContext.quizSummary,
    lessonContentText: resolvedContext.lessonContentText,
  });

  try {
    const result = await generateAiText({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: input.level === "short" ? 0.2 : 0.4,
      maxTokens: input.level === "short" ? 500 : 1000,
    });

    return {
      answer: sanitizeAnswer(result.text),
      meta: {
        provider: "llm",
        subject: input.subject,
        level: input.level,
        lessonId: resolvedContext.lessonId,
        chapterId: resolvedContext.chapterId,
        quizId: resolvedContext.quizId,
        lessonTitle,
        chapterTitle,
        quizTitle,
        lessonSummary: resolvedContext.lessonSummary,
        chapterSummary: resolvedContext.chapterSummary,
        quizSummary: resolvedContext.quizSummary,
        lessonContentText: resolvedContext.lessonContentText,
        systemPrompt,
      },
    };
  } catch (error) {
    console.error("[AI_TUTOR_GENERATION_ERROR]", error);

    return {
      answer: buildFallbackAnswer(
        {
          ...input,
          question: normalizedQuestion,
          lessonId: resolvedContext.lessonId,
          chapterId: resolvedContext.chapterId,
          quizId: resolvedContext.quizId,
          lessonTitle,
          chapterTitle,
          quizTitle,
        },
        contextLines
      ),
      meta: {
        provider: "fallback-local",
        subject: input.subject,
        level: input.level,
        lessonId: resolvedContext.lessonId,
        chapterId: resolvedContext.chapterId,
        quizId: resolvedContext.quizId,
        lessonTitle,
        chapterTitle,
        quizTitle,
        lessonSummary: resolvedContext.lessonSummary,
        chapterSummary: resolvedContext.chapterSummary,
        quizSummary: resolvedContext.quizSummary,
        lessonContentText: resolvedContext.lessonContentText,
        systemPrompt,
      },
    };
  }
}