/**
 * AI_SUMMARY() 함수 구현
 * 입찰 공고를 2-3문장으로 자동 요약
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * 입찰 공고 요약 생성
 *
 * @param bidText 입찰 공고 전문 (제목 + 설명)
 * @returns 2-3문장 요약
 *
 * @example
 * ```typescript
 * const summary = await AI_SUMMARY(
 *   "서울시 상수도본부 초음파유량계 구매 입찰..."
 * );
 * // → "서울시 상수도사업본부에서 초음파유량계 25대를 구매합니다."
 * ```
 */
export async function AI_SUMMARY(bidText: string): Promise<string> {
  // 환경 변수 확인
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // API 키 없으면 규칙 기반 폴백
    return generateFallbackSummary(bidText);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `다음 입찰 공고를 2-3문장으로 요약해주세요. 핵심 정보만 간결하게 작성하세요:

${bidText}

요약 (2-3문장):`,
      }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }

    return generateFallbackSummary(bidText);
  } catch (error) {
    console.error('[AI_SUMMARY] Claude API 오류:', error);
    return generateFallbackSummary(bidText);
  }
}

/**
 * 규칙 기반 폴백 요약
 * Claude API 실패 시 사용
 */
function generateFallbackSummary(bidText: string): string {
  // 첫 200자 추출
  const preview = bidText.slice(0, 200).trim();

  // 마침표로 문장 분리
  const sentences = preview.split(/[.!?。]/);

  // 첫 1-2문장 반환
  const summary = sentences
    .slice(0, 2)
    .join('. ')
    .trim();

  return summary || preview;
}

/**
 * 배치 요약 (여러 공고 동시 처리)
 */
export async function batchAI_SUMMARY(bidTexts: string[]): Promise<string[]> {
  return Promise.all(bidTexts.map(text => AI_SUMMARY(text)));
}
