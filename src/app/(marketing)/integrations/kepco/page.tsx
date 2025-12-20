/**
 * 한전 (KEPCO) 연동 페이지
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap, Building2, FileText, Bell, Shield } from 'lucide-react';

export const metadata = {
  title: '한전 (KEPCO) 연동 | BIDFLOW',
  description: 'BIDFLOW와 한국전력공사 조달시스템 연동',
};

const features = [
  {
    icon: Zap,
    title: '전력 관련 입찰 전문',
    description: '발전, 송배전, 전력 설비 관련 입찰 공고 특화 수집',
  },
  {
    icon: Building2,
    title: '한전 계열사 통합',
    description: '한전KDN, 한전KPS, 한전원자력연료 등 계열사 공고 포함',
  },
  {
    icon: FileText,
    title: '입찰 서류 분석',
    description: '한전 표준 입찰 양식에 맞춘 자동 서류 분석',
  },
  {
    icon: Bell,
    title: '실시간 공고 알림',
    description: '관심 분야 공고 등록 시 즉시 알림',
  },
];

const bidTypes = [
  '전력 계측 장비',
  '변압기 및 차단기',
  '배전반/분전반',
  '전력 케이블',
  '발전 설비',
  '신재생 에너지',
  '전력 IT 시스템',
  '유지보수 서비스',
];

export default function KepcoIntegrationPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <Badge variant="secondary" className="mb-6">연동</Badge>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-neutral-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">한전 (KEPCO)</h1>
              <p className="text-muted-foreground">한국전력공사 조달시스템</p>
            </div>
          </div>

          <p className="text-xl text-muted-foreground mb-12">
            한국전력공사 및 계열사의 입찰 공고를 자동으로 수집하고 분석합니다.
            전력 산업 특화 키워드 매칭으로 관련 공고를 놓치지 마세요.
          </p>

          {/* 연동 상태 */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-12">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-neutral-600" />
              <div>
                <h3 className="font-semibold text-neutral-900">베타 연동</h3>
                <p className="text-sm text-neutral-700">
                  한전 연동은 현재 베타 버전입니다. 일부 기능이 제한될 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 주요 기능 */}
          <h2 className="text-2xl font-semibold mb-6">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="border rounded-lg p-6">
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* 지원 입찰 유형 */}
          <h2 className="text-2xl font-semibold mb-6">지원 입찰 유형</h2>
          <div className="flex flex-wrap gap-2 mb-12">
            {bidTypes.map((type, index) => (
              <Badge key={index} variant="outline" className="py-2 px-4">
                {type}
              </Badge>
            ))}
          </div>

          {/* 연동 방법 */}
          <h2 className="text-2xl font-semibold mb-6">연동 방법</h2>
          <div className="space-y-4 mb-12">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="font-semibold">계정 생성</h3>
                <p className="text-muted-foreground text-sm">BIDFLOW 계정을 생성하고 로그인합니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="font-semibold">연동 설정</h3>
                <p className="text-muted-foreground text-sm">설정 &gt; 연동에서 한전을 선택하고 활성화합니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="font-semibold">키워드 설정</h3>
                <p className="text-muted-foreground text-sm">관심 분야 키워드를 설정하여 맞춤 공고를 수신합니다.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-primary/5 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">한전 입찰 공고 모니터링 시작하기</h3>
            <p className="text-muted-foreground mb-6">
              무료로 시작하고 14일간 모든 기능을 체험하세요.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">무료로 시작하기</Button>
              </Link>
              <Link href="/integrations">
                <Button variant="outline" size="lg">다른 연동 보기</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
