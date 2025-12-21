/**
 * 라벨링 시트 템플릿
 * 제품 매칭 Ground Truth 데이터 수집용
 */

/**
 * 라벨링 항목 인터페이스
 */
export interface LabelingEntry {
  /** 고유 ID */
  id: string;

  // ===== 원본 데이터 =====
  /** 공고 제목 */
  bidTitle: string;
  /** 발주 기관 */
  organization: string;
  /** 추정 가격 (원) */
  estimatedPrice: number | null;
  /** 마감일 */
  deadline: string;
  /** 공고 출처 */
  source: 'naramarket' | 'kwater' | 'kepco' | 'ted' | 'other';
  /** 원문 URL */
  sourceUrl: string;

  // ===== 추출 특징 =====
  /** 추출된 키워드 */
  extractedKeywords: string[];
  /** DN 규격 */
  extractedDn: number | null;
  /** DN 범위 */
  extractedDnRange: { min: number; max: number } | null;
  /** 정규화된 기관명 */
  normalizedOrg: string;

  // ===== Ground Truth (라벨) =====
  /** 실제 매칭 제품 (NONE = 매칭 없음) */
  actualProduct: 'UR-1000PLUS' | 'MF-1000C' | 'UR-1010PLUS' | 'SL-3000PLUS' | 'EnerRay' | 'NONE';
  /** 매칭 이유 */
  matchReason: string;
  /** 매칭 신뢰도 */
  labelConfidence: 'high' | 'medium' | 'low';

  // ===== 메타데이터 =====
  /** 라벨링 담당자 */
  labeledBy: string;
  /** 라벨링 날짜 */
  labeledAt: string;
  /** 검토 여부 */
  reviewed: boolean;
  /** 검토자 */
  reviewedBy?: string;
  /** 비고 */
  notes?: string;
}

/**
 * CSV 헤더 (Excel/Google Sheets용)
 */
export const CSV_HEADERS = [
  'id',
  'bidTitle',
  'organization',
  'estimatedPrice',
  'deadline',
  'source',
  'sourceUrl',
  'extractedKeywords',
  'extractedDn',
  'extractedDnMin',
  'extractedDnMax',
  'normalizedOrg',
  'actualProduct',
  'matchReason',
  'labelConfidence',
  'labeledBy',
  'labeledAt',
  'reviewed',
  'reviewedBy',
  'notes',
] as const;

/**
 * 제품 선택지
 */
export const PRODUCT_OPTIONS = [
  { value: 'UR-1000PLUS', label: 'UR-1000PLUS (다회선 초음파 유량계)' },
  { value: 'MF-1000C', label: 'MF-1000C (일체형 전자 유량계)' },
  { value: 'UR-1010PLUS', label: 'UR-1010PLUS (비만관형 유량계)' },
  { value: 'SL-3000PLUS', label: 'SL-3000PLUS (개수로 유량계)' },
  { value: 'EnerRay', label: 'EnerRay (초음파 열량계)' },
  { value: 'NONE', label: 'NONE (매칭 제품 없음)' },
] as const;

/**
 * 매칭 이유 템플릿
 */
export const MATCH_REASON_TEMPLATES = {
  'UR-1000PLUS': [
    '초음파유량계 + 상수도 + DN 적합',
    '다회선 명시 + 정수장/취수장',
    '상수도본부 발주 + 초음파 키워드',
  ],
  'MF-1000C': [
    '전자유량계 + 공업용수/상거래',
    '일체형 명시 + 소구경',
    '플랜지형 + 전자식 키워드',
  ],
  'UR-1010PLUS': [
    '비만관 명시 / 하수처리',
    '우수관거 + 유량계',
    '환경공단 발주 + 비접촉',
  ],
  'SL-3000PLUS': [
    '개수로 명시 / 하천/수로',
    '농어촌공사 발주 + 레벨센서',
    '관개용수 + 유량측정',
  ],
  'EnerRay': [
    '열량계 명시 + 에너지',
    '지역난방 + 계량기',
    '열공급 + 초음파 열량',
  ],
  'NONE': [
    '경쟁사 제품 지정',
    '수량/가격 불적합',
    '관련 없는 품목 (펌프, 밸브 등)',
    '규격 범위 초과/미달',
  ],
} as const;

/**
 * 샘플 라벨링 데이터 (학습 예시)
 */
export const SAMPLE_LABELING_DATA: LabelingEntry[] = [
  {
    id: 'LABEL-001',
    bidTitle: '서울시 상수도사업본부 초음파유량계 구매',
    organization: '서울특별시 상수도사업본부',
    estimatedPrice: 450000000,
    deadline: '2025-01-15',
    source: 'naramarket',
    sourceUrl: 'https://g2b.go.kr/bid/123456',
    extractedKeywords: ['초음파유량계', '상수도', '계측기'],
    extractedDn: 500,
    extractedDnRange: { min: 300, max: 800 },
    normalizedOrg: '서울시 상수도사업본부',
    actualProduct: 'UR-1000PLUS',
    matchReason: '초음파유량계 + 상수도 + DN 적합',
    labelConfidence: 'high',
    labeledBy: 'expert_1',
    labeledAt: '2025-12-21',
    reviewed: true,
    reviewedBy: 'senior_expert',
    notes: '핵심 타겟 공고',
  },
  {
    id: 'LABEL-002',
    bidTitle: '부산환경공단 하수처리장 비만관유량계 설치',
    organization: '부산광역시 환경공단',
    estimatedPrice: 95000000,
    deadline: '2025-01-03',
    source: 'naramarket',
    sourceUrl: 'https://g2b.go.kr/bid/123457',
    extractedKeywords: ['비만관', '유량계', '하수처리'],
    extractedDn: 1000,
    extractedDnRange: null,
    normalizedOrg: '부산환경공단',
    actualProduct: 'UR-1010PLUS',
    matchReason: '비만관 명시 / 하수처리',
    labelConfidence: 'high',
    labeledBy: 'expert_1',
    labeledAt: '2025-12-21',
    reviewed: true,
    reviewedBy: 'senior_expert',
  },
  {
    id: 'LABEL-003',
    bidTitle: '한국농어촌공사 농업용 개수로 유량측정 시스템',
    organization: '한국농어촌공사',
    estimatedPrice: 180000000,
    deadline: '2025-02-15',
    source: 'naramarket',
    sourceUrl: 'https://g2b.go.kr/bid/123458',
    extractedKeywords: ['개수로', '유량측정', '농업용수'],
    extractedDn: null,
    extractedDnRange: null,
    normalizedOrg: '한국농어촌공사',
    actualProduct: 'SL-3000PLUS',
    matchReason: '개수로 명시 / 농어촌공사 발주',
    labelConfidence: 'high',
    labeledBy: 'expert_2',
    labeledAt: '2025-12-21',
    reviewed: false,
  },
  {
    id: 'LABEL-004',
    bidTitle: '수도권 정수장 펌프 및 밸브 교체 공사',
    organization: '한국수자원공사',
    estimatedPrice: 320000000,
    deadline: '2025-01-20',
    source: 'kwater',
    sourceUrl: 'https://kwater.or.kr/bid/789',
    extractedKeywords: ['펌프', '밸브', '정수장'],
    extractedDn: 300,
    extractedDnRange: null,
    normalizedOrg: '한국수자원공사',
    actualProduct: 'NONE',
    matchReason: '관련 없는 품목 (펌프, 밸브 등)',
    labelConfidence: 'high',
    labeledBy: 'expert_1',
    labeledAt: '2025-12-21',
    reviewed: true,
    reviewedBy: 'senior_expert',
    notes: 'False positive 방지 예시',
  },
  {
    id: 'LABEL-005',
    bidTitle: '한국지역난방공사 열량계 납품',
    organization: '한국지역난방공사',
    estimatedPrice: 120000000,
    deadline: '2025-02-01',
    source: 'naramarket',
    sourceUrl: 'https://g2b.go.kr/bid/123459',
    extractedKeywords: ['열량계', '난방', '에너지'],
    extractedDn: null,
    extractedDnRange: null,
    normalizedOrg: '한국지역난방공사',
    actualProduct: 'EnerRay',
    matchReason: '열량계 명시 + 지역난방',
    labelConfidence: 'high',
    labeledBy: 'expert_2',
    labeledAt: '2025-12-21',
    reviewed: false,
  },
  {
    id: 'LABEL-006',
    bidTitle: 'OO시 상수도 수도미터 교체 (타사 지정)',
    organization: 'OO광역시 상수도사업본부',
    estimatedPrice: 85000000,
    deadline: '2025-01-25',
    source: 'naramarket',
    sourceUrl: 'https://g2b.go.kr/bid/123460',
    extractedKeywords: ['수도미터', '상수도', '교체'],
    extractedDn: 50,
    extractedDnRange: null,
    normalizedOrg: '지방자치단체',
    actualProduct: 'NONE',
    matchReason: '경쟁사 제품 지정',
    labelConfidence: 'medium',
    labeledBy: 'expert_1',
    labeledAt: '2025-12-21',
    reviewed: false,
    notes: '제조사 지정 공고 - 참여 불가',
  },
];

/**
 * LabelingEntry를 CSV 행으로 변환
 */
export function labelingEntryToCsvRow(entry: LabelingEntry): string[] {
  return [
    entry.id,
    entry.bidTitle,
    entry.organization,
    entry.estimatedPrice?.toString() ?? '',
    entry.deadline,
    entry.source,
    entry.sourceUrl,
    entry.extractedKeywords.join(';'),
    entry.extractedDn?.toString() ?? '',
    entry.extractedDnRange?.min.toString() ?? '',
    entry.extractedDnRange?.max.toString() ?? '',
    entry.normalizedOrg,
    entry.actualProduct,
    entry.matchReason,
    entry.labelConfidence,
    entry.labeledBy,
    entry.labeledAt,
    entry.reviewed.toString(),
    entry.reviewedBy ?? '',
    entry.notes ?? '',
  ];
}

/**
 * CSV 행을 LabelingEntry로 파싱
 */
export function csvRowToLabelingEntry(row: string[]): LabelingEntry {
  const [
    id,
    bidTitle,
    organization,
    estimatedPrice,
    deadline,
    source,
    sourceUrl,
    extractedKeywords,
    extractedDn,
    extractedDnMin,
    extractedDnMax,
    normalizedOrg,
    actualProduct,
    matchReason,
    labelConfidence,
    labeledBy,
    labeledAt,
    reviewed,
    reviewedBy,
    notes,
  ] = row;

  return {
    id,
    bidTitle,
    organization,
    estimatedPrice: estimatedPrice ? parseInt(estimatedPrice, 10) : null,
    deadline,
    source: source as LabelingEntry['source'],
    sourceUrl,
    extractedKeywords: extractedKeywords ? extractedKeywords.split(';') : [],
    extractedDn: extractedDn ? parseInt(extractedDn, 10) : null,
    extractedDnRange:
      extractedDnMin && extractedDnMax
        ? { min: parseInt(extractedDnMin, 10), max: parseInt(extractedDnMax, 10) }
        : null,
    normalizedOrg,
    actualProduct: actualProduct as LabelingEntry['actualProduct'],
    matchReason,
    labelConfidence: labelConfidence as LabelingEntry['labelConfidence'],
    labeledBy,
    labeledAt,
    reviewed: reviewed === 'true',
    reviewedBy: reviewedBy || undefined,
    notes: notes || undefined,
  };
}

/**
 * CSV 전체 생성 (헤더 + 데이터)
 */
export function generateLabelingCsv(entries: LabelingEntry[]): string {
  const header = CSV_HEADERS.join(',');
  const rows = entries.map((entry) => {
    const row = labelingEntryToCsvRow(entry);
    // CSV 이스케이프 처리 (CSV Injection 방어 포함)
    return row
      .map((cell) => {
        // CSV Injection 방어: 수식 문자로 시작하면 ' 추가 (OWASP 권장)
        let escaped = cell;
        if (/^[=+\-@\t\r]/.test(escaped)) {
          escaped = "'" + escaped;
        }
        // 쉼표, 따옴표, 개행 포함 시 큰따옴표로 감싸기
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
          return `"${escaped.replace(/"/g, '""')}"`;
        }
        return escaped;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * 라벨링 통계 계산
 */
export interface LabelingStats {
  total: number;
  byProduct: Record<string, number>;
  byConfidence: Record<string, number>;
  reviewedCount: number;
  reviewRate: number;
  noneRate: number;
}

export function calculateLabelingStats(entries: LabelingEntry[]): LabelingStats {
  const byProduct: Record<string, number> = {};
  const byConfidence: Record<string, number> = { high: 0, medium: 0, low: 0 };
  let reviewedCount = 0;

  for (const entry of entries) {
    // 제품별 집계
    byProduct[entry.actualProduct] = (byProduct[entry.actualProduct] || 0) + 1;
    // 신뢰도별 집계
    byConfidence[entry.labelConfidence]++;
    // 검토 완료 수
    if (entry.reviewed) reviewedCount++;
  }

  const total = entries.length;
  const noneCount = byProduct['NONE'] || 0;

  return {
    total,
    byProduct,
    byConfidence,
    reviewedCount,
    reviewRate: total > 0 ? reviewedCount / total : 0,
    noneRate: total > 0 ? noneCount / total : 0,
  };
}

/**
 * 라벨링 가이드라인
 */
export const LABELING_GUIDELINES = `
# CMNTech 제품 매칭 라벨링 가이드라인

## 1. 목적
- AI_MATCH 함수의 정확도 향상을 위한 Ground Truth 데이터 구축
- 제품-공고 매칭 규칙 정립

## 2. 라벨링 기준

### UR-1000PLUS (다회선 초음파 유량계)
- 키워드: 초음파유량계, 다회선, 상수도, 정수장, 취수장
- 규격: DN300 ~ DN4000
- 타겟 기관: K-water, 상수도사업본부

### MF-1000C (일체형 전자 유량계)
- 키워드: 전자유량계, 일체형, 플랜지형, 공업용수
- 규격: DN15 ~ DN300
- 타겟 기관: 공장, 빌딩, 상거래

### UR-1010PLUS (비만관형 유량계)
- 키워드: 비만관, 비접촉, 하수, 우수, 환경
- 규격: DN300 ~ DN3000
- 타겟 기관: 환경공단, 하수처리장

### SL-3000PLUS (개수로 유량계)
- 키워드: 개수로, 레벨센서, 하천, 수로, 농업용수
- 규격: 폭 기준 측정
- 타겟 기관: 농어촌공사, 수자원공사

### EnerRay (초음파 열량계)
- 키워드: 열량계, 에너지, 난방, 열공급
- 타겟 기관: 지역난방공사, 한전, 가스공사

### NONE (매칭 없음)
- 경쟁사 지정 공고
- 관련 없는 품목 (펌프, 밸브, 배관 등)
- 규격 범위 초과/미달
- 예산/수량 불적합

## 3. 라벨링 절차
1. 공고 제목과 본문 확인
2. 키워드 추출 (자동 + 수동 보완)
3. 규격 확인 (DN, 구경)
4. 발주기관 확인
5. 제품 선택 및 이유 작성
6. 신뢰도 선택 (high/medium/low)

## 4. 검토 기준
- 모든 라벨링은 2명 이상 검토 권장
- high 신뢰도: 명확한 키워드 + 규격 일치
- medium 신뢰도: 부분 일치 또는 추론 필요
- low 신뢰도: 불확실, 추가 확인 필요

## 5. 목표 데이터량
- MVP: 50건 (제품당 8~10건)
- 안정화: 200~500건
- 지속 수집: 월 20~50건

## 6. NONE 비율 목표
- 전체의 20~30%
- 너무 낮으면: False Positive 위험
- 너무 높으면: 라벨링 기준 재검토
`;
