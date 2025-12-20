/**
 * 활용 사례 메인 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Factory, Building2, Laptop, Truck, Wrench, ArrowRight } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.useCases.main);

const industries = [
  {
    icon: Factory,
    name: '제조업',
    slug: 'manufacturing',
    description: '산업용 장비, 부품, 소재 등 제조 분야 입찰 자동화',
    examples: ['유량계 제조', '산업용 센서', '자동화 설비', '정밀 부품'],
    stats: { bidWin: '32%', timeReduction: '78%' },
  },
  {
    icon: Building2,
    name: '건설업',
    slug: 'construction',
    description: '토목, 건축, 플랜트 등 건설 분야 입찰 관리',
    examples: ['토목 공사', '건축 설계', '플랜트 시공', '리모델링'],
    stats: { bidWin: '28%', timeReduction: '65%' },
  },
  {
    icon: Laptop,
    name: 'IT 서비스',
    slug: 'it-services',
    description: 'SI, 소프트웨어 개발, IT 인프라 입찰 최적화',
    examples: ['시스템 통합', 'SW 개발', '클라우드 구축', '유지보수'],
    stats: { bidWin: '35%', timeReduction: '82%' },
  },
  {
    icon: Truck,
    name: '물류/유통',
    slug: 'logistics',
    description: '물류 서비스, 유통 관련 공공 입찰 관리',
    examples: ['물류 대행', '창고 운영', '배송 서비스', '공급망 관리'],
    stats: { bidWin: '25%', timeReduction: '70%' },
  },
  {
    icon: Wrench,
    name: '시설관리',
    slug: 'facility',
    description: '빌딩 관리, 청소, 경비 등 시설 관리 입찰',
    examples: ['빌딩 관리', '청소 용역', '경비 용역', '조경 관리'],
    stats: { bidWin: '30%', timeReduction: '75%' },
  },
];

export default function UseCasesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              활용 사례
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              다양한 산업에서<br />활용되고 있습니다
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              제조업부터 IT 서비스까지, BIDFLOW는 다양한 산업의<br />
              입찰 프로세스를 혁신하고 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            {industries.map((industry) => (
              <div
                key={industry.slug}
                className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left */}
                  <div className="lg:w-2/3">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <industry.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold">{industry.name}</h2>
                        </div>
                        <p className="text-muted-foreground">{industry.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {industry.examples.map((example) => (
                        <Badge key={example} variant="secondary">
                          {example}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/use-cases/${industry.slug}`}>
                        자세히 보기 <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Right - Stats */}
                  <div className="lg:w-1/3 flex lg:flex-col gap-4">
                    <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-3xl font-bold text-primary">{industry.stats.bidWin}</p>
                      <p className="text-sm text-muted-foreground">평균 낙찰률</p>
                    </div>
                    <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-3xl font-bold text-neutral-700">{industry.stats.timeReduction}</p>
                      <p className="text-sm text-muted-foreground">시간 절감</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            귀사의 산업에 맞는 솔루션이 궁금하신가요?
          </h2>
          <p className="text-muted-foreground mb-8">
            전문 컨설턴트가 귀사에 최적화된 활용 방안을 제안해 드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">상담 요청</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/signup">무료 체험 시작</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
