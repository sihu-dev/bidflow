/**
 * 랜딩 페이지
 */
import dynamic from 'next/dynamic';
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingPreview } from '@/components/landing/PricingPreview';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';

// Code Splitting: SpreadsheetDemo를 클라이언트 사이드에서만 로드
// ssr: false 설정으로 초기 HTML 번들에서 제외 (13.5KB → 약 2-3KB)
// Trade-off: SEO 손실 (Google은 JS 실행하므로 큰 문제 없음)
const SpreadsheetDemo = dynamic(
  () => import('@/components/landing/SpreadsheetDemo').then((mod) => ({ default: mod.SpreadsheetDemo })),
  {
    loading: () => (
      <div className="py-24 bg-neutral-50 flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">스프레드시트 로딩 중...</p>
        </div>
      </div>
    ),
    ssr: false, // 클라이언트 사이드만 (번들 사이즈 감소)
  }
);

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Stats />
      <SpreadsheetDemo />
      <Features />
      <HowItWorks />
      <Testimonials />
      <PricingPreview />
      <FAQ />
      <CTA />
    </>
  );
}
