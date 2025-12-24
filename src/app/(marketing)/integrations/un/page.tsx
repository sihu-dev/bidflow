/**
 * UN Procurement 연동 페이지
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'UN Procurement 연동 | BIDFLOW',
  description: '유엔 조달 입찰 공고 자동 수집 및 분석',
};

const features = [
  { title: 'UNGM 연동', desc: 'UN Global Marketplace 자동 수집' },
  { title: '다국어 지원', desc: '영어, 프랑스어, 스페인어 공고' },
  { title: '카테고리 매핑', desc: 'UNSPSC 코드 기반 분류' },
  { title: '글로벌 알림', desc: '시차 고려 마감 알림' },
];

const stats = [
  { value: '5,000+', label: '월간 공고 수' },
  { value: '$20B', label: '연간 조달 규모' },
  { value: '44', label: 'UN 기관 수' },
  { value: '193', label: '회원국' },
];

const agencies = [
  'UNDP',
  'UNICEF',
  'WHO',
  'WFP',
  'UNHCR',
  'UNOPS',
  'FAO',
  'UNESCO',
  'ILO',
  'IAEA',
];

export default function UNPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">국제기구</Badge>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              UN Procurement 연동
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              유엔 및 산하 기관의 글로벌 조달 입찰 공고를
              자동으로 수집하고 분석합니다.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/integrations">다른 플랫폼 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 */}
      <section className="border-b bg-neutral-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-neutral-900 font-mono">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">연동 기능</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item) => (
              <div key={item.title} className="p-6 border rounded-lg">
                <h3 className="font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기관 목록 */}
      <section className="border-b bg-neutral-50">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">지원 UN 기관</h2>
          <div className="flex flex-wrap gap-2">
            {agencies.map((agency) => (
              <Badge key={agency} variant="outline" className="text-sm py-1.5 px-3">
                {agency}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-sm py-1.5 px-3">
              +34 more
            </Badge>
          </div>
        </div>
      </section>

      {/* 글로벌 진출 */}
      <section className="border-b bg-neutral-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">글로벌 시장 진출</h2>
            <p className="text-neutral-400 mb-8">
              UN 조달 시장은 한국 기업의 글로벌 진출 첫 단계입니다.
              BIDFLOW로 국제 입찰에 체계적으로 접근하세요.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold font-mono text-neutral-300">UNGM</div>
                <div className="text-sm text-neutral-400">Global Marketplace</div>
              </div>
              <div className="p-4 bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold font-mono text-neutral-300">UNSPSC</div>
                <div className="text-sm text-neutral-400">표준 분류 체계</div>
              </div>
              <div className="p-4 bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold font-mono text-neutral-300">24/7</div>
                <div className="text-sm text-neutral-400">글로벌 모니터링</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">UN 조달 시장 진출하기</h2>
          <p className="text-neutral-600 mb-6">Enterprise 플랜에서 UN Procurement 연동을 이용할 수 있습니다.</p>
          <Button asChild size="lg">
            <Link href="/contact">Enterprise 문의</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
