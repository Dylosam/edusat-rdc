// app/calendar/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, CalendarDays, Plus, X, Trash2 } from "lucide-react";

/* ---------------------------------------------
  Helpers dates (YYYY-MM-DD)
--------------------------------------------- */
const pad2 = (n: number) => String(n).padStart(2, "0");
const SCHOOL_YEAR_END = "2026-07-02";

function toYMD(d: Date | string | number) {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
}
function fromYMD(ymd: string) {
  const [y, m, d] = ymd.split("-").map((x) => Number(x));
  return new Date(y, m - 1, d);
}
function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function isBetweenYMD(dayYMD: string, startYMD: string, endYMD: string) {
  return dayYMD >= startYMD && dayYMD <= endYMD;
}
function diffDays(fromYMDStr: string, toYMDStr: string) {
  const a = fromYMD(fromYMDStr);
  const b = fromYMD(toYMDStr);
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/* ---------------------------------------------
  Calendar grid (Monday-first)
--------------------------------------------- */
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function weekdayIndexMondayFirst(date: Date) {
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}
function buildMonthGrid(viewDate: Date) {
  const start = startOfMonth(viewDate);
  const startOffset = weekdayIndexMondayFirst(start);
  const gridStart = addDays(start, -startOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
  return { days };
}

/* ---------------------------------------------
  Legend + Events
--------------------------------------------- */
type LegendKey =
  | "proclamation"
  | "exams"
  | "vacances"
  | "detente"
  | "ferie"
  | "deliberation"
  | "perso";

const LEGEND: Record<
  LegendKey,
  { label: string; dot: string; pill: string }
> = {
  proclamation: {
    label: "Proclamations",
    dot: "bg-pink-400",
    pill: "border-pink-400/25 bg-pink-400/10 text-pink-200",
  },
  exams: {
    label: "Examens",
    dot: "bg-amber-400",
    pill: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  },
  vacances: {
    label: "Vacances",
    dot: "bg-sky-400",
    pill: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  },
  detente: {
    label: "Détente",
    dot: "bg-cyan-400",
    pill: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  },
  ferie: {
    label: "Jours fériés",
    dot: "bg-rose-400",
    pill: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  },
  deliberation: {
    label: "Délibération",
    dot: "bg-emerald-400",
    pill: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  },
  perso: {
    label: "Personnalisé",
    dot: "bg-purple-400",
    pill: "border-purple-400/25 bg-purple-400/10 text-purple-200",
  },
};

type OfficialEvent = {
  type: LegendKey;
  label: string;
  start: string;
  end: string;
};

const OFFICIAL_EVENTS: OfficialEvent[] = [
  { type: "vacances", label: "Vacances du 1er semestre", start: "2025-12-18", end: "2026-01-03" },
  { type: "detente", label: "Détente", start: "2025-10-30", end: "2025-11-01" },

  { type: "exams", label: "Examen du 1er Semestre", start: "2026-02-03", end: "2026-02-11" },
  { type: "exams", label: "Examen du 2nd Semestre", start: "2026-05-26", end: "2026-06-03" },

  { type: "vacances", label: "Vacances du 2e semestre", start: "2026-03-28", end: "2026-04-11" },

  { type: "ferie", label: "Fête de la nativité", start: "2025-12-25", end: "2025-12-25" },
  { type: "ferie", label: "Fête du nouvel an", start: "2026-01-01", end: "2026-01-01" },
  { type: "ferie", label: "Martyrs de l’indépendance", start: "2026-01-04", end: "2026-01-04" },
  { type: "ferie", label: "Anniv. mort de Laurent-Désiré Kabila", start: "2026-01-16", end: "2026-01-16" },
  { type: "ferie", label: "Anniv. mort de Patrice Emery Lumumba", start: "2026-01-17", end: "2026-01-17" },
  { type: "ferie", label: "Combat de Simon Kimbangu & Conscience Africaine", start: "2026-04-06", end: "2026-04-06" },
  { type: "ferie", label: "Journée de l’enseignement national", start: "2026-04-30", end: "2026-04-30" },
  { type: "ferie", label: "Fête du travail", start: "2026-05-01", end: "2026-05-01" },
  { type: "ferie", label: "Journée de la FARDC", start: "2026-05-17", end: "2026-05-17" },
  { type: "ferie", label: "Fête de l’indépendance", start: "2026-06-30", end: "2026-06-30" },

  { type: "deliberation", label: "Délibération (1ère)", start: "2026-06-11", end: "2026-06-11" },
  { type: "deliberation", label: "Délibération (2ème)", start: "2026-06-19", end: "2026-06-19" },

  { type: "exams", label: "ENAFEP", start: "2026-06-01", end: "2026-06-02" },
  { type: "exams", label: "TENASOSP", start: "2026-06-11", end: "2026-06-12" },
  { type: "exams", label: "Examen d'État – Session ordinaire", start: "2026-06-22", end: "2026-06-25" },

  { type: "proclamation", label: "Proclamation", start: "2025-11-08", end: "2025-11-08" },
  { type: "proclamation", label: "Proclamation", start: "2026-02-21", end: "2026-02-21" },
  { type: "proclamation", label: "Proclamation", start: "2026-05-09", end: "2026-05-09" },
  { type: "proclamation", label: "Proclamation", start: "2026-07-02", end: "2026-07-02" },
];

/* ---------------------------------------------
  Custom events (LocalStorage)
--------------------------------------------- */
type CustomEvent = {
  id: string;
  date: string;
  title: string;
  note?: string;
  createdAt: string;
};

type CustomStore = { version: number; events: CustomEvent[] };

const CUSTOM_KEY = "edustat:calendar:custom:v1";

function loadCustom(): CustomStore {
  if (typeof window === "undefined") return { version: 1, events: [] };
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return { version: 1, events: [] };
    const parsed = JSON.parse(raw) as Partial<CustomStore>;
    if (!parsed || typeof parsed !== "object") return { version: 1, events: [] };
    return {
      version: 1,
      events: Array.isArray(parsed.events) ? (parsed.events as CustomEvent[]) : [],
    };
  } catch {
    return { version: 1, events: [] };
  }
}
function saveCustom(state: { events: CustomEvent[] }): CustomStore {
  const next: CustomStore = { version: 1, events: state.events ?? [] };
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  return next;
}
function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/* ---------------------------------------------
  Events matching
--------------------------------------------- */
type DayEvent =
  | (OfficialEvent & { source: "official" })
  | (CustomEvent & { type: "perso"; source: "custom" });

function getEventsForDayYMD(dayYMD: string, officialEvents: OfficialEvent[], customEvents: CustomEvent[]) {
  const hits: DayEvent[] = [];

  for (const e of officialEvents) {
    if (isBetweenYMD(dayYMD, e.start, e.end)) hits.push({ ...e, source: "official" });
  }
  for (const e of customEvents) {
    if (e.date === dayYMD) hits.push({ ...e, type: "perso", source: "custom" });
  }

  const priority: Partial<Record<LegendKey, number>> = {
    ferie: 1,
    exams: 2,
    vacances: 3,
    detente: 4,
    deliberation: 5,
    proclamation: 6,
    perso: 7,
  };

  hits.sort(
    (a, b) =>
      ((priority as any)[(a as any).type] ?? 99) -
      ((priority as any)[(b as any).type] ?? 99)
  );
  return hits;
}
function uniqueTypes(events: DayEvent[]) {
  return Array.from(new Set(events.map((e) => (e as any).type as LegendKey)));
}

/* ---------------------------------------------
  UI micro components
--------------------------------------------- */
function DotRow({ types }: { types: LegendKey[] }) {
  const shown = types.slice(0, 4);
  return (
    <div className="mt-1.5 flex items-center gap-1 sm:mt-2 sm:gap-1.5">
      {shown.map((t) => (
        <span
          key={t}
          className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${LEGEND[t]?.dot ?? "bg-muted-foreground/40"}`}
          title={LEGEND[t]?.label ?? t}
        />
      ))}
      {types.length > 4 ? (
        <span className="text-[10px] text-muted-foreground">+{types.length - 4}</span>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------
  Component
--------------------------------------------- */
export default function CalendarPage() {
  const [enter, setEnter] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEnter(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const todayYMD = toYMD(new Date());
  const [selectedYMD, setSelectedYMD] = useState(todayYMD);
  const [viewDate, setViewDate] = useState(() => fromYMD(todayYMD));

  const [custom, setCustom] = useState<CustomStore>(() => loadCustom());
  const [showAdd, setShowAdd] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customNote, setCustomNote] = useState("");

  const { days } = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const selectedDate = useMemo(() => fromYMD(selectedYMD), [selectedYMD]);
  const selectedLabel = useMemo(() => {
    const d = selectedDate;
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  }, [selectedDate]);

  const selectedDayEvents = useMemo(
    () => getEventsForDayYMD(selectedYMD, OFFICIAL_EVENTS, custom.events),
    [selectedYMD, custom.events]
  );
  const selectedTypes = useMemo(() => uniqueTypes(selectedDayEvents), [selectedDayEvents]);

  const monthTitle = useMemo(() => {
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    return `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
  }, [viewDate]);

  const daysRemaining = useMemo(() => diffDays(todayYMD, SCHOOL_YEAR_END), [todayYMD]);

  const SYNTHESE = useMemo(
    () => ({
      title: "Synthèse du calendrier scolaire 2025–2026",
      items: [
        "Vacances du 1er semestre : 18/12/2025 → 03/01/2026",
        "Examen du 1er semestre : 03/02/2026 → 11/02/2026 (8 jours)",
        "Vacances du 2e semestre : 28/03/2026 → 11/04/2026",
        "Examen du 2nd semestre : 26/05/2026 → 03/06/2026 (8 jours)",
        "ENAFEP : 01/06 → 02/06/2026",
        "TENASOSP : 11/06 → 12/06/2026",
        "Examen d’État : 22/06 → 25/06/2026",
        "Proclamation : 08/11/2025 ; 21/02/2026 ; 09/05/2026 ; 02/07/2026",
      ],
    }),
    []
  );

  function goPrevMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  }
  function goNextMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  }
  function jumpToday() {
    const t = new Date();
    const ymd = toYMD(t);
    setSelectedYMD(ymd);
    setViewDate(new Date(t.getFullYear(), t.getMonth(), 1));
  }
  function onSelectDay(d: Date) {
    const ymd = toYMD(d);
    setSelectedYMD(ymd);
    if (!isSameMonth(d, viewDate)) setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  function addCustomEvent() {
    const title = customTitle.trim();
    if (!title) return;

    const next = saveCustom({
      events: [
        ...custom.events,
        {
          id: uid(),
          date: selectedYMD,
          title,
          note: customNote.trim() || "",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    setCustom(next);
    setCustomTitle("");
    setCustomNote("");
    setShowAdd(false);
  }

  function deleteCustomEvent(id: string) {
    const next = saveCustom({ events: custom.events.filter((e) => e.id !== id) });
    setCustom(next);
  }

  const cardGlass =
    "rounded-2xl border border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 shadow-sm";
  const btnGhost =
    "inline-flex items-center justify-center rounded-xl border border-border/70 bg-background/30 px-3 py-2 text-sm font-medium hover:bg-accent/40 transition";
  const chip =
    "rounded-full border border-border/70 bg-background/30 px-3 py-1 text-xs text-muted-foreground";

  const pageEnter = [
    "transition-all duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter]",
    enter
      ? "opacity-100 translate-y-0 blur-0 scale-100"
      : "opacity-0 translate-y-3 blur-[7px] scale-[0.995]",
  ].join(" ");

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className={["mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8", pageEnter].join(" ")}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="mb-2 text-3xl font-bold font-serif leading-tight sm:text-4xl">
              Calendrier
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              EduStat RDC · Année 2025–2026
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_440px]">
            <div className="space-y-6">
              <Card className={cardGlass}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-4">
                    <div className="min-w-0">
                      <div className="text-xs tracking-wide text-muted-foreground">PLANNING</div>
                      <CardTitle className="text-xl font-semibold sm:text-2xl">
                        Calendrier
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        EduStat RDC · Année 2025–2026
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className={btnGhost}
                        onClick={goPrevMonth}
                        title="Mois précédent"
                        aria-label="Mois précédent"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <div
                        className={[
                          chip,
                          "min-w-[140px] px-4 py-2 text-center text-sm text-foreground/80 sm:min-w-[180px]",
                        ].join(" ")}
                      >
                        {monthTitle}
                      </div>

                      <button
                        className={btnGhost}
                        onClick={goNextMonth}
                        title="Mois suivant"
                        aria-label="Mois suivant"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <button className={btnGhost} onClick={jumpToday}>
                        Aujourd’hui
                      </button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className={cardGlass}>
                <CardContent className="p-3 sm:p-4 md:p-5">
                  <div className="mb-3 grid grid-cols-7 gap-1.5 sm:gap-2">
                    {WEEKDAYS.map((d) => (
                      <div
                        key={d}
                        className="text-center text-[10px] font-semibold tracking-wide text-muted-foreground sm:text-[11px]"
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {days.map((d, idx) => {
                      const ymd = toYMD(d);
                      const inMonth = isSameMonth(d, viewDate);
                      const isSelected = ymd === selectedYMD;
                      const isToday = ymd === todayYMD;

                      const col = idx % 7;
                      const isWeekend = col >= 5;

                      const events = getEventsForDayYMD(ymd, OFFICIAL_EVENTS, custom.events);
                      const types = uniqueTypes(events);

                      return (
                        <button
                          key={ymd}
                          onClick={() => onSelectDay(d)}
                          className={[
                            "relative min-h-[76px] rounded-xl border p-2 text-left transition sm:min-h-[88px] sm:rounded-2xl sm:p-2.5",
                            inMonth
                              ? "border-border/70 bg-background/30"
                              : "border-border/50 bg-background/20 opacity-70",
                            isWeekend ? "text-muted-foreground" : "text-foreground/90",
                            "hover:border-border hover:bg-accent/30",
                            isSelected ? "ring-2 ring-primary/60" : "",
                            isToday && !isSelected
                              ? "outline outline-1 outline-emerald-500/40"
                              : "",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-1 sm:gap-2">
                            <div className="text-xs font-semibold leading-none sm:text-sm">
                              {d.getDate()}
                            </div>

                            {isToday ? (
                              <span
                                className="inline-flex h-3.5 w-4 items-center justify-center sm:w-[48px]"
                                title="Aujourd’hui"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              </span>
                            ) : null}
                          </div>

                          <DotRow types={types} />

                          {events[0] ? (
                            <div className="mt-1 text-[10px] leading-4 text-muted-foreground line-clamp-2 sm:mt-2 sm:text-[11px]">
                              {(events[0] as any).label || (events[0] as any).title}
                            </div>
                          ) : (
                            <div className="mt-1 text-[10px] leading-4 text-muted-foreground/50 sm:mt-2 sm:text-[11px]">
                              —
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className={cardGlass}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Légende</div>
                    <div className="text-xs text-muted-foreground">Codes couleur</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(LEGEND).map(([k, v]) => (
                      <span
                        key={k}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs sm:text-sm ${v.pill}`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${v.dot}`} />
                        {v.label}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className={cardGlass}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs tracking-wide text-muted-foreground">DÉTAILS</div>
                      <CardTitle className="text-xl sm:text-2xl">{selectedLabel}</CardTitle>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {selectedTypes.length
                          ? selectedTypes.map((t) => LEGEND[t]?.label ?? t).join(" · ")
                          : selectedYMD === todayYMD
                          ? "Aucun événement aujourd’hui"
                          : "Aucun événement ce jour"}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdd(true)}
                      className="w-full gap-2 rounded-xl sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      Personnaliser +
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Événements</div>

                    {selectedDayEvents.filter((e) => e.source === "official").length === 0 ? (
                      <div className="text-sm text-muted-foreground">Aucun.</div>
                    ) : (
                      <div className="space-y-2">
                        {selectedDayEvents
                          .filter((e) => e.source === "official")
                          .map((e, idx) => (
                            <div
                              key={`${(e as any).type}_${idx}_${(e as any).start}`}
                              className={[
                                "rounded-2xl border px-4 py-3",
                                LEGEND[(e as any).type as LegendKey]?.pill ??
                                  "border-border/70 bg-background/30 text-foreground",
                              ].join(" ")}
                            >
                              <div className="text-sm font-semibold">{(e as any).label}</div>
                              {(e as any).start !== (e as any).end ? (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {(e as any).start} → {(e as any).end}
                                </div>
                              ) : null}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Mes événements</div>

                    {selectedDayEvents.filter((e) => e.source === "custom").length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Aucun événement personnalisé.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedDayEvents
                          .filter((e) => e.source === "custom")
                          .map((e) => (
                            <div
                              key={(e as any).id}
                              className="rounded-2xl border border-purple-400/25 bg-purple-400/10 px-4 py-3 text-purple-100"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold">
                                    {(e as any).title}
                                  </div>
                                  {(e as any).note ? (
                                    <div className="mt-1 text-xs text-muted-foreground break-words">
                                      {(e as any).note}
                                    </div>
                                  ) : null}
                                </div>

                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 shrink-0 rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
                                  onClick={() => deleteCustomEvent((e as any).id)}
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Stocké dans le navigateur (LocalStorage).
                  </div>
                </CardContent>
              </Card>

              <Card className={cardGlass}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="text-xs tracking-wide text-muted-foreground">RÉSUMÉ</div>
                      <CardTitle className="text-lg sm:text-xl">Synthèse</CardTitle>
                    </div>

                    <Badge variant="outline" className="w-fit rounded-full whitespace-normal text-left">
                      {daysRemaining} jours restants · Fin : {SCHOOL_YEAR_END}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">{SYNTHESE.title}</div>

                  <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                    {SYNTHESE.items.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {showAdd ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-2xl">
                <Card className="rounded-3xl border-border/70 bg-card/70 shadow-2xl backdrop-blur-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs tracking-wide text-muted-foreground">
                          PERSONNALISER
                        </div>
                        <CardTitle className="text-2xl font-semibold leading-tight sm:text-3xl">
                          Ajouter un événement
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">Le {selectedLabel}</div>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0 rounded-2xl"
                        onClick={() => setShowAdd(false)}
                        title="Fermer"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Titre</label>
                      <input
                        className="w-full rounded-2xl border border-border/70 bg-background/40 px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
                        placeholder="Ex : Révision intense, cours particulier, anniversaire…"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Note (optionnel)</label>
                      <textarea
                        className="min-h-[110px] w-full rounded-2xl border border-border/70 bg-background/40 px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
                        placeholder="Détails…"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl sm:w-auto"
                        onClick={() => setShowAdd(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        className="w-full rounded-2xl sm:w-auto"
                        onClick={addCustomEvent}
                        disabled={!customTitle.trim()}
                      >
                        Ajouter
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Stocké dans le navigateur (LocalStorage).
                      <span className="ml-2 inline-flex items-center rounded-full border border-border/70 bg-background/30 px-2.5 py-0.5">
                        Type: Personnalisé
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </motion.div>
      </main>
    </div>
  );
}