/**
 * @module domain/repositories/bid-repository
 * @description 입찰 데이터 Repository (데이터 접근 추상화)
 */

import { createServerClient } from '@supabase/ssr';
import type {
  BidData,
  UUID,
  BidStatus,
  BidSource,
  BidPriority,
  PaginatedResult,
  ApiResponse,
  CreateInput,
  UpdateInput,
  ISODateString,
  KRW,
} from '@/types';

// ============================================================================
// 개발 모드 감지
// ============================================================================

const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================================================
// Repository 인터페이스
// ============================================================================

export interface BidFilters {
  source?: BidSource;
  status?: BidStatus;
  priority?: BidPriority;
  search?: string;
  fromDate?: string;
  toDate?: string;
  organizationLike?: string;
}

export interface BidSortOptions {
  field: 'deadline' | 'createdAt' | 'estimatedAmount' | 'priority';
  direction: 'asc' | 'desc';
}

export interface IBidRepository {
  findById(id: UUID): Promise<ApiResponse<BidData>>;
  findAll(
    filters?: BidFilters,
    sort?: BidSortOptions,
    pagination?: { page: number; limit: number }
  ): Promise<ApiResponse<PaginatedResult<BidData>>>;
  create(data: CreateInput<BidData>): Promise<ApiResponse<BidData>>;
  update(id: UUID, data: UpdateInput<BidData>): Promise<ApiResponse<BidData>>;
  delete(id: UUID): Promise<ApiResponse<{ deleted: boolean }>>;
  findByExternalId(source: BidSource, externalId: string): Promise<ApiResponse<BidData | null>>;
  findByExternalIds(source: BidSource, externalIds: string[]): Promise<ApiResponse<BidData[]>>;
  findUpcoming(days: number): Promise<ApiResponse<BidData[]>>;
  updateStatus(id: UUID, status: BidStatus): Promise<ApiResponse<BidData>>;
  bulkCreate(data: CreateInput<BidData>[]): Promise<ApiResponse<{ created: number; failed: number }>>;
  getStats(): Promise<ApiResponse<{
    totalBids: number;
    byStatus: Record<BidStatus, number>;
    upcomingDeadlines: number;
    highPriority: number;
    wonRate: number;
  }>>;
}

// ============================================================================
// Supabase 기반 Repository 구현
// ============================================================================

export class SupabaseBidRepository implements IBidRepository {
  private supabase: ReturnType<typeof createServerClient>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    });
  }

  async findById(id: UUID): Promise<ApiResponse<BidData>> {
    try {
      const { data, error } = await this.supabase
        .from('bids')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: '입찰 공고를 찾을 수 없습니다' },
        };
      }

      return { success: true, data: this.mapToBidData(data) };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  async findAll(
    filters?: BidFilters,
    sort?: BidSortOptions,
    pagination?: { page: number; limit: number }
  ): Promise<ApiResponse<PaginatedResult<BidData>>> {
    try {
      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 20;
      const offset = (page - 1) * limit;

      let query = this.supabase.from('bids').select('*', { count: 'exact' });

      // 필터 적용
      if (filters?.source) {
        query = query.eq('source', filters.source);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,organization.ilike.%${filters.search}%`);
      }
      if (filters?.fromDate) {
        query = query.gte('deadline', filters.fromDate);
      }
      if (filters?.toDate) {
        query = query.lte('deadline', filters.toDate);
      }
      if (filters?.organizationLike) {
        query = query.ilike('organization', `%${filters.organizationLike}%`);
      }

      // 정렬 적용
      const sortField = sort?.field ?? 'deadline';
      const sortDirection = sort?.direction ?? 'asc';
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // 페이지네이션
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return {
          success: false,
          error: { code: 'DB_ERROR', message: error.message },
        };
      }

      const items = (data ?? []).map(this.mapToBidData);
      const total = count ?? 0;

      return {
        success: true,
        data: {
          items,
          total,
          page,
          limit,
          hasMore: offset + items.length < total,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  async create(input: CreateInput<BidData>): Promise<ApiResponse<BidData>> {
    try {
      const { data, error } = await this.supabase
        .from('bids')
        .insert({
          ...input,
          estimated_amount: input.estimatedAmount?.toString(),
          raw_data: input.rawData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: { code: 'CREATE_FAILED', message: error.message },
        };
      }

      return { success: true, data: this.mapToBidData(data) };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  async update(id: UUID, input: UpdateInput<BidData>): Promise<ApiResponse<BidData>> {
    try {
      const updateData: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      if (input.estimatedAmount !== undefined) {
        updateData.estimated_amount = input.estimatedAmount?.toString();
        delete updateData.estimatedAmount;
      }
      if (input.rawData !== undefined) {
        updateData.raw_data = input.rawData;
        delete updateData.rawData;
      }

      const { data, error } = await this.supabase
        .from('bids')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: { code: 'UPDATE_FAILED', message: error.message },
        };
      }

      return { success: true, data: this.mapToBidData(data) };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  async delete(id: UUID): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const { error } = await this.supabase.from('bids').delete().eq('id', id);

      if (error) {
        return {
          success: false,
          error: { code: 'DELETE_FAILED', message: error.message },
        };
      }

      return { success: true, data: { deleted: true } };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  async findByExternalId(source: BidSource, externalId: string): Promise<ApiResponse<BidData | null>> {
    try {
      const { data, error } = await this.supabase
        .from('bids')
        .select('*')
        .eq('source', source)
        .eq('external_id', externalId)
        .maybeSingle();

      if (error) {
        return {
          success: false,
          error: { code: 'DB_ERROR', message: error.message },
        };
      }

      return { success: true, data: data ? this.mapToBidData(data) : null };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  async findByExternalIds(source: BidSource, externalIds: string[]): Promise<ApiResponse<BidData[]>> {
    try {
      if (externalIds.length === 0) {
        return { success: true, data: [] };
      }

      const { data, error } = await this.supabase
        .from('bids')
        .select('*')
        .eq('source', source)
        .in('external_id', externalIds);

      if (error) {
        return {
          success: false,
          error: { code: 'DB_ERROR', message: error.message },
        };
      }

      return { success: true, data: (data ?? []).map(this.mapToBidData) };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  async findUpcoming(days: number): Promise<ApiResponse<BidData[]>> {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await this.supabase
        .from('bids')
        .select('*')
        .gte('deadline', today.toISOString())
        .lte('deadline', futureDate.toISOString())
        .in('status', ['new', 'reviewing', 'preparing'])
        .order('deadline', { ascending: true });

      if (error) {
        return {
          success: false,
          error: { code: 'DB_ERROR', message: error.message },
        };
      }

      return { success: true, data: (data ?? []).map(this.mapToBidData) };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  async updateStatus(id: UUID, status: BidStatus): Promise<ApiResponse<BidData>> {
    return this.update(id, { status });
  }

  async bulkCreate(
    inputs: CreateInput<BidData>[]
  ): Promise<ApiResponse<{ created: number; failed: number }>> {
    try {
      const rows = inputs.map((input) => ({
        ...input,
        estimated_amount: input.estimatedAmount?.toString(),
        raw_data: input.rawData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await this.supabase.from('bids').insert(rows).select();

      if (error) {
        return {
          success: false,
          error: { code: 'BULK_CREATE_FAILED', message: error.message },
        };
      }

      return {
        success: true,
        data: { created: data?.length ?? 0, failed: inputs.length - (data?.length ?? 0) },
      };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  async getStats(): Promise<ApiResponse<{
    totalBids: number;
    byStatus: Record<BidStatus, number>;
    upcomingDeadlines: number;
    highPriority: number;
    wonRate: number;
  }>> {
    try {
      // 전체 입찰 수 (단일 쿼리)
      const { count: totalBids, error: countError } = await this.supabase
        .from('bids')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        return {
          success: false,
          error: { code: 'DB_ERROR', message: countError.message },
        };
      }

      // 상태별 집계 (GROUP BY 쿼리)
      const { data: statusData, error: statusError } = await this.supabase
        .rpc('get_bids_by_status');

      if (statusError) {
        // RPC 함수가 없으면 fallback (JavaScript 집계)
        const { data: allBids } = await this.supabase.from('bids').select('status');
        const byStatus = (allBids ?? []).reduce(
          (acc, bid) => {
            const status = bid.status as BidStatus;
            acc[status] = (acc[status] ?? 0) + 1;
            return acc;
          },
          {} as Record<BidStatus, number>
        );

        // 마감 임박 (7일 이내)
        const today = new Date();
        const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const { count: upcomingCount } = await this.supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .gte('deadline', today.toISOString())
          .lte('deadline', sevenDaysLater.toISOString())
          .not('status', 'in', '(won,lost,cancelled)');

        // 높은 우선순위
        const { count: highPriorityCount } = await this.supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('priority', 'high');

        // 낙찰률
        const { count: wonCount } = await this.supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'won');

        const { count: lostCount } = await this.supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'lost');

        const completedCount = (wonCount ?? 0) + (lostCount ?? 0);
        const wonRate = completedCount > 0 ? (wonCount ?? 0) / completedCount : 0;

        return {
          success: true,
          data: {
            totalBids: totalBids ?? 0,
            byStatus,
            upcomingDeadlines: upcomingCount ?? 0,
            highPriority: highPriorityCount ?? 0,
            wonRate,
          },
        };
      }

      // RPC 함수 사용 (추후 구현)
      return {
        success: true,
        data: {
          totalBids: totalBids ?? 0,
          byStatus: statusData as Record<BidStatus, number>,
          upcomingDeadlines: 0,
          highPriority: 0,
          wonRate: 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: { code: 'DB_ERROR', message: String(error) },
      };
    }
  }

  // DB 레코드 → 도메인 엔티티 변환
  private mapToBidData(row: Record<string, unknown>): BidData {
    return {
      id: row.id as UUID,
      source: row.source as BidSource,
      externalId: row.external_id as string,
      title: row.title as string,
      organization: row.organization as string,
      deadline: row.deadline as ISODateString,
      estimatedAmount: row.estimated_amount ? BigInt(row.estimated_amount as string) as KRW : null,
      status: row.status as BidStatus,
      priority: row.priority as BidPriority,
      type: row.type as BidData['type'],
      keywords: (row.keywords as string[]) ?? [],
      url: row.url as string | null,
      rawData: (row.raw_data as BidData['rawData']) ?? {},
      createdAt: row.created_at as ISODateString,
      updatedAt: row.updated_at as ISODateString,
    } as BidData;
  }
}

// ============================================================================
// 개발용 Mock Repository
// ============================================================================

const MOCK_BIDS: BidData[] = [
  {
    id: 'mock-001' as UUID,
    source: 'narajangto' as BidSource,
    externalId: '20251219001',
    title: '[DEV] 서울시 상수도사업본부 초음파유량계 구매',
    organization: '서울특별시 상수도사업본부',
    deadline: '2025-01-15T18:00:00' as ISODateString,
    estimatedAmount: BigInt(450000000) as KRW,
    status: 'reviewing' as BidStatus,
    priority: 'high' as BidPriority,
    type: 'product',
    keywords: ['초음파유량계', '상수도', '계측기'],
    url: 'https://www.g2b.go.kr/...',
    rawData: {},
    createdAt: '2024-12-19T10:00:00' as ISODateString,
    updatedAt: '2024-12-19T10:00:00' as ISODateString,
  },
  {
    id: 'mock-002' as UUID,
    source: 'narajangto' as BidSource,
    externalId: '20251219002',
    title: '[DEV] K-water 정수장 전자유량계 교체 공사',
    organization: '한국수자원공사',
    deadline: '2025-01-20T17:00:00' as ISODateString,
    estimatedAmount: BigInt(280000000) as KRW,
    status: 'new' as BidStatus,
    priority: 'medium' as BidPriority,
    type: 'product',
    keywords: ['전자유량계', '정수장'],
    url: 'https://www.g2b.go.kr/...',
    rawData: {},
    createdAt: '2024-12-19T11:00:00' as ISODateString,
    updatedAt: '2024-12-19T11:00:00' as ISODateString,
  },
  {
    id: 'mock-003' as UUID,
    source: 'ted' as BidSource,
    externalId: 'TED-2025-12345',
    title: '[DEV] Water Flow Meters for Municipal Water Supply - Berlin',
    organization: 'Berliner Wasserbetriebe',
    deadline: '2025-02-01T12:00:00' as ISODateString,
    estimatedAmount: BigInt(850000000) as KRW,
    status: 'preparing' as BidStatus,
    priority: 'high' as BidPriority,
    type: 'product',
    keywords: ['유량계', 'EU', '상수도'],
    url: 'https://ted.europa.eu/...',
    rawData: {},
    createdAt: '2024-12-18T09:00:00' as ISODateString,
    updatedAt: '2024-12-19T08:00:00' as ISODateString,
  },
];

class MockBidRepository implements IBidRepository {
  private bids: BidData[] = [...MOCK_BIDS];

  async findById(id: UUID): Promise<ApiResponse<BidData>> {
    const bid = this.bids.find((b) => b.id === id);
    if (!bid) {
      return { success: false, error: { code: 'NOT_FOUND', message: '입찰 공고를 찾을 수 없습니다' } };
    }
    return { success: true, data: bid };
  }

  async findAll(
    filters?: BidFilters,
    sort?: BidSortOptions,
    pagination?: { page: number; limit: number }
  ): Promise<ApiResponse<PaginatedResult<BidData>>> {
    let items = [...this.bids];

    // 필터 적용
    if (filters?.source) items = items.filter((b) => b.source === filters.source);
    if (filters?.status) items = items.filter((b) => b.status === filters.status);
    if (filters?.priority) items = items.filter((b) => b.priority === filters.priority);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      items = items.filter((b) => b.title.toLowerCase().includes(s) || b.organization.toLowerCase().includes(s));
    }

    // 정렬
    if (sort) {
      items.sort((a, b) => {
        const av = a[sort.field === 'createdAt' ? 'createdAt' : sort.field];
        const bv = b[sort.field === 'createdAt' ? 'createdAt' : sort.field];
        if (av === null) return 1;
        if (bv === null) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;
    const paged = items.slice(offset, offset + limit);

    return {
      success: true,
      data: { items: paged, total: items.length, page, limit, hasMore: offset + paged.length < items.length },
    };
  }

  async create(data: CreateInput<BidData>): Promise<ApiResponse<BidData>> {
    const newBid: BidData = {
      ...data,
      id: `mock-${Date.now()}` as UUID,
      createdAt: new Date().toISOString() as ISODateString,
      updatedAt: new Date().toISOString() as ISODateString,
    } as BidData;
    this.bids.push(newBid);
    return { success: true, data: newBid };
  }

  async update(id: UUID, data: UpdateInput<BidData>): Promise<ApiResponse<BidData>> {
    const idx = this.bids.findIndex((b) => b.id === id);
    if (idx === -1) {
      return { success: false, error: { code: 'NOT_FOUND', message: '입찰 공고를 찾을 수 없습니다' } };
    }
    this.bids[idx] = { ...this.bids[idx], ...data, updatedAt: new Date().toISOString() as ISODateString };
    return { success: true, data: this.bids[idx] };
  }

  async delete(id: UUID): Promise<ApiResponse<{ deleted: boolean }>> {
    const idx = this.bids.findIndex((b) => b.id === id);
    if (idx === -1) {
      return { success: false, error: { code: 'NOT_FOUND', message: '입찰 공고를 찾을 수 없습니다' } };
    }
    this.bids.splice(idx, 1);
    return { success: true, data: { deleted: true } };
  }

  async findByExternalId(source: BidSource, externalId: string): Promise<ApiResponse<BidData | null>> {
    const bid = this.bids.find((b) => b.source === source && b.externalId === externalId);
    return { success: true, data: bid ?? null };
  }

  async findByExternalIds(source: BidSource, externalIds: string[]): Promise<ApiResponse<BidData[]>> {
    const bids = this.bids.filter((b) => b.source === source && externalIds.includes(b.externalId));
    return { success: true, data: bids };
  }

  async findUpcoming(days: number): Promise<ApiResponse<BidData[]>> {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const upcoming = this.bids.filter((b) => {
      const d = new Date(b.deadline);
      return d >= now && d <= future && ['new', 'reviewing', 'preparing'].includes(b.status);
    });
    return { success: true, data: upcoming };
  }

  async updateStatus(id: UUID, status: BidStatus): Promise<ApiResponse<BidData>> {
    return this.update(id, { status });
  }

  async bulkCreate(data: CreateInput<BidData>[]): Promise<ApiResponse<{ created: number; failed: number }>> {
    let created = 0;
    for (const d of data) {
      const res = await this.create(d);
      if (res.success) created++;
    }
    return { success: true, data: { created, failed: data.length - created } };
  }

  async getStats(): Promise<ApiResponse<{
    totalBids: number;
    byStatus: Record<BidStatus, number>;
    upcomingDeadlines: number;
    highPriority: number;
    wonRate: number;
  }>> {
    const byStatus = this.bids.reduce(
      (acc, bid) => {
        acc[bid.status] = (acc[bid.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<BidStatus, number>
    );

    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = this.bids.filter((bid) => {
      const deadline = new Date(bid.deadline);
      return deadline >= now && deadline <= sevenDaysLater && !['won', 'lost', 'cancelled'].includes(bid.status);
    }).length;

    const highPriority = this.bids.filter((bid) => bid.priority === 'high').length;

    const completed = this.bids.filter((bid) => ['won', 'lost'].includes(bid.status));
    const wonRate = completed.length > 0
      ? this.bids.filter((bid) => bid.status === 'won').length / completed.length
      : 0;

    return {
      success: true,
      data: {
        totalBids: this.bids.length,
        byStatus,
        upcomingDeadlines,
        highPriority,
        wonRate,
      },
    };
  }
}

// ============================================================================
// Repository 팩토리
// ============================================================================

let bidRepositoryInstance: IBidRepository | null = null;

export function getBidRepository(): IBidRepository {
  if (bidRepositoryInstance) {
    return bidRepositoryInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 개발 모드에서 환경 변수 미설정 시 Mock 사용
  if (!supabaseUrl || !supabaseKey) {
    if (isDevelopment) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[DEV] Supabase 미설정 - Mock Repository 사용');
      }
      bidRepositoryInstance = new MockBidRepository();
      return bidRepositoryInstance;
    }
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
  }

  bidRepositoryInstance = new SupabaseBidRepository(supabaseUrl, supabaseKey);
  return bidRepositoryInstance;
}
