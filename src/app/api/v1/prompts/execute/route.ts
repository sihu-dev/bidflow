/**
 * @route /api/v1/prompts/execute
 * @description AI 프롬프트 실행 API
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { validatePromptInput, sanitizeAIResponse } from '@/lib/security/prompt-guard';
import { z } from 'zod';
import type { ApiResponse } from '@forge-labs/types/bidding';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// 스키마
// ============================================================================

const executeSchema = z.object({
  templateId: z.string().optional(),
  prompt: z.string().min(1).max(5000).optional(),
  variables: z.record(z.string()).optional(),
  context: z.object({
    bidId: z.string().optional(),
    additionalData: z.record(z.unknown()).optional(),
  }).optional(),
});

// ============================================================================
// 환경 변수
// ============================================================================

const isDevelopment = process.env.NODE_ENV !== 'production';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ============================================================================
// 유틸리티 함수
// ============================================================================

function interpolateVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
}

// ============================================================================
// POST /api/v1/prompts/execute - 프롬프트 실행
// ============================================================================

async function handlePost(
  request: AuthenticatedRequest
): Promise<NextResponse<ApiResponse<{ result: string; executionTime: number }>>> {
  const startTime = Date.now();

  try {
    const body = await request.json();

    const parseResult = executeSchema.safeParse(body);
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

    const { prompt, variables, context } = parseResult.data;

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PROMPT',
            message: '프롬프트가 필요합니다',
          },
        },
        { status: 400 }
      );
    }

    // 변수 치환
    const interpolatedPrompt = variables ? interpolateVariables(prompt, variables) : prompt;

    // 보안 검증
    const validation = validatePromptInput(interpolatedPrompt);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PROMPT',
            message: '프롬프트에 위험한 패턴이 감지되었습니다',
          },
        },
        { status: 400 }
      );
    }

    // 개발 모드 Mock
    if (!ANTHROPIC_API_KEY) {
      if (isDevelopment) {
        const mockResult = `[DEV] AI 응답: "${interpolatedPrompt.substring(0, 100)}..."에 대한 분석 결과입니다.

주요 포인트:
1. 이것은 개발 모드 응답입니다
2. 실제 AI 응답은 ANTHROPIC_API_KEY 설정 후 확인 가능합니다
3. 현재 컨텍스트: ${JSON.stringify(context || {})}`;

        return NextResponse.json({
          success: true,
          data: {
            result: mockResult,
            executionTime: Date.now() - startTime,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: 'AI API 키가 설정되지 않았습니다',
          },
        },
        { status: 500 }
      );
    }

    // 실제 AI 호출
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: '당신은 한국 공공입찰 전문가입니다. 유량계, 계측기, 환경 장비 분야에 특화되어 있습니다. 항상 정확하고 실용적인 답변을 제공하세요.',
        messages: [{ role: 'user', content: validation.sanitized }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI API 호출 실패');
    }

    const aiData = await response.json();
    const aiResult = aiData.content[0]?.text || '';

    // 응답 정제
    const sanitizedResult = sanitizeAIResponse(aiResult);

    return NextResponse.json({
      success: true,
      data: {
        result: sanitizedResult,
        executionTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error('POST /api/v1/prompts/execute 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 라우트 익스포트
// ============================================================================

export const POST = withRateLimit(
  withAuth(handlePost, { requireAuth: true, allowedRoles: ['admin', 'user'] }),
  { type: 'ai', getIdentifier: getEndpointIdentifier }
);
