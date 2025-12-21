/**
 * BIDFLOW 랜딩 페이지
 * Google DeepMind-inspired Light Theme
 */
import dynamic from 'next/dynamic';
import { HeroV2 } from '@/components/landing/HeroV2';
import { PainPoints } from '@/components/landing/PainPoints';
import { FeaturesV2 } from '@/components/landing/FeaturesV2';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingPreview } from '@/components/landing/PricingPreview';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';

// Code Splitting: SpreadsheetDemo를 별도 청크로 분리하여 초기 로드 최적화
const SpreadsheetDemo = dynamic(
  () => import('@/components/landing/SpreadsheetDemo').then((mod) => ({ default: mod.SpreadsheetDemo })),
  {
    loading: () => (
      <div className="py-24 bg-white flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">AI 스프레드시트 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function LandingPage() {
  return (
    <>
      {/* Hero - Pain Point Focus */}
      <HeroV2 />

      {/* Problem Definition */}
      <PainPoints />

      {/* Core Features with Quantified Results */}
      <FeaturesV2 />

      {/* Interactive Demo */}
      <SpreadsheetDemo />

      {/* How It Works */}
      <HowItWorks />

      {/* Social Proof */}
      <Testimonials />

      {/* Pricing */}
      <PricingPreview />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <CTA />
    </>
  );
}
