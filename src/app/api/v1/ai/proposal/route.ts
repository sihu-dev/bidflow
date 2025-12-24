import { logger } from '@/lib/utils/logger';
/**
 * @route /api/v1/ai/proposal
 * @description AI 제안서 생성 API
 *
 * POST /api/v1/ai/proposal
 * - 입찰 공고 정보를 기반으로 제안서 초안 생성
 * - Claude API (Vercel AI SDK) 사용
 *
 * Security: withAuth + withRateLimit + CORS 화이트리스트
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit } from '@/lib/security/rate-limiter';
import { validatePromptInput } from '@/lib/security/prompt-guard';

// ============================================================================
// CORS 허용 도메인
// ============================================================================

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3010',
  'http://localhost:3000',
].filter(Boolean) as string[];

function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

// ============================================================================
// 요청 스키마
// ============================================================================

const ProposalRequestSchema = z.object({
  // 입찰 공고 정보
  bidTitle: z.string().min(1, '공고 제목이 필요합니다'),
  bidDescription: z.string().optional(),
  organization: z.string().optional(),
  deadline: z.string().optional(),
  estimatedAmount: z.number().optional(),
  requirements: z.array(z.string()).optional(),

  // 회사 정보
  companyName: z.string().min(1, '회사명이 필요합니다'),
  companyDescription: z.string().optional(),
  products: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    specifications: z.record(z.string()).optional(),
  })).optional(),

  // 생성 옵션
  language: z.enum(['ko', 'en']).default('ko'),
  sections: z.array(z.enum([
    'executive_summary',
    'company_introduction',
    'technical_approach',
    'product_specifications',
    'timeline',
    'pricing',
    'references',
  ])).optional(),
  tone: z.enum(['formal', 'professional', 'concise']).default('professional'),
});

// ============================================================================
// 응답 타입
// ============================================================================

type ProposalResponse = {
  success: boolean;
  proposal?: {
    title: string;
    sections: Array<{
      name: string;
      content: string;
    }>;
    summary: string;
    wordCount: number;
  };
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

// ============================================================================
// 시스템 프롬프트
// ============================================================================

const SYSTEM_PROMPT_KO = `당신은 한국 제조업체의 해외 입찰 제안서 작성을 돕는 전문가입니다.

역할:
- 입찰 공고의 요구사항을 분석합니다
- 회사의 강점을 강조하는 제안서를 작성합니다
- 명확하고 전문적인 문체를 사용합니다
- 기술적 정확성을 유지합니다

작성 지침:
1. 발주기관의 요구사항에 직접 대응하세요
2. 회사와 제품의 강점을 구체적으로 명시하세요
3. 기술 규격은 정확하게 기술하세요
4. 납기, 보증, 사후 서비스 등 실현 가능한 약속만 포함하세요
5. 전문적이고 신뢰감을 주는 문체를 사용하세요`;

const SYSTEM_PROMPT_EN = `You are an expert in writing export bid proposals for Korean manufacturing companies.

Role:
- Analyze the bid announcement requirements
- Write proposals that highlight the company's strengths
- Use clear and professional language
- Maintain technical accuracy

Writing Guidelines:
1. Directly address the requirements of the procuring entity
2. Specifically highlight the company's and products' strengths
3. Describe technical specifications accurately
4. Only include achievable promises regarding delivery, warranty, and after-sales service
5. Use a professional and trustworthy tone`;

// ============================================================================
// 제안서 생성 함수
// ============================================================================

async function generateProposal(
  request: AuthenticatedRequest
): Promise<NextResponse<ProposalResponse>> {
  try {
    const body = await request.json();

    // 입력 검증
    const result = ProposalRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error.errors[0]?.message || '입력값이 올바르지 않습니다',
      }, { status: 400 });
    }

    const data = result.data;

    // Prompt Injection 검사
    const userInputs = [
      data.bidTitle,
      data.bidDescription || '',
      data.companyName,
      data.companyDescription || '',
    ].join(' ');

    const injectionCheck = validatePromptInput(userInputs);
    if (!injectionCheck.isValid) {
      logger.warn('[Proposal API] Prompt injection 감지:', { threats: injectionCheck.threats });
      return NextResponse.json({
        success: false,
        error: '잠재적으로 위험한 입력이 감지되었습니다',
      }, { status: 400 });
    }

    // API 키 확인
    if (!process.env.ANTHROPIC_API_KEY) {
      logger.error('[Proposal API] ANTHROPIC_API_KEY 미설정');
      return NextResponse.json({
        success: false,
        error: 'AI 서비스가 설정되지 않았습니다',
      }, { status: 503 });
    }

    // 시스템 프롬프트 선택
    const systemPrompt = data.language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_KO;

    // 사용자 프롬프트 구성
    const userPrompt = buildUserPrompt(data);

    // Claude API 호출
    const { text, usage } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 4000,
      temperature: 0.7,
    });

    // 응답 파싱
    const sections = parseProposalSections(text, data.language);

    const totalTokens = (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);

    logger.info('[Proposal API] 제안서 생성 완료:', {
      user: request.userId,
      bidTitle: data.bidTitle.substring(0, 50),
      sections: sections.length,
      tokens: totalTokens,
    });

    return NextResponse.json({
      success: true,
      proposal: {
        title: `${data.companyName} - ${data.bidTitle} 제안서`,
        sections,
        summary: sections[0]?.content || text.substring(0, 500),
        wordCount: text.split(/\s+/).length,
      },
      usage: {
        promptTokens: usage.inputTokens ?? 0,
        completionTokens: usage.outputTokens ?? 0,
        totalTokens,
      },
    });

  } catch (error) {
    logger.error('[Proposal API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    return NextResponse.json({
      success: false,
      error: `제안서 생성 실패: ${errorMessage}`,
    }, { status: 500 });
  }
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

function buildUserPrompt(data: z.infer<typeof ProposalRequestSchema>): string {
  const parts: string[] = [];

  parts.push(`## 입찰 공고 정보`);
  parts.push(`- 제목: ${data.bidTitle}`);
  if (data.organization) parts.push(`- 발주기관: ${data.organization}`);
  if (data.deadline) parts.push(`- 마감일: ${data.deadline}`);
  if (data.estimatedAmount) parts.push(`- 예정가격: ${data.estimatedAmount.toLocaleString()}원`);
  if (data.bidDescription) parts.push(`\n### 공고 상세\n${data.bidDescription}`);
  if (data.requirements && data.requirements.length > 0) {
    parts.push(`\n### 요구사항`);
    data.requirements.forEach((req, i) => parts.push(`${i + 1}. ${req}`));
  }

  parts.push(`\n## 제안 회사 정보`);
  parts.push(`- 회사명: ${data.companyName}`);
  if (data.companyDescription) parts.push(`- 소개: ${data.companyDescription}`);

  if (data.products && data.products.length > 0) {
    parts.push(`\n### 제안 제품`);
    data.products.forEach((product, i) => {
      parts.push(`\n#### ${i + 1}. ${product.name}`);
      if (product.description) parts.push(product.description);
      if (product.specifications) {
        parts.push(`**규격:**`);
        Object.entries(product.specifications).forEach(([key, value]) => {
          parts.push(`- ${key}: ${value}`);
        });
      }
    });
  }

  parts.push(`\n## 작성 요청`);
  parts.push(`위 입찰 공고에 대한 ${data.tone === 'formal' ? '공식적인' : data.tone === 'concise' ? '간결한' : '전문적인'} 제안서를 작성해주세요.`);

  if (data.sections && data.sections.length > 0) {
    parts.push(`\n다음 섹션을 포함해주세요:`);
    const sectionNames: Record<string, string> = {
      executive_summary: '총괄 요약',
      company_introduction: '회사 소개',
      technical_approach: '기술 접근 방안',
      product_specifications: '제품 규격',
      timeline: '납품 일정',
      pricing: '가격 제안',
      references: '실적 및 레퍼런스',
    };
    data.sections.forEach(section => {
      parts.push(`- ${sectionNames[section] || section}`);
    });
  }

  return parts.join('\n');
}

function parseProposalSections(
  text: string,
  language: 'ko' | 'en'
): Array<{ name: string; content: string }> {
  const sections: Array<{ name: string; content: string }> = [];

  // 마크다운 헤더로 섹션 분리
  const headerRegex = /^#{1,3}\s+(.+)$/gm;
  const matches = [...text.matchAll(headerRegex)];

  if (matches.length === 0) {
    // 헤더가 없으면 전체를 하나의 섹션으로
    sections.push({
      name: language === 'ko' ? '제안서' : 'Proposal',
      content: text.trim(),
    });
    return sections;
  }

  // 각 헤더 사이의 내용 추출
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextMatch = matches[i + 1];
    const startIndex = match.index! + match[0].length;
    const endIndex = nextMatch?.index || text.length;
    const content = text.substring(startIndex, endIndex).trim();

    if (content) {
      sections.push({
        name: match[1].trim(),
        content,
      });
    }
  }

  return sections;
}

// ============================================================================
// 라우트 핸들러
// ============================================================================

// 인증 + Rate Limiting 적용
const authenticatedHandler = withAuth(generateProposal, {
  requireAuth: true,
  allowedRoles: ['admin', 'user'],
});

export const POST = withRateLimit(authenticatedHandler, { type: 'ai' });

// OPTIONS (CORS)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
