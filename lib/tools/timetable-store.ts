// lib/tools/timetable-store.ts
import { TimetableStateV1, defaultTimetableState } from "./timetable-types";

const KEY = "edustat_tools_timetable_v1";

export function readTimetable(): TimetableStateV1 {
  if (typeof window === "undefined") return defaultTimetableState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultTimetableState();
    const parsed = JSON.parse(raw) as Partial<TimetableStateV1>;
    if (!parsed || parsed.version !== 1) return defaultTimetableState();

    // harden
    const fallback = defaultTimetableState();
    return {
      ...fallback,
      ...parsed,
      version: 1,
      meta: {
        ...fallback.meta,
        ...(parsed.meta ?? {}),
        updatedAt: typeof parsed.meta?.updatedAt === "number" ? parsed.meta.updatedAt : Date.now(),
      },
      days: Array.isArray(parsed.days) ? parsed.days : fallback.days,
      periods: Array.isArray(parsed.periods) ? parsed.periods : fallback.periods,
      grid: (parsed.grid ?? {}) as TimetableStateV1["grid"],
    };
  } catch {
    return defaultTimetableState();
  }
}

export function writeTimetable(next: TimetableStateV1) {
  if (typeof window === "undefined") return;
  const safe: TimetableStateV1 = {
    ...next,
    version: 1,
    meta: { ...next.meta, updatedAt: Date.now() },
  };
  localStorage.setItem(KEY, JSON.stringify(safe));
  window.dispatchEvent(new Event("edustat_timetable_updated"));
}

export function resetTimetable() {
  writeTimetable(defaultTimetableState());
}

export function exportTimetableJson(): string {
  const state = readTimetable();
  return JSON.stringify(state, null, 2);
}

export function importTimetableJson(json: string): TimetableStateV1 {
  const parsed = JSON.parse(json) as TimetableStateV1;
  if (!parsed || parsed.version !== 1) {
    throw new Error("Format invalide (version attendue: 1).");
  }
  writeTimetable(parsed);
  return parsed;
}