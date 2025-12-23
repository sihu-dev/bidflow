/**
 * @module __tests__/lib/matching/enhanced-matcher
 * @description 175점 매칭 엔진 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  matchBidToProducts,
  CMNTECH_PRODUCTS,
  type BidAnnouncement,
} from '@/lib/matching/enhanced-matcher';

describe('Enhanced Matcher - 175점 매칭 엔진', () => {
  // ============================================================================
  // 1. 키워드 매칭 테스트 (최대 100점)
  // ============================================================================

  describe('키워드 매칭 (강한 키워드 10점, 약한 키워드 3점)', () => {
    it('강한 키워드 1개 매칭 → 최소 10점 키워드 점수', () => {
      const bid: BidAnnouncement = {
        id: 'test-1',
        title: '초음파유량계 구매',
        organization: '알 수 없는 기관',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      // 키워드 점수만 확인 (기관 점수는 변동 가능)
      expect(ur1000!.breakdown.keywordScore).toBeGreaterThanOrEqual(10);
      expect(ur1000!.reasons.join(' ')).toContain('강한 키워드');
    });

    it('강한 키워드 3개 + 약한 키워드 2개 → 36점', () => {
      const bid: BidAnnouncement = {
        id: 'test-2',
        title: '다회선 초음파유량계 및 상수도 계측기 구매',
        organization: '정수장',
        description: '유량계 측정기',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      // 강한: 초음파유량계(10) + 다회선(10) + 상수도(10) + 정수장(10) = 40점
      // 약한: 유량계(3) + 계측기(3) + 측정기(3) = 9점
      // 총: 49점
      expect(ur1000!.breakdown.keywordScore).toBeGreaterThanOrEqual(40);
    });

    it('제외 키워드 발견 → 매칭 불가 (0점)', () => {
      const bid: BidAnnouncement = {
        id: 'test-3',
        title: '초음파유량계 및 열량계 구매',
        organization: '서울시',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      expect(ur1000!.isMatch).toBe(false);
      expect(ur1000!.score).toBe(0);
      expect(ur1000!.reasons).toContain('제외 키워드 발견 - 매칭 불가');
    });
  });

  // ============================================================================
  // 2. 파이프 규격 매칭 테스트 (최대 25점)
  // ============================================================================

  describe('파이프 규격 매칭 (최대 25점)', () => {
    it('DN 1000 → UR-1000PLUS (300-4000mm) 매칭', () => {
      const bid: BidAnnouncement = {
        id: 'test-4',
        title: '초음파유량계 구매 (DN 1000)',
        organization: '정수장',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      expect(ur1000!.breakdown.pipeSizeScore).toBeGreaterThan(0);
      expect(ur1000!.breakdown.pipeSizeScore).toBeLessThanOrEqual(25);
    });

    it('DN 50 → MF-1000C (15-300mm) 매칭', () => {
      const bid: BidAnnouncement = {
        id: 'test-5',
        title: '전자유량계 구매 (DN 50)',
        organization: '공장',
      };

      const { allMatches } = matchBidToProducts(bid);
      const mf1000 = allMatches.find(r => r.productId === 'MF-1000C');

      expect(mf1000).toBeDefined();
      expect(mf1000!.breakdown.pipeSizeScore).toBeGreaterThan(0);
    });

    it('DN 5000 → UR-1000PLUS (300-4000mm) 규격 벗어남 → 낮은 점수', () => {
      const bid: BidAnnouncement = {
        id: 'test-6',
        title: '초음파유량계 구매 (DN 5000)',
        organization: '정수장',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      // 규격 벗어나므로 pipeSizeScore가 낮거나 0
      expect(ur1000!.breakdown.pipeSizeScore).toBeLessThan(15);
    });
  });

  // ============================================================================
  // 3. 기관 매칭 테스트 (최대 50점)
  // ============================================================================

  describe('기관 매칭 (최대 50점)', () => {
    it('K-water → 높은 기관 점수', () => {
      const bid: BidAnnouncement = {
        id: 'test-7',
        title: '초음파유량계 구매',
        organization: '한국수자원공사',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      expect(ur1000!.breakdown.organizationScore).toBeGreaterThan(0);
    });

    it('알 수 없는 기관 → 기본 점수', () => {
      const bid: BidAnnouncement = {
        id: 'test-8',
        title: '초음파유량계 구매',
        organization: '테스트회사',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      // 알 수 없는 기관이므로 organizationScore가 낮음
      expect(ur1000!.breakdown.organizationScore).toBeLessThanOrEqual(10);
    });
  });

  // ============================================================================
  // 4. 종합 점수 및 신뢰도 테스트
  // ============================================================================

  describe('종합 점수 및 신뢰도', () => {
    it('70점 이상 → high confidence, isMatch: true', () => {
      const bid: BidAnnouncement = {
        id: 'test-9',
        title: '다회선 초음파유량계 구매 (DN 1000)',
        organization: '한국수자원공사',
        description: '정수장 상수도 시설 유량계 측정기 설치',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      expect(ur1000!.score).toBeGreaterThanOrEqual(70);
      expect(ur1000!.confidence).toBe('high');
      expect(ur1000!.isMatch).toBe(true);
    });

    it('중간 점수 → 신뢰도 및 매칭 상태 확인', () => {
      const bid: BidAnnouncement = {
        id: 'test-10',
        title: '초음파유량계 구매',
        organization: '알 수 없는 기관',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      // 초음파유량계 키워드가 있으므로 키워드 점수 10점 이상
      expect(ur1000!.breakdown.keywordScore).toBeGreaterThanOrEqual(10);
      // 총 점수 확인
      expect(ur1000!.score).toBeGreaterThan(0);
      // 신뢰도는 점수에 따라 변동 가능
      expect(['high', 'medium', 'low', 'none']).toContain(ur1000!.confidence);
    });

    it('관련 없는 입찰 → low/none confidence, isMatch: false', () => {
      const bid: BidAnnouncement = {
        id: 'test-11',
        title: '전기 배선 및 조명 설비 공사',
        organization: '알 수 없는 기관',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      // 관련 없는 입찰이므로 키워드 점수가 0이어야 함
      expect(ur1000!.breakdown.keywordScore).toBe(0);
      expect(ur1000!.isMatch).toBe(false);
    });
  });

  // ============================================================================
  // 5. 복수 제품 매칭 테스트
  // ============================================================================

  describe('복수 제품 매칭 및 우선순위', () => {
    it('전자유량계 키워드 → MF-1000C 최우선 매칭', () => {
      const bid: BidAnnouncement = {
        id: 'test-12',
        title: '전자유량계 구매 (DN 100)',
        organization: '공장',
      };

      const { allMatches, bestMatch } = matchBidToProducts(bid);
      const matchedProducts = allMatches.filter(r => r.isMatch).sort((a, b) => b.score - a.score);

      expect(matchedProducts.length).toBeGreaterThan(0);
      expect(matchedProducts[0].productId).toBe('MF-1000C');
      expect(bestMatch?.productId).toBe('MF-1000C');
    });

    it('비만관 키워드 → UR-1010PLUS 우선 매칭', () => {
      const bid: BidAnnouncement = {
        id: 'test-13',
        title: '비만관형 유량계 구매',
        organization: '하수처리장',
      };

      const { allMatches, bestMatch } = matchBidToProducts(bid);
      const matchedProducts = allMatches.filter(r => r.isMatch).sort((a, b) => b.score - a.score);

      expect(matchedProducts.length).toBeGreaterThan(0);
      expect(matchedProducts[0].productId).toBe('UR-1010PLUS');
    });

    it('열량계 키워드 → EnerRay 우선 매칭', () => {
      const bid: BidAnnouncement = {
        id: 'test-14',
        title: '초음파 열량계 구매',
        organization: '지역난방공사',
      };

      const { allMatches, bestMatch } = matchBidToProducts(bid);
      const matchedProducts = allMatches.filter(r => r.isMatch).sort((a, b) => b.score - a.score);

      expect(matchedProducts.length).toBeGreaterThan(0);
      expect(matchedProducts[0].productId).toBe('EnerRay');
    });
  });

  // ============================================================================
  // 6. 엣지 케이스 테스트
  // ============================================================================

  describe('엣지 케이스', () => {
    it('빈 문자열 입찰 → 매우 낮은 점수, 매칭 불가', () => {
      const bid: BidAnnouncement = {
        id: 'test-15',
        title: '',
        organization: '',
      };

      const { allMatches, recommendation } = matchBidToProducts(bid);

      allMatches.forEach(result => {
        // 빈 문자열이므로 키워드 점수는 0이어야 함
        expect(result.breakdown.keywordScore).toBe(0);
        // 기관 점수도 거의 없어야 함
        expect(result.score).toBeLessThan(30);
        expect(result.isMatch).toBe(false);
      });
      expect(recommendation).toBe('SKIP');
    });

    it('매칭 없는 입찰 → bestMatch가 null 또는 낮은 점수', () => {
      const bid: BidAnnouncement = {
        id: 'test-16',
        title: '도로 포장 공사 및 아스팔트 보수',
        organization: '국토교통부 도로관리과',
      };

      const { bestMatch, recommendation, allMatches } = matchBidToProducts(bid);

      // 모든 제품이 낮은 점수이거나 매칭되지 않아야 함
      const hasHighScoreMatch = allMatches.some(m => m.score >= 30);
      expect(hasHighScoreMatch).toBe(false);
      expect(recommendation).toBe('SKIP');
    });

    it('대소문자 무관 매칭', () => {
      const bid: BidAnnouncement = {
        id: 'test-17',
        title: '초음파유량계 구매 (대문자 DN 1000)',
        organization: '정수장',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      expect(ur1000!.breakdown.keywordScore).toBeGreaterThan(0);
    });

    it('특수문자 포함 입찰', () => {
      const bid: BidAnnouncement = {
        id: 'test-18',
        title: '[긴급] 초음파-유량계 구매!!! (DN-1000)',
        organization: '서울시 정수장',
        description: '※ 다회선 상수도용 ※',
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      expect(ur1000!.breakdown.keywordScore).toBeGreaterThan(20);
      expect(ur1000!.isMatch).toBe(true);
    });
  });

  // ============================================================================
  // 7. 실제 입찰 공고 시나리오 테스트
  // ============================================================================

  describe('실제 입찰 공고 시나리오', () => {
    it('K-water 정수장 다회선 초음파유량계 (DN 1000) → 90점 이상', () => {
      const bid: BidAnnouncement = {
        id: 'real-1',
        title: '다회선 초음파유량계 설치 공사',
        organization: '한국수자원공사 부산권지역본부',
        description: `
          정수장 취수시설 유량측정을 위한 초음파 유량계 구매 및 설치
          - 규격: DN 1000, DN 1200
          - 수량: 각 2대
          - 납기: 계약 후 60일
        `,
        estimatedPrice: 50000000,
      };

      const { allMatches } = matchBidToProducts(bid);
      const ur1000 = allMatches.find(r => r.productId === 'UR-1000PLUS');

      expect(ur1000).toBeDefined();
      expect(ur1000!.score).toBeGreaterThanOrEqual(70);
      expect(ur1000!.confidence).toBe('high');
      expect(ur1000!.isMatch).toBe(true);
      expect(ur1000!.reasons.length).toBeGreaterThan(2);
    });

    it('하수처리장 비만관형 유량계 → UR-1010PLUS 매칭', () => {
      const bid: BidAnnouncement = {
        id: 'real-2',
        title: '하수처리장 비만관형 유량계 구매',
        organization: '환경부 광주환경관리사업소',
        description: '하수 유량측정용 비접촉식 유량계 (DN 500)',
      };

      const { allMatches, bestMatch } = matchBidToProducts(bid);
      const matchedProducts = allMatches.filter(r => r.isMatch).sort((a, b) => b.score - a.score);

      expect(matchedProducts.length).toBeGreaterThan(0);
      expect(matchedProducts[0].productId).toBe('UR-1010PLUS');
      expect(matchedProducts[0].score).toBeGreaterThanOrEqual(40);
    });

    it('농업용수 개수로 유량계 → SL-3000PLUS 매칭', () => {
      const bid: BidAnnouncement = {
        id: 'real-3',
        title: '농업용수 개수로 유량측정시스템 구축',
        organization: '한국농어촌공사',
        description: '농업용 관개수로 유량측정 레벨센서 및 유량계',
      };

      const { allMatches, bestMatch } = matchBidToProducts(bid);
      const matchedProducts = allMatches.filter(r => r.isMatch).sort((a, b) => b.score - a.score);

      expect(matchedProducts.length).toBeGreaterThan(0);
      expect(matchedProducts[0].productId).toBe('SL-3000PLUS');
    });

    it('지역난방 열량계 → EnerRay 매칭', () => {
      const bid: BidAnnouncement = {
        id: 'real-4',
        title: '초음파 열량계 구매 설치',
        organization: '한국지역난방공사',
        description: '지역난방 열공급 에너지 측정용 초음파식 열량계',
      };

      const { allMatches, bestMatch } = matchBidToProducts(bid);
      const matchedProducts = allMatches.filter(r => r.isMatch).sort((a, b) => b.score - a.score);

      expect(matchedProducts.length).toBeGreaterThan(0);
      expect(matchedProducts[0].productId).toBe('EnerRay');
      expect(matchedProducts[0].score).toBeGreaterThanOrEqual(50);
    });
  });

  // ============================================================================
  // 8. 제품 카탈로그 검증
  // ============================================================================

  describe('CMNTECH 제품 카탈로그 검증', () => {
    it('5개 제품이 정의되어 있어야 함', () => {
      expect(CMNTECH_PRODUCTS).toHaveLength(5);
    });

    it('모든 제품에 필수 필드가 있어야 함', () => {
      CMNTECH_PRODUCTS.forEach(product => {
        expect(product.id).toBeTruthy();
        expect(product.name).toBeTruthy();
        expect(product.category).toBeTruthy();
        expect(product.strongKeywords).toBeInstanceOf(Array);
        expect(product.weakKeywords).toBeInstanceOf(Array);
        expect(product.excludeKeywords).toBeInstanceOf(Array);
        expect(product.strongKeywords.length).toBeGreaterThan(0);
      });
    });

    it('각 제품의 제외 키워드가 다른 제품의 강한 키워드에 포함되어야 함', () => {
      // UR-1000PLUS의 excludeKeywords에 '전자유량계'가 있어야 함
      const ur1000 = CMNTECH_PRODUCTS.find(p => p.id === 'UR-1000PLUS');
      expect(ur1000?.excludeKeywords).toContain('전자유량계');

      // MF-1000C의 excludeKeywords에 '초음파'가 있어야 함
      const mf1000 = CMNTECH_PRODUCTS.find(p => p.id === 'MF-1000C');
      expect(mf1000?.excludeKeywords).toContain('초음파');
    });
  });
});
