/**
 * AI 매칭 분석 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { Sparkles, Target, Brain, TrendingUp, ArrowRight, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.aiMatching);

const matchingProcess = [
  {
    step: '01',
    title: '공고 분석',
    description: 'AI가 공고 요구사항, 자격 조건, 기술 사양을 자동으로 분석합니다.',
  },
  {
    step: '02',
    title: '제품 매칭',
    description: '귀사 제품 카탈로그와 공고 요구사항을 자동으로 비교합니다.',
  },
  {
    step: '03',
    title: '적합도 평가',
    description: '요구사항 충족도, 경쟁력, 수익성을 종합 평가합니다.',
  },
  {
    step: '04',
    title: '점수 산출',
    description: '0-100점 매칭 점수와 상세 분석 리포트를 제공합니다.',
  },
];

const analysisItems = [
  { label: '기술 사양 일치도', description: '제품 스펙과 요구사항 비교' },
  { label: '자격 조건 충족', description: '입찰 참여 자격 검토' },
  { label: '납품 가능성', description: '수량, 일정, 지역 검토' },
  { label: '가격 경쟁력', description: '예정가격 대비 분석' },
  { label: '과거 낙찰 이력', description: '유사 공고 낙찰 패턴' },
  { label: '경쟁사 분석', description: '예상 경쟁 강도 평가' },
];

const benefits = [
  '적합한 공고만 선별하여 시간 절약',
  '객관적인 데이터 기반 의사결정',
  '매칭 근거와 분석 리포트 제공',
  '지속적인 AI 학습으로 정확도 향상',
];

export default function AiMatchingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary">AI 기능</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              AI 기반<br />매칭 분석
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Claude AI가 귀사 제품과 공고 요구사항을 분석하여
              적합도를 자동으로 평가하고 점수를 매깁니다.
              어떤 공고에 집중해야 할지 AI가 알려드립니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">모든 기능 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Process */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">매칭 프로세스</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {matchingProcess.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="p-6 rounded-xl bg-card border h-full">
                  <span className="text-4xl font-bold text-primary/20">{item.step}</span>
                  <h3 className="text-lg font-semibold mt-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < matchingProcess.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 text-muted-foreground -tranneutral-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold mb-6">분석 항목</h2>
                <p className="text-muted-foreground mb-8">
                  AI가 다양한 항목을 종합적으로 분석하여 정확한 매칭 점수를 산출합니다.
                </p>
                <div className="grid gap-4">
                  {analysisItems.map((item) => (
                    <div key={item.label} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{item.label}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:sticky lg:top-24">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Claude AI</h3>
                    <p className="text-muted-foreground">Powered by Anthropic</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 bg-background rounded-lg">
                      <span>정확도</span>
                      <span className="font-medium">95%+</span>
                    </div>
                    <div className="flex justify-between p-3 bg-background rounded-lg">
                      <span>분석 속도</span>
                      <span className="font-medium">~3초/건</span>
                    </div>
                    <div className="flex justify-between p-3 bg-background rounded-lg">
                      <span>지원 언어</span>
                      <span className="font-medium">한/영</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-8">기대 효과</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                  <Check className="w-5 h-5 text-neutral-700 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: '공고 수집', href: '/features/collection' }}
        next={{ label: '제안서 생성', href: '/features/proposal' }}
      />
    </>
  );
}
