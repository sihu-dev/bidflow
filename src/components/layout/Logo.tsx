/**
 * BIDFLOW 로고 컴포넌트
 */
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showBeta?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showBeta = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-bold text-foreground', sizeClasses[size])}>
        BIDFLOW
      </span>
      {showBeta && (
        <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
          Beta
        </span>
      )}
    </Link>
  );
}
