'use client';

/**
 * MetricCard - Supabase 스타일 지표 카드
 * 대시보드 핵심 KPI 표시용
 */

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    label?: string;
  };
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  variant?: 'default' | 'highlight' | 'warning' | 'success';
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    bg: 'bg-white',
    border: 'border-slate-200',
    hover: 'hover:border-slate-300 hover:shadow-md',
  },
  highlight: {
    bg: 'bg-neutral-100',
    border: 'border-neutral-300',
    hover: 'hover:border-neutral-400 hover:shadow-md',
  },
  warning: {
    bg: 'bg-neutral-100',
    border: 'border-neutral-400',
    hover: 'hover:border-neutral-500 hover:shadow-md',
  },
  success: {
    bg: 'bg-neutral-100',
    border: 'border-neutral-300',
    hover: 'hover:border-neutral-400 hover:shadow-md',
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconColor = 'text-slate-600',
  iconBg = 'bg-slate-100',
  variant = 'default',
  className,
  onClick,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-xl border transition-all duration-200',
        styles.bg,
        styles.border,
        onClick && 'cursor-pointer',
        onClick && styles.hover,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 제목 */}
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>

          {/* 값 */}
          <p className="text-2xl font-bold text-slate-900">{value}</p>

          {/* 서브타이틀 또는 변화 */}
          {(subtitle || change) && (
            <div className="flex items-center gap-2 mt-1">
              {change && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    change.type === 'increase' && 'text-neutral-800',
                    change.type === 'decrease' && 'text-neutral-600',
                    change.type === 'neutral' && 'text-slate-500'
                  )}
                >
                  {change.type === 'increase' && <TrendingUp className="w-3 h-3" />}
                  {change.type === 'decrease' && <TrendingDown className="w-3 h-3" />}
                  {change.type === 'neutral' && <Minus className="w-3 h-3" />}
                  {change.value > 0 && '+'}
                  {change.value}%
                </span>
              )}
              {(subtitle || change?.label) && (
                <span className="text-xs text-slate-500">
                  {change?.label || subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 아이콘 */}
        {Icon && (
          <div className={cn('p-2.5 rounded-xl', iconBg)}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MetricCardGrid - 메트릭 카드 그리드 래퍼
 */
interface MetricCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function MetricCardGrid({
  children,
  columns = 4,
  className,
}: MetricCardGridProps) {
  const colsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-2 lg:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-4', colsClass[columns], className)}>
      {children}
    </div>
  );
}

/**
 * MiniMetricCard - 작은 사이즈 메트릭 카드
 */
interface MiniMetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function MiniMetricCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-slate-500',
  className,
}: MiniMetricCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg',
        className
      )}
    >
      {Icon && <Icon className={cn('w-4 h-4 flex-shrink-0', iconColor)} />}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-800">{value}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
    </div>
  );
}

export default MetricCard;
