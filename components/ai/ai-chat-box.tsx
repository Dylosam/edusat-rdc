"use client";

import { useMemo, useState } from "react";
import { Sparkles, SendHorizonal, Loader2, BookOpen, Brain, FlaskConical, Atom, Leaf } from "lucide-react";

type SubjectOption = {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SUBJECTS: SubjectOption[] = [
  {
    value: "math",
    label: "Mathématiques",
    description: "Calculs, équations, fonctions, géométrie, trigonométrie…",
    icon: Brain,
  },
  {
    value: "physics",
    label: "Physique",
    description: "Mécanique, électricité, optique, forces, mouvements…",
    icon: Atom,
  },
  {
    value: "chemistry",
    label: "Chimie",
    description: "Réactions, molécules, atomes, solutions, pH…",
    icon: FlaskConical,
  },
  {
    value: "biology",
    label: "Biologie",
    description: "Cellules, organes, génétique, écologie, reproduction…",
    icon: Leaf,
  },
];

const LEVELS = [
  {
    value: "simple",
    label: "Explique simplement",
  },
  {
    value: "step_by_step",
    label: "Étape par étape",
  },
  {
    value: "short",
    label: "Réponse courte",
  },
];

const SUGGESTIONS = [
  "Explique-moi simplement pourquoi certains objets flottent sur l’eau.",
  "Quelle est la différence entre un mélange homogène et hétérogène ?",
  "C’est quoi une cellule et à quoi elle sert ?",
  "Comment résoudre une équation du premier degré ?",
];

export default function AiPage() {
  const [subject, setSubject] = useState("physics");
  const [level, setLevel] = useState("simple");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSubject = useMemo(
    () => SUBJECTS.find((item) => item.value === subject) ?? SUBJECTS[1],
    [subject]
  );

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          level,
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Une erreur est survenue.");
      }

      setAnswer(data?.answer || "Aucune réponse générée.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (value: string) => {
    setQuestion(value);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      await handleAsk();
    }
  };

  const SubjectIcon = selectedSubject.icon;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
            <div className="relative flex flex-col gap-5 p-6 md:p-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Assistant IA EduStat
              </div>

              <div className="max-w-3xl space-y-3">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Un prof intelligent, simple et disponible à tout moment
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Pose une question en mathématiques, physique, chimie ou biologie. L’assistant
                  répond de façon claire, structurée et adaptée au niveau de l’élève.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border bg-background/70 p-4">
                  <p className="text-sm font-semibold">Explications simples</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    L’IA reformule les notions difficiles avec des mots plus faciles.
                  </p>
                </div>

                <div className="rounded-2xl border bg-background/70 p-4">
                  <p className="text-sm font-semibold">Réponses guidées</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Les réponses sont structurées pour éviter que l’élève se perde.
                  </p>
                </div>

                <div className="rounded-2xl border bg-background/70 p-4">
                  <p className="text-sm font-semibold">Pensé pour EduStat</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cette base pourra ensuite se connecter aux vraies leçons et quiz sur Supabase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3">
                  <SubjectIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Paramètres de la question</h2>
                  <p className="text-sm text-muted-foreground">
                    Choisis la matière et le style d’explication.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                    Matière
                  </label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
                  >
                    {SUBJECTS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {selectedSubject.description}
                  </p>
                </div>

                <div>
                  <label htmlFor="level" className="mb-2 block text-sm font-medium">
                    Niveau d’explication
                  </label>
                  <select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
                  >
                    {LEVELS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Idées de questions</h2>
                  <p className="text-sm text-muted-foreground">
                    Clique sur une suggestion pour remplir automatiquement la zone de texte.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full rounded-2xl border px-4 py-3 text-left text-sm transition hover:bg-muted"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border bg-card p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col gap-2">
              <h2 className="text-xl font-semibold">Pose ta question</h2>
              <p className="text-sm text-muted-foreground">
                Décris ce que tu ne comprends pas. Tu peux aussi utiliser{" "}
                <span className="font-medium">Ctrl + Entrée</span> ou{" "}
                <span className="font-medium">Cmd + Entrée</span> pour envoyer rapidement.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Exemple : je ne comprends pas pourquoi la tension se mesure en volts et comment la calculer..."
                className="min-h-[180px] w-full resize-none rounded-3xl border bg-background px-4 py-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Conseil : pose une question précise pour obtenir une meilleure réponse.
                </p>

                <button
                  type="button"
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <SendHorizonal className="h-4 w-4" />
                      Demander à l’IA
                    </>
                  )}
                </button>
              </div>

              {error ? (
                <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <div className="overflow-hidden rounded-3xl border bg-background">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-semibold">Réponse de l’assistant</p>
                </div>

                <div className="min-h-[320px] px-4 py-4">
                  {loading ? (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <div>
                        <p className="font-medium">L’assistant prépare la réponse…</p>
                        <p className="text-sm text-muted-foreground">
                          Analyse de la question en cours.
                        </p>
                      </div>
                    </div>
                  ) : answer ? (
                    <div className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                      {answer}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                      <div className="rounded-full bg-primary/10 p-4">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="max-w-md">
                        <p className="font-medium">Aucune réponse pour le moment</p>
                        <p className="text-sm text-muted-foreground">
                          Sélectionne une matière, pose ta question, puis lance la génération.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}