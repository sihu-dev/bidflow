/**
 * @module supabase/client
 * @description Supabase 클라이언트 (브라우저 + 서버)
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from './types';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// 타입 정의
// ============================================================================

export type SupabaseClientType = ReturnType<typeof createBrowserClient<Database>>;

// ============================================================================
// 환경 변수
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================================================
// 브라우저 클라이언트 (클라이언트 컴포넌트용)
// ============================================================================

let browserClient: SupabaseClientType | null = null;

/**
 * 브라우저용 Supabase 클라이언트 (싱글톤)
 */
export function getSupabaseBrowserClient(): SupabaseClientType | null {
  if (typeof window === 'undefined') {
    logger.warn('getSupabaseBrowserClient는 브라우저에서만 사용 가능합니다');
    return null;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isDevelopment) {
      logger.warn('[DEV] Supabase 미설정 - Realtime 비활성화');
      return null;
    }
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}

// ============================================================================
// 서버 클라이언트 (서버 컴포넌트/API용)
// ============================================================================

export type SupabaseServerClientType = ReturnType<typeof createServerClient<Database>>;

/**
 * 서버용 Supabase 클라이언트
 */
export function getSupabaseServerClient(
  cookies: () => { name: string; value: string }[]
): SupabaseServerClientType | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isDevelopment) {
      logger.warn('[DEV] Supabase 미설정');
      return null;
    }
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookies();
      },
      setAll() {
        // Response cookies handled separately
      },
    },
  });
}

// ============================================================================
// Service Role 클라이언트 (서버 전용, 관리자 권한)
// ============================================================================

/**
 * Service Role 클라이언트 (서버 전용)
 * 주의: 브라우저에서 절대 사용하지 않을 것!
 */
export function getSupabaseServiceClient(): SupabaseClientType | null {
  if (typeof window !== 'undefined') {
    throw new Error('Service Role 클라이언트는 서버에서만 사용 가능합니다');
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    if (isDevelopment) {
      logger.warn('[DEV] Supabase Service Role 미설정');
      return null;
    }
    throw new Error('Supabase Service Role 환경 변수가 설정되지 않았습니다');
  }

  // 서버 전용 클라이언트 생성 (createBrowserClient로 대체)
  return createBrowserClient<Database>(supabaseUrl, serviceRoleKey);
}

const supabaseClients = {
  getSupabaseBrowserClient,
  getSupabaseServerClient,
  getSupabaseServiceClient,
};

export default supabaseClients;
