/**
 * 랜딩 페이지용 목업 입찰 데이터
 * CMNTech 5개 제품과 매칭된 6개 샘플 공고
 * Enhanced Matcher로 실시간 점수 계산
 */

import { matchBidToProducts, type BidAnnouncement } from '../matching/enhanced-matcher';

export interface MockBid {
  id: number;
  source: 'narajangto' | 'ted' | 'kwater' | 'kepco';
  sourceLabel: string;
  title: string;
  organization: string;
  estimatedAmount: number;
  deadline: string;
  status: 'new' | 'reviewing' | 'preparing' | 'submitted';
  statusLabel: string;
  priority: 'high' | 'medium' | 'low';
  matchScore: number;
  matchedProduct: string | null;
  keywords: string[];
  aiSummary: string | null;
  dday: string;
  ddayNum: number;
  isUrgent: boolean;
}

/**
 * D-Day 계산 헬퍼
 */
function calculateDday(deadline: string): { dday: string; ddayNum: number; isUrgent: boolean } {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    dday: diff > 0 ? `D-${diff}` : diff === 0 ? 'D-Day' : `D+${Math.abs(diff)}`,
    ddayNum: diff,
    isUrgent: diff <= 7 && diff >= 0,
  };
}

/**
 * 상태 라벨 매핑
 */
const STATUS_LABELS: Record<string, string> = {
  new: '신규',
  reviewing: '검토중',
  preparing: '준비중',
  submitted: '제출완료',
};

/**
 * 출처 라벨 매핑
 */
const SOURCE_LABELS: Record<string, string> = {
  narajangto: '나라장터',
  ted: 'TED(EU)',
  kwater: 'K-water',
  kepco: '한전',
};

/**
 * 원본 입찰 데이터 (매칭 전)
 */
const RAW_BIDS = [
  {
    id: 1,
    source: 'narajangto' as const,
    sourceLabel: SOURCE_LABELS.narajangto,
    title: '[긴급] 서울시 상수도본부 초음파유량계 설치 및 유지관리 (DN300-1000, 25대)',
    organization: '서울시 상수도사업본부',
    estimatedAmount: 450000000,
    deadline: '2025-01-28',
    status: 'reviewing' as const,
    statusLabel: STATUS_LABELS.reviewing,
    priority: 'high' as const,
    description: '정수장 및 배수지 대구경 초음파유량계 설치 공사. DN300~1000 규격 25대 납품 및 설치.',
  },
  {
    id: 2,
    source: 'kwater' as const,
    sourceLabel: SOURCE_LABELS.kwater,
    title: 'K-water 정수장 전자유량계 교체 공사 (DN50-150, 일체형)',
    organization: 'K-water 한국수자원공사',
    estimatedAmount: 280000000,
    deadline: '2025-02-02',
    status: 'new' as const,
    statusLabel: STATUS_LABELS.new,
    priority: 'medium' as const,
    description: '공업용수 공급 시설 일체형 전자식 유량계 교체. DN50~150 소구경 플랜지형.',
  },
  {
    id: 3,
    source: 'ted' as const,
    sourceLabel: SOURCE_LABELS.ted,
    title: 'Ultrasonic Water Flow Meters Supply - Berlin Water Authority (DN500-2000)',
    organization: 'Berliner Wasserbetriebe',
    estimatedAmount: 850000000,
    deadline: '2025-02-15',
    status: 'preparing' as const,
    statusLabel: STATUS_LABELS.preparing,
    priority: 'high' as const,
    description: 'Supply and installation of ultrasonic flow meters for water treatment facilities.',
  },
  {
    id: 4,
    source: 'kepco' as const,
    sourceLabel: SOURCE_LABELS.kepco,
    title: '한국전력 발전소 초음파 열량계 납품 (지역난방 연계)',
    organization: '한국전력공사',
    estimatedAmount: 120000000,
    deadline: '2025-02-08',
    status: 'new' as const,
    statusLabel: STATUS_LABELS.new,
    priority: 'low' as const,
    description: '발전소 지역난방 열공급 계량을 위한 초음파 열량계 100대 납품.',
  },
  {
    id: 5,
    source: 'narajangto' as const,
    sourceLabel: SOURCE_LABELS.narajangto,
    title: '부산시 하수처리장 비만관형 유량계 설치 (DN1000, 비접촉식)',
    organization: '부산환경공단',
    estimatedAmount: 95000000,
    deadline: '2025-01-24',
    status: 'submitted' as const,
    statusLabel: STATUS_LABELS.submitted,
    priority: 'high' as const,
    description: '하수처리장 우수관거 비만관형 비접촉 유량계 DN1000 5대 설치.',
  },
  {
    id: 6,
    source: 'narajangto' as const,
    sourceLabel: SOURCE_LABELS.narajangto,
    title: '농어촌공사 농업용수로 개수로 유량측정 시스템 설치',
    organization: '한국농어촌공사',
    estimatedAmount: 180000000,
    deadline: '2025-02-20',
    status: 'new' as const,
    statusLabel: STATUS_LABELS.new,
    priority: 'medium' as const,
    description: '농업용 관개수로 개수로 레벨센서 유량계 10개소 설치.',
  },
];

/**
 * Enhanced Matcher로 실시간 매칭 수행
 */
function createMockBidsWithMatching(): MockBid[] {
  return RAW_BIDS.map((raw) => {
    // BidAnnouncement 형식으로 변환
    const bidAnnouncement: BidAnnouncement = {
      id: raw.id.toString(),
      title: raw.title,
      organization: raw.organization,
      description: raw.description,
      estimatedPrice: raw.estimatedAmount,
    };

    // Enhanced Matcher 실행
    const matchResult = matchBidToProducts(bidAnnouncement);
    const bestMatch = matchResult.bestMatch;

    // 키워드 추출 (매칭된 제품의 키워드)
    let keywords: string[] = [];
    if (bestMatch) {
      keywords = [
        ...bestMatch.reasons
          .join(' ')
          .match(/[\w가-힣]+/g)
          ?.slice(0, 3) || [],
      ].filter((k) => k.length > 1);
    }

    // AI 요약 생성
    let aiSummary: string | null = null;
    if (bestMatch && bestMatch.confidence === 'high') {
      aiSummary = `${bestMatch.productName} ${bestMatch.score}점. ${bestMatch.reasons[0] || '매칭됨'}.`;
    }

    return {
      ...raw,
      matchScore: bestMatch ? bestMatch.score : 0,
      matchedProduct: bestMatch ? bestMatch.productId : null,
      keywords,
      aiSummary,
      ...calculateDday(raw.deadline),
    };
  });
}

/**
 * 6개 목업 입찰 데이터 (실시간 매칭 적용)
 */
export const MOCK_BIDS: MockBid[] = createMockBidsWithMatching();

/**
 * 금액 포맷팅 (억/만원 단위)
 */
export function formatAmount(amount: number): string {
  if (amount >= 100000000) {
    const billions = amount / 100000000;
    return `${billions.toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString()}만`;
  }
  return amount.toLocaleString();
}

/**
 * 목업 통계 데이터
 */
export const MOCK_STATS = {
  total: MOCK_BIDS.length,
  new: MOCK_BIDS.filter((b) => b.status === 'new').length,
  reviewing: MOCK_BIDS.filter((b) => b.status === 'reviewing').length,
  urgent: MOCK_BIDS.filter((b) => b.isUrgent).length,
  highMatch: MOCK_BIDS.filter((b) => b.matchScore >= 80).length,
  totalAmount: MOCK_BIDS.reduce((sum, b) => sum + b.estimatedAmount, 0),
};
