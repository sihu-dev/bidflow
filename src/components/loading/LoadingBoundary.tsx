/**
 * @component LoadingBoundary
 * @description Suspense boundary with loading fallback
 *
 * React 18+ Suspense 기반 로딩 상태 관리
 * - 코드 스플리팅 (dynamic import)
 * - 데이터 fetching (use() hook)
 * - 스트리밍 SSR
 *
 * @example
 * ```tsx
 * <LoadingBoundary fallback={<SkeletonBidList />}>
 *   <BidList />
 * </LoadingBoundary>
 * ```
 */

'use client';

import React, { Suspense, ComponentType } from 'react';
import {
  SkeletonCard,
  SkeletonBidList,
  SkeletonDashboard,
  SkeletonSpreadsheet,
  Skeleton,
} from '@/components/ui/Skeleton';

// ============================================================================
// TYPES
// ============================================================================

export interface LoadingBoundaryProps {
  children: React.ReactNode;
  /** 로딩 시 표시할 Fallback UI */
  fallback?: React.ReactNode;
  /** 에러 발생 시 표시할 UI */
  errorFallback?: React.ReactNode;
}

// ============================================================================
// LOADING BOUNDARY
// ============================================================================

/**
 * Suspense boundary with loading fallback
 */
export function LoadingBoundary({ children, fallback, errorFallback }: LoadingBoundaryProps) {
  // 기본 fallback (skeleton card)
  const defaultFallback = fallback || <SkeletonCard />;

  return (
    <Suspense fallback={defaultFallback}>
      {errorFallback ? (
        <ErrorBoundaryWrapper fallback={errorFallback}>{children}</ErrorBoundaryWrapper>
      ) : (
        children
      )}
    </Suspense>
  );
}

/**
 * Error Boundary Wrapper (optional)
 */
function ErrorBoundaryWrapper({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  );
}

// ============================================================================
// PRESET LOADING BOUNDARIES
// ============================================================================

/**
 * 대시보드 페이지 로딩
 */
export function DashboardLoadingBoundary({ children }: { children: React.ReactNode }) {
  return (
    <LoadingBoundary fallback={<SkeletonDashboard />}>
      {children}
    </LoadingBoundary>
  );
}

/**
 * 스프레드시트 페이지 로딩
 */
export function SpreadsheetLoadingBoundary({ children }: { children: React.ReactNode }) {
  return (
    <LoadingBoundary fallback={<SkeletonSpreadsheet />}>
      {children}
    </LoadingBoundary>
  );
}

/**
 * 입찰 목록 로딩
 */
export function BidListLoadingBoundary({ children }: { children: React.ReactNode }) {
  return (
    <LoadingBoundary fallback={<SkeletonBidList count={10} />}>
      {children}
    </LoadingBoundary>
  );
}

/**
 * 카드 로딩
 */
export function CardLoadingBoundary({ children }: { children: React.ReactNode }) {
  return (
    <LoadingBoundary fallback={<SkeletonCard />}>
      {children}
    </LoadingBoundary>
  );
}

// ============================================================================
// LAZY LOAD HELPER
// ============================================================================

/**
 * Dynamic import with preload support
 *
 * @example
 * ```tsx
 * const BidList = lazyLoad(() => import('./BidList'));
 *
 * <LoadingBoundary fallback={<SkeletonBidList />}>
 *   <BidList />
 * </LoadingBoundary>
 * ```
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options?: {
    /** Preload on mount (기본값: false) */
    preload?: boolean;
  }
): React.LazyExoticComponent<T> {
  const LazyComponent = React.lazy(factory);

  // Preload support
  if (options?.preload) {
    factory();
  }

  return LazyComponent;
}

/**
 * Preload component manually
 *
 * @example
 * ```tsx
 * const BidList = lazyLoad(() => import('./BidList'));
 *
 * // Preload on hover
 * <button onMouseEnter={() => preloadComponent(BidList)}>
 *   Open Bids
 * </button>
 * ```
 */
export function preloadComponent<T extends ComponentType<any>>(
  Component: T
): void {
  // Type guard to check if component is lazy
  const lazyComponent = Component as any;
  if (lazyComponent._payload && lazyComponent._payload._result === null) {
    // Trigger the lazy load
    lazyComponent._init(lazyComponent._payload);
  }
}

// ============================================================================
// INLINE LOADING STATES
// ============================================================================

/**
 * 인라인 스피너
 */
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
    </div>
  );
}

/**
 * 버튼 내부 로딩 스피너
 */
export function ButtonLoadingSpinner() {
  return (
    <LoadingSpinner size="sm" className="mr-2" />
  );
}

/**
 * 페이지 중앙 로딩
 */
export function PageLoading({ message = '로딩 중...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-sm text-neutral-600">{message}</p>
    </div>
  );
}

/**
 * 섹션 로딩 오버레이
 */
export function SectionLoading({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
      <LoadingSpinner size="md" className="mb-2" />
      {message && <p className="text-sm text-neutral-600">{message}</p>}
    </div>
  );
}

/**
 * 데이터 테이블 로딩
 */
export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-px">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white border-b border-neutral-100">
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PROGRESSIVE LOADING
// ============================================================================

/**
 * Progressive loading with stages
 *
 * @example
 * ```tsx
 * <ProgressiveLoading
 *   stages={[
 *     { delay: 0, content: <SkeletonBidList count={3} /> },
 *     { delay: 1000, content: <SkeletonBidList count={10} /> },
 *   ]}
 * >
 *   <BidList />
 * </ProgressiveLoading>
 * ```
 */
export function ProgressiveLoading({
  children,
  stages,
}: {
  children: React.ReactNode;
  stages: Array<{ delay: number; content: React.ReactNode }>;
}) {
  const [currentStage, setCurrentStage] = React.useState(0);

  React.useEffect(() => {
    if (currentStage >= stages.length - 1) return;

    const timeout = setTimeout(() => {
      setCurrentStage((prev) => prev + 1);
    }, stages[currentStage + 1].delay - stages[currentStage].delay);

    return () => clearTimeout(timeout);
  }, [currentStage, stages]);

  return (
    <LoadingBoundary fallback={stages[currentStage].content}>
      {children}
    </LoadingBoundary>
  );
}
