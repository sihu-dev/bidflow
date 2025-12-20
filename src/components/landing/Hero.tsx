/**
 * 히어로 섹션
 */
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.1),transparent)]" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            제조업 SME를 위한 AI 입찰 자동화
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            입찰 공고 분석부터
            <br />
            <span className="text-primary">제안서 작성까지</span> 자동으로
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            나라장터, TED, SAM.gov 공고를 AI가 자동 수집하고,
            귀사 제품과 매칭하여 입찰 성공률을 높여드립니다.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">무료로 시작하기</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                데모 보기
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>14일 무료 체험</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>신용카드 불필요</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>5분 만에 설정 완료</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
