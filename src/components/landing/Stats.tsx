/**
 * 통계/성과 섹션
 */

const stats = [
  { value: '80%', label: '입찰 분석 시간 절감' },
  { value: '3배', label: '입찰 참여율 증가' },
  { value: '500+', label: '월간 처리 공고' },
  { value: '24/7', label: '자동 모니터링' },
];

export function Stats() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
