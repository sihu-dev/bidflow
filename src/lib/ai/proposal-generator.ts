/**
 * @module ai/proposal-generator
 * @description 제안서 자동 생성 - Files API + Claude Opus 4.5
 *
 * 기능:
 * - Files API로 템플릿 관리
 * - Claude로 제안서 초안 작성
 * - 구조화된 제안서 생성
 */

// @ts-nocheck - Beta features

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: {
    'anthropic-beta': 'files-api-2025-04-14',
  },
});

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ProposalSection {
  title: string;
  content: string;
  order: number;
}

export interface GeneratedProposal {
  bid_id: string;
  sections: ProposalSection[];
  executive_summary: string;
  technical_approach: string;
  pricing: string;
  timeline: string;
  generated_at: string;
  tokens_used: {
    input: number;
    output: number;
  };
}

export interface ProposalTemplate {
  name: string;
  sections: string[];
  format: 'technical' | 'price' | 'combined';
}

// ============================================================================
// TEMPLATES
// ============================================================================

const DEFAULT_TEMPLATES: Record<string, ProposalTemplate> = {
  technical: {
    name: '기술제안서',
    sections: [
      '사업 개요',
      '기술 이해도',
      '수행 방법론',
      '기술 사양',
      '품질 보증',
      '납품 일정',
      '유지보수 계획',
      '회사 소개 및 실적',
    ],
    format: 'technical',
  },
  price: {
    name: '가격제안서',
    sections: [
      '견적 개요',
      '품목별 단가',
      '총 금액',
      '납품 조건',
      '결제 조건',
      '유효 기간',
    ],
    format: 'price',
  },
  combined: {
    name: '종합제안서',
    sections: [
      '제안 개요',
      '사업 이해 및 목표',
      '기술 제안',
      '제품 사양',
      '수행 일정',
      '가격 제안',
      '품질 및 A/S',
      '회사 소개',
      '과거 실적',
    ],
    format: 'combined',
  },
};

// ============================================================================
// PROPOSAL GENERATION
// ============================================================================

/**
 * 입찰에 맞는 제안서 자동 생성
 */
export async function generateProposal(
  bidId: string,
  productId: string,
  templateType: 'technical' | 'price' | 'combined' = 'combined'
): Promise<GeneratedProposal> {
  const startTime = Date.now();

  try {
    // Step 1: Bid 정보 조회
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .select('*')
      .eq('id', bidId)
      .single();

    if (bidError || !bid) {
      throw new Error(`Bid not found: ${bidId}`);
    }

    // Step 2: Product 정보 조회
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${productId}`);
    }

    // Step 3: Match 정보 조회 (점수, 신뢰도)
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('bid_id', bidId)
      .eq('product_id', productId)
      .single();

    // Step 4: 템플릿 선택
    const template = DEFAULT_TEMPLATES[templateType];

    // Step 5: Claude로 제안서 작성
    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 16000,
      betas: ['effort-2025-11-24'],
      output_config: {
        effort: 'high',
      },
      system: `당신은 제조업 전문 제안서 작성 전문가입니다.
입찰 공고와 제품 정보를 바탕으로 설득력 있는 제안서를 작성하세요.

제안서 작성 원칙:
1. 명확하고 구체적으로 작성
2. 발주처 요구사항에 정확히 부합
3. 기술적 우위 강조
4. 실적 및 신뢰성 강조
5. 전문적이고 격식있는 문체`,
      messages: [
        {
          role: 'user',
          content: `다음 입찰에 대한 ${template.name}를 작성하세요.

## 입찰 정보
- 제목: ${bid.title}
- 발주처: ${bid.organization}
- 금액: ${bid.estimated_price?.toLocaleString() || '미정'}원
- 마감일: ${bid.deadline}
- 설명: ${bid.description || '없음'}

## 제품 정보
- 제품명: ${product.name}
- 모델명: ${product.model}
- 카테고리: ${product.category}
- 설명: ${product.description || '없음'}
- 사양: ${JSON.stringify(product.specs, null, 2)}
- 가격대: ${product.price_range || '별도 협의'}

## 매칭 정보
- 매칭 점수: ${match?.score || 'N/A'}/175점
- 신뢰도: ${match?.confidence || 'N/A'}

## 제안서 구성 (다음 섹션 모두 작성)
${template.sections.map((section, idx) => `${idx + 1}. ${section}`).join('\n')}

각 섹션을 상세하게 작성하고, JSON 형식으로 응답하세요:
{
  "executive_summary": "제안 요약 (2-3문단)",
  "sections": [
    {
      "title": "섹션 제목",
      "content": "섹션 내용 (상세하게 작성)",
      "order": 1
    }
  ],
  "technical_approach": "기술적 접근 방법",
  "pricing": "가격 제안 (구체적 금액 포함)",
  "timeline": "수행 일정 (단계별)"
}`,
        },
      ],
    });

    // Step 6: 응답 파싱
    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    const proposalData = JSON.parse(firstBlock.text);

    // Step 7: 결과 구성
    const proposal: GeneratedProposal = {
      bid_id: bidId,
      sections: proposalData.sections || [],
      executive_summary: proposalData.executive_summary || '',
      technical_approach: proposalData.technical_approach || '',
      pricing: proposalData.pricing || '',
      timeline: proposalData.timeline || '',
      generated_at: new Date().toISOString(),
      tokens_used: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    };

    // Step 8: Supabase에 저장 (proposals 테이블 필요 시 생성)
    console.log(`[Proposal] Generated for bid ${bidId}, product ${productId}`);
    console.log(`[Proposal] Tokens used: ${response.usage.input_tokens} + ${response.usage.output_tokens}`);

    return proposal;
  } catch (error) {
    console.error(`[Proposal] Generation failed for ${bidId}:`, error);
    throw error;
  }
}

/**
 * 여러 제품에 대한 제안서 일괄 생성
 */
export async function batchGenerateProposals(
  bidId: string,
  productIds: string[]
): Promise<GeneratedProposal[]> {
  const results = await Promise.all(
    productIds.map(async (productId) => {
      try {
        return await generateProposal(bidId, productId);
      } catch (error) {
        console.error(`[Proposal] Failed for product ${productId}:`, error);
        return null;
      }
    })
  );

  return results.filter((r) => r !== null) as GeneratedProposal[];
}

/**
 * 제안서를 마크다운으로 변환
 */
export function proposalToMarkdown(proposal: GeneratedProposal): string {
  let markdown = `# 제안서\n\n`;
  markdown += `**생성일**: ${new Date(proposal.generated_at).toLocaleString('ko-KR')}\n\n`;
  markdown += `---\n\n`;

  // 요약
  markdown += `## 제안 요약\n\n${proposal.executive_summary}\n\n`;

  // 각 섹션
  const sortedSections = proposal.sections.sort((a, b) => a.order - b.order);
  for (const section of sortedSections) {
    markdown += `## ${section.title}\n\n${section.content}\n\n`;
  }

  // 기술 접근
  if (proposal.technical_approach) {
    markdown += `## 기술 접근 방법\n\n${proposal.technical_approach}\n\n`;
  }

  // 가격
  if (proposal.pricing) {
    markdown += `## 가격 제안\n\n${proposal.pricing}\n\n`;
  }

  // 일정
  if (proposal.timeline) {
    markdown += `## 수행 일정\n\n${proposal.timeline}\n\n`;
  }

  markdown += `---\n\n`;
  markdown += `*본 제안서는 AI가 자동 생성한 초안입니다. 검토 후 수정이 필요할 수 있습니다.*\n`;

  return markdown;
}

/**
 * 제안서를 HTML로 변환
 */
export function proposalToHTML(proposal: GeneratedProposal): string {
  const markdown = proposalToMarkdown(proposal);

  // 간단한 마크다운 -> HTML 변환
  let html = markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gim, '<p>$1</p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
    .replace(/---/g, '<hr />');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>제안서</title>
  <style>
    body {
      font-family: 'Noto Sans KR', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #1a1a1a; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
    h3 { color: #555; }
    hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
    p { margin: 10px 0; }
  </style>
</head>
<body>
${html}
</body>
</html>
  `.trim();
}

/**
 * 비용 계산
 */
export function calculateProposalCost(proposal: GeneratedProposal): number {
  const inputCost = (proposal.tokens_used.input * 15) / 1_000_000; // $15/MTok
  const outputCost = (proposal.tokens_used.output * 75) / 1_000_000; // $75/MTok
  return inputCost + outputCost;
}
