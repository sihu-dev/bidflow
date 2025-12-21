# BIDFLOW 프로젝트 현황

> **최종 업데이트**: 2025-12-21
> **프로젝트**: 제조업 SME 입찰 자동화 시스템
> **타겟**: 씨엠엔텍 (유량계 제조업체)

---

## 기술 스택 (확정)

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 15.5.9 | App Router, Server Actions |
| **TypeScript** | 5.x | Strict Mode |
| **TailwindCSS** | 3.4.x | 모노크롬 디자인 시스템 |
| **Framer Motion** | 12.x | 애니메이션 |
| **React** | 19.x | UI 라이브러리 |

### 시각화 라이브러리
| 기술 | 용도 | 상태 |
|------|------|------|
| **MapLibre GL JS** | 지도 시각화 (센서 위치) | ✅ 구현 완료 |
| **ECharts** | 게이지 차트 (유량 표시) | ✅ 구현 완료 |
| **echarts-for-react** | ECharts React 래퍼 | ✅ 구현 완료 |

### Backend
| 기술 | 용도 |
|------|------|
| **Supabase** | PostgreSQL + Realtime + Auth |
| **Inngest** | 백그라운드 작업 스케줄링 |
| **Upstash Redis** | Rate Limiting |

### 외부 API 연동
| API | 상태 | 우선순위 |
|-----|------|---------|
| **나라장터 (G2B)** | ✅ 클라이언트 완료 | P0 |
| **TED (EU)** | ✅ 클라이언트 완료 | P0 |
| **SAM.gov (미국)** | 🚧 예정 | P1 |

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

### 상태 표시 색상
```yaml
critical: #171717  # neutral-900 (가장 어두움)
warning: #525252   # neutral-600 (중간)
normal: #a3a3a3    # neutral-400 (밝음)
```

---

## 완료된 기능 ✅

### 1. 랜딩 페이지 (9개 섹션)
- [x] Hero 섹션 (화이트라벨 지원)
- [x] Features V2 (AI 기능 강조)
- [x] PainPoints (고객 문제점)
- [x] SpreadsheetDemo (AI 스프레드시트)
- [x] Pricing
- [x] Testimonials
- [x] CTA
- [x] Footer
- [x] 반응형 레이아웃

### 2. AI 대시보드 (`/ai-dashboard`)
- [x] SludgeMap (MapLibre GL JS) - 센서 위치 지도
- [x] FlowGauge (ECharts) - 실시간 유량 게이지
- [x] AnimatedMetric (Framer Motion) - 애니메이션 메트릭
- [x] AnomalyAlert - 이상 감지 알림
- [x] useRealtimeSensor 훅 - Supabase Realtime 연동
- [x] 제품별 탭 (UR-1010PLUS, SL-3000PLUS, EnerRay)

### 3. 테넌트 시스템 (화이트라벨)
- [x] TenantContext - 테넌트별 설정
- [x] 씨엠엔텍 제품 카탈로그 (5개 제품)
- [x] 동적 Hero 콘텐츠
- [x] 제품별 매칭 로직

### 4. 보안
- [x] API 인증 미들웨어
- [x] Rate Limiting (Upstash Redis)
- [x] CSRF 보호
- [x] Prompt Injection 방지
- [x] Zod 입력 검증

### 5. 테스트 (AI 대시보드)
- [x] SludgeMap.test.tsx
- [x] FlowGauge.test.tsx
- [x] AnimatedMetric.test.tsx
- [x] AnomalyAlert.test.tsx
- [x] useRealtimeSensor.test.ts

---

## 진행 중 🚧

### Phase 4: Dashboard 기능 완성
| 작업 | 파일 | 상태 |
|------|------|------|
| Bid 수정 API 연결 | `dashboard/page.tsx:387` | 🚧 |
| 새로고침 API 연결 | `dashboard/page.tsx:390` | 🚧 |
| 스프레드시트 필터/정렬 | `SpreadsheetDemo.tsx` | 🚧 |

---

## 다음 우선순위 📋

### P0 (즉시)
1. Dashboard Bid CRUD API 완성
2. 알림 발송 구현 (`crawl-scheduler.ts:103, 202`)
3. Supabase RLS 정책 검증

### P1 (단기)
1. 키워드 필터링 (`crawl-scheduler.ts:131`)
2. 카카오 알림톡 연동 (`notifications/index.ts:62`)
3. Contact API 구현 (`contact/route.ts:36`)
4. SAM.gov API 클라이언트

### P2 (중기)
1. E2E 테스트 (Playwright)
2. Lighthouse 성능 최적화
3. 다국어 지원 (i18n)
4. 모바일 앱 (React Native)

---

## GitHub Actions 워크플로우

| 워크플로우 | 트리거 | 용도 |
|-----------|--------|------|
| `claude.yml` | `@claude` 멘션 | AI 코드 어시스턴트 |
| `code-review.yml` | PR 생성 | 자동 코드 리뷰 (100점 만점) |
| `bid-automation-check.yml` | 입찰 로직 변경 | 전문 검수 |

### 사용법
```bash
# Issue/PR 코멘트에서:
@claude 이 코드 리뷰해줘
@claude TypeScript 오류 수정해줘
@claude 테스트 코드 작성해줘
```

---

## 프로젝트 구조

```
bidflow/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── ai-dashboard/    # ✅ AI 대시보드
│   │   ├── (marketing)/         # ✅ 랜딩 페이지
│   │   └── api/v1/              # ✅ API 엔드포인트
│   ├── components/
│   │   ├── ai-dashboard/        # ✅ AI 대시보드 컴포넌트
│   │   ├── landing/             # ✅ 랜딩 페이지 컴포넌트
│   │   └── ui/                  # ✅ 공통 UI
│   ├── hooks/
│   │   └── useRealtimeSensor.ts # ✅ Supabase Realtime
│   ├── lib/
│   │   ├── clients/             # ✅ 외부 API
│   │   ├── domain/              # 🚧 비즈니스 로직
│   │   ├── security/            # ✅ 보안 미들웨어
│   │   └── validation/          # ✅ Zod 스키마
│   └── contexts/
│       └── TenantContext.tsx    # ✅ 화이트라벨
├── .claude/                     # ✅ Claude 설정
├── .github/workflows/           # ✅ GitHub Actions
├── .devcontainer/               # ✅ Codespaces 설정
└── .forge/                      # 설계 문서
```

---

## 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=  # Claude API (GitHub Secret)
OPENAI_API_KEY=     # 선택적

# 외부 API
TED_API_KEY=
G2B_API_KEY=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 코딩 규칙

### TypeScript
- Strict mode 필수
- `any` 금지, `unknown` 사용
- Zod 스키마로 타입 추론

### 아키텍처
- Repository 패턴 (DDD Lite)
- Server/Client 컴포넌트 명확한 분리
- API v1 버저닝

### 디자인
- 모노크롬 팔레트만 사용
- neutral 계열 색상
- 컬러풀한 색상 금지

---

*이 문서는 Claude가 프로젝트 컨텍스트를 빠르게 파악하기 위한 참조 문서입니다.*
