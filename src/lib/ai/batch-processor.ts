/**
 * @module ai/batch-processor
 * @description Batch API for cost-efficient bulk processing
 *
 * Claude Batch API:
 * - 비용: 일반 API 대비 50% 저렴
 * - 처리 시간: 최대 24시간
 * - 사용 사례: 야간 일괄 분석, 대량 데이터 처리
 */

import { anthropic, createCachedMatcherPrompt } from './cached-prompts';
import type { Batch, BatchRequestCounts } from '@anthropic-ai/sdk/resources/messages/batches';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BatchRequest {
  custom_id: string;
  params: {
    model: string;
    max_tokens: number;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  };
}

export interface BatchAnalysisResult {
  batch_id: string;
  status: 'in_progress' | 'ended' | 'canceling' | 'canceled';
  created_at: string;
  expires_at: string;
  request_counts: BatchRequestCounts;
  results?: Array<{
    custom_id: string;
    result: {
      type: 'succeeded' | 'errored' | 'expired';
      message?: unknown;
      error?: { type: string; message: string };
    };
  }>;
}

// ============================================================================
// BATCH CREATION
// ============================================================================

/**
 * 입찰 공고 일괄 분석 배치 생성
 */
export async function createBidAnalysisBatch(
  bids: Array<{
    id: string;
    title: string;
    organization: string;
    description: string;
    estimatedAmount?: number;
  }>
): Promise<Batch> {
  const systemPrompt = createCachedMatcherPrompt();

  const requests: BatchRequest[] = bids.map((bid) => ({
    custom_id: bid.id,
    params: {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `다음 입찰 공고를 분석하고 175점 시스템으로 점수를 계산하세요.

입찰 정보:
- 제목: ${bid.title}
- 발주처: ${bid.organization}
- 설명: ${bid.description}
${bid.estimatedAmount ? `- 추정금액: ${bid.estimatedAmount.toLocaleString()}원` : ''}

JSON 형식으로 응답:
{
  "matched_product": "제품명",
  "score": 점수,
  "confidence": "very_high|high|medium|low",
  "breakdown": {...},
  "reasons": [...],
  "risks": [...]
}`,
        },
      ],
    },
  }));

  // Batch 생성
  const batch = await anthropic.batches.create({ requests });

  return batch;
}

/**
 * PDF 첨부파일 일괄 분석 배치 생성
 */
export async function createPDFAnalysisBatch(
  attachments: Array<{
    id: string;
    bid_id: string;
    url: string;
  }>
): Promise<Batch> {
  const requests: BatchRequest[] = attachments.map((attachment) => ({
    custom_id: attachment.id,
    params: {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `PDF URL: ${attachment.url}

이 입찰 공고 PDF를 분석하고 구조화된 정보를 추출하세요.
JSON 형식으로 응답하세요.`,
        },
      ],
    },
  }));

  const batch = await anthropic.batches.create({ requests });

  return batch;
}

// ============================================================================
// BATCH MONITORING
// ============================================================================

/**
 * 배치 상태 조회
 */
export async function getBatchStatus(batchId: string): Promise<Batch> {
  return await anthropic.batches.retrieve(batchId);
}

/**
 * 배치 결과 조회
 */
export async function getBatchResults(batchId: string) {
  const batch = await anthropic.batches.retrieve(batchId);

  if (batch.processing_status !== 'ended') {
    throw new Error(`Batch not completed yet. Status: ${batch.processing_status}`);
  }

  // 결과 다운로드
  const results = await anthropic.batches.results(batchId);

  return results;
}

/**
 * 배치 취소
 */
export async function cancelBatch(batchId: string): Promise<Batch> {
  return await anthropic.batches.cancel(batchId);
}

// ============================================================================
// BATCH UTILITIES
// ============================================================================

/**
 * 배치 완료 대기 (폴링)
 */
export async function waitForBatchCompletion(
  batchId: string,
  maxWaitMinutes: number = 1440, // 24시간
  pollIntervalMinutes: number = 5
): Promise<Batch> {
  const maxAttempts = maxWaitMinutes / pollIntervalMinutes;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const batch = await getBatchStatus(batchId);

    if (batch.processing_status === 'ended') {
      return batch;
    }

    if (batch.processing_status === 'canceled' || batch.processing_status === 'canceling') {
      throw new Error(`Batch was canceled: ${batchId}`);
    }

    // 다음 폴링까지 대기
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMinutes * 60 * 1000));
    attempts++;
  }

  throw new Error(`Batch timeout: ${batchId} did not complete in ${maxWaitMinutes} minutes`);
}

/**
 * 배치 진행률 계산
 */
export function calculateBatchProgress(batch: Batch): number {
  const { processing, succeeded, errored, canceled, expired } = batch.request_counts;
  const total = processing + succeeded + errored + canceled + expired;

  if (total === 0) return 0;

  const completed = succeeded + errored + canceled + expired;
  return (completed / total) * 100;
}

/**
 * 배치 비용 계산
 */
export function calculateBatchCost(
  requestCount: number,
  averageTokensPerRequest: number
): number {
  // Batch API: $1.50/MTok (일반 API $3/MTok의 50%)
  const totalTokens = requestCount * averageTokensPerRequest;
  return (totalTokens / 1_000_000) * 1.5;
}

/**
 * 일반 API vs Batch API 비용 비교
 */
export function compareBatchCost(
  requestCount: number,
  averageTokensPerRequest: number
) {
  const batchCost = calculateBatchCost(requestCount, averageTokensPerRequest);
  const regularCost = (requestCount * averageTokensPerRequest / 1_000_000) * 3;

  return {
    batch_cost: `$${batchCost.toFixed(2)}`,
    regular_cost: `$${regularCost.toFixed(2)}`,
    savings: `$${(regularCost - batchCost).toFixed(2)}`,
    savings_percent: `${(((regularCost - batchCost) / regularCost) * 100).toFixed(1)}%`,
  };
}

// ============================================================================
// SCHEDULED BATCH JOBS
// ============================================================================

/**
 * 야간 일괄 분석 작업 생성
 */
export async function scheduleNightlyAnalysis(date: Date = new Date()) {
  // 오늘 수집된 입찰 공고 ID 리스트 가져오기 (Supabase 연동 필요)
  // 이 함수는 Inngest에서 호출됨

  return {
    scheduled_at: date.toISOString(),
    status: 'pending',
    description: 'Nightly bid analysis batch job',
  };
}

/**
 * 배치 결과를 Supabase에 저장
 */
export async function saveBatchResults(
  batchId: string,
  results: Array<{
    custom_id: string;
    result: {
      type: 'succeeded' | 'errored';
      message?: unknown;
      error?: unknown;
    };
  }>
) {
  const successfulResults = results.filter((r) => r.result.type === 'succeeded');
  const failedResults = results.filter((r) => r.result.type === 'errored');

  console.log(`Batch ${batchId} completed:`);
  console.log(`- Successful: ${successfulResults.length}`);
  console.log(`- Failed: ${failedResults.length}`);

  // TODO: Supabase 저장 로직
  // for (const result of successfulResults) {
  //   await supabase
  //     .from('bid_analysis')
  //     .upsert({
  //       bid_id: result.custom_id,
  //       analysis: result.result.message,
  //       analyzed_at: new Date().toISOString(),
  //     });
  // }

  return {
    batch_id: batchId,
    successful: successfulResults.length,
    failed: failedResults.length,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export type { Batch };
