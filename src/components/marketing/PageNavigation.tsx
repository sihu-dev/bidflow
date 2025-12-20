/**
 * 페이지 하단 네비게이션 컴포넌트
 */
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PageNavigationProps {
  prev?: {
    label: string;
    href: string;
  };
  next?: {
    label: string;
    href: string;
  };
}

export function PageNavigation({ prev, next }: PageNavigationProps) {
  return (
    <section className="py-16 border-t">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {prev ? (
            <Button variant="ghost" asChild>
              <Link href={prev.href}>
                <ArrowLeft className="mr-2 w-4 h-4" /> {prev.label}
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {next ? (
            <Button variant="ghost" asChild>
              <Link href={next.href}>
                {next.label} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </section>
  );
}
