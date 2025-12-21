/**
 * @module middleware
 * @description Next.js 미들웨어 - 보안 헤더 및 라우팅
 *
 * NOTE: i18n은 app/[locale] 구조 전환 후 활성화
 * 현재는 클라이언트 사이드 i18n만 사용
 */

import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트는 스킵 (별도 보안 미들웨어 적용됨)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 정적 파일 스킵
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 기본 응답 생성
  const response = NextResponse.next();

  // ============================================================================
  // 보안 헤더 설정 (OWASP Secure Headers Project)
  // ============================================================================

  // 1. Clickjacking 방지
  response.headers.set('X-Frame-Options', 'DENY');

  // 2. MIME 스니핑 방지
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 3. Referrer 정보 제어
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 4. 브라우저 기능 제한
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // 5. XSS 공격 방지 (Content Security Policy)
  // NOTE: 'unsafe-inline', 'unsafe-eval'은 Handsontable, HyperFormula 동작에 필요
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.anthropic.com https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // 6. Strict Transport Security (HTTPS 강제)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export const config = {
  matcher: [
    // API 라우트 및 정적 파일 제외
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
