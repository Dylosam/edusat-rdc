type BuildUserPromptParams = {
  question: string;
  subjectLabel: string;
  chapterTitle?: string | null;
  lessonTitle?: string | null;
  quizTitle?: string | null;
  chapterSummary?: string | null;
  lessonSummary?: string | null;
  quizSummary?: string | null;
  lessonContentText?: string | null;
};

function safeBlock(title: string, value?: string | null) {
  if (!value || !value.trim()) return "";
  return `${title}\n${value.trim()}\n`;
}

export function buildAiTutorUserPrompt(params: BuildUserPromptParams) {
  const {
    question,
    subjectLabel,
    chapterTitle,
    lessonTitle,
    quizTitle,
    chapterSummary,
    lessonSummary,
    quizSummary,
    lessonContentText,
  } = params;

  return `
L'élève travaille la matière suivante :
${subjectLabel}

Question de l'élève :
"${question}"

Contexte EduStat disponible :
${safeBlock("- Titre du chapitre :", chapterTitle)}
${safeBlock("- Résumé du chapitre :", chapterSummary)}
${safeBlock("- Titre de la leçon :", lessonTitle)}
${safeBlock("- Résumé de la leçon :", lessonSummary)}
${safeBlock("- Extrait de la leçon :", lessonContentText)}
${safeBlock("- Titre du quiz :", quizTitle)}
${safeBlock("- Résumé du quiz :", quizSummary)}

Consigne importante :
- Utilise le contexte EduStat seulement s'il aide vraiment à répondre.
- Si le contexte est incomplet, réponds quand même de manière utile.
- N'invente pas de détails absents du contexte.
- Garde le format imposé par le prompt système.
`.trim();
}