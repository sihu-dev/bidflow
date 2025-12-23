/**
 * @module notifications
 * @description 알림 서비스 통합 모듈
 */

import { sendSlackMessage, type SlackMessage } from './slack';
import { sendEmail } from './email';
import {
  sendKakaoAlimtalk,
  sendNewBidsAlimtalk,
  sendDeadlineAlimtalk,
  ALIMTALK_TEMPLATES,
} from './kakao';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// 타입 정의
// ============================================================================

export type NotificationChannel = 'slack' | 'email' | 'kakao';

export interface BidNotificationData {
  id: string;
  title: string;
  organization: string;
  deadline: string;
  estimatedAmount?: number | null;
  url?: string | null;
  daysRemaining?: number;
}

export interface NotificationPayload {
  type: 'new_bids' | 'deadline_d3' | 'deadline_d1' | 'bid_result' | 'daily_report';
  recipients?: string[];
  bids: BidNotificationData[];
}

export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
}

// ============================================================================
// 통합 알림 발송
// ============================================================================

/**
 * 여러 채널로 알림 발송
 */
export async function sendNotification(
  channels: NotificationChannel[],
  payload: NotificationPayload
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  for (const channel of channels) {
    try {
      switch (channel) {
        case 'slack':
          await sendSlackNotification(payload);
          results.push({ channel, success: true });
          break;
        case 'email':
          await sendEmailNotification(payload);
          results.push({ channel, success: true });
          break;
        case 'kakao':
          await sendKakaoNotification(payload);
          results.push({ channel, success: true });
          break;
      }
    } catch (error) {
      results.push({
        channel,
        success: false,
        error: error instanceof Error ? error.message : '알림 발송 실패',
      });
    }
  }

  return results;
}

// ============================================================================
// Slack 알림
// ============================================================================

async function sendSlackNotification(payload: NotificationPayload): Promise<void> {
  const message = formatSlackMessage(payload);
  await sendSlackMessage(message);
}

function formatSlackMessage(payload: NotificationPayload): SlackMessage {
  const { type, bids } = payload;

  let title: string;
  let color: string;
  let emoji: string;

  switch (type) {
    case 'new_bids':
      title = `📢 새 입찰 공고 ${bids.length}건`;
      color = '#2196F3';
      emoji = '📢';
      break;
    case 'deadline_d3':
      title = `⏰ D-3 마감 임박 ${bids.length}건`;
      color = '#FF9800';
      emoji = '⏰';
      break;
    case 'deadline_d1':
      title = `🔴 D-1 마감 임박 ${bids.length}건`;
      color = '#F44336';
      emoji = '🔴';
      break;
    case 'bid_result':
      title = `📊 입찰 결과 알림`;
      color = '#4CAF50';
      emoji = '📊';
      break;
    case 'daily_report':
      title = `📋 일일 리포트`;
      color = '#9C27B0';
      emoji = '📋';
      break;
    default:
      title = '알림';
      color = '#607D8B';
      emoji = '📌';
  }

  const attachments = bids.slice(0, 10).map((bid) => ({
    color,
    title: bid.title,
    title_link: bid.url || undefined,
    fields: [
      { title: '발주기관', value: bid.organization, short: true },
      { title: '마감일', value: bid.deadline.split('T')[0], short: true },
      ...(bid.estimatedAmount
        ? [{ title: '추정가', value: formatAmount(bid.estimatedAmount), short: true }]
        : []),
      ...(bid.daysRemaining !== undefined
        ? [{ title: 'D-Day', value: `D-${bid.daysRemaining}`, short: true }]
        : []),
    ],
  }));

  return {
    text: `${emoji} *${title}*`,
    attachments,
  };
}

// ============================================================================
// Email 알림
// ============================================================================

async function sendEmailNotification(payload: NotificationPayload): Promise<void> {
  const { type, recipients = [], bids } = payload;

  if (recipients.length === 0) {
    logger.warn('[Notification] 이메일 수신자가 없습니다');
    return;
  }

  const subject = getEmailSubject(type, bids.length);
  const html = formatEmailHtml(payload);

  await sendEmail({
    to: recipients,
    subject,
    html,
  });
}

function getEmailSubject(type: NotificationPayload['type'], count: number): string {
  switch (type) {
    case 'new_bids':
      return `[BIDFLOW] 새 입찰 공고 ${count}건이 등록되었습니다`;
    case 'deadline_d3':
      return `[BIDFLOW] ⏰ D-3 마감 임박 공고 ${count}건`;
    case 'deadline_d1':
      return `[BIDFLOW] 🔴 D-1 마감 임박 공고 ${count}건`;
    case 'bid_result':
      return `[BIDFLOW] 입찰 결과 알림`;
    case 'daily_report':
      return `[BIDFLOW] 일일 입찰 현황 리포트`;
    default:
      return `[BIDFLOW] 알림`;
  }
}

function formatEmailHtml(payload: NotificationPayload): string {
  const { bids } = payload;

  const bidRows = bids
    .map(
      (bid) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <a href="${bid.url || '#'}" style="color: #2563eb; text-decoration: none; font-weight: 500;">
            ${bid.title}
          </a>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${bid.organization}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${bid.deadline.split('T')[0]}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ${bid.estimatedAmount ? formatAmount(bid.estimatedAmount) : '-'}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        table { width: 100%; border-collapse: collapse; background: white; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">BIDFLOW</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">입찰 자동화 시스템</p>
        </div>
        <div class="content">
          <table>
            <thead>
              <tr>
                <th>공고명</th>
                <th>발주기관</th>
                <th>마감일</th>
                <th style="text-align: right;">추정가</th>
              </tr>
            </thead>
            <tbody>
              ${bidRows}
            </tbody>
          </table>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            자세한 내용은 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'}">BIDFLOW</a>에서 확인하세요.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// Kakao 알림톡
// ============================================================================

async function sendKakaoNotification(payload: NotificationPayload): Promise<void> {
  const { type, recipients = [], bids } = payload;

  if (recipients.length === 0) {
    logger.warn('[Notification] 카카오 알림톡 수신자가 없습니다');
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010';

  for (const recipient of recipients) {
    switch (type) {
      case 'new_bids':
        if (bids.length > 0) {
          await sendNewBidsAlimtalk(recipient, {
            bidCount: bids.length,
            topBidTitle: bids[0].title,
            topBidOrg: bids[0].organization,
            url: `${appUrl}/dashboard`,
          });
        }
        break;

      case 'deadline_d3':
      case 'deadline_d1':
        for (const bid of bids.slice(0, 5)) {
          await sendDeadlineAlimtalk(recipient, {
            daysRemaining: type === 'deadline_d1' ? 1 : 3,
            bidTitle: bid.title,
            organization: bid.organization,
            deadline: bid.deadline,
            url: bid.url || `${appUrl}/dashboard`,
          });
        }
        break;

      default:
        // 기타 유형은 기본 템플릿으로 발송
        await sendKakaoAlimtalk({
          templateCode: ALIMTALK_TEMPLATES.DAILY_REPORT,
          recipientNo: recipient,
          templateParameter: {
            count: String(bids.length),
            date: new Date().toISOString().split('T')[0],
          },
        });
    }
  }
}

// ============================================================================
// 유틸리티
// ============================================================================

function formatAmount(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000)}만`;
  }
  return amount.toLocaleString() + '원';
}

export { sendSlackMessage } from './slack';
export { sendEmail } from './email';
