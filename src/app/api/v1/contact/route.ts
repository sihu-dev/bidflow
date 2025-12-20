/**
 * 문의 API 엔드포인트
 * POST /api/v1/contact
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 문의 스키마
const contactSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  company: z.string().optional(),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  phone: z.string().optional(),
  inquiryType: z.string().min(1, '문의 유형을 선택해주세요'),
  message: z.string().min(10, '문의 내용을 10자 이상 입력해주세요'),
});

export async function POST(request: NextRequest) {
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

    // TODO: 실제 구현 시 다음 중 하나 선택:
    // 1. Supabase에 저장
    // 2. 이메일 발송 (Resend, SendGrid 등)
    // 3. Slack/Discord 알림

    // 데모: 콘솔 로그
    console.log('[Contact API] New inquiry:', {
      name: data.name,
      company: data.company || '-',
      email: data.email,
      phone: data.phone || '-',
      type: data.inquiryType,
      message: data.message.substring(0, 100) + '...',
      timestamp: new Date().toISOString(),
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      id: `INQ-${Date.now()}`,
    });
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

// OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
