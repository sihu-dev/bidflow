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
            CMNTech 5개 제품 입찰 자동화를 시작하세요
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            UR-1000PLUS부터 EnerRay까지, 14일 무료 체험 후 결정하세요.
          </p>
          {/* Product Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['UR-1000PLUS', 'MF-1000C', 'UR-1010PLUS', 'SL-3000PLUS', 'EnerRay'].map((product) => (
              <span
                key={product}
                className="px-3 py-1.5 bg-neutral-800 rounded-full text-xs text-neutral-300 font-mono"
              >
                {product}
              </span>
            ))}
          </div>
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
