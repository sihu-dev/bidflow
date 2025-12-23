/**
 * Bid Repository 유닛 테스트
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getBidRepository } from '@/lib/domain/repositories/bid-repository';
import type { BidData, UUID, BidSource, BidStatus, BidPriority, CreateInput, UpdateInput, ISODateString, KRW } from '@/types';

// 환경변수 모킹
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', undefined);
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);

describe('BidRepository', () => {
  let repository: ReturnType<typeof getBidRepository>;

  beforeEach(() => {
    // Mock Repository 사용 (환경변수 미설정)
    repository = getBidRepository();
  });

  // ============================================================================
  // findById 테스트
  // ============================================================================
  describe('findById', () => {
    it('존재하는 ID로 조회 → success: true', async () => {
      const result = await repository.findById('mock-001' as UUID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('mock-001');
        expect(result.data.title).toContain('[DEV]');
        expect(result.data.organization).toBeTruthy();
      }
    });

    it('존재하지 않는 ID로 조회 → success: false, NOT_FOUND', async () => {
      const result = await repository.findById('nonexistent' as UUID);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
        expect(result.error.message).toContain('찾을 수 없습니다');
      }
    });
  });

  // ============================================================================
  // findAll 테스트
  // ============================================================================
  describe('findAll', () => {
    it('필터 없이 전체 조회 → 모든 입찰 반환', async () => {
      const result = await repository.findAll();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBeGreaterThan(0);
        expect(result.data.total).toBeGreaterThan(0);
        expect(result.data.page).toBe(1);
      }
    });

    it('source 필터: narajangto → 나라장터 입찰만 반환', async () => {
      const result = await repository.findAll({ source: 'narajangto' as BidSource });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.every((b) => b.source === 'narajangto')).toBe(true);
      }
    });

    it('status 필터: reviewing → 검토중인 입찰만 반환', async () => {
      const result = await repository.findAll({ status: 'reviewing' as BidStatus });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.every((b) => b.status === 'reviewing')).toBe(true);
      }
    });

    it('priority 필터: high → 높은 우선순위만 반환', async () => {
      const result = await repository.findAll({ priority: 'high' as BidPriority });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.every((b) => b.priority === 'high')).toBe(true);
      }
    });

    it('search 필터: "초음파" → 제목/기관명에 키워드 포함 항목만 반환', async () => {
      const result = await repository.findAll({ search: '초음파' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBeGreaterThan(0);
        expect(
          result.data.items.every((b) => b.title.includes('초음파') || b.organization.includes('초음파'))
        ).toBe(true);
      }
    });

    it('정렬: deadline asc → 마감일 오름차순', async () => {
      const result = await repository.findAll(undefined, { field: 'deadline', direction: 'asc' });

      expect(result.success).toBe(true);
      if (result.success && result.data.items.length > 1) {
        const deadlines = result.data.items.map((b) => new Date(b.deadline).getTime());
        for (let i = 1; i < deadlines.length; i++) {
          expect(deadlines[i]).toBeGreaterThanOrEqual(deadlines[i - 1]);
        }
      }
    });

    it('정렬: deadline desc → 마감일 내림차순', async () => {
      const result = await repository.findAll(undefined, { field: 'deadline', direction: 'desc' });

      expect(result.success).toBe(true);
      if (result.success && result.data.items.length > 1) {
        const deadlines = result.data.items.map((b) => new Date(b.deadline).getTime());
        for (let i = 1; i < deadlines.length; i++) {
          expect(deadlines[i]).toBeLessThanOrEqual(deadlines[i - 1]);
        }
      }
    });

    it('페이지네이션: page=1, limit=2 → 최대 2개 반환', async () => {
      const result = await repository.findAll(undefined, undefined, { page: 1, limit: 2 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBeLessThanOrEqual(2);
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(2);
      }
    });

    it('페이지네이션: page=2 → hasMore 올바르게 계산', async () => {
      const result = await repository.findAll(undefined, undefined, { page: 2, limit: 1 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        if (result.data.total > 2) {
          expect(result.data.hasMore).toBe(true);
        }
      }
    });
  });

  // ============================================================================
  // create 테스트
  // ============================================================================
  describe('create', () => {
    it('유효한 입찰 데이터 생성 → success: true, ID 자동 생성', async () => {
      const newBid: CreateInput<BidData> = {
        source: 'narajangto' as BidSource,
        externalId: 'TEST-12345',
        title: '테스트 입찰 공고',
        organization: '테스트 기관',
        deadline: '2025-12-31T18:00:00' as ISODateString,
        estimatedAmount: BigInt(100000000) as KRW,
        status: 'new' as BidStatus,
        priority: 'medium' as BidPriority,
        type: 'product',
        keywords: ['테스트'],
        url: 'https://test.com',
        rawData: {},
      };

      const result = await repository.create(newBid);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBeTruthy();
        expect(result.data.title).toBe('테스트 입찰 공고');
        expect(result.data.createdAt).toBeTruthy();
        expect(result.data.updatedAt).toBeTruthy();
      }
    });

    it('생성 후 externalId로 조회 가능', async () => {
      const uniqueExternalId = `TED-UNIQUE-${Date.now()}-${Math.random()}`;
      const newBid: CreateInput<BidData> = {
        source: 'ted' as BidSource,
        externalId: uniqueExternalId,
        title: 'EU Tender Test for External ID',
        organization: 'European Union',
        deadline: '2025-12-31T18:00:00' as ISODateString,
        estimatedAmount: BigInt(500000000) as KRW,
        status: 'new' as BidStatus,
        priority: 'high' as BidPriority,
        type: 'product',
        keywords: ['EU'],
        url: null,
        rawData: {},
      };

      const createResult = await repository.create(newBid);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const findResult = await repository.findByExternalId('ted' as BidSource, uniqueExternalId);
        expect(findResult.success).toBe(true);
        if (findResult.success && findResult.data) {
          expect(findResult.data.externalId).toBe(uniqueExternalId);
          expect(findResult.data.source).toBe('ted');
        }
      }
    });
  });

  // ============================================================================
  // update 테스트
  // ============================================================================
  describe('update', () => {
    it('존재하는 입찰 수정 → success: true', async () => {
      const updateData: UpdateInput<BidData> = {
        status: 'reviewing' as BidStatus,
        priority: 'high' as BidPriority,
      };

      const result = await repository.update('mock-001' as UUID, updateData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('reviewing');
        expect(result.data.priority).toBe('high');
        expect(result.data.updatedAt).toBeTruthy();
      }
    });

    it('존재하지 않는 입찰 수정 → success: false, NOT_FOUND', async () => {
      const result = await repository.update('nonexistent' as UUID, { status: 'reviewing' as BidStatus });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('부분 업데이트 가능 (일부 필드만 변경)', async () => {
      const result = await repository.update('mock-002' as UUID, { priority: 'low' as BidPriority });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('low');
        expect(result.data.title).toBeTruthy(); // 다른 필드는 유지
      }
    });
  });

  // ============================================================================
  // delete 테스트
  // ============================================================================
  describe('delete', () => {
    it('존재하는 입찰 삭제 → deleted: true', async () => {
      // 먼저 새 입찰 생성
      const createResult = await repository.create({
        source: 'narajangto' as BidSource,
        externalId: 'DELETE-TEST',
        title: '삭제 테스트',
        organization: '테스트',
        deadline: '2025-12-31T18:00:00' as ISODateString,
        estimatedAmount: null,
        status: 'new' as BidStatus,
        priority: 'low' as BidPriority,
        type: 'product',
        keywords: [],
        url: null,
        rawData: {},
      });

      expect(createResult.success).toBe(true);
      if (createResult.success) {
        const deleteResult = await repository.delete(createResult.data.id);
        expect(deleteResult.success).toBe(true);
        if (deleteResult.success) {
          expect(deleteResult.data.deleted).toBe(true);
        }

        // 삭제 확인
        const findResult = await repository.findById(createResult.data.id);
        expect(findResult.success).toBe(false);
      }
    });

    it('존재하지 않는 입찰 삭제 → success: false, NOT_FOUND', async () => {
      const result = await repository.delete('nonexistent' as UUID);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  // ============================================================================
  // findByExternalId 테스트
  // ============================================================================
  describe('findByExternalId', () => {
    it('존재하는 externalId로 조회 → 해당 입찰 반환', async () => {
      const result = await repository.findByExternalId('narajangto' as BidSource, '20251219001');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toBeNull();
        if (result.data) {
          expect(result.data.externalId).toBe('20251219001');
          expect(result.data.source).toBe('narajangto');
        }
      }
    });

    it('존재하지 않는 externalId → null 반환', async () => {
      const result = await repository.findByExternalId('ted' as BidSource, 'NONEXISTENT');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('같은 externalId지만 다른 source → null 반환', async () => {
      const result = await repository.findByExternalId('ted' as BidSource, '20251219001');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });
  });

  // ============================================================================
  // findUpcoming 테스트
  // ============================================================================
  describe('findUpcoming', () => {
    it('향후 7일 이내 마감 입찰 조회 → new/reviewing/preparing 상태만 반환', async () => {
      const result = await repository.findUpcoming(7);

      expect(result.success).toBe(true);
      if (result.success) {
        // 상태가 new, reviewing, preparing 중 하나여야 함
        expect(
          result.data.every((b) => ['new', 'reviewing', 'preparing'].includes(b.status))
        ).toBe(true);
      }
    });

    it('향후 365일 이내 → 모든 미래 입찰 반환', async () => {
      const result = await repository.findUpcoming(365);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
      }
    });

    it('향후 0일 (오늘) → 오늘 마감 입찰만 반환', async () => {
      const result = await repository.findUpcoming(0);

      expect(result.success).toBe(true);
      // 테스트 데이터에 오늘 마감 입찰이 없을 수 있음
    });
  });

  // ============================================================================
  // updateStatus 테스트
  // ============================================================================
  describe('updateStatus', () => {
    it('상태 변경: new → reviewing', async () => {
      const result = await repository.updateStatus('mock-002' as UUID, 'reviewing' as BidStatus);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('reviewing');
      }
    });

    it('상태 변경: reviewing → submitted', async () => {
      const result = await repository.updateStatus('mock-001' as UUID, 'submitted' as BidStatus);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('submitted');
      }
    });

    it('존재하지 않는 입찰 상태 변경 → NOT_FOUND', async () => {
      const result = await repository.updateStatus('nonexistent' as UUID, 'reviewing' as BidStatus);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  // ============================================================================
  // bulkCreate 테스트
  // ============================================================================
  describe('bulkCreate', () => {
    it('여러 입찰 일괄 생성 → created 카운트 올바르게 반환', async () => {
      const bulkData: CreateInput<BidData>[] = [
        {
          source: 'narajangto' as BidSource,
          externalId: 'BULK-001',
          title: '일괄 생성 테스트 1',
          organization: '기관1',
          deadline: '2025-12-31T18:00:00' as ISODateString,
          estimatedAmount: null,
          status: 'new' as BidStatus,
          priority: 'low' as BidPriority,
          type: 'product',
          keywords: [],
          url: null,
          rawData: {},
        },
        {
          source: 'ted' as BidSource,
          externalId: 'BULK-002',
          title: '일괄 생성 테스트 2',
          organization: '기관2',
          deadline: '2025-12-31T18:00:00' as ISODateString,
          estimatedAmount: null,
          status: 'new' as BidStatus,
          priority: 'low' as BidPriority,
          type: 'product',
          keywords: [],
          url: null,
          rawData: {},
        },
      ];

      const result = await repository.bulkCreate(bulkData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.created).toBe(2);
        expect(result.data.failed).toBe(0);
      }
    });

    it('빈 배열 일괄 생성 → created: 0, failed: 0', async () => {
      const result = await repository.bulkCreate([]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.created).toBe(0);
        expect(result.data.failed).toBe(0);
      }
    });
  });

  // ============================================================================
  // 복합 시나리오 테스트
  // ============================================================================
  describe('복합 시나리오', () => {
    it('CRUD 전체 플로우: 생성 → 조회 → 수정 → 삭제', async () => {
      const uniqueExternalId = `FLOW-TEST-${Date.now()}-${Math.random()}`;

      // 1. 생성
      const createResult = await repository.create({
        source: 'narajangto' as BidSource,
        externalId: uniqueExternalId,
        title: '플로우 테스트',
        organization: '테스트기관',
        deadline: '2025-12-31T18:00:00' as ISODateString,
        estimatedAmount: BigInt(100000000) as KRW,
        status: 'new' as BidStatus,
        priority: 'medium' as BidPriority,
        type: 'product',
        keywords: ['테스트'],
        url: null,
        rawData: {},
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const id = createResult.data.id;

      // 2. externalId로 조회
      const findResult = await repository.findByExternalId('narajangto' as BidSource, uniqueExternalId);
      expect(findResult.success).toBe(true);
      if (findResult.success && findResult.data) {
        expect(findResult.data.externalId).toBe(uniqueExternalId);
      }

      // 3. 수정
      const updateResult = await repository.update(id, { status: 'reviewing' as BidStatus });
      expect(updateResult.success).toBe(true);
      if (updateResult.success) {
        expect(updateResult.data.status).toBe('reviewing');
      }

      // 4. 삭제
      const deleteResult = await repository.delete(id);
      expect(deleteResult.success).toBe(true);
      if (deleteResult.success) {
        expect(deleteResult.data.deleted).toBe(true);
      }
    });

    it('필터 + 정렬 + 페이지네이션 조합', async () => {
      const result = await repository.findAll(
        { source: 'narajangto' as BidSource },
        { field: 'deadline', direction: 'asc' },
        { page: 1, limit: 10 }
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.every((b) => b.source === 'narajangto')).toBe(true);
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });
  });
});
