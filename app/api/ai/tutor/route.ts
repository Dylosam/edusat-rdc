import { NextResponse } from "next/server";
import { runAiTutor } from "@/lib/ai/tutor";

type TutorRequestBody = {
  subject?: string;
  question?: string;
  level?: "simple" | "step_by_step" | "short";
  lessonId?: string | null;
  chapterId?: string | null;
  quizId?: string | null;
  lessonTitle?: string | null;
  chapterTitle?: string | null;
  quizTitle?: string | null;
};

const ALLOWED_SUBJECTS = ["math", "physics", "chemistry", "biology"] as const;
const ALLOWED_LEVELS = ["simple", "step_by_step", "short"] as const;

type AllowedSubject = (typeof ALLOWED_SUBJECTS)[number];
type AllowedLevel = (typeof ALLOWED_LEVELS)[number];

function isAllowedSubject(value: string): value is AllowedSubject {
  return ALLOWED_SUBJECTS.includes(value as AllowedSubject);
}

function isAllowedLevel(value: string): value is AllowedLevel {
  return ALLOWED_LEVELS.includes(value as AllowedLevel);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TutorRequestBody;

    const rawQuestion = typeof body.question === "string" ? body.question.trim() : "";
    const rawSubject = typeof body.subject === "string" ? body.subject.trim() : "";
    const rawLevel = typeof body.level === "string" ? body.level.trim() : "simple";

    if (!rawQuestion) {
      return NextResponse.json({ error: "La question est obligatoire." }, { status: 400 });
    }

    if (rawQuestion.length < 3) {
      return NextResponse.json({ error: "La question est trop courte." }, { status: 400 });
    }

    if (rawQuestion.length > 3000) {
      return NextResponse.json({ error: "La question est trop longue." }, { status: 400 });
    }

    if (!rawSubject || !isAllowedSubject(rawSubject)) {
      return NextResponse.json({ error: "La matière envoyée est invalide." }, { status: 400 });
    }

    if (!isAllowedLevel(rawLevel)) {
      return NextResponse.json(
        { error: "Le niveau d’explication est invalide." },
        { status: 400 }
      );
    }

    const result = await runAiTutor({
      subject: rawSubject,
      question: rawQuestion,
      level: rawLevel,
      lessonId: body.lessonId ?? null,
      chapterId: body.chapterId ?? null,
      quizId: body.quizId ?? null,
      lessonTitle: body.lessonTitle ?? null,
      chapterTitle: body.chapterTitle ?? null,
      quizTitle: body.quizTitle ?? null,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[AI_TUTOR_ROUTE_ERROR]", error);

    return NextResponse.json(
      {
        error: "Une erreur serveur est survenue lors du traitement de la question.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "Route AI Tutor active",
      endpoint: "/api/ai/tutor",
    },
    { status: 200 }
  );
}