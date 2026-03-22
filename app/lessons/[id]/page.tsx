import { getLessonById, getLessonBlocks } from "@/lib/supabase/queries";

type LessonPageProps = {
  params: {
    id: string;
  };
};

type LessonBlockType = "text" | "formula" | "example" | "tip" | "exercise" | "richText";

type LessonBlock = {
  id: string;
  lesson_id: string;
  order_index: number;
  type: LessonBlockType;
  payload: {
    value?: string;
    title?: string;
    question?: string;
    choices?: string[];
    answerIndex?: number;
    explanation?: string;
    segments?: Array<{
      type: string;
      value?: string;
      bold?: boolean;
      italic?: boolean;
    }>;
  };
};

export default async function LessonPage({ params }: LessonPageProps) {
  const lesson = await getLessonById(params.id);
  const blocks = (await getLessonBlocks(params.id)) as LessonBlock[];

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

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          {lesson.minutes} min
        </p>
        <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
        {lesson.summary ? (
          <p className="mt-3 text-base text-muted-foreground">{lesson.summary}</p>
        ) : null}
      </header>

      <section className="space-y-6">
        {blocks.map((block) => {
          switch (block.type) {
            case "text":
              return (
                <p key={block.id} className="text-base leading-7">
                  {block.payload.value}
                </p>
              );

            case "formula":
              return (
                <div
                  key={block.id}
                  className="rounded-2xl border bg-muted/40 px-4 py-4 text-center text-lg font-medium"
                >
                  {block.payload.value}
                </div>
              );

            case "example":
              return (
                <div key={block.id} className="rounded-2xl border p-4">
                  {block.payload.title ? (
                    <h3 className="mb-2 text-lg font-semibold">{block.payload.title}</h3>
                  ) : null}
                  <p className="leading-7 whitespace-pre-line">{block.payload.value}</p>
                </div>
              );

            case "tip":
              return (
                <div key={block.id} className="rounded-2xl border p-4">
                  <h3 className="mb-2 text-lg font-semibold">Astuce</h3>
                  <p className="leading-7 whitespace-pre-line">{block.payload.value}</p>
                </div>
              );

            case "exercise":
              return (
                <div key={block.id} className="rounded-2xl border p-4">
                  {block.payload.title ? (
                    <h3 className="mb-3 text-lg font-semibold">{block.payload.title}</h3>
                  ) : null}

                  {block.payload.question ? (
                    <p className="mb-4 font-medium">{block.payload.question}</p>
                  ) : null}

                  {Array.isArray(block.payload.choices) && block.payload.choices.length > 0 ? (
                    <ul className="space-y-2">
                      {block.payload.choices.map((choice, index) => (
                        <li key={`${block.id}-${index}`} className="rounded-xl border px-3 py-2">
                          {choice}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {block.payload.explanation ? (
                    <div className="mt-4 rounded-xl bg-muted/40 p-3">
                      <p className="text-sm leading-6">{block.payload.explanation}</p>
                    </div>
                  ) : null}
                </div>
              );

            case "richText":
              return (
                <div key={block.id} className="leading-7">
                  {block.payload.value ?? "Bloc richText non encore géré."}
                </div>
              );

            default:
              return null;
          }
        })}
      </section>
    </main>
  );
}