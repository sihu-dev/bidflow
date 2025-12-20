/**
 * @module validation/env
 * @description 환경 변수 검증 (앱 시작 시 실행)
 */

import { z } from 'zod';

// ============================================================================
// 환경 변수 스키마
// ============================================================================

const envSchema = z.object({
  // Node 환경
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('유효한 Supabase URL이 필요합니다'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key가 필요합니다'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase Service Role Key가 필요합니다'),

  // Claude AI
  ANTHROPIC_API_KEY: z.string().min(1, 'Anthropic API Key가 필요합니다'),

  // Upstash Redis (Rate Limiting)
  UPSTASH_REDIS_REST_URL: z.string().url('유효한 Upstash Redis URL이 필요합니다'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'Upstash Redis Token이 필요합니다'),

  // 공공 데이터 API (선택)
  NARA_JANGTO_API_KEY: z.string().optional(),
  KEPCO_API_KEY: z.string().optional(),
  KWATER_API_KEY: z.string().optional(),
  KOTRA_API_KEY: z.string().optional(),

  // 알림 (선택)
  KAKAO_ALIMTALK_API_KEY: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),

  // 앱 설정
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3010'),

  // CSRF
  CSRF_SECRET: z.string().min(32, 'CSRF Secret은 최소 32자 이상이어야 합니다'),
});

// ============================================================================
// 환경 변수 검증 및 익스포트
// ============================================================================

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * 환경 변수 검증
 * @throws {Error} 필수 환경 변수가 누락된 경우
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`);

    console.error('❌ 환경 변수 검증 실패:');
    console.error(errors.join('\n'));

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`환경 변수 검증 실패:\n${errors.join('\n')}`);
    } else {
      console.warn('⚠️ 개발 환경에서는 경고만 표시합니다');
    }
  }

  validatedEnv = parsed.data ?? ({} as Env);
  return validatedEnv;
}

/**
 * 안전한 환경 변수 접근
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    return validateEnv();
  }
  return validatedEnv;
}

/**
 * 특정 환경 변수 존재 확인
 */
export function hasEnv(key: keyof Env): boolean {
  const env = getEnv();
  return key in env && env[key] !== undefined && env[key] !== '';
}

/**
 * API Key 마스킹 (로깅용)
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

// ============================================================================
// 시작 시 검증 (개발용)
// ============================================================================

if (typeof window === 'undefined') {
  // 서버 사이드에서만 실행
  try {
    validateEnv();
    console.log('✅ 환경 변수 검증 완료');
  } catch {
    // 에러는 이미 위에서 처리됨
  }
}
