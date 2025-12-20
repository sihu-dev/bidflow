/**
 * 체크리스트 컴포넌트
 */
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckListProps {
  items: string[];
  columns?: 1 | 2;
  className?: string;
}

export function CheckList({ items, columns = 1, className }: CheckListProps) {
  const gridCols = columns === 2 ? 'sm:grid-cols-2' : '';

  return (
    <ul className={cn('space-y-3', columns === 2 && 'grid gap-3', gridCols, className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Check className="w-5 h-5 text-neutral-700 mt-0.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface CheckListCardProps {
  items: { label: string; description?: string }[];
  className?: string;
}

export function CheckListCard({ items, className }: CheckListCardProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <div key={item.label} className="p-4 rounded-lg border bg-card">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-neutral-700 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">{item.label}</span>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
