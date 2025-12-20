/**
 * TED 연동 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Check, Globe, Languages, FileSearch, Sparkles } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.integrations.ted);

const features = [
  {
    icon: Globe,
    title: 'EU 전역 커버리지',
    description: 'EU 27개 회원국 및 EEA 국가의 모든 공공조달 공고를 수집합니다.',
  },
  {
    icon: Languages,
    title: '자동 번역',
    description: '원문 공고를 한국어로 자동 번역하여 제공합니다.',
  },
  {
    icon: FileSearch,
    title: 'CPV 코드 매칭',
    description: 'CPV(공통조달용어) 코드로 제품과 공고를 자동 매칭합니다.',
  },
  {
    icon: Sparkles,
    title: 'AI 요약',
    description: '긴 공고 내용을 AI가 핵심 요약하여 제공합니다.',
  },
];

const countries = [
  '독일', '프랑스', '이탈리아', '스페인', '폴란드', '네덜란드',
  '벨기에', '스웨덴', '오스트리아', '덴마크', '핀란드', '아일랜드',
  '포르투갈', '그리스', '체코', '루마니아', '헝가리', '슬로바키아',
  '크로아티아', '슬로베니아', '리투아니아', '라트비아', '에스토니아',
  '불가리아', '룩셈부르크', '키프로스', '몰타',
];

const procedureTypes = [
  { type: '공개 입찰', description: 'Open procedure' },
  { type: '제한 입찰', description: 'Restricted procedure' },
  { type: '협상 절차', description: 'Negotiated procedure' },
  { type: '경쟁적 대화', description: 'Competitive dialogue' },
  { type: '혁신 파트너십', description: 'Innovation partnership' },
  { type: '설계 경쟁', description: 'Design contest' },
];

const stats = [
  { label: '월 평균 공고 수', value: '80,000+' },
  { label: '커버리지', value: '27개국' },
  { label: '언어 지원', value: '24개 언어' },
  { label: 'CPV 코드', value: '9,000+' },
];

export default function TedPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> 연동 플랫폼으로 돌아가기
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">🇪🇺</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold">TED</h1>
                  <Badge>지원</Badge>
                </div>
                <p className="text-muted-foreground">Tenders Electronic Daily</p>
              </div>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              유럽연합 공식 공공조달 플랫폼인 TED의 모든 공고를
              한국어로 번역하여 제공합니다.
              EU 시장 진출의 첫 걸음을 BIDFLOW와 함께하세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://ted.europa.eu" target="_blank">
                  TED 방문 →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">연동 기능</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border bg-card">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">지원 국가</h2>
            <p className="text-muted-foreground text-center mb-12">
              EU 27개 회원국의 공고를 모두 수집합니다
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {countries.map((country) => (
                <Badge key={country} variant="outline" className="text-sm py-1.5 px-3">
                  {country}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Procedure Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">지원 절차 유형</h2>
            <p className="text-muted-foreground text-center mb-12">
              EU 공공조달의 모든 절차 유형을 지원합니다
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {procedureTypes.map((item) => (
                <div key={item.type} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-neutral-700 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{item.type}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            EU 시장 진출을 시작하세요
          </h2>
          <p className="opacity-90 mb-8">
            14일 무료 체험으로 TED 공고를 한국어로 확인하세요.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
