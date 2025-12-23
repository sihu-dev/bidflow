import { logger } from '@/lib/utils/logger';
/**
 * @route /api/v1/ai/formula
 * @description AI 수식 실행 API
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { parseFormula, type FormulaContext } from '@/lib/spreadsheet/formula-parser';
import { z } from 'zod';

// ============================================================================
// 요청 스키마
// ============================================================================

const FormulaRequestSchema = z.object({
  formula: z.string().min(1),
  context: z.object({
    bidId: z.string().optional(),
    sheetId: z.string().optional(),
    row: z.number().optional(),
    col: z.number().optional(),
    cellData: z.record(z.unknown()).optional(),
  }).optional(),
});

// ============================================================================
// 개발 모드 감지
// ============================================================================

const isDevelopment = process.env.NODE_ENV !== 'production';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ============================================================================
// AI 함수 실행
// ============================================================================

async function executeAIFunction(
  fn: string,
  args: string[],
  context: FormulaContext = {}
): Promise<string> {
  switch (fn) {
    case 'AI':
      return executeGeneralAI(args[0], context);
    case 'AI_SUMMARY':
      return executeSummaryAI(context);
    case 'AI_SCORE':
      return executeScoreAI(context);
    case 'AI_MATCH':
      return executeMatchAI(context);
    case 'AI_KEYWORDS':
      return executeKeywordsAI(context);
    case 'AI_DEADLINE':
      return executeDeadlineAI(context);
    default:
      throw new Error(`지원하지 않는 함수: ${fn}`);
  }
}

async function executeGeneralAI(prompt: string, context: FormulaContext): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    if (isDevelopment) {
      return `[DEV] AI 응답: "${prompt}"에 대한 분석 결과입니다.`;
    }
    throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다');
  }

  const systemPrompt = context.cellData
    ? `당신은 입찰 공고 분석 전문가입니다. 다음 입찰 데이터를 참고하세요:\n${JSON.stringify(context.cellData, null, 2)}`
    : '당신은 입찰 공고 분석 전문가입니다.';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'AI API 호출 실패');
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

async function executeSummaryAI(context: FormulaContext): Promise<string> {
  if (!context.cellData) {
    return '데이터가 없습니다';
  }

  const prompt = `다음 입찰 공고를 2-3문장으로 요약해주세요:\n
제목: ${context.cellData.title}
기관: ${context.cellData.organization}
추정가: ${context.cellData.estimated_amount}
마감일: ${context.cellData.deadline}`;

  return executeGeneralAI(prompt, context);
}

async function executeScoreAI(context: FormulaContext): Promise<string> {
  if (!context.cellData) {
    return '-';
  }

  if (!ANTHROPIC_API_KEY && isDevelopment) {
    // 개발 모드에서는 랜덤 점수 반환
    const score = Math.floor(Math.random() * 40) + 60;
    return `${score}%`;
  }

  const prompt = `다음 입찰 공고에 대한 낙찰 확률을 0-100% 사이로 평가해주세요. 숫자와 %만 응답하세요.
제목: ${context.cellData.title}
기관: ${context.cellData.organization}
추정가: ${context.cellData.estimated_amount}`;

  const result = await executeGeneralAI(prompt, context);
  const match = result.match(/(\d+)/);
  return match ? `${match[1]}%` : result;
}

async function executeMatchAI(context: FormulaContext): Promise<string> {
  if (!context.cellData) {
    return '-';
  }

  if (!ANTHROPIC_API_KEY && isDevelopment) {
    const products = ['UR-1000PLUS', 'UR-2000', 'EM-500', 'HM-300'];
    return products[Math.floor(Math.random() * products.length)];
  }

  const prompt = `다음 입찰 공고에 적합한 유량계 제품을 추천해주세요. 제품명만 간단히 응답하세요.
제목: ${context.cellData.title}
기관: ${context.cellData.organization}
키워드: ${context.cellData.keywords}`;

  return executeGeneralAI(prompt, context);
}

async function executeKeywordsAI(context: FormulaContext): Promise<string> {
  if (!context.cellData) {
    return '-';
  }

  if (!ANTHROPIC_API_KEY && isDevelopment) {
    return '유량계, 초음파, 계측';
  }

  const prompt = `다음 입찰 공고에서 핵심 키워드 3개를 추출해주세요. 쉼표로 구분하여 응답하세요.
제목: ${context.cellData.title}`;

  return executeGeneralAI(prompt, context);
}

async function executeDeadlineAI(context: FormulaContext): Promise<string> {
  if (!context.cellData?.deadline) {
    return '-';
  }

  const deadline = new Date(context.cellData.deadline as string);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return '마감됨';
  if (diffDays === 0) return 'D-Day 🔴';
  if (diffDays <= 3) return `D-${diffDays} 🔴 긴급`;
  if (diffDays <= 7) return `D-${diffDays} 🟡`;
  return `D-${diffDays} 🟢`;
}

// ============================================================================
// API 핸들러
// ============================================================================

async function handlePost(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // 입력 검증
    const parseResult = FormulaRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청 형식입니다' },
        { status: 400 }
      );
    }

    const { formula, context } = parseResult.data;

    // 수식 파싱
    const parsed = parseFormula(formula);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: '유효한 수식 형식이 아닙니다' },
        { status: 400 }
      );
    }

    // AI 함수 실행
    const result = await executeAIFunction(parsed.fn, parsed.args, context);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    logger.error('[AI Formula API] 오류:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류' },
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
