/**
 * 통계 섹션 컴포넌트
 */
import { cn } from '@/lib/utils';

interface Stat {
  value: string;
  label: string;
}

interface StatsSectionProps {
  stats: Stat[];
  variant?: 'default' | 'primary' | 'muted';
  columns?: 3 | 4;
  className?: string;
}

export function StatsSection({ stats, variant = 'default', columns = 4, className }: StatsSectionProps) {
  const bgStyles = {
    default: 'bg-background',
    primary: 'bg-primary text-primary-foreground',
    muted: 'bg-muted/30',
  };

  const valueStyles = {
    default: 'text-primary',
    primary: 'text-primary-foreground',
    muted: 'text-primary',
  };

  const labelStyles = {
    default: 'text-muted-foreground',
    primary: 'opacity-80',
    muted: 'text-muted-foreground',
  };

  const gridCols = columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  return (
    <section className={cn('py-12', bgStyles[variant], className)}>
      <div className="container mx-auto px-4">
        <div className={cn('grid gap-6 max-w-4xl mx-auto text-center', gridCols)}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className={cn('text-3xl md:text-4xl font-bold mb-2', valueStyles[variant])}>
                {stat.value}
              </p>
              <p className={cn('text-sm', labelStyles[variant])}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
