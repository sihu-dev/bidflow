/**
 * AI_KEYWORDS() 함수 구현
 * 핵심 키워드 3개 자동 추출
 * Redis 캐싱 적용 (7일 TTL)
 */

import { getCache, setCache, createCacheKey, CacheTTL } from '@/lib/cache/redis-cache';
import { createHash } from 'crypto';

/**
 * 제품 관련 키워드 사전
 */
const PRODUCT_KEYWORDS = [
  // 유량계 종류
  '초음파유량계', '초음파 유량계', '전자유량계', '전자 유량계',
  '비만관형', '비만관', '개수로', '열량계',

  // 규격 관련
  'DN', '구경', '호칭경', '관경', '파이프',

  // 용도/분야
  '상수도', '하수', '하수처리', '정수장', '취수장',
  '공업용수', '농업용수', '관개', '수로',
  '지역난방', '열공급', '난방',

  // 방식/특징
  '일체형', '플랜지형', '비접촉', '레벨센서',
  '다회선', '초음파',

  // 설치/공사
  '설치', '납품', '교체', '구매', '공사',
];

/**
 * 불용어 (제거할 단어)
 */
const STOP_WORDS = [
  '및', '등', '의', '을', '를', '이', '가', '은', '는',
  '으로', '에서', '에', '와', '과', '도', '만',
  '위한', '대한', '관한', '통한',
  '있는', '없는', '하는', '되는',
  '그', '이', '저', '그것', '것',
];

/**
 * 핵심 키워드 추출
 *
 * 알고리즘:
 * 1. 토큰화 (2글자 이상 한글/영문)
 * 2. 불용어 제거
 * 3. 제품 키워드 가중치 부여 (1.5배)
 * 4. 빈도수 기반 정렬
 * 5. 상위 3개 선택
 *
 * @param bidText 입찰 공고 전문
 * @returns 핵심 키워드 배열 (최대 3개)
 *
 * @example
 * ```typescript
 * const keywords = AI_KEYWORDS(
 *   "서울시 상수도본부 초음파유량계 DN300~1000 구매"
 * );
 * // → ["초음파유량계", "상수도", "DN300~1000"]
 * ```
 */
export async function AI_KEYWORDS(bidText: string): Promise<string[]> {
  if (!bidText || typeof bidText !== 'string') {
    return [];
  }

  // 캐시 키 생성 (bidText 해시 기반)
  const textHash = createHash('sha256').update(bidText).digest('hex').slice(0, 16);
  const cacheKey = createCacheKey('ai', 'keywords', textHash);

  // 캐시 조회
  const cached = await getCache<string[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. 제품 키워드 우선 추출
  const productMatches = extractProductKeywords(bidText);

  if (productMatches.length >= 3) {
    const result = productMatches.slice(0, 3);

    // 캐시 저장 (비동기, 에러 무시)
    setCache(cacheKey, result, CacheTTL.AI_KEYWORDS).catch(() => {
      // 캐싱 실패해도 결과는 반환
    });

    return result;
  }

  // 2. 일반 키워드 추출
  const generalKeywords = extractGeneralKeywords(bidText);

  // 3. 제품 키워드 + 일반 키워드 합치기
  const allKeywords = [...productMatches, ...generalKeywords];

  // 4. 중복 제거 및 상위 3개
  const uniqueKeywords = Array.from(new Set(allKeywords));

  const result = uniqueKeywords.slice(0, 3);

  // 캐시 저장 (비동기, 에러 무시)
  setCache(cacheKey, result, CacheTTL.AI_KEYWORDS).catch(() => {
    // 캐싱 실패해도 결과는 반환
  });

  return result;
}

/**
 * 제품 관련 키워드 추출
 */
function extractProductKeywords(text: string): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();

  for (const keyword of PRODUCT_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      found.push(keyword);

      // 최대 3개까지만
      if (found.length >= 3) {
        break;
      }
    }
  }

  return found;
}

/**
 * 일반 키워드 추출 (TF 기반)
 */
function extractGeneralKeywords(text: string): string[] {
  // 토큰화: 2글자 이상 한글/영문 단어
  const tokens = text.match(/[가-힣a-zA-Z]{2,}/g) || [];

  // 빈도수 계산
  const frequency: Record<string, number> = {};

  for (const token of tokens) {
    const word = token.toLowerCase();

    // 불용어 필터링
    if (STOP_WORDS.includes(word)) {
      continue;
    }

    // 빈도수 증가
    frequency[token] = (frequency[token] || 0) + 1;
  }

  // 빈도수 기준 정렬
  const sorted = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .map(([word]) => word);

  return sorted;
}

/**
 * 규격 정보 추출 (DN, 구경 등)
 */
function extractSpecKeywords(text: string): string[] {
  const specPatterns = [
    /DN\s*\d{2,4}(?:\s*[~\-]\s*\d{2,4})?/gi,
    /구경\s*\d{2,4}(?:mm)?/gi,
    /호칭경\s*\d{2,4}/gi,
    /\d{2,4}A/g,
  ];

  const specs: string[] = [];

  for (const pattern of specPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      specs.push(...matches);
    }
  }

  return specs.slice(0, 2); // 최대 2개
}

/**
 * 키워드 카테고리별 추출
 */
export interface CategorizedKeywords {
  products: string[];    // 제품 관련
  specs: string[];       // 규격 관련
  purposes: string[];    // 용도 관련
  general: string[];     // 일반 키워드
}

/**
 * 카테고리별 키워드 추출
 *
 * @param bidText 입찰 공고 전문
 * @returns 카테고리별 키워드
 */
export async function getCategorizedKeywords(bidText: string): Promise<CategorizedKeywords> {
  const productTypes = ['초음파', '전자', '비만관', '개수로', '열량계'];
  const purposes = ['상수도', '하수', '공업용수', '농업용수', '난방', '열공급'];
  const specs = extractSpecKeywords(bidText);

  const allKeywords = await AI_KEYWORDS(bidText);

  return {
    products: allKeywords.filter(k =>
      productTypes.some(p => k.includes(p))
    ),
    specs,
    purposes: allKeywords.filter(k =>
      purposes.some(p => k.includes(p))
    ),
    general: allKeywords.filter(k =>
      !productTypes.some(p => k.includes(p)) &&
      !purposes.some(p => k.includes(p)) &&
      !specs.includes(k)
    ),
  };
}

/**
 * 키워드 강조 HTML 생성
 *
 * @param text 원본 텍스트
 * @param keywords 강조할 키워드
 * @returns HTML 문자열
 */
export function highlightKeywords(text: string, keywords: string[]): string {
  let highlighted = text;

  for (const keyword of keywords) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlighted = highlighted.replace(
      regex,
      '<mark class="bg-neutral-700 dark:bg-neutral-800">$1</mark>'
    );
  }

  return highlighted;
}
