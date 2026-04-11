'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { PeriodicTool } from '@/components/tools/periodic/periodic-tool';

export default function PeriodicTablePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <PeriodicTool />
      </main>
    </div>
  );
}