'use client';

import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { StatisticsTool } from '@/components/tools/statistics/statistics-tool';

export default function TableauStatistiquePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <StatisticsTool />
        </motion.div>
      </main>
    </div>
  );
}