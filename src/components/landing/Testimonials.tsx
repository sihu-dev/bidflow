/**
 * 고객 후기 섹션 - 모노크롬
 */
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'UR-1000PLUS 관련 공고를 자동으로 찾아주니 입찰 준비 시간이 80% 이상 줄었습니다. 이제 제안서 작성에만 집중할 수 있어요.',
    author: '김영훈',
    title: '영업부장',
    company: '씨엠엔텍',
    product: 'UR-1000PLUS',
  },
  {
    quote: 'TED에서 EnerRay 열량계 관련 EU 공고를 놓치지 않고 확인할 수 있어서 해외 입찰 성공률이 크게 올랐습니다.',
    author: '이수진',
    title: '해외사업팀장',
    company: '씨엠엔텍',
    product: 'EnerRay',
  },
  {
    quote: 'UR-1010PLUS 비만관 유량계에 딱 맞는 하수처리장 공고만 AI가 골라주니 정확도가 정말 높습니다.',
    author: '박준호',
    title: '기술영업',
    company: '씨엠엔텍',
    product: 'UR-1010PLUS',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
            고객들의 이야기
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            CMNTech 제품 입찰에 BIDFLOW를 활용하는 분들의 후기
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50 relative"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-neutral-200 mb-4" />

              {/* Quote */}
              <blockquote className="text-neutral-700 mb-8 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-neutral-900">{testimonial.author}</div>
                    <div className="text-xs text-neutral-500">
                      {testimonial.title} · {testimonial.company}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-neutral-200 rounded text-xs font-mono text-neutral-700">
                  {testimonial.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
