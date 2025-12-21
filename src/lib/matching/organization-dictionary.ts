/**
 * 기관 표준화 사전
 * 발주기관명의 다양한 표기를 정규화
 */

export interface OrganizationEntry {
  /** 정규화된 기관명 */
  canonical: string;
  /** 동의어/별칭 목록 */
  aliases: string[];
  /** 기관 유형 */
  type: 'public_corp' | 'local_gov' | 'central_gov' | 'utility' | 'other';
  /** CMNTech 제품 연관도 (제품 ID 배열) */
  relatedProducts: string[];
  /** 매칭 가중치 (기본 1.0) */
  weight: number;
}

/**
 * 기관 표준화 사전
 * CMNTech 제품과 관련된 주요 발주기관
 */
export const ORGANIZATION_DICTIONARY: OrganizationEntry[] = [
  // ===== 수자원/상수도 (UR-1000PLUS, MF-1000C 주력) =====
  {
    canonical: '한국수자원공사',
    aliases: [
      'K-water',
      'K-Water',
      'Kwater',
      '수자원공사',
      '한국수자원',
      '케이워터',
    ],
    type: 'public_corp',
    relatedProducts: ['UR-1000PLUS', 'MF-1000C', 'SL-3000PLUS'],
    weight: 1.5,
  },
  {
    canonical: '서울시 상수도사업본부',
    aliases: [
      '서울특별시 상수도사업본부',
      '서울상수도',
      '서울시상수도',
      '서울 상수도사업본부',
      '서울시 상수도',
    ],
    type: 'local_gov',
    relatedProducts: ['UR-1000PLUS', 'MF-1000C'],
    weight: 1.5,
  },
  {
    canonical: '부산시 상수도사업본부',
    aliases: [
      '부산광역시 상수도사업본부',
      '부산상수도',
      '부산시상수도',
    ],
    type: 'local_gov',
    relatedProducts: ['UR-1000PLUS', 'MF-1000C'],
    weight: 1.3,
  },
  {
    canonical: '인천시 상수도사업본부',
    aliases: [
      '인천광역시 상수도사업본부',
      '인천상수도',
      '인천시상수도',
    ],
    type: 'local_gov',
    relatedProducts: ['UR-1000PLUS', 'MF-1000C'],
    weight: 1.3,
  },

  // ===== 환경/하수 (UR-1010PLUS 주력) =====
  {
    canonical: '한국환경공단',
    aliases: [
      '환경공단',
      'KECO',
      '한국환경',
    ],
    type: 'public_corp',
    relatedProducts: ['UR-1010PLUS', 'SL-3000PLUS'],
    weight: 1.5,
  },
  {
    canonical: '환경부',
    aliases: [
      '환경부장관',
      'MOE',
      '대한민국 환경부',
    ],
    type: 'central_gov',
    relatedProducts: ['UR-1010PLUS', 'SL-3000PLUS', 'UR-1000PLUS'],
    weight: 1.3,
  },
  {
    canonical: '부산환경공단',
    aliases: [
      '부산광역시 환경공단',
      '부산시 환경공단',
    ],
    type: 'local_gov',
    relatedProducts: ['UR-1010PLUS'],
    weight: 1.4,
  },
  {
    canonical: '서울시설공단',
    aliases: [
      '서울특별시시설관리공단',
      '서울시설관리공단',
    ],
    type: 'local_gov',
    relatedProducts: ['UR-1010PLUS', 'UR-1000PLUS'],
    weight: 1.2,
  },

  // ===== 농업/수로 (SL-3000PLUS, MF-1000C) =====
  {
    canonical: '한국농어촌공사',
    aliases: [
      '농어촌공사',
      'KRC',
      '한국농어촌',
      '농어촌',
    ],
    type: 'public_corp',
    relatedProducts: ['SL-3000PLUS', 'MF-1000C'],
    weight: 1.4,
  },
  {
    canonical: '농림축산식품부',
    aliases: [
      '농림부',
      '농식품부',
      'MAFRA',
    ],
    type: 'central_gov',
    relatedProducts: ['SL-3000PLUS'],
    weight: 1.2,
  },

  // ===== 에너지/열량계 (EnerRay 주력) =====
  {
    canonical: '한국지역난방공사',
    aliases: [
      '지역난방공사',
      'KDHC',
      '한난',
      '지역난방',
    ],
    type: 'public_corp',
    relatedProducts: ['EnerRay'],
    weight: 1.5,
  },
  {
    canonical: '한국전력공사',
    aliases: [
      '한전',
      'KEPCO',
      '한국전력',
      '전력공사',
    ],
    type: 'public_corp',
    relatedProducts: ['EnerRay', 'UR-1000PLUS'],
    weight: 1.3,
  },
  {
    canonical: '한국가스공사',
    aliases: [
      '가스공사',
      'KOGAS',
      '한국가스',
    ],
    type: 'public_corp',
    relatedProducts: ['EnerRay'],
    weight: 1.2,
  },
  {
    canonical: '한국동서발전',
    aliases: [
      '동서발전',
      'EWP',
    ],
    type: 'public_corp',
    relatedProducts: ['EnerRay', 'UR-1000PLUS'],
    weight: 1.2,
  },
  {
    canonical: '한국남동발전',
    aliases: [
      '남동발전',
      'KOEN',
    ],
    type: 'public_corp',
    relatedProducts: ['EnerRay', 'UR-1000PLUS'],
    weight: 1.2,
  },

  // ===== 기타 공기업 =====
  {
    canonical: '한국도로공사',
    aliases: [
      '도로공사',
      'EX',
      '고속도로공사',
    ],
    type: 'public_corp',
    relatedProducts: ['MF-1000C'],
    weight: 1.0,
  },
  {
    canonical: '한국철도공사',
    aliases: [
      '코레일',
      'KORAIL',
      '철도공사',
    ],
    type: 'public_corp',
    relatedProducts: ['MF-1000C'],
    weight: 1.0,
  },
  {
    canonical: '한국토지주택공사',
    aliases: [
      'LH',
      'LH공사',
      '토지주택공사',
      '엘에이치',
    ],
    type: 'public_corp',
    relatedProducts: ['MF-1000C', 'UR-1000PLUS'],
    weight: 1.1,
  },

  // ===== 지방자치단체 (일반) =====
  {
    canonical: '지방자치단체',
    aliases: [
      '지자체',
      '시청',
      '군청',
      '구청',
    ],
    type: 'local_gov',
    relatedProducts: ['MF-1000C', 'UR-1000PLUS'],
    weight: 0.8,
  },
];

/**
 * 기관명 정규화
 * 입력된 기관명을 표준 기관명으로 변환
 */
export function normalizeOrganization(orgName: string): {
  canonical: string;
  entry: OrganizationEntry | null;
  confidence: 'exact' | 'alias' | 'partial' | 'none';
} {
  if (!orgName || typeof orgName !== 'string') {
    return { canonical: orgName, entry: null, confidence: 'none' };
  }

  const normalized = orgName.trim().replace(/\s+/g, ' ');

  // 1. 정확히 canonical과 일치
  for (const entry of ORGANIZATION_DICTIONARY) {
    if (entry.canonical === normalized) {
      return { canonical: entry.canonical, entry, confidence: 'exact' };
    }
  }

  // 2. aliases와 정확히 일치
  for (const entry of ORGANIZATION_DICTIONARY) {
    for (const alias of entry.aliases) {
      if (alias.toLowerCase() === normalized.toLowerCase()) {
        return { canonical: entry.canonical, entry, confidence: 'alias' };
      }
    }
  }

  // 3. 부분 매칭 (canonical 또는 alias 포함)
  for (const entry of ORGANIZATION_DICTIONARY) {
    if (normalized.includes(entry.canonical) || entry.canonical.includes(normalized)) {
      return { canonical: entry.canonical, entry, confidence: 'partial' };
    }
    for (const alias of entry.aliases) {
      if (normalized.toLowerCase().includes(alias.toLowerCase())) {
        return { canonical: entry.canonical, entry, confidence: 'partial' };
      }
    }
  }

  // 4. 매칭 실패
  return { canonical: normalized, entry: null, confidence: 'none' };
}

/**
 * 기관과 제품의 연관도 점수 계산
 */
export function getOrganizationProductScore(
  orgName: string,
  productId: string
): {
  score: number;
  isRelated: boolean;
  reason: string;
} {
  const { canonical, entry, confidence } = normalizeOrganization(orgName);

  if (!entry) {
    return {
      score: 0,
      isRelated: false,
      reason: `미등록 기관: ${canonical}`,
    };
  }

  const isRelated = entry.relatedProducts.includes(productId);

  if (isRelated) {
    // 연관 기관: 가중치 적용
    const baseScore = 30;
    const weightedScore = Math.round(baseScore * entry.weight);
    const confidenceBonus = confidence === 'exact' ? 5 : confidence === 'alias' ? 3 : 0;

    return {
      score: weightedScore + confidenceBonus,
      isRelated: true,
      reason: `${canonical} → ${productId} 연관 (가중치 ${entry.weight})`,
    };
  } else {
    // 비연관 기관
    return {
      score: 5, // 기본 점수 (기관 매칭은 됨)
      isRelated: false,
      reason: `${canonical} - ${productId} 비주력 제품`,
    };
  }
}

/**
 * 제품에 대한 주요 타겟 기관 목록 조회
 */
export function getTargetOrganizations(productId: string): OrganizationEntry[] {
  return ORGANIZATION_DICTIONARY.filter((entry) =>
    entry.relatedProducts.includes(productId)
  ).sort((a, b) => b.weight - a.weight);
}

/**
 * 기관 유형별 필터링
 */
export function getOrganizationsByType(
  type: OrganizationEntry['type']
): OrganizationEntry[] {
  return ORGANIZATION_DICTIONARY.filter((entry) => entry.type === type);
}
