# FORGE LABS 통합 마이그레이션 플랜 v2.0

> **작성일**: 2025-12-19
> **목표**: 기존 프로젝트들을 참조하여 forge-labs 나노팩터 구조로 새로 개발
> **방식**: 참조 개발 (Reference Development)
> **통합 대상**: HEPHAITOS, ADE, K-Sludge, 디자인 시스템

---

## 1. 기존 프로젝트 자산 분석

### 1.1 HEPHAITOS (트레이딩 플랫폼) - **핵심 자산**

| 카테고리 | 파일 수 | 주요 모듈 | 마이그레이션 우선순위 |
|---------|--------|----------|---------------------|
| **Exchange** | 4 | BaseExchange, Binance, Upbit | P0 |
| **Broker** | 4 | Alpaca, Binance, Upbit, KIS | P0 |
| **Agent** | 4 | Orchestrator, IntentParser, StrategyBuilder | P1 |
| **Backtest** | 3 | Indicators, StrategyParser | P0 |
| **Simulation** | 2 | Account | P1 |
| **Coaching** | 2 | RealtimeSync | P2 |
| **Mirroring** | 1 | APISources | P2 |
| **AI** | 1 | ReportGenerator | P2 |
| **Types** | 1 | 80+ 타입 정의 | P0 |
| **Stores** | 4 | Portfolio, Strategy, Exchange, UI | P1 |
| **Hooks** | 12 | 커스텀 훅 | P1 |
| **Components** | 10+ | Charts, Dashboard, StrategyBuilder | P2 |
| **Tests** | 15+ | 단위 테스트 | P1 |

**총 자산**: ~90개 TypeScript 파일

### 1.2 K-Sludge Landing (DRYON)

| 항목 | 상태 |
|------|------|
| 실제 코드 | Card.tsx 1개 |
| 프로젝트 상태 | 초기 단계 |
| 마이그레이션 | 새로 구축 |

### 1.3 명량 MVP

| 항목 | 상태 |
|------|------|
| 실제 코드 | Catalyst UI Kit 데모 |
| 프로젝트 상태 | UI 킷 참조용 |
| 마이그레이션 | 디자인 시스템 참조 |

### 1.4 ADE (AI Design Engine) - **새 발견**

| 카테고리 | 상태 | 설명 |
|---------|------|------|
| **모노레포 구조** | 초기 | pnpm workspace |
| **apps/web** | 스텁 | 웹 앱 진입점 |
| **services/build-engine** | 예정 | 빌드 엔진 서비스 |
| **services/pr-exporter** | 예정 | PR 익스포터 서비스 |

**핵심 컨셉**: AI 기반 디자인/코드 생성 엔진

### 1.5 K-Sludge 디자인 시스템

| 컴포넌트 | 상태 | 설명 |
|---------|------|------|
| **Button** | ✅ | TouchTarget 포함 |
| **Badge** | ✅ | BadgeGroup 포함 |
| **Input** | ✅ | Textarea 포함 |
| **Card** | ✅ | StatCard 포함 |

### 1.6 명량 MVP (Catalyst UI Kit)

| 항목 | 상태 |
|------|------|
| 컴포넌트 | 30+ Headless UI 기반 |
| 용도 | 디자인 시스템 참조 |

### 1.7 BidFlow (IO BLOCK)

| 항목 | 상태 |
|------|------|
| 디렉토리 | 존재하지 않음 |
| 마이그레이션 | 새로 구축 필요 |

---

## 2. 확장된 forge-labs 구조

```
forge-labs/
├── packages/
│   ├── types/              # L0: 타입 정의
│   │   ├── common/         # 공통 타입
│   │   ├── hephaitos/      # 트레이딩 타입
│   │   ├── dryon/          # 슬러지 처리 타입
│   │   ├── folio/          # 소상공인 타입
│   │   └── ade/            # AI 엔진 타입
│   ├── utils/              # L1: 순수 함수
│   │   ├── indicators/     # 기술적 지표
│   │   ├── calculations/   # 계산 로직
│   │   ├── validators/     # 검증 함수
│   │   └── ai/             # AI 유틸리티
│   ├── core/               # L2: 서비스/저장소
│   │   ├── exchanges/      # 거래소 연동
│   │   ├── brokers/        # 브로커 어댑터
│   │   ├── repositories/   # 데이터 저장소
│   │   ├── services/       # 비즈니스 서비스
│   │   └── ai-engine/      # AI 엔진 코어
│   └── ui/                 # 공통 UI 컴포넌트
│       ├── primitives/     # Button, Input, Card 등
│       ├── composites/     # 복합 컴포넌트
│       └── design-tokens/  # 디자인 토큰
├── apps/
│   ├── hephaitos/          # L3: 트레이딩 앱
│   │   ├── src/agents/     # 트레이딩 에이전트
│   │   └── src/engines/    # 백테스트/시뮬레이션 엔진
│   ├── dryon/              # L3: 슬러지 앱
│   │   └── src/agents/     # IoT 에이전트
│   ├── folio/              # L3: 소상공인 앱
│   │   └── src/agents/     # 비즈니스 에이전트
│   └── ade/                # L3: AI 디자인 엔진 앱
│       ├── src/engines/    # 빌드/디자인 엔진
│       └── src/agents/     # AI 에이전트
├── services/               # 마이크로서비스 (선택)
│   ├── build-engine/       # 빌드 엔진 서비스
│   └── pr-exporter/        # PR 익스포터 서비스
└── .forge/
    └── specs/              # 쿼리 스펙
```

---

## 3. 마이그레이션 로드맵

### Phase 1: 기반 구축 (Week 1-2)

#### P0-001: 공통 타입 시스템
```
packages/types/
├── common/
│   ├── base.ts          # Brand, DeepPartial 등 유틸리티 타입
│   ├── api.ts           # API 응답/에러 타입
│   └── events.ts        # WebSocket 이벤트 타입
├── hephaitos/
│   ├── exchange.ts      # ExchangeId, Credentials 등
│   ├── trading.ts       # Order, Position, Portfolio
│   ├── strategy.ts      # Strategy, Condition, RiskManagement
│   ├── backtest.ts      # BacktestConfig, BacktestResult
│   └── market.ts        # OHLCV, Ticker, OrderBook
└── index.ts
```

#### P0-002: 기술적 지표 유틸리티
```
packages/utils/
├── indicators/
│   ├── moving-averages.ts  # SMA, EMA
│   ├── oscillators.ts      # RSI, Stochastic, MACD
│   ├── volatility.ts       # ATR, Bollinger Bands
│   └── index.ts
└── index.ts
```

#### P0-003: 거래소 추상화
```
packages/core/
├── exchanges/
│   ├── base-exchange.ts    # BaseExchange 추상 클래스
│   ├── binance/
│   │   ├── client.ts
│   │   ├── websocket.ts
│   │   └── index.ts
│   ├── upbit/
│   │   └── ...
│   └── index.ts
└── brokers/
    ├── types.ts            # UnifiedBroker 인터페이스
    ├── binance-broker.ts
    ├── upbit-broker.ts
    └── index.ts
```

### Phase 2: 트레이딩 엔진 (Week 3-4)

#### P1-001: 백테스팅 엔진
```
apps/hephaitos/src/
├── engines/
│   ├── backtest-engine.ts
│   └── simulation-engine.ts
```

#### P1-002: 트레이딩 오케스트레이터
```
apps/hephaitos/src/agents/
├── trading-orchestrator/
│   ├── orchestrator.ts
│   ├── intent-parser.ts
│   ├── strategy-builder.ts
│   └── index.ts
```

#### P1-003: 포트폴리오 관리
```
apps/hephaitos/src/agents/
├── portfolio-manager/
│   ├── sync-agent.ts
│   ├── risk-agent.ts
│   └── index.ts
```

### Phase 3: 확장 기능 (Week 5-6)

#### P2-001: 셀럽 미러링
#### P2-002: AI 리포트 생성
#### P2-003: 실시간 코칭

### Phase 4: DRYON/FOLIO 확장 (Week 7-8)

#### P3-001: DRYON 슬러지 처리 모듈
#### P3-002: FOLIO 소상공인 모듈

---

## 4. 쿼리 파이프라인 확장

### 기존 쿼리 (완료)
- QRY-001 ~ QRY-009: 기본 에이전트 스텁

### 신규 쿼리 (마이그레이션 기반)

| Query | Phase | 모듈 | 설명 | 참조 원본 |
|-------|-------|------|------|----------|
| QRY-010 | P0 | types/hephaitos | 트레이딩 타입 시스템 | HEPHAITOS/types |
| QRY-011 | P0 | utils/indicators | 기술적 지표 | HEPHAITOS/backtest/indicators |
| QRY-012 | P0 | core/exchanges | 거래소 추상화 | HEPHAITOS/exchange |
| QRY-013 | P0 | core/brokers | 브로커 어댑터 | HEPHAITOS/broker |
| QRY-014 | P1 | hephaitos/backtest | 백테스팅 엔진 | HEPHAITOS/backtest |
| QRY-015 | P1 | hephaitos/orchestrator | 트레이딩 오케스트레이터 | HEPHAITOS/agent |
| QRY-016 | P1 | hephaitos/portfolio | 포트폴리오 관리 | HEPHAITOS/stores |
| QRY-017 | P2 | hephaitos/mirroring | 셀럽 미러링 | HEPHAITOS/mirroring |
| QRY-018 | P2 | hephaitos/ai | AI 리포트 | HEPHAITOS/ai |
| QRY-019 | P2 | hephaitos/coaching | 실시간 코칭 | HEPHAITOS/coaching |
| QRY-020 | P3 | dryon/sensors | 센서 데이터 처리 | 신규 |
| QRY-021 | P3 | dryon/process | 공정 최적화 | 신규 |
| QRY-022 | P3 | folio/analytics | 매출 분석 | 신규 |
| QRY-023 | P3 | folio/inventory | 재고 관리 | 신규 |
| QRY-024 | P1 | ui/primitives | 기본 UI 컴포넌트 | k-sludge/design-system |
| QRY-025 | P1 | ui/design-tokens | 디자인 토큰 시스템 | HEPHAITOS/design-tokens |
| QRY-026 | P2 | ade/ai-engine | AI 코드 생성 엔진 | ADE 컨셉 |
| QRY-027 | P2 | ade/design-ai | AI 디자인 생성기 | 신규 |
| QRY-028 | P2 | core/ai-engine | AI 추론 코어 | 신규 |

---

## 5. 참조 개발 원칙

### 5.1 코드 참조 규칙

```typescript
/**
 * 참조 원본: HEPHAITOS/src/lib/backtest/indicators.ts
 * 변경 사항:
 * - 나노팩터 L1 구조로 재배치
 * - 순수 함수화 (side-effect 제거)
 * - 타입 강화 (any 제거)
 * - JSDoc 추가
 */
```

### 5.2 레이어 의존성 규칙

```
L0 (Types)  ← 의존성 없음
L1 (Utils)  ← L0만 참조
L2 (Core)   ← L0, L1만 참조
L3 (Agents) ← L0, L1, L2 참조
```

### 5.3 팩토리 패턴 필수

```typescript
// 모든 모듈에 Factory 함수 제공
export function createBinanceExchange(config?: ExchangeConfig): BinanceExchange {
  return new BinanceExchange(config ?? DEFAULT_CONFIG)
}
```

---

## 6. 검증 체크리스트

### Phase 완료 조건

- [ ] 모든 타입에 export 키워드
- [ ] index.ts에 re-export
- [ ] JSDoc 주석
- [ ] 단위 테스트 (80% 커버리지)
- [ ] 타입 안전성 (any 0개)
- [ ] 린트 통과
- [ ] 빌드 성공

---

## 7. 실행 명령어

```bash
# Phase 1 시작
ㄱ           # QRY-010 구현
QRY-010~013  # Phase 1 순차 구현
QRY-010~013 병렬  # Phase 1 병렬 구현

# 상태 확인
상태         # 현재 진행 상태
검수         # 코드 리뷰
```

---

## 8. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 기존 코드 품질 이슈 | 중간 | 참조만 하고 새로 작성 |
| 타입 호환성 | 높음 | 공통 타입 먼저 정의 |
| 의존성 순환 | 높음 | 레이어 규칙 엄격 적용 |
| 테스트 부족 | 중간 | TDD 방식 적용 |

---

*마지막 업데이트: 2025-12-19*
*다음 액션: `ㄱ` 또는 `QRY-010` 입력으로 Phase 1 시작*
