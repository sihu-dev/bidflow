/**
 * @module validation/schemas
 * @description Zod 스키마 정의 (입력 검증)
 */

import { z } from 'zod';

// ============================================================================
// 기본 스키마
// ============================================================================

/** UUID 스키마 */
export const uuidSchema = z.string().uuid('유효한 UUID 형식이 아닙니다');

/** 확률 스키마 (0-1) */
export const probabilitySchema = z
  .number()
  .min(0, '확률은 0 이상이어야 합니다')
  .max(1, '확률은 1 이하여야 합니다');

/** ISO 날짜 문자열 스키마 */
export const isoDateSchema = z.string().datetime('유효한 ISO 날짜 형식이 아닙니다');

/** 한화 금액 스키마 */
export const krwSchema = z
  .bigint()
  .nonnegative('금액은 0 이상이어야 합니다');

// ============================================================================
// 열거형 스키마
// ============================================================================

/** 입찰 소스 */
export const bidSourceSchema = z.enum([
  'narajangto',
  'kepco',
  'kwater',
  'koroad',
  'lh',
  'korail',
  'kogas',
  'khnp',
  'ted',
  'ungm',
  'sam',
  'kotra',
  'custom',
  'manual',
]);

/** 입찰 상태 */
export const bidStatusSchema = z.enum([
  'new',
  'reviewing',
  'preparing',
  'submitted',
  'won',
  'lost',
  'cancelled',
]);

/** 입찰 우선순위 */
export const bidPrioritySchema = z.enum(['high', 'medium', 'low']);

/** 입찰 유형 */
export const bidTypeSchema = z.enum([
  'product',
  'service',
  'construction',
  'facility',
]);

/** AI 셀 상태 */
export const aiCellStatusSchema = z.enum([
  'idle',
  'computing',
  'complete',
  'error',
]);

/** 매칭 신뢰도 */
export const matchConfidenceSchema = z.enum([
  'very_high',
  'high',
  'medium',
  'low',
]);

// ============================================================================
// 엔티티 스키마
// ============================================================================

/** 첨부 파일 스키마 */
export const bidAttachmentSchema = z.object({
  name: z.string().min(1, '파일명은 필수입니다'),
  url: z.string().url('유효한 URL 형식이 아닙니다'),
  size: z.number().nonnegative('파일 크기는 0 이상이어야 합니다'),
  mimeType: z.string().min(1, 'MIME 타입은 필수입니다'),
});

/** 원본 데이터 스키마 */
export const bidRawDataSchema = z.object({
  requirements: z.string().optional(),
  qualifications: z.string().optional(),
  contactInfo: z.string().optional(),
  attachments: z.array(bidAttachmentSchema).optional(),
  pipeSize: z.string().optional(),
  specifications: z.string().optional(),
}).passthrough();

/** 입찰 데이터 생성 스키마 */
export const createBidSchema = z.object({
  source: bidSourceSchema,
  externalId: z.string().min(1, '외부 ID는 필수입니다'),
  title: z
    .string()
    .min(1, '제목은 필수입니다')
    .max(500, '제목은 500자를 초과할 수 없습니다'),
  organization: z
    .string()
    .min(1, '발주처는 필수입니다')
    .max(200, '발주처명은 200자를 초과할 수 없습니다'),
  deadline: isoDateSchema,
  estimatedAmount: z.bigint().nullable().optional(),
  status: bidStatusSchema.default('new'),
  priority: bidPrioritySchema.default('medium'),
  type: bidTypeSchema,
  keywords: z.array(z.string()).default([]),
  url: z.string().url().nullable().optional(),
  rawData: bidRawDataSchema.default({}),
});

/** 입찰 데이터 수정 스키마 */
export const updateBidSchema = createBidSchema.partial().omit({
  source: true,
  externalId: true,
});

/** 제품 매칭 결과 스키마 */
export const productMatchSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  score: z.number().min(0).max(100),
  confidence: matchConfidenceSchema,
  reasons: z.array(z.string()),
  requirementsMatch: z.array(z.string()),
  requirementsGap: z.array(z.string()),
});

/** 파이프라인 엔트리 생성 스키마 */
export const createPipelineEntrySchema = z.object({
  bidId: uuidSchema,
  stage: bidStatusSchema.default('new'),
  assignedTo: uuidSchema.nullable().optional(),
  notes: z.string().max(2000).default(''),
  dueDate: isoDateSchema.nullable().optional(),
  matchScore: probabilitySchema.default(0),
  matchedProducts: z.array(productMatchSchema).default([]),
  aiSummary: z.string().nullable().optional(),
});

// ============================================================================
// API 요청 스키마
// ============================================================================

/** 페이지네이션 스키마 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/** 입찰 목록 조회 스키마 */
export const listBidsQuerySchema = paginationSchema.extend({
  source: bidSourceSchema.optional(),
  status: bidStatusSchema.optional(),
  priority: bidPrioritySchema.optional(),
  type: bidTypeSchema.optional(),
  search: z.string().max(200).optional(),
  fromDate: isoDateSchema.optional(),
  toDate: isoDateSchema.optional(),
});

/** AI 함수 호출 스키마 */
export const aiFunctionCallSchema = z.object({
  type: z.enum([
    'AI',
    'AI_SUMMARY',
    'AI_EXTRACT',
    'AI_SCORE',
    'AI_PROPOSAL',
    'AI_PRICE',
  ]),
  cellRef: z.string().min(1, '셀 참조는 필수입니다'),
  arguments: z.array(z.string()),
  context: z.record(z.unknown()).optional(),
});

/** 크롤링 설정 스키마 */
export const crawlConfigSchema = z.object({
  source: bidSourceSchema,
  enabled: z.boolean().default(true),
  schedule: z.string().min(1, '스케줄은 필수입니다'),
  maxPages: z.number().int().min(1).max(100).default(10),
  retryCount: z.number().int().min(0).max(5).default(3),
  timeout: z.number().int().min(1000).max(60000).default(30000),
});

// ============================================================================
// 보안 관련 스키마
// ============================================================================

/** 안전한 텍스트 스키마 (XSS 방지) */
export const safeTextSchema = z
  .string()
  .transform((val) => val.replace(/<[^>]*>/g, '').trim());

/** AI 프롬프트 스키마 (Prompt Injection 방지) */
export const safePromptSchema = z
  .string()
  .max(10000, '프롬프트는 10000자를 초과할 수 없습니다')
  .refine(
    (val) => {
      // 위험한 패턴 차단
      const dangerousPatterns = [
        /ignore\s+(all\s+)?previous\s+instructions/i,
        /disregard\s+(all\s+)?prior\s+instructions/i,
        /forget\s+(all\s+)?previous\s+instructions/i,
        /system\s*:\s*/i,
        /\[\[SYSTEM\]\]/i,
        /<\|im_start\|>/i,
        /<\|im_end\|>/i,
      ];
      return !dangerousPatterns.some((pattern) => pattern.test(val));
    },
    { message: '잠재적으로 위험한 프롬프트 패턴이 감지되었습니다' }
  );

// ============================================================================
// 타입 추출
// ============================================================================

export type CreateBidInput = z.infer<typeof createBidSchema>;
export type UpdateBidInput = z.infer<typeof updateBidSchema>;
export type ListBidsQuery = z.infer<typeof listBidsQuerySchema>;
export type AIFunctionCallInput = z.infer<typeof aiFunctionCallSchema>;
export type CrawlConfigInput = z.infer<typeof crawlConfigSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
