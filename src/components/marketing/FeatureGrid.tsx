/**
 * 기능 그리드 컴포넌트
 */
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeatureGrid({ features, columns = 4, className }: FeatureGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {features.map((feature) => (
        <div key={feature.title} className="p-6 rounded-xl border bg-card">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <feature.icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  centered?: boolean;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, centered = false, className }: FeatureCardProps) {
  return (
    <div className={cn('p-6 rounded-xl border bg-card', centered && 'text-center', className)}>
      <div className={cn('w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4', centered && 'mx-auto')}>
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
