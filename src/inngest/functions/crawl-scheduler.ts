/**
 * @module inngest/functions/crawl-scheduler
 * @description 입찰 공고 크롤링 스케줄러
 */

import { inngest } from '../client';
import { NaraJangtoClient, type MappedBid } from '@/lib/clients/narajangto-api';
import { getBidRepository } from '@/lib/domain/repositories/bid-repository';
import { createISODateString, createKRW, type CreateInput, type BidData } from '@/types';
import { sendNotification, type BidNotificationData } from '@/lib/notifications';

// ============================================================================
// 키워드 필터링 유틸리티
// ============================================================================

/**
 * 공고가 키워드와 매칭되는지 확인
 */
function matchesKeywords(notice: MappedBid, keywords: string[]): boolean {
  if (!keywords || keywords.length === 0) {
    return true; // 키워드가 없으면 모든 공고 포함
  }

  const searchText = [
    notice.title,
    notice.organization,
    ...(notice.keywords || []),
  ].join(' ').toLowerCase();

  return keywords.some(keyword =>
    searchText.includes(keyword.toLowerCase())
  );
}

/**
 * 키워드로 공고 필터링
 */
function filterByKeywords(notices: MappedBid[], keywords: string[]): MappedBid[] {
  if (!keywords || keywords.length === 0) {
    return notices;
  }

  return notices.filter(notice => matchesKeywords(notice, keywords));
}

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
        // 저장된 공고 데이터를 알림용으로 변환
        const notificationBids: BidNotificationData[] = naraResults.slice(0, savedCount).map(bid => ({
          id: bid.external_id,
          title: bid.title,
          organization: bid.organization,
          deadline: typeof bid.deadline === 'string' ? bid.deadline : new Date(bid.deadline).toISOString(),
          estimatedAmount: bid.estimated_amount,
          url: bid.url,
        }));

        // Slack 알림 발송
        const results = await sendNotification(['slack'], {
          type: 'new_bids',
          bids: notificationBids,
        });

        const success = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success);

        logger.info(`알림 발송 완료: ${success}/${results.length} 성공`);
        if (failed.length > 0) {
          logger.warn('알림 발송 실패:', failed.map(r => `${r.channel}: ${r.error}`));
        }
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
    const { source = 'all', keywords = [] } = event.data || {};

    logger.info(`수동 크롤링 시작: source=${source}, keywords=${keywords.length}개`);

    if (source === 'narajangto' || source === 'all') {
      // Step 1: 나라장터 크롤링 + 키워드 필터링 + DB 저장
      const result = await step.run('crawl-filter-save', async () => {
        const apiKey = process.env.NARA_JANGTO_API_KEY;
        if (!apiKey) {
          return { success: false, error: 'API 키 없음', total: 0, filtered: 0, saved: 0, notices: [] as MappedBid[] };
        }

        const client = new NaraJangtoClient(apiKey);
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30); // 최근 30일

        // 크롤링
        const notices = await client.searchFlowMeterBids({ fromDate });
        const total = notices.length;

        // 키워드 필터링
        const filtered = filterByKeywords(notices, keywords);
        logger.info(`키워드 필터링: ${total}건 → ${filtered.length}건`);

        // DB 저장
        const repository = getBidRepository();
        let saved = 0;
        const savedNotices: MappedBid[] = [];

        for (const bid of filtered) {
          try {
            // 중복 확인
            const existing = await repository.findByExternalId('narajangto', bid.external_id);
            if (existing.success && existing.data) {
              continue;
            }

            // 새 공고 저장
            const deadlineStr = typeof bid.deadline === 'string'
              ? bid.deadline
              : new Date(bid.deadline).toISOString();

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

            const createResult = await repository.create(createInput);
            if (createResult.success) {
              saved++;
              savedNotices.push(bid);
            }
          } catch (error) {
            logger.error(`저장 실패: ${bid.external_id}`, error);
          }
        }

        return {
          success: true,
          total,
          filtered: filtered.length,
          saved,
          notices: savedNotices,
        };
      });

      if (!result.success) {
        return { success: false, error: 'error' in result ? result.error : '알 수 없는 오류' };
      }

      // Step 2: 알림 발송 (새 공고가 있는 경우)
      if (result.saved > 0) {
        await step.run('send-manual-crawl-notification', async () => {
          // Inngest JSON 직렬화로 Date가 string이 됨
          type SerializedBid = Omit<MappedBid, 'deadline'> & { deadline: string };
          const notificationBids: BidNotificationData[] = (result.notices as SerializedBid[]).map((bid) => ({
            id: bid.external_id,
            title: bid.title,
            organization: bid.organization,
            deadline: bid.deadline,
            estimatedAmount: bid.estimated_amount,
            url: bid.url,
          }));

          await sendNotification(['slack'], {
            type: 'new_bids',
            bids: notificationBids,
          });
        });
      }

      return {
        success: true,
        total: result.total,
        filtered: result.filtered,
        saved: result.saved,
        keywords: keywords.length > 0 ? keywords : '(전체)',
      };
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

    // D-3 알림 발송
    if (d3Bids.length > 0) {
      await step.run('send-d3-notification', async () => {
        const notificationBids: BidNotificationData[] = d3Bids.map(bid => ({
          id: bid.id,
          title: bid.title,
          organization: bid.organization,
          deadline: bid.deadline,
          estimatedAmount: bid.estimatedAmount ? Number(bid.estimatedAmount) : null,
          url: bid.url,
          daysRemaining: 3,
        }));

        const results = await sendNotification(['slack'], {
          type: 'deadline_d3',
          bids: notificationBids,
        });

        logger.info(`D-3 알림 발송: ${results.filter(r => r.success).length}/${results.length} 성공`);
      });
    }

    // D-1 알림 발송
    if (d1Bids.length > 0) {
      await step.run('send-d1-notification', async () => {
        const notificationBids: BidNotificationData[] = d1Bids.map(bid => ({
          id: bid.id,
          title: bid.title,
          organization: bid.organization,
          deadline: bid.deadline,
          estimatedAmount: bid.estimatedAmount ? Number(bid.estimatedAmount) : null,
          url: bid.url,
          daysRemaining: 1,
        }));

        const results = await sendNotification(['slack'], {
          type: 'deadline_d1',
          bids: notificationBids,
        });

        logger.info(`D-1 알림 발송: ${results.filter(r => r.success).length}/${results.length} 성공`);
      });
    }

    return {
      d3Count: d3Bids.length,
      d1Count: d1Bids.length,
    };
  }
);
