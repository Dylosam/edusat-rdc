// lib/quiz/use-quiz-timer.ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useQuizTimer(opts: {
  enabled: boolean;
  initialRemainingSec: number;
  onTimeUp: () => void;
  onRemainingChange?: (remaining: number, running: boolean) => void;
}) {
  const { enabled, initialRemainingSec, onTimeUp, onRemainingChange } = opts;

  const [remaining, setRemainingState] = useState<number>(initialRemainingSec);
  const [running, setRunning] = useState<boolean>(false);

  const intervalRef = useRef<number | null>(null);

  // reset when initial changes (ex: load session or quiz)
  useEffect(() => {
    setRemainingState(initialRemainingSec);
    setRunning(false);
  }, [initialRemainingSec]);

  // tick
  useEffect(() => {
    if (!enabled) return;
    if (!running) return;

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setRemainingState((r) => {
        const next = Math.max(0, r - 1);
        if (next === 0) {
          // stop + callback
          setRunning(false);
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onTimeUp();
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, running, onTimeUp]);

  // report changes for persistence
  useEffect(() => {
    if (!enabled) return;
    onRemainingChange?.(remaining, running);
  }, [enabled, remaining, running, onRemainingChange]);

  // pause when tab hidden
  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [enabled]);

  const setRemaining = (sec: number) => {
    if (!enabled) return;
    setRemainingState(Math.max(0, Math.floor(sec)));
  };

  const start = () => enabled && remaining > 0 && setRunning(true);
  const pause = () => enabled && setRunning(false);
  const reset = (sec?: number) => {
    if (!enabled) return;
    setRemainingState(Math.max(0, Math.floor(sec ?? initialRemainingSec)));
    setRunning(false);
  };

  return {
    remaining,
    running,
    start,
    pause,
    reset,
    setRemaining,
  };
}

export function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}