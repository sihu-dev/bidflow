/**
 * @package @forge-labs/types/bidding
 * @description 입찰 자동화 시스템 타입 정의 (L0 - Atoms)
 * @version 1.0.0
 */

// ============================================================================
// Branded Types (타입 안전성 강화)
// ============================================================================

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

/** UUID 타입 (문자열이지만 UUID임을 보장) */
export type UUID = Brand<string, 'UUID'>;

/** 확률 타입 (0-1 범위) */
export type Probability = Brand<number, 'Probability'>;

/** 한국 원화 (BigInt로 정밀도 보장) */
export type KRW = Brand<bigint, 'KRW'>;

/** 날짜 문자열 (ISO 8601) */
export type ISODateString = Brand<string, 'ISODateString'>;

// ============================================================================
// Literal Union Types (리터럴 유니온)
// ============================================================================

/** 입찰 데이터 소스 */
export type BidSource =
  | 'narajangto'      // 나라장터
  | 'kepco'           // 한전
  | 'kwater'          // 수자원공사
  | 'koroad'          // 도로공사
  | 'lh'              // LH공사
  | 'korail'          // 철도공단
  | 'kogas'           // 가스공사
  | 'khnp'            // 원자력발전
  | 'ted'             // TED (유럽)
  | 'ungm'            // UNGM (유엔)
  | 'sam'             // SAM.gov (미국)
  | 'kotra'           // KOTRA
  | 'custom'          // 커스텀
  | 'manual';         // 수동 입력

/** 입찰 상태 */
export type BidStatus =
  | 'new'             // 신규 발견
  | 'reviewing'       // 검토 중
  | 'preparing'       // 제안서 작성 중
  | 'submitted'       // 제출 완료
  | 'won'             // 낙찰
  | 'lost'            // 탈락
  | 'cancelled';      // 취소됨

/** 입찰 우선순위 */
export type BidPriority = 'high' | 'medium' | 'low';

/** 입찰 유형 */
export type BidType =
  | 'product'         // 물품
  | 'service'         // 용역
  | 'construction'    // 공사
  | 'facility';       // 시설

/** AI 셀 상태 */
export type AICellStatus =
  | 'idle'            // 대기
  | 'computing'       // 계산 중
  | 'complete'        // 완료
  | 'error';          // 오류

/** 매칭 신뢰도 등급 */
export type MatchConfidence =
  | 'very_high'       // 90%+
  | 'high'            // 70-89%
  | 'medium'          // 50-69%
  | 'low';            // 50% 미만

// ============================================================================
// Core Entities (핵심 엔티티)
// ============================================================================

/** 입찰 공고 데이터 */
export interface BidData {
  readonly id: UUID;
  readonly source: BidSource;
  readonly externalId: string;
  readonly title: string;
  readonly organization: string;
  readonly deadline: ISODateString;
  readonly estimatedAmount: KRW | null;
  readonly status: BidStatus;
  readonly priority: BidPriority;
  readonly type: BidType;
  readonly keywords: readonly string[];
  readonly url: string | null;
  readonly rawData: BidRawData;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

/** 원본 크롤링 데이터 */
export interface BidRawData {
  readonly requirements?: string;
  readonly qualifications?: string;
  readonly contactInfo?: string;
  readonly attachments?: readonly BidAttachment[];
  readonly pipeSize?: string;
  readonly specifications?: string;
  readonly [key: string]: unknown;
}

/** 첨부 파일 */
export interface BidAttachment {
  readonly name: string;
  readonly url: string;
  readonly size: number;
  readonly mimeType: string;
}

/** 파이프라인 엔트리 */
export interface BidPipelineEntry {
  readonly id: UUID;
  readonly bidId: UUID;
  readonly stage: BidStatus;
  readonly assignedTo: UUID | null;
  readonly notes: string;
  readonly dueDate: ISODateString | null;
  readonly matchScore: Probability;
  readonly matchedProducts: readonly ProductMatch[];
  readonly aiSummary: string | null;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ============================================================================
// Product Matching (제품 매칭)
// ============================================================================

/** 제품 매칭 결과 */
export interface ProductMatch {
  readonly productId: string;
  readonly productName: string;
  readonly score: number;
  readonly confidence: MatchConfidence;
  readonly reasons: readonly string[];
  readonly requirementsMatch: readonly string[];
  readonly requirementsGap: readonly string[];
}

/** 제품 매칭 규칙 */
export interface ProductRule {
  readonly product: string;
  readonly keywords: readonly string[];
  readonly organizations: readonly string[];
  readonly pipeSize?: {
    readonly min: number;
    readonly max: number;
  };
  readonly priority: number;
}

// ============================================================================
// AI Cell Functions (AI 셀 함수)
// ============================================================================

/** AI 함수 타입 */
export type AIFunctionType =
  | 'AI'              // 범용 AI 질의
  | 'AI_SUMMARY'      // 요약
  | 'AI_EXTRACT'      // 정보 추출
  | 'AI_SCORE'        // 점수 계산
  | 'AI_PROPOSAL'     // 제안서 생성
  | 'AI_PRICE';       // 가격 추천

/** AI 함수 호출 */
export interface AIFunctionCall {
  readonly type: AIFunctionType;
  readonly cellRef: string;
  readonly arguments: readonly string[];
  readonly context?: Record<string, unknown>;
}

/** AI 함수 결과 */
export interface AIFunctionResult {
  readonly success: boolean;
  readonly value: unknown;
  readonly metadata: {
    readonly tokensUsed: number;
    readonly latencyMs: number;
    readonly model: string;
  };
  readonly error?: string;
}

// ============================================================================
// Spreadsheet (스프레드시트)
// ============================================================================

/** 시트 정의 */
export interface SheetDefinition {
  readonly id: UUID;
  readonly name: string;
  readonly columns: readonly ColumnDefinition[];
  readonly defaultView: 'spreadsheet' | 'kanban' | 'calendar';
  readonly filters: readonly FilterDefinition[];
  readonly sorts: readonly SortDefinition[];
}

/** 컬럼 정의 */
export interface ColumnDefinition {
  readonly id: string;
  readonly name: string;
  readonly type: 'text' | 'number' | 'date' | 'select' | 'ai' | 'formula';
  readonly width: number;
  readonly required: boolean;
  readonly options?: readonly string[];
  readonly formula?: string;
}

/** 필터 정의 */
export interface FilterDefinition {
  readonly columnId: string;
  readonly operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'startsWith';
  readonly value: unknown;
}

/** 정렬 정의 */
export interface SortDefinition {
  readonly columnId: string;
  readonly direction: 'asc' | 'desc';
}

/** 셀 데이터 */
export interface CellData {
  readonly sheetId: UUID;
  readonly row: number;
  readonly col: number;
  readonly value: unknown;
  readonly formula?: string;
  readonly aiStatus?: AICellStatus;
  readonly aiResult?: AIFunctionResult;
  readonly updatedAt: ISODateString;
}

// ============================================================================
// Crawling (크롤링)
// ============================================================================

/** 크롤링 작업 */
export interface CrawlJob {
  readonly id: UUID;
  readonly source: BidSource;
  readonly status: 'pending' | 'running' | 'completed' | 'failed';
  readonly startedAt: ISODateString | null;
  readonly completedAt: ISODateString | null;
  readonly itemsFound: number;
  readonly itemsProcessed: number;
  readonly errors: readonly CrawlError[];
}

/** 크롤링 오류 */
export interface CrawlError {
  readonly code: string;
  readonly message: string;
  readonly url?: string;
  readonly timestamp: ISODateString;
}

/** 크롤링 설정 */
export interface CrawlConfig {
  readonly source: BidSource;
  readonly enabled: boolean;
  readonly schedule: string;  // Cron expression
  readonly maxPages: number;
  readonly retryCount: number;
  readonly timeout: number;   // ms
}

// ============================================================================
// API Response (API 응답)
// ============================================================================

/** 성공 응답 */
export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: {
    readonly page?: number;
    readonly limit?: number;
    readonly total?: number;
  };
}

/** 에러 응답 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
  };
}

/** API 응답 타입 (Result 패턴) */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Notification (알림)
// ============================================================================

/** 알림 유형 */
export type NotificationType =
  | 'new_bid'         // 신규 입찰 발견
  | 'deadline_soon'   // 마감 임박
  | 'status_change'   // 상태 변경
  | 'ai_complete';    // AI 처리 완료

/** 알림 채널 */
export type NotificationChannel = 'email' | 'kakao' | 'slack' | 'webhook';

/** 알림 설정 */
export interface NotificationConfig {
  readonly channel: NotificationChannel;
  readonly enabled: boolean;
  readonly types: readonly NotificationType[];
  readonly config: Record<string, unknown>;
}

// ============================================================================
// Utility Types (유틸리티 타입)
// ============================================================================

/** 생성 시 필요한 필드만 추출 */
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/** 업데이트 시 부분 필드 */
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt'>>;

/** 페이지네이션 파라미터 */
export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

/** 페이지네이션 결과 */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasMore: boolean;
}

// ============================================================================
// Type Guards (타입 가드)
// ============================================================================

export function isUUID(value: unknown): value is UUID {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isProbability(value: unknown): value is Probability {
  return typeof value === 'number' && value >= 0 && value <= 1;
}

export function isISODateString(value: unknown): value is ISODateString {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// ============================================================================
// Factory Functions (팩토리 함수)
// ============================================================================

export function createUUID(value: string): UUID {
  if (!isUUID(value)) {
    throw new Error(`Invalid UUID: ${value}`);
  }
  return value as UUID;
}

export function createProbability(value: number): Probability {
  if (!isProbability(value)) {
    throw new Error(`Invalid Probability: ${value}. Must be between 0 and 1`);
  }
  return value as Probability;
}

export function createKRW(value: bigint): KRW {
  return value as KRW;
}

export function createISODateString(value: string | Date): ISODateString {
  const dateStr = value instanceof Date ? value.toISOString() : value;
  if (!isISODateString(dateStr)) {
    throw new Error(`Invalid ISO Date String: ${value}`);
  }
  return dateStr as ISODateString;
}
