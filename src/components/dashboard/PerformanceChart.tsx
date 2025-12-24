'use client'

import { useState } from 'react'
import { PresentationChartLineIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'

const timeRanges = ['1D', '1W', '1M', '3M', '1Y', 'ALL']

// Mock chart data
const generateChartData = (days: number) => {
  const data = []
  let value = 100
  for (let i = 0; i < days; i++) {
    value = value + (Math.random() - 0.45) * 5
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
      value: Math.max(80, Math.min(150, value)),
    })
  }
  return data
}

const chartData = generateChartData(30)
const maxValue = Math.max(...chartData.map(d => d.value))
const minValue = Math.min(...chartData.map(d => d.value))

export function PerformanceChart() {
  const { t, locale } = useI18n()
  const [selectedRange, setSelectedRange] = useState('1M')
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  return (
    <div className="border border-white/[0.06] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PresentationChartLineIcon className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-white">{t('dashboard.performanceChart.title') as string}</span>
        </div>
        <div className="flex items-center gap-0.5 p-0.5 rounded bg-white/[0.02] border border-white/[0.06]">
          {timeRanges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors',
                selectedRange === range
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Current Stats */}
        <div className="flex items-center gap-6 mb-5">
          <div>
            <p className="text-xs text-zinc-400 mb-1">{t('dashboard.performanceChart.currentValue') as string}</p>
            <p className="text-xl font-medium text-white">{locale === 'ko' ? '₩128,470,000' : '$128,470'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">{t('dashboard.performanceChart.returnRate') as string}</p>
            <div className="flex items-center gap-1">
              <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-base font-medium text-neutral-300">+28.47%</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-40">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-white/[0.04]" />
            ))}
          </div>

          {/* SVG Chart */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 160" preserveAspectRatio="none">
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path
              d={`
                M 0 ${160 - ((chartData[0].value - minValue) / (maxValue - minValue)) * 160}
                ${chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 100
                  const y = 160 - ((d.value - minValue) / (maxValue - minValue)) * 160
                  return `L ${x} ${y}`
                }).join(' ')}
                L 100 160
                L 0 160
                Z
              `}
              fill="url(#chartGradient)"
            />

            {/* Line */}
            <path
              d={`
                M 0 ${160 - ((chartData[0].value - minValue) / (maxValue - minValue)) * 160}
                ${chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 100
                  const y = 160 - ((d.value - minValue) / (maxValue - minValue)) * 160
                  return `L ${x} ${y}`
                }).join(' ')}
              `}
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Interactive Points */}
          <div className="absolute inset-0 flex items-stretch">
            {chartData.map((d, i) => (
              <div
                key={i}
                className="flex-1 relative cursor-crosshair"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {hoveredPoint === i && (
                  <div
                    className="absolute z-10 px-2.5 py-1.5 rounded bg-[#111113] border border-white/[0.1] -translate-x-1/2 left-1/2"
                    style={{
                      bottom: `${((d.value - minValue) / (maxValue - minValue)) * 100}%`,
                      marginBottom: '8px',
                    }}
                  >
                    <p className="text-[10px] text-zinc-400">
                      {d.date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs font-medium text-white">
                      {d.value.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between mt-2 text-[10px] text-zinc-400">
          {locale === 'ko' ? (
            <>
              <span>11월 12일</span>
              <span>11월 22일</span>
              <span>12월 2일</span>
              <span>12월 12일</span>
            </>
          ) : (
            <>
              <span>Nov 12</span>
              <span>Nov 22</span>
              <span>Dec 2</span>
              <span>Dec 12</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
