# BIDFLOW 입찰 자동화 시스템

> **목적**: 제조업 SME를 위한 입찰 자동화
> **기술 스택**: Next.js 15 + Supabase + TailwindCSS
> **포트**: 3010

---

## 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 3. 개발 서버 시작
pnpm dev
```

---

## 프로젝트 구조

```
bidflow-standalone/
├── bidflow/                    # Next.js 앱
│   ├── src/
│   │   ├── app/api/v1/        # API v1 버저닝
│   │   ├── lib/
│   │   │   ├── security/      # 인증, Rate Limit, CSRF
│   │   │   ├── validation/    # Zod 스키마
│   │   │   ├── domain/        # Repository, Use Cases
│   │   │   └── clients/       # TED API, 나라장터
│   │   └── components/        # UI 컴포넌트
│   └── supabase/migrations/   # DB 스키마
├── types/                      # Branded Types
├── .forge/                     # 설계 문서
└── package.json
```

---

## 핵심 문서

| 문서 | 설명 |
|------|------|
| `.forge/BID_AUTOMATION_SPEC.md` | 기능 명세 |
| `.forge/TECH_ARCHITECTURE.md` | 기술 아키텍처 |
| `.forge/UI_DESIGN_SPEC.md` | UI 설계 |
| `.forge/BID_DATA_SOURCES.md` | 데이터 소스 (45+) |
| `.forge/PRODUCT_CATALOG_CMENTECH.md` | 씨엠엔텍 제품 |
| `.forge/PHASE_1_2_COMPLETION_REPORT.md` | 개선 리포트 |

---

## 보안 구현 (완료)

| 항목 | 파일 | 상태 |
|------|------|------|
| API 인증 | `lib/security/auth-middleware.ts` | ✅ |
| Rate Limiting | `lib/security/rate-limiter.ts` | ✅ |
| CSRF 보호 | `lib/security/csrf.ts` | ✅ |
| Prompt Injection | `lib/security/prompt-guard.ts` | ✅ |
| Zod 검증 | `lib/validation/schemas.ts` | ✅ |

---

## API 엔드포인트

```
GET  /api/v1/bids          # 입찰 목록
POST /api/v1/bids          # 입찰 생성
GET  /api/v1/bids/:id      # 상세 조회
PATCH /api/v1/bids/:id     # 수정
DELETE /api/v1/bids/:id    # 삭제 (Admin)
```

---

## 다음 단계

1. **Supabase 프로젝트 생성**
2. **Upstash Redis 설정** (Rate Limiting)
3. **환경 변수 설정**
4. **DB 마이그레이션** (`supabase db push`)
5. **UI 컴포넌트 개발**

---

## 개발 원칙

- TypeScript strict mode
- Branded Types 사용
- Zod 입력 검증
- Repository 패턴 (DDD Lite)
- API v1 버저닝

---

*BIDFLOW v0.1.0*
