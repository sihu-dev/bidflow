/**
 * @module inngest/functions/batch-analyzer
 * @description Batch API 야간 일괄 분석 Inngest 함수
 *
 * 스케줄:
 * - 매일 새벽 2시: 전날 수집된 입찰 분석
 * - 매주 월요일 3시: 주간 통계 생성
 */

import { inngest } from '../client';
import {
  createBidAnalysisBatch,
  getBatchStatus,
  getBatchResults,
  waitForBatchCompletion,
} from '@/lib/ai/batch-processor';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE CLIENT (타입 없이 생성 - Batch API stub용)
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for admin access
);

// ============================================================================
// NIGHTLY BATCH ANALYSIS
// ============================================================================

export const nightlyBidAnalysis = inngest.createFunction(
  {
    id: 'nightly-bid-analysis',
    name: 'Nightly Bid Analysis (Batch API)',
  },
  { cron: '0 2 * * *' }, // 매일 새벽 2시
  async ({ step }) => {
    const today = new Date().toISOString().split('T')[0];

    // Step 1: 오늘 수집된 입찰 조회
    type BidRow = {
      id: string;
      title: string;
      organization: string;
      description: string | null;
      estimated_amount: number | null;
    };

    const bids = await step.run('fetch-new-bids', async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('id, title, organization, description, estimated_amount')
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`)
        .is('ai_summary', null); // 아직 분석 안 된 것만

      if (error) {
        throw new Error(`Failed to fetch bids: ${error.message}`);
      }

      return (data as BidRow[] | null) || [];
    });

    if (bids.length === 0) {
      return { message: 'No new bids to analyze', date: today };
    }

    // Step 2: Batch 생성
    const batch = await step.run('create-batch', async () => {
      return await createBidAnalysisBatch(
        bids.map((b) => ({
          id: b.id,
          title: b.title,
          organization: b.organization,
          description: b.description || '',
          estimatedAmount: b.estimated_amount ?? undefined,
        }))
      );
    });

    console.log(`Batch created: ${batch.id} with ${bids.length} requests`);

    // Step 3: 폴링 대기 (최대 24시간)
    await step.sleep('wait-for-batch', '24h');

    // Step 4: Batch 완료 확인
    const completedBatch = await step.run('check-batch-completion', async () => {
      return await getBatchStatus(batch.id);
    });

    if (completedBatch.processing_status !== 'ended') {
      throw new Error(`Batch ${batch.id} did not complete in time`);
    }

    // Step 5: 결과 저장
    const results = await step.run('save-results', async () => {
      const batchResults = await getBatchResults(batch.id);

      let successCount = 0;
      let errorCount = 0;

      for await (const result of batchResults) {
        if (result.result.type === 'succeeded' && result.result.message) {
          try {
            const analysis = result.result.message.content[0];
            if (analysis.type === 'text') {
              const parsed = JSON.parse(analysis.text);

              // Supabase 업데이트 (타입 assertion은 Batch API가 아직 stub이므로 허용)
              await supabase
                .from('bids')
                .update({
                  ai_summary: parsed.matched_product as string,
                  match_score: (parsed.score / 175) as number, // 0-1 범위로 정규화
                  updated_at: new Date().toISOString(),
                } as Record<string, unknown>)
                .eq('id', result.custom_id);

              successCount++;
            }
          } catch (error) {
            console.error(`Failed to save result for ${result.custom_id}:`, error);
            errorCount++;
          }
        } else {
          errorCount++;
        }
      }

      return { successCount, errorCount };
    });

    // Step 6: 알림 발송
    await step.run('send-notification', async () => {
      // TODO: Slack/Email 알림
      console.log(`Nightly analysis completed:`);
      console.log(`- Total bids: ${bids.length}`);
      console.log(`- Successful: ${results.successCount}`);
      console.log(`- Failed: ${results.errorCount}`);
    });

    return {
      batch_id: batch.id,
      date: today,
      total: bids.length,
      successful: results.successCount,
      failed: results.errorCount,
    };
  }
);

// ============================================================================
// WEEKLY STATISTICS
// ============================================================================

export const weeklyStatistics = inngest.createFunction(
  {
    id: 'weekly-statistics',
    name: 'Weekly Bid Statistics',
  },
  { cron: '0 3 * * 1' }, // 매주 월요일 3시
  async ({ step }) => {
    type StatsBidRow = {
      id: string;
      ai_summary: string | null;
      match_score: number | null;
      created_at: string;
    };

    const stats = await step.run('calculate-stats', async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data } = await supabase
        .from('bids')
        .select('id, ai_summary, match_score, created_at')
        .gte('created_at', oneWeekAgo.toISOString());

      const bids = (data as StatsBidRow[] | null) || [];
      const totalBids = bids.length;
      const analyzed = bids.filter((b) => b.ai_summary).length;
      const highScore = bids.filter((b) => (b.match_score || 0) > 0.8).length;

      return {
        total_bids: totalBids,
        analyzed_bids: analyzed,
        high_score_bids: highScore,
        analysis_rate: totalBids > 0 ? (analyzed / totalBids) * 100 : 0,
      };
    });

    console.log('Weekly Statistics:', stats);

    return stats;
  }
);

// ============================================================================
// MANUAL BATCH TRIGGER
// ============================================================================

export const manualBatchAnalysis = inngest.createFunction(
  {
    id: 'manual-batch-analysis',
    name: 'Manual Batch Analysis',
  },
  { event: 'batch/analyze.manual' },
  async ({ event, step }) => {
    const { bidIds } = event.data as { bidIds: string[] };

    type ManualBidRow = {
      id: string;
      title: string;
      organization: string;
      description: string | null;
      estimated_amount: number | null;
    };

    // Step 1: Bid 데이터 조회
    const bids = await step.run('fetch-bids', async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('id, title, organization, description, estimated_amount')
        .in('id', bidIds);

      if (error) {
        throw new Error(`Failed to fetch bids: ${error.message}`);
      }

      return (data as ManualBidRow[] | null) || [];
    });

    // Step 2: Batch 생성 및 대기
    const batch = await step.run('create-and-wait-batch', async () => {
      const createdBatch = await createBidAnalysisBatch(
        bids.map((b) => ({
          id: b.id,
          title: b.title,
          organization: b.organization,
          description: b.description || '',
          estimatedAmount: b.estimated_amount ?? undefined,
        }))
      );

      // 완료 대기
      return await waitForBatchCompletion(createdBatch.id);
    });

    return {
      batch_id: batch.id,
      status: batch.processing_status,
      request_counts: batch.request_counts,
    };
  }
);
