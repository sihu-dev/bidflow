/**
 * @module config/tenants
 * @description 동적 화이트라벨 테넌트 설정
 */

// ============================================================================
// 타입 정의
// ============================================================================

export interface TenantProduct {
  name: string;
  model: string;
  category: string;
  description: string;
}

export interface TenantBranding {
  name: string;
  tagline: string;
  logo?: string;
  favicon?: string;
}

export interface TenantHero {
  badge: string;
  headline: string;
  headlineSub?: string;
  description: string;
}

export interface TenantFeatures {
  title: string;
  description: string;
  items: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export interface TenantConfig {
  id: string;
  branding: TenantBranding;
  hero: TenantHero;
  features?: Partial<TenantFeatures>;
  products?: TenantProduct[];
  keywords?: string[];
  dataSources?: string[];
}

// ============================================================================
// 기본 테넌트: BIDFLOW (범용)
// ============================================================================

export const DEFAULT_TENANT: TenantConfig = {
  id: 'bidflow',
  branding: {
    name: 'BIDFLOW',
    tagline: '입찰 자동화의 새로운 기준',
    logo: '/logos/bidflow.svg',
  },
  hero: {
    badge: 'AI 기반 입찰 자동화 플랫폼',
    headline: '입찰 공고 수집부터',
    headlineSub: '제안서 작성까지',
    description:
      '나라장터, TED, SAM.gov 등 45개 이상의 데이터 소스에서 입찰 공고를 자동 수집하고, AI가 귀사 제품과 매칭하여 입찰 성공률을 높여드립니다.',
  },
  features: {
    title: '왜 BIDFLOW인가요?',
    description: '중소 제조업체를 위한 맞춤형 입찰 자동화',
    items: [
      {
        title: '자동 공고 수집',
        description: '45개 이상의 데이터 소스에서 실시간 수집',
        icon: 'Search',
      },
      {
        title: 'AI 제품 매칭',
        description: '귀사 제품과 공고 요구사항 자동 분석',
        icon: 'Cpu',
      },
      {
        title: '마감 알림',
        description: 'D-3, D-1 마감 임박 알림 자동 발송',
        icon: 'Bell',
      },
      {
        title: '제안서 초안',
        description: 'AI가 제안서 초안을 자동 생성',
        icon: 'FileText',
      },
    ],
  },
  keywords: [],
  dataSources: ['narajangto', 'ted', 'sam'],
};

// ============================================================================
// CMNTech 테넌트 (유량계 전문)
// ============================================================================

export const CMNTECH_TENANT: TenantConfig = {
  id: 'cmntech',
  branding: {
    name: 'CMNTech',
    tagline: '유량계 입찰 자동화',
    logo: '/logos/cmntech.svg',
  },
  hero: {
    badge: 'CMNTech 유량계 전문 입찰 자동화',
    headline: 'UR-1000PLUS부터',
    headlineSub: 'EnerRay까지',
    description:
      '나라장터, TED, 한전 공고에서 유량계 입찰을 AI가 자동 수집하고, 5개 CMNTech 제품과 매칭하여 입찰 성공률을 높여드립니다.',
  },
  features: {
    title: '왜 BIDFLOW + CMNTech인가요?',
    description: '유량계 전문 입찰 자동화',
    items: [
      {
        title: '유량계 키워드 자동 수집',
        description: '유량계, 초음파, 전자식 등 키워드 기반 수집',
        icon: 'Search',
      },
      {
        title: '5개 제품 자동 매칭',
        description: 'UR-1000PLUS, EnerRay 등 제품별 적합도 분석',
        icon: 'Cpu',
      },
      {
        title: '마감 알림',
        description: 'D-3, D-1 마감 임박 알림 자동 발송',
        icon: 'Bell',
      },
      {
        title: '제안서 초안',
        description: '유량계 사양 기반 제안서 자동 생성',
        icon: 'FileText',
      },
    ],
  },
  products: [
    {
      name: 'UR-1000PLUS',
      model: 'UR-1000PLUS',
      category: '초음파 유량계',
      description: '클램프온 초음파 유량계 (15~6000mm)',
    },
    {
      name: 'WPD-FM100',
      model: 'WPD-FM100',
      category: '전자식 유량계',
      description: '상수도 전자식 유량계',
    },
    {
      name: 'EnerRay',
      model: 'EnerRay',
      category: '초음파 열량계',
      description: '초음파 열량계 (DN15~100)',
    },
    {
      name: 'WPD-RC200',
      model: 'WPD-RC200',
      category: '지역난방 열량계',
      description: '지역난방 검침용 열량계',
    },
    {
      name: 'WPD-WT300',
      model: 'WPD-WT300',
      category: '수도미터',
      description: '원격검침 수도미터',
    },
  ],
  keywords: ['유량계', '초음파유량계', '전자유량계', '계측기', '수도미터', '열량계'],
  dataSources: ['narajangto', 'kepco'],
};

// ============================================================================
// 테넌트 레지스트리
// ============================================================================

export const TENANTS: Record<string, TenantConfig> = {
  bidflow: DEFAULT_TENANT,
  cmntech: CMNTECH_TENANT,
};

/**
 * 테넌트 ID로 설정 조회
 */
export function getTenantConfig(tenantId?: string | null): TenantConfig {
  if (!tenantId) return DEFAULT_TENANT;
  return TENANTS[tenantId.toLowerCase()] || DEFAULT_TENANT;
}

/**
 * URL에서 테넌트 ID 추출
 * - 쿼리 파라미터: ?tenant=cmntech
 * - 서브도메인: cmntech.bidflow.com
 */
export function extractTenantId(
  searchParams?: URLSearchParams | null,
  hostname?: string | null
): string {
  // 1. 쿼리 파라미터 우선
  if (searchParams?.get('tenant')) {
    return searchParams.get('tenant')!;
  }

  // 2. 서브도메인 체크
  if (hostname) {
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      const subdomain = parts[0];
      if (TENANTS[subdomain]) {
        return subdomain;
      }
    }
  }

  // 3. 기본값
  return 'bidflow';
}
