"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  Palette,
} from "lucide-react";

import type {
  TimetableEntry,
  TimetablePeriod,
  TimetableStateV1,
  WeekdayKey,
} from "@/lib/tools/timetable-types";
import { defaultTimetableState } from "@/lib/tools/timetable-types";
import {
  readTimetable,
  writeTimetable,
  resetTimetable,
  exportTimetableJson,
  importTimetableJson,
} from "@/lib/tools/timetable-store";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const DAY_ORDER: WeekdayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const COLOR_PRESETS = [
  "from-blue-600/15 to-cyan-600/10",
  "from-emerald-600/15 to-lime-600/10",
  "from-purple-600/15 to-fuchsia-600/10",
  "from-amber-500/20 to-yellow-500/10",
  "from-rose-600/15 to-pink-600/10",
  "from-slate-600/15 to-zinc-600/10",
];

export default function TimetablePage() {
  const [state, setState] = useState<TimetableStateV1>(() => defaultTimetableState());
  const [isLoading, setIsLoading] = useState(true);

  const [openCell, setOpenCell] = useState(false);
  const [cellDay, setCellDay] = useState<WeekdayKey>("mon");
  const [cellPeriodId, setCellPeriodId] = useState<string>("p1");
  const [draft, setDraft] = useState<TimetableEntry>({
    subject: "",
    room: "",
    teacher: "",
    note: "",
    color: COLOR_PRESETS[0],
  });

  const [openJson, setOpenJson] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");

  const [openPeriodEditor, setOpenPeriodEditor] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<TimetablePeriod | null>(null);

  useEffect(() => {
    const load = () => {
      const s = readTimetable();
      setState(s);
      setIsLoading(false);
    };
    load();

    const onUpd = () => setState(readTimetable());
    window.addEventListener("edustat_timetable_updated", onUpd);
    return () => window.removeEventListener("edustat_timetable_updated", onUpd);
  }, []);

  const enabledDays = useMemo(() => {
    const byKey = new Map(state.days.map((d) => [d.key, d]));
    return DAY_ORDER.map((k) => byKey.get(k)).filter(Boolean) as TimetableStateV1["days"];
  }, [state.days]);

  const visibleDays = enabledDays.filter((d) => d.enabled);
  const grid = state.grid ?? {};

  const lastUpdate = useMemo(() => {
    const d = new Date(state.meta.updatedAt ?? Date.now());
    const pad2 = (n: number) => String(n).padStart(2, "0");
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(
      d.getHours()
    )}:${pad2(d.getMinutes())}`;
  }, [state.meta.updatedAt]);

  function persist(next: TimetableStateV1) {
    setState(next);
    writeTimetable(next);
  }

  function toggleDay(key: WeekdayKey) {
    const days = state.days.map((d) => (d.key === key ? { ...d, enabled: !d.enabled } : d));
    persist({ ...state, days });
  }

  function addPeriod() {
    const p: TimetablePeriod = {
      id: `p_${uid()}`,
      label: `P${state.periods.length + 1}`,
      start: "07:30",
      end: "08:20",
    };
    persist({ ...state, periods: [...state.periods, p] });
  }

  function updatePeriod(id: string, patch: Partial<TimetablePeriod>) {
    const periods = state.periods.map((p) => (p.id === id ? { ...p, ...patch } : p));
    persist({ ...state, periods });
  }

  function deletePeriod(id: string) {
    const periods = state.periods.filter((p) => p.id !== id);
    const nextGrid: TimetableStateV1["grid"] = { ...grid };

    for (const day of Object.keys(nextGrid) as WeekdayKey[]) {
      const row = { ...(nextGrid[day] ?? {}) };
      delete row[id];
      nextGrid[day] = row;
    }

    persist({ ...state, periods, grid: nextGrid });
  }

  function openCellEditor(day: WeekdayKey, periodId: string) {
    const existing = grid?.[day]?.[periodId];
    setCellDay(day);
    setCellPeriodId(periodId);
    setDraft(
      existing
        ? { ...existing }
        : { subject: "", room: "", teacher: "", note: "", color: COLOR_PRESETS[0] }
    );
    setOpenCell(true);
  }

  function saveCell() {
    const subject = (draft.subject ?? "").trim();
    const nextGrid: TimetableStateV1["grid"] = { ...grid };
    const dayRow = { ...(nextGrid[cellDay] ?? {}) };

    if (!subject) {
      delete dayRow[cellPeriodId];
      nextGrid[cellDay] = dayRow;
      persist({ ...state, grid: nextGrid });
      setOpenCell(false);
      return;
    }

    dayRow[cellPeriodId] = {
      subject,
      room: (draft.room ?? "").trim(),
      teacher: (draft.teacher ?? "").trim(),
      note: (draft.note ?? "").trim(),
      color: draft.color ?? COLOR_PRESETS[0],
    };
    nextGrid[cellDay] = dayRow;

    persist({ ...state, grid: nextGrid });
    setOpenCell(false);
  }

  function clearCell() {
    const nextGrid: TimetableStateV1["grid"] = { ...grid };
    const dayRow = { ...(nextGrid[cellDay] ?? {}) };
    delete dayRow[cellPeriodId];
    nextGrid[cellDay] = dayRow;
    persist({ ...state, grid: nextGrid });
    setOpenCell(false);
  }

  function onExport() {
    setJsonDraft(exportTimetableJson());
    setOpenJson(true);
  }

  function onImport() {
    setJsonDraft(exportTimetableJson());
    setOpenJson(true);
  }

  function doImport() {
    try {
      const next = importTimetableJson(jsonDraft);
      setState(next);
      setOpenJson(false);
    } catch (e: any) {
      alert(e?.message ?? "Import impossible.");
    }
  }

  function doReset() {
    const ok = confirm("Reset complet de l’horaire ? (Tout sera effacé)");
    if (!ok) return;
    resetTimetable();
    setState(readTimetable());
  }

  function openPeriodEdit(period: TimetablePeriod) {
    setEditingPeriod({ ...period });
    setOpenPeriodEditor(true);
  }

  function savePeriodEdit() {
    if (!editingPeriod) return;

    updatePeriod(editingPeriod.id, {
      label: editingPeriod.label,
      start: editingPeriod.start,
      end: editingPeriod.end,
    });

    setOpenPeriodEditor(false);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary sm:h-12 sm:w-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-5 sm:mb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className="mb-2 text-2xl font-bold font-serif leading-tight sm:text-4xl">
                  Horaire de cours
                </h1>
                <p className="text-xs leading-5 text-muted-foreground sm:text-base sm:leading-6">
                  Sauvegarde automatique · Dernière maj :{" "}
                  <span className="font-medium">{lastUpdate}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                <Button variant="outline" size="sm" onClick={onImport} className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={onExport} className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={doReset}
                  className="col-span-2 w-full sm:col-span-1 sm:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <section className="mb-4 sm:mb-6">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif sm:text-2xl">Tableau</h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Clique sur une case pour modifier son contenu.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {enabledDays.map((d) => (
                  <Button
                    key={d.key}
                    size="sm"
                    variant={d.enabled ? "default" : "outline"}
                    onClick={() => toggleDay(d.key)}
                    className="h-9"
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[720px] sm:min-w-[920px]">
                    <div
                      className="grid border-b bg-muted/20"
                      style={{
                        gridTemplateColumns: `120px repeat(${visibleDays.length}, minmax(110px, 1fr))`,
                      }}
                    >
                      <div className="px-3 py-3 text-xs font-semibold uppercase tracking-wide sm:px-5 sm:py-4 sm:text-sm">
                        Créneaux
                      </div>
                      {visibleDays.map((d) => (
                        <div
                          key={d.key}
                          className="px-3 py-3 text-xs font-semibold uppercase tracking-wide sm:px-5 sm:py-4 sm:text-sm"
                        >
                          {d.label}
                        </div>
                      ))}
                    </div>

                    {state.periods.map((p) => (
                      <div
                        key={p.id}
                        className="grid border-b last:border-b-0"
                        style={{
                          gridTemplateColumns: `120px repeat(${visibleDays.length}, minmax(110px, 1fr))`,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => openPeriodEdit(p)}
                          className="bg-muted/10 px-2 py-3 text-left transition hover:bg-muted/30 sm:px-5 sm:py-5"
                        >
                          <div className="text-sm font-semibold sm:text-base">{p.label}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground sm:text-sm">
                            {p.start} → {p.end}
                          </div>
                        </button>

                        {visibleDays.map((d) => {
                          const entry = grid?.[d.key]?.[p.id];
                          const has = !!entry?.subject?.trim();

                          return (
                            <button
                              key={`${d.key}_${p.id}`}
                              onClick={() => openCellEditor(d.key, p.id)}
                              className={[
                                "min-h-[88px] border-l px-2 py-3 text-left transition hover:bg-muted/30 sm:min-h-[110px] sm:px-4 sm:py-4",
                                has ? "relative overflow-hidden" : "",
                              ].join(" ")}
                            >
                              {has ? (
                                <>
                                  <div
                                    className={[
                                      "absolute inset-0 bg-gradient-to-br opacity-10",
                                      entry?.color ?? COLOR_PRESETS[0],
                                    ].join(" ")}
                                  />

                                  {!(entry?.room || entry?.teacher || entry?.note) ? (
                                    <div className="relative flex h-full items-center justify-center">
                                      <div className="line-clamp-2 text-center text-xs font-semibold sm:text-sm">
                                        {entry?.subject}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative min-w-0">
                                      <div className="line-clamp-2 text-xs font-semibold sm:text-sm">
                                        {entry?.subject}
                                      </div>

                                      {entry?.room || entry?.teacher ? (
                                        <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground sm:text-xs">
                                          {(entry?.room ? `Salle ${entry.room}` : "") +
                                            (entry?.teacher ? ` • ${entry.teacher}` : "")}
                                        </div>
                                      ) : null}

                                      {entry?.note ? (
                                        <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                                          {entry.note}
                                        </div>
                                      ) : null}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center text-xs text-muted-foreground sm:text-sm">—</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}

                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `120px repeat(${visibleDays.length}, minmax(110px, 1fr))`,
                      }}
                    >
                      <div className="border-t bg-muted/10 px-2 py-3 sm:px-5 sm:py-4">
                        <Button
                          onClick={addPeriod}
                          variant="outline"
                          className="h-10 w-full justify-center rounded-xl"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>

                      {visibleDays.map((d) => (
                        <div
                          key={`add_${d.key}`}
                          className="border-l border-t bg-background/50"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Dialog open={openCell} onOpenChange={setOpenCell}>
            <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl p-4 sm:max-w-lg sm:p-6">
              <DialogHeader>
                <DialogTitle>Éditer un cours</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{cellDay}</Badge>
                  <Badge variant="outline">{cellPeriodId}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Cours (obligatoire)</div>
                  <Input
                    value={draft.subject ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
                    placeholder="Ex: Math, Physique, Chimie..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Salle</div>
                    <Input
                      value={draft.room ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, room: e.target.value }))}
                      placeholder="Ex: B12"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Prof</div>
                    <Input
                      value={draft.teacher ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, teacher: e.target.value }))}
                      placeholder="Ex: Mme Julie"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Note</div>
                  <Textarea
                    value={draft.note ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                    placeholder="Ex: contrôle vendredi, devoir..."
                    className="min-h-[90px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    Couleur
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setDraft((d) => ({ ...d, color: c }))}
                        className={[
                          "relative h-10 w-14 overflow-hidden rounded-xl border sm:w-16",
                          draft.color === c ? "ring-2 ring-primary" : "hover:border-primary/50",
                        ].join(" ")}
                        title={c}
                        type="button"
                      >
                        <div className={["absolute inset-0 bg-gradient-to-br opacity-60", c].join(" ")} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" onClick={clearCell} className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => setOpenCell(false)}
                    className="w-full sm:w-auto"
                  >
                    Annuler
                  </Button>
                  <Button onClick={saveCell} className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openPeriodEditor} onOpenChange={setOpenPeriodEditor}>
            <DialogContent className="w-[calc(100vw-1rem)] rounded-3xl border border-border/70 bg-background/95 p-4 shadow-2xl backdrop-blur-xl sm:max-w-md sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold sm:text-xl">
                  Modifier le créneau
                </DialogTitle>
              </DialogHeader>

              {editingPeriod && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Nom du créneau</div>
                    <Input
                      value={editingPeriod.label}
                      onChange={(e) =>
                        setEditingPeriod((p) => (p ? { ...p, label: e.target.value } : p))
                      }
                      className="h-11 rounded-2xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Début</div>
                      <Input
                        type="time"
                        value={editingPeriod.start}
                        onChange={(e) =>
                          setEditingPeriod((p) => (p ? { ...p, start: e.target.value } : p))
                        }
                        className="h-11 rounded-2xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Fin</div>
                      <Input
                        type="time"
                        value={editingPeriod.end}
                        onChange={(e) =>
                          setEditingPeriod((p) => (p ? { ...p, end: e.target.value } : p))
                        }
                        className="h-11 rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Aperçu
                    </div>
                    <div className="text-lg font-semibold">{editingPeriod.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {editingPeriod.start} → {editingPeriod.end}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      deletePeriod(editingPeriod.id);
                      setOpenPeriodEditor(false);
                    }}
                    className="w-full rounded-2xl"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer ce créneau
                  </Button>
                </div>
              )}

              <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpenPeriodEditor(false)}
                  className="w-full rounded-2xl sm:w-auto"
                >
                  Annuler
                </Button>
                <Button onClick={savePeriodEdit} className="w-full rounded-2xl sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openJson} onOpenChange={setOpenJson}>
            <DialogContent className="w-[calc(100vw-1rem)] rounded-2xl p-4 sm:max-w-3xl sm:p-6">
              <DialogHeader>
                <DialogTitle>Import / Export (JSON)</DialogTitle>
              </DialogHeader>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Tu peux sauvegarder ce JSON ailleurs ou coller un JSON pour restaurer l’horaire.
                </div>
                <Textarea
                  value={jsonDraft}
                  onChange={(e) => setJsonDraft(e.target.value)}
                  className="min-h-[260px] font-mono text-xs sm:min-h-[320px]"
                />
              </div>

              <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setJsonDraft(exportTimetableJson());
                  }}
                  className="w-full sm:w-auto"
                >
                  Recharger l’export
                </Button>
                <Button variant="outline" onClick={() => setOpenJson(false)} className="w-full sm:w-auto">
                  Fermer
                </Button>
                <Button onClick={doImport} className="w-full sm:w-auto">
                  Importer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </div>
  );
}