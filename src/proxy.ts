/**
 * @module proxy
 * @description Next.js 16 Proxy - 보안 헤더 및 라우팅
 *
 * NOTE: Next.js 16에서 middleware → proxy로 변경
 * NOTE: i18n은 app/[locale] 구조 전환 후 활성화
 */

import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트는 스킵
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

  // 기본 응답 반환
  return NextResponse.next();
}

export const config = {
  matcher: [
    // API 라우트 및 정적 파일 제외
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
