'use client';

/**
 * 히어로 섹션 - 동적 화이트라벨 버전
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Play, ArrowRight } from 'lucide-react';
import { useTenantHero, useTenantProducts } from '@/contexts/TenantContext';

export function Hero() {
  const hero = useTenantHero();
  const products = useTenantProducts();

  // 범용 vs 테넌트별 Trust Indicators
  const trustIndicators = products.length > 0
    ? [
        { text: `${products.length}개 제품 기본 등록` },
        { text: 'AI 자동 매칭' },
        { text: '14일 무료 체험' },
      ]
    : [
        { text: '45+ 데이터 소스' },
        { text: 'AI 자동 매칭' },
        { text: '14일 무료 체험' },
      ];

  return (
    <section className="relative py-24 lg:py-36 overflow-hidden bg-white">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,white_70%)]" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {hero.badge}
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900">
            {hero.headline}
            {hero.headlineSub && (
              <>
                <br />
                <span className="text-neutral-400">{hero.headlineSub}</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="mt-8 text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            {hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white h-14 px-8 text-base" asChild>
              <Link href="/signup" className="flex items-center gap-2">
                무료로 시작하기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-neutral-300 hover:bg-neutral-50 h-14 px-8 text-base" asChild>
              <Link href="#spreadsheet" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                데모 보기
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-neutral-500">
            {trustIndicators.map((indicator, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                <span>{indicator.text}</span>
              </div>
            ))}
          </div>

          {/* Product Pills - 테넌트에 제품이 있을 때만 표시 */}
          {products.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {products.map((product) => (
                <span
                  key={product.model}
                  className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs text-neutral-700 font-mono font-medium"
                >
                  {product.model}
                </span>
              ))}
            </div>
          )}

          {/* 범용 테넌트: 데이터 소스 표시 */}
          {products.length === 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {['나라장터', 'TED (EU)', 'SAM.gov', 'KEPCO', 'LH공사'].map((source) => (
                <span
                  key={source}
                  className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs text-neutral-700 font-medium"
                >
                  {source}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
