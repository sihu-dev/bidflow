/**
 * 핵심 기능 섹션
 */
import { Search, Sparkles, FileText, Bell } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: '스마트 공고 수집',
    description: '나라장터, TED, SAM.gov 등 주요 플랫폼에서 관련 공고를 실시간으로 자동 수집합니다.',
  },
  {
    icon: Sparkles,
    title: 'AI 매칭 분석',
    description: '귀사 제품과 공고 요구사항을 AI가 분석하여 적합도를 자동으로 평가합니다.',
  },
  {
    icon: FileText,
    title: '제안서 초안 생성',
    description: '공고 분석 결과를 바탕으로 제안서 초안을 AI가 자동으로 작성해 드립니다.',
  },
  {
    icon: Bell,
    title: '마감 알림',
    description: '중요 공고의 마감일을 자동으로 추적하고 이메일/Slack으로 알려드립니다.',
  },
];

export function Features() {
  return (
    <section className="py-20" id="features">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            입찰 업무를 자동화하세요
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            복잡한 입찰 프로세스를 AI가 대신 처리합니다.
            핵심 업무에만 집중하세요.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
