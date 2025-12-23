/**
 * @module security/auth-middleware
 * @description API 인증 미들웨어
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { ApiErrorResponse } from '@forge-labs/types/bidding';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// 개발 모드 감지
// ============================================================================

const isDevelopment = process.env.NODE_ENV !== 'production';

// 개발용 Mock 사용자
const DEV_MOCK_USER = {
  id: 'dev-user-001',
  email: 'dev@bidflow.local',
  role: 'admin' as const,
};

// ============================================================================
// 타입 정의
// ============================================================================

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  userEmail: string;
  userRole: 'admin' | 'user' | 'viewer';
}

interface AuthConfig {
  requireAuth?: boolean;
  allowedRoles?: ('admin' | 'user' | 'viewer')[];
}

// ============================================================================
// 에러 응답 헬퍼
// ============================================================================

function createErrorResponse(
  code: string,
  message: string,
  status: number
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

// ============================================================================
// Supabase 클라이언트 생성
// ============================================================================

function createSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isDevelopment) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('[DEV] Supabase 미설정 - Mock 인증 사용');
      }
      return null;
    }
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Response cookies are handled separately
      },
    },
  });
}

// ============================================================================
// 인증 미들웨어
// ============================================================================

/**
 * API 인증 미들웨어
 * @param handler - API 핸들러 함수
 * @param config - 인증 설정
 */
export function withAuth<T>(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse<T>>,
  config: AuthConfig = {}
) {
  const { requireAuth = true, allowedRoles = ['admin', 'user'] } = config;

  return async (request: NextRequest): Promise<NextResponse<T | ApiErrorResponse>> => {
    try {
      // 인증 불필요 시 바로 처리
      if (!requireAuth) {
        return handler(request as AuthenticatedRequest);
      }

      // Supabase 클라이언트 생성
      const supabase = createSupabaseClient(request);

      // 개발 모드에서 Supabase 미설정 시 Mock 사용자 사용
      if (!supabase && isDevelopment) {
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.userId = DEV_MOCK_USER.id;
        authenticatedRequest.userEmail = DEV_MOCK_USER.email;
        authenticatedRequest.userRole = DEV_MOCK_USER.role;
        return handler(authenticatedRequest);
      }

      if (!supabase) {
        return createErrorResponse(
          'CONFIG_ERROR',
          '인증 서비스가 설정되지 않았습니다.',
          500
        );
      }

      // 세션 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return createErrorResponse(
          'UNAUTHORIZED',
          '인증이 필요합니다. 로그인해 주세요.',
          401
        );
      }

      // 사용자 역할 조회
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        logger.error('프로필 조회 실패:', profileError);
        return createErrorResponse(
          'PROFILE_ERROR',
          '사용자 프로필을 조회할 수 없습니다.',
          500
        );
      }

      const userRole = (profile?.role as 'admin' | 'user' | 'viewer') || 'viewer';

      // 역할 권한 확인
      if (!allowedRoles.includes(userRole)) {
        return createErrorResponse(
          'FORBIDDEN',
          '이 작업을 수행할 권한이 없습니다.',
          403
        );
      }

      // 인증 정보 추가
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.userId = user.id;
      authenticatedRequest.userEmail = user.email || '';
      authenticatedRequest.userRole = userRole;

      return handler(authenticatedRequest);
    } catch (error) {
      logger.error('인증 미들웨어 오류:', error);
      return createErrorResponse(
        'INTERNAL_ERROR',
        '서버 오류가 발생했습니다.',
        500
      );
    }
  };
}

// ============================================================================
// API Key 인증 (서버 간 통신용)
// ============================================================================

/**
 * API Key 기반 인증 미들웨어
 * @param handler - API 핸들러 함수
 * @param apiKeyEnvVar - 환경 변수 이름
 */
export function withApiKey<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  apiKeyEnvVar: string = 'API_SECRET_KEY'
) {
  return async (request: NextRequest): Promise<NextResponse<T | ApiErrorResponse>> => {
    try {
      const authHeader = request.headers.get('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return createErrorResponse(
          'MISSING_API_KEY',
          'API Key가 필요합니다.',
          401
        );
      }

      const providedKey = authHeader.slice(7); // 'Bearer ' 제거
      const expectedKey = process.env[apiKeyEnvVar];

      if (!expectedKey) {
        logger.error(`환경 변수 ${apiKeyEnvVar}가 설정되지 않았습니다`);
        return createErrorResponse(
          'CONFIG_ERROR',
          '서버 설정 오류입니다.',
          500
        );
      }

      // 타이밍 공격 방지를 위한 상수 시간 비교
      if (!constantTimeCompare(providedKey, expectedKey)) {
        return createErrorResponse(
          'INVALID_API_KEY',
          '유효하지 않은 API Key입니다.',
          401
        );
      }

      return handler(request);
    } catch (error) {
      logger.error('API Key 인증 오류:', error);
      return createErrorResponse(
        'INTERNAL_ERROR',
        '서버 오류가 발생했습니다.',
        500
      );
    }
  };
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 상수 시간 문자열 비교 (타이밍 공격 방지)
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * 권한 확인 헬퍼
 */
export function hasRole(
  userRole: 'admin' | 'user' | 'viewer',
  requiredRole: 'admin' | 'user' | 'viewer'
): boolean {
  const roleHierarchy = { admin: 3, user: 2, viewer: 1 };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
