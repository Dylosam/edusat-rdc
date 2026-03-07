'use client';

import { Check, Search, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
  AVAILABLE_GOALS_BY_SERIES,
  STATISTIC_GOALS,
  STATISTICS_SERIES_TYPES,
} from '@/lib/tools/statistics/constants';
import type {
  StatisticChartType,
  StatisticGoal,
  StatisticsSeriesType,
} from '@/lib/tools/statistics/types';

interface StatisticsToolbarProps {
  seriesType: StatisticsSeriesType;
  onSeriesTypeChange: (seriesType: StatisticsSeriesType) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedGoals: StatisticGoal[];
  onToggleGoal: (goal: StatisticGoal) => void;
  onApplyGoals: (goals: StatisticGoal[]) => void;
  onClearGoals: () => void;
  chartType: StatisticChartType;
  onChartTypeChange: (type: StatisticChartType) => void;
}

const CHART_OPTIONS: Array<{
  key: StatisticChartType;
  label: string;
}> = [
  { key: 'bar', label: 'Barres' },
  { key: 'line', label: 'Courbe' },
  { key: 'pie', label: 'Camembert' },
  { key: 'histogram', label: 'Histogramme' },
  { key: 'scatter', label: 'Nuage' },
  { key: 'none', label: 'Aucun' },
];

const GOAL_PRESETS: Array<{
  key: string;
  label: string;
  goals: StatisticGoal[];
}> = [
  {
    key: 'mean-pack',
    label: 'Moyenne',
    goals: ['mean'],
  },
  {
    key: 'variance-pack',
    label: 'Variance',
    goals: ['mean', 'variance', 'stdDev'],
  },
  {
    key: 'quartiles-pack',
    label: 'Quartiles',
    goals: ['median', 'quartiles'],
  },
  {
    key: 'frequency-pack',
    label: 'Fréquences',
    goals: ['frequency'],
  },
  {
    key: 'correlation-pack',
    label: 'Corrélation',
    goals: ['mean', 'variance', 'stdDev', 'correlation'],
  },
];

export function StatisticsToolbar({
  seriesType,
  onSeriesTypeChange,
  search,
  onSearchChange,
  selectedGoals,
  onToggleGoal,
  onApplyGoals,
  onClearGoals,
  chartType,
  onChartTypeChange,
}: StatisticsToolbarProps) {
  const availableGoals = AVAILABLE_GOALS_BY_SERIES[seriesType] ?? [];

  const filteredGoals = useMemo(() => {
    const query = search.trim().toLowerCase();

    const baseGoals = STATISTIC_GOALS.filter((goal) =>
      availableGoals.includes(goal.key)
    );

    if (!query) return baseGoals;

    return baseGoals.filter((goal) => {
      const haystack = [goal.label, goal.description].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [search, availableGoals]);

  const visiblePresets = useMemo(() => {
    return GOAL_PRESETS.filter((preset) =>
      preset.goals.every((goal) => availableGoals.includes(goal))
    );
  }, [availableGoals]);

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl">Paramètres du tableau</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Choisissez le type de série, les calculs à effectuer et le type de graphique.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={onClearGoals}>
            Réinitialiser les calculs
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="font-semibold">Type de série</h4>

          <div className="grid gap-4 md:grid-cols-3">
            {STATISTICS_SERIES_TYPES.map((item) => {
              const active = item.key === seriesType;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSeriesTypeChange(item.key)}
                  className={[
                    'rounded-xl border p-4 text-left transition-all',
                    active
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-background hover:border-primary/40 hover:bg-muted/40',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    {active ? (
                      <div className="rounded-full bg-primary/10 p-1.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Rechercher : moyenne, variance, corrélation..."
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CHART_OPTIONS.map((option) => {
              const active = chartType === option.key;

              return (
                <Button
                  key={option.key}
                  type="button"
                  variant={active ? 'default' : 'outline'}
                  onClick={() => onChartTypeChange(option.key)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {visiblePresets.map((preset) => (
            <Button
              key={preset.key}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onApplyGoals(preset.goals)}
              className="rounded-full"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold">Calculs demandés</h4>
            <Badge variant="secondary">
              {selectedGoals.length} sélectionné
              {selectedGoals.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredGoals.map((goal) => {
              const active = selectedGoals.includes(goal.key);

              return (
                <button
                  key={goal.key}
                  type="button"
                  onClick={() => onToggleGoal(goal.key)}
                  title={goal.description}
                  className={[
                    'rounded-full border px-4 py-2 text-sm transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-muted',
                  ].join(' ')}
                >
                  <span className="font-medium">{goal.label}</span>
                </button>
              );
            })}
          </div>

          {!filteredGoals.length ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Aucun calcul ne correspond à votre recherche.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}