/**
 * 제조업 활용 사례 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Factory, Check, ArrowRight, Quote, TrendingUp } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.useCases.manufacturing);

const challenges = [
  '여러 플랫폼의 공고를 일일이 확인하는데 많은 시간 소요',
  '제품 사양과 공고 요구사항 비교가 복잡하고 어려움',
  '마감일 관리가 어렵고 기회를 놓치는 경우 발생',
  '제안서 작성에 과도한 시간과 리소스 투입',
];

const solutions = [
  {
    title: '자동 공고 수집',
    description: '산업용 장비, 계측기기, 제어장치 관련 공고를 자동으로 수집하여 한곳에서 관리합니다.',
  },
  {
    title: 'AI 제품 매칭',
    description: '제품 카탈로그와 공고 요구사항을 AI가 자동으로 비교하여 적합도를 분석합니다.',
  },
  {
    title: '기술 제안서 자동 생성',
    description: '제품 사양서를 기반으로 기술 제안서 초안을 자동으로 작성합니다.',
  },
  {
    title: '실시간 마감 알림',
    description: '중요 공고의 마감일을 실시간으로 알려 기회를 놓치지 않습니다.',
  },
];

const results = [
  { metric: '78%', label: '입찰 분석 시간 절감' },
  { metric: '32%', label: '평균 낙찰률' },
  { metric: '3배', label: '입찰 참여 건수 증가' },
  { metric: '50%', label: '제안서 작성 시간 단축' },
];

const caseStudy = {
  company: '씨엠엔텍',
  industry: '유량계 제조',
  quote: 'BIDFLOW 도입 후 입찰 관련 업무 시간이 80% 이상 줄었습니다. 이전에는 3명이 하루 종일 공고를 확인했는데, 지금은 1명이 1시간이면 충분합니다.',
  person: '김영수 대표',
  results: [
    '월 50건 이상 공고 자동 수집',
    '입찰 참여율 3배 증가',
    '낙찰률 15%에서 32%로 향상',
  ],
};

const productTypes = [
  '유량계', '압력계', '온도계', '레벨계',
  'PLC', 'HMI', '인버터', '모터',
  '밸브', '펌프', '센서', '변환기',
];

export default function ManufacturingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/use-cases"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              ← 활용 사례로 돌아가기
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Factory className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary">제조업</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              제조업 입찰 자동화
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              산업용 장비, 계측기기, 부품 제조업체를 위한
              맞춤형 입찰 자동화 솔루션.
              공고 수집부터 제안서 작성까지 전 과정을 자동화합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">상담 요청</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">제조업의 입찰 과제</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {challenges.map((challenge, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {index + 1}
                  </div>
                  <span>{challenge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">BIDFLOW 솔루션</h2>
            <p className="text-muted-foreground text-center mb-12">
              제조업 특화 기능으로 입찰 업무를 혁신합니다
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {solutions.map((solution) => (
                <div key={solution.title} className="p-6 rounded-xl border bg-card">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neutral-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">{solution.title}</h3>
                      <p className="text-sm text-muted-foreground">{solution.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">도입 효과</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {results.map((result) => (
              <div key={result.label} className="text-center">
                <p className="text-4xl font-bold mb-2">{result.metric}</p>
                <p className="text-sm opacity-80">{result.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">고객 사례</h2>
            <div className="p-8 rounded-2xl border bg-card">
              <div className="flex items-start gap-4 mb-6">
                <Quote className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <p className="text-lg italic mb-4">{caseStudy.quote}</p>
                  <p className="font-medium">{caseStudy.person}</p>
                  <p className="text-sm text-muted-foreground">{caseStudy.company} · {caseStudy.industry}</p>
                </div>
              </div>
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neutral-700" />
                  도입 성과
                </h4>
                <ul className="space-y-2">
                  {caseStudy.results.map((result) => (
                    <li key={result} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-neutral-700" />
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6">지원 제품 분야</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {productTypes.map((type) => (
                <Badge key={type} variant="outline" className="text-sm py-1.5 px-3">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            제조업 입찰 자동화를 시작하세요
          </h2>
          <p className="text-muted-foreground mb-8">
            14일 무료 체험으로 BIDFLOW의 가치를 직접 확인해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">무료 체험 시작</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/use-cases/construction">
                다른 산업 보기 <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
