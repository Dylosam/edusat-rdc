"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SendHorizonal, Sparkles } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";

type ApiResponse = {
  answer?: string;
  error?: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function AiPage() {
  const searchParams = useSearchParams();

  const querySubject = searchParams.get("subject");
  const queryLessonId = searchParams.get("lessonId");
  const queryChapterId = searchParams.get("chapterId");
  const queryQuizId = searchParams.get("quizId");

  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  }, []);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";
    const nextHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${nextHeight}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [question, resizeTextarea]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, loading, waitingForAnswer, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const animateAssistantMessage = useCallback(
    async (messageId: string, fullText: string) => {
      return new Promise<void>((resolve) => {
        let index = 0;

        const step = () => {
          index += 1;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: fullText.slice(0, index) }
                : msg
            )
          );

          scrollToBottom(false);

          if (index < fullText.length) {
            const currentChar = fullText[index];
            const delay =
              currentChar === "\n" ? 10 : currentChar === " " ? 8 : 14;

            typingTimeoutRef.current = setTimeout(step, delay);
          } else {
            resolve();
          }
        };

        step();
      });
    },
    [scrollToBottom]
  );

  const handleAsk = useCallback(async () => {
    if (!question.trim() || loading) return;

    const trimmedQuestion = question.trim();

    const userMessage: Message = {
      id: uid(),
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setWaitingForAnswer(true);

    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: querySubject ?? "physics",
          level: "simple",
          question: trimmedQuestion,
          lessonId: queryLessonId,
          chapterId: queryChapterId,
          quizId: queryQuizId,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Une erreur est survenue.");
      }

      const assistantMessageId = uid();
      const fullAnswer = data.answer || "Aucune réponse générée.";

      setWaitingForAnswer(false);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
        },
      ]);

      await animateAssistantMessage(assistantMessageId, fullAnswer);
    } catch (err) {
      const assistantMessageId = uid();
      const errorText =
        err instanceof Error ? err.message : "Une erreur est survenue.";

      setWaitingForAnswer(false);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
        },
      ]);

      await animateAssistantMessage(assistantMessageId, errorText);
    } finally {
      setLoading(false);
      resizeTextarea();
    }
  }, [
    animateAssistantMessage,
    loading,
    queryChapterId,
    queryLessonId,
    queryQuizId,
    querySubject,
    question,
    resizeTextarea,
  ]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
          {messages.length === 0 && !waitingForAnswer && (
            <div className="pt-16 text-center sm:pt-20">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Assistant IA EduStat
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Pose ta question
              </h1>

              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Écris simplement ce que tu ne comprends pas.
              </p>
            </div>
          )}

          <div className="flex-1 space-y-6 pt-10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm leading-7 text-primary-foreground sm:text-[15px]">
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[90%] px-1 py-1 text-sm leading-8 text-foreground sm:text-[15px]">
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {waitingForAnswer && (
              <div className="flex justify-start">
                <div className="px-1 py-1">
                  <span className="bern-shimmer text-lg font-bold tracking-[0.2em] sm:text-xl">
                    BΞRN
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="mt-6 pb-6 pt-4">
            <div className="flex items-end gap-3 rounded-[28px] border bg-card p-3 shadow-sm">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Poses ta question à BΞRN ..."
                rows={1}
                className="min-h-[44px] max-h-[160px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />

              <button
                onClick={handleAsk}
                disabled={!question.trim() || loading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Envoyer"
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}