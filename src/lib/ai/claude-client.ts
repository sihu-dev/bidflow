/**
 * @module ai/claude-client
 * @description Claude API 클라이언트 - Prompt Caching, 모델 선택, 비용 최적화
 */

import { logger } from '@/lib/utils/logger';

// ============================================================================
// 타입 정의
// ============================================================================

export type ClaudeModel =
  | 'claude-haiku-4-5-20250514'      // 빠른 응답, 저비용
  | 'claude-sonnet-4-20250514'       // 균형
  | 'claude-opus-4-5-20251101';      // 고정확도, 고비용

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ClaudeContentBlock[];
}

export interface ClaudeContentBlock {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
}

export interface ClaudeRequestOptions {
  model?: ClaudeModel;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  enableCaching?: boolean;
  bidAmount?: number;  // 입찰금액 (모델 자동 선택용)
  extendedThinking?: boolean;
  thinkingBudget?: number;
}

export interface ClaudeResponse {
  id: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

// ============================================================================
// 모델 선택 전략
// ============================================================================

/**
 * 입찰금액 및 컨텍스트에 따른 모델 자동 선택
 */
export function selectModel(options: {
  bidAmount?: number;
  urgent?: boolean;
  complex?: boolean;
}): ClaudeModel {
  const { bidAmount = 0, urgent = false, complex = false } = options;

  // 1억원 이상: Opus (고정확도)
  if (bidAmount >= 100_000_000) {
    return 'claude-opus-4-5-20251101';
  }

  // 긴급 요청: Haiku (빠른 응답)
  if (urgent) {
    return 'claude-haiku-4-5-20250514';
  }

  // 복잡한 분석: Opus
  if (complex) {
    return 'claude-opus-4-5-20251101';
  }

  // 1천만원 이상: Sonnet
  if (bidAmount >= 10_000_000) {
    return 'claude-sonnet-4-20250514';
  }

  // 기본: Haiku (비용 절감)
  return 'claude-haiku-4-5-20250514';
}

// ============================================================================
// 시스템 프롬프트 (캐싱용)
// ============================================================================

const CACHED_SYSTEM_PROMPTS = {
  bidAnalysis: `당신은 한국 제조업 SME를 위한 입찰 분석 전문가입니다.

주요 역할:
1. 입찰 공고 분석 및 요약
2. 제품 적합도 평가 (유량계, 계측기 전문)
3. 낙찰 확률 예측
4. 경쟁사 분석
5. 제안서 작성 지원

분석 기준:
- 기술 적합도: 제품 사양, 인증, 표준 준수
- 가격 경쟁력: 예산 범위, 시장 가격
- 기관 선호도: 과거 발주 이력, 선호 공급사
- 경쟁 강도: 예상 입찰 참여자 수

응답 형식:
- 한국어로 명확하고 간결하게
- 구체적인 수치와 근거 제시
- 실행 가능한 권고사항 포함`,

  proposalGeneration: `당신은 입찰 제안서 작성 전문가입니다.

작성 원칙:
1. 발주처 요구사항 정확히 반영
2. 자사 강점 부각
3. 기술적 우위 증명
4. 가격 경쟁력 강조
5. 품질 보증 및 A/S 계획

문서 구조:
- 기술 제안서: 사양, 도면, 인증서
- 가격 제안서: 단가, 납품 조건
- 실적 증명: 유사 프로젝트 경험`,

  keywordExtraction: `당신은 입찰 공고 키워드 추출 전문가입니다.
핵심 키워드만 쉼표로 구분하여 응답하세요.
최대 5개까지만 추출합니다.`,
};

// ============================================================================
// Claude API 클라이언트
// ============================================================================

export class ClaudeClient {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';
  private defaultModel: ClaudeModel = 'claude-sonnet-4-20250514';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('[ClaudeClient] API 키가 설정되지 않았습니다');
    }
  }

  /**
   * 메시지 전송 (Prompt Caching 지원)
   */
  async sendMessage(
    userPrompt: string,
    options: ClaudeRequestOptions = {}
  ): Promise<ClaudeResponse> {
    const {
      maxTokens = 1024,
      temperature = 0.7,
      systemPrompt = CACHED_SYSTEM_PROMPTS.bidAnalysis,
      enableCaching = true,
      bidAmount,
      extendedThinking = false,
      thinkingBudget = 5000,
    } = options;

    // 모델 자동 선택
    const model = options.model || selectModel({
      bidAmount,
      complex: extendedThinking,
    });

    // 시스템 프롬프트 구성 (캐싱 적용)
    const system = enableCaching
      ? [
          {
            type: 'text' as const,
            text: systemPrompt,
            cache_control: { type: 'ephemeral' as const },
          },
        ]
      : systemPrompt;

    // 요청 바디 구성
    const body: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    };

    // Extended Thinking (고액 입찰용)
    if (extendedThinking && model === 'claude-opus-4-5-20251101') {
      body.thinking = {
        type: 'enabled',
        budget_tokens: thinkingBudget,
      };
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        // Prompt Caching 활성화
        ...(enableCaching ? { 'anthropic-beta': 'prompt-caching-2024-07-31' } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Claude API 오류 (${response.status})`);
    }

    const data = await response.json();

    // 캐시 사용 로깅
    if (data.usage?.cache_read_input_tokens) {
      logger.info(
        `[ClaudeClient] Cache hit: ${data.usage.cache_read_input_tokens} tokens saved`
      );
    }

    return data as ClaudeResponse;
  }

  /**
   * 입찰 공고 분석
   */
  async analyzeBid(bid: {
    title: string;
    organization: string;
    description?: string;
    estimatedAmount?: number;
    deadline?: string;
  }): Promise<{
    summary: string;
    score: number;
    recommendation: string;
    keywords: string[];
  }> {
    const prompt = `다음 입찰 공고를 분석해주세요:

제목: ${bid.title}
기관: ${bid.organization}
${bid.description ? `설명: ${bid.description}` : ''}
${bid.estimatedAmount ? `추정가: ${bid.estimatedAmount.toLocaleString()}원` : ''}
${bid.deadline ? `마감일: ${bid.deadline}` : ''}

다음 형식으로 응답해주세요:
1. 요약 (2-3문장)
2. 적합도 점수 (0-100)
3. 권고사항
4. 핵심 키워드 (쉼표 구분)`;

    const response = await this.sendMessage(prompt, {
      bidAmount: bid.estimatedAmount,
      maxTokens: 500,
    });

    const text = response.content[0]?.text || '';

    // 응답 파싱
    const scoreMatch = text.match(/(\d{1,3})(?:점|%|\/100)?/);
    const keywordsMatch = text.match(/키워드[:\s]*([^\n]+)/);

    return {
      summary: text.split('\n')[0] || bid.title,
      score: scoreMatch ? parseInt(scoreMatch[1], 10) : 50,
      recommendation: text.includes('참여') ? '입찰 참여 권장' : '검토 필요',
      keywords: keywordsMatch
        ? keywordsMatch[1].split(/[,，、]/).map((k) => k.trim())
        : [],
    };
  }

  /**
   * 제품 매칭
   */
  async matchProducts(
    bidTitle: string,
    products: Array<{ id: string; name: string; keywords: string[] }>
  ): Promise<{ productId: string; productName: string; score: number }[]> {
    const prompt = `입찰 공고: "${bidTitle}"

다음 제품 중 적합한 것을 선택하고 점수를 매겨주세요:
${products.map((p) => `- ${p.name}: ${p.keywords.join(', ')}`).join('\n')}

형식: 제품명 - 점수(0-100)`;

    const response = await this.sendMessage(prompt, {
      systemPrompt: CACHED_SYSTEM_PROMPTS.bidAnalysis,
      maxTokens: 300,
    });

    const text = response.content[0]?.text || '';
    const results: { productId: string; productName: string; score: number }[] = [];

    for (const product of products) {
      const regex = new RegExp(`${product.name}[^0-9]*?(\\d{1,3})`, 'i');
      const match = text.match(regex);
      if (match) {
        results.push({
          productId: product.id,
          productName: product.name,
          score: parseInt(match[1], 10),
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 키워드 추출
   */
  async extractKeywords(text: string): Promise<string[]> {
    const response = await this.sendMessage(text, {
      systemPrompt: CACHED_SYSTEM_PROMPTS.keywordExtraction,
      model: 'claude-haiku-4-5-20250514', // 빠른 응답
      maxTokens: 100,
    });

    const result = response.content[0]?.text || '';
    return result.split(/[,，、]/).map((k) => k.trim()).filter(Boolean);
  }

  /**
   * 마감일 분석
   */
  analyzeDeadline(deadline: string | Date): {
    daysLeft: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    action: string;
  } {
    const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const now = new Date();
    const daysLeft = Math.ceil(
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let urgency: 'critical' | 'high' | 'medium' | 'low';
    let action: string;

    if (daysLeft <= 0) {
      urgency = 'critical';
      action = '마감됨';
    } else if (daysLeft <= 3) {
      urgency = 'critical';
      action = '즉시 제출 필요';
    } else if (daysLeft <= 7) {
      urgency = 'high';
      action = '서류 준비 완료 권장';
    } else if (daysLeft <= 14) {
      urgency = 'medium';
      action = '검토 및 준비 시작';
    } else {
      urgency = 'low';
      action = '모니터링 유지';
    }

    return { daysLeft, urgency, action };
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let claudeClient: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
  if (!claudeClient) {
    claudeClient = new ClaudeClient();
  }
  return claudeClient;
}

// ============================================================================
// 개발 모드 Mock
// ============================================================================

export function getMockResponse(prompt: string): string {
  if (prompt.includes('요약')) {
    return '입찰 공고 요약: 해당 공고는 유량계 납품 관련 입찰입니다.';
  }
  if (prompt.includes('점수') || prompt.includes('확률')) {
    return `${Math.floor(Math.random() * 30) + 70}%`;
  }
  if (prompt.includes('키워드')) {
    return '유량계, 초음파, 계측기';
  }
  if (prompt.includes('제품')) {
    return 'UR-1000PLUS';
  }
  return '[DEV] Mock 응답입니다.';
}
