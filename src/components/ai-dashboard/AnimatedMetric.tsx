'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface AnimatedMetricProps {
  value: number;
  previousValue?: number;
  label: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

// Move static objects outside component to prevent re-creation on every render
const TREND_ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  stable: Minus,
} as const;

const TREND_COLORS = {
  up: 'text-neutral-700',
  down: 'text-neutral-500',
  stable: 'text-neutral-400',
} as const;

export function AnimatedMetric({
  value,
  previousValue,
  label,
  unit,
  trend,
}: AnimatedMetricProps) {
  const TrendIcon = TREND_ICONS[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <motion.span
              key={value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-neutral-900"
            >
              {value.toLocaleString()}
            </motion.span>
            <span className="text-sm text-neutral-500">{unit}</span>
          </div>
          {previousValue !== undefined && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-1 text-xs text-neutral-500"
            >
              from {previousValue.toLocaleString()} {unit}
            </motion.p>
          )}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className={`rounded-full bg-neutral-100 p-2 ${TREND_COLORS[trend]}`}
        >
          <TrendIcon className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.div>
  );
}
