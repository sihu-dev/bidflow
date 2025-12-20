/**
 * CTA 섹션 컴포넌트
 */
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CTASectionProps {
  title: string;
  description?: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  variant?: 'default' | 'primary' | 'muted';
  className?: string;
}

export function CTASection({
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = 'default',
  className,
}: CTASectionProps) {
  const styles = {
    default: 'bg-background',
    primary: 'bg-primary text-primary-foreground',
    muted: 'bg-muted/30',
  };

  const primaryButtonVariant = variant === 'primary' ? 'secondary' : 'default';
  const secondaryButtonVariant = variant === 'primary'
    ? 'outline'
    : 'outline';
  const secondaryButtonClass = variant === 'primary'
    ? 'border-white text-white hover:bg-white/10'
    : '';

  return (
    <section className={cn('py-20', styles[variant], className)}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
        {description && (
          <p className={cn('mb-8', variant === 'primary' ? 'opacity-90' : 'text-muted-foreground')}>
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {secondaryCta && (
            <Button size="lg" variant={secondaryButtonVariant} className={secondaryButtonClass} asChild>
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          )}
          <Button size="lg" variant={primaryButtonVariant} asChild>
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
