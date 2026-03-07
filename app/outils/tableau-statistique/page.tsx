'use client';

import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { StatisticsTool } from '@/components/tools/statistics/statistics-tool';

export default function TableauStatistiquePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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