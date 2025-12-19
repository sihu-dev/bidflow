# [ARCH] L0 Portfolio Types 설계

> QUERY-002: Architecture Design
> Level: L0 (Atoms)
> Parent: portfolio-sync

---

## SOLID 체크리스트

### S - Single Responsibility ✅
- [x] 각 타입이 하나의 도메인 개념만 표현
- [x] ExchangeType: 거래소 종류만
- [x] IAsset: 자산 정보만
- [x] IPortfolio: 포트폴리오 집합만

### O - Open/Closed ✅
- [x] 새 거래소 추가 시 ExchangeType union만 확장
- [x] 기존 인터페이스 수정 없이 확장 가능

### L - Liskov Substitution ✅
- [x] 모든 거래소가 동일한 IAsset 형식 반환
- [x] 구현체 간 대체 가능

### I - Interface Segregation ✅
- [x] 작은 단위의 인터페이스 분리
- [x] IAsset, IPortfolio, ISnapshot 독립

### D - Dependency Inversion ✅
- [x] 추상 타입에만 의존
- [x] 구체적 구현 없음 (L0 특성)

---

## 타입 정의

### 1. 거래소 타입

```typescript
// exchange.ts
export type ExchangeType =
  | 'binance'
  | 'upbit'
  | 'bithumb'
  | 'coinbase'
  | 'kraken';

export interface IExchangeConfig {
  type: ExchangeType;
  name: string;
  baseUrl: string;
  rateLimit: number;  // requests per minute
  features: ExchangeFeature[];
}

export type ExchangeFeature =
  | 'spot'
  | 'futures'
  | 'margin'
  | 'staking';
```

### 2. 자산 타입

```typescript
// asset.ts
export interface IAsset {
  symbol: string;       // BTC, ETH, USDT
  name: string;         // Bitcoin, Ethereum
  amount: number;       // 보유 수량
  price_usd: number;    // 현재 USD 가격
  value_usd: number;    // 총 가치 (amount * price)
  change_24h: number;   // 24시간 변동률 (%)

  // 선택적 필드
  avg_buy_price?: number;  // 평균 매수가
  unrealized_pnl?: number; // 미실현 손익
}

export interface IAssetBalance {
  asset: IAsset;
  free: number;      // 사용 가능
  locked: number;    // 주문 중 잠김
  staking?: number;  // 스테이킹 중
}
```

### 3. 포트폴리오 타입

```typescript
// portfolio.ts
export interface IPortfolio {
  id: string;
  user_id: string;
  exchange: ExchangeType;
  name: string;
  assets: IAsset[];
  total_value_usd: number;

  // 메타데이터
  created_at: string;  // ISO 8601
  synced_at: string;
  sync_status: SyncStatus;
}

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'success'
  | 'error';

export interface IPortfolioSummary {
  total_value_usd: number;
  total_cost_usd: number;
  total_pnl_usd: number;
  total_pnl_percent: number;
  asset_count: number;
  exchange_count: number;
}
```

### 4. 스냅샷 타입

```typescript
// snapshot.ts
export interface IPortfolioSnapshot {
  id: string;
  portfolio_id: string;
  total_value_usd: number;
  asset_breakdown: IAssetBreakdown[];
  recorded_at: string;  // ISO 8601
}

export interface IAssetBreakdown {
  symbol: string;
  amount: number;
  value_usd: number;
  percentage: number;  // 포트폴리오 내 비중
}
```

### 5. API 자격증명 타입

```typescript
// credentials.ts
export interface IExchangeCredentials {
  exchange: ExchangeType;
  api_key: string;
  api_secret: string;

  // 거래소별 추가 필드
  passphrase?: string;  // Coinbase
  subaccount?: string;  // 서브계정
}

export interface ICredentialValidation {
  valid: boolean;
  permissions: CredentialPermission[];
  error?: string;
}

export type CredentialPermission =
  | 'read_balance'
  | 'read_history'
  | 'trade'
  | 'withdraw';
```

### 6. 상수

```typescript
// constants.ts
export const EXCHANGE_CONFIGS: Record<ExchangeType, IExchangeConfig> = {
  binance: {
    type: 'binance',
    name: 'Binance',
    baseUrl: 'https://api.binance.com',
    rateLimit: 1200,
    features: ['spot', 'futures', 'margin', 'staking'],
  },
  upbit: {
    type: 'upbit',
    name: 'Upbit',
    baseUrl: 'https://api.upbit.com',
    rateLimit: 600,
    features: ['spot'],
  },
  bithumb: {
    type: 'bithumb',
    name: 'Bithumb',
    baseUrl: 'https://api.bithumb.com',
    rateLimit: 300,
    features: ['spot'],
  },
  coinbase: {
    type: 'coinbase',
    name: 'Coinbase',
    baseUrl: 'https://api.coinbase.com',
    rateLimit: 600,
    features: ['spot', 'staking'],
  },
  kraken: {
    type: 'kraken',
    name: 'Kraken',
    baseUrl: 'https://api.kraken.com',
    rateLimit: 600,
    features: ['spot', 'futures', 'margin', 'staking'],
  },
} as const;

export const SUPPORTED_CURRENCIES = [
  'USD', 'KRW', 'EUR', 'JPY', 'CNY', 'BTC', 'ETH', 'USDT'
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
```

---

## 파일 구조

```
packages/types/src/
├── index.ts              # 통합 export
├── common/
│   ├── result.ts         # IResult, IResultMetadata
│   └── pagination.ts     # IPagination
└── hephaitos/
    ├── index.ts          # hephaitos export
    ├── exchange.ts       # ExchangeType, IExchangeConfig
    ├── asset.ts          # IAsset, IAssetBalance
    ├── portfolio.ts      # IPortfolio, IPortfolioSummary
    ├── snapshot.ts       # IPortfolioSnapshot
    ├── credentials.ts    # IExchangeCredentials
    └── constants.ts      # EXCHANGE_CONFIGS
```

---

## 다음 단계

- **QUERY-003**: L0 구현
- **Target Files**: `packages/types/src/hephaitos/*.ts`
