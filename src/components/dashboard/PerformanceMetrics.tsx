'use client'

import { memo } from 'react'
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'
import { MetricCard } from '@/components/ui/MetricCard'
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics'

interface Metric {
  label: string
  value: number
  change: number
  changeLabel: string
  format: 'currency' | 'percent' | 'number'
  icon: React.ReactNode
  variant: 'default' | 'profit' | 'loss' | 'primary'
}

export const PerformanceMetrics = memo(function PerformanceMetrics() {
  const { metrics: portfolioMetrics, isLoading } = usePortfolioMetrics()

  // Build metrics from Supabase data
  const metrics: Metric[] = [
    {
      label: "Today's P&L",
      value: portfolioMetrics.todayPnl,
      change: portfolioMetrics.vsYesterday,
      changeLabel: 'vs yesterday',
      format: 'currency',
      icon: <CurrencyDollarIcon className="w-5 h-5 text-neutral-800" />,
      variant: portfolioMetrics.todayPnl >= 0 ? 'profit' : 'loss',
    },
    {
      label: 'Win Rate',
      value: portfolioMetrics.winRate,
      change: portfolioMetrics.vsLastWeek,
      changeLabel: 'vs last week',
      format: 'percent',
      icon: <ChartBarIcon className="w-5 h-5 text-[theme(colors.neutral.900)]" />,
      variant: 'primary',
    },
    {
      label: 'Sharpe Ratio',
      value: portfolioMetrics.sharpeRatio,
      change: portfolioMetrics.vsLastMonth,
      changeLabel: 'vs last month',
      format: 'number',
      icon: <ArrowTrendingUpIcon className="w-5 h-5 text-neutral-600" />,
      variant: 'default',
    },
    {
      label: 'Max Drawdown',
      value: portfolioMetrics.maxDrawdown,
      change: 0,
      changeLabel: 'no change',
      format: 'percent',
      icon: <ShieldExclamationIcon className="w-5 h-5 text-neutral-500" />,
      variant: 'loss',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-shimmer h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <MetricCard
            label={metric.label}
            value={metric.value}
            change={metric.change}
            changeLabel={metric.changeLabel}
            format={metric.format}
            icon={metric.icon}
            variant={metric.variant}
            size="sm"
          />
        </div>
      ))}
    </div>
  )
})
