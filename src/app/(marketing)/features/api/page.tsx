/**
 * REST API 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { Code, Zap, Lock, Book, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.api);

const endpoints = [
  { method: 'GET', path: '/api/v1/bids', description: '입찰 목록 조회' },
  { method: 'GET', path: '/api/v1/bids/:id', description: '입찰 상세 조회' },
  { method: 'POST', path: '/api/v1/bids', description: '입찰 생성' },
  { method: 'PATCH', path: '/api/v1/bids/:id', description: '입찰 수정' },
  { method: 'DELETE', path: '/api/v1/bids/:id', description: '입찰 삭제' },
  { method: 'GET', path: '/api/v1/sources', description: '데이터 소스 목록' },
  { method: 'POST', path: '/api/v1/webhooks', description: '웹훅 등록' },
  { method: 'GET', path: '/api/v1/analytics', description: '분석 데이터' },
];

const features = [
  {
    icon: Zap,
    title: '고성능',
    description: '평균 응답 시간 100ms 미만의 빠른 API',
  },
  {
    icon: Lock,
    title: '안전한 인증',
    description: 'API Key 기반 인증 및 Rate Limiting',
  },
  {
    icon: Book,
    title: '상세 문서',
    description: 'OpenAPI 스펙 및 예제 코드 제공',
  },
];

const useCases = [
  { title: 'ERP 연동', description: '기존 ERP 시스템과 입찰 데이터 동기화' },
  { title: 'BI 대시보드', description: '분석 도구에 입찰 데이터 연결' },
  { title: '자동화 워크플로우', description: 'Zapier, Make 등과 연동' },
  { title: '커스텀 앱', description: '자체 애플리케이션 개발' },
];

const rateLimits = [
  { plan: 'Pro', limit: '1,000 req/일', description: '기본 API 접근' },
  { plan: 'Enterprise', limit: '무제한', description: '전용 API 엔드포인트' },
];

export default function ApiPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Code className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary">개발자</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              REST API
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              강력한 API를 통해 기존 시스템과 통합하거나
              자동화 워크플로우를 구축하세요.
              모든 기능을 프로그래밍 방식으로 활용할 수 있습니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/docs">API 문서 보기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup">API 키 발급</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl bg-card border text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">API 엔드포인트</h2>
            <p className="text-muted-foreground text-center mb-12">
              RESTful API로 모든 기능에 접근할 수 있습니다
            </p>
            <div className="rounded-xl border overflow-hidden">
              <div className="bg-muted/50 p-4 border-b">
                <code className="text-sm">https://api.bidflow.io/v1</code>
              </div>
              <div className="divide-y">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.path} className="p-4 flex items-center gap-4">
                    <Badge
                      variant={endpoint.method === 'GET' ? 'default' :
                               endpoint.method === 'POST' ? 'secondary' :
                               endpoint.method === 'PATCH' ? 'outline' : 'destructive'}
                      className="w-16 justify-center"
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm flex-1">{endpoint.path}</code>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">코드 예제</h2>
            <div className="rounded-xl bg-[#1e1e1e] p-6 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{`// 입찰 목록 조회
const response = await fetch('https://api.bidflow.io/v1/bids', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const bids = await response.json();
logger.info(bids);

// 결과 예시
{
  "data": [
    {
      "id": "bid_123",
      "title": "서울시 초음파유량계 구매",
      "source": "narajangto",
      "deadline": "2025-01-15",
      "estimatedAmount": 450000000,
      "matchScore": 92
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 156
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">활용 사례</h2>
            <p className="text-muted-foreground text-center mb-12">
              다양한 시스템과 연동하여 활용하세요
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase) => (
                <div key={useCase.title} className="p-6 rounded-xl border bg-card">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neutral-700 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">{useCase.title}</h3>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Rate Limits</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {rateLimits.map((item) => (
                <div key={item.plan} className="p-4 rounded-lg border bg-card text-center">
                  <Badge className="mb-2">{item.plan}</Badge>
                  <p className="text-2xl font-bold">{item.limit}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: '팀 협업', href: '/features/collaboration' }}
        next={{ label: '보안', href: '/features/security' }}
      />
    </>
  );
}
