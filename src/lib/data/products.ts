/**
 * CMNTech 제품 카탈로그
 * 5가지 유량계/열량계 제품 정의
 */

export interface CMNTechProduct {
  id: string;
  name: string;
  fullName: string;
  category: string;
  description: string;
  keywords: string[];
  targetOrganizations: string[];
  specifications: {
    pipeSize: { min: number; max: number } | null;
    accuracy: string;
    applications: string[];
  };
  icon: 'Waves' | 'Zap' | 'Droplets' | 'Flame' | 'Activity';
  priority: 1 | 2 | 3;
}

export const CMNTECH_PRODUCTS: CMNTechProduct[] = [
  {
    id: 'UR-1000PLUS',
    name: 'UR-1000PLUS',
    fullName: 'UR-1000PLUS® 다회선 초음파 유량계',
    category: '상수도',
    description: '대구경 상수도관용 다회선 초음파 유량계',
    keywords: ['초음파', '유량계', '만관', '상수도', '취수장', '정수장', '다회선'],
    targetOrganizations: ['수자원공사', '상수도본부', '환경부', 'K-water', '상수도사업본부'],
    specifications: {
      pipeSize: { min: 100, max: 4000 },
      accuracy: '±0.5%',
      applications: ['상수도', '취수장', '정수장', '관개수로', '공업용수'],
    },
    icon: 'Waves',
    priority: 1,
  },
  {
    id: 'MF-1000C',
    name: 'MF-1000C',
    fullName: 'MF-1000C 일체형 전자 유량계',
    category: '상거래',
    description: '상거래용 일체형 전자 유량계',
    keywords: ['전자', '유량계', '상거래', '공업용수', '일체형', '전자기'],
    targetOrganizations: ['지자체', '산업단지', '농어촌공사', '지방상수도'],
    specifications: {
      pipeSize: { min: 15, max: 2000 },
      accuracy: '±0.5%',
      applications: ['상하수도', '공업용수', '농업용수', '상거래용'],
    },
    icon: 'Zap',
    priority: 2,
  },
  {
    id: 'UR-1010PLUS',
    name: 'UR-1010PLUS',
    fullName: 'UR-1010PLUS 비만관형 유량계',
    category: '하수처리',
    description: '하수관로용 비만관형 초음파 유량계',
    keywords: ['비만관', '하수', '우수', '복류수', '하수관로', '비만관형'],
    targetOrganizations: ['하수도사업소', '환경공단', '하수처리장', '부산환경공단'],
    specifications: {
      pipeSize: { min: 200, max: 3000 },
      accuracy: '±1.0%~2.0%',
      applications: ['하수관로', '우수관로', '복류수', '하수처리장'],
    },
    icon: 'Droplets',
    priority: 1,
  },
  {
    id: 'SL-3000PLUS',
    name: 'SL-3000PLUS',
    fullName: 'SL-3000PLUS 개수로 유량계',
    category: '하천/수로',
    description: '개수로 및 하천용 비접촉식 유량계',
    keywords: ['개수로', '하천', '방류', '농업용수', '수로', '비접촉'],
    targetOrganizations: ['하천관리청', '농림부', '환경부', '농어촌공사', '수자원공사'],
    specifications: {
      pipeSize: null,
      accuracy: '±3%~5%',
      applications: ['하천', '개수로', '농업용수로', '방류구', '관개수로'],
    },
    icon: 'Activity',
    priority: 2,
  },
  {
    id: 'EnerRay',
    name: 'EnerRay',
    fullName: 'EnerRay 초음파 열량계',
    category: '에너지',
    description: '지역난방용 초음파 열량계',
    keywords: ['열량계', '에너지', '난방', '냉난방', '지역난방', '열교환'],
    targetOrganizations: ['지역난방공사', '열병합발전', '에너지공사', '한국전력', '발전소'],
    specifications: {
      pipeSize: { min: 15, max: 300 },
      accuracy: 'Class 2 (EN 1434)',
      applications: ['지역난방', '냉난방', '공장에너지', '열교환시스템'],
    },
    icon: 'Flame',
    priority: 3,
  },
];

/**
 * 제품 ID로 제품 정보 조회
 */
export function getProductById(id: string): CMNTechProduct | undefined {
  return CMNTECH_PRODUCTS.find((p) => p.id === id);
}

/**
 * 카테고리별 제품 필터링
 */
export function getProductsByCategory(category: string): CMNTechProduct[] {
  return CMNTECH_PRODUCTS.filter((p) => p.category === category);
}

/**
 * 신뢰도 레벨 계산
 */
export function getConfidenceLevel(score: number): {
  level: 'very_high' | 'high' | 'medium' | 'low';
  label: string;
  emoji: string;
} {
  if (score >= 90) return { level: 'very_high', label: '매우 높음', emoji: '' };
  if (score >= 70) return { level: 'high', label: '높음', emoji: '' };
  if (score >= 50) return { level: 'medium', label: '보통', emoji: '' };
  return { level: 'low', label: '낮음', emoji: '' };
}
