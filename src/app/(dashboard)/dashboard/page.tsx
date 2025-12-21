/**
 * BIDFLOW 대시보드 - Supabase 100% 벤치마킹
 * 미니멀 전문 디자인, 인공적 요소 최소화
 */

'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Handsontable 동적 로드
const ClientSpreadsheet = dynamic(
  () => import('@/components/spreadsheet/ClientSpreadsheet'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">로딩 중</p>
        </div>
      </div>
    )
  }
);

// 샘플 데이터
const SAMPLE_BIDS = [
  {
    id: '1',
    source: 'narajangto',
    external_id: '20251219001',
    title: '서울시 상수도사업본부 초음파유량계 구매',
    organization: '서울특별시 상수도사업본부',
    deadline: '2025-01-02T18:00:00',
    estimated_amount: 450000000,
    status: 'reviewing',
    priority: 'high',
    type: 'product',
    keywords: ['초음파유량계', '상수도', '계측기'],
    url: 'https://www.g2b.go.kr/',
    match_score: 0.92,
    matched_product: 'UR-1000PLUS',
    ai_summary: '서울시 상수도사업본부 초음파유량계 구매. UR-1000PLUS 제품 95% 일치. DN100-400 규격.',
    created_at: '2024-12-19T10:00:00',
    updated_at: '2024-12-20T10:00:00',
  },
  {
    id: '2',
    source: 'narajangto',
    external_id: '20251219002',
    title: 'K-water 정수장 전자유량계 교체 공사',
    organization: '한국수자원공사',
    deadline: '2025-01-08T17:00:00',
    estimated_amount: 280000000,
    status: 'new',
    priority: 'high',
    type: 'product',
    keywords: ['전자유량계', '정수장'],
    url: 'https://www.g2b.go.kr/',
    match_score: 0.78,
    matched_product: 'MF-1000C',
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
    url: 'https://ted.europa.eu/',
    match_score: 0.85,
    matched_product: 'UR-1000PLUS',
    ai_summary: '베를린 수도공사 유량계 입찰. EU TED 공고. CPV 38421110.',
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
    matched_product: 'EnerRay',
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
    deadline: '2024-12-25T17:00:00',
    estimated_amount: 95000000,
    status: 'submitted',
    priority: 'medium',
    type: 'product',
    keywords: ['비만관', '하수처리'],
    url: null,
    match_score: 0.88,
    matched_product: 'UR-1010PLUS',
    ai_summary: '부산 하수처리장 비만관 유량계 설치. UR-1010PLUS 적합.',
    created_at: '2024-12-15T10:00:00',
    updated_at: '2024-12-19T09:00:00',
  },
  {
    id: '6',
    source: 'narajangto',
    external_id: '20251220001',
    title: '인천시 상수도 유량 모니터링 시스템 구축',
    organization: '인천광역시 상수도사업본부',
    deadline: '2025-01-15T17:00:00',
    estimated_amount: 320000000,
    status: 'new',
    priority: 'medium',
    type: 'product',
    keywords: ['유량모니터링', 'IoT'],
    url: 'https://www.g2b.go.kr/',
    match_score: 0.72,
    matched_product: 'UR-1000PLUS',
    ai_summary: null,
    created_at: '2024-12-20T09:00:00',
    updated_at: '2024-12-20T09:00:00',
  },
  {
    id: '7',
    source: 'narajangto',
    external_id: '20251220002',
    title: '대전시 하천 수위 및 유량 관측 장비',
    organization: '대전광역시청',
    deadline: '2025-01-20T17:00:00',
    estimated_amount: 180000000,
    status: 'reviewing',
    priority: 'medium',
    type: 'product',
    keywords: ['하천', '개수로'],
    url: 'https://www.g2b.go.kr/',
    match_score: 0.81,
    matched_product: 'SL-3000PLUS',
    ai_summary: '대전시 하천 수위/유량 관측. SL-3000PLUS 개수로 유량계 적합.',
    created_at: '2024-12-20T10:00:00',
    updated_at: '2024-12-20T10:00:00',
  },
  {
    id: '8',
    source: 'ted',
    external_id: 'TED-2025-67890',
    title: 'Ultrasonic Flow Measurement Equipment - Amsterdam',
    organization: 'Waternet Amsterdam',
    deadline: '2025-02-15T12:00:00',
    estimated_amount: 620000000,
    status: 'new',
    priority: 'medium',
    type: 'product',
    keywords: ['초음파', 'EU'],
    url: 'https://ted.europa.eu/',
    match_score: 0.79,
    matched_product: 'UR-1000PLUS',
    ai_summary: null,
    created_at: '2024-12-20T08:00:00',
    updated_at: '2024-12-20T08:00:00',
  },
  {
    id: '9',
    source: 'narajangto',
    external_id: '20251218001',
    title: '광주시 정수장 계장설비 교체',
    organization: '광주광역시 상수도사업본부',
    deadline: '2025-01-05T17:00:00',
    estimated_amount: 210000000,
    status: 'preparing',
    priority: 'high',
    type: 'product',
    keywords: ['정수장', '계장설비'],
    url: 'https://www.g2b.go.kr/',
    match_score: 0.86,
    matched_product: 'MF-1000C',
    ai_summary: '광주시 정수장 계장설비 교체. MF-1000C 전자유량계 적합.',
    created_at: '2024-12-18T14:00:00',
    updated_at: '2024-12-19T16:00:00',
  },
  {
    id: '10',
    source: 'manual',
    external_id: 'MANUAL-002',
    title: '울산 석유화학단지 유량측정 시스템',
    organization: 'SK에너지',
    deadline: '2025-01-30T17:00:00',
    estimated_amount: 540000000,
    status: 'won',
    priority: 'high',
    type: 'product',
    keywords: ['석유화학', '산업용'],
    url: null,
    match_score: 0.91,
    matched_product: 'UR-1000PLUS',
    ai_summary: '울산 석유화학단지 유량측정 시스템 낙찰. 5.4억원. UR-1000PLUS 20대.',
    created_at: '2024-12-01T10:00:00',
    updated_at: '2024-12-18T15:00:00',
  },
  {
    id: '11',
    source: 'narajangto',
    external_id: '20251215001',
    title: '세종시 스마트시티 용수 관리 시스템',
    organization: '세종특별자치시청',
    deadline: '2024-12-28T17:00:00',
    estimated_amount: 380000000,
    status: 'lost',
    priority: 'medium',
    type: 'product',
    keywords: ['스마트시티', 'IoT'],
    url: 'https://www.g2b.go.kr/',
    match_score: 0.67,
    matched_product: null,
    ai_summary: '세종시 스마트시티 용수 관리 시스템 유찰.',
    created_at: '2024-12-15T11:00:00',
    updated_at: '2024-12-20T09:00:00',
  },
  {
    id: '12',
    source: 'kepco',
    external_id: 'KEPCO-2025-0102',
    title: '한전 영광원자력발전소 냉각수 유량계',
    organization: '한국수력원자력',
    deadline: '2025-02-10T16:00:00',
    estimated_amount: 890000000,
    status: 'new',
    priority: 'high',
    type: 'product',
    keywords: ['원자력', '냉각수'],
    url: null,
    match_score: 0.58,
    matched_product: null,
    ai_summary: null,
    created_at: '2024-12-20T11:00:00',
    updated_at: '2024-12-20T11:00:00',
  },
];

// 통계 계산
function calculateStats(bids: typeof SAMPLE_BIDS) {
  const now = new Date();
  return {
    total: bids.length,
    new: bids.filter(b => b.status === 'new').length,
    reviewing: bids.filter(b => b.status === 'reviewing').length,
    preparing: bids.filter(b => b.status === 'preparing').length,
    submitted: bids.filter(b => b.status === 'submitted').length,
    won: bids.filter(b => b.status === 'won').length,
    lost: bids.filter(b => b.status === 'lost').length,
    urgent: bids.filter(b => {
      const deadline = new Date(b.deadline);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft > 0 && !['won', 'lost', 'cancelled'].includes(b.status);
    }).length,
    highMatch: bids.filter(b => (b.match_score ?? 0) >= 0.8).length,
    totalAmount: bids.reduce((sum, b) => sum + (b.estimated_amount || 0), 0),
  };
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const isDemo = searchParams?.get('demo') === 'true';
  const [showBanner, setShowBanner] = useState(true);

  const stats = calculateStats(SAMPLE_BIDS);

  return (
    <main className="h-screen flex flex-col bg-slate-50">
      {/* 데모 모드 배너 - 미니멀 */}
      {isDemo && showBanner && (
        <div className="bg-slate-900 text-slate-300 px-6 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>Demo Mode</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{SAMPLE_BIDS.length} records</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="text-white font-medium hover:underline">
              Get Started
            </Link>
            <button onClick={() => setShowBanner(false)} className="text-slate-500 hover:text-white">
              ×
            </button>
          </div>
        </div>
      )}

      {/* 헤더 - 반응형 */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="text-base font-semibold text-slate-900 hidden sm:inline">BIDFLOW</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm font-medium text-slate-900 bg-slate-100 rounded">
              Bids
            </Link>
            <a href="#" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100">
              Pipeline
            </a>
            <a href="#" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100">
              Analytics
            </a>
            <Link href="/docs" className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100">
              Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {isDemo ? (
            <Link
              href="/signup"
              className="px-3 md:px-4 py-1.5 text-sm font-medium text-white bg-slate-900 rounded hover:bg-slate-800"
            >
              Sign up
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600">U</span>
            </div>
          )}
        </div>
      </header>

      {/* 통계 바 - 반응형 */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 overflow-x-auto">
        <div className="flex items-center gap-4 md:gap-6 min-w-max md:min-w-0">
          {/* 메트릭 그리드 - 모바일에서 핵심만 */}
          <div className="flex items-center gap-3 md:gap-6">
            <Metric label="Total" value={stats.total} />
            <div className="w-px h-8 bg-slate-200" />
            <Metric label="New" value={stats.new} highlight={stats.new > 0} />
            <Metric label="Review" value={stats.reviewing} className="hidden sm:flex" />
            <Metric label="Prepare" value={stats.preparing} className="hidden sm:flex" />
            <div className="w-px h-8 bg-slate-200 hidden md:block" />
            <Metric label="Urgent" value={stats.urgent} warning={stats.urgent > 0} />
            <Metric label="High Match" value={stats.highMatch} success className="hidden lg:flex" />
            <div className="w-px h-8 bg-slate-200 hidden lg:block" />
            <Metric label="Won" value={stats.won} success className="hidden md:flex" />
            <Metric label="Lost" value={stats.lost} className="hidden md:flex" />
          </div>

          {/* 총 추정가 */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-500 hidden sm:inline">Est. Total</span>
            <span className="text-base md:text-lg font-mono font-semibold text-slate-900">
              ₩{(stats.totalAmount / 100000000).toFixed(1)}B
            </span>
          </div>
        </div>
      </div>

      {/* 스프레드시트 */}
      <div className="flex-1 overflow-hidden">
        <ClientSpreadsheet
          initialData={SAMPLE_BIDS}
          onBidUpdate={async (_id, _updates) => {
            // TODO: Implement bid update API call
          }}
          onRefresh={async () => {
            // TODO: Implement refresh API call
          }}
        />
      </div>
    </main>
  );
}

// 미니멀 메트릭 컴포넌트
function Metric({
  label,
  value,
  highlight,
  warning,
  success,
  className
}: {
  label: string;
  value: number;
  highlight?: boolean;
  warning?: boolean;
  success?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={cn(
        'text-lg md:text-xl font-semibold font-mono',
        warning ? 'text-neutral-700' :
        success ? 'text-neutral-800' :
        highlight ? 'text-neutral-700' :
        'text-slate-900'
      )}>
        {value}
      </span>
    </div>
  );
}
