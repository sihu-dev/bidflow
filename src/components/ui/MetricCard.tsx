'use client'

import { clsx } from 'clsx'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid'
import { AnimatedValue } from './AnimatedValue'

/**
 * HEPHAITOS Metric Card Component
 * Cinematic stat display with animations
 */

interface MetricCardProps {
  label: string
  value: number
  change?: number
  changeLabel?: string
  format?: 'currency' | 'percent' | 'number' | 'compact'
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  variant?: 'default' | 'profit' | 'loss' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variantStyles = {
  default: {
    bg: 'bg-white/[0.02]',
    border: 'border-white/[0.06]',
    accent: 'bg-white/[0.06]',
  },
  profit: {
    bg: 'bg-neutral-900/[0.05]',
    border: 'border-neutral-900/20',
    accent: 'bg-neutral-900/20',
  },
  loss: {
    bg: 'bg-neutral-600/[0.05]',
    border: 'border-neutral-600/20',
    accent: 'bg-neutral-600/20',
  },
  primary: {
    bg: 'bg-[theme(colors.neutral.900)]/[0.05]',
    border: 'border-[theme(colors.neutral.900)]/20',
    accent: 'bg-[theme(colors.neutral.900)]/20',
  },
}

const sizeStyles = {
  sm: {
    padding: 'p-3',
    label: 'text-[10px]',
    value: 'text-lg',
    change: 'text-[10px]',
    icon: 'w-8 h-8',
  },
  md: {
    padding: 'p-4',
    label: 'text-xs',
    value: 'text-2xl',
    change: 'text-xs',
    icon: 'w-10 h-10',
  },
  lg: {
    padding: 'p-5',
    label: 'text-sm',
    value: 'text-3xl',
    change: 'text-sm',
    icon: 'w-12 h-12',
  },
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  format = 'number',
  trend,
  icon,
  variant = 'default',
  size = 'md',
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant]
  const sizes = sizeStyles[size]

  const determinedTrend = trend || (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral')

  const TrendIcon = determinedTrend === 'up' ? ArrowUpIcon : determinedTrend === 'down' ? ArrowDownIcon : MinusIcon
  const trendColor = determinedTrend === 'up' ? 'text-neutral-800' : determinedTrend === 'down' ? 'text-neutral-500' : 'text-zinc-500'

  return (
    <div
      className={clsx(
        'relative rounded-xl border backdrop-blur-lg',
        'transition-all duration-300',
        'hover:border-white/[0.12] hover:-translate-y-0.5',
        'hover:shadow-lg hover:shadow-black/30',
        styles.bg,
        styles.border,
        sizes.padding,
        className
      )}
    >
      {/* Background accent */}
      <div
        className={clsx(
          'absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-30',
          styles.accent
        )}
      />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <span className={clsx('font-medium text-zinc-400 uppercase tracking-wider', sizes.label)}>
            {label}
          </span>
          {icon && (
            <div className={clsx('flex items-center justify-center rounded-lg', styles.accent, sizes.icon)}>
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className={clsx('font-bold text-white mb-2', sizes.value)}>
          <AnimatedValue
            value={value}
            format={format}
            decimals={format === 'percent' ? 2 : format === 'currency' ? 0 : 2}
          />
        </div>

        {/* Change */}
        {change !== undefined && (
          <div className={clsx('flex items-center gap-1', trendColor, sizes.change)}>
            <TrendIcon className="w-3 h-3" />
            <span className="font-medium tabular-nums">
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
            {changeLabel && (
              <span className="text-zinc-500 ml-1">{changeLabel}</span>
            )}
          </div>
        )}

        {/* Mini progress bar */}
        {change !== undefined && (
          <div className="mt-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                determinedTrend === 'up' ? 'bg-neutral-900' : determinedTrend === 'down' ? 'bg-neutral-600' : 'bg-zinc-500'
              )}
              style={{ width: `${Math.min(Math.abs(change) * 5, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricCard
