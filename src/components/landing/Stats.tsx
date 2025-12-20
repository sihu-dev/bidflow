/**
 * 통계/성과 섹션 - 모노크롬
 */

const stats = [
  { value: '80%', label: '입찰 분석 시간 절감' },
  { value: '3배', label: '입찰 참여율 증가' },
  { value: '500+', label: '월간 처리 공고' },
  { value: '24/7', label: '자동 모니터링' },
];

export function Stats() {
  return (
    <section className="py-20 bg-neutral-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <div key={stat.label} className="text-center relative">
              {idx > 0 && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-neutral-700 hidden md:block" />
              )}
              <div className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="mt-3 text-sm text-neutral-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
