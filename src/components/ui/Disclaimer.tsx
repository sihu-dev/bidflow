'use client'

import { AlertTriangle, Info, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'

// ============================================
// DISCLAIMER COMPONENT
// Legal disclaimers - displayed on all investment screens
// ============================================

interface DisclaimerProps {
  variant?: 'banner' | 'inline' | 'footer' | 'modal'
  dismissible?: boolean
  className?: string
}

/**
 * Disclaimer Banner (page top)
 */
export function DisclaimerBanner({ dismissible = true, className }: DisclaimerProps) {
  const { t } = useI18n()
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div
      className={cn(
        'relative w-full px-4 py-2',
        'bg-neutral-700/10 border-b border-neutral-700/20',
        'text-neutral-300 text-sm',
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>{t('dashboard.disclaimer.short') as string}</span>
        {dismissible && (
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="absolute right-4 p-1 hover:bg-neutral-700/20 rounded"
            aria-label={t('dashboard.disclaimer.dismissLabel') as string}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Disclaimer Inline (inside cards/sections)
 */
export function DisclaimerInline({ className }: DisclaimerProps) {
  const { t } = useI18n()
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg',
        'bg-zinc-800/50 border border-zinc-700/50',
        'text-zinc-400 text-sm',
        className
      )}
    >
      <Info className="h-5 w-5 flex-shrink-0 text-zinc-500 mt-0.5" />
      <div className="space-y-1">
        <p className="font-medium text-zinc-300">{t('dashboard.disclaimer.inlineTitle') as string}</p>
        <p className="leading-relaxed">{t('dashboard.disclaimer.full') as string}</p>
      </div>
    </div>
  )
}

/**
 * Disclaimer Footer (page bottom)
 */
export function DisclaimerFooter({ className }: DisclaimerProps) {
  const { t } = useI18n()
  return (
    <footer
      className={cn(
        'w-full px-4 py-6 mt-auto',
        'bg-zinc-900/50 border-t border-zinc-800',
        'text-zinc-500 text-xs',
        className
      )}
    >
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium text-zinc-400">{t('dashboard.disclaimer.legalTitle') as string}</span>
        </div>
        <p className="whitespace-pre-line leading-relaxed">{t('dashboard.disclaimer.legal') as string}</p>
        <p className="text-zinc-400">
          {t('dashboard.disclaimer.regulatory') as string}
        </p>
      </div>
    </footer>
  )
}

/**
 * Disclaimer Modal (first visit or before trading)
 */
interface DisclaimerModalProps extends DisclaimerProps {
  isOpen: boolean
  onAccept: () => void
}

export function DisclaimerModal({ isOpen, onAccept, className }: DisclaimerModalProps) {
  const { t } = useI18n()
  const modalPoints = t('dashboard.disclaimer.modalPoints') as unknown as string[]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-lg mx-4 p-6 rounded-2xl',
          'bg-zinc-900 border border-zinc-800',
          'shadow-2xl',
          className
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-neutral-700/10">
            <AlertTriangle className="h-6 w-6 text-neutral-700" />
          </div>
          <h2 className="text-xl font-semibold text-white">{t('dashboard.disclaimer.modalTitle') as string}</h2>
        </div>

        <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
          <p>
            {t('dashboard.disclaimer.modalIntro') as string}
          </p>

          <ul className="space-y-3">
            {Array.isArray(modalPoints) && modalPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-neutral-700 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
            {t('dashboard.disclaimer.modalFooter') as string}
          </div>
        </div>

        <button
          type="button"
          onClick={onAccept}
          className={cn(
            'w-full mt-6 py-3 px-4 rounded-lg',
            'bg-primary-500 hover:bg-primary-600',
            'text-white font-medium',
            'transition-colors duration-200'
          )}
        >
          {t('dashboard.disclaimer.acceptButton') as string}
        </button>
      </div>
    </div>
  )
}

/**
 * Trade Execution Warning
 */
export function TradeWarning({ className }: { className?: string }) {
  const { t } = useI18n()
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg',
        'bg-neutral-600/10 border border-neutral-600/20',
        'text-neutral-500 text-xs',
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>
        {t('dashboard.disclaimer.tradeWarning') as string}
      </span>
    </div>
  )
}

/**
 * Backtest Results Warning
 */
export function BacktestWarning({ className }: { className?: string }) {
  const { t } = useI18n()
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg',
        'bg-neutral-700/10 border border-neutral-700/20',
        'text-neutral-600 text-xs',
        className
      )}
    >
      <Info className="h-4 w-4 flex-shrink-0" />
      <span>
        {t('dashboard.disclaimer.backtestWarning') as string}
      </span>
    </div>
  )
}

// Default export
export function Disclaimer({ variant = 'inline', ...props }: DisclaimerProps) {
  switch (variant) {
    case 'banner':
      return <DisclaimerBanner {...props} />
    case 'footer':
      return <DisclaimerFooter {...props} />
    default:
      return <DisclaimerInline {...props} />
  }
}

export default Disclaimer
