/**
 * 통계/성과 섹션 - CMNTech 제품 매칭 버전
 */

const stats = [
  { value: '92%', label: '평균 제품 매칭 정확도' },
  { value: '5+', label: 'CMNTech 연동 제품' },
  { value: '150+', label: '월간 분석 공고수' },
  { value: '3.2x', label: '입찰 참여율 증가' },
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
