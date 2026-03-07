// lib/tools/timetable-types.ts

export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type TimetablePeriod = {
  id: string;
  label: string; // ex: "P1", "Matin 1"
  start: string; // "07:30"
  end: string; // "08:20"
};

export type TimetableEntry = {
  subject: string;
  room?: string;
  teacher?: string;
  color?: string; // tailwind gradient token or hex
  note?: string;
};

export type TimetableGrid = Partial<
  Record<WeekdayKey, Partial<Record<string /* periodId */, TimetableEntry>>>
>;

export type TimetableStateV1 = {
  version: 1;
  meta: {
    title: string;
    schoolYearLabel?: string;
    updatedAt: number;
  };
  days: Array<{ key: WeekdayKey; label: string; enabled: boolean }>;
  periods: TimetablePeriod[];
  grid: TimetableGrid;
};

export const DEFAULT_DAYS: TimetableStateV1["days"] = [
  { key: "mon", label: "Lun", enabled: true },
  { key: "tue", label: "Mar", enabled: true },
  { key: "wed", label: "Mer", enabled: true },
  { key: "thu", label: "Jeu", enabled: true },
  { key: "fri", label: "Ven", enabled: true },
  { key: "sat", label: "Sam", enabled: true },
  { key: "sun", label: "Dim", enabled: false },
];

export function defaultTimetableState(): TimetableStateV1 {
  const now = Date.now();
  const periods: TimetablePeriod[] = [
    { id: "p1", label: "P1", start: "07:30", end: "08:20" },
    { id: "p2", label: "P2", start: "08:20", end: "09:10" },
    { id: "p3", label: "P3", start: "09:10", end: "10:00" },
    { id: "p4", label: "P4", start: "10:20", end: "11:10" },
    { id: "p5", label: "P5", start: "11:10", end: "12:00" },
  ];

  return {
    version: 1,
    meta: {
      title: "Horaire de cours",
      schoolYearLabel: "EduStat RDC · Année 2025–2026",
      updatedAt: now,
    },
    days: DEFAULT_DAYS,
    periods,
    grid: {},
  };
}