# BIDFLOW V2 Beta Design Document
## Part 5: Operations, Security & Roadmap

> GPT 5.2 Pro 검수용 마스터 설계 문서
> Version: 2.0-beta
> Date: 2025-12-21

---

# 8. Operations & Security

## 8.1 Environment Configuration

### 8.1.1 Environment Variables

```bash
# .env.example

# ========================================
# Supabase Configuration
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Server-side only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# ========================================
# External API Keys
# ========================================
# TED API (EU Public Procurement)
TED_API_KEY=ted_xxxxxxxxxxxxxxxxxx
TED_API_BASE_URL=https://ted.europa.eu/api/v3.0

# SAM.gov API (US Federal Procurement)
SAM_GOV_API_KEY=sam_xxxxxxxxxxxxxxxxxx
SAM_GOV_API_BASE_URL=https://api.sam.gov/opportunities/v2

# G2B API (Korea - 확인 후 추가)
# G2B_API_KEY=
# G2B_API_BASE_URL=

# ========================================
# Scheduler (Inngest)
# ========================================
INNGEST_EVENT_KEY=inngest_xxxxxxxxxx
INNGEST_SIGNING_KEY=signkey_xxxxxxxxxx

# ========================================
# Notifications (Optional)
# ========================================
# Email
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=noreply@bidflow.co.kr

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# ========================================
# Application
# ========================================
NEXT_PUBLIC_APP_URL=https://bidflow.co.kr
NODE_ENV=production

# ========================================
# Monitoring
# ========================================
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 8.1.2 Secret Management Rules

```yaml
Security Rules:

1. NEVER expose in client:
   - SUPABASE_SERVICE_ROLE_KEY
   - *_API_KEY (all API keys)
   - INNGEST_SIGNING_KEY
   - Database connection strings

2. Client-safe (NEXT_PUBLIC_*):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_APP_URL

3. Log masking:
   - All API keys masked in logs
   - User PII masked (email, phone)
   - Implement log sanitizer middleware

4. Rotation policy:
   - API keys: every 90 days
   - Service role key: every 180 days
   - Immediate rotation on suspected compromise
```

---

## 8.2 Security Architecture

### 8.2.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Authentication Flow                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │  Client  │────▶│  Supabase    │────▶│  JWT Token   │                 │
│  │  (User)  │     │  Auth        │     │  Generation  │                 │
│  └──────────┘     └──────────────┘     └──────────────┘                 │
│       │                                       │                          │
│       │                                       ▼                          │
│       │              ┌─────────────────────────────────────────┐        │
│       │              │  JWT Payload                             │        │
│       │              │  {                                       │        │
│       │              │    "sub": "user-uuid",                   │        │
│       │              │    "email": "user@example.com",          │        │
│       │              │    "role": "authenticated",              │        │
│       │              │    "app_metadata": {                     │        │
│       │              │      "tenant_id": "cmntech-uuid",        │        │
│       │              │      "user_role": "admin"                │        │
│       │              │    }                                     │        │
│       │              │  }                                       │        │
│       │              └─────────────────────────────────────────┘        │
│       │                                       │                          │
│       │                                       ▼                          │
│       │              ┌─────────────────────────────────────────┐        │
│       ▼              │  RLS Policy Enforcement                  │        │
│  ┌──────────┐       │  • tenant_id = auth.jwt().tenant_id      │        │
│  │  API     │──────▶│  • role checks for admin operations      │        │
│  │  Request │       │  • Data isolation per tenant             │        │
│  └──────────┘       └─────────────────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2.2 API Security

```typescript
// src/lib/security/api-middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export interface SecurityContext {
  userId: string;
  tenantId: string;
  role: 'admin' | 'member';
  isAuthenticated: boolean;
}

/**
 * API 보안 미들웨어
 */
export async function withSecurity(
  request: NextRequest,
  handler: (ctx: SecurityContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 1. Supabase 클라이언트 생성
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // 2. 사용자 세션 확인
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 3. 프로필 조회 (tenant_id, role)
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 403 }
      );
    }

    // 4. 보안 컨텍스트 생성
    const ctx: SecurityContext = {
      userId: user.id,
      tenantId: profile.tenant_id,
      role: profile.role as 'admin' | 'member',
      isAuthenticated: true,
    };

    // 5. 핸들러 실행
    return await handler(ctx);
  } catch (e) {
    console.error('Security middleware error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Admin 전용 래퍼
 */
export async function withAdminOnly(
  request: NextRequest,
  handler: (ctx: SecurityContext) => Promise<NextResponse>
): Promise<NextResponse> {
  return withSecurity(request, async (ctx) => {
    if (ctx.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    return handler(ctx);
  });
}
```

### 8.2.3 Input Validation

```typescript
// src/lib/validation/schemas.ts

import { z } from 'zod';

// 공통 스키마
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const dateSchema = z.coerce.date();

// 제품 스키마
export const productSchema = z.object({
  name: z.string().min(1).max(100),
  modelNumber: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  keywords: z.object({
    primary: z.array(z.string().max(50)).max(20),
    secondary: z.array(z.string().max(50)).max(30),
    specs: z.array(z.string().max(50)).max(20),
    exclude: z.array(z.string().max(50)).max(20),
  }),
  specs: z.record(z.unknown()).optional(),
  isActive: z.boolean().default(true),
});

// 검색 필터 스키마
export const bidFilterSchema = z.object({
  sources: z.array(z.enum(['ted', 'sam_gov', 'g2b', 'g2b_stub'])).optional(),
  minScore: z.number().min(0).max(175).optional(),
  maxScore: z.number().min(0).max(175).optional(),
  fromDate: dateSchema.optional(),
  toDate: dateSchema.optional(),
  status: z.enum(['active', 'expired', 'cancelled']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// 수집 요청 스키마 (Admin)
export const ingestRequestSchema = z.object({
  source: z.enum(['ted', 'sam_gov', 'g2b', 'all']),
  fromDate: dateSchema.optional(),
  toDate: dateSchema.optional(),
  maxResults: z.number().min(1).max(1000).default(100),
});
```

### 8.2.4 Rate Limiting

```typescript
// src/lib/security/rate-limiter.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Redis 클라이언트 (Upstash)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Rate limiter 인스턴스
export const rateLimiter = {
  // API 일반 요청: 100 req/min
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
  }),

  // 수집 요청: 10 req/hour
  ingest: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:ingest',
  }),

  // 인증 요청: 10 req/min
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:auth',
  }),
};

/**
 * Rate limit 체크
 */
export async function checkRateLimit(
  type: keyof typeof rateLimiter,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = rateLimiter[type];
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}
```

---

## 8.3 Monitoring & Health

### 8.3.1 Health Check Endpoint

```typescript
// src/app/api/v1/health/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: ComponentHealth;
    connectors: {
      ted: ComponentHealth;
      sam_gov: ComponentHealth;
      g2b: ComponentHealth;
    };
    lastSync: {
      timestamp: string | null;
      bidCount: number;
    };
  };
}

interface ComponentHealth {
  status: 'up' | 'down' | 'unknown';
  latency?: number;
  error?: string;
}

export async function GET() {
  const startTime = Date.now();

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0-beta',
    checks: {
      database: { status: 'unknown' },
      connectors: {
        ted: { status: 'unknown' },
        sam_gov: { status: 'unknown' },
        g2b: { status: 'unknown' },
      },
      lastSync: {
        timestamp: null,
        bidCount: 0,
      },
    },
  };

  // Database check
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const dbStart = Date.now();
    const { count, error } = await supabase
      .from('bids')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    health.checks.database = {
      status: 'up',
      latency: Date.now() - dbStart,
    };

    // Last sync info
    const { data: lastBid } = await supabase
      .from('bids')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    health.checks.lastSync = {
      timestamp: lastBid?.created_at || null,
      bidCount: count || 0,
    };
  } catch (e) {
    health.checks.database = {
      status: 'down',
      error: e instanceof Error ? e.message : 'Unknown error',
    };
    health.status = 'unhealthy';
  }

  // Connector status check
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: sources } = await supabase
      .from('sources')
      .select('id, status, last_error');

    if (sources) {
      for (const source of sources) {
        const connectorKey = source.id as keyof typeof health.checks.connectors;
        if (health.checks.connectors[connectorKey]) {
          health.checks.connectors[connectorKey] = {
            status: source.status === 'error' ? 'down' : 'up',
            error: source.last_error || undefined,
          };

          if (source.status === 'error') {
            health.status = 'degraded';
          }
        }
      }
    }
  } catch (e) {
    // Connector check failure doesn't make system unhealthy
  }

  const statusCode = health.status === 'healthy' ? 200 :
                     health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

### 8.3.2 Logging Standards

```typescript
// src/lib/logging/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// PII 마스킹 패턴
const MASK_PATTERNS = [
  { pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, replacement: '***@$2' },
  { pattern: /api[_-]?key[=:]\s*['"]?([a-zA-Z0-9_-]+)['"]?/gi, replacement: 'api_key=***' },
  { pattern: /bearer\s+([a-zA-Z0-9._-]+)/gi, replacement: 'Bearer ***' },
  { pattern: /password[=:]\s*['"]?([^'"&\s]+)['"]?/gi, replacement: 'password=***' },
];

function maskSensitiveData(data: unknown): unknown {
  if (typeof data === 'string') {
    let masked = data;
    for (const { pattern, replacement } of MASK_PATTERNS) {
      masked = masked.replace(pattern, replacement);
    }
    return masked;
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  if (typeof data === 'object' && data !== null) {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // 민감한 키 완전 마스킹
      if (/password|secret|key|token|credential/i.test(key)) {
        masked[key] = '***';
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
}

export function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: context ? maskSensitiveData(context) as Record<string, unknown> : undefined,
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    log('warn', message, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) =>
    log('error', message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    }),
};
```

---

## 8.4 Deployment

### 8.4.1 Vercel Configuration

```json
// vercel.json

{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "regions": ["icn1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    },
    "src/app/api/v1/admin/ingest/**/*.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/v1/cron/sync-ted",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/v1/cron/sync-sam",
      "schedule": "0 */6 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 8.4.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test

  deploy-preview:
    needs: quality
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy to Preview
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy to Production
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Health Check
        run: |
          sleep 30
          curl -f ${{ secrets.PRODUCTION_URL }}/api/v1/health || exit 1
```

---

# 9. Quality Gates

## 9.1 Pre-Commit Checks

```yaml
# 모든 커밋 전 통과 필수

1. Type Check:
   Command: pnpm typecheck
   Criteria: No TypeScript errors

2. Lint Check:
   Command: pnpm lint
   Criteria: No ESLint errors (warnings OK)

3. Build Check:
   Command: pnpm build
   Criteria: Build succeeds

4. Unit Tests:
   Command: pnpm test
   Criteria: All tests pass

5. E2E Tests (PR only):
   Command: pnpm test:e2e
   Criteria: All E2E tests pass
```

## 9.2 Connector Quality Gates

```typescript
// tests/connectors/ted-connector.test.ts

import { describe, it, expect } from 'vitest';
import { TEDConnector } from '@/lib/connectors/ted-connector';
import { NormalizedBid } from '@/lib/connectors/types';

describe('TEDConnector', () => {
  const connector = new TEDConnector();

  it('should normalize TED notice to standard format', () => {
    const rawNotice = {
      ND: 'TED-2024-123456',
      TI: 'Ultrasonic Flow Meters',
      CY: 'DE',
      TW: 'Berlin',
      AA: 'Berlin Water Authority',
      DD: '20250215',
      NC: 'Supplies',
      PC: '38423000',
    };

    const normalized = connector.normalize(rawNotice);

    // 필수 필드 검증
    expect(normalized.sourceId).toBe('ted');
    expect(normalized.sourceNoticeId).toBe('TED-2024-123456');
    expect(normalized.title).toBe('Ultrasonic Flow Meters');
    expect(normalized.country).toBe('DE');
    expect(normalized.organization).toBe('Berlin Water Authority');

    // 타입 검증
    expect(normalized).toMatchObject<Partial<NormalizedBid>>({
      sourceId: expect.any(String),
      sourceNoticeId: expect.any(String),
      title: expect.any(String),
      contentHash: expect.any(String),
    });
  });

  it('should generate unique content hash', () => {
    const notice1 = connector.normalize({
      ND: '1', TI: 'Test 1', CY: 'DE', AA: 'Org 1', DD: '20250101',
    });
    const notice2 = connector.normalize({
      ND: '2', TI: 'Test 2', CY: 'DE', AA: 'Org 2', DD: '20250101',
    });

    expect(notice1.contentHash).not.toBe(notice2.contentHash);
  });
});
```

---

# 10. Implementation Roadmap

## 10.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BIDFLOW V2 Implementation Roadmap                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Week 1-2: Foundation                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  □ PR#1: DB migrations + seed + RLS                                     │
│  □ PR#2: Security middleware + validation                               │
│                                                                          │
│  Week 3-4: Connectors                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  □ PR#3: Connector framework + base class                               │
│  □ PR#4: TED connector implementation                                   │
│  □ PR#5: SAM.gov connector implementation                               │
│  □ PR#6: G2B stub connector                                             │
│                                                                          │
│  Week 5-6: Matching & UI                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  □ PR#7: Enhanced matcher + 175-point system                            │
│  □ PR#8: Matching pipeline + auto-run                                   │
│  □ PR#9: Dashboard UI update                                            │
│  □ PR#10: Bid list + detail pages                                       │
│                                                                          │
│  Week 7-8: Polish & Demo                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  □ PR#11: Competitor analysis page                                      │
│  □ PR#12: Health endpoint + monitoring                                  │
│  □ PR#13: Demo script + documentation                                   │
│  □ CMNTech 5분 데모 준비                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 10.2 Detailed Task Breakdown

### Phase 1: Foundation (Week 1-2)

```yaml
PR#1: Database & Seed
  Priority: P0 (Critical)
  Owner: Backend
  Tasks:
    - [ ] tenants 테이블 생성
    - [ ] profiles 테이블 생성
    - [ ] sources 테이블 생성
    - [ ] products 테이블 생성
    - [ ] bids 테이블 생성
    - [ ] matches 테이블 생성
    - [ ] RLS 정책 적용
    - [ ] CMNTech seed 데이터
    - [ ] CMNTech 5개 제품 seed
  Verification:
    - pnpm db:migrate 성공
    - Supabase Studio에서 데이터 확인
    - RLS 정책 테스트

PR#2: Security Infrastructure
  Priority: P0 (Critical)
  Owner: Backend
  Tasks:
    - [ ] API 보안 미들웨어
    - [ ] Zod 스키마 정의
    - [ ] Rate limiter 설정
    - [ ] 로깅 유틸리티
    - [ ] 환경변수 검증
  Verification:
    - 인증 없는 API 접근 차단
    - 잘못된 입력 거부
    - 로그에 PII 마스킹 확인
```

### Phase 2: Connectors (Week 3-4)

```yaml
PR#3: Connector Framework
  Priority: P0 (Critical)
  Owner: Backend
  Tasks:
    - [ ] BaseConnector 추상 클래스
    - [ ] NormalizedBid 인터페이스
    - [ ] Rate limiting 구현
    - [ ] Retry 로직 구현
    - [ ] 해시 생성 유틸
  Verification:
    - 단위 테스트 통과
    - 인터페이스 문서화

PR#4: TED Connector
  Priority: P0 (Critical)
  Owner: Backend
  Tasks:
    - [ ] TED API 인증 설정
    - [ ] 검색 쿼리 빌더
    - [ ] 응답 파싱
    - [ ] 정규화 로직
    - [ ] 에러 처리
  Verification:
    - 실제 TED API 호출 성공
    - 최소 10개 공고 수집
    - DB 저장 확인
    - 중복 제거 확인

PR#5: SAM.gov Connector
  Priority: P0 (Critical)
  Owner: Backend
  Tasks:
    - [ ] SAM.gov API 키 발급
    - [ ] 검색 파라미터 설정
    - [ ] 응답 파싱
    - [ ] 정규화 로직
  Verification:
    - 실제 SAM.gov API 호출 성공
    - 최소 10개 공고 수집

PR#6: G2B Stub Connector
  Priority: P1 (High)
  Owner: Backend
  Tasks:
    - [ ] 테스트 데이터 생성기
    - [ ] 한국 소스 전략 문서
  Verification:
    - 스텁 데이터 생성 확인
    - 문서: docs/SOURCES_STRATEGY.md
```

### Phase 3: Matching & UI (Week 5-6)

```yaml
PR#7: Enhanced Matcher
  Priority: P0 (Critical)
  Owner: Backend
  Tasks:
    - [ ] 175점 스코어링 시스템
    - [ ] 키워드 매칭 (100점)
    - [ ] 스펙 매칭 (25점)
    - [ ] 기관 매칭 (50점)
    - [ ] 액션 결정 로직
  Verification:
    - 단위 테스트 100% 커버리지
    - CMNTech 제품으로 테스트

PR#8: Matching Pipeline
  Priority: P0 (Critical)
  Owner: Backend
  Tasks:
    - [ ] 배치 매칭 실행기
    - [ ] 매칭 결과 저장
    - [ ] 수동 실행 API
    - [ ] 스케줄러 연동
  Verification:
    - /api/v1/admin/match 동작
    - 매칭 결과 DB 저장

PR#9: Dashboard UI
  Priority: P1 (High)
  Owner: Frontend
  Tasks:
    - [ ] 알림 카드 컴포넌트
    - [ ] 소스별 현황 차트
    - [ ] 추천 공고 TOP 3
    - [ ] 성과 요약 카드
  Verification:
    - 반응형 디자인
    - 실제 데이터 표시

PR#10: Bid List & Detail
  Priority: P1 (High)
  Owner: Frontend
  Tasks:
    - [ ] 공고 카드 컴포넌트
    - [ ] 필터/정렬 기능
    - [ ] 매칭 점수 시각화
    - [ ] 공고 상세 페이지
  Verification:
    - 페이지네이션 동작
    - 소스별 필터링
    - 점수별 정렬
```

### Phase 4: Polish & Demo (Week 7-8)

```yaml
PR#11: Competitor Analysis
  Priority: P2 (Medium)
  Owner: Frontend
  Tasks:
    - [ ] 시장 점유율 차트
    - [ ] 트렌드 그래프
    - [ ] 경쟁사 이벤트 피드
    - [ ] 인사이트 섹션
  Verification:
    - 샘플 데이터로 UI 확인

PR#12: Operations
  Priority: P1 (High)
  Owner: Backend
  Tasks:
    - [ ] /api/v1/health 엔드포인트
    - [ ] 모니터링 훅
    - [ ] 로그 구조화
    - [ ] 에러 추적 (Sentry)
  Verification:
    - 헬스체크 200 응답
    - 구조화된 로그 출력

PR#13: Documentation
  Priority: P1 (High)
  Owner: All
  Tasks:
    - [ ] docs/DEMO_SCRIPT_CMNTECH.md
    - [ ] docs/SOURCES_STRATEGY.md
    - [ ] docs/SECURITY_NOTES.md
    - [ ] docs/OPS_RUNBOOK.md
  Verification:
    - 문서 완성도 리뷰
    - 5분 데모 리허설
```

---

## 10.3 Success Criteria

### Demo Success Criteria

```yaml
5분 데모 성공 기준:

1. 통합 화면 (Must):
   - 국내/해외 공고가 같은 화면에 표시됨
   - 최소 20개 이상 공고 리스트업

2. 매칭 결과 (Must):
   - CMNTech 5개 제품별 매칭 점수 표시
   - 점수 산정 이유 표시 (키워드/스펙/기관)
   - BID/REVIEW/SKIP 권장 액션 표시

3. 글로벌 실동작 (Must):
   - TED API로 EU 공고 실제 수집
   - SAM.gov API로 US 공고 실제 수집
   - 수집된 공고가 DB에 저장됨

4. 데모 플로우 (Must):
   - 대시보드 → 공고 목록 → 상세 → 경쟁 분석
   - 5분 내 전체 시연 가능
   - 김영수 과장 관점의 스토리텔링

5. 안정성 (Must):
   - 헬스체크 엔드포인트 정상
   - 에러 발생 시 우아한 처리
   - 로딩 상태 표시
```

### Technical Success Criteria

```yaml
기술 성공 기준:

1. 품질 게이트 (All Pass):
   - pnpm typecheck ✓
   - pnpm lint ✓
   - pnpm build ✓
   - pnpm test ✓

2. 보안 (All Pass):
   - RLS 정책 적용됨
   - 서비스 키 클라이언트 미노출
   - API Rate limiting 동작

3. 성능:
   - 대시보드 LCP < 2.5s
   - API 응답 < 500ms (p95)
   - 빌드 사이즈 < 500KB (First Load JS)

4. 문서 (All Complete):
   - 데모 스크립트
   - 소스 전략
   - 보안 가이드
   - 운영 런북
```

---

# 11. Appendix

## 11.1 Document Index

```
docs/
├── DEMO_SCRIPT_CMNTECH.md    # 5분 데모 대본 (한글)
├── SOURCES_STRATEGY.md       # 소스 확장 전략
├── SECURITY_NOTES.md         # 보안 가이드
├── OPS_RUNBOOK.md           # 운영 런북
├── API_REFERENCE.md         # API 문서 (자동 생성)
└── CHANGELOG.md             # 변경 이력
```

## 11.2 API Endpoints Summary

```yaml
Public APIs:
  GET  /api/v1/health              # 헬스체크

Authenticated APIs:
  GET  /api/v1/bids                # 공고 목록
  GET  /api/v1/bids/:id            # 공고 상세
  GET  /api/v1/matches             # 매칭 결과 목록
  GET  /api/v1/matches/:id         # 매칭 상세
  PUT  /api/v1/matches/:id/action  # 매칭 액션 업데이트
  GET  /api/v1/products            # 제품 목록
  POST /api/v1/products            # 제품 추가
  PUT  /api/v1/products/:id        # 제품 수정
  GET  /api/v1/competitors         # 경쟁사 분석

Admin APIs:
  POST /api/v1/admin/ingest        # 수동 수집 실행
  GET  /api/v1/admin/sources       # 소스 상태
  POST /api/v1/admin/match         # 수동 매칭 실행
```

## 11.3 Glossary

```yaml
용어 정의:

Tenant: 고객사 (예: CMNTech)
Bid: 입찰 공고 (정규화된 형태)
Match: 제품-공고 매칭 결과
Source: 데이터 소스 (TED, SAM.gov, G2B 등)
Connector: 소스별 데이터 수집기
RLS: Row Level Security (행 수준 보안)
175-Point: 키워드(100) + 스펙(25) + 기관(50) 점수 체계

TED: Tenders Electronic Daily (EU 공식 입찰)
SAM.gov: System for Award Management (US 연방 입찰)
G2B: Government to Business (한국 나라장터)
CPV: Common Procurement Vocabulary (EU 품목 분류)
NAICS: North American Industry Classification System (미국 산업 분류)
```

---

## 11.4 Contact & Support

```yaml
Project Lead: BIDFLOW Team
Repository: https://github.com/bidflow/bidflow
Documentation: https://docs.bidflow.co.kr

Issue Tracking: GitHub Issues
Emergency Contact: ops@bidflow.co.kr
```

---

*End of BIDFLOW V2 Beta Design Document*

*Total: 5 Parts, ~150 pages equivalent*
*Last Updated: 2025-12-21*
*Author: Claude Opus 4.5*
