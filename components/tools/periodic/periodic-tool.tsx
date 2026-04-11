'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Atom, Search, X, Info, Layers, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import elementsData from '@/lib/tools/periodic/data/periodicTable.enriched.json';
import extrasData from '@/lib/tools/periodic/data/periodicTable.extras.json';

import type { PeriodicElement } from '@/lib/tools/periodic/types';

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  alkali_metal: { label: 'Métaux alcalins', color: '#b74a3a' },
  alkaline_earth_metal: { label: 'Alcalino-terreux', color: '#b86b2d' },
  transition_metal: { label: 'Métaux de transition', color: '#2f6aa3' },
  post_transition_metal: { label: 'Autres métaux', color: '#2f7f6c' },
  metalloid: { label: 'Métalloïdes', color: '#5d7d3a' },
  nonmetal: { label: 'Autres non-métaux', color: '#3a8a4b' },
  halogen: { label: 'Halogènes', color: '#7a49a8' },
  noble_gas: { label: 'Gaz nobles', color: '#2c8fb0' },
  lanthanide: { label: 'Lanthanides', color: '#4b5563' },
  actinide: { label: 'Actinides', color: '#6b7280' },
};

function catLabel(key?: string | null) {
  return CATEGORY_META[key ?? '']?.label || key || '—';
}

function catColor(key?: string | null) {
  return CATEGORY_META[key ?? '']?.color || '#475569';
}

function toKey(period?: number | null, group?: number | null) {
  return `${period}-${group}`;
}

function normalize(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatMaybe(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function formatOxidation(
  states: Array<string | number> | null | undefined,
  common: string | number | null | undefined
) {
  const arr = Array.isArray(states) ? states : [];
  if (!arr.length) return '—';

  return arr
    .map((item) =>
      common !== undefined && common !== null && item === common ? `*${item}*` : `${item}`
    )
    .join(', ');
}

export function PeriodicTool() {
  const [queryInput, setQueryInput] = useState('');
  const [selected, setSelected] = useState<PeriodicElement | null>(null);

  const enrichedElements = useMemo<PeriodicElement[]>(() => {
    const extras = (extrasData ?? {}) as Record<string, Partial<PeriodicElement>>;
    const base = (elementsData ?? []) as PeriodicElement[];

    return base.map((element) => {
      const more = extras[element.symbol] || {};
      return {
        ...element,
        ...more,
      };
    });
  }, []);

  const query = normalize(queryInput.trim());

  const filtered = useMemo(() => {
    if (!query) return enrichedElements;

    return enrichedElements.filter((element) => {
      const atomic = String(element.z);
      const symbol = normalize(element.symbol);
      const name = normalize(element.name);

      return atomic.includes(query) || symbol.includes(query) || name.includes(query);
    });
  }, [query, enrichedElements]);

  const visibleSet = useMemo(() => {
    const set = new Set<number>();
    for (const element of filtered) {
      set.add(element.z);
    }
    return set;
  }, [filtered]);

  const grid = useMemo(() => {
    const map = new Map<string, PeriodicElement>();

    for (const element of enrichedElements) {
      if (element.period && element.group) {
        map.set(toKey(element.period, element.group), element);
      }
    }

    return map;
  }, [enrichedElements]);

  const lanthanides = useMemo(
    () => enrichedElements.filter((element) => element.category === 'lanthanide'),
    [enrichedElements]
  );

  const actinides = useMemo(
    () => enrichedElements.filter((element) => element.category === 'actinide'),
    [enrichedElements]
  );

  const showFiltered = query.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-4 sm:space-y-8"
    >
      <section className="order-2 space-y-2 lg:order-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Atom className="h-4 w-4" />
          <span>Outils interactifs</span>
        </div>

        <h1 className="text-3xl font-bold font-serif leading-tight sm:text-4xl">
          Tableau périodique interactif
        </h1>

        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Explore les 118 éléments, recherche par symbole, nom ou numéro atomique, puis ouvre
          la fiche détaillée de chaque élément.
        </p>
      </section>

      <div className="order-3 grid gap-4 sm:gap-5 lg:order-2 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6">
        <Card className="rounded-2xl border-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="h-5 w-5 text-primary" />
              Recherche intelligente
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Tape un nom, un symbole ou un numéro atomique (ex : Fer, Fe, 26)"
                className="pl-10 pr-12"
              />
              {queryInput ? (
                <button
                  type="button"
                  onClick={() => setQueryInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm">
                {showFiltered ? `${filtered.length} résultat(s)` : '118 éléments'}
              </Badge>

              <Badge variant="outline" className="text-sm">
                Groupes 1 à 18
              </Badge>

              <Badge variant="outline" className="text-sm">
                7 périodes
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-xl border bg-card px-3 py-3"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-sm text-muted-foreground">{meta.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Aperçu
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <MiniInfoCard
              title="Éléments"
              value="118"
              description="Base complète du tableau périodique"
            />
            <MiniInfoCard
              title="Recherche"
              value="Nom / Symbole / Z"
              description="Filtrage instantané"
            />
            <MiniInfoCard
              title="Fiche"
              value="Détails enrichis"
              description="Valence, état, oxydation, position"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="order-1 overflow-hidden rounded-2xl border-primary/10 lg:order-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Layers className="h-5 w-5 text-primary" />
            Table des éléments
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Groupes en haut, périodes à gauche, lanthanides et actinides en bas.
          </p>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[1120px] sm:min-w-[1320px] xl:min-w-[1400px]">
              <div className="grid grid-cols-[34px_repeat(18,minmax(0,1fr))] gap-1.5 text-[10px] text-muted-foreground sm:grid-cols-[40px_repeat(18,minmax(0,1fr))] sm:gap-2 sm:text-[11px]">
                <div />
                {Array.from({ length: 18 }, (_, index) => (
                  <div key={index} className="text-center">
                    {index + 1}
                  </div>
                ))}
              </div>

              <div className="mt-2 space-y-1.5 sm:space-y-2">
                {Array.from({ length: 7 }, (_, rowIndex) => {
                  const period = rowIndex + 1;

                  return (
                    <div
                      key={period}
                      className="grid grid-cols-[34px_repeat(18,minmax(0,1fr))] gap-1.5 sm:grid-cols-[40px_repeat(18,minmax(0,1fr))] sm:gap-2"
                    >
                      <div className="flex items-center justify-center text-[10px] text-muted-foreground sm:text-[11px]">
                        {period}
                      </div>

                      {Array.from({ length: 18 }, (_, colIndex) => {
                        const group = colIndex + 1;
                        const element = grid.get(toKey(period, group));

                        if (showFiltered && element && !visibleSet.has(element.z)) {
                          return <EmptyCell key={group} />;
                        }

                        if (!element) {
                          return <EmptyCell key={group} />;
                        }

                        return (
                          <ElementCell
                            key={group}
                            element={element}
                            onClick={() => setSelected(element)}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                <BandRow
                  label="LANTHANIDES"
                  items={lanthanides}
                  visibleSet={visibleSet}
                  showFiltered={showFiltered}
                  onPick={setSelected}
                />
                <BandRow
                  label="ACTINIDES"
                  items={actinides}
                  visibleSet={visibleSet}
                  showFiltered={showFiltered}
                  onPick={setSelected}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-4xl overflow-hidden rounded-2xl p-0 sm:w-full">
          {selected ? (
            <ScrollArea className="max-h-[85vh]">
              <div className="p-4 sm:p-6 lg:p-8">
                <DialogHeader className="space-y-3 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{selected.symbol}</Badge>
                    <Badge variant="outline">#{selected.z}</Badge>
                    <Badge variant="outline">{catLabel(selected.category)}</Badge>
                  </div>

                  <DialogTitle className="text-2xl font-bold font-serif sm:text-3xl">
                    {selected.name}
                  </DialogTitle>

                  <DialogDescription className="text-sm sm:text-base">
                    Fiche détaillée de l’élément sélectionné.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-3">
                  <InfoCard title="Masse atomique" value={formatMaybe(selected.weight)} />
                  <InfoCard
                    title="Électronégativité"
                    value={formatMaybe(selected.electronegativity)}
                  />
                  <InfoCard
                    title="Énergie d’ionisation (kJ/mol)"
                    value={formatMaybe(selected.ionizationEnergyKJ)}
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-3">
                  <InfoCard title="Valence" value={formatMaybe(selected.valence)} />
                  <InfoCard
                    title="Oxydation commune"
                    value={formatMaybe(selected.commonOxidation)}
                  />
                  <InfoCard title="État" value={formatMaybe(selected.state)} />
                </div>

                <div className="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-2">
                  <Card className="rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Configuration électronique
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {selected.electronConfig ?? '—'}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Position dans le tableau</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <div>
                        Période :{' '}
                        <span className="font-semibold text-foreground">
                          {formatMaybe(selected.period)}
                        </span>
                      </div>
                      <div>
                        Groupe :{' '}
                        <span className="font-semibold text-foreground">
                          {formatMaybe(selected.group)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        Couleur :
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: catColor(selected.category) }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-4 rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">États d’oxydation</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <OxidationText
                      text={formatOxidation(
                        selected.oxidationStates,
                        selected.commonOxidation
                      )}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Le plus courant est mis en évidence.
                    </p>
                  </CardContent>
                </Card>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">Famille : {catLabel(selected.category)}</Badge>
                  <Badge variant="outline">Symbole : {selected.symbol}</Badge>
                  <Badge variant="outline">Numéro atomique : {selected.z}</Badge>
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                  <Button onClick={() => setSelected(null)} className="w-full sm:w-auto">
                    Fermer
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const next = enrichedElements.find(
                        (element) => element.z === selected.z + 1
                      );
                      if (next) setSelected(next);
                    }}
                  >
                    Élément suivant
                  </Button>
                </div>

                <div className="mt-6 flex items-start gap-2 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Astuce : écris par exemple{' '}
                    <span className="font-medium text-foreground">Fe</span>,
                    <span className="font-medium text-foreground"> Fer</span> ou
                    <span className="font-medium text-foreground"> 26</span> dans la barre de
                    recherche pour filtrer rapidement.
                  </p>
                </div>
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function MiniInfoCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="rounded-2xl border-primary/10">
      <CardContent className="p-4 sm:p-5">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="mt-2 text-base font-bold sm:text-lg">{value}</div>
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="break-words text-base font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function EmptyCell() {
  return (
    <div className="h-[62px] rounded-xl border border-dashed bg-muted/20 sm:h-[74px]" />
  );
}

function ElementCell({
  element,
  onClick,
}: {
  element: PeriodicElement;
  onClick: () => void;
}) {
  const color = catColor(element.category);

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${element.name} (${element.symbol})`}
      className="group h-[62px] overflow-hidden rounded-xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:h-[74px]"
    >
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="flex h-[calc(62px-4px)] flex-col justify-between px-2 py-1.5 sm:h-[calc(74px-4px)] sm:px-3 sm:py-2">
        <div className="flex items-start justify-between">
          <span className="text-[9px] leading-none text-muted-foreground sm:text-[10px]">
            {element.z}
          </span>

          <span
            className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
            style={{ backgroundColor: color }}
          />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <span className="text-[18px] font-bold leading-none tracking-wide sm:text-[22px]">
            {element.symbol}
          </span>
        </div>

        <div className="text-center text-[9px] leading-none text-muted-foreground sm:text-[11px]">
          {element.weight ?? '—'}
        </div>
      </div>
    </button>
  );
}

function BandRow({
  label,
  items,
  visibleSet,
  showFiltered,
  onPick,
}: {
  label: string;
  items: PeriodicElement[];
  visibleSet: Set<number>;
  showFiltered: boolean;
  onPick: (element: PeriodicElement) => void;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-1.5 sm:grid-cols-[140px_1fr] sm:gap-2">
      <div className="flex h-[62px] items-center text-[10px] text-muted-foreground sm:h-[74px] sm:text-[11px]">
        {label}
      </div>

      <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1.5 sm:gap-2">
        {items.slice(0, 15).map((element) => {
          if (showFiltered && !visibleSet.has(element.z)) {
            return (
              <div
                key={element.z}
                className="h-[62px] rounded-xl border border-dashed bg-muted/20 sm:h-[74px]"
              />
            );
          }

          return (
            <ElementCell
              key={element.z}
              element={element}
              onClick={() => onPick(element)}
            />
          );
        })}
      </div>
    </div>
  );
}

function OxidationText({ text }: { text: string }) {
  if (text === '—') {
    return <span>—</span>;
  }

  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);

  return (
    <span>
      {parts.map((part, index) => {
        const isBold = part.startsWith('*') && part.endsWith('*');
        const clean = isBold ? part.slice(1, -1) : part;

        return isBold ? (
          <strong key={index} className="font-semibold text-foreground">
            {clean}
          </strong>
        ) : (
          <span key={index}>{clean}</span>
        );
      })}
    </span>
  );
}