# BIDFLOW 프로젝트 현황

> **최종 업데이트**: 2025-12-23
> **프로젝트**: 해외 수출 입찰 자동화 플랫폼
> **타겟**: 한국 제조업 SME (EU/US 수출 진출 희망)

---

## ⚠️ CMNTech는 목업입니다

**실제 비즈니스 모델**: 해외 입찰 플랫폼 (TED, SAM.gov)

- ❌ CMNTech 전용 시스템이 아님
- ✅ 모든 제조업 적용 가능한 **범용 플랫폼**
- ✅ 유량계는 **컨셉 증명용 샘플 시나리오**

자세한 내용: [⚠️_CMNTECH_IS_MOCKUP.md](../⚠️_CMNTECH_IS_MOCKUP.md)

---

## 기술 스택 (확정)

### Frontend

| 기술               | 버전  | 용도                      |
| ------------------ | ----- | ------------------------- |
| **Next.js**        | 15.1  | App Router, Server Actions |
| **TypeScript**     | 5.7   | Strict Mode               |
| **React**          | 19.2  | UI 라이브러리             |
| **TailwindCSS**    | 3.4   | 모노크롬 디자인 시스템    |
| **Framer Motion**  | 12.x  | 애니메이션                |

### 데이터 시각화

| 기술                  | 용도                   | 상태 |
| --------------------- | ---------------------- | ---- |
| **Handsontable**      | 스프레드시트 UI        | ✅   |
| **HyperFormula**      | AI 셀 함수 엔진        | ✅   |
| **ECharts**           | 매칭 점수 시각화       | ✅   |
| **MapLibre GL JS**    | 글로벌 입찰 지도       | ✅   |

### Backend & Infrastructure

| 기술              | 용도                        |
| ----------------- | --------------------------- |
| **Supabase**      | PostgreSQL + Realtime + Auth |
| **Upstash Redis** | Rate Limiting + Caching     |
| **Inngest**       | 백그라운드 작업 스케줄링    |
| **Vercel**        | 배포 (Edge Functions)       |

### 외부 API 연동

| API              | 상태 | 우선순위 | 비고                   |
| ---------------- | ---- | -------- | ---------------------- |
| **TED (EU)**     | ✅   | P0       | EU 공공조달 (2,800조원) |
| **SAM.gov (US)** | 🚧   | P0       | 미국 연방정부 조달     |
| **나라장터**     | ✅   | P1       | 한국 공공조달          |
| **G2B API**      | 🚧   | P1       | 조달청 API             |

---

## 디자인 시스템 (모노크롬)

### 색상 팔레트

```css
--primary: #171717;      /* neutral-900 */
--secondary: #262626;    /* neutral-800 */
--background: #fafafa;   /* neutral-50 */
--border: #e5e5e5;       /* neutral-200 */
--text-primary: #171717; /* neutral-900 */
--text-secondary: #525252; /* neutral-600 */
--text-muted: #a3a3a3;   /* neutral-400 */
```

---

## 완료된 기능 ✅

### 1. 랜딩 페이지 (9개 섹션)

- [x] Hero 섹션
- [x] Features V2 (AI 기능 강조)
- [x] PainPoints (해외 수출 장벽)
- [x] SpreadsheetDemo (AI 스프레드시트)
- [x] Pricing (SaaS 구독 모델)
- [x] Testimonials
- [x] CTA
- [x] Footer
- [x] 반응형 레이아웃

### 2. 175점 매칭 엔진

- [x] 키워드 매칭 (100점)
- [x] 규격 매칭 (25점) - DN 사이즈 추출
- [x] 기관 매칭 (50점) - 45개 발주기관 정규화
- [x] 제품 카탈로그 연동 (샘플 5개)
- [x] 실시간 점수 계산

### 3. AI 스마트 함수 (5종)

- [x] =AI_SUMMARY() - 공고 요약
- [x] =AI_SCORE() - 낙찰 확률
- [x] =AI_MATCH() - 제품 추천
- [x] =AI_KEYWORDS() - 핵심 키워드
- [x] =AI_DEADLINE() - 마감일 분석

### 4. 보안 (5계층)

- [x] API 인증 미들웨어
- [x] Rate Limiting (Upstash Redis)
- [x] CSRF 보호
- [x] Prompt Injection 방지
- [x] Zod 입력 검증

### 5. Dashboard UI

- [x] 스프레드시트 뷰 (Handsontable)
- [x] 사이드패널 상세 정보
- [x] 상태 관리 (Zustand)
- [x] 실시간 업데이트

### 6. 알림 시스템

- [x] Slack 웹훅
- [x] 이메일 (Resend)
- [🚧] 카카오 알림톡 (준비 중)

---

## 진행 중 🚧

### Phase 4: Production Launch

| 작업                   | 파일                      | 상태 |
| ---------------------- | ------------------------- | ---- |
| TED API 실시간 연동    | `clients/ted-api.ts`      | 🚧   |
| SAM.gov 크롤러         | `clients/sam-api.ts`      | 🚧   |
| Inngest 크롤링 스케줄러 | `crawl-scheduler.ts`      | 🚧   |
| E2E 테스트 실행        | `tests/e2e/`              | 🚧   |
| 프로덕션 배포          | Vercel                    | 📅   |

---

## 다음 우선순위 📋

### P0 (즉시)

1. **TED API 실시간 연동** - EU 입찰 데이터 수집
2. **SAM.gov API 크롤러** - 미국 연방정부 입찰
3. **AI 제안서 생성** - GPT-4o 연동
4. **프로덕션 환경 설정** - Supabase + Vercel

### P1 (단기)

1. 다국어 지원 (EN, KO) - next-intl
2. 카카오 알림톡 연동
3. E2E 테스트 60개 이상
4. Lighthouse 성능 80점+

### P2 (중기)

1. SAM.gov 외 글로벌 입찰 소스 확장
2. 모바일 앱 (React Native)
3. 경쟁사 인텔리전스 대시보드
4. ERP 시스템 연동

---

## 프로젝트 구조

```
bidflow/
├── src/
│   ├── app/
│   │   ├── (dashboard)/         # ✅ 대시보드
│   │   ├── (marketing)/         # ✅ 랜딩 페이지
│   │   └── api/v1/              # ✅ REST API (21개)
│   ├── components/
│   │   ├── landing/             # ✅ 랜딩 페이지 컴포넌트
│   │   ├── dashboard/           # ✅ 대시보드 컴포넌트
│   │   └── ui/                  # ✅ 공통 UI
│   ├── lib/
│   │   ├── clients/             # ✅ TED, SAM.gov API
│   │   ├── domain/              # ✅ 비즈니스 로직
│   │   ├── matching/            # ✅ 175점 매칭 엔진
│   │   ├── security/            # ✅ 5계층 보안
│   │   ├── notifications/       # ✅ 다채널 알림
│   │   └── spreadsheet/         # ✅ AI 셀 함수
│   └── contexts/
│       └── TenantContext.tsx    # ✅ 화이트라벨
├── .forge/                      # 설계 문서
├── tests/e2e/                   # E2E 테스트 (46개)
└── supabase/migrations/         # DB 스키마 (11개)
```

---

## 환경 변수

```bash
# Core Services
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=  # Claude API

# External APIs
TED_API_KEY=        # EU TED API
SAM_GOV_API_KEY=    # US SAM.gov API
G2B_API_KEY=        # 나라장터 (선택)

# Infrastructure
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CSRF_SECRET=

# Notifications (선택)
SLACK_WEBHOOK_URL=
KAKAO_ALIMTALK_API_KEY=
```

---

## 개발 원칙

### TypeScript

- Strict mode 필수
- `any` 금지, `unknown` 사용
- Zod 스키마로 타입 추론

### Architecture

- Repository 패턴 (DDD Lite)
- Server/Client 컴포넌트 명확한 분리
- API v1 버저닝
- Multi-tenant 지원 (화이트라벨)

### 디자인

- 모노크롬 팔레트만 사용
- neutral 계열 색상
- 컬러풀한 색상 금지

---

## 성능 지표

### 번들 사이즈

```
Route                        Size      First Load JS
┌ ○ /                       1.44 kB         144 kB
├ ○ /dashboard              2.51 kB         142 kB
└ ○ /api/*                  ~1 kB           ~111 kB

Total Chunks: 90 (4.4 MB uncompressed)
Shared JS: 103 kB (gzip)
```

### 최적화 완료

- ✅ Handsontable 동적 임포트 (1.6MB)
- ✅ HyperFormula 별도 청크 (912KB)
- ✅ Radix UI 트리쉐이킹 (172KB → ~100KB)

---

## 완성도: 81%

| 영역         | 완료 | 진행 중 | 계획 | 달성률 |
| ------------ | ---- | ------- | ---- | ------ |
| 인프라       | 100% | -       | -    | ✅     |
| 보안         | 95%  | 5%      | -    | ✅     |
| API          | 70%  | 20%     | 10%  | 🟡     |
| UI/UX        | 65%  | 25%     | 10%  | 🟡     |
| AI 기능      | 60%  | 30%     | 10%  | 🟡     |
| 데이터 수집  | 40%  | 40%     | 20%  | 🔴     |
| 테스트       | 50%  | 30%     | 20%  | 🟡     |

---

*이 문서는 Claude가 프로젝트 컨텍스트를 빠르게 파악하기 위한 참조 문서입니다.*

*마지막 업데이트: 2025-12-23*
