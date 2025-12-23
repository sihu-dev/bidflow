/**
 * @module notifications/slack
 * @description Slack 웹훅 알림 서비스
 */

import { logger } from '@/lib/utils/logger';

// ============================================================================
// 타입 정의
// ============================================================================

export interface SlackAttachmentField {
  title: string;
  value: string;
  short?: boolean;
}

export interface SlackAttachment {
  color?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: SlackAttachmentField[];
  footer?: string;
  ts?: number;
}

export interface SlackMessage {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: SlackAttachment[];
  blocks?: SlackBlock[];
}

export interface SlackBlock {
  type: 'section' | 'divider' | 'header' | 'context' | 'actions';
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
  };
  fields?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
  }[];
  elements?: unknown[];
}

// ============================================================================
// 환경 설정
// ============================================================================

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================================================
// Slack 메시지 발송
// ============================================================================

/**
 * Slack 웹훅으로 메시지 발송
 */
export async function sendSlackMessage(message: SlackMessage): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    if (isDevelopment) {
      if (process.env.NODE_ENV === 'development') {
        logger.info('[Slack DEV] 메시지 발송 (시뮬레이션):');
        logger.info(JSON.stringify(message, null, 2));
      }
      return;
    }
    throw new Error('SLACK_WEBHOOK_URL이 설정되지 않았습니다');
  }

  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...message,
      username: message.username || 'BIDFLOW Bot',
      icon_emoji: message.icon_emoji || ':robot_face:',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Slack 발송 실패: ${response.status} - ${errorText}`);
  }
}

// ============================================================================
// 메시지 빌더 헬퍼
// ============================================================================

/**
 * 간단한 텍스트 메시지 생성
 */
export function createSimpleMessage(text: string): SlackMessage {
  return { text };
}

/**
 * 블록 기반 메시지 생성
 */
export function createBlockMessage(
  headerText: string,
  sections: { title: string; value: string }[]
): SlackMessage {
  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: headerText,
        emoji: true,
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      fields: sections.map((s) => ({
        type: 'mrkdwn' as const,
        text: `*${s.title}*\n${s.value}`,
      })),
    },
  ];

  return {
    text: headerText,
    blocks,
  };
}

/**
 * 입찰 공고 알림 메시지 생성
 */
export function createBidNotificationMessage(
  title: string,
  bids: {
    title: string;
    organization: string;
    deadline: string;
    estimatedAmount?: number | null;
    url?: string | null;
  }[]
): SlackMessage {
  const attachments: SlackAttachment[] = bids.slice(0, 10).map((bid) => ({
    color: '#2563eb',
    title: bid.title,
    title_link: bid.url || undefined,
    fields: [
      { title: '발주기관', value: bid.organization, short: true },
      { title: '마감일', value: bid.deadline.split('T')[0], short: true },
      ...(bid.estimatedAmount
        ? [{ title: '추정가', value: formatAmount(bid.estimatedAmount), short: true }]
        : []),
    ],
  }));

  return {
    text: `📢 *${title}*`,
    attachments,
  };
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
