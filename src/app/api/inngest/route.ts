/**
 * Inngest API Route
 * 모든 백그라운드 작업 함수 등록
 *
 * 보안: Inngest Signing Key 자동 검증
 */
import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { scheduledCrawl, manualCrawl, deadlineReminder } from '@/inngest/functions/crawl-scheduler';

// ============================================================================
// Inngest 핸들러
// Inngest SDK가 자동으로 Signing Key를 검증함
// INNGEST_SIGNING_KEY 환경변수 설정 필요 (프로덕션)
// ============================================================================

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    scheduledCrawl,      // 정기 크롤링 (매일 9시, 15시, 21시)
    manualCrawl,         // 수동 크롤링 트리거
    deadlineReminder,    // 마감 임박 알림 (매일 9시)
  ],
  // Inngest SDK에 Signing Key 전달
  // 프로덕션에서는 이 키로 요청 서명을 검증
  signingKey: process.env.INNGEST_SIGNING_KEY,
  // 개발 환경에서는 signingKey 없어도 동작
  // 프로덕션에서 signingKey 없으면 Inngest Cloud 요청 거부됨
});
