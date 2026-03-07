"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  Pencil,
  Save,
  Palette,
  Clock,
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

  // édition cellule
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

  // import/export json
  const [openJson, setOpenJson] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");

  // édition créneau (option Apple Calendar)
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

  function updateMeta(patch: Partial<TimetableStateV1["meta"]>) {
    persist({ ...state, meta: { ...state.meta, ...patch } });
  }

  function toggleDay(key: WeekdayKey) {
    const days = state.days.map((d) => (d.key === key ? { ...d, enabled: !d.enabled } : d));
    persist({ ...state, days });
  }

  function addPeriod() {
    const p: TimetablePeriod = {
      id: `p_${uid()}`,
      label: `P${state.periods.length + 1}`,
      start: "12:10",
      end: "13:00",
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-serif">
                  Horaire de cours
                </h1>
                <p className="text-muted-foreground">
                  100% personnalisable · Sauvegarde automatique · Dernière maj :{" "}
                  <span className="font-medium">{lastUpdate}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={onImport}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={doReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Haut de page */}
          <div className="grid gap-6 lg:grid-cols-3 mb-12">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Infos</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Titre</div>
                  <Input
                    value={state.meta.title}
                    onChange={(e) => updateMeta({ title: e.target.value })}
                    placeholder="Horaire de cours"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">École (optionnel)</div>
                  <Input
                    value={(state.meta as any).school ?? ""}
                    onChange={(e) => updateMeta({ school: e.target.value } as any)}
                    placeholder="Ex: Institut ..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Année (optionnel)</div>
                  <Input
                    value={(state.meta as any).year ?? ""}
                    onChange={(e) => updateMeta({ year: e.target.value } as any)}
                    placeholder="2025-2026"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Jours affichés</CardTitle>
                <Badge variant="secondary">{visibleDays.length} jours</Badge>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-2">
                {enabledDays.map((d) => (
                  <Button
                    key={d.key}
                    size="sm"
                    variant={d.enabled ? "default" : "outline"}
                    onClick={() => toggleDay(d.key)}
                  >
                    {d.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Créneaux */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold font-serif">Créneaux</h2>
            <Button onClick={addPeriod}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un créneau
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {state.periods.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{p.label}</CardTitle>
                      <div className="mt-2 text-muted-foreground">
                        {p.start} → {p.end}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title="Modifier"
                        onClick={() => openPeriodEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        title="Supprimer"
                        onClick={() => deletePeriod(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="grid grid-cols-3 gap-2">
                  <Input
                    value={p.label}
                    onChange={(e) => updatePeriod(p.id, { label: e.target.value })}
                    placeholder="P1"
                  />
                  <Input
                    value={p.start}
                    onChange={(e) => updatePeriod(p.id, { start: e.target.value })}
                    placeholder="07:30"
                  />
                  <Input
                    value={p.end}
                    onChange={(e) => updatePeriod(p.id, { end: e.target.value })}
                    placeholder="08:20"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grille */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold font-serif">Grille</h2>
            <div className="text-sm text-muted-foreground">
              Clique une case pour éditer.
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full overflow-auto">
                <div className="min-w-[900px]">
                  <div
                    className="grid border-b"
                    style={{
                      gridTemplateColumns: `220px repeat(${visibleDays.length}, 1fr)`,
                    }}
                  >
                    <div className="px-5 py-4 text-sm font-medium">Créneaux</div>
                    {visibleDays.map((d) => (
                      <div key={d.key} className="px-5 py-4 text-sm font-medium">
                        {d.label}
                      </div>
                    ))}
                  </div>

                  {state.periods.map((p) => (
                    <div
                      key={p.id}
                      className="grid border-b last:border-b-0"
                      style={{
                        gridTemplateColumns: `220px repeat(${visibleDays.length}, 1fr)`,
                      }}
                    >
                      <div className="px-5 py-5">
                        <div className="font-semibold">{p.label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {p.start} → {p.end}
                        </div>
                      </div>

                      {visibleDays.map((d) => {
                        const entry = grid?.[d.key]?.[p.id];
                        const has = !!entry?.subject?.trim();

                        return (
                          <button
                            key={`${d.key}_${p.id}`}
                            onClick={() => openCellEditor(d.key, p.id)}
                            className={[
                              "px-5 py-5 text-left transition border-l hover:bg-muted/30",
                              has ? "relative overflow-hidden" : "",
                            ].join(" ")}
                          >
                            {has ? (
  <>
    <div
      className={[
        "absolute inset-0 opacity-10 bg-gradient-to-br",
        entry?.color ?? COLOR_PRESETS[0],
      ].join(" ")}
    />

    {!(entry?.room || entry?.teacher || entry?.note) ? (
      <div className="relative flex items-center justify-center h-full">
        <div className="font-semibold text-base">
          {entry?.subject}
        </div>
      </div>
    ) : (
      <div className="relative">
        <div className="font-semibold line-clamp-1">
          {entry?.subject}
        </div>

        {entry?.room || entry?.teacher ? (
          <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
            {(entry?.room ? `Salle ${entry.room}` : "") +
              (entry?.teacher ? ` • ${entry.teacher}` : "")}
          </div>
        ) : null}

        {entry?.note ? (
          <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {entry.note}
          </div>
        ) : null}
      </div>
    )}
  </>
) : (
  <div className="text-muted-foreground">—</div>
)}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modal édition cellule */}
          <Dialog open={openCell} onOpenChange={setOpenCell}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Éditer un cours</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
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

                <div className="grid grid-cols-2 gap-2">
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
                  <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Couleur
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setDraft((d) => ({ ...d, color: c }))}
                        className={[
                          "h-10 w-16 rounded-xl border relative overflow-hidden",
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

              <DialogFooter className="flex flex-row gap-2 justify-between sm:justify-between">
                <Button variant="outline" onClick={clearCell}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpenCell(false)}>
                    Annuler
                  </Button>
                  <Button onClick={saveCell}>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal édition créneau - style Apple Calendar */}
          <Dialog open={openPeriodEditor} onOpenChange={setOpenPeriodEditor}>
            <DialogContent className="sm:max-w-md rounded-3xl border border-border/70 bg-background/95 backdrop-blur-xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Modifier le créneau</DialogTitle>
              </DialogHeader>

              {editingPeriod && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Nom du créneau</div>
                    <Input
                      value={editingPeriod.label}
                      onChange={(e) =>
                        setEditingPeriod((p) =>
                          p ? { ...p, label: e.target.value } : p
                        )
                      }
                      className="h-11 rounded-2xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Début</div>
                      <Input
                        type="time"
                        value={editingPeriod.start}
                        onChange={(e) =>
                          setEditingPeriod((p) =>
                            p ? { ...p, start: e.target.value } : p
                          )
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
                          setEditingPeriod((p) =>
                            p ? { ...p, end: e.target.value } : p
                          )
                        }
                        className="h-11 rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      Aperçu
                    </div>
                    <div className="text-lg font-semibold">{editingPeriod.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {editingPeriod.start} → {editingPeriod.end}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex gap-2 sm:justify-end">
                <Button variant="outline" onClick={() => setOpenPeriodEditor(false)} className="rounded-2xl">
                  Annuler
                </Button>
                <Button onClick={savePeriodEdit} className="rounded-2xl">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Import / Export JSON */}
          <Dialog open={openJson} onOpenChange={setOpenJson}>
            <DialogContent className="sm:max-w-3xl">
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
                  className="min-h-[320px] font-mono text-xs"
                />
              </div>

              <DialogFooter className="flex flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setJsonDraft(exportTimetableJson());
                  }}
                >
                  Recharger l’export
                </Button>
                <Button variant="outline" onClick={() => setOpenJson(false)}>
                  Fermer
                </Button>
                <Button onClick={doImport}>Importer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </div>
  );
}