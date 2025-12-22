/**
 * @module error-messages
 * @description 사용자 친화적 에러 메시지 변환
 *
 * 기술적 에러 메시지를 일반 사용자가 이해하기 쉬운 메시지로 변환
 *
 * @example
 * ```ts
 * import { getUserFriendlyMessage } from '@/lib/utils/error-messages';
 *
 * try {
 *   await fetch('/api/bids');
 * } catch (error) {
 *   const message = getUserFriendlyMessage(error);
 *   showToast(message, 'error');
 * }
 * ```
 */

export interface ErrorMapping {
  pattern: RegExp | string;
  message: string;
  action?: string;
}

/**
 * 일반적인 에러 패턴 → 사용자 친화적 메시지 매핑
 */
export const ERROR_MAPPINGS: ErrorMapping[] = [
  // Network Errors
  {
    pattern: /network error|failed to fetch|networkerror/i,
    message: '네트워크 연결을 확인해 주세요',
    action: '인터넷 연결 상태를 확인하고 다시 시도해 주세요.',
  },
  {
    pattern: /timeout|timed out/i,
    message: '요청 시간이 초과되었습니다',
    action: '잠시 후 다시 시도해 주세요.',
  },

  // Authentication & Authorization
  {
    pattern: /unauthorized|401/i,
    message: '로그인이 필요합니다',
    action: '다시 로그인해 주세요.',
  },
  {
    pattern: /forbidden|403/i,
    message: '접근 권한이 없습니다',
    action: '관리자에게 문의해 주세요.',
  },

  // Not Found
  {
    pattern: /not found|404/i,
    message: '요청한 정보를 찾을 수 없습니다',
    action: '페이지 주소를 확인하거나 홈으로 이동해 주세요.',
  },

  // Server Errors
  {
    pattern: /internal server error|500/i,
    message: '서버 오류가 발생했습니다',
    action: '잠시 후 다시 시도해 주세요.',
  },
  {
    pattern: /service unavailable|503/i,
    message: '서비스를 일시적으로 사용할 수 없습니다',
    action: '서버 점검 중일 수 있습니다. 잠시 후 다시 시도해 주세요.',
  },

  // Database Errors
  {
    pattern: /database error|db error|connection refused/i,
    message: '데이터베이스 연결 오류가 발생했습니다',
    action: '잠시 후 다시 시도해 주세요.',
  },
  {
    pattern: /duplicate|already exists/i,
    message: '이미 등록된 항목입니다',
    action: '중복된 데이터인지 확인해 주세요.',
  },

  // Validation Errors
  {
    pattern: /validation error|invalid input/i,
    message: '입력값이 올바르지 않습니다',
    action: '입력 내용을 확인하고 다시 시도해 주세요.',
  },
  {
    pattern: /required field|missing required/i,
    message: '필수 항목을 입력해 주세요',
    action: '모든 필수 항목을 채워주세요.',
  },

  // File Upload Errors
  {
    pattern: /file too large|file size/i,
    message: '파일 크기가 너무 큽니다',
    action: '10MB 이하의 파일을 업로드해 주세요.',
  },
  {
    pattern: /invalid file type|unsupported format/i,
    message: '지원하지 않는 파일 형식입니다',
    action: '허용된 파일 형식(jpg, png, pdf)을 사용해 주세요.',
  },

  // Rate Limiting
  {
    pattern: /rate limit|too many requests|429/i,
    message: '너무 많은 요청을 보냈습니다',
    action: '잠시 후 다시 시도해 주세요.',
  },

  // BIDFLOW Specific Errors
  {
    pattern: /bid not found/i,
    message: '입찰 공고를 찾을 수 없습니다',
    action: '공고 목록에서 다시 선택해 주세요.',
  },
  {
    pattern: /deadline passed/i,
    message: '마감일이 지난 공고입니다',
    action: '다른 공고를 선택해 주세요.',
  },
  {
    pattern: /no matching products/i,
    message: '매칭되는 제품이 없습니다',
    action: '검색 조건을 조정하거나 관리자에게 문의해 주세요.',
  },
];

/**
 * 에러를 사용자 친화적 메시지로 변환
 *
 * @param error - Error 객체 또는 문자열
 * @returns 사용자 친화적 메시지
 */
export function getUserFriendlyMessage(error: unknown): string {
  // Error 객체에서 메시지 추출
  const errorMessage = error instanceof Error ? error.message : String(error);

  // 매핑 테이블에서 검색
  for (const mapping of ERROR_MAPPINGS) {
    if (typeof mapping.pattern === 'string') {
      if (errorMessage.includes(mapping.pattern)) {
        return mapping.message;
      }
    } else {
      if (mapping.pattern.test(errorMessage)) {
        return mapping.message;
      }
    }
  }

  // 매핑되지 않은 경우 기본 메시지
  return '문제가 발생했습니다';
}

/**
 * 에러에 대한 권장 조치 가져오기
 *
 * @param error - Error 객체 또는 문자열
 * @returns 권장 조치 메시지
 */
export function getErrorAction(error: unknown): string | null {
  const errorMessage = error instanceof Error ? error.message : String(error);

  for (const mapping of ERROR_MAPPINGS) {
    if (typeof mapping.pattern === 'string') {
      if (errorMessage.includes(mapping.pattern) && mapping.action) {
        return mapping.action;
      }
    } else {
      if (mapping.pattern.test(errorMessage) && mapping.action) {
        return mapping.action;
      }
    }
  }

  return null;
}

/**
 * 에러 로깅 (Sentry, LogRocket 등)
 *
 * @param error - Error 객체
 * @param context - 추가 컨텍스트 정보
 */
export function logError(error: Error, context?: Record<string, any>) {
  // Console logging (개발 환경)
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', error);
    if (context) {
      console.error('[Context]', context);
    }
  }

  // Sentry (프로덕션 환경)
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      contexts: { custom: context },
    });
  }

  // LogRocket (선택사항)
  if (typeof window !== 'undefined' && (window as any).LogRocket) {
    (window as any).LogRocket.captureException(error, {
      tags: context,
    });
  }
}

/**
 * API 에러 처리 헬퍼
 *
 * @param response - Fetch Response 객체
 * @throws {Error} 사용자 친화적 에러 메시지
 */
export async function handleApiError(response: Response): Promise<void> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.error?.message || data.message || `HTTP ${response.status}`;

    throw new Error(message);
  }
}

/**
 * Try-catch 래퍼 with toast
 *
 * @example
 * ```ts
 * import { tryWithToast } from '@/lib/utils/error-messages';
 *
 * await tryWithToast(
 *   async () => {
 *     await saveBid(data);
 *   },
 *   '입찰 공고가 저장되었습니다'
 * );
 * ```
 */
export async function tryWithToast<T>(
  fn: () => Promise<T>,
  successMessage?: string
): Promise<T | null> {
  try {
    const result = await fn();

    if (successMessage) {
      // Dynamic import to avoid circular dependency
      const { showToast } = await import('@/components/ui/Toast');
      showToast(successMessage, 'success');
    }

    return result;
  } catch (error) {
    const message = getUserFriendlyMessage(error);

    // Dynamic import
    const { showToast } = await import('@/components/ui/Toast');
    showToast(message, 'error');

    logError(error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}
