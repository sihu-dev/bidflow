/**
 * @module notifications/email
 * @description 이메일 알림 서비스 (Resend 사용)
 */

import { logger } from '@/lib/utils/logger';

// ============================================================================
// 타입 정의
// ============================================================================

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ============================================================================
// 환경 설정
// ============================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'BIDFLOW <noreply@bidflow.io>';
const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================================================
// 이메일 발송
// ============================================================================

/**
 * Resend API로 이메일 발송
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const { to, subject, html, text, from = EMAIL_FROM, replyTo, cc, bcc } = payload;

  // 수신자 배열 변환
  const recipients = Array.isArray(to) ? to : [to];

  if (recipients.length === 0) {
    return { success: false, error: '수신자가 없습니다' };
  }

  if (!RESEND_API_KEY) {
    if (isDevelopment) {
      if (process.env.NODE_ENV === 'development') {
        logger.info('[Email DEV] 이메일 발송 (시뮬레이션):', {
          to: recipients.join(', '),
          subject,
          from,
          htmlPreview: html?.substring(0, 200),
        });
      }
      return { success: true, id: 'dev-mock-id' };
    }
    return { success: false, error: 'RESEND_API_KEY가 설정되지 않았습니다' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
        text,
        reply_to: replyTo,
        cc,
        bcc,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || `이메일 발송 실패: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '이메일 발송 중 오류 발생',
    };
  }
}

// ============================================================================
// 이메일 템플릿
// ============================================================================

/**
 * 기본 이메일 레이아웃
 */
export function createEmailLayout(content: string, title?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'BIDFLOW'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 0;
    }
    .button:hover {
      background: #1d4ed8;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:hover {
      background: #f9fafb;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-urgent {
      background: #fef2f2;
      color: #dc2626;
    }
    .badge-warning {
      background: #fffbeb;
      color: #d97706;
    }
    .badge-success {
      background: #f0fdf4;
      color: #16a34a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BIDFLOW</h1>
      <p>입찰 자동화 시스템</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>이 메일은 BIDFLOW에서 자동으로 발송되었습니다.</p>
      <p>© ${new Date().getFullYear()} BIDFLOW. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 입찰 공고 알림 이메일 생성
 */
export function createBidNotificationEmail(
  title: string,
  bids: {
    title: string;
    organization: string;
    deadline: string;
    estimatedAmount?: number | null;
    url?: string | null;
  }[]
): string {
  const bidRows = bids
    .map(
      (bid) => `
      <tr>
        <td>
          <a href="${bid.url || '#'}" style="color: #2563eb; text-decoration: none; font-weight: 500;">
            ${escapeHtml(bid.title)}
          </a>
        </td>
        <td>${escapeHtml(bid.organization)}</td>
        <td>${bid.deadline.split('T')[0]}</td>
        <td style="text-align: right;">
          ${bid.estimatedAmount ? formatAmount(bid.estimatedAmount) : '-'}
        </td>
      </tr>
    `
    )
    .join('');

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1f2937;">${escapeHtml(title)}</h2>
    <p style="color: #6b7280;">총 ${bids.length}건의 입찰 공고가 있습니다.</p>
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
    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'}" class="button">
        BIDFLOW에서 자세히 보기
      </a>
    </div>
  `;

  return createEmailLayout(content, title);
}

/**
 * 마감 임박 알림 이메일 생성
 */
export function createDeadlineReminderEmail(
  daysRemaining: number,
  bids: {
    title: string;
    organization: string;
    deadline: string;
    url?: string | null;
  }[]
): string {
  const urgencyBadge =
    daysRemaining <= 1
      ? '<span class="badge badge-urgent">긴급</span>'
      : '<span class="badge badge-warning">주의</span>';

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1f2937;">
      ⏰ D-${daysRemaining} 마감 임박 공고 ${urgencyBadge}
    </h2>
    <p style="color: #6b7280;">
      ${bids.length}건의 입찰 공고가 ${daysRemaining}일 후 마감됩니다.
    </p>
    <table>
      <thead>
        <tr>
          <th>공고명</th>
          <th>발주기관</th>
          <th>마감일</th>
        </tr>
      </thead>
      <tbody>
        ${bids
          .map(
            (bid) => `
          <tr>
            <td>
              <a href="${bid.url || '#'}" style="color: #2563eb; text-decoration: none;">
                ${escapeHtml(bid.title)}
              </a>
            </td>
            <td>${escapeHtml(bid.organization)}</td>
            <td><span class="badge badge-urgent">D-${daysRemaining}</span> ${bid.deadline.split('T')[0]}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'}" class="button">
        지금 확인하기
      </a>
    </div>
  `;

  return createEmailLayout(content, `D-${daysRemaining} 마감 임박 공고`);
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

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}
