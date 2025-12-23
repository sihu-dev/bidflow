'use client'

import { clsx } from 'clsx'

/**
 * HEPHAITOS Live Indicator Component
 * Cinematic pulsing indicator for real-time data
 */

interface LiveIndicatorProps {
  status?: 'live' | 'connecting' | 'offline'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizeStyles = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

const statusStyles = {
  live: {
    dot: 'bg-neutral-900',
    ring: 'border-neutral-900',
    text: 'text-neutral-800',
    label: 'Live',
  },
  connecting: {
    dot: 'bg-neutral-700',
    ring: 'border-neutral-700',
    text: 'text-neutral-600',
    label: 'Connecting',
  },
  offline: {
    dot: 'bg-zinc-500',
    ring: 'border-zinc-500',
    text: 'text-zinc-500',
    label: 'Offline',
  },
}

export function LiveIndicator({
  status = 'live',
  size = 'md',
  label,
  className,
}: LiveIndicatorProps) {
  const styles = statusStyles[status]

  return (
    <div className={clsx('inline-flex items-center gap-2', className)}>
      <span className={clsx('relative', sizeStyles[size])}>
        {/* Core dot */}
        <span
          className={clsx(
            'absolute inset-0 rounded-full',
            styles.dot,
            status === 'live' && 'animate-pulse'
          )}
        />
        {/* Pulse ring */}
        {status === 'live' && (
          <span
            className={clsx(
              'absolute -inset-0.5 rounded-full border opacity-75',
              styles.ring,
              'animate-ping'
            )}
          />
        )}
        {status === 'connecting' && (
          <span
            className={clsx(
              'absolute -inset-0.5 rounded-full border',
              styles.ring,
              'animate-pulse'
            )}
          />
        )}
      </span>
      {label !== undefined && (
        <span className={clsx('text-xs font-medium', styles.text)}>
          {label || styles.label}
        </span>
      )}
    </div>
  )
}

export default LiveIndicator
