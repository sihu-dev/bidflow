/**
 * SAM.gov 연동 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Check, Building, Award, FileText, Shield } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.integrations.samgov);

const features = [
  {
    icon: Building,
    title: '연방 기관 전체',
    description: '미국 연방정부 모든 기관의 계약 기회를 수집합니다.',
  },
  {
    icon: Award,
    title: 'NAICS 코드 매칭',
    description: '북미산업분류시스템(NAICS) 코드로 자동 매칭합니다.',
  },
  {
    icon: FileText,
    title: '계약 이력 조회',
    description: '과거 계약 이력과 낙찰 정보를 조회할 수 있습니다.',
  },
  {
    icon: Shield,
    title: 'Set-Aside 필터',
    description: '소기업, 여성기업 등 Set-Aside 프로그램별 필터링을 지원합니다.',
  },
];

const agencies = [
  '국방부 (DoD)', '보건복지부 (HHS)', '국토안보부 (DHS)', '법무부 (DOJ)',
  '에너지부 (DOE)', '교통부 (DOT)', '농무부 (USDA)', '상무부 (DOC)',
  '국무부 (DOS)', '재무부 (Treasury)', 'NASA', 'GSA',
];

const setAsideTypes = [
  { type: 'Small Business', description: '소기업 우대' },
  { type: '8(a)', description: '소수민족 기업' },
  { type: 'HUBZone', description: '역사적 저활용 사업지역' },
  { type: 'WOSB', description: '여성 소유 소기업' },
  { type: 'SDVOSB', description: '서비스 장애 재향군인 기업' },
  { type: 'VOSB', description: '재향군인 소유 소기업' },
];

const stats = [
  { label: '월 평균 공고 수', value: '30,000+' },
  { label: '연방 기관', value: '100+' },
  { label: '연간 계약 규모', value: '$700B+' },
  { label: 'NAICS 코드', value: '1,000+' },
];

export default function SamgovPage() {
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
              <span className="text-5xl">🇺🇸</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold">SAM.gov</h1>
                  <Badge>지원</Badge>
                </div>
                <p className="text-muted-foreground">System for Award Management</p>
              </div>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              미국 연방정부 공공조달 포털인 SAM.gov의 모든 계약 기회를
              BIDFLOW에서 관리하세요.
              미국 정부 조달 시장 진출의 파트너가 되겠습니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://sam.gov" target="_blank">
                  SAM.gov 방문 →
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

      {/* Agencies */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">주요 연방 기관</h2>
            <p className="text-muted-foreground text-center mb-12">
              미국 연방정부의 모든 기관 공고를 수집합니다
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {agencies.map((agency) => (
                <Badge key={agency} variant="outline" className="text-sm py-1.5 px-3">
                  {agency}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Set-Aside Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">Set-Aside 프로그램</h2>
            <p className="text-muted-foreground text-center mb-12">
              다양한 Set-Aside 프로그램별 필터링을 지원합니다
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {setAsideTypes.map((item) => (
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
            미국 연방 조달 시장에 진출하세요
          </h2>
          <p className="opacity-90 mb-8">
            14일 무료 체험으로 SAM.gov 공고를 확인하세요.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">무료 체험 시작</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
