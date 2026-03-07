'use client';

import { RotateCcw, Sigma } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StatisticsEmptyStateProps {
  onReset?: () => void;
}

export function StatisticsEmptyState({
  onReset,
}: StatisticsEmptyStateProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <Sigma className="h-8 w-8 text-primary" />
        </div>

        <h3 className="text-xl font-semibold">Aucune donnée statistique</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-6">
          Commencez par saisir des valeurs dans le tableau pour générer
          automatiquement les résultats, les fréquences et l’analyse pédagogique.
        </p>

        {onReset ? (
          <Button type="button" variant="outline" onClick={onReset} className="mt-5">
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser le tableau
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}