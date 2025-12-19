# FORGE LABS 참조 자료 맵

> 기존 프로젝트 자산 → forge-labs 마이그레이션 참조용

---

## 빠른 참조 경로

### HEPHAITOS (핵심 자산)

```
Projects/HEPHAITOS/src/
├── types/index.ts           → packages/types/hephaitos/
├── lib/
│   ├── exchange/
│   │   ├── base.ts          → packages/core/exchanges/base-exchange.ts
│   │   ├── binance.ts       → packages/core/exchanges/binance/
│   │   ├── upbit.ts         → packages/core/exchanges/upbit/
│   │   └── types.ts         → packages/types/hephaitos/exchange.ts
│   ├── broker/adapters/
│   │   ├── binance.ts       → packages/core/brokers/binance-broker.ts
│   │   ├── upbit.ts         → packages/core/brokers/upbit-broker.ts
│   │   ├── alpaca.ts        → packages/core/brokers/alpaca-broker.ts
│   │   └── kis.ts           → packages/core/brokers/kis-broker.ts
│   ├── backtest/
│   │   ├── indicators.ts    → packages/utils/indicators/
│   │   └── strategy-parser.ts → apps/hephaitos/engines/
│   ├── agent/
│   │   ├── orchestrator.ts  → apps/hephaitos/agents/orchestrator/
│   │   ├── intent-parser.ts → apps/hephaitos/agents/intent-parser/
│   │   └── types.ts         → packages/types/hephaitos/agent.ts
│   ├── ai/
│   │   └── report-generator.ts → apps/hephaitos/agents/ai-report/
│   ├── coaching/
│   │   └── realtime-sync.ts → apps/hephaitos/agents/coaching/
│   ├── mirroring/
│   │   └── api-sources.ts   → apps/hephaitos/agents/mirroring/
│   ├── simulation/
│   │   └── account.ts       → apps/hephaitos/engines/simulation/
│   └── design-tokens.ts     → packages/ui/design-tokens/
├── stores/
│   ├── portfolio-store.ts   → packages/core/services/portfolio-service.ts
│   ├── strategy-store.ts    → packages/core/services/strategy-service.ts
│   └── exchange-store.ts    → packages/core/services/exchange-service.ts
└── hooks/                   → (프론트엔드 전용, 필요시 참조)
```

### K-Sludge 디자인 시스템

```
Projects/k-sludge-landing/design-system/components/
├── Button.tsx               → packages/ui/primitives/button.tsx
├── Badge.tsx                → packages/ui/primitives/badge.tsx
├── Input.tsx                → packages/ui/primitives/input.tsx
└── Card.tsx                 → packages/ui/primitives/card.tsx
```

### ADE (AI Design Engine)

```
Projects/ADE/
├── apps/web/                → apps/ade/ (통합)
└── services/
    ├── build-engine/        → services/build-engine/
    └── pr-exporter/         → services/pr-exporter/
```

### Catalyst UI Kit (명량 MVP)

```
Projects/myeongryang-mvp/catalyst-ui-kit/
└── demo/typescript/src/components/
    ├── button.jsx           → 디자인 참조
    ├── input.jsx            → 디자인 참조
    ├── dialog.jsx           → packages/ui/composites/dialog.tsx
    ├── dropdown.jsx         → packages/ui/composites/dropdown.tsx
    ├── sidebar.jsx          → packages/ui/composites/sidebar.tsx
    └── table.jsx            → packages/ui/composites/table.tsx
```

---

## 핵심 파일 빠른 열기

### 타입 시스템 참조
```bash
# HEPHAITOS 전체 타입
code Projects/HEPHAITOS/src/types/index.ts

# 거래소 타입
code Projects/HEPHAITOS/src/lib/exchange/types.ts

# 브로커 타입
code Projects/HEPHAITOS/src/lib/broker/types.ts
```

### 엔진 로직 참조
```bash
# 인디케이터
code Projects/HEPHAITOS/src/lib/backtest/indicators.ts

# 오케스트레이터
code Projects/HEPHAITOS/src/lib/agent/orchestrator.ts

# 거래소 베이스
code Projects/HEPHAITOS/src/lib/exchange/base.ts
```

### 디자인 시스템 참조
```bash
# K-Sludge 컴포넌트
code Projects/k-sludge-landing/design-system/components/

# HEPHAITOS 디자인 토큰
code Projects/HEPHAITOS/src/lib/design-tokens.ts
```

---

## QRY별 참조 파일

| Query | 참조 파일 | 우선 확인 |
|-------|----------|----------|
| QRY-010 | HEPHAITOS/src/types/index.ts | 전체 타입 구조 |
| QRY-011 | HEPHAITOS/src/lib/backtest/indicators.ts | SMA, EMA, RSI, MACD |
| QRY-012 | HEPHAITOS/src/lib/exchange/base.ts | BaseExchange 추상 클래스 |
| QRY-013 | HEPHAITOS/src/lib/broker/adapters/*.ts | UnifiedBroker 인터페이스 |
| QRY-014 | HEPHAITOS/src/lib/backtest/*.ts | 백테스팅 엔진 |
| QRY-015 | HEPHAITOS/src/lib/agent/orchestrator.ts | 트레이딩 오케스트레이터 |
| QRY-016 | HEPHAITOS/src/stores/portfolio-store.ts | 포트폴리오 관리 |
| QRY-024 | k-sludge-landing/design-system/components/ | UI 컴포넌트 |
| QRY-025 | HEPHAITOS/src/lib/design-tokens.ts | 디자인 토큰 |

---

## 참조 개발 명령어

```bash
# 특정 모듈 참조 분석
참조 exchange     # HEPHAITOS exchange 모듈 분석
참조 broker       # HEPHAITOS broker 모듈 분석
참조 indicators   # HEPHAITOS indicators 분석
참조 agent        # HEPHAITOS agent 모듈 분석
참조 design       # 디자인 시스템 분석
```

---

*마지막 업데이트: 2025-12-19*
