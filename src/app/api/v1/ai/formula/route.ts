import { logger } from '@/lib/utils/logger';
/**
 * @route /api/v1/ai/formula
 * @description AI 수식 실행 API - Prompt Caching 및 모델 선택 최적화
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { parseFormula, type FormulaContext } from '@/lib/spreadsheet/formula-parser';
import { z } from 'zod';
import {
  getClaudeClient,
  selectModel,
  getMockResponse,
  type ClaudeModel,
} from '@/lib/ai/claude-client';
import { validatePromptInput, sanitizeInput } from '@/lib/security/prompt-guard';

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
// AI 함수 실행 (Prompt Caching 적용)
// ============================================================================

async function executeAIFunction(
  fn: string,
  args: string[],
  context: FormulaContext = {}
): Promise<string> {
  // 입찰금액 추출 (모델 선택용)
  const bidAmount = context.cellData?.estimated_amount as number | undefined;

  switch (fn) {
    case 'AI':
      return executeGeneralAI(args[0], context, bidAmount);
    case 'AI_SUMMARY':
      return executeSummaryAI(context, bidAmount);
    case 'AI_SCORE':
      return executeScoreAI(context, bidAmount);
    case 'AI_MATCH':
      return executeMatchAI(context, bidAmount);
    case 'AI_KEYWORDS':
      return executeKeywordsAI(context);
    case 'AI_DEADLINE':
      return executeDeadlineAI(context);
    default:
      throw new Error(`지원하지 않는 함수: ${fn}`);
  }
}

async function executeGeneralAI(
  prompt: string,
  context: FormulaContext,
  bidAmount?: number
): Promise<string> {
  // SECURITY: Prompt Injection 방어
  const validation = validatePromptInput(prompt);
  if (!validation.isValid) {
    logger.warn(`[AI Formula] Prompt Injection 감지: ${validation.threats.join(', ')}`);
    throw new Error('입력에 허용되지 않는 패턴이 포함되어 있습니다');
  }

  // 입력 정제
  const sanitizedPrompt = sanitizeInput(prompt);

  if (!ANTHROPIC_API_KEY) {
    if (isDevelopment) {
      return getMockResponse(sanitizedPrompt);
    }
    throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다');
  }

  const client = getClaudeClient();

  // 입찰금액 기반 모델 자동 선택
  const model = selectModel({ bidAmount });

  const systemPrompt = context.cellData
    ? `당신은 입찰 공고 분석 전문가입니다. 다음 입찰 데이터를 참고하세요:\n${JSON.stringify(context.cellData, null, 2)}`
    : '당신은 입찰 공고 분석 전문가입니다.';

  const response = await client.sendMessage(sanitizedPrompt, {
    model,
    systemPrompt,
    bidAmount,
    enableCaching: true,
    maxTokens: 500,
  });

  return response.content[0]?.text || '';
}

async function executeSummaryAI(context: FormulaContext, bidAmount?: number): Promise<string> {
  if (!context.cellData) {
    return '데이터가 없습니다';
  }

  const prompt = `다음 입찰 공고를 2-3문장으로 요약해주세요:\n
제목: ${context.cellData.title}
기관: ${context.cellData.organization}
추정가: ${context.cellData.estimated_amount}
마감일: ${context.cellData.deadline}`;

  return executeGeneralAI(prompt, context, bidAmount);
}

async function executeScoreAI(context: FormulaContext, bidAmount?: number): Promise<string> {
  if (!context.cellData) {
    return '-';
  }

  if (!ANTHROPIC_API_KEY && isDevelopment) {
    // 개발 모드에서는 랜덤 점수 반환
    const score = Math.floor(Math.random() * 40) + 60;
    return `${score}%`;
  }

  // 고액 입찰 (1억원 이상)은 Extended Thinking 활성화
  const useExtendedThinking = (bidAmount || 0) >= 100_000_000;

  const prompt = `다음 입찰 공고에 대한 낙찰 확률을 0-100% 사이로 평가해주세요. 숫자와 %만 응답하세요.
제목: ${context.cellData.title}
기관: ${context.cellData.organization}
추정가: ${context.cellData.estimated_amount}`;

  if (!ANTHROPIC_API_KEY) {
    return getMockResponse(prompt);
  }

  const client = getClaudeClient();
  const model: ClaudeModel = useExtendedThinking
    ? 'claude-opus-4-5-20251101'
    : selectModel({ bidAmount });

  const response = await client.sendMessage(prompt, {
    model,
    bidAmount,
    enableCaching: true,
    extendedThinking: useExtendedThinking,
    thinkingBudget: 5000,
    maxTokens: 100,
  });

  const result = response.content[0]?.text || '';
  const match = result.match(/(\d+)/);
  return match ? `${match[1]}%` : result;
}

async function executeMatchAI(context: FormulaContext, bidAmount?: number): Promise<string> {
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

  return executeGeneralAI(prompt, context, bidAmount);
}

async function executeKeywordsAI(context: FormulaContext): Promise<string> {
  if (!context.cellData) {
    return '-';
  }

  if (!ANTHROPIC_API_KEY && isDevelopment) {
    return '유량계, 초음파, 계측';
  }

  if (!ANTHROPIC_API_KEY) {
    return getMockResponse('키워드');
  }

  const client = getClaudeClient();

  // 키워드 추출은 Haiku로 빠르게 처리
  const response = await client.sendMessage(
    `다음 입찰 공고에서 핵심 키워드 3개를 추출해주세요. 쉼표로 구분하여 응답하세요.\n제목: ${context.cellData.title}`,
    {
      model: 'claude-haiku-4-5-20250514',
      enableCaching: true,
      maxTokens: 100,
    }
  );

  return response.content[0]?.text || '';
}

async function executeDeadlineAI(context: FormulaContext): Promise<string> {
  if (!context.cellData?.deadline) {
    return '-';
  }

  // 마감일 분석은 AI 호출 없이 직접 계산 (비용 절감)
  const client = getClaudeClient();
  const analysis = client.analyzeDeadline(context.cellData.deadline as string);

  const urgencyEmoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };

  if (analysis.daysLeft <= 0) return '마감됨';
  return `D-${analysis.daysLeft} ${urgencyEmoji[analysis.urgency]} ${analysis.action}`;
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
