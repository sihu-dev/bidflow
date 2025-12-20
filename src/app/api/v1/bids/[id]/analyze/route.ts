/**
 * @route /api/v1/bids/[id]/analyze
 * @description AI 입찰 분석 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { getBidById } from '@/lib/domain/usecases/bid-usecases';
import { validatePromptInput } from '@/lib/security/prompt-guard';
import { uuidSchema } from '@/lib/validation/schemas';
import type { ApiResponse, UUID } from '@forge-labs/types/bidding';

// BigInt를 JSON 직렬화 가능하게 변환
function serializeForJson<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
}

const isDevelopment = process.env.NODE_ENV !== 'production';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface AIAnalysisResult {
  summary: string;
  keyRequirements: string[];
  recommendedProducts: string[];
  riskFactors: string[];
  winProbability: number;
  estimatedEffort: 'low' | 'medium' | 'high';
  suggestedPrice: {
    min: string;
    max: string;
    recommended: string;
  } | null;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// POST /api/v1/bids/[id]/analyze - AI 분석 실행
// ============================================================================

async function handlePost(
  request: AuthenticatedRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<AIAnalysisResult>>> {
  try {
    const { id } = await params;

    // ID 유효성 검증
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '유효하지 않은 ID 형식입니다',
          },
        },
        { status: 400 }
      );
    }

    // 입찰 조회
    const bidResult = await getBidById(id as UUID);
    if (!bidResult.success) {
      return NextResponse.json(bidResult as ApiResponse<never>, { status: 404 });
    }

    const bid = bidResult.data;

    // Prompt Injection 검증
    const textToValidate = `${bid.title} ${bid.rawData?.requirements ?? ''}`;
    const validation = validatePromptInput(textToValidate);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '입력에 위험한 패턴이 감지되었습니다',
          },
        },
        { status: 400 }
      );
    }

    // 개발 모드 또는 API 키 없는 경우 mock 응답
    if (!ANTHROPIC_API_KEY) {
      if (isDevelopment) {
        const mockResult: AIAnalysisResult = {
          summary: `${bid.title}에 대한 분석 결과입니다. 본 입찰은 ${bid.organization}에서 발주하였으며, 유량계 관련 제품을 요구합니다.`,
          keyRequirements: [
            '초음파 유량계 설치',
            'RS-485 통신 지원',
            '정확도 ±1% 이내',
            '야외 설치 가능 (IP65 이상)',
          ],
          recommendedProducts: ['UR-1000PLUS', 'UR-2000', 'EM-500'],
          riskFactors: [
            '짧은 납품 기한',
            '기술 심사 비중 높음',
            '경쟁사 다수 참여 예상',
          ],
          winProbability: Math.floor(Math.random() * 30) + 50,
          estimatedEffort: 'medium',
          suggestedPrice: bid.estimatedAmount ? {
            min: (Number(bid.estimatedAmount) * 0.85).toLocaleString() + '원',
            max: (Number(bid.estimatedAmount) * 0.95).toLocaleString() + '원',
            recommended: (Number(bid.estimatedAmount) * 0.9).toLocaleString() + '원',
          } : null,
        };

        return NextResponse.json({
          success: true,
          data: mockResult,
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

    // 실제 AI 분석 호출
    const analysisPrompt = `다음 입찰 공고를 분석해주세요.

제목: ${bid.title}
발주처: ${bid.organization}
마감일: ${bid.deadline}
추정가: ${bid.estimatedAmount ? bid.estimatedAmount.toString() + '원' : '미공개'}
유형: ${bid.type}
키워드: ${bid.keywords?.join(', ') || '없음'}

다음 형식의 JSON으로 응답해주세요:
{
  "summary": "2-3문장 요약",
  "keyRequirements": ["핵심 요구사항 배열"],
  "recommendedProducts": ["적합 제품 배열"],
  "riskFactors": ["리스크 요인 배열"],
  "winProbability": 0-100 사이 숫자,
  "estimatedEffort": "low" | "medium" | "high"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: '당신은 한국 공공입찰 전문 분석가입니다. 유량계, 계측기 분야에 특화되어 있습니다. 항상 JSON 형식으로만 응답하세요.',
        messages: [{ role: 'user', content: analysisPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI API 호출 실패');
    }

    const aiData = await response.json();
    const aiText = aiData.content[0]?.text || '{}';

    // JSON 파싱 시도
    let analysisResult: AIAnalysisResult;
    try {
      const parsed = JSON.parse(aiText);
      analysisResult = {
        summary: parsed.summary || '',
        keyRequirements: parsed.keyRequirements || [],
        recommendedProducts: parsed.recommendedProducts || [],
        riskFactors: parsed.riskFactors || [],
        winProbability: parsed.winProbability || 50,
        estimatedEffort: parsed.estimatedEffort || 'medium',
        suggestedPrice: bid.estimatedAmount ? {
          min: (Number(bid.estimatedAmount) * 0.85).toLocaleString() + '원',
          max: (Number(bid.estimatedAmount) * 0.95).toLocaleString() + '원',
          recommended: (Number(bid.estimatedAmount) * 0.9).toLocaleString() + '원',
        } : null,
      };
    } catch {
      analysisResult = {
        summary: aiText,
        keyRequirements: [],
        recommendedProducts: [],
        riskFactors: [],
        winProbability: 50,
        estimatedEffort: 'medium',
        suggestedPrice: null,
      };
    }

    return NextResponse.json(serializeForJson({
      success: true,
      data: analysisResult,
    }));
  } catch (error) {
    console.error('POST /api/v1/bids/[id]/analyze 오류:', error);
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
  withAuth(
    (req: NextRequest) => handlePost(req as AuthenticatedRequest, { params: Promise.resolve({ id: req.url.split('/').slice(-2)[0] || '' }) }),
    { requireAuth: true, allowedRoles: ['admin', 'user'] }
  ),
  { type: 'ai', getIdentifier: getEndpointIdentifier }
);
