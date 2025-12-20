/**
 * 스프레드시트 뷰 기능 상세 페이지
 */
import { generateMetadata, pageMetadata } from '@/lib/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/marketing';
import Link from 'next/link';
import { LayoutGrid, Filter, SortAsc, Eye, Columns, Check } from 'lucide-react';

export const metadata = generateMetadata(pageMetadata.features.spreadsheet);

const features = [
  {
    icon: Filter,
    title: '고급 필터링',
    description: '여러 조건을 조합하여 원하는 공고만 표시합니다.',
  },
  {
    icon: SortAsc,
    title: '다중 정렬',
    description: '여러 열을 기준으로 동시에 정렬할 수 있습니다.',
  },
  {
    icon: Columns,
    title: '열 커스터마이징',
    description: '표시할 열을 선택하고 순서를 변경합니다.',
  },
  {
    icon: Eye,
    title: '뷰 저장',
    description: '자주 사용하는 필터/정렬 설정을 저장합니다.',
  },
];

const cellFeatures = [
  { label: '인라인 편집', description: '셀을 클릭하여 바로 수정' },
  { label: '자동 저장', description: '변경사항 실시간 저장' },
  { label: '셀 서식', description: '금액, 날짜 자동 포맷' },
  { label: '조건부 서식', description: '조건에 따른 색상 표시' },
  { label: '복사/붙여넣기', description: 'Excel 호환 클립보드' },
  { label: '키보드 단축키', description: '효율적인 탐색' },
];

const dataManagement = [
  '수백 개의 공고를 한눈에 관리',
  'Google Sheets처럼 직관적인 UI',
  '드래그 앤 드롭으로 열 이동',
  '고정 열(Freeze) 지원',
  '가상화로 대용량 데이터 처리',
  '실시간 협업 편집',
];

export default function SpreadsheetPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="w-8 h-8 text-primary" />
              </div>
              <Badge variant="secondary">UI 기능</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              스프레드시트<br />뷰
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Google Sheets 스타일의 직관적인 UI로 수백 개의 공고를 한눈에 관리하세요.
              익숙한 인터페이스로 효율적인 입찰 관리가 가능합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">모든 기능 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-[16/9] rounded-xl bg-white border border-neutral-200 shadow-xl flex items-center justify-center overflow-hidden">
              <div className="w-full h-full p-4">
                {/* Mock Spreadsheet */}
                <div className="bg-white rounded-lg border border-neutral-200 h-full overflow-hidden">
                  <div className="flex items-center gap-2 p-2 border-b bg-neutral-50">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-neutral-300" />
                      <div className="w-3 h-3 rounded-full bg-neutral-300" />
                      <div className="w-3 h-3 rounded-full bg-neutral-300" />
                    </div>
                    <span className="text-xs text-neutral-500">BIDFLOW Spreadsheet</span>
                  </div>
                  <div className="grid grid-cols-6 text-xs">
                    <div className="p-2 border-b border-r font-medium bg-neutral-50 text-neutral-600">공고명</div>
                    <div className="p-2 border-b border-r font-medium bg-neutral-50 text-neutral-600">발주처</div>
                    <div className="p-2 border-b border-r font-medium bg-neutral-50 text-neutral-600">마감일</div>
                    <div className="p-2 border-b border-r font-medium bg-neutral-50 text-neutral-600">추정가</div>
                    <div className="p-2 border-b border-r font-medium bg-neutral-50 text-neutral-600">매칭점수</div>
                    <div className="p-2 border-b font-medium bg-neutral-50 text-neutral-600">상태</div>
                    {[1, 2, 3, 4].map((row) => (
                      <div key={`row-${row}`} className="contents">
                        <div className="p-2 border-b border-r truncate text-neutral-900">입찰 공고 #{row}</div>
                        <div className="p-2 border-b border-r text-neutral-600">발주처 {row}</div>
                        <div className="p-2 border-b border-r text-neutral-600 font-mono">2025-01-{10 + row}</div>
                        <div className="p-2 border-b border-r text-neutral-900 font-medium">{row}.5억원</div>
                        <div className="p-2 border-b border-r text-neutral-900 font-mono font-medium">{85 + row}%</div>
                        <div className="p-2 border-b">
                          <span className="px-1.5 py-0.5 bg-neutral-900 text-white rounded text-xs">진행중</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border bg-card text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cell Features */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">셀 기능</h2>
                <div className="grid gap-3">
                  {cellFeatures.map((feature) => (
                    <div key={feature.label} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-neutral-200">
                      <Check className="w-5 h-5 text-neutral-900 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-neutral-900">{feature.label}</span>
                        <span className="text-neutral-500"> - {feature.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">데이터 관리</h2>
                <ul className="space-y-3">
                  {dataManagement.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-neutral-900 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PageNavigation
        prev={{ label: '스마트 알림', href: '/features/alerts' }}
        next={{ label: '팀 협업', href: '/features/collaboration' }}
      />
    </>
  );
}
