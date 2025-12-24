/**
 * 물류/유통 활용사례 페이지
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: '물류/유통 | 활용사례 | BIDFLOW',
  description: '물류 및 유통 산업의 공공조달 입찰 자동화 사례',
};

const challenges = [
  { title: '대량 운송 입찰', desc: '수천 건의 운송 계약 관리' },
  { title: '실시간 가격 변동', desc: '유류비, 인건비 반영 필요' },
  { title: '지역별 분산 관리', desc: '전국 물류센터 조율' },
  { title: '규격 다양성', desc: '품목별 상이한 요구사항' },
];

const solutions = [
  { title: '운송 입찰 자동 수집', desc: '물류 관련 공고 필터링' },
  { title: '원가 기반 분석', desc: '수익성 자동 계산' },
  { title: '지역 매칭', desc: '물류센터 기반 공고 배정' },
  { title: '카테고리 분류', desc: '자동 품목 분류' },
];

const metrics = [
  { value: '45%', label: '입찰 참여 증가' },
  { value: '28%', label: '낙찰률 향상' },
  { value: '60%', label: '관리 시간 절감' },
  { value: '3.2억', label: '연간 수주 증가' },
];

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">물류/유통</Badge>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              물류 운송 입찰의 새로운 기준
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              전국 단위 운송 계약부터 지역 배송까지,
              BIDFLOW로 물류 입찰을 체계적으로 관리하세요.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">상담 문의</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 도전과제 */}
      <section className="border-b bg-neutral-50">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">물류 입찰의 도전과제</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challenges.map((item) => (
              <div key={item.title} className="p-6 bg-white border rounded-lg">
                <h3 className="font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 솔루션 */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">BIDFLOW 솔루션</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((item) => (
              <div key={item.title} className="p-6 border rounded-lg hover:border-neutral-400 transition-colors">
                <h3 className="font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 성과 지표 */}
      <section className="border-b bg-neutral-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">도입 효과</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-3xl font-bold font-mono text-neutral-300">{item.value}</div>
                <div className="text-sm text-neutral-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 고객 사례 */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <blockquote className="text-xl text-neutral-700 mb-6">
              &ldquo;전국 20개 물류센터의 입찰을 한 곳에서 관리할 수 있게 되었습니다.
              지역별 공고를 자동으로 분류해주니 담당자 업무가 크게 줄었습니다.&rdquo;
            </blockquote>
            <div className="text-sm text-neutral-500">
              — 물류 기업 입찰 담당 팀장
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">물류 입찰 자동화 시작하기</h2>
          <p className="text-neutral-600 mb-6">14일 무료 체험으로 BIDFLOW를 경험해보세요.</p>
          <Button asChild size="lg">
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
