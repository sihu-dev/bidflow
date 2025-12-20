/**
 * @module inngest/functions/crawl-scheduler
 * @description 입찰 공고 크롤링 스케줄러
 */

import { inngest } from '../client';
import { NaraJangtoClient } from '@/lib/clients/narajangto-api';
import { getBidRepository } from '@/lib/domain/repositories/bid-repository';
import { createISODateString, createKRW, type CreateInput, type BidData } from '@/types';

// ============================================================================
// 스케줄된 크롤링 작업
// ============================================================================

/**
 * 정기 크롤링 작업 (매일 9시, 15시, 21시)
 */
export const scheduledCrawl = inngest.createFunction(
  {
    id: 'scheduled-bid-crawl',
    name: '정기 입찰 공고 크롤링',
  },
  { cron: '0 9,15,21 * * *' },
  async ({ step, logger }) => {
    logger.info('크롤링 시작');

    // Step 1: 나라장터 크롤링
    const naraResults = await step.run('crawl-narajangto', async () => {
      const apiKey = process.env.NARA_JANGTO_API_KEY;
      if (!apiKey) {
        logger.warn('나라장터 API 키가 없습니다. 스킵합니다.');
        return [];
      }

      const client = new NaraJangtoClient(apiKey);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7); // 최근 7일

      try {
        const notices = await client.searchFlowMeterBids({ fromDate });
        logger.info(`나라장터에서 ${notices.length}건 수집`);
        return notices;
      } catch (error) {
        logger.error('나라장터 크롤링 실패:', error);
        return [];
      }
    });

    // Step 2: DB 저장
    const savedCount = await step.run('save-to-db', async () => {
      if (naraResults.length === 0) {
        return 0;
      }

      const repository = getBidRepository();
      let saved = 0;

      for (const bid of naraResults) {
        try {
          // 중복 확인
          const existing = await repository.findByExternalId('narajangto', bid.external_id);
          if (existing.success && existing.data) {
            continue; // 이미 존재하면 스킵
          }

          // 새 공고 저장 (Inngest 직렬화로 Date가 string으로 변환될 수 있음)
          const deadlineValue = bid.deadline as unknown;
          const deadlineStr = typeof deadlineValue === 'string'
            ? deadlineValue
            : new Date(deadlineValue as string | number | Date).toISOString();

          const createInput: CreateInput<BidData> = {
            source: 'narajangto',
            externalId: bid.external_id,
            title: bid.title,
            organization: bid.organization,
            deadline: createISODateString(deadlineStr),
            estimatedAmount: bid.estimated_amount ? createKRW(BigInt(bid.estimated_amount)) : null,
            status: 'new',
            priority: 'medium',
            type: 'product',
            keywords: bid.keywords,
            url: bid.url,
            rawData: bid.raw_data,
          };

          const result = await repository.create(createInput);
          if (result.success) {
            saved++;
          }
        } catch (error) {
          logger.error(`저장 실패: ${bid.external_id}`, error);
        }
      }

      logger.info(`${saved}건 저장 완료`);
      return saved;
    });

    // Step 3: 알림 발송 (새 공고가 있는 경우)
    if (savedCount > 0) {
      await step.run('send-notification', async () => {
        // TODO: 알림 발송 구현
        logger.info(`${savedCount}건의 새 공고 알림 발송 예정`);
      });
    }

    return {
      success: true,
      crawled: naraResults.length,
      saved: savedCount,
    };
  }
);

// ============================================================================
// 수동 크롤링 트리거
// ============================================================================

/**
 * 수동 크롤링 이벤트
 */
export const manualCrawl = inngest.createFunction(
  {
    id: 'manual-bid-crawl',
    name: '수동 입찰 공고 크롤링',
  },
  { event: 'bid/crawl.requested' },
  async ({ event, step, logger }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { source = 'all', keywords: _keywords } = event.data || {}; // TODO: 키워드 필터링 구현

    logger.info(`수동 크롤링 시작: source=${source}`);

    if (source === 'narajangto' || source === 'all') {
      const results = await step.run('crawl-narajangto-manual', async () => {
        const apiKey = process.env.NARA_JANGTO_API_KEY;
        if (!apiKey) {
          return { error: 'API 키 없음' };
        }

        const client = new NaraJangtoClient(apiKey);
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30); // 최근 30일

        const notices = await client.searchFlowMeterBids({ fromDate });
        return { count: notices.length };
      });

      return results;
    }

    return { success: true, message: '크롤링 완료' };
  }
);

// ============================================================================
// 마감 임박 알림
// ============================================================================

/**
 * D-3, D-1 마감 알림
 */
export const deadlineReminder = inngest.createFunction(
  {
    id: 'deadline-reminder',
    name: '마감 임박 알림',
  },
  { cron: '0 9 * * *' }, // 매일 9시
  async ({ step, logger }) => {
    const repository = getBidRepository();

    // D-3 마감 공고 조회
    const d3Bids = await step.run('find-d3-bids', async () => {
      const result = await repository.findUpcoming(3);
      if (!result.success) return [];
      return result.data.filter((bid) => {
        const deadline = new Date(bid.deadline);
        const now = new Date();
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays === 3;
      });
    });

    // D-1 마감 공고 조회
    const d1Bids = await step.run('find-d1-bids', async () => {
      const result = await repository.findUpcoming(1);
      if (!result.success) return [];
      return result.data.filter((bid) => {
        const deadline = new Date(bid.deadline);
        const now = new Date();
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays === 1;
      });
    });

    logger.info(`마감 임박: D-3=${d3Bids.length}건, D-1=${d1Bids.length}건`);

    // 알림 발송
    if (d3Bids.length > 0 || d1Bids.length > 0) {
      await step.run('send-deadline-notification', async () => {
        // TODO: 알림 발송 구현
        logger.info('마감 임박 알림 발송 예정');
      });
    }

    return {
      d3Count: d3Bids.length,
      d1Count: d1Bids.length,
    };
  }
);
