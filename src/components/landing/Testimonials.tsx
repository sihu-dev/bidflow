/**
 * 고객 후기 섹션 - 모노크롬
 */
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: '입찰 공고 검토 시간이 80% 이상 줄었습니다. 덕분에 더 많은 입찰에 참여할 수 있게 되었어요.',
    author: '김철수',
    title: '대표이사',
    company: '(주)한국계측기',
  },
  {
    quote: 'AI 매칭 기능이 정말 정확해요. 우리 제품에 딱 맞는 공고만 추천해주니 시간 낭비가 없습니다.',
    author: '이영희',
    title: '영업팀장',
    company: '정밀기기(주)',
  },
  {
    quote: '해외 입찰도 놓치지 않고 확인할 수 있어서 좋습니다. TED, SAM.gov 공고를 한 곳에서 관리해요.',
    author: '박민수',
    title: '해외사업부장',
    company: '글로벌텍',
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
            BIDFLOW를 사용하고 계신 기업들의 생생한 후기
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
