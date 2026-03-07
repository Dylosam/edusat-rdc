'use client';

import { Lightbulb, Sigma } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  computeBivariateStatistics,
  formatBivariatePair,
} from '@/lib/tools/statistics/bivariate-utils';
import { computeStatistics } from '@/lib/tools/statistics/utils';
import type {
  DynamicStatisticsRow,
  StatisticRow,
  StatisticsSeriesType,
} from '@/lib/tools/statistics/types';

interface StatisticsSummaryProps {
  rows: StatisticRow[];
  dynamicRows: DynamicStatisticsRow[];
  seriesType: StatisticsSeriesType;
}

export function StatisticsSummary({
  rows,
  dynamicRows,
  seriesType,
}: StatisticsSummaryProps) {
  const isBivariate = seriesType === 'bivariate';

  if (isBivariate) {
    const stats = computeBivariateStatistics(dynamicRows);

    if (!stats.count) {
      return (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Ajoutez des couples de valeurs X et Y pour obtenir une interprétation automatique.
          </CardContent>
        </Card>
      );
    }

    const insights = buildBivariateInsights(stats);

    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lightbulb className="h-5 w-5 text-primary" />
              Analyse pédagogique
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Lecture intelligente de la série bivariée.
            </p>
          </div>

          <Badge variant="secondary">
            {stats.count} couple{stats.count > 1 ? 's' : ''}
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={`${insight.title}-${index}`} className="rounded-xl border p-4">
                  <p className="font-semibold">{insight.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border p-4">
              <div className="mb-4 flex items-center gap-2">
                <Sigma className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold">Repères rapides</p>
              </div>

              <div className="space-y-3 text-sm">
                <SummaryRow
                  label="Point moyen"
                  value={formatBivariatePair(
                    stats.pointMean?.x ?? null,
                    stats.pointMean?.y ?? null
                  )}
                />
                <SummaryRow label="Variance de X" value={stats.varianceX} />
                <SummaryRow label="Variance de Y" value={stats.varianceY} />
                <SummaryRow label="Écart-type de X" value={stats.stdDevX} />
                <SummaryRow label="Écart-type de Y" value={stats.stdDevY} />
                <SummaryRow label="Covariance" value={stats.covariance} />
                <SummaryRow label="Corrélation r" value={stats.correlation} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = computeStatistics(rows);

  if (!stats.totalCount) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Ajoutez des données pour obtenir une interprétation automatique de la série.
        </CardContent>
      </Card>
    );
  }

  const insights = buildUnivariateInsights(stats);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-primary" />
            Analyse pédagogique
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Lecture simple et intelligente de la série statistique.
          </p>
        </div>

        <Badge variant="secondary">
          {stats.totalCount} donnée{stats.totalCount > 1 ? 's' : ''}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={`${insight.title}-${index}`} className="rounded-xl border p-4">
                <p className="font-semibold">{insight.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sigma className="h-4 w-4 text-muted-foreground" />
              <p className="font-semibold">Repères rapides</p>
            </div>

            <div className="space-y-3 text-sm">
              <SummaryRow label="Moyenne" value={stats.mean} />
              <SummaryRow label="Médiane" value={stats.median} />
              <SummaryRow label="Q1" value={stats.q1} />
              <SummaryRow label="Q3" value={stats.q3} />
              <SummaryRow label="Écart-type" value={stats.stdDev} />
              <SummaryRow
                label="Mode"
                value={stats.mode?.length ? stats.mode.join(', ') : 'Aucun'}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryRowProps {
  label: string;
  value: number | string | null;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value === null ? '—' : value}</span>
    </div>
  );
}

function buildUnivariateInsights(stats: ReturnType<typeof computeStatistics>) {
  const insights: Array<{ title: string; text: string }> = [];

  if (stats.mean !== null && stats.median !== null) {
    const diff = Math.abs(stats.mean - stats.median);

    if (diff < 0.001) {
      insights.push({
        title: 'Centre de la série',
        text: 'La moyenne et la médiane sont pratiquement égales. La série semble globalement équilibrée autour de son centre.',
      });
    } else if (diff <= 1) {
      insights.push({
        title: 'Centre de la série',
        text: 'La moyenne est proche de la médiane. La distribution paraît assez stable, avec une légère dissymétrie possible.',
      });
    } else if (stats.mean > stats.median) {
      insights.push({
        title: 'Centre de la série',
        text: 'La moyenne est supérieure à la médiane. Cela peut indiquer que certaines grandes valeurs tirent la série vers le haut.',
      });
    } else {
      insights.push({
        title: 'Centre de la série',
        text: 'La moyenne est inférieure à la médiane. Cela peut indiquer que certaines petites valeurs tirent la série vers le bas.',
      });
    }
  }

  if (stats.stdDev !== null) {
    if (stats.stdDev < 2) {
      insights.push({
        title: 'Dispersion',
        text: 'L’écart-type est faible. Les données sont relativement regroupées autour de la moyenne.',
      });
    } else if (stats.stdDev < 5) {
      insights.push({
        title: 'Dispersion',
        text: 'L’écart-type est modéré. Les valeurs s’écartent un peu du centre, sans être très dispersées.',
      });
    } else {
      insights.push({
        title: 'Dispersion',
        text: 'L’écart-type est élevé. Les données sont assez dispersées autour de la moyenne.',
      });
    }
  }

  if (stats.q1 !== null && stats.q3 !== null && stats.iqr !== null) {
    insights.push({
      title: 'Quartiles',
      text: `La moitié centrale des données se situe entre ${stats.q1} et ${stats.q3}. L’écart interquartile est de ${stats.iqr}.`,
    });
  }

  if (stats.mode?.length) {
    if (stats.mode.length === 1) {
      insights.push({
        title: 'Valeur dominante',
        text: `Le mode de la série est ${stats.mode[0]}. C’est la valeur la plus fréquente.`,
      });
    } else {
      insights.push({
        title: 'Valeurs dominantes',
        text: `La série est multimodale. Les valeurs les plus fréquentes sont : ${stats.mode.join(', ')}.`,
      });
    }
  } else {
    insights.push({
      title: 'Valeur dominante',
      text: 'Aucun mode net n’apparaît. Aucune valeur ne domine clairement la série.',
    });
  }

  if (stats.min !== null && stats.max !== null && stats.range !== null) {
    insights.push({
      title: 'Étendue',
      text: `Les valeurs vont de ${stats.min} à ${stats.max}. L’étendue totale de la série est donc ${stats.range}.`,
    });
  }

  return insights;
}

function buildBivariateInsights(
  stats: ReturnType<typeof computeBivariateStatistics>
) {
  const insights: Array<{ title: string; text: string }> = [];

  if (stats.pointMean) {
    insights.push({
      title: 'Point moyen',
      text: `Le point moyen du nuage est G(${stats.pointMean.x} ; ${stats.pointMean.y}). Il représente le centre moyen du nuage de points.`,
    });
  }

  if (stats.stdDevX !== null && stats.stdDevY !== null) {
    insights.push({
      title: 'Dispersion des variables',
      text: `La dispersion de X est mesurée par σx = ${stats.stdDevX}, tandis que celle de Y est mesurée par σy = ${stats.stdDevY}.`,
    });
  }

  if (stats.covariance !== null) {
    if (stats.covariance > 0) {
      insights.push({
        title: 'Sens de variation',
        text: 'La covariance est positive. Globalement, lorsque X augmente, Y a aussi tendance à augmenter.',
      });
    } else if (stats.covariance < 0) {
      insights.push({
        title: 'Sens de variation',
        text: 'La covariance est négative. Globalement, lorsque X augmente, Y a tendance à diminuer.',
      });
    } else {
      insights.push({
        title: 'Sens de variation',
        text: 'La covariance est nulle ou très proche de zéro. La liaison linéaire semble très faible.',
      });
    }
  }

  if (stats.correlation !== null) {
    const absR = Math.abs(stats.correlation);

    if (absR >= 0.9) {
      insights.push({
        title: 'Force de corrélation',
        text: `Le coefficient de corrélation est r = ${stats.correlation}. La liaison linéaire est très forte.`,
      });
    } else if (absR >= 0.7) {
      insights.push({
        title: 'Force de corrélation',
        text: `Le coefficient de corrélation est r = ${stats.correlation}. La liaison linéaire est forte.`,
      });
    } else if (absR >= 0.4) {
      insights.push({
        title: 'Force de corrélation',
        text: `Le coefficient de corrélation est r = ${stats.correlation}. La liaison linéaire est moyenne.`,
      });
    } else if (absR > 0) {
      insights.push({
        title: 'Force de corrélation',
        text: `Le coefficient de corrélation est r = ${stats.correlation}. La liaison linéaire est faible.`,
      });
    } else {
      insights.push({
        title: 'Force de corrélation',
        text: 'Le coefficient de corrélation est nul. Il n’y a pas de liaison linéaire apparente.',
      });
    }
  }

  return insights;
}