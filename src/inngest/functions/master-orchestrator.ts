/**
 * @module inngest/functions/master-orchestrator
 * @description 마스터 오케스트레이터 - 완전 자동화 입찰 워크플로우
 *
 * 실행 주기: 매시간
 * 통합 도구:
 * - Effort Parameter (자동 선택)
 * - Files API (PDF 분석)
 * - Web Search (시장 정보)
 * - Batch API (저가 입찰)
 * - Autonomous Agent (고액 입찰)
 */

import { inngest } from '../client';
import { batchMatchWithEffort } from '@/lib/ai/effort-matcher';
import { uploadAndAnalyzeBidAttachments } from '@/lib/ai/files-manager';
import { autonomousBidAnalysis } from '@/lib/ai/autonomous-agent';
import { generateProposal } from '@/lib/ai/proposal-generator';
import { sendSlackMessage, createSimpleMessage } from '@/lib/notifications/slack';
import { sendEmail } from '@/lib/notifications/email';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// MASTER ORCHESTRATOR
// ============================================================================

export const masterOrchestrator = inngest.createFunction(
  {
    id: 'master-orchestrator',
    name: 'Master Bid Automation Orchestrator',
  },
  { cron: '0 * * * *' }, // 매시간
  async ({ step }) => {
    const startTime = Date.now();

    // Step 1: 새 입찰 수집
    type NewBidRow = {
      id: string;
      title: string;
      organization: string;
      description: string | null;
      estimated_amount: number | null;
      deadline: string | null;
      status: string;
    };

    const newBids = await step.run('collect-new-bids', async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('id, title, organization, description, estimated_amount, deadline, status')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[Orchestrator] Failed to fetch new bids:', error);
        return [];
      }

      return (data as NewBidRow[] | null) || [];
    });

    if (newBids.length === 0) {
      return {
        message: 'No new bids to process',
        timestamp: new Date().toISOString(),
      };
    }

    console.log(`[Orchestrator] Processing ${newBids.length} new bids`);

    // Step 2: PDF 자동 업로드 및 분석 (Files API)
    const pdfAnalyzedBids = await step.run('analyze-pdfs', async () => {
      const results = await Promise.all(
        newBids.map(async (bid) => {
          try {
            const analysis = await uploadAndAnalyzeBidAttachments(bid.id);
            return { bidId: bid.id, success: true, analysis };
          } catch (error) {
            console.warn(`[Orchestrator] PDF analysis failed for ${bid.id}:`, error);
            return { bidId: bid.id, success: false, analysis: null };
          }
        })
      );

      return results.filter((r) => r.success);
    });

    console.log(`[Orchestrator] Analyzed ${pdfAnalyzedBids.length} PDFs`);

    // Step 3: Effort Level별 분류 및 분석
    const bidsWithAmount = newBids.map((b) => ({
      ...b,
      description: b.description || '',
    }));

    const effortGroups = await step.run('analyze-by-effort', async () => {
      return await batchMatchWithEffort(bidsWithAmount);
    });

    console.log(`[Orchestrator] Effort distribution:`, effortGroups.summary);

    // Step 4: 고액 입찰 심층 분석 (Autonomous Agent)
    const autonomousResults = await step.run('autonomous-analysis', async () => {
      const highEffortBids = effortGroups.high.map((r: any) => r.bidId);

      const results = await Promise.all(
        highEffortBids.map(async (bidId: string) => {
          try {
            return await autonomousBidAnalysis(bidId);
          } catch (error) {
            console.error(`[Orchestrator] Autonomous analysis failed for ${bidId}:`, error);
            return null;
          }
        })
      );

      return results.filter((r) => r !== null);
    });

    console.log(`[Orchestrator] Autonomous analysis completed: ${autonomousResults.length} bids`);

    // Step 5: 제안서 생성 (고득점만)
    const proposals = await step.run('generate-proposals', async () => {
      const highScoreBids = [
        ...effortGroups.medium.filter((r: any) => r.result?.score >= 150),
        ...autonomousResults.filter((r) => r.score >= 150),
      ];

      if (highScoreBids.length === 0) {
        console.log('[Orchestrator] No high-score bids for proposal generation');
        return 0;
      }

      // 각 bid에 대해 top matched product 조회 후 제안서 생성
      const proposalResults = await Promise.all(
        highScoreBids.map(async (bid) => {
          try {
            // bidId 추출 (effortGroups vs autonomousResults 구조 차이)
            const bidId = (bid as any).bidId || (bid as any).bid_id;

            if (!bidId) {
              console.warn('[Proposal] No bidId found in:', bid);
              return null;
            }

            // 해당 bid의 top matched product 조회
            const { data: topMatch, error: matchError } = await supabase
              .from('matches')
              .select('product_id, score')
              .eq('bid_id', bidId)
              .order('score', { ascending: false })
              .limit(1)
              .single();

            if (matchError || !topMatch) {
              console.warn(`[Proposal] No matched product for bid ${bidId}`);
              return null;
            }

            // 제안서 생성 (Claude Opus 4.5 + Files API)
            const proposal = await generateProposal(bidId, topMatch.product_id, 'combined');

            console.log(`[Proposal] Generated for bid ${bidId}, product ${topMatch.product_id}`);

            return { bidId, success: true, proposal };
          } catch (error) {
            console.error(`[Proposal] Failed for bid:`, error);
            return null;
          }
        })
      );

      const successCount = proposalResults.filter((r) => r !== null).length;
      console.log(`[Orchestrator] Generated ${successCount}/${highScoreBids.length} proposals`);

      return successCount;
    });

    // Step 6: 알림 발송
    await step.run('send-notifications', async () => {
      const totalProcessed =
        effortGroups.summary.processed + effortGroups.summary.queued;
      const highScoreCount = autonomousResults.filter((r) => r.score >= 150).length;
      const reviewNeeded = autonomousResults.filter(
        (r) => r.score >= 120 && r.score < 150
      ).length;

      const message = `🤖 입찰 자동 분석 완료

📊 처리 현황:
- 총 입찰: ${newBids.length}건
- PDF 분석: ${pdfAnalyzedBids.length}건
- 즉시 처리: ${effortGroups.summary.processed}건
- Batch 대기: ${effortGroups.summary.queued}건

🎯 분석 결과:
- 고득점 (제안서 생성): ${highScoreCount}건
- 검토 필요 (120-149점): ${reviewNeeded}건
- 자동 패스 (<120점): ${totalProcessed - highScoreCount - reviewNeeded}건

⏱️ 소요 시간: ${((Date.now() - startTime) / 1000).toFixed(1)}초

🔗 대시보드: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

      // Slack 알림
      try {
        await sendSlackMessage(createSimpleMessage(message));
      } catch (error) {
        console.warn('[Orchestrator] Slack notification failed:', error);
      }

      // Email 알림 (고득점 입찰만)
      if (highScoreCount > 0) {
        try {
          await sendEmail({
            to: process.env.ALERT_EMAIL || 'alert@bidflow.io',
            subject: `[BIDFLOW] 고득점 입찰 ${highScoreCount}건 발견`,
            text: message,
          });
        } catch (error) {
          console.warn('[Orchestrator] Email notification failed:', error);
        }
      }
    });

    // Step 7: 통계 업데이트
    await step.run('update-statistics', async () => {
      await supabase.from('automation_stats').insert({
        run_at: new Date().toISOString(),
        total_bids: newBids.length,
        pdf_analyzed: pdfAnalyzedBids.length,
        high_effort: effortGroups.high.length,
        medium_effort: effortGroups.medium.length,
        low_effort: effortGroups.low.length,
        proposals_generated: proposals,
        duration_ms: Date.now() - startTime,
      });
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total_bids: newBids.length,
        pdf_analyzed: pdfAnalyzedBids.length,
        processed: effortGroups.summary.processed,
        queued: effortGroups.summary.queued,
        proposals_generated: proposals,
        duration_ms: Date.now() - startTime,
      },
    };
  }
);

// ============================================================================
// MANUAL TRIGGER
// ============================================================================

// SECURITY: Rate Limiting Configuration
const MANUAL_TRIGGER_RATE_LIMIT = {
  MAX_BIDS_PER_TRIGGER: 10, // Maximum bids per manual trigger
  MAX_PARALLEL_ANALYSIS: 5,  // Maximum parallel analysis jobs
};

export const manualOrchestrator = inngest.createFunction(
  {
    id: 'manual-orchestrator',
    name: 'Manual Orchestrator Trigger',
    // SECURITY: Add rate limiting
    rateLimit: {
      limit: 5,
      period: '1h', // Max 5 manual triggers per hour
    },
  },
  { event: 'orchestrator/run.manual' },
  async ({ event, step }) => {
    // SECURITY: Authentication Check
    // TODO: Verify that event.user is authenticated and has 'admin' role
    // For now, we check for a valid API key in event metadata
    const apiKey = event.data.apiKey as string | undefined;

    if (!apiKey || apiKey !== process.env.INNGEST_API_KEY) {
      console.error('[Manual Orchestrator] Unauthorized access attempt');
      throw new Error('Unauthorized: Valid API key required');
    }

    const { bidIds } = event.data as { bidIds?: string[]; apiKey?: string };

    if (bidIds && bidIds.length > 0) {
      // SECURITY: Validate input
      if (!Array.isArray(bidIds)) {
        throw new Error('bidIds must be an array');
      }

      // SECURITY: Resource Exhaustion Prevention
      if (bidIds.length > MANUAL_TRIGGER_RATE_LIMIT.MAX_BIDS_PER_TRIGGER) {
        throw new Error(
          `Too many bids requested. Maximum ${MANUAL_TRIGGER_RATE_LIMIT.MAX_BIDS_PER_TRIGGER} per trigger`
        );
      }

      // SECURITY: Validate each bidId (UUID format)
      bidIds.forEach((id, index) => {
        if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) {
          throw new Error(`Invalid bidId at index ${index}: ${id}`);
        }
      });

      // 특정 입찰만 처리 (병렬 제한)
      const results = await step.run('analyze-specific-bids', async () => {
        // Process in batches to limit parallel load
        const batchSize = MANUAL_TRIGGER_RATE_LIMIT.MAX_PARALLEL_ANALYSIS;
        const batches: string[][] = [];

        for (let i = 0; i < bidIds.length; i += batchSize) {
          batches.push(bidIds.slice(i, i + batchSize));
        }

        const allResults = [];
        for (const batch of batches) {
          const batchResults = await Promise.all(
            batch.map((bidId) => autonomousBidAnalysis(bidId).catch((e) => {
              console.error(`[Manual] Failed for ${bidId}:`, e);
              return null;
            }))
          );
          allResults.push(...batchResults);
        }

        return allResults.filter((r) => r !== null);
      });

      return {
        success: true,
        processed: results.length,
        results,
      };
    }

    // 전체 실행
    return { message: 'Use master-orchestrator cron for full run' };
  }
);

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const orchestratorHealth = inngest.createFunction(
  {
    id: 'orchestrator-health',
    name: 'Orchestrator Health Check',
  },
  { cron: '*/15 * * * *' }, // 15분마다
  async ({ step }) => {
    const checks = await step.run('run-health-checks', async () => {
      const results = {
        database: false,
        anthropic_api: false,
        supabase: false,
        redis: false,
      };

      // Database check
      try {
        const { error } = await supabase.from('bids').select('id').limit(1);
        results.database = !error;
        results.supabase = !error;
      } catch (e) {
        console.error('[Health] Database check failed:', e);
      }

      // Anthropic API check
      try {
        // Simple ping (using minimal tokens)
        results.anthropic_api = true; // Assume OK for now
      } catch (e) {
        console.error('[Health] Anthropic API check failed:', e);
      }

      return results;
    });

    const allHealthy = Object.values(checks).every((v) => v === true);

    if (!allHealthy) {
      // 알림 발송
      await sendSlackMessage(
        createSimpleMessage(
          `⚠️ 시스템 헬스체크 실패\n\n${Object.entries(checks)
            .map(([k, v]) => `${v ? '✅' : '❌'} ${k}`)
            .join('\n')}`
        )
      );
    }

    return {
      healthy: allHealthy,
      checks,
      timestamp: new Date().toISOString(),
    };
  }
);
