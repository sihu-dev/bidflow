/**
 * 요금제 미리보기 섹션 - 모노크롬
 */
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    price: '무료',
    period: '',
    description: 'CMNTech 입찰 시작하기',
    features: [
      'CMNTech 3개 제품 등록',
      '월 50건 공고 분석',
      '=AI_SUMMARY() 함수만',
      '나라장터 연동',
      '이메일 알림',
    ],
    cta: '무료로 시작',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₩99,000',
    period: '/월',
    description: '본격적인 입찰 자동화',
    features: [
      '무제한 제품 등록',
      '무제한 공고 분석',
      '모든 AI 함수 (5종)',
      'TED, SAM.gov, 한전 포함',
      '제안서 자동 생성',
      'Slack 연동',
    ],
    cta: '14일 무료 체험',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '문의',
    period: '',
    description: '맞춤형 솔루션',
    features: [
      'Pro 모든 기능',
      '전용 AI 모델 학습',
      '제품 카탈로그 연동',
      '무제한 팀원',
      'SLA 보장',
      '온프레미스 옵션',
    ],
    cta: '영업팀 문의',
    highlighted: false,
  },
];

export function PricingPreview() {
  return (
    <section className="py-24 bg-neutral-50" id="pricing">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
            심플한 요금제
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            CMNTech 제품 입찰 규모에 맞는 플랜을 선택하세요.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative p-8 rounded-2xl border bg-white',
                plan.highlighted
                  ? 'border-neutral-900 shadow-xl scale-105'
                  : 'border-neutral-200'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -tranneutral-x-1/2 px-4 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-full">
                  인기
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-neutral-900">{plan.name}</h3>
                <p className="text-sm text-neutral-500 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">{plan.price}</span>
                <span className="text-neutral-500">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-neutral-900 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  'w-full',
                  plan.highlighted
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    : 'border-neutral-300 hover:bg-neutral-50'
                )}
                variant={plan.highlighted ? 'default' : 'outline'}
                asChild
              >
                <Link href={plan.name === 'Enterprise' ? '/contact' : '/signup'}>
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* More Info Link */}
        <div className="text-center mt-12">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            요금제 자세히 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
