# HEPHAITOS 개발계획서

> **버전**: 1.0.0
> **작성일**: 2025-12-19
> **상태**: 확정

---

## 1. 기술 스택

### 1.1 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15 | App Router, RSC |
| TypeScript | 5 | Strict mode |
| Tailwind CSS | 3 | Supabase 벤치마킹 |
| Radix UI | - | Headless 컴포넌트 |
| Zustand | 4 | 클라이언트 상태 |
| TanStack Query | 5 | 서버 상태 |
| Framer Motion | - | 애니메이션 |

### 1.2 백엔드
| 기술 | 용도 |
|------|------|
| Supabase | PostgreSQL + Auth + Realtime |
| Edge Functions | Serverless API |
| Row Level Security | 데이터 보안 |

### 1.3 인프라
| 서비스 | 용도 |
|--------|------|
| Vercel | 프론트엔드 배포 |
| Supabase | 백엔드 인프라 |
| Cloudflare | CDN + 보안 |

---

## 2. 아키텍처

### 2.1 Nano-Factor 계층 구조

```
┌─────────────────────────────────────────────────────────────────┐
│  L3 (Tissues) - apps/hephaitos/                                 │
│  ├─ 에이전트: BacktestAgent, OrderExecutorAgent, PortfolioSync  │
│  └─ 컴포넌트: No-Code Builder                                   │
├─────────────────────────────────────────────────────────────────┤
│  L2 (Cells) - packages/core/, packages/ui/                      │
│  ├─ 서비스: ExchangeService, PriceDataService                  │
│  └─ 리포지토리: Strategy, Portfolio, Order                      │
├─────────────────────────────────────────────────────────────────┤
│  L1 (Molecules) - packages/utils/                               │
│  ├─ backtest-calc.ts: 22개 성과 지표                            │
│  ├─ signal-detector.ts: 기술적 지표 (SMA, RSI, MACD, BB)       │
│  └─ validation.ts: API 키 검증                                  │
├─────────────────────────────────────────────────────────────────┤
│  L0 (Atoms) - packages/types/                                   │
│  └─ 8개 타입 파일: strategy, backtest, order, exchange 등      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 현재 구현 현황

| 계층 | 파일 수 | 라인 | 상태 |
|------|--------|------|------|
| L0 (Types) | 8개 | - | ✅ 완료 |
| L1 (Utils) | 14개 | 1,317+ | ✅ 완료 |
| L2 (Core) | 14개 | 1,206+ | ✅ 완료 |
| L3 (Agents) | 3개 | 1,602 | ✅ 완료 |
| L3 (Builder) | 2개 | 511 | 🔄 진행중 |

### 2.3 HEPHAITOS 엔진 핵심 파일 경로

```
# 진입점
apps/hephaitos/src/index.ts           ← 메인 엔트리 (153줄)

# L3 에이전트 (1,602줄)
apps/hephaitos/src/agents/
├── backtest-agent.ts                 ← 백테스트 시뮬레이션 (645줄)
├── order-executor-agent.ts           ← 주문 실행/리스크 (633줄)
└── portfolio-sync-agent.ts           ← 멀티 거래소 동기화 (324줄)

# L3 빌더 (511줄)
apps/hephaitos/src/components/builder/
├── types.ts                          ← 블록 타입 정의 (115줄)
└── block-definitions.ts              ← 17개 블록 정의 (396줄)

# L2 서비스 (HEPHAITOS 관련)
packages/core/src/services/
├── exchange-service.ts               ← 거래소 API 통합 (402줄)
└── price-data-service.ts             ← OHLCV 데이터 (241줄)

# L2 리포지토리 (HEPHAITOS 관련)
packages/core/src/repositories/
├── portfolio-repository.ts           ← 포트폴리오 CRUD (322줄)
├── strategy-repository.ts            ← 전략 CRUD (241줄)
├── backtest-result-repository.ts     ← 백테스트 결과
└── order-repository.ts               ← 주문 이력

# L1 유틸리티 (핵심)
packages/utils/src/
├── backtest-calc.ts                  ← 22개 성과 지표 (508줄)
├── signal-detector.ts                ← 기술적 지표 (451줄)
├── order-calc.ts                     ← 주문 계산
└── validation.ts                     ← API 키 검증 (195줄)

# L0 타입 (HEPHAITOS)
packages/types/src/hephaitos/
├── strategy.ts                       ← 전략 타입 (22 필드)
├── backtest.ts                       ← 백테스트 설정
├── order.ts                          ← 주문/리스크 타입
├── exchange.ts                       ← 거래소 설정
├── trade.ts                          ← 거래 타입
├── asset.ts                          ← 자산 타입
├── portfolio.ts                      ← 포트폴리오 타입
└── credentials.ts                    ← API 키 암호화
```

---

## 3. MVP 개발 범위

### 3.1 Phase 1: Core (4주)

#### Week 1-2: No-Code 빌더 UI
| 컴포넌트 | 설명 | 우선순위 |
|----------|------|----------|
| BlockPalette | 블록 팔레트 (17개 블록) | P0 |
| BuilderCanvas | 드래그앤드롭 캔버스 | P0 |
| SettingsPanel | 블록 파라미터 설정 | P0 |
| StrategyBuilder | 메인 레이아웃 | P0 |

#### Week 3: 백테스트 연동
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 전략 → 백테스트 변환 | 빌더 출력 → 엔진 입력 | P0 |
| 결과 시각화 | 차트 + 지표 카드 | P0 |
| AI 개선 제안 | 기본 분석 | P1 |

#### Week 4: 사용자 인증/결제
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| Supabase Auth | 소셜 로그인 | P0 |
| 결제 연동 | Toss Payments | P0 |
| 크레딧 시스템 | 사용량 추적 | P0 |

### 3.2 Phase 2: 확장 (4주)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 실계좌 연결 | BYOK (KIS, Alpaca) | P0 |
| 멘토/멘티 시스템 | 협업 빌드 | P1 |
| 알림 시스템 | 인앱 + 푸시 + 카카오 | P1 |
| 커리큘럼 빌더 | 유튜버 대시보드 | P1 |

### 3.3 Phase 3: 고도화 (4주)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 라이브 세션 | YouTube Live 연동 | P2 |
| 추가 거래소 | Bithumb, Kraken | P2 |
| 성과 리포트 | 자동 생성 | P2 |
| 화이트라벨 | 유튜버 커스텀 도메인 | P2 |

---

## 4. 핵심 컴포넌트 설계

### 4.1 No-Code 빌더 블록 (17개)

| 카테고리 | 블록 | 색상 |
|----------|------|------|
| **지표** (5) | RSI, MACD, 볼린저, 이동평균, 거래량 | #3B82F6 |
| **조건** (4) | >, <, 상향돌파, 하향돌파 | #8B5CF6 |
| **논리** (3) | AND, OR, NOT | #EAB308 |
| **액션** (3) | 매수, 매도, 홀드 | 초록/빨강 |
| **리스크** (2) | 손절, 익절 | #F97316 |

### 4.2 백테스트 성과 지표 (22개)

```
수익률: totalReturn, annualizedReturn, monthlyReturn
리스크: sharpeRatio, sortinoRatio, calmarRatio
낙폭: maxDrawdown, avgDrawdown, maxDrawdownDuration
거래: totalTrades, winRate, profitFactor
손익: avgWin, avgLoss, maxWin, maxLoss
연속: maxConsecutiveWins, maxConsecutiveLosses
기타: avgHoldingPeriod, pnlStdDev, avgTradeReturn, expectancy
```

### 4.3 거래소 연동

| 거래소 | 인증 | 기능 | 상태 |
|--------|------|------|------|
| Binance | HMAC-SHA256 | Spot, Futures | ✅ |
| Upbit | JWT | Spot | ✅ |
| Bithumb | HMAC | Spot | 🔄 |
| Coinbase | OAuth 2.0 | Spot | 📋 |
| Kraken | HMAC | Spot, Futures | 📋 |

---

## 5. 데이터베이스 스키마

### 5.1 핵심 테이블

```sql
-- 사용자
users (id, email, role, created_at)

-- 멘토 프로필
mentor_profiles (user_id, channel_name, youtube_url, tier)

-- 강의
courses (id, mentor_id, title, price, status)

-- 수강
enrollments (id, user_id, course_id, status, enrolled_at)

-- 전략
strategies (id, user_id, name, type, config, created_at)

-- 백테스트 결과
backtest_results (id, strategy_id, metrics, created_at)

-- 에이전트
agents (id, user_id, strategy_id, status, created_at)

-- 크레딧
credits (id, user_id, balance, updated_at)
credit_transactions (id, user_id, amount, type, created_at)
```

---

## 6. API 설계

### 6.1 REST 엔드포인트

```
/api/v1/
├─ auth/
│  ├─ POST /login
│  ├─ POST /register
│  └─ POST /logout
├─ strategies/
│  ├─ GET    /
│  ├─ POST   /
│  ├─ GET    /:id
│  ├─ PUT    /:id
│  └─ DELETE /:id
├─ backtest/
│  ├─ POST   /run
│  └─ GET    /results/:id
├─ agents/
│  ├─ GET    /
│  ├─ POST   /
│  ├─ PUT    /:id/start
│  └─ PUT    /:id/stop
├─ portfolios/
│  ├─ GET    /
│  ├─ POST   /sync
│  └─ GET    /:id/snapshots
└─ credits/
   ├─ GET    /balance
   └─ POST   /purchase
```

---

## 7. 보안 요구사항

### 7.1 API 키 관리 (BYOK)
- 클라이언트 사이드 암호화
- 서버에 평문 저장 금지
- AES-256-GCM 암호화

### 7.2 Row Level Security
```sql
-- 사용자는 본인 데이터만 접근
CREATE POLICY "Users can view own data"
ON strategies FOR SELECT
USING (auth.uid() = user_id);
```

### 7.3 Rate Limiting
| 엔드포인트 | 제한 |
|-----------|------|
| 백테스트 | 10/분 |
| 주문 | 60/분 |
| 일반 API | 100/분 |

---

## 8. 테스트 전략

### 8.1 테스트 범위

| 유형 | 도구 | 커버리지 목표 |
|------|------|-------------|
| Unit | Vitest | 80% |
| Integration | Vitest | 60% |
| E2E | Playwright | 핵심 플로우 |

### 8.2 핵심 테스트 케이스

```
백테스트 엔진:
├─ 지표 계산 정확성 (SMA, RSI, MACD)
├─ 시그널 감지 정확성
├─ 성과 지표 계산 정확성
└─ 엣지 케이스 (빈 데이터, 극단값)

No-Code 빌더:
├─ 블록 드래그앤드롭
├─ 블록 연결/해제
├─ 파라미터 변경
└─ 전략 저장/로드

거래소 연동:
├─ API 키 검증
├─ 잔고 조회
├─ 주문 실행 (시뮬레이션)
└─ 에러 핸들링
```

---

## 9. 배포 전략

### 9.1 환경 구성

| 환경 | URL | 용도 |
|------|-----|------|
| Development | localhost:3000 | 로컬 개발 |
| Staging | staging.hephaitos.io | QA 테스트 |
| Production | app.hephaitos.io | 실서비스 |

### 9.2 CI/CD 파이프라인

```
Push → Lint → Type Check → Test → Build → Deploy
         ↓         ↓         ↓        ↓
      ESLint   TypeScript  Vitest   Vercel
```

---

## 10. 개발 일정

### 10.1 마일스톤

| 마일스톤 | 기간 | 주요 산출물 |
|----------|------|------------|
| **M1: 기반** | W1-2 | No-Code 빌더 UI 완성 |
| **M2: 연동** | W3-4 | 백테스트 연동 + Auth |
| **M3: MVP** | W5-6 | 결제 + 기본 기능 |
| **M4: 베타** | W7-8 | 시드 파트너 테스트 |

### 10.2 상세 일정

```
Week 1: BlockPalette, BuilderCanvas
Week 2: SettingsPanel, StrategyBuilder, 연결 로직
Week 3: 백테스트 연동, 결과 시각화
Week 4: Supabase Auth, 사용자 대시보드
Week 5: Toss 결제, 크레딧 시스템
Week 6: 버그 수정, 최적화
Week 7: 시드 파트너 온보딩
Week 8: 피드백 반영, 베타 런칭
```

---

## 11. 모니터링

### 11.1 핵심 메트릭

| 메트릭 | 도구 | 임계값 |
|--------|------|--------|
| 응답 시간 | Vercel Analytics | < 200ms |
| 에러율 | Sentry | < 0.1% |
| 가용성 | UptimeRobot | > 99.9% |

### 11.2 알림

| 이벤트 | 채널 |
|--------|------|
| 서버 다운 | Slack #alerts |
| 에러 급증 | Slack #alerts |
| 배포 완료 | Slack #deploy |

---

## 12. 핵심 요약

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEPHAITOS 개발 요약                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  기술 스택: Next.js 15 + TypeScript + Supabase + Tailwind      │
│  아키텍처: Nano-Factor (L0→L1→L2→L3)                           │
│                                                                 │
│  현재 완료:                                                     │
│  ├─ L0 타입: 8개 파일                                          │
│  ├─ L1 유틸: 14개 파일 (1,317 라인)                            │
│  ├─ L2 코어: 14개 파일 (1,206 라인)                            │
│  └─ L3 에이전트: 3개 파일 (1,602 라인)                         │
│                                                                 │
│  다음 단계:                                                     │
│  ├─ No-Code 빌더 UI 완성 (Week 1-2)                            │
│  ├─ 백테스트 연동 (Week 3)                                     │
│  └─ Auth + 결제 (Week 4)                                       │
│                                                                 │
│  MVP 목표: 8주 내 베타 런칭                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*HEPHAITOS Development Plan v1.0*
*2025-12-19*
