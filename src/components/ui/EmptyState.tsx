'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import {
  DocumentTextIcon,
  ChartBarSquareIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// ============================================
// Types
// ============================================

type EmptyStateVariant =
  | 'bids'
  | 'search'
  | 'notifications'
  | 'data'
  | 'error'
  | 'generic';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// ============================================
// Preset Icons & Text (Korean)
// ============================================

const presetIcons: Record<EmptyStateVariant, ReactNode> = {
  bids: <DocumentTextIcon className="w-10 h-10" />,
  search: <MagnifyingGlassIcon className="w-10 h-10" />,
  notifications: <BellIcon className="w-10 h-10" />,
  data: <InboxIcon className="w-10 h-10" />,
  error: <ExclamationTriangleIcon className="w-10 h-10" />,
  generic: <ChartBarSquareIcon className="w-10 h-10" />,
};

const presetText: Record<EmptyStateVariant, { title: string; description: string }> = {
  bids: {
    title: '입찰 공고 없음',
    description: '현재 조건에 맞는 입찰 공고가 없습니다. 키워드를 조정하거나 새로고침해 보세요.',
  },
  search: {
    title: '검색 결과 없음',
    description: '다른 키워드로 검색하거나 필터를 조정해 보세요.',
  },
  notifications: {
    title: '알림 없음',
    description: '새로운 알림이 없습니다.',
  },
  data: {
    title: '데이터 없음',
    description: '아직 등록된 데이터가 없습니다.',
  },
  error: {
    title: '오류 발생',
    description: '문제가 발생했습니다. 다시 시도해 주세요.',
  },
  generic: {
    title: '항목 없음',
    description: '표시할 항목이 없습니다.',
  },
};

// ============================================
// Main Component
// ============================================

export function EmptyState({
  variant = 'generic',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  const presetIcon = presetIcons[variant];
  const { title: presetTitle, description: presetDescription } = presetText[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-200
                   flex items-center justify-center text-neutral-400 mb-5"
        aria-hidden="true"
      >
        {icon || presetIcon}
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-neutral-900 mb-1.5">
        {title || presetTitle}
      </h3>
      <p className="text-sm text-neutral-500 max-w-xs mb-5">
        {description || presetDescription}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-2.5" role="group" aria-label="Actions">
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-neutral-900 text-white hover:bg-neutral-800
                         focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Specialized Empty States for BIDFLOW
// ============================================

export function EmptyBidsState({
  onRefresh,
  onExplore,
}: {
  onRefresh?: () => void;
  onExplore?: () => void;
}) {
  return (
    <EmptyState
      variant="bids"
      action={onRefresh ? { label: '새로고침', onClick: onRefresh } : undefined}
      secondaryAction={onExplore ? { label: '공고 탐색', onClick: onExplore } : undefined}
    />
  );
}

export function EmptySearchState({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      variant="search"
      title={query ? `"${query}" 검색 결과 없음` : undefined}
      action={onClear ? { label: '필터 초기화', onClick: onClear } : undefined}
    />
  );
}

export function EmptyNotificationsState() {
  return <EmptyState variant="notifications" />;
}

export function EmptyDataState({
  onRefresh,
}: {
  onRefresh?: () => void;
}) {
  return (
    <EmptyState
      variant="data"
      action={onRefresh ? { label: '새로고침', onClick: onRefresh } : undefined}
    />
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={message}
      action={onRetry ? { label: '다시 시도', onClick: onRetry } : undefined}
    />
  );
}

export function LoadingState({
  message = '로딩 중...',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="mb-4"
      >
        <ArrowPathIcon className="w-8 h-8 text-neutral-400" />
      </motion.div>
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}

export default EmptyState;
