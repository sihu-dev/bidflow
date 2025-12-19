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
} from '@/types';

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
  findUpcoming(days: number): Promise<ApiResponse<BidData[]>>;
  updateStatus(id: UUID, status: BidStatus): Promise<ApiResponse<BidData>>;
  bulkCreate(data: CreateInput<BidData>[]): Promise<ApiResponse<{ created: number; failed: number }>>;
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

  // DB 레코드 → 도메인 엔티티 변환
  private mapToBidData(row: Record<string, unknown>): BidData {
    return {
      id: row.id as UUID,
      source: row.source as BidSource,
      externalId: row.external_id as string,
      title: row.title as string,
      organization: row.organization as string,
      deadline: row.deadline as string,
      estimatedAmount: row.estimated_amount ? BigInt(row.estimated_amount as string) : null,
      status: row.status as BidStatus,
      priority: row.priority as BidPriority,
      type: row.type as BidData['type'],
      keywords: (row.keywords as string[]) ?? [],
      url: row.url as string | null,
      rawData: (row.raw_data as BidData['rawData']) ?? {},
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    } as BidData;
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

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
  }

  bidRepositoryInstance = new SupabaseBidRepository(supabaseUrl, supabaseKey);
  return bidRepositoryInstance;
}
