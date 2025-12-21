/**
 * @module middleware
 * @description Next.js 미들웨어 - i18n 라우팅 및 보안
 */

import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// i18n 미들웨어 생성
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // 기본 로케일은 URL에서 숨김
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트는 i18n 미들웨어 스킵
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 정적 파일 스킵
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // 파일 확장자가 있는 경우
  ) {
    return NextResponse.next();
  }

  // i18n 미들웨어 적용
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // API 라우트 제외
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
