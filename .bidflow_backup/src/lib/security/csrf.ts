/**
 * @module security/csrf
 * @description CSRF (Cross-Site Request Forgery) 보호
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { ApiErrorResponse } from '@forge-labs/types/bidding';

// ============================================================================
// CSRF 토큰 관리
// ============================================================================

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * CSRF 토큰 해시 생성 (쿠키 저장용)
 */
export function hashCSRFToken(token: string): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error('CSRF_SECRET 환경 변수가 설정되지 않았습니다');
  }
  return createHash('sha256').update(`${token}${secret}`).digest('hex');
}

/**
 * CSRF 토큰 검증
 */
export function verifyCSRFToken(token: string, hashedToken: string): boolean {
  try {
    const expectedHash = hashCSRFToken(token);
    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    const actualBuffer = Buffer.from(hashedToken, 'hex');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

// ============================================================================
// CSRF 미들웨어
// ============================================================================

interface CSRFConfig {
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
    maxAge?: number;
  };
  exemptPaths?: string[];
  exemptMethods?: string[];
}

const DEFAULT_CONFIG: Required<CSRFConfig> = {
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24시간
  },
  exemptPaths: ['/api/health', '/api/webhooks'],
  exemptMethods: ['GET', 'HEAD', 'OPTIONS'],
};

/**
 * CSRF 보호 미들웨어
 */
export function withCSRF<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  config: CSRFConfig = {}
) {
  const mergedConfig = {
    cookieOptions: { ...DEFAULT_CONFIG.cookieOptions, ...config.cookieOptions },
    exemptPaths: config.exemptPaths ?? DEFAULT_CONFIG.exemptPaths,
    exemptMethods: config.exemptMethods ?? DEFAULT_CONFIG.exemptMethods,
  };

  return async (request: NextRequest): Promise<NextResponse<T | ApiErrorResponse>> => {
    const path = new URL(request.url).pathname;
    const method = request.method;

    // 면제된 경로 또는 메서드 확인
    if (
      mergedConfig.exemptMethods.includes(method) ||
      mergedConfig.exemptPaths.some((p) => path.startsWith(p))
    ) {
      return handler(request);
    }

    // CSRF 토큰 검증
    const tokenFromHeader = request.headers.get(CSRF_HEADER_NAME);
    const tokenFromCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;

    if (!tokenFromHeader || !tokenFromCookie) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_MISSING',
            message: 'CSRF 토큰이 없습니다. 페이지를 새로고침해 주세요.',
          },
        },
        { status: 403 }
      );
    }

    // 토큰 검증
    if (!verifyCSRFToken(tokenFromHeader, tokenFromCookie)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'CSRF 토큰이 유효하지 않습니다. 페이지를 새로고침해 주세요.',
          },
        },
        { status: 403 }
      );
    }

    return handler(request);
  };
}

// ============================================================================
// CSRF 토큰 API 엔드포인트 헬퍼
// ============================================================================

/**
 * CSRF 토큰 생성 및 응답 설정
 */
export function createCSRFResponse(): NextResponse<{ token: string }> {
  const token = generateCSRFToken();
  const hashedToken = hashCSRFToken(token);

  const response = NextResponse.json({ token });

  // 해시된 토큰을 쿠키에 저장
  response.cookies.set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24시간
  });

  return response;
}

// ============================================================================
// Double Submit Cookie 패턴 지원
// ============================================================================

/**
 * 클라이언트에서 사용할 CSRF 토큰 가져오기 (React Hook용)
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token-client') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Origin/Referer 검증 (추가 보호)
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (!host) return false;

  const allowedOrigins = [
    `https://${host}`,
    `http://${host}`,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  if (origin) {
    return allowedOrigins.some((allowed) => origin.startsWith(allowed as string));
  }

  if (referer) {
    return allowedOrigins.some((allowed) => referer.startsWith(allowed as string));
  }

  return false;
}
