/**
 * @module middleware
 * @description Next.js 미들웨어 - 테넌트 감지 및 쿠키 설정
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TENANTS } from '@/config/tenants';

const TENANT_COOKIE = 'bidflow_tenant';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;

  // 1. 쿼리 파라미터에서 테넌트 확인 (?tenant=cmntech)
  const tenantParam = url.searchParams.get('tenant');
  if (tenantParam && TENANTS[tenantParam.toLowerCase()]) {
    // 쿠키에 테넌트 저장 (7일)
    response.cookies.set(TENANT_COOKIE, tenantParam.toLowerCase(), {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  }

  // 2. 서브도메인에서 테넌트 확인 (cmntech.bidflow.com)
  const hostname = request.headers.get('host') || '';
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    const subdomain = parts[0];
    if (TENANTS[subdomain]) {
      response.cookies.set(TENANT_COOKIE, subdomain, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    }
  }

  return response;
}

export const config = {
  matcher: [
    // 마케팅 페이지만
    '/',
    '/features/:path*',
    '/use-cases/:path*',
    '/pricing',
    '/about',
  ],
};
