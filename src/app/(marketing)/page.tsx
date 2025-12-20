/**
 * 랜딩 페이지
 */
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { Features } from '@/components/landing/Features';
import { SpreadsheetDemo } from '@/components/landing/SpreadsheetDemo';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingPreview } from '@/components/landing/PricingPreview';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';

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
