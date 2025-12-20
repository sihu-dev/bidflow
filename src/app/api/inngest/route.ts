/**
 * Inngest API Route
 * 모든 백그라운드 작업 함수 등록
 */
import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { scheduledCrawl, manualCrawl, deadlineReminder } from '@/inngest/functions/crawl-scheduler';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    scheduledCrawl,      // 정기 크롤링 (매일 9시, 15시, 21시)
    manualCrawl,         // 수동 크롤링 트리거
    deadlineReminder,    // 마감 임박 알림 (매일 9시)
  ],
});
