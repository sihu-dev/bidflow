import { logger } from '@/lib/utils/logger';
/**
 * 문의 API 엔드포인트
 * POST /api/v1/contact
 *
 * Rate Limit: 5 requests / 15 minutes (스팸 방지)
 * Security: CORS 화이트리스트 + Rate Limiting
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendSlackMessage } from '@/lib/notifications/slack';
import { sendEmail } from '@/lib/notifications/email';
import { withRateLimit } from '@/lib/security/rate-limiter';

// ============================================================================
// CORS 허용 도메인
// ============================================================================

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3010',
  'http://localhost:3000',
].filter(Boolean) as string[];

function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

// ============================================================================
// Supabase 클라이언트 (런타임 검증)
// ============================================================================

// 응답 타입 정의
type ContactResponse = {
  success: boolean;
  message?: string;
  error?: string;
  id?: string;
};

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Placeholder 값 감지
  const isPlaceholder = !url || !key ||
    url.includes('placeholder') ||
    url.includes('your-') ||
    key.includes('your-');

  if (isPlaceholder) {
    return null;
  }

  return createClient(url, key);
}

// 문의 스키마
const contactSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  company: z.string().optional(),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  phone: z.string().optional(),
  inquiryType: z.string().min(1, '문의 유형을 선택해주세요'),
  message: z.string().min(10, '문의 내용을 10자 이상 입력해주세요'),
});

async function handlePost(request: NextRequest): Promise<NextResponse<ContactResponse>> {
  try {
    const body = await request.json();

    // 유효성 검사
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0]?.message || '입력값이 올바르지 않습니다'
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // 메타데이터 수집
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    // UTM 파라미터 (쿼리스트링에서 추출)
    const url = new URL(request.url);
    const utmSource = url.searchParams.get('utm_source');
    const utmMedium = url.searchParams.get('utm_medium');
    const utmCampaign = url.searchParams.get('utm_campaign');

    // 1. Supabase에 저장 (클라이언트 사용 가능 시)
    const supabase = getSupabaseClient();
    let inquiryId = `INQ-${Date.now()}`;

    if (supabase) {
      const { data: submission, error: dbError } = await supabase
        .from('contact_submissions')
        .insert({
          name: data.name,
          email: data.email,
          company: data.company || null,
          phone: data.phone || null,
          inquiry_type: data.inquiryType,
          message: data.message,
          status: 'pending',
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        })
        .select('id')
        .single();

      if (dbError) {
        logger.error('[Contact API] DB Error:', dbError);
        // DB 오류가 있어도 Slack 알림은 시도
      }

      if (submission?.id) {
        inquiryId = submission.id;
      }
    } else {
      logger.warn('[Contact API] Supabase not configured - skipping DB save');
    }

    // 2. Slack 알림 발송
    try {
      await sendSlackMessage({
        text: `📬 *새 문의 접수*`,
        attachments: [
          {
            color: '#2563eb',
            fields: [
              { title: '이름', value: data.name, short: true },
              { title: '회사', value: data.company || '-', short: true },
              { title: '이메일', value: data.email, short: true },
              { title: '연락처', value: data.phone || '-', short: true },
              { title: '문의 유형', value: getInquiryTypeName(data.inquiryType), short: true },
              { title: 'ID', value: String(inquiryId).substring(0, 8), short: true },
              { title: '내용', value: data.message.length > 200 ? data.message.substring(0, 200) + '...' : data.message, short: false },
            ],
            footer: `접수일시: ${new Date().toLocaleString('ko-KR')}`,
          },
        ],
      });
    } catch (slackError) {
      logger.error('[Contact API] Slack Error:', slackError);
    }

    // 3. 접수 확인 이메일 발송 (문의자에게)
    try {
      await sendEmail({
        to: data.email,
        subject: '[BIDFLOW] 문의가 접수되었습니다',
        html: createConfirmationEmailHtml(data.name, inquiryId),
      });
    } catch (emailError) {
      logger.error('[Contact API] Email Error:', emailError);
    }

    logger.info('[Contact API] New inquiry saved:', {
      id: inquiryId,
      name: data.name,
      type: data.inquiryType,
      timestamp: new Date().toISOString(),
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      id: inquiryId,
    });
  } catch (error) {
    logger.error('[Contact API] Error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

// 문의 유형 이름 변환
function getInquiryTypeName(code: string): string {
  const types: Record<string, string> = {
    demo: '데모 요청',
    pricing: '가격 문의',
    technical: '기술 문의',
    partnership: '파트너십',
    support: '기술 지원',
    other: '기타',
  };
  return types[code] || code;
}

// 접수 확인 이메일 HTML
function createConfirmationEmailHtml(name: string, inquiryId: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #171717 0%, #262626 100%); color: white; padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; background: #171717; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">BIDFLOW</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">문의 접수 확인</p>
        </div>
        <div class="content">
          <h2 style="margin: 0 0 20px 0; color: #171717;">${name}님, 문의해주셔서 감사합니다!</h2>
          <p>고객님의 문의가 정상적으로 접수되었습니다.</p>
          <p><strong>접수번호:</strong> ${String(inquiryId).substring(0, 8).toUpperCase()}</p>
          <p>담당자가 확인 후 빠른 시일 내에 연락드리겠습니다.<br>보통 1~2 영업일 내에 답변을 받으실 수 있습니다.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'}" class="button">
              BIDFLOW 바로가기
            </a>
          </div>
        </div>
        <div class="footer">
          <p>본 메일은 발신 전용입니다. 추가 문의사항은 웹사이트를 통해 연락해주세요.</p>
          <p>© ${new Date().getFullYear()} BIDFLOW. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// POST 핸들러 (Rate Limiting 적용 - auth: 5 req/15min)
export const POST = withRateLimit(handlePost, { type: 'auth' });

// OPTIONS (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
