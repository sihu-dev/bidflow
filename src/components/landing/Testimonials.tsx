/**
 * 고객 후기 섹션
 */
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: '입찰 공고 검토 시간이 80% 이상 줄었습니다. 덕분에 더 많은 입찰에 참여할 수 있게 되었어요.',
    author: '김철수',
    title: '대표이사',
    company: '(주)한국계측기',
    rating: 5,
  },
  {
    quote: 'AI 매칭 기능이 정말 정확해요. 우리 제품에 딱 맞는 공고만 추천해주니 시간 낭비가 없습니다.',
    author: '이영희',
    title: '영업팀장',
    company: '정밀기기(주)',
    rating: 5,
  },
  {
    quote: '해외 입찰도 놓치지 않고 확인할 수 있어서 좋습니다. TED, SAM.gov 공고를 한 곳에서 관리해요.',
    author: '박민수',
    title: '해외사업부장',
    company: '글로벌텍',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            고객들의 이야기
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            BIDFLOW를 사용하고 계신 기업들의 생생한 후기
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="p-6 rounded-xl border bg-card"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {testimonial.author[0]}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-sm">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground">
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
