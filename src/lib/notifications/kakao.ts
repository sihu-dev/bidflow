/**
 * @module notifications/kakao
 * @description 카카오 알림톡 서비스
 * @see https://developers.kakao.com/docs/latest/ko/message/rest-api
 */

import { logger } from '@/lib/utils/logger';

// ============================================================================
// 타입 정의
// ============================================================================

export interface KakaoAlimtalkPayload {
  templateCode: string;
  recipientNo: string;
  templateParameter?: Record<string, string>;
  buttons?: KakaoButton[];
}

export interface KakaoButton {
  type: 'WL' | 'AL' | 'DS' | 'BK' | 'MD' | 'AC';
  name: string;
  linkMobile?: string;
  linkPc?: string;
  schemeIos?: string;
  schemeAndroid?: string;
}

export interface KakaoResult {
  success: boolean;
  requestId?: string;
  error?: string;
}

export interface KakaoTemplateParams {
  bidTitle?: string;
  organization?: string;
  deadline?: string;
  estimatedAmount?: string;
  bidCount?: number;
  daysRemaining?: number;
  userName?: string;
  url?: string;
}

// ============================================================================
// 환경 설정
// ============================================================================

const KAKAO_API_KEY = process.env.KAKAO_ALIMTALK_API_KEY;
const KAKAO_SENDER_KEY = process.env.KAKAO_ALIMTALK_SENDER_KEY;
const KAKAO_API_URL = process.env.KAKAO_ALIMTALK_API_URL || 'https://api-alimtalk.kakao.com/v2';
const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================================================
// 알림톡 템플릿 코드
// ============================================================================

export const ALIMTALK_TEMPLATES = {
  // 새 입찰 공고 알림
  NEW_BIDS: 'BIDFLOW_NEW_BIDS',
  // 마감 임박 알림 (D-3)
  DEADLINE_D3: 'BIDFLOW_DEADLINE_D3',
  // 마감 임박 알림 (D-1)
  DEADLINE_D1: 'BIDFLOW_DEADLINE_D1',
  // 입찰 결과 알림
  BID_RESULT: 'BIDFLOW_BID_RESULT',
  // 일일 리포트
  DAILY_REPORT: 'BIDFLOW_DAILY_REPORT',
  // 문의 접수 확인
  CONTACT_RECEIVED: 'BIDFLOW_CONTACT_RECEIVED',
} as const;

// ============================================================================
// 카카오 알림톡 발송
// ============================================================================

/**
 * 카카오 알림톡 발송
 */
export async function sendKakaoAlimtalk(payload: KakaoAlimtalkPayload): Promise<KakaoResult> {
  const { templateCode, recipientNo, templateParameter, buttons } = payload;

  // 개발 환경 시뮬레이션
  if (!KAKAO_API_KEY || !KAKAO_SENDER_KEY) {
    if (isDevelopment) {
      logger.info('[Kakao DEV] 알림톡 발송 (시뮬레이션):', {
        recipient: recipientNo,
        template: templateCode,
        parameters: templateParameter,
      });
      return { success: true, requestId: 'dev-mock-' + Date.now() };
    }
    return { success: false, error: 'KAKAO_ALIMTALK_API_KEY 또는 KAKAO_SENDER_KEY가 설정되지 않았습니다' };
  }

  try {
    const response = await fetch(`${KAKAO_API_URL}/messages/alimtalk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': KAKAO_API_KEY,
      },
      body: JSON.stringify({
        senderKey: KAKAO_SENDER_KEY,
        templateCode,
        recipientNo: normalizePhoneNumber(recipientNo),
        templateParameter,
        buttons,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || `알림톡 발송 실패: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      requestId: data.requestId || data.messageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알림톡 발송 중 오류 발생',
    };
  }
}

/**
 * 다수 수신자에게 알림톡 발송
 */
export async function sendKakaoAlimtalkBulk(
  templateCode: string,
  recipients: string[],
  templateParameter?: Record<string, string>,
  buttons?: KakaoButton[]
): Promise<KakaoResult[]> {
  const results: KakaoResult[] = [];

  for (const recipient of recipients) {
    const result = await sendKakaoAlimtalk({
      templateCode,
      recipientNo: recipient,
      templateParameter,
      buttons,
    });
    results.push(result);

    // Rate limiting: 100ms 간격
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

// ============================================================================
// 알림톡 메시지 빌더
// ============================================================================

/**
 * 새 입찰 공고 알림 발송
 */
export async function sendNewBidsAlimtalk(
  recipientNo: string,
  params: {
    bidCount: number;
    topBidTitle: string;
    topBidOrg: string;
    url: string;
  }
): Promise<KakaoResult> {
  return sendKakaoAlimtalk({
    templateCode: ALIMTALK_TEMPLATES.NEW_BIDS,
    recipientNo,
    templateParameter: {
      count: String(params.bidCount),
      title: truncate(params.topBidTitle, 30),
      organization: truncate(params.topBidOrg, 20),
    },
    buttons: [
      {
        type: 'WL',
        name: '공고 확인하기',
        linkMobile: params.url,
        linkPc: params.url,
      },
    ],
  });
}

/**
 * 마감 임박 알림 발송
 */
export async function sendDeadlineAlimtalk(
  recipientNo: string,
  params: {
    daysRemaining: number;
    bidTitle: string;
    organization: string;
    deadline: string;
    url: string;
  }
): Promise<KakaoResult> {
  const templateCode =
    params.daysRemaining <= 1
      ? ALIMTALK_TEMPLATES.DEADLINE_D1
      : ALIMTALK_TEMPLATES.DEADLINE_D3;

  return sendKakaoAlimtalk({
    templateCode,
    recipientNo,
    templateParameter: {
      dday: `D-${params.daysRemaining}`,
      title: truncate(params.bidTitle, 30),
      organization: truncate(params.organization, 20),
      deadline: params.deadline.split('T')[0],
    },
    buttons: [
      {
        type: 'WL',
        name: '지금 확인',
        linkMobile: params.url,
        linkPc: params.url,
      },
    ],
  });
}

/**
 * 문의 접수 확인 알림 발송
 */
export async function sendContactReceivedAlimtalk(
  recipientNo: string,
  params: {
    name: string;
    inquiryId: string;
  }
): Promise<KakaoResult> {
  return sendKakaoAlimtalk({
    templateCode: ALIMTALK_TEMPLATES.CONTACT_RECEIVED,
    recipientNo,
    templateParameter: {
      name: params.name,
      inquiryId: params.inquiryId,
    },
  });
}

// ============================================================================
// 유틸리티
// ============================================================================

/**
 * 전화번호 정규화 (한국 형식)
 */
function normalizePhoneNumber(phone: string): string {
  // 숫자만 추출
  const digits = phone.replace(/\D/g, '');

  // 국가 코드가 없으면 82 추가
  if (digits.startsWith('010') || digits.startsWith('011')) {
    return '82' + digits.substring(1);
  }

  // 이미 82로 시작하면 그대로
  if (digits.startsWith('82')) {
    return digits;
  }

  return digits;
}

/**
 * 문자열 자르기
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// ============================================================================
// 알림톡 템플릿 등록 가이드
// ============================================================================

/**
 * 카카오 알림톡 템플릿 등록 시 필요한 정보
 *
 * 1. 카카오 비즈니스 계정 생성
 * 2. 채널 개설 및 프로필 등록
 * 3. 발신 프로필 검수
 * 4. 템플릿 등록 및 검수
 *
 * 템플릿 예시 (BIDFLOW_NEW_BIDS):
 * ---
 * [BIDFLOW] 새 입찰 공고 알림
 *
 * 안녕하세요, #{count}건의 새 입찰 공고가 등록되었습니다.
 *
 * 📌 #{title}
 * 🏢 #{organization}
 *
 * 자세한 내용은 BIDFLOW에서 확인하세요.
 * ---
 *
 * 템플릿 예시 (BIDFLOW_DEADLINE_D3):
 * ---
 * [BIDFLOW] 마감 임박 알림
 *
 * ⚠️ #{dday} 마감!
 *
 * 📌 #{title}
 * 🏢 #{organization}
 * 📅 마감일: #{deadline}
 *
 * 마감 전 꼭 확인하세요!
 * ---
 */
