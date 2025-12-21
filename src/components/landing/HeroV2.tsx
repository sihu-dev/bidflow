'use client';

/**
 * BIDFLOW Hero Section V2
 * Google DeepMind-inspired Light Theme
 * Clean, minimal, professional design
 */
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTenant, useTenantHero, useTenantProducts } from '@/contexts/TenantContext';

export function HeroV2() {
  const tenant = useTenant();
  const hero = useTenantHero();
  const products = useTenantProducts();

  // Dynamic content based on tenant
  const isWhiteLabel = products.length > 0;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-50" />

      {/* Decorative elements - DeepMind style */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary-50/40 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-primary-50 border border-primary-100 rounded-full">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700">
              {hero.badge}
            </span>
          </div>

          {/* Main Headline - DeepMind Style */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
            {isWhiteLabel ? (
              <>
                <span className="text-primary-500">{tenant.branding.name}</span>
                <br />
                Precision Matching
              </>
            ) : (
              <>
                주간 <span className="text-primary-500">47건</span> 자동 포착
                <br />
                <span className="text-neutral-400">Zero Missing</span>
              </>
            )}
          </h1>

          {/* Sub-headline - Quantified & Technical */}
          <p className="mt-8 text-xl md:text-2xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            {isWhiteLabel ? (
              hero.description
            ) : (
              <>
                <span className="font-medium text-neutral-700">45개 소스</span> · 실시간 분석 · 자동 매칭
                <br className="hidden md:block" />
                입찰 발견부터 제안서까지, End-to-End Automation
              </>
            )}
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
            >
              14일 무료로 시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all"
            >
              실시간 데모 보기
            </Link>
          </div>

          {/* Stats - Quantified Results */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900">90%</div>
              <div className="mt-1 text-sm text-neutral-500 uppercase tracking-wider">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900">3.2×</div>
              <div className="mt-1 text-sm text-neutral-500 uppercase tracking-wider">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-500">45+</div>
              <div className="mt-1 text-sm text-neutral-500 uppercase tracking-wider">Data Sources</div>
            </div>
          </div>

          {/* Trust Indicators */}
          {isWhiteLabel && products.length > 0 && (
            <div className="mt-12 flex flex-wrap justify-center gap-2">
              {products.slice(0, 5).map((product) => (
                <span
                  key={product.model}
                  className="px-3 py-1.5 bg-neutral-100 rounded-lg text-xs text-neutral-600 font-medium"
                >
                  {product.model}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-50 to-transparent" />
    </section>
  );
}

export default HeroV2;
