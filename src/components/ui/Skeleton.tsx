/**
 * @component Skeleton
 * @description Skeleton UI for loading states
 *
 * 데이터 로딩 중 콘텐츠 영역에 표시하는 플레이스홀더
 * - 사용자에게 로딩 진행 상태 시각적 피드백
 * - 레이아웃 시프트 방지 (CLS 개선)
 * - 모노크롬 디자인 시스템 준수
 *
 * @example
 * ```tsx
 * // Basic skeleton
 * <Skeleton className="h-4 w-32" />
 *
 * // Card skeleton
 * <SkeletonCard />
 *
 * // Bid row skeleton
 * <SkeletonBidRow />
 * ```
 */

import { cn } from '@/lib/utils';

// ============================================================================
// BASIC SKELETON
// ============================================================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /** 애니메이션 활성화 (기본값: true) */
  animate?: boolean;
}

/**
 * 기본 Skeleton 컴포넌트
 */
export function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-neutral-200 rounded',
        animate && 'animate-pulse',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

// ============================================================================
// SKELETON VARIANTS
// ============================================================================

/**
 * 텍스트 라인 Skeleton
 */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * 카드 Skeleton
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Content */}
      <SkeletonText lines={3} className="mb-4" />

      {/* Footer */}
      <div className="flex items-center gap-2 pt-4 border-t border-neutral-100">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

/**
 * 입찰 공고 행 Skeleton (Spreadsheet용)
 */
export function SkeletonBidRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 p-4 border-b border-neutral-100', className)}>
      {/* Checkbox */}
      <Skeleton className="w-4 h-4 rounded" />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-full max-w-md mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Organization */}
      <Skeleton className="h-4 w-24 hidden sm:block" />

      {/* Deadline */}
      <Skeleton className="h-4 w-20" />

      {/* Amount */}
      <Skeleton className="h-4 w-24" />

      {/* Match Score */}
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
  );
}

/**
 * 입찰 목록 Skeleton
 */
export function SkeletonBidList({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-px', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBidRow key={i} />
      ))}
    </div>
  );
}

/**
 * 대시보드 통계 카드 Skeleton
 */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6', className)}>
      {/* Icon + Label */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>

      {/* Value */}
      <Skeleton className="h-8 w-32 mb-2" />

      {/* Change */}
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

/**
 * 제품 카드 Skeleton
 */
export function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-5', className)}>
      {/* Image */}
      <Skeleton className="w-full h-48 rounded-lg mb-4" />

      {/* Title */}
      <Skeleton className="h-5 w-3/4 mb-2" />

      {/* Description */}
      <SkeletonText lines={2} className="mb-4" />

      {/* Price */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  );
}

/**
 * 테이블 Skeleton
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-neutral-200 bg-white', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-neutral-200 bg-neutral-50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 p-4 border-b border-neutral-100 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 폼 Skeleton
 */
export function SkeletonForm({ fields = 5, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </div>
  );
}

/**
 * 차트 Skeleton
 */
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6', className)}>
      {/* Title */}
      <Skeleton className="h-5 w-40 mb-6" />

      {/* Chart Area */}
      <div className="h-64 flex items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const height = Math.random() * 100 + 50;
          return (
            <Skeleton
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * 페이지 전체 Skeleton (Dashboard 용)
 */
export function SkeletonDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonCard />
      </div>

      {/* Table */}
      <SkeletonTable rows={8} columns={5} />
    </div>
  );
}

/**
 * 스프레드시트 페이지 Skeleton
 */
export function SkeletonSpreadsheet() {
  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-neutral-200">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
        <div className="flex-1" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 p-4">
        <SkeletonBidList count={10} />
      </div>
    </div>
  );
}
