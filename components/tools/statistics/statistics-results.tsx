'use client';

import { Calculator } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Latex } from '@/components/math/latex';

import {
  computeBivariateStatistics,
  formatBivariatePair,
} from '@/lib/tools/statistics/bivariate-utils';
import { computeStatistics, formatNumber } from '@/lib/tools/statistics/utils';
import type {
  DynamicStatisticsRow,
  StatisticGoal,
  StatisticRow,
  StatisticsSeriesType,
} from '@/lib/tools/statistics/types';

interface StatisticsResultsProps {
  rows: StatisticRow[];
  dynamicRows: DynamicStatisticsRow[];
  selectedGoals: StatisticGoal[];
  seriesType: StatisticsSeriesType;
}

interface ResolutionItem {
  key: string;
  title: string;
  formulaLatex: string;
  replacementLatex: string;
  resultLatex: string;
  note?: string;
}

export function StatisticsResults({
  rows,
  dynamicRows,
  selectedGoals,
  seriesType,
}: StatisticsResultsProps) {
  const isBivariate = seriesType === 'bivariate';

  const items = isBivariate
    ? buildBivariateResolution(dynamicRows, selectedGoals)
    : buildUnivariateResolution(rows, selectedGoals);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-xl">Résolution détaillée</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              EduStat affiche la formule, l’application numérique et le résultat final.
            </p>
          </div>

          <Badge variant="secondary">
            {items.length} étape{items.length > 1 ? 's' : ''}
          </Badge>
        </CardHeader>

        <CardContent>
          {items.length ? (
            <div className="space-y-4">
              {items.map((item, index) => (
                <ResolutionCard key={item.key} item={item} index={index + 1} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
              Sélectionnez au moins un calcul pour voir la résolution.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResolutionCard({
  item,
  index,
}: {
  item: ResolutionItem;
  index: number;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Étape {index}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
          </div>

          <div className="rounded-lg bg-muted p-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-4">
          <LatexBlock label="Formule" latex={item.formulaLatex} />
          <LatexBlock label="Application numérique" latex={item.replacementLatex} />
          <LatexBlock label="Résultat" latex={item.resultLatex} strong />

          {item.note ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              {item.note}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function LatexBlock({
  label,
  latex,
  strong = false,
}: {
  label: string;
  latex: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <div
  className={[
    'px-4 py-3 text-sm leading-7 border-l border-border/40',
    strong ? 'text-base font-semibold' : '',
  ].join(' ')}
>
        <Latex math={latex} block />
      </div>
    </div>
  );
}

function buildUnivariateResolution(
  rows: StatisticRow[],
  selectedGoals: StatisticGoal[]
): ResolutionItem[] {
  const computed = computeStatistics(rows);
  const items: ResolutionItem[] = [];

  const totalN = computed.totalCount;
  const sumX = computed.sum;
  const sumX2 = computed.expandedValues.reduce((acc, value) => acc + value * value, 0);

  if (selectedGoals.includes('mean')) {
    items.push({
      key: 'mean',
      title: 'Calcul de la moyenne',
      formulaLatex: String.raw`\bar{x}=\frac{\sum x_i}{N}`,
      replacementLatex: String.raw`\bar{x}=\frac{${formatNumber(sumX)}}{${formatNumber(
        totalN
      )}}`,
      resultLatex: String.raw`\bar{x}=${formatNumber(computed.mean)}`,
      note: 'La moyenne est obtenue en divisant la somme des valeurs par l’effectif total.',
    });
  }

  if (selectedGoals.includes('median')) {
    items.push({
      key: 'median',
      title: 'Calcul de la médiane',
      formulaLatex: String.raw`\text{On ordonne la série puis on repère la valeur centrale.}`,
      replacementLatex: String.raw`\text{Série ordonnée : } ${computed.expandedValues.join(
        ', '
      )} \quad ; \quad N=${formatNumber(totalN)}`,
      resultLatex: String.raw`Me=${formatNumber(computed.median)}`,
      note:
        totalN % 2 === 0
          ? 'Comme l’effectif est pair, la médiane est la moyenne des deux valeurs centrales.'
          : 'Comme l’effectif est impair, la médiane est la valeur centrale.',
    });
  }

  if (selectedGoals.includes('mode')) {
    items.push({
      key: 'mode',
      title: 'Calcul du mode',
      formulaLatex: String.raw`\text{Le mode est la valeur la plus fréquente.}`,
      replacementLatex: computed.mode?.length
        ? String.raw`\text{Valeur(s) la/les plus fréquente(s) : } ${computed.mode.join(', ')}`
        : String.raw`\text{Aucune valeur ne domine nettement la série.}`,
      resultLatex: String.raw`\text{Mode}=${computed.mode?.length ? computed.mode.join(', ') : 'Aucun\ mode'}`,
    });
  }

  if (selectedGoals.includes('variance')) {
    items.push({
      key: 'variance',
      title: 'Calcul de la variance',
      formulaLatex: String.raw`V(x)=\frac{\sum x_i^2}{N}-\bar{x}^2`,
      replacementLatex: String.raw`V(x)=\frac{${formatNumber(sumX2)}}{${formatNumber(
        totalN
      )}}-\left(${formatNumber(computed.mean)}\right)^2`,
      resultLatex: String.raw`V(x)=${formatNumber(computed.variance)}`,
      note: 'La variance mesure la dispersion des données autour de la moyenne.',
    });
  }

  if (selectedGoals.includes('stdDev')) {
    items.push({
      key: 'stdDev',
      title: "Calcul de l'écart-type",
      formulaLatex: String.raw`\sigma=\sqrt{V(x)}`,
      replacementLatex: String.raw`\sigma=\sqrt{${formatNumber(computed.variance)}}`,
      resultLatex: String.raw`\sigma=${formatNumber(computed.stdDev)}`,
      note: "L'écart-type est la racine carrée de la variance.",
    });
  }

  if (selectedGoals.includes('quartiles')) {
    items.push({
      key: 'quartiles',
      title: 'Calcul des quartiles',
      formulaLatex: String.raw`\text{Les quartiles partagent la série ordonnée en quatre parties.}`,
      replacementLatex: String.raw`\text{Série ordonnée : } ${computed.expandedValues.join(', ')}`,
      resultLatex: String.raw`Q_1=${formatNumber(computed.q1)} \qquad Q_3=${formatNumber(
        computed.q3
      )} \qquad IQR=${formatNumber(computed.iqr)}`,
      note: "L'écart interquartile vaut Q3 - Q1.",
    });
  }

  if (selectedGoals.includes('frequency')) {
    items.push({
      key: 'frequency',
      title: 'Calcul des fréquences',
      formulaLatex: String.raw`f_i=\frac{n_i}{N}`,
      replacementLatex: String.raw`N=${formatNumber(totalN)}`,
      resultLatex: String.raw`\text{Les fréquences détaillées sont visibles dans le tableau.}`,
    });
  }

  return items;
}

function buildBivariateResolution(
  dynamicRows: DynamicStatisticsRow[],
  selectedGoals: StatisticGoal[]
): ResolutionItem[] {
  const computed = computeBivariateStatistics(dynamicRows);
  const items: ResolutionItem[] = [];
  const n = computed.count;

  if (!n) return items;

  if (selectedGoals.includes('mean')) {
    items.push({
      key: 'mean-bivariate',
      title: 'Calcul du point moyen',
      formulaLatex: String.raw`\bar{x}=\frac{\sum x_i}{n}\qquad \bar{y}=\frac{\sum y_i}{n}\qquad G(\bar{x},\bar{y})`,
      replacementLatex: String.raw`\bar{x}=\frac{${formatNumber(computed.sumX)}}{${formatNumber(
        n
      )}} \qquad \bar{y}=\frac{${formatNumber(computed.sumY)}}{${formatNumber(n)}}`,
      resultLatex: String.raw`\bar{x}=${formatNumber(computed.meanX)} \qquad \bar{y}=${formatNumber(
        computed.meanY
      )} \qquad G${latexPoint(
        computed.pointMean?.x ?? null,
        computed.pointMean?.y ?? null
      )}`,
      note: 'En données bivariées, la moyenne donne un point moyen du nuage.',
    });
  }

  if (selectedGoals.includes('variance')) {
    items.push({
      key: 'variance-bivariate',
      title: 'Calcul des variances de X et Y',
      formulaLatex: String.raw`V(X)=\frac{\sum x_i^2}{n}-\bar{x}^2 \qquad V(Y)=\frac{\sum y_i^2}{n}-\bar{y}^2`,
      replacementLatex: String.raw`V(X)=\frac{${formatNumber(computed.sumX2)}}{${formatNumber(
        n
      )}}-\left(${formatNumber(computed.meanX)}\right)^2 \qquad V(Y)=\frac{${formatNumber(
        computed.sumY2
      )}}{${formatNumber(n)}}-\left(${formatNumber(computed.meanY)}\right)^2`,
      resultLatex: String.raw`V(X)=${formatNumber(computed.varianceX)} \qquad V(Y)=${formatNumber(
        computed.varianceY
      )}`,
    });
  }

  if (selectedGoals.includes('stdDev')) {
    items.push({
      key: 'stdDev-bivariate',
      title: 'Calcul des écarts-types',
      formulaLatex: String.raw`\sigma_x=\sqrt{V(X)} \qquad \sigma_y=\sqrt{V(Y)}`,
      replacementLatex: String.raw`\sigma_x=\sqrt{${formatNumber(
        computed.varianceX
      )}} \qquad \sigma_y=\sqrt{${formatNumber(computed.varianceY)}}`,
      resultLatex: String.raw`\sigma_x=${formatNumber(
        computed.stdDevX
      )} \qquad \sigma_y=${formatNumber(computed.stdDevY)}`,
    });
  }

  if (selectedGoals.includes('correlation')) {
    items.push(
      {
        key: 'covariance-bivariate',
        title: 'Calcul de la covariance',
        formulaLatex: String.raw`\operatorname{Cov}(X,Y)=\frac{\sum x_i y_i}{n}-\bar{x}\bar{y}`,
        replacementLatex: String.raw`\operatorname{Cov}(X,Y)=\frac{${formatNumber(
          computed.sumXY
        )}}{${formatNumber(n)}}-\left(${formatNumber(computed.meanX)}\times ${formatNumber(
          computed.meanY
        )}\right)`,
        resultLatex: String.raw`\operatorname{Cov}(X,Y)=${formatNumber(computed.covariance)}`,
      },
      {
        key: 'correlation-bivariate',
        title: 'Calcul du coefficient de corrélation',
        formulaLatex: String.raw`r=\frac{\operatorname{Cov}(X,Y)}{\sigma_x \sigma_y}`,
        replacementLatex: String.raw`r=\frac{${formatNumber(
          computed.covariance
        )}}{${formatNumber(computed.stdDevX)} \times ${formatNumber(computed.stdDevY)}}`,
        resultLatex: String.raw`r=${formatNumber(computed.correlation)}`,
        note: 'Plus r est proche de 1 ou de -1, plus la liaison linéaire est forte.',
      }
    );
  }

  return items;
}

function latexPoint(x: number | null, y: number | null): string {
  if (x === null || y === null) return String.raw`(\text{—},\text{—})`;
  return String.raw`\left(${x}\,;\,${y}\right)`;
}