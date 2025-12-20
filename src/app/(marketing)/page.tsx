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

// Code Splitting: SpreadsheetDemo를 별도 청크로 분리하여 초기 로드 최적화
// SSR 유지하여 SEO 손실 없음
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
