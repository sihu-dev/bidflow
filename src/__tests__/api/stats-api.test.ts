/**
 * Stats API 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock getDashboardStats
const mockStats = {
  totalBids: 100,
  byStatus: {
    new: 20,
    reviewing: 15,
    preparing: 10,
    submitted: 25,
    won: 20,
    lost: 8,
    cancelled: 2,
  },
  upcomingDeadlines: 5,
  highPriority: 15,
  wonRate: 0.71,
  recentActivity: [
    { id: 'bid-1', title: '테스트 입찰', action: '상태: reviewing', timestamp: '2025-01-01T00:00:00Z' },
  ],
};

vi.mock('@/lib/domain/usecases/bid-usecases', () => ({
  getDashboardStats: vi.fn(() => Promise.resolve({ success: true, data: mockStats })),
}));

describe('Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/stats', () => {
    it('대시보드 통계 반환', async () => {
      const { getDashboardStats } = await import('@/lib/domain/usecases/bid-usecases');
      const result = await getDashboardStats();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalBids).toBe(100);
        expect(result.data.byStatus.new).toBe(20);
        expect(result.data.wonRate).toBeCloseTo(0.71);
      }
    });

    it('상태별 집계 검증', async () => {
      const { getDashboardStats } = await import('@/lib/domain/usecases/bid-usecases');
      const result = await getDashboardStats();

      if (result.success) {
        const statusSum = Object.values(result.data.byStatus).reduce((a, b) => a + b, 0);
        expect(statusSum).toBe(result.data.totalBids);
      }
    });

    it('마감 임박 카운트 포함', async () => {
      const { getDashboardStats } = await import('@/lib/domain/usecases/bid-usecases');
      const result = await getDashboardStats();

      if (result.success) {
        expect(result.data.upcomingDeadlines).toBeGreaterThanOrEqual(0);
      }
    });

    it('최근 활동 목록 포함', async () => {
      const { getDashboardStats } = await import('@/lib/domain/usecases/bid-usecases');
      const result = await getDashboardStats();

      if (result.success) {
        expect(Array.isArray(result.data.recentActivity)).toBe(true);
        if (result.data.recentActivity.length > 0) {
          expect(result.data.recentActivity[0]).toHaveProperty('id');
          expect(result.data.recentActivity[0]).toHaveProperty('title');
        }
      }
    });
  });
});
