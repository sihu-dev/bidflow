/**
 * BIDFLOW 메인 페이지
 */

'use client';

import dynamic from 'next/dynamic';

// Handsontable은 클라이언트에서만 로드 (SSR 완전 비활성화)
const ClientSpreadsheet = dynamic(
  () => import('@/components/spreadsheet/ClientSpreadsheet'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }
);

// 샘플 데이터 (실제로는 Supabase에서 fetch)
const SAMPLE_BIDS = [
  {
    id: '1',
    source: 'narajangto',
    external_id: '20251219001',
    title: '[긴급] 서울시 상수도사업본부 초음파유량계 구매',
    organization: '서울특별시 상수도사업본부',
    deadline: '2025-01-15T18:00:00',
    estimated_amount: 450000000,
    status: 'reviewing',
    priority: 'high',
    type: 'product',
    keywords: ['초음파유량계', '상수도', '계측기'],
    url: 'https://www.g2b.go.kr/...',
    match_score: 0.92,
    ai_summary: '서울시 상수도사업본부에서 발주한 초음파유량계 구매 입찰입니다. UR-1000PLUS 제품이 요구사양과 95% 일치합니다.',
    created_at: '2024-12-19T10:00:00',
    updated_at: '2024-12-19T10:00:00',
  },
  {
    id: '2',
    source: 'narajangto',
    external_id: '20251219002',
    title: 'K-water 정수장 전자유량계 교체 공사',
    organization: '한국수자원공사',
    deadline: '2025-01-20T17:00:00',
    estimated_amount: 280000000,
    status: 'new',
    priority: 'medium',
    type: 'product',
    keywords: ['전자유량계', '정수장'],
    url: 'https://www.g2b.go.kr/...',
    match_score: 0.78,
    ai_summary: null,
    created_at: '2024-12-19T11:00:00',
    updated_at: '2024-12-19T11:00:00',
  },
  {
    id: '3',
    source: 'ted',
    external_id: 'TED-2025-12345',
    title: 'Water Flow Meters for Municipal Water Supply - Berlin',
    organization: 'Berliner Wasserbetriebe',
    deadline: '2025-02-01T12:00:00',
    estimated_amount: 850000000,
    status: 'preparing',
    priority: 'high',
    type: 'product',
    keywords: ['유량계', 'EU', '상수도'],
    url: 'https://ted.europa.eu/...',
    match_score: 0.85,
    ai_summary: '독일 베를린 수도공사의 유량계 입찰입니다. EU TED 공고이며 국제입찰 자격요건이 필요합니다.',
    created_at: '2024-12-18T09:00:00',
    updated_at: '2024-12-19T08:00:00',
  },
  {
    id: '4',
    source: 'kepco',
    external_id: 'KEPCO-2025-0101',
    title: '한국전력 발전소 열량계 납품',
    organization: '한국전력공사',
    deadline: '2025-01-25T16:00:00',
    estimated_amount: 120000000,
    status: 'new',
    priority: 'low',
    type: 'product',
    keywords: ['열량계', '발전소'],
    url: null,
    match_score: 0.45,
    ai_summary: null,
    created_at: '2024-12-19T14:00:00',
    updated_at: '2024-12-19T14:00:00',
  },
  {
    id: '5',
    source: 'manual',
    external_id: 'MANUAL-001',
    title: '부산시 하수처리장 비만관 유량계 설치',
    organization: '부산광역시 환경공단',
    deadline: '2025-01-10T17:00:00',
    estimated_amount: 95000000,
    status: 'submitted',
    priority: 'medium',
    type: 'product',
    keywords: ['비만관', '하수처리', '유량계'],
    url: null,
    match_score: 0.88,
    ai_summary: '부산 하수처리장 비만관 유량계 설치 건입니다. UR-1010PLUS가 적합합니다.',
    created_at: '2024-12-15T10:00:00',
    updated_at: '2024-12-19T09:00:00',
  },
];

export default function HomePage() {
  return (
    <main className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">BIDFLOW</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
              Beta
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-blue-600">
              입찰 관리
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              파이프라인
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              문서
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              설정
            </a>
          </nav>
        </div>
      </header>

      {/* 스프레드시트 */}
      <div className="flex-1 overflow-hidden">
        <ClientSpreadsheet
          initialData={SAMPLE_BIDS}
          onBidUpdate={async (id, updates) => {
            console.log('Update bid:', id, updates);
            // TODO: Supabase 업데이트
          }}
          onRefresh={async () => {
            console.log('Refresh bids');
            // TODO: Supabase에서 다시 fetch
          }}
        />
      </div>
    </main>
  );
}
