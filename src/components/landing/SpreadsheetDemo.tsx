/**
 * 스프레드시트 데모 섹션 - 메인 랜딩용
 * 모노크롬 프리미엄 디자인
 */
import { LayoutGrid, Zap, Filter, BarChart3, Download, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock 데이터 - 입찰 공고
const mockBids = [
  { id: 1, title: '유량계 납품 입찰', org: '한국가스공사', deadline: '2025-01-15', value: '2.5억', score: 92, status: '신규' },
  { id: 2, title: '계측기기 유지보수', org: '서울시 상수도사업본부', deadline: '2025-01-18', value: '1.8억', score: 87, status: '검토중' },
  { id: 3, title: '스마트 미터링 시스템', org: '한국전력공사', deadline: '2025-01-22', value: '4.2억', score: 78, status: '준비중' },
  { id: 4, title: '산업용 센서 공급', org: '포스코', deadline: '2025-01-25', value: '3.1억', score: 95, status: '제출완료' },
];

export function SpreadsheetDemo() {
  return (
    <section className="py-24 bg-neutral-50" id="spreadsheet">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 text-white text-sm font-medium mb-6">
            <LayoutGrid className="w-4 h-4" />
            핵심 기능
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Google Sheets처럼<br />
            <span className="text-neutral-500">직관적인 입찰 관리</span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            수백 개의 입찰 공고를 한눈에. 필터, 정렬, AI 분석까지.
            익숙한 스프레드시트 UI로 효율적으로 관리하세요.
          </p>
        </div>

        {/* Spreadsheet Demo */}
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-neutral-300" />
                  <div className="w-3 h-3 rounded-full bg-neutral-300" />
                  <div className="w-3 h-3 rounded-full bg-neutral-300" />
                </div>
                <span className="text-sm font-medium text-neutral-700">BIDFLOW Spreadsheet</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">
                  <Filter className="w-3.5 h-3.5" />
                  필터
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">
                  <BarChart3 className="w-3.5 h-3.5" />
                  분석
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  내보내기
                </button>
              </div>
            </div>

            {/* Formula Bar */}
            <div className="flex items-center gap-3 px-4 py-2 border-b bg-white">
              <div className="px-2.5 py-1 bg-neutral-100 rounded text-xs font-mono font-medium text-neutral-700">A1</div>
              <div className="h-5 w-px bg-neutral-200" />
              <div className="flex items-center gap-2 flex-1">
                <Zap className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-400 font-mono">=SCORE() - AI 낙찰 확률 분석</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 text-white text-xs font-medium rounded-md">
                <Zap className="w-3.5 h-3.5" />
                Smart 함수
              </div>
            </div>

            {/* Spreadsheet Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-8">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">공고명</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">발주처</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">마감일</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">추정가</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">AI 점수</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBids.map((bid, idx) => (
                    <tr
                      key={bid.id}
                      className={`border-b hover:bg-neutral-50 transition-colors ${idx === 0 ? 'bg-neutral-100/50' : ''}`}
                    >
                      <td className="px-4 py-3.5 text-neutral-400 font-mono text-xs">{bid.id}</td>
                      <td className="px-4 py-3.5 font-medium text-neutral-900">{bid.title}</td>
                      <td className="px-4 py-3.5 text-neutral-600">{bid.org}</td>
                      <td className="px-4 py-3.5 text-neutral-600 font-mono">{bid.deadline}</td>
                      <td className="px-4 py-3.5 text-neutral-900 font-medium font-mono">{bid.value}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-neutral-900 rounded-full"
                              style={{ width: `${bid.score}%` }}
                            />
                          </div>
                          <span className="font-mono font-medium text-neutral-900">{bid.score}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={bid.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-neutral-50">
              <span className="text-xs text-neutral-500">4개 공고 표시 중 | 총 152건</span>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>마지막 동기화: 방금 전</span>
                <span className="w-2 h-2 bg-neutral-900 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {[
            '실시간 필터링',
            '다중 정렬',
            '열 커스터마이징',
            'Excel 내보내기',
            'AI 스마트 함수',
            '자동 저장',
          ].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 font-medium"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4 mt-12">
          <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white" asChild>
            <Link href="/signup">
              무료로 시작하기
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-neutral-300 hover:bg-neutral-50" asChild>
            <Link href="/features/spreadsheet" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              자세히 보기
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// 상태 배지 컴포넌트 - 모노크롬
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    '신규': 'bg-neutral-100 text-neutral-900 border border-neutral-300',
    '검토중': 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    '준비중': 'bg-neutral-200 text-neutral-700',
    '제출완료': 'bg-neutral-900 text-white',
    '낙찰': 'bg-neutral-900 text-white',
    '탈락': 'bg-neutral-100 text-neutral-400',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles[status] || styles['신규']}`}>
      {status}
    </span>
  );
}
