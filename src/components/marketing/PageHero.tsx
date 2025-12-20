/**
 * 마케팅 페이지 공통 히어로 섹션
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  badge?: string;
  icon?: LucideIcon;
  title: string;
  titleBreak?: boolean;
  description: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
    external?: boolean;
  };
  backLink?: {
    label: string;
    href: string;
  };
  centered?: boolean;
  className?: string;
}

export function PageHero({
  badge,
  icon: Icon,
  title,
  titleBreak = false,
  description,
  primaryCta,
  secondaryCta,
  backLink,
  centered = false,
  className,
}: PageHeroProps) {
  return (
    <section className={cn('py-20 lg:py-28', className)}>
      <div className="container mx-auto px-4">
        <div className={cn('max-w-4xl', centered && 'mx-auto text-center')}>
          {backLink && (
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              ← {backLink.label}
            </Link>
          )}

          <div className={cn('flex items-center gap-4 mb-6', centered && 'justify-center')}>
            {Icon && (
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-8 h-8 text-primary" />
              </div>
            )}
            {badge && <Badge variant="secondary">{badge}</Badge>}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {titleBreak ? (
              <>
                {title.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < title.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </>
            ) : (
              title
            )}
          </h1>

          <p className={cn('text-xl text-muted-foreground mb-8', centered ? 'max-w-2xl mx-auto' : 'max-w-2xl')}>
            {description}
          </p>

          {(primaryCta || secondaryCta) && (
            <div className={cn('flex flex-wrap gap-4', centered && 'justify-center')}>
              {primaryCta && (
                <Button size="lg" asChild>
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              )}
              {secondaryCta && (
                <Button size="lg" variant="outline" asChild>
                  {secondaryCta.external ? (
                    <a href={secondaryCta.href} target="_blank" rel="noopener noreferrer">
                      {secondaryCta.label}
                    </a>
                  ) : (
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
