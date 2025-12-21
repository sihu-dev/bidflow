'use client';

/**
 * 핵심 기능 섹션 - 동적 화이트라벨 버전
 */
import { Search, Target, Sparkles, FileText, Bell, Cpu, type LucideIcon } from 'lucide-react';
import { useTenant, useTenantProducts } from '@/contexts/TenantContext';

// 아이콘 매핑
const iconMap: Record<string, LucideIcon> = {
  Search,
  Target,
  Sparkles,
  FileText,
  Bell,
  Cpu,
};

// 범용 Features
const DEFAULT_FEATURES = [
  {
    icon: 'Search',
    title: '공고 자동 수집',
    description: '나라장터, TED, SAM.gov 등 45개 이상의 데이터 소스에서 입찰 공고를 AI가 자동으로 수집합니다.',
  },
  {
    icon: 'Cpu',
    title: 'AI 제품 매칭',
    description: '귀사 제품과 공고 요구사항을 자동 분석하여 적합도 점수를 산출합니다.',
  },
  {
    icon: 'Sparkles',
    title: 'AI 스마트 함수',
    description: '=AI_SCORE(), =AI_MATCH() 등 스프레드시트에서 AI 분석을 수식처럼 바로 실행합니다.',
  },
  {
    icon: 'FileText',
    title: '맞춤 제안서 생성',
    description: '매칭된 제품 정보와 공고 분석 결과를 바탕으로 제안서 초안을 자동 생성합니다.',
  },
];

// CMNTech 전용 Features
const CMNTECH_FEATURES = [
  {
    icon: 'Search',
    title: '유량계 공고 자동 수집',
    description: '나라장터, TED, SAM.gov, 한전에서 유량계/열량계 관련 공고를 AI가 자동으로 찾아 분류합니다.',
  },
  {
    icon: 'Target',
    title: '5가지 제품 자동 매칭',
    description: 'UR-1000PLUS, MF-1000C, UR-1010PLUS, SL-3000PLUS, EnerRay와 공고 요구사항을 자동 매칭합니다.',
  },
  {
    icon: 'Sparkles',
    title: 'AI 스마트 함수',
    description: '=AI_SCORE(), =AI_MATCH() 등 스프레드시트에서 AI 분석을 수식처럼 바로 실행합니다.',
  },
  {
    icon: 'FileText',
    title: '맞춤 제안서 생성',
    description: '매칭된 제품 정보와 공고 분석 결과를 바탕으로 제안서 초안을 자동 생성합니다.',
  },
];

export function Features() {
  const tenant = useTenant();
  const products = useTenantProducts();

  // 테넌트에 제품이 있으면 CMNTech 스타일, 없으면 범용
  const features = products.length > 0 ? CMNTECH_FEATURES : DEFAULT_FEATURES;
  const sectionTitle = products.length > 0
    ? `${tenant.branding.name} 제품 입찰 자동화`
    : '입찰 자동화의 핵심 기능';

  return (
    <section className="py-24 bg-white" id="features">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            복잡한 입찰 프로세스를 AI가 대신 처리합니다.
            핵심 업무에만 집중하세요.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = iconMap[feature.icon] || Search;
            return (
              <div
                key={feature.title}
                className="relative p-6 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-neutral-900 flex items-center justify-center mb-5 transition-colors">
                  <Icon className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
                <div className="absolute top-4 right-4 text-xs font-mono text-neutral-300">
                  0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
