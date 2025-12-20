/**
 * 나라장터 연동 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Check, Clock, Database, Bell, Search } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.integrations.narajangto);

const features = [
  {
    icon: Search,
    title: '전체 공고 수집',
    description: '물품, 공사, 용역, 외자 등 모든 유형의 공고를 자동으로 수집합니다.',
  },
  {
    icon: Clock,
    title: '실시간 업데이트',
    description: '매일 3회(9시, 15시, 21시) 새 공고를 자동으로 수집합니다.',
  },
  {
    icon: Database,
    title: '상세 정보 제공',
    description: '공고 상세, 첨부파일, 입찰 결과까지 모든 정보를 제공합니다.',
  },
  {
    icon: Bell,
    title: '맞춤 알림',
    description: '키워드, 금액, 지역 등 조건에 맞는 공고만 알림을 받습니다.',
  },
];

const bidTypes = [
  { type: '물품', description: '일반 물품 및 장비 구매' },
  { type: '공사', description: '건설, 토목, 설비 공사' },
  { type: '용역', description: 'IT, 컨설팅, 유지보수 서비스' },
  { type: '외자', description: '해외 물품 구매' },
  { type: '민간', description: '민간 위탁 사업' },
  { type: 'PQ', description: '사전자격심사 공고' },
];

const dataFields = [
  '공고명', '공고번호', '공고기관', '수요기관',
  '입찰방식', '계약방법', '추정가격', '사업금액',
  '입찰마감일', '개찰일시', '납품기한', '납품장소',
  '첨부파일', '규격서', '설계서', '물량내역서',
];

const stats = [
  { label: '월 평균 공고 수', value: '50,000+' },
  { label: '커버리지', value: '100%' },
  { label: '업데이트 주기', value: '1일 3회' },
  { label: '데이터 정확도', value: '99.9%' },
];

export default function NarajangtoPage() {
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
              <span className="text-5xl">🇰🇷</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold">나라장터 (G2B)</h1>
                  <Badge>지원</Badge>
                </div>
                <p className="text-muted-foreground">대한민국 공공조달 통합 플랫폼</p>
              </div>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              대한민국 최대 공공조달 플랫폼인 나라장터의 모든 공고를
              BIDFLOW에서 자동으로 수집하고 관리할 수 있습니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://www.g2b.go.kr" target="_blank">
                  나라장터 방문 →
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

      {/* Bid Types */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">지원 입찰 유형</h2>
            <p className="text-muted-foreground text-center mb-12">
              나라장터의 모든 입찰 유형을 지원합니다
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {bidTypes.map((item) => (
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

      {/* Data Fields */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">수집 데이터</h2>
            <p className="text-muted-foreground text-center mb-12">
              공고의 모든 상세 정보를 수집합니다
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {dataFields.map((field) => (
                <Badge key={field} variant="outline" className="text-sm py-1.5 px-3">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            나라장터 공고를 자동으로 관리하세요
          </h2>
          <p className="opacity-90 mb-8">
            14일 무료 체험으로 시작하세요. 신용카드 필요 없음.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
