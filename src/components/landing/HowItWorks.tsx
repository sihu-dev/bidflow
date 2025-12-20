/**
 * 작동 방식 섹션
 */
import { Upload, Zap, Trophy } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: '제품 정보 등록',
    description: '귀사의 제품/서비스 정보를 등록하면 AI가 분석하여 매칭 기준을 학습합니다.',
  },
  {
    icon: Zap,
    step: '02',
    title: 'AI 자동 매칭',
    description: '매일 수백 개의 새 공고를 분석하고, 적합한 공고를 자동으로 찾아 알려드립니다.',
  },
  {
    icon: Trophy,
    step: '03',
    title: '입찰 준비 완료',
    description: '분석 결과와 제안서 초안을 활용하여 빠르게 입찰에 참여하세요.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            간단한 3단계로 시작하세요
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            복잡한 설정 없이 바로 사용할 수 있습니다.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border" />
              )}

              {/* Step Number */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-background border-2 border-primary/20 mb-6">
                <item.icon className="w-10 h-10 text-primary" />
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {item.step}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
