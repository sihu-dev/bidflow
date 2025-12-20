/**
 * IT 서비스 활용 사례 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Laptop, Check, ArrowLeft, Quote, TrendingUp } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.useCases.itServices);

const challenges = [
  '기술 요구사항 분석에 많은 시간이 소요됨',
  'RFP 분석 및 솔루션 매핑이 복잡함',
  '기술 제안서 작성에 전문 인력 투입 필요',
  '유지보수 계약 갱신 시점 관리가 어려움',
];

const solutions = [
  {
    title: 'RFP 자동 분석',
    description: 'AI가 RFP를 분석하여 기술 요구사항, 범위, 평가 기준을 자동으로 정리합니다.',
  },
  {
    title: '솔루션 매핑',
    description: '귀사의 솔루션/서비스와 RFP 요구사항을 자동으로 매칭하여 적합도를 평가합니다.',
  },
  {
    title: '기술 제안서 초안 생성',
    description: '솔루션 사양과 RFP 요구사항을 기반으로 기술 제안서 초안을 자동 생성합니다.',
  },
  {
    title: '계약 갱신 추적',
    description: '유지보수 계약 만료일을 추적하고 갱신 입찰 기회를 알려드립니다.',
  },
];

const results = [
  { metric: '82%', label: 'RFP 분석 시간 절감' },
  { metric: '35%', label: '평균 낙찰률' },
  { metric: '3배', label: '입찰 참여 건수 증가' },
  { metric: '60%', label: '제안서 작성 시간 단축' },
];

const caseStudy = {
  company: '테크원',
  industry: 'SI/솔루션',
  quote: 'RFP 분석에 하루가 걸리던 것이 30분이면 됩니다. AI가 요구사항을 정리해주니 제안서 작성 품질도 높아졌어요.',
  person: '이현우 팀장',
  results: [
    'RFP 분석 시간 95% 단축',
    '제안서 작성 품질 향상',
    '연간 입찰 참여 200건 달성',
  ],
};

const serviceTypes = [
  'SI(시스템 통합)', 'SW 개발', '클라우드 구축', 'IT 인프라',
  '정보보안', 'DBA/유지보수', 'IT 컨설팅', '빅데이터/AI',
  'ERP/CRM', '웹/앱 개발', '네트워크 구축', 'IT 아웃소싱',
];

export default function ItServicesPage() {
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
                <Laptop className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary">IT 서비스</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              IT 서비스 입찰 자동화
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              SI, 소프트웨어 개발, IT 인프라 분야를 위한
              맞춤형 입찰 관리 솔루션.
              RFP 분석부터 기술 제안서 작성까지 자동화합니다.
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
            <h2 className="text-3xl font-bold mb-8 text-center">IT 서비스업의 입찰 과제</h2>
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
              IT 서비스 특화 기능으로 입찰 업무를 혁신합니다
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

      {/* Service Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6">지원 서비스 분야</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {serviceTypes.map((type) => (
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
            IT 서비스 입찰 자동화를 시작하세요
          </h2>
          <p className="text-muted-foreground mb-8">
            14일 무료 체험으로 BIDFLOW의 가치를 직접 확인해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">무료 체험 시작</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/use-cases">
                <ArrowLeft className="mr-2 w-4 h-4" /> 모든 산업 보기
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
