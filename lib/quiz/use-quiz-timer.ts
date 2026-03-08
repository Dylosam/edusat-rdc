"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseQuizTimerParams = {
  enabled: boolean;
  initialRemainingSec: number;
  onTimeUp?: () => void;
  onRemainingChange?: (remaining: number, running: boolean) => void;
};

export function formatTime(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useQuizTimer({
  enabled,
  initialRemainingSec,
  onTimeUp,
  onRemainingChange,
}: UseQuizTimerParams) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor(initialRemainingSec || 0))
  );
  const [running, setRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const onRemainingChangeRef = useRef(onRemainingChange);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    onRemainingChangeRef.current = onRemainingChange;
  }, [onRemainingChange]);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    clear();
    setRunning(false);
  }, [clear]);

  const start = useCallback(() => {
    if (!enabled) return;

    setRunning(true);
  }, [enabled]);

  const reset = useCallback(
    (nextRemaining?: number) => {
      clear();
      setRunning(false);
      setRemaining(
        Math.max(
          0,
          Math.floor(
            typeof nextRemaining === "number" ? nextRemaining : initialRemainingSec || 0
          )
        )
      );
    },
    [clear, initialRemainingSec]
  );

  // ✅ Resynchronise quand la valeur initiale change (ex: quiz chargé après render)
  useEffect(() => {
    if (!enabled) {
      clear();
      setRunning(false);
      setRemaining(0);
      return;
    }

    setRemaining(Math.max(0, Math.floor(initialRemainingSec || 0)));
  }, [enabled, initialRemainingSec, clear]);

  // ✅ Lance / arrête réellement l'interval
  useEffect(() => {
    if (!enabled || !running) {
      clear();
      return;
    }

    if (remaining <= 0) {
      clear();
      setRunning(false);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = Math.max(0, prev - 1);

        if (next <= 0) {
          clear();
          setRunning(false);
          onTimeUpRef.current?.();
          return 0;
        }

        return next;
      });
    }, 1000);

    return clear;
  }, [enabled, running, remaining, clear]);

  // ✅ Notifie les changements
  useEffect(() => {
    onRemainingChangeRef.current?.(remaining, running);
  }, [remaining, running]);

  // cleanup global
  useEffect(() => {
    return () => clear();
  }, [clear]);

  return {
    remaining,
    running,
    start,
    pause,
    reset,
  };
}