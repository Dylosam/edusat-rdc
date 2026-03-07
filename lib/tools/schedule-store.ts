// lib/tools/schedule-store.ts
export type ScheduleDayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type ScheduleCell = {
  title: string;        // ex: "Maths"
  teacher?: string;     // ex: "Mme K."
  room?: string;        // ex: "B12"
  note?: string;        // ex: "Devoir à rendre"
  color?: string;       // tailwind bg class, ex: "bg-blue-600/15"
};

export type SchedulePeriod = {
  id: string;
  label: string;        // ex: "P1"
  start: string;        // "07:30"
  end: string;          // "08:20"
};

export type ScheduleStateV1 = {
  version: 1;
  meta: {
    title: string;      // ex: "Mon horaire"
    school?: string;    // ex: "Lycée X"
    year?: string;      // ex: "2025-2026"
    updatedAt: number;
  };
  days: { key: ScheduleDayKey; label: string; enabled: boolean }[];
  periods: SchedulePeriod[];
  grid: Record<string, ScheduleCell | null>; // key = `${dayKey}__${periodId}`
};

const KEY = "edustat:tools:schedule:v1";

function uid(prefix = "p") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export const SCHEDULE_COLORS: { label: string; value: string }[] = [
  { label: "Bleu", value: "bg-blue-600/15" },
  { label: "Cyan", value: "bg-cyan-600/15" },
  { label: "Vert", value: "bg-emerald-600/15" },
  { label: "Jaune", value: "bg-amber-500/15" },
  { label: "Orange", value: "bg-orange-600/15" },
  { label: "Rose", value: "bg-pink-600/15" },
  { label: "Violet", value: "bg-purple-600/15" },
  { label: "Gris", value: "bg-muted/40" },
];

export function makeDefaultSchedule(): ScheduleStateV1 {
  const periods: SchedulePeriod[] = [
    { id: uid("p"), label: "P1", start: "07:30", end: "08:20" },
    { id: uid("p"), label: "P2", start: "08:20", end: "09:10" },
    { id: uid("p"), label: "Pause", start: "09:10", end: "09:30" },
    { id: uid("p"), label: "P3", start: "09:30", end: "10:20" },
    { id: uid("p"), label: "P4", start: "10:20", end: "11:10" },
    { id: uid("p"), label: "P5", start: "11:10", end: "12:00" },
  ];

  const days: ScheduleStateV1["days"] = [
    { key: "mon", label: "Lun", enabled: true },
    { key: "tue", label: "Mar", enabled: true },
    { key: "wed", label: "Mer", enabled: true },
    { key: "thu", label: "Jeu", enabled: true },
    { key: "fri", label: "Ven", enabled: true },
    { key: "sat", label: "Sam", enabled: false },
    { key: "sun", label: "Dim", enabled: false },
  ];

  return {
    version: 1,
    meta: { title: "Horaire de cours", school: "", year: "2025-2026", updatedAt: Date.now() },
    days,
    periods,
    grid: {},
  };
}

export function loadSchedule(): ScheduleStateV1 {
  if (typeof window === "undefined") return makeDefaultSchedule();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return makeDefaultSchedule();

    const parsed = JSON.parse(raw) as Partial<ScheduleStateV1>;
    if (!parsed || parsed.version !== 1) return makeDefaultSchedule();

    return {
      ...makeDefaultSchedule(),
      ...parsed,
      meta: {
        ...makeDefaultSchedule().meta,
        ...(parsed.meta ?? {}),
        updatedAt: typeof parsed.meta?.updatedAt === "number" ? parsed.meta.updatedAt : Date.now(),
      },
      days: Array.isArray(parsed.days) ? parsed.days as any : makeDefaultSchedule().days,
      periods: Array.isArray(parsed.periods) ? (parsed.periods as any) : makeDefaultSchedule().periods,
      grid: (parsed.grid && typeof parsed.grid === "object") ? (parsed.grid as any) : {},
    };
  } catch {
    return makeDefaultSchedule();
  }
}

export function saveSchedule(next: ScheduleStateV1): ScheduleStateV1 {
  const safe: ScheduleStateV1 = {
    ...next,
    version: 1,
    meta: { ...next.meta, updatedAt: Date.now() },
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(safe));
    window.dispatchEvent(new Event("edustat_schedule_updated"));
  }
  return safe;
}

export function resetSchedule(): ScheduleStateV1 {
  const fresh = makeDefaultSchedule();
  return saveSchedule(fresh);
}

export function exportScheduleJson(state: ScheduleStateV1): string {
  return JSON.stringify(state, null, 2);
}

export function importScheduleJson(raw: string): ScheduleStateV1 {
  const parsed = JSON.parse(raw) as Partial<ScheduleStateV1>;
  if (!parsed || parsed.version !== 1) throw new Error("Format invalide (version).");
  const merged: ScheduleStateV1 = {
    ...makeDefaultSchedule(),
    ...(parsed as any),
    version: 1,
    meta: { ...makeDefaultSchedule().meta, ...(parsed.meta ?? {}), updatedAt: Date.now() },
    days: Array.isArray(parsed.days) ? (parsed.days as any) : makeDefaultSchedule().days,
    periods: Array.isArray(parsed.periods) ? (parsed.periods as any) : makeDefaultSchedule().periods,
    grid: (parsed.grid && typeof parsed.grid === "object") ? (parsed.grid as any) : {},
  };
  return saveSchedule(merged);
}

export function cellKey(dayKey: ScheduleDayKey, periodId: string) {
  return `${dayKey}__${periodId}`;
}