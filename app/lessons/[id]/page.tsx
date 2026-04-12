import LessonRenderer from "@/components/study/lesson-renderer";
import { getLessonById, getLessonBlocks } from "@/lib/supabase/queries";

type LessonPageProps = {
  params: {
    id: string;
  };
};

type RawStep = {
  text?: unknown;
  formula?: unknown;
  explanation?: unknown;
};

type RawChoice = {
  text?: unknown;
  correct?: unknown;
};

type RawLessonBlock = {
  id?: string;
  lesson_id?: string;
  order_index?: number;
  type?: string;
  payload?: {
    id?: unknown;
    title?: unknown;
    text?: unknown;
    content?: unknown;
    value?: unknown;
    formula?: unknown;
    explanation?: unknown;
    question?: unknown;
    choices?: unknown;
    assertions?: unknown;
    answers?: unknown;
    correctIndex?: unknown;
    correctChoiceIndex?: unknown;
    steps?: unknown;
  };
};

type TextSegment = {
  text: string;
  color?: string;
};

type RichText = string | TextSegment[];

type RenderBlock =
  | {
      type: "text";
      title?: RichText;
      text?: RichText;
      segments?: TextSegment[];
    }
  | {
      type: "katex";
      title?: RichText;
      formula: string;
      explanation?: RichText;
    }
  | {
      type: "example";
      title?: RichText;
      text?: RichText;
      steps?: {
        text?: RichText;
        formula?: string;
        explanation?: RichText;
      }[];
    }
  | {
      type: "tip";
      title?: RichText;
      text?: RichText;
      segments?: TextSegment[];
    }
  | {
      type: "exercise";
      title?: RichText;
      question: RichText;
      choices: {
        text: RichText;
        correct: boolean;
      }[];
      explanation?: RichText;
    };

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSteps(
  value: unknown
): { text?: string; formula?: string; explanation?: string }[] {
  if (!Array.isArray(value)) return [];

  const result: { text?: string; formula?: string; explanation?: string }[] = [];

  for (const step of value) {
    if (!step || typeof step !== "object") continue;

    const raw = step as RawStep;

    const text = asString(raw.text) || undefined;
    const formula = asString(raw.formula) || undefined;
    const explanation = asString(raw.explanation) || undefined;

    if (!text && !formula && !explanation) continue;

    result.push({
      text,
      formula,
      explanation,
    });
  }

  return result;
}
function normalizeChoicesFromObjects(value: unknown): Array<{
  text: string;
  correct: boolean;
}> {
  if (!Array.isArray(value)) return [];

  return value
    .map((choice) => {
      if (!choice || typeof choice !== "object") return null;

      const raw = choice as RawChoice;
      const text = asString(raw.text).trim();
      const correct = raw.correct === true;

      if (!text) return null;

      return { text, correct };
    })
    .filter(
      (
        choice
      ): choice is {
        text: string;
        correct: boolean;
      } => choice !== null
    );
}

function normalizeChoicesFromLegacy(
  answersValue: unknown,
  correctIndexValue: unknown
): Array<{
  text: string;
  correct: boolean;
}> {
  if (!Array.isArray(answersValue)) return [];

  const correctIndex = asNumberOrNull(correctIndexValue);

  return answersValue
    .map((answer, index) => {
      if (typeof answer !== "string" || !answer.trim()) return null;

      return {
        text: answer,
        correct: index === correctIndex,
      };
    })
    .filter(
      (
        choice
      ): choice is {
        text: string;
        correct: boolean;
      } => choice !== null
    );
}

function normalizeBlocks(blocks: RawLessonBlock[]): RenderBlock[] {
  const result: RenderBlock[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const payload = block.payload ?? {};
    const type = asString(block.type).toLowerCase();

    if (type === "text") {
      const text =
        asString(payload.text) ||
        asString(payload.content) ||
        asString(payload.value);

      if (text.trim()) {
        result.push({
          type: "text",
          title: asString(payload.title) || undefined,
          text,
        });
      }

      continue;
    }

    if (type === "katex") {
      const formula = asString(payload.formula);

      if (formula.trim()) {
        result.push({
          type: "katex",
          title: asString(payload.title) || undefined,
          formula,
          explanation: asString(payload.explanation) || undefined,
        });
      }

      continue;
    }

    if (type === "example") {
      const text = asString(payload.text) || undefined;
      const steps = normalizeSteps(payload.steps);

      if (text || steps.length > 0) {
        result.push({
          type: "example",
          title: asString(payload.title) || undefined,
          text,
          steps,
        });
      }

      continue;
    }

    if (type === "tip") {
      const text = asString(payload.text);

      if (text.trim()) {
        result.push({
          type: "tip",
          title: asString(payload.title) || undefined,
          text,
        });
      }

      continue;
    }

    if (type === "exercise") {
      const question = asString(payload.question);

      let choices = normalizeChoicesFromObjects(payload.choices);

      if (choices.length === 0) {
        choices = normalizeChoicesFromObjects(payload.assertions);
      }

      if (choices.length === 0) {
        choices = normalizeChoicesFromLegacy(
          payload.answers,
          payload.correctIndex ?? payload.correctChoiceIndex
        );
      }

      if (question.trim()) {
        result.push({
          type: "exercise",
          title: asString(payload.title) || undefined,
          question,
          choices,
          explanation: asString(payload.explanation) || undefined,
        });
      }
    }
  }

  return result;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const lesson = await getLessonById(params.id);
  const rawBlocks = (await getLessonBlocks(params.id)) as RawLessonBlock[];

  if (!lesson) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">Leçon introuvable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette leçon n’existe pas ou n’est pas publiée.
        </p>
      </main>
    );
  }

  const sortedBlocks = (Array.isArray(rawBlocks) ? rawBlocks : []).sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  const blocks = normalizeBlocks(sortedBlocks);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">{lesson.minutes} min</p>
        <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
        {lesson.summary ? (
          <p className="mt-3 text-base text-muted-foreground">
            {lesson.summary}
          </p>
        ) : null}
      </header>

      <LessonRenderer blocks={blocks} />
    </main>
  );
}