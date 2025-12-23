# BIDFLOW 보안 감사 보고서

**감사 일시**: 2025-12-23  
**감사 대상**: BIDFLOW v0.1.0  
**감사 범위**: OWASP Top 10 + API 보안 + 의존성 취약점  
**보고자**: Claude Code Security Auditor

---

## 📊 요약 (Executive Summary)

| 구분 | 발견 건수 |
|------|----------|
| 🔴 **Critical** | 0 |
| 🟠 **High** | 1 |
| 🟡 **Medium** | 3 |
| 🔵 **Low** | 2 |
| **총계** | **6건** |

### 종합 평가

**보안 등급**: B+ (양호)

- ✅ **강점**: 5계층 보안 아키텍처 완성, 의존성 취약점 0건
- ⚠️ **주의**: Public API 엔드포인트 보안 강화 필요
- 🎯 **권장**: CSP 헤더 추가, 프로덕션 환경 로깅 개선

---

## 🔍 상세 취약점 분석

### [HIGH-001] Contact API Rate Limiting 미적용

**위치**: `/src/app/api/v1/contact/route.ts:28`  
**CVSS 점수**: 7.5 (High)  
**CWE**: CWE-770 (Allocation of Resources Without Limits or Throttling)

#### 설명
Contact 폼 API가 Rate Limiting 없이 공개되어 있어 다음 위험이 존재:
- **스팸 공격**: 자동화된 폼 제출로 DB 오염
- **DDoS 가능성**: 대량 요청으로 서버 리소스 고갈
- **알림 폭탄**: Slack/Email 알림 서비스 과부하

#### PoC (개념 증명)
```bash
# 1초에 1000회 요청 시뮬레이션
for i in {1..1000}; do
  curl -X POST http://localhost:3010/api/v1/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"spam","email":"spam@test.com","inquiryType":"demo","message":"automated spam"}' &
done
```

#### 영향도
- 😱 Slack 웹훅 제한 초과 → 알림 차단
- 💰 이메일 발송 비용 급증 (Resend 종량제)
- 🗄️ DB 저장 공간 낭비
- 📊 데이터 분석 왜곡 (스팸 데이터)

#### 해결 방안

**Option A - IP 기반 Rate Limit (추천)**
```typescript
// src/app/api/v1/contact/route.ts
import { withRateLimit } from '@/lib/security/rate-limiter';

export const POST = withRateLimit(
  handlePost,
  { 
    type: 'api',
    // 추가 제한: Contact 전용
    customLimit: { requests: 3, window: '1 h' } 
  }
);
```

**Option B - Turnstile CAPTCHA 추가**
```typescript
// 1시간당 3회 초과 시 CAPTCHA 요구
if (requestCount > 3) {
  // Cloudflare Turnstile 검증
  const captchaValid = await validateTurnstile(token);
  if (!captchaValid) return 403;
}
```

**Option C - Honeypot 필드**
```tsx
{/* 숨겨진 필드 - 봇이 채우면 거부 */}
<input type="text" name="website" style={{ display: 'none' }} />
```

#### 참조
- [OWASP API Security - API4:2023 Unrestricted Resource Consumption](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)

---

### [MEDIUM-002] Content-Security-Policy (CSP) 헤더 누락

**위치**: `/next.config.ts:51-70`  
**CVSS 점수**: 5.3 (Medium)  
**CWE**: CWE-1021 (Improper Restriction of Rendered UI Layers)

#### 설명
현재 보안 헤더에 CSP가 없어 다음 위험:
- XSS 공격 시 피해 확대
- Clickjacking 고급 기법 방어 부족
- 외부 스크립트 주입 가능성

#### 현재 상태
```typescript
// next.config.ts - CSP 없음
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // ❌ CSP 누락
]
```

#### 해결 방안
```typescript
// next.config.ts
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // HyperFormula 필요
    "style-src 'self' 'unsafe-inline'", // Tailwind 필요
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://*.anthropic.com",
    "frame-ancestors 'none'",
  ].join('; ')
}
```

**⚠️ 주의**: `unsafe-inline`, `unsafe-eval`은 HyperFormula 엔진 때문에 필요. 대안:
1. Nonce 기반 CSP로 업그레이드
2. HyperFormula를 Web Worker로 격리

---

### [MEDIUM-003] CORS 정책 명시적 관리 부재

**위치**: `/src/app/api/v1/contact/route.ts:201`  
**CVSS 점수**: 4.3 (Medium)

#### 설명
Contact API가 `Access-Control-Allow-Origin: *`로 모든 도메인 허용:

```typescript
// 현재 - 모든 도메인 허용
'Access-Control-Allow-Origin': '*'
```

#### 위험
- CSRF 공격 확률 증가
- 비인가 사이트에서 API 악용 가능
- 브랜드 도용 (fake 랜딩 페이지)

#### 해결 방안
```typescript
// src/lib/security/cors.ts (신규 파일)
const ALLOWED_ORIGINS = [
  'https://bidflow.io',
  'https://www.bidflow.io',
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NODE_ENV === 'development' ? 'http://localhost:3010' : null,
].filter(Boolean);

export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin === allowed);
}

// route.ts
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowed = validateOrigin(origin);
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowed ? origin! : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

---

### [MEDIUM-004] 개발 환경 Mock 인증 프로덕션 유출 위험

**위치**: `/src/lib/security/auth-middleware.ts:17-22`  
**CVSS 점수**: 5.5 (Medium)

#### 설명
개발 환경에서 사용하는 Mock 사용자가 `NODE_ENV` 체크만으로 분기:

```typescript
// 현재 코드
const isDevelopment = process.env.NODE_ENV !== 'production';

if (!supabase && isDevelopment) {
  // Mock 사용자 사용
  authenticatedRequest.userId = DEV_MOCK_USER.id;
  authenticatedRequest.userRole = 'admin'; // ⚠️ 항상 admin!
}
```

#### 위험 시나리오
1. 환경 변수 설정 실수 (`NODE_ENV=development` 프로덕션 배포)
2. Supabase 장애 시 모든 사용자가 admin 권한 획득

#### 해결 방안
```typescript
// 더 강력한 검증
const ALLOW_MOCK_AUTH = process.env.ALLOW_MOCK_AUTH === 'true';
const isDevelopment = process.env.NODE_ENV !== 'production';

if (!supabase) {
  if (isDevelopment && ALLOW_MOCK_AUTH && process.env.VERCEL_ENV !== 'production') {
    // Mock 사용
  } else {
    // 무조건 에러 반환
    throw new Error('인증 서비스 초기화 실패');
  }
}
```

**추가 체크**:
- `VERCEL_ENV === 'production'` → Vercel 배포 감지
- `.env.production` 파일에 `ALLOW_MOCK_AUTH=false` 명시

---

### [LOW-005] API 응답에 스택 트레이스 노출 가능성

**위치**: 다수의 API 엔드포인트  
**CVSS 점수**: 3.1 (Low)

#### 설명
일부 catch 블록에서 에러 객체를 직접 로깅:

```typescript
// src/app/api/v1/bids/route.ts:64
catch (error) {
  logger.error('GET /api/v1/bids 오류:', error);
  // ❓ error 객체에 스택 트레이스 포함
}
```

프로덕션에서 `logger.error`가 콘솔에 출력되면 민감 정보 노출 가능.

#### 해결 방안
```typescript
// src/lib/utils/logger.ts 개선
export class Logger {
  error(message: string, error?: unknown) {
    if (this.isDevelopment) {
      console.error(message, error);
    } else {
      // 프로덕션: 스택 트레이스 제거
      console.error(message, {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        // stack 제거
      });
      
      // Sentry/DataDog 등 모니터링 서비스로 전송
      // sentryClient.captureException(error);
    }
  }
}
```

---

### [LOW-006] Supabase Service Role Key 클라이언트 노출 위험

**위치**: `/src/lib/domain/repositories/bid-repository.ts:556`  
**CVSS 점수**: 2.3 (Low)

#### 설명
Service Role Key가 서버 컴포넌트에서만 사용되지만, 번들러 설정 실수 시 클라이언트에 노출 가능.

```typescript
// bid-repository.ts
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// ✅ 서버 전용이지만 명시적 보호 없음
```

#### 해결 방안
```typescript
// 서버 전용 모듈임을 명시
// bid-repository.ts 첫 줄
import 'server-only'; // Next.js 15+ 에서 제공

// 또는 런타임 체크
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server');
}
```

---

## ✅ 양호한 보안 구현 (Best Practices)

### 1. 5계층 보안 아키텍처
```
Layer 1: 인증 (withAuth)          ✅
Layer 2: 권한 (allowedRoles)      ✅
Layer 3: Rate Limiting             ✅
Layer 4: CSRF 보호                 ✅
Layer 5: 입력 검증 (Zod)           ✅
```

### 2. Prompt Injection 방어
- 58개 위험 패턴 감지
- DOMPurify 기반 XSS 정제
- AI 함수 화이트리스트

### 3. 의존성 관리
```json
{
  "vulnerabilities": {
    "critical": 0,
    "high": 0,
    "moderate": 0,
    "low": 0,
    "total": 0
  }
}
```

### 4. 환경 변수 검증
- Zod 스키마 기반 검증
- 필수 변수 누락 시 앱 시작 차단
- API Key 마스킹 함수

### 5. SQL Injection 방지
- Supabase ORM 사용 (Parameterized Query)
- Raw SQL 사용 0건

---

## 🎯 우선순위별 조치 계획

### 즉시 수정 (24시간 내)
- [ ] **[HIGH-001]** Contact API Rate Limiting 적용
- [ ] **[MEDIUM-004]** Mock 인증 프로덕션 유출 방지

### 단기 개선 (1주일 내)
- [ ] **[MEDIUM-002]** CSP 헤더 추가
- [ ] **[MEDIUM-003]** CORS 화이트리스트 구현
- [ ] **[LOW-005]** 프로덕션 로거 개선

### 장기 강화 (다음 릴리즈)
- [ ] **[LOW-006]** `server-only` 임포트 추가
- [ ] Sentry/DataDog 통합
- [ ] 보안 테스트 자동화 (SAST)
- [ ] Penetration Testing (외부 업체)

---

## 📋 보안 체크리스트 (프로덕션 배포 전)

### 환경 변수
- [x] `.env` 파일 `.gitignore` 포함
- [x] 환경 변수 Zod 검증
- [ ] Vercel 환경 변수 설정 완료
- [ ] `ALLOW_MOCK_AUTH=false` 확인

### 인증 & 권한
- [x] 모든 API에 인증 적용
- [x] 역할 기반 권한 체크
- [ ] 세션 타임아웃 설정 (Supabase)
- [ ] Refresh Token 로테이션

### Rate Limiting
- [x] API 엔드포인트 Rate Limit
- [ ] Contact 폼 Rate Limit ⚠️
- [ ] AI 호출 별도 제한
- [ ] Upstash Redis 프로덕션 인스턴스

### 보안 헤더
- [x] X-Frame-Options
- [x] X-Content-Type-Options
- [x] X-XSS-Protection
- [x] Referrer-Policy
- [ ] Content-Security-Policy ⚠️
- [ ] Strict-Transport-Security (HTTPS only)

### 모니터링
- [ ] 에러 트래킹 (Sentry)
- [ ] 성능 모니터링 (Vercel Analytics)
- [ ] 보안 이벤트 로깅
- [ ] 알림 임계값 설정

---

## 🔬 테스트 권장 사항

### 1. 침투 테스트 (Manual)
```bash
# SQL Injection
curl -X POST /api/v1/bids -d '{"title":"test' OR '1'='1"}'

# XSS
curl -X POST /api/v1/contact -d '{"message":"<script>alert(1)</script>"}'

# CSRF
# (브라우저에서 외부 사이트에서 요청 시도)

# Rate Limit
# (1000회 연속 요청)
```

### 2. 자동화 스캔
```bash
# OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3010

# npm audit
npm audit --production

# Snyk
npx snyk test
```

---

## 📚 참고 자료

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security Guide](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-23 | 1.0.0 | 초기 보안 감사 보고서 작성 |

---

**보고서 종료**  
**다음 감사 예정**: 2025-01-23 (월 1회 권장)
