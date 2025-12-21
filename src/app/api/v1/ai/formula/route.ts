/**
 * @route /api/v1/ai/formula
 * @description AI 수식 실행 API (V2 - 신규 AI 함수 통합)
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { parseFormula, type FormulaContext } from '@/lib/spreadsheet/formula-parser';
import { z } from 'zod';

// ============================================================================
// 신규 AI 함수 Import
// ============================================================================

import { AI_SUMMARY } from '@/lib/spreadsheet/ai-summary';
import { AI_SCORE } from '@/lib/spreadsheet/ai-score';
import { AI_KEYWORDS } from '@/lib/spreadsheet/ai-keywords';
import { AI_DEADLINE } from '@/lib/spreadsheet/ai-deadline';
import { matchBidToProducts } from '@/lib/matching/enhanced-matcher';

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

  // 신규 AI_SUMMARY 함수 사용
  const bidText = [
    `제목: ${context.cellData.title}`,
    `기관: ${context.cellData.organization}`,
    context.cellData.description ? `내용: ${context.cellData.description}` : '',
  ].filter(Boolean).join('\n');

  try {
    const summary = await AI_SUMMARY(bidText);
    return summary;
  } catch (error) {
    console.error('[AI_SUMMARY] Error:', error);
    return '요약 생성 실패';
  }
}

async function executeScoreAI(context: FormulaContext): Promise<string> {
  if (!context.cellData) {
    return '-';
  }

  // 신규 AI_SCORE 함수 사용
  try {
    const bid = {
      id: context.bidId || context.cellData.id as string || 'unknown',
      title: context.cellData.title as string,
      organization: context.cellData.organization as string,
      description: context.cellData.description as string | undefined,
      estimatedPrice: context.cellData.estimated_amount as number | undefined,
    };

    const score = AI_SCORE(bid);
    return `${score}`;
  } catch (error) {
    console.error('[AI_SCORE] Error:', error);
    return '-';
  }
}

async function executeMatchAI(context: FormulaContext): Promise<string> {
  if (!context.cellData) {
    return '-';
  }

  // 신규 Enhanced Matcher 사용
  try {
    const bid = {
      id: context.bidId || context.cellData.id as string || 'unknown',
      title: context.cellData.title as string,
      organization: context.cellData.organization as string,
      description: context.cellData.description as string | undefined,
      estimatedPrice: context.cellData.estimated_amount as number | undefined,
    };

    const matchResult = matchBidToProducts(bid);
    if (matchResult.bestMatch) {
      return matchResult.bestMatch.productId;
    }
    return 'NONE';
  } catch (error) {
    console.error('[AI_MATCH] Error:', error);
    return '-';
  }
}

async function executeKeywordsAI(context: FormulaContext): Promise<string> {
  if (!context.cellData) {
    return '-';
  }

  // 신규 AI_KEYWORDS 함수 사용
  try {
    const bidText = [
      context.cellData.title,
      context.cellData.description,
      context.cellData.organization,
    ].filter(Boolean).join(' ');

    const keywords = AI_KEYWORDS(bidText as string);
    return keywords.join(', ');
  } catch (error) {
    console.error('[AI_KEYWORDS] Error:', error);
    return '-';
  }
}

async function executeDeadlineAI(context: FormulaContext): Promise<string> {
  if (!context.cellData?.deadline) {
    return '-';
  }

  // 신규 AI_DEADLINE 함수 사용
  try {
    const deadline = context.cellData.deadline as string | Date;
    const analysis = AI_DEADLINE(deadline);

    // 이모지 추가
    const emoji = analysis.statusColor === 'red' ? '🔴' :
                  analysis.statusColor === 'yellow' ? '🟡' : '🟢';

    return `${analysis.ddayLabel} ${emoji} ${analysis.urgencyLabel}`;
  } catch (error) {
    console.error('[AI_DEADLINE] Error:', error);
    return '-';
  }
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
    console.error('[AI Formula API] 오류:', error);
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
