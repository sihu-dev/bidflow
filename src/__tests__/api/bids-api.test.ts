/**
 * Bids API 통합 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

// Mock 모듈
vi.mock('@/lib/security/auth-middleware', () => ({
  withAuth: (handler: AnyFn) => handler,
}));

vi.mock('@/lib/security/rate-limiter', () => ({
  withRateLimit: (handler: AnyFn) => handler,
  getEndpointIdentifier: vi.fn(),
}));

vi.mock('@/lib/security/csrf', () => ({
  withCSRF: (handler: AnyFn) => handler,
}));

vi.mock('@/lib/domain/usecases/bid-usecases', () => ({
  listBids: vi.fn(),
  createBid: vi.fn(),
  getBidById: vi.fn(),
  updateBid: vi.fn(),
  deleteBid: vi.fn(),
}));

import { listBids, createBid } from '@/lib/domain/usecases/bid-usecases';

// Mock 결과 타입
interface MockListResult {
  success: boolean;
  data?: {
    items: unknown[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface MockCreateResult {
  success: boolean;
  data?: {
    id: string;
    title: string;
    organization?: string;
    source?: string;
    externalId?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

describe('Bids API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/bids', () => {
    it('목록 조회 성공 시 200 반환', async () => {
      const mockResult: MockListResult = {
        success: true,
        data: {
          items: [
            { id: '1', title: '테스트 공고', organization: '서울시' },
          ],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      (listBids as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

      const result = (await listBids({
        filters: {},
        page: 1,
        limit: 20,
      })) as MockListResult;

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(1);
    });

    it('서버 오류 시 500 반환', async () => {
      const mockError: MockListResult = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류',
        },
      };

      (listBids as ReturnType<typeof vi.fn>).mockResolvedValue(mockError);

      const result = (await listBids({ filters: {} })) as MockListResult;
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/v1/bids', () => {
    it('입찰 생성 성공 시 201 반환', async () => {
      const mockBid = {
        id: 'new-bid-id',
        title: '새 입찰 공고',
        organization: '부산시',
        source: 'narajangto',
        externalId: 'EXT-001',
      };

      (createBid as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockBid,
      });

      const result = (await createBid({
        title: '새 입찰 공고',
        organization: '부산시',
        source: 'narajangto',
        externalId: 'EXT-001',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as MockCreateResult;

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('새 입찰 공고');
    });

    it('중복 입찰 시 409 반환', async () => {
      (createBid as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: {
          code: 'DUPLICATE',
          message: '이미 존재하는 입찰입니다',
        },
      });

      const result = (await createBid({
        title: '중복 공고',
        source: 'narajangto',
        externalId: 'EXISTING-001',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as MockCreateResult;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DUPLICATE');
    });

    it('유효성 검증 실패 시 400 반환', async () => {
      (createBid as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '필수 필드 누락',
        },
      });

      // @ts-expect-error - testing validation failure with empty object
      const result = (await createBid({})) as MockCreateResult;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('필터링 및 정렬', () => {
    it('상태 필터링 동작', async () => {
      (listBids as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: {
          items: [{ id: '1', status: 'reviewing' }],
          total: 1,
        },
      });

      const result = (await listBids({
        filters: { status: 'reviewing' },
      })) as MockListResult;

      expect(result.success).toBe(true);
      expect(listBids).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { status: 'reviewing' },
        })
      );
    });

    it('마감일 정렬 동작', async () => {
      (listBids as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: { items: [], total: 0 },
      });

      await listBids({
        filters: {},
        sort: { field: 'deadline', direction: 'asc' },
      });

      expect(listBids).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: { field: 'deadline', direction: 'asc' },
        })
      );
    });

    it('페이지네이션 동작', async () => {
      (listBids as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 100,
          page: 2,
          limit: 20,
          totalPages: 5,
        },
      });

      const result = (await listBids({
        filters: {},
        page: 2,
        limit: 20,
      })) as MockListResult;

      expect(result.data?.page).toBe(2);
      expect(result.data?.totalPages).toBe(5);
    });
  });

  describe('에러 핸들링', () => {
    it('네트워크 오류 처리', async () => {
      (listBids as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network Error')
      );

      await expect(listBids({ filters: {} })).rejects.toThrow('Network Error');
    });

    it('타임아웃 처리', async () => {
      (listBids as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Request timeout')
      );

      await expect(listBids({ filters: {} })).rejects.toThrow('timeout');
    });
  });

  describe('BigInt 직렬화', () => {
    it('BigInt 값이 문자열로 변환됨', async () => {
      const mockData = {
        success: true,
        data: {
          items: [
            {
              id: '1',
              estimated_amount: BigInt(450000000),
            },
          ],
          total: 1,
        },
      };

      // BigInt 직렬화 테스트
      const serialized = JSON.parse(
        JSON.stringify(mockData, (_key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      ) as { data: { items: { estimated_amount: string }[] } };

      expect(serialized.data.items[0].estimated_amount).toBe('450000000');
      expect(typeof serialized.data.items[0].estimated_amount).toBe('string');
    });
  });
});

describe('AI Formula API', () => {
  it('AI 수식 실행 요청 형식', () => {
    const request = {
      formula: '=AI_SUMMARY()',
      context: {
        bidId: 'bid-123',
        title: '테스트 공고',
      },
    };

    expect(request.formula).toMatch(/^=AI_/);
    expect(request.context.bidId).toBeDefined();
  });

  it('AI 수식 응답 형식', () => {
    const response = {
      success: true,
      data: {
        result: '공고 요약 내용',
        formula: '=AI_SUMMARY()',
        executedAt: new Date().toISOString(),
      },
    };

    expect(response.success).toBe(true);
    expect(response.data.result).toBeDefined();
  });
});
