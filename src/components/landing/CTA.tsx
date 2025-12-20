/**
 * Call to Action 섹션 - 모노크롬
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 bg-neutral-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            지금 바로 입찰 자동화를 시작하세요
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            14일 무료 체험 후 결정하세요. 신용카드 없이 바로 시작할 수 있습니다.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-neutral-900 hover:bg-neutral-100 h-12 px-8"
              asChild
            >
              <Link href="/signup" className="flex items-center gap-2">
                무료로 시작하기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-600 text-white hover:bg-neutral-800 h-12 px-8"
              asChild
            >
              <Link href="/contact">영업팀 문의</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
