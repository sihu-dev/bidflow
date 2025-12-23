/**
 * @route /api/v1/prompts
 * @description AI 프롬프트 템플릿 관리 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { withCSRF } from '@/lib/security/csrf';
import { validatePromptInput } from '@/lib/security/prompt-guard';
import { z } from 'zod';
import type { ApiResponse } from '@forge-labs/types/bidding';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// 타입 정의
// ============================================================================

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'pricing' | 'proposal' | 'matching' | 'summary';
  prompt: string;
  variables: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
  isSystem: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 스키마
// ============================================================================

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['analysis', 'pricing', 'proposal', 'matching', 'summary']),
  prompt: z.string().min(10).max(5000),
  variables: z.array(z.object({
    name: z.string().min(1),
    description: z.string(),
    required: z.boolean().default(true),
  })).optional(),
});

const querySchema = z.object({
  category: z.enum(['analysis', 'pricing', 'proposal', 'matching', 'summary', 'all']).default('all'),
  search: z.string().max(100).optional(),
});

// ============================================================================
// 시스템 템플릿 (기본 제공)
// ============================================================================

const systemTemplates: PromptTemplate[] = [
  {
    id: 'sys-analysis-basic',
    name: '기본 공고 분석',
    description: '입찰 공고의 핵심 내용을 분석합니다',
    category: 'analysis',
    prompt: `다음 입찰 공고를 분석해주세요:

제목: {{title}}
기관: {{organization}}
추정가: {{estimatedAmount}}
마감일: {{deadline}}

다음 항목을 포함해주세요:
1. 핵심 요구사항 3가지
2. 필수 자격요건
3. 주의사항`,
    variables: [
      { name: 'title', description: '공고 제목', required: true },
      { name: 'organization', description: '발주 기관', required: true },
      { name: 'estimatedAmount', description: '추정 가격', required: false },
      { name: 'deadline', description: '마감일', required: true },
    ],
    isSystem: true,
    usageCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'sys-pricing-strategy',
    name: '입찰가 전략',
    description: '최적의 입찰가를 제안합니다',
    category: 'pricing',
    prompt: `입찰가 책정 전략을 제안해주세요:

공고: {{title}}
추정가: {{estimatedAmount}}
경쟁 예상: {{competitionLevel}}
마진율 목표: {{targetMargin}}%

다음을 분석해주세요:
1. 권장 입찰가 범위 (최소/최대/권장)
2. 가격 결정 근거
3. 리스크 요인`,
    variables: [
      { name: 'title', description: '공고 제목', required: true },
      { name: 'estimatedAmount', description: '추정 가격', required: true },
      { name: 'competitionLevel', description: '경쟁 수준 (낮음/중간/높음)', required: false },
      { name: 'targetMargin', description: '목표 마진율', required: false },
    ],
    isSystem: true,
    usageCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'sys-proposal-outline',
    name: '제안서 개요',
    description: '제안서 작성을 위한 개요를 생성합니다',
    category: 'proposal',
    prompt: `다음 입찰을 위한 제안서 개요를 작성해주세요:

공고: {{title}}
기관: {{organization}}
핵심 요구사항: {{requirements}}
당사 강점: {{strengths}}

제안서 개요를 다음 형식으로 작성해주세요:
1. 사업 이해
2. 수행 방안
3. 참여 인력
4. 일정 계획
5. 기대 효과`,
    variables: [
      { name: 'title', description: '공고 제목', required: true },
      { name: 'organization', description: '발주 기관', required: true },
      { name: 'requirements', description: '핵심 요구사항', required: true },
      { name: 'strengths', description: '당사 강점', required: false },
    ],
    isSystem: true,
    usageCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'sys-product-match',
    name: '제품 매칭',
    description: '입찰에 적합한 제품을 추천합니다',
    category: 'matching',
    prompt: `다음 입찰 공고에 적합한 제품을 추천해주세요:

공고: {{title}}
요구 사양:
- 유형: {{productType}}
- 규격: {{specifications}}
- 수량: {{quantity}}

당사 제품 목록:
{{productCatalog}}

매칭 결과:
1. 추천 제품 (적합도 순)
2. 각 제품의 적합 이유
3. 추가 고려사항`,
    variables: [
      { name: 'title', description: '공고 제목', required: true },
      { name: 'productType', description: '제품 유형', required: true },
      { name: 'specifications', description: '요구 규격', required: false },
      { name: 'quantity', description: '수량', required: false },
      { name: 'productCatalog', description: '제품 목록', required: false },
    ],
    isSystem: true,
    usageCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'sys-quick-summary',
    name: '빠른 요약',
    description: '공고를 한 줄로 요약합니다',
    category: 'summary',
    prompt: `다음 입찰 공고를 한 줄(50자 이내)로 요약해주세요:

제목: {{title}}
기관: {{organization}}
마감: {{deadline}}

요약:`,
    variables: [
      { name: 'title', description: '공고 제목', required: true },
      { name: 'organization', description: '발주 기관', required: true },
      { name: 'deadline', description: '마감일', required: true },
    ],
    isSystem: true,
    usageCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

// 사용자 정의 템플릿 저장소 (실제로는 DB)
const userTemplates: PromptTemplate[] = [];

// ============================================================================
// GET /api/v1/prompts - 템플릿 목록 조회
// ============================================================================

async function handleGet(request: NextRequest): Promise<NextResponse<ApiResponse<PromptTemplate[]>>> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = querySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청 파라미터입니다',
          },
        },
        { status: 400 }
      );
    }

    const { category, search } = parseResult.data;

    let templates = [...systemTemplates, ...userTemplates];

    // 카테고리 필터
    if (category !== 'all') {
      templates = templates.filter(t => t.category === category);
    }

    // 검색 필터
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error('GET /api/v1/prompts 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/v1/prompts - 새 템플릿 생성
// ============================================================================

async function handlePost(
  request: AuthenticatedRequest
): Promise<NextResponse<ApiResponse<PromptTemplate>>> {
  try {
    const body = await request.json();

    const parseResult = createTemplateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청 데이터입니다',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { name, description, category, prompt, variables } = parseResult.data;

    // 프롬프트 보안 검증
    const validation = validatePromptInput(prompt);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PROMPT',
            message: '프롬프트에 위험한 패턴이 감지되었습니다',
            details: { threats: validation.threats },
          },
        },
        { status: 400 }
      );
    }

    const newTemplate: PromptTemplate = {
      id: `user-${Date.now()}`,
      name,
      description: description || '',
      category,
      prompt: validation.sanitized,
      variables: variables || [],
      isSystem: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userTemplates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate,
    }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/v1/prompts 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 라우트 익스포트
// ============================================================================

export const GET = withRateLimit(
  withAuth(handleGet, { requireAuth: true, allowedRoles: ['admin', 'user', 'viewer'] }),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);

export const POST = withRateLimit(
  withCSRF(
    withAuth(handlePost, { requireAuth: true, allowedRoles: ['admin', 'user'] })
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);
