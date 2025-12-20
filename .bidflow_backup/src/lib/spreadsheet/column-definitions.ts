/**
 * BIDFLOW 스프레드시트 열 정의
 */

// Handsontable 열 설정 타입
interface ColumnSettings {
  data?: string;
  title?: string;
  width?: number;
  readOnly?: boolean;
  className?: string;
  type?: string;
  numericFormat?: { pattern: string };
  dateFormat?: string;
  source?: string[];
  renderer?: string;
}

/** 상태 라벨 */
export const STATUS_LABELS: Record<string, string> = {
  new: '신규',
  reviewing: '검토중',
  preparing: '준비중',
  submitted: '제출완료',
  won: '낙찰',
  lost: '유찰',
  cancelled: '취소',
};

/** 상태 색상 */
export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-purple-100 text-purple-800',
  submitted: 'bg-green-100 text-green-800',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

/** 우선순위 색상 */
export const PRIORITY_COLORS: Record<string, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

/** 소스 라벨 */
export const SOURCE_LABELS: Record<string, string> = {
  narajangto: '나라장터',
  ted: 'TED (EU)',
  sam: 'SAM.gov',
  kepco: '한전',
  kwater: 'K-water',
  manual: '수동등록',
  custom: '기타',
};

/** 입찰 테이블 열 정의 */
export const BID_COLUMNS: ColumnSettings[] = [
  {
    data: 'id',
    title: 'No',
    width: 60,
    readOnly: true,
    className: 'htCenter htMiddle text-gray-500',
  },
  {
    data: 'source',
    title: '출처',
    width: 80,
    readOnly: true,
    className: 'htCenter htMiddle',
  },
  {
    data: 'title',
    title: '공고명',
    width: 350,
  },
  {
    data: 'organization',
    title: '발주기관',
    width: 150,
  },
  {
    data: 'estimated_amount',
    title: '추정가격',
    width: 120,
    type: 'numeric',
    numericFormat: {
      pattern: '₩0,0',
    },
    className: 'htRight',
  },
  {
    data: 'deadline',
    title: '마감일',
    width: 110,
    type: 'date',
    dateFormat: 'YYYY-MM-DD',
    className: 'htCenter',
  },
  {
    data: 'status',
    title: '상태',
    width: 90,
    type: 'dropdown',
    source: Object.keys(STATUS_LABELS),
    className: 'htCenter htMiddle',
  },
  {
    data: 'priority',
    title: '우선순위',
    width: 80,
    type: 'dropdown',
    source: ['high', 'medium', 'low'],
    className: 'htCenter htMiddle',
  },
  {
    data: 'match_score',
    title: '매칭',
    width: 80,
    type: 'numeric',
    readOnly: true,
    className: 'htCenter',
  },
  {
    data: 'keywords',
    title: '키워드',
    width: 150,
    readOnly: true,
  },
];

/** 파이프라인 뷰 열 정의 */
export const PIPELINE_COLUMNS: ColumnSettings[] = [
  {
    data: 'title',
    title: '공고명',
    width: 300,
    readOnly: true,
  },
  {
    data: 'organization',
    title: '발주기관',
    width: 150,
    readOnly: true,
  },
  {
    data: 'stage',
    title: '단계',
    width: 100,
    type: 'dropdown',
    source: ['new', 'reviewing', 'preparing', 'submitted', 'won', 'lost'],
  },
  {
    data: 'assigned_to',
    title: '담당자',
    width: 100,
  },
  {
    data: 'due_date',
    title: '마감',
    width: 100,
    type: 'date',
    dateFormat: 'YYYY-MM-DD',
  },
  {
    data: 'match_score',
    title: '매칭점수',
    width: 80,
    type: 'numeric',
    readOnly: true,
  },
  {
    data: 'notes',
    title: '메모',
    width: 200,
  },
];

/** D-Day 계산 */
export function calculateDDay(deadline: Date | string): string {
  const target = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return `D+${Math.abs(diff)}`;
  if (diff === 0) return 'D-Day';
  return `D-${diff}`;
}

/** 금액 포맷팅 */
export function formatAmount(amount: number | null): string {
  if (amount === null || amount === undefined) return '-';

  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만`;
  }
  return amount.toLocaleString();
}
