/**
 * Bid Use Cases 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listBids,
  getBidById,
  getUpcomingDeadlines,
  createBid,
  updateBidStatus,
  matchProductsForBid,
  getDashboardStats,
} from '@/lib/domain/usecases/bid-usecases';

// Shared mock repository instance
const mockRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByExternalId: vi.fn(),
  findUpcoming: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

// Mock repository - return the same instance every time
vi.mock('@/lib/domain/repositories/bid-repository', () => ({
  getBidRepository: vi.fn(() => mockRepository),
}));

// Mock product matcher
vi.mock('@/lib/clients/product-matcher', () => ({
  matchProducts: vi.fn(() => []),
}));

// Mock prompt guard
vi.mock('@/lib/security/prompt-guard', () => ({
  validatePromptInput: vi.fn(() => ({ isValid: true, threats: [] })),
  sanitizeInput: vi.fn((input: string) => input),
}));

import { matchProducts } from '@/lib/clients/product-matcher';

// Sample data
const sampleBid = {
  id: 'bid-001',
  source: 'narajangto',
  externalId: 'EXT-001',
  title: '서울시 초음파유량계 구매',
  organization: '서울특별시',
  deadline: '2025-01-15T00:00:00.000Z',
  estimatedAmount: BigInt(450000000),
  status: 'new',
  priority: 'high',
  type: 'product',
  keywords: ['유량계', '계측기'],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  rawData: {},
};

describe('bid-usecases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listBids', () => {
    it('입찰 목록 조회 성공', async () => {
      mockRepository.findAll.mockResolvedValue({
        success: true,
        data: {
          items: [sampleBid],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });

      const result = await listBids({ filters: {}, page: 1, limit: 20 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(1);
        expect(result.data.total).toBe(1);
      }
    });

    it('필터 적용', async () => {
      mockRepository.findAll.mockResolvedValue({
        success: true,
        data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      });

      await listBids({
        filters: { status: 'reviewing', priority: 'high' },
        sort: { field: 'deadline', direction: 'asc' },
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        { status: 'reviewing', priority: 'high' },
        { field: 'deadline', direction: 'asc' },
        { page: 1, limit: 20 }
      );
    });

    it('기본 페이지네이션 적용', async () => {
      mockRepository.findAll.mockResolvedValue({
        success: true,
        data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      });

      await listBids({});

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        { page: 1, limit: 20 }
      );
    });
  });

  describe('getBidById', () => {
    it('입찰 상세 조회 성공', async () => {
      mockRepository.findById.mockResolvedValue({
        success: true,
        data: sampleBid,
      });

      const result = await getBidById('bid-001' as never);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('bid-001');
      }
    });

    it('존재하지 않는 입찰 조회 실패', async () => {
      mockRepository.findById.mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND', message: '입찰을 찾을 수 없습니다' },
      });

      const result = await getBidById('nonexistent' as never);

      expect(result.success).toBe(false);
    });
  });

  describe('getUpcomingDeadlines', () => {
    it('마감 임박 입찰 조회', async () => {
      mockRepository.findUpcoming.mockResolvedValue({
        success: true,
        data: [sampleBid],
      });

      const result = await getUpcomingDeadlines(7);

      expect(result.success).toBe(true);
      expect(mockRepository.findUpcoming).toHaveBeenCalledWith(7);
    });

    it('기본 7일 적용', async () => {
      mockRepository.findUpcoming.mockResolvedValue({
        success: true,
        data: [],
      });

      await getUpcomingDeadlines();

      expect(mockRepository.findUpcoming).toHaveBeenCalledWith(7);
    });
  });

  describe('createBid', () => {
    const newBidInput = {
      source: 'narajangto' as const,
      externalId: 'NEW-001',
      title: '새로운 입찰 공고',
      organization: '부산시',
      deadline: '2025-02-01T00:00:00.000Z',
      type: 'product' as const,
    };

    it('새 입찰 생성 성공', async () => {
      mockRepository.findByExternalId.mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND' },
      });
      mockRepository.create.mockResolvedValue({
        success: true,
        data: { ...sampleBid, ...newBidInput },
      });

      const result = await createBid(newBidInput as never);

      expect(result.success).toBe(true);
    });

    it('중복 입찰 생성 실패', async () => {
      mockRepository.findByExternalId.mockResolvedValue({
        success: true,
        data: sampleBid,
      });

      const result = await createBid(newBidInput as never);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('DUPLICATE');
      }
    });

    it('입력 정제 적용', async () => {
      mockRepository.findByExternalId.mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND' },
      });
      mockRepository.create.mockResolvedValue({
        success: true,
        data: sampleBid,
      });

      await createBid(newBidInput as never);

      // sanitizeInput이 호출되었는지 확인
      const { sanitizeInput } = await import('@/lib/security/prompt-guard');
      expect(sanitizeInput).toHaveBeenCalled();
    });
  });

  describe('updateBidStatus', () => {
    it('유효한 상태 전이 성공', async () => {
      mockRepository.findById.mockResolvedValue({
        success: true,
        data: { ...sampleBid, status: 'new' },
      });
      mockRepository.updateStatus.mockResolvedValue({
        success: true,
        data: { ...sampleBid, status: 'reviewing' },
      });

      const result = await updateBidStatus('bid-001' as never, 'reviewing');

      expect(result.success).toBe(true);
    });

    it('유효하지 않은 상태 전이 실패', async () => {
      mockRepository.findById.mockResolvedValue({
        success: true,
        data: { ...sampleBid, status: 'new' },
      });

      // new → won (직접 전이 불가)
      const result = await updateBidStatus('bid-001' as never, 'won');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_TRANSITION');
      }
    });

    it('상태 전이 규칙 검증', async () => {
      // 각 상태에서의 유효한 전이 테스트
      const transitions = [
        { from: 'new', to: 'reviewing', valid: true },
        { from: 'new', to: 'cancelled', valid: true },
        { from: 'new', to: 'won', valid: false },
        { from: 'reviewing', to: 'preparing', valid: true },
        { from: 'preparing', to: 'submitted', valid: true },
        { from: 'submitted', to: 'won', valid: true },
        { from: 'submitted', to: 'lost', valid: true },
        { from: 'won', to: 'lost', valid: false },
        { from: 'lost', to: 'won', valid: false },
      ];

      for (const transition of transitions) {
        vi.clearAllMocks();
        mockRepository.findById.mockResolvedValue({
          success: true,
          data: { ...sampleBid, status: transition.from },
        });

        if (transition.valid) {
          mockRepository.updateStatus.mockResolvedValue({
            success: true,
            data: { ...sampleBid, status: transition.to },
          });
        }

        const result = await updateBidStatus('bid-001' as never, transition.to as never);

        expect(result.success).toBe(transition.valid);
      }
    });
  });

  describe('matchProductsForBid', () => {
    it('제품 매칭 성공', async () => {
      mockRepository.findById.mockResolvedValue({
        success: true,
        data: sampleBid,
      });

      const mockMatches = [
        { productId: 'prod-001', score: 85 },
      ];
      (matchProducts as ReturnType<typeof vi.fn>).mockReturnValue(mockMatches);

      const result = await matchProductsForBid('bid-001' as never);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bid.id).toBe('bid-001');
        expect(result.data.matches).toEqual(mockMatches);
      }
    });

    it('존재하지 않는 입찰 매칭 실패', async () => {
      mockRepository.findById.mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND' },
      });

      const result = await matchProductsForBid('nonexistent' as never);

      expect(result.success).toBe(false);
    });
  });

  describe('getDashboardStats', () => {
    it('대시보드 통계 조회', async () => {
      const mockBids = [
        { ...sampleBid, status: 'new', priority: 'high' },
        { ...sampleBid, id: 'bid-002', status: 'reviewing', priority: 'medium' },
        { ...sampleBid, id: 'bid-003', status: 'won', priority: 'high' },
        { ...sampleBid, id: 'bid-004', status: 'lost', priority: 'low' },
      ];

      mockRepository.findAll.mockResolvedValue({
        success: true,
        data: {
          items: mockBids,
          total: mockBids.length,
        },
      });

      const result = await getDashboardStats();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalBids).toBe(4);
        expect(result.data.byStatus.new).toBe(1);
        expect(result.data.byStatus.reviewing).toBe(1);
        expect(result.data.byStatus.won).toBe(1);
        expect(result.data.byStatus.lost).toBe(1);
        expect(result.data.highPriority).toBe(2);
        expect(result.data.wonRate).toBe(0.5); // 1 won / 2 completed
      }
    });

    it('데이터 없을 때 빈 통계', async () => {
      mockRepository.findAll.mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
        },
      });

      const result = await getDashboardStats();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalBids).toBe(0);
        expect(result.data.wonRate).toBe(0);
      }
    });
  });
});
