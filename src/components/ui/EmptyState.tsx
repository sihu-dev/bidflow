'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from './button'
import {
  DocumentTextIcon,
  ChartBarSquareIcon,
  UserGroupIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  BellIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import { useI18n } from '@/hooks/useI18n'

// ============================================
// Types
// ============================================

type EmptyStateVariant =
  | 'strategies'
  | 'backtests'
  | 'portfolio'
  | 'notifications'
  | 'search'
  | 'celebrities'
  | 'coaching'
  | 'generic'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

// ============================================
// Preset Icons (text comes from i18n)
// ============================================

const presetIcons: Record<EmptyStateVariant, ReactNode> = {
  strategies: <CubeIcon className="w-12 h-12" />,
  backtests: <ChartBarSquareIcon className="w-12 h-12" />,
  portfolio: <FolderIcon className="w-12 h-12" />,
  notifications: <BellIcon className="w-12 h-12" />,
  search: <MagnifyingGlassIcon className="w-12 h-12" />,
  celebrities: <UserGroupIcon className="w-12 h-12" />,
  coaching: <SparklesIcon className="w-12 h-12" />,
  generic: <DocumentTextIcon className="w-12 h-12" />,
}

// ============================================
// Component
// ============================================

export function EmptyState({
  variant = 'generic',
  title,
  description,
  icon,
  action,
  secondaryAction,
}: EmptyStateProps) {
  const { t } = useI18n()
  const presetIcon = presetIcons[variant]
  const presetTitle = t(`dashboard.emptyState.${variant}.title`) as string
  const presetDescription = t(`dashboard.emptyState.${variant}.description`) as string
  const actionsLabel = t('dashboard.emptyState.actionsLabel') as string

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center text-zinc-500 mb-6" aria-hidden="true">
        {icon || presetIcon}
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-white mb-2">
        {title || presetTitle}
      </h3>
      <p className="text-sm text-zinc-400 max-w-xs mb-6">
        {description || presetDescription}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3" role="group" aria-label={actionsLabel}>
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// Specialized Empty States
// ============================================

export function EmptyStrategies({ onCreate }: { onCreate: () => void }) {
  const { t } = useI18n()
  return (
    <EmptyState
      variant="strategies"
      action={{
        label: t('dashboard.emptyState.strategies.action') as string,
        onClick: onCreate,
      }}
    />
  )
}

export function EmptyBacktests({ onRun }: { onRun: () => void }) {
  const { t } = useI18n()
  return (
    <EmptyState
      variant="backtests"
      action={{
        label: t('dashboard.emptyState.backtests.action') as string,
        onClick: onRun,
      }}
    />
  )
}

export function EmptyPortfolio({ onAdd }: { onAdd: () => void }) {
  const { t } = useI18n()
  return (
    <EmptyState
      variant="portfolio"
      action={{
        label: t('dashboard.emptyState.portfolio.action') as string,
        onClick: onAdd,
      }}
    />
  )
}

export function EmptySearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  const { t } = useI18n()
  const title = `"${query}" ${t('dashboard.emptyState.search.title') as string}`
  return (
    <EmptyState
      variant="search"
      title={title}
      action={{
        label: t('dashboard.emptyState.search.action') as string,
        onClick: onClear,
      }}
    />
  )
}

export function EmptyCelebrities({ onExplore }: { onExplore: () => void }) {
  const { t } = useI18n()
  return (
    <EmptyState
      variant="celebrities"
      action={{
        label: t('dashboard.emptyState.celebrities.action') as string,
        onClick: onExplore,
      }}
    />
  )
}

export function EmptyCoaching({ onJoin }: { onJoin: () => void }) {
  const { t } = useI18n()
  return (
    <EmptyState
      variant="coaching"
      action={{
        label: t('dashboard.emptyState.coaching.action') as string,
        onClick: onJoin,
      }}
    />
  )
}

export default EmptyState
