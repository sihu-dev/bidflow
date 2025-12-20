/**
 * 히어로 섹션 - 모노크롬 프리미엄
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Play, ArrowRight } from 'lucide-react';

export function Hero() {
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
            제조업 SME를 위한 AI 입찰 자동화
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900">
            입찰 공고 분석부터
            <br />
            <span className="text-neutral-400">제안서 작성까지</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            나라장터, TED, SAM.gov 공고를 AI가 자동 수집하고,
            귀사 제품과 매칭하여 입찰 성공률을 높여드립니다.
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
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-900" />
              <span>14일 무료 체험</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-900" />
              <span>신용카드 불필요</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-900" />
              <span>5분 만에 설정 완료</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
