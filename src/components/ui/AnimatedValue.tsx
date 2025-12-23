'use client'

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'

/**
 * HEPHAITOS Animated Value Component
 * Smooth count-up animation for financial data
 */

interface AnimatedValueProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  format?: 'currency' | 'percent' | 'number' | 'compact'
  locale?: string
  className?: string
  flashOnChange?: boolean
}

function formatValue(
  value: number,
  format: AnimatedValueProps['format'],
  decimals: number,
  locale: string
): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: locale === 'ko-KR' ? 'KRW' : 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value)
    case 'percent':
      return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
    case 'compact':
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)
    default:
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value)
  }
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function AnimatedValue({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  duration = 600,
  format = 'number',
  locale = 'en-US',
  className,
  flashOnChange = true,
}: AnimatedValueProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const previousValue = useRef(value)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now()

    // Trigger flash effect
    if (flashOnChange && startValue !== endValue) {
      setFlash(endValue > startValue ? 'up' : 'down')
      const timer = setTimeout(() => setFlash(null), 500)
      return () => clearTimeout(timer)
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)

      const currentValue = startValue + (endValue - startValue) * easedProgress
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = endValue
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration, flashOnChange])

  const formattedValue = formatValue(displayValue, format, decimals, locale)

  return (
    <span
      className={clsx(
        'tabular-nums transition-colors duration-300',
        flash === 'up' && 'text-neutral-800',
        flash === 'down' && 'text-neutral-500',
        className
      )}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

export default AnimatedValue
