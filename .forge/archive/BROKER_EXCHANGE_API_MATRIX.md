# 증권사 및 거래소 API 인증 방식 최종 매트릭스

> **검증일**: 2025-12-19
> **목적**: HEPHAITOS 키 주입 모듈 현실성 조사
> **방법론**: 공식 문서 직접 확인 + 웹 검색 교차 검증

---

## 핵심 요약

### 인증 방식 분류

| 분류 | 설명 | UX 편의성 |
|------|------|----------|
| **OAuth 2.0** | 1-클릭 연동 가능 | ⭐⭐⭐⭐⭐ |
| **API Key (간단)** | 키 복사/붙여넣기 | ⭐⭐⭐⭐ |
| **API Key + 서명** | HMAC-SHA256 서명 필요 | ⭐⭐⭐ |
| **토큰 기반** | App Key → Access Token 발급 | ⭐⭐⭐ |
| **OCX/COM** | Windows 전용, 프로그램 설치 필요 | ⭐ |

---

## 1. 한국 증권사 (Korean Brokers)

| 증권사 | API 이름 | 인증 방식 | 개인 사용 | UX 점수 | 비고 |
|--------|---------|----------|----------|---------|------|
| **한국투자증권 (KIS)** | KIS Developers | App Key/Secret → Token | ✅ 가능 | ⭐⭐⭐ | **권장** - REST API, 토큰 24시간 유효 |
| **키움증권** | Open API+ | OCX (Windows) | ✅ 가능 | ⭐ | Windows 전용, COM 컴포넌트 |
| **키움증권** | REST API (신규) | API Key | ✅ 가능 | ⭐⭐⭐ | 2024년 출시, 아직 제한적 |
| **삼성증권** | POP API | OCX (Windows) | ✅ 가능 | ⭐ | Windows 전용 |
| **미래에셋** | MTrading | 비공개 | ❌ 제한 | - | 기관/법인 우선 |
| **NH투자** | QV API | 비공개 | ❌ 제한 | - | 별도 계약 필요 |
| **대신증권** | Creon Plus | COM | ✅ 가능 | ⭐ | Windows 전용 |
| **이베스트** | xingAPI | DLL | ✅ 가능 | ⭐ | Windows 전용 |

### 한국 증권사 결론

```
┌─────────────────────────────────────────────────────────────┐
│  HEPHAITOS 권장: KIS (한국투자증권) 단일 지원              │
│                                                             │
│  이유:                                                      │
│  1. 유일한 크로스플랫폼 REST API                           │
│  2. 개인 투자자 무료 사용 가능                             │
│  3. 명확한 문서화                                          │
│  4. Plaid Link 스타일 UX 구현 가능                        │
│                                                             │
│  나머지 증권사: Windows 전용 OCX/COM → 웹 지원 불가        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 해외 증권사 (US/Global Brokers)

| 브로커 | 인증 방식 | 개인 사용 | UX 점수 | 비고 |
|--------|----------|----------|---------|------|
| **Alpaca** | OAuth 2.0 + API Key | ✅ 가능 | ⭐⭐⭐⭐⭐ | **권장** - OAuth & API Key 둘 다 지원 |
| **Tradier** | API Token (OAuth 선택) | ✅ 가능 | ⭐⭐⭐⭐ | OAuth 없이도 API Token 직접 발급 가능 |
| **E*TRADE** | OAuth 1.0a | ✅ 가능 | ⭐⭐⭐⭐ | OAuth 지원, 개인 가능 |
| **TD Ameritrade** | OAuth 2.0 | ✅ 가능 | ⭐⭐⭐⭐ | Schwab 합병 중, API 변경 예정 |
| **Interactive Brokers** | Client Portal API | ⚠️ 제한 | ⭐⭐ | OAuth는 기관 전용, 개인은 Java Gateway 필요 |
| **Robinhood** | 비공식만 | ❌ 불가 | - | 공식 API 없음 |
| **Webull** | 비공식만 | ❌ 불가 | - | 공식 API 없음 |

### Alpaca 상세 (권장)

```
인증 방식 2가지:

1. OAuth 2.0 (Client Credentials Flow)
   - 토큰 유효시간: 15분
   - 리프레시 토큰 지원
   - 1-클릭 연동 가능

2. API Key/Secret
   - 키 발급 후 직접 입력
   - Plaid Link 스타일 UX 가능

둘 다 지원하므로 가장 유연함
```

### Interactive Brokers 상세 (주의)

```
⚠️ 이전 조사 오류 수정:
- OAuth는 기관/법인 고객 전용
- 개인 투자자: Java Gateway (IB Gateway) 설치 필요
- 웹 기반 연동 어려움
```

---

## 3. 한국 코인 거래소 (Korean Crypto)

| 거래소 | 인증 방식 | 개인 사용 | UX 점수 | 비고 |
|--------|----------|----------|---------|------|
| **업비트 (Upbit)** | API Key + JWT | ✅ 가능 | ⭐⭐⭐ | 실명 계좌 연동 필수, 출금 제한 있음 |
| **빗썸 (Bithumb)** | API Key + HMAC | ✅ 가능 | ⭐⭐⭐ | 실명 인증 필수, KB국민은행 연동 |
| **코인원 (Coinone)** | API Key | ✅ 가능 | ⭐⭐⭐ | 실명 인증 필수 |
| **코빗 (Korbit)** | API Key | ✅ 가능 | ⭐⭐⭐ | 실명 인증 필수 |

### 한국 거래소 공통 제한

```
┌─────────────────────────────────────────────────────────────┐
│  한국 코인 거래소 규제 사항 (Travel Rule)                   │
│                                                             │
│  1. 실명 계좌 연동 필수 (은행 계좌 = 거래소 이름 일치)      │
│  2. KYC 인증 필수 (신분증 + 휴대폰 인증)                   │
│  3. 출금 지연:                                              │
│     - 업비트: 신규 가입 72시간, 기존 24시간 출금 지연       │
│  4. TraveRule: 100만원 이상 외부 전송 시 수신자 정보 필요   │
│                                                             │
│  → API 키 발급은 가능하나 규제가 많음                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 글로벌 코인 거래소 (Global Crypto)

| 거래소 | 인증 방식 | 개인 사용 | UX 점수 | 비고 |
|--------|----------|----------|---------|------|
| **Binance** | API Key + HMAC-SHA256 | ✅ 가능 | ⭐⭐⭐ | IP 화이트리스트 권장 (필수 아님) |
| **Coinbase** | CDP API Key / OAuth | ✅ 가능 | ⭐⭐⭐⭐ | Advanced Trade용 OAuth 지원 |
| **Kraken** | API Key + 2FA 선택 | ✅ 가능 | ⭐⭐⭐⭐ | 2FA 추가 보안, 개인 친화적 |
| **Bybit** | API Key + HMAC | ✅ 가능 | ⭐⭐⭐ | 한국인 접근 제한 (VPN 필요) |
| **OKX** | API Key + Passphrase | ✅ 가능 | ⭐⭐⭐ | 한국인 접근 제한 (VPN 필요) |
| **FTX** | - | ❌ 폐업 | - | 2022년 파산 |

### Binance 상세

```
인증: HMAC-SHA256 서명
- API Key + Secret Key 발급
- 모든 요청에 서명 필요 (timestamp + signature)
- IP 화이트리스트: 선택사항 (권장)
- 개인 사용: 완전 가능

공식 SDK:
- Python: binance-connector-python
- JavaScript: binance-connector-node
- 서명 예제: github.com/binance/binance-signature-examples
```

### Coinbase 상세 (수정됨)

```
⚠️ 이전 조사 오류 수정:
- 일반 Coinbase: OAuth 2.0 지원
- Advanced Trade: CDP API Key 또는 OAuth
- CDP API Key = API Key + HMAC-SHA256 (단순 OAuth 아님)

개인 사용: 가능
OAuth 1-클릭: 가능 (일반 Coinbase)
```

### Kraken 상세

```
인증: API Key + Private Key
- 2FA 추가 가능 (정적 비밀번호 또는 TOTP)
- IP 제한 가능
- 개인 사용: 완전 가능

2025년 변경사항:
- Futures API 인증 방식 변경 (2024.02.20 적용)
- 구 방식 폐기 예정: 2025.10.01
```

---

## 5. 최종 권장 매트릭스

### HEPHAITOS 통합 우선순위

| 순위 | 거래소/브로커 | 인증 방식 | 구현 난이도 | 시장 중요도 |
|------|-------------|----------|------------|------------|
| 1 | **KIS (한투)** | Token 기반 | 중 | ⭐⭐⭐⭐⭐ (한국 주식) |
| 2 | **Alpaca** | OAuth + API Key | 쉬움 | ⭐⭐⭐⭐⭐ (미국 주식) |
| 3 | **Upbit** | JWT | 중 | ⭐⭐⭐⭐ (한국 코인) |
| 4 | **Binance** | HMAC-SHA256 | 중 | ⭐⭐⭐⭐⭐ (글로벌 코인) |
| 5 | **Kraken** | API Key + 2FA | 쉬움 | ⭐⭐⭐ (글로벌 코인) |
| 6 | **Coinbase** | OAuth/CDP | 중 | ⭐⭐⭐⭐ (미국 코인) |

### UX 구현 전략

```
┌─────────────────────────────────────────────────────────────┐
│  Plaid Link 스타일 통합 키 주입 모듈                        │
│                                                             │
│  Step 1: 거래소 선택                                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  🇰🇷 한국투자증권 (KIS)     [권장]                     │ │
│  │  🇺🇸 Alpaca                 [1-클릭 OAuth]            │ │
│  │  🪙 업비트                   [API Key]                 │ │
│  │  🪙 Binance                 [API Key]                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Step 2: 인증 방식에 따라 분기                              │
│  ├─ OAuth 지원 (Alpaca): → 1-클릭 버튼                     │
│  └─ API Key (KIS, Upbit, Binance): → 키 입력 위저드        │
│                                                             │
│  Step 3: 실시간 유효성 검증                                 │
│  - 클립보드 자동 감지                                       │
│  - 포맷 실시간 검증                                         │
│  - 연결 테스트                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. OAuth 1-클릭 가능 여부 최종 정리

### ✅ OAuth 1-클릭 가능

| 거래소 | OAuth 버전 | 비고 |
|--------|-----------|------|
| Alpaca | OAuth 2.0 | Client Credentials, 15분 토큰 |
| E*TRADE | OAuth 1.0a | 개인 가능 |
| Coinbase (일반) | OAuth 2.0 | Advanced Trade는 CDP API |
| Tradier | OAuth 2.0 | 선택적 (API Token 직접 발급도 가능) |

### ❌ OAuth 불가 (API Key 필수)

| 거래소 | 인증 방식 | 비고 |
|--------|----------|------|
| KIS (한투) | App Key → Token | REST API, Plaid 스타일 가능 |
| Binance | API Key + HMAC | 서명 필요 |
| Upbit | API Key + JWT | JWT 토큰 생성 필요 |
| Kraken | API Key | 2FA 추가 가능 |
| Bithumb | API Key + HMAC | 서명 필요 |

### ⚠️ 제한적/불가

| 거래소 | 이유 |
|--------|------|
| Interactive Brokers | OAuth는 기관 전용, 개인은 Java Gateway |
| 키움증권 | Windows OCX 전용 |
| Robinhood | 공식 API 없음 |
| Webull | 공식 API 없음 |

---

## 7. 참조 소스

### 공식 문서
- [KIS Developers](https://apiportal.koreainvestment.com/)
- [Alpaca API](https://docs.alpaca.markets/)
- [Tradier API](https://documentation.tradier.com/)
- [Binance API](https://developers.binance.com/)
- [Upbit API](https://docs.upbit.com/)
- [Kraken API](https://docs.kraken.com/)
- [Coinbase CDP](https://docs.cdp.coinbase.com/)

### 보안 가이드
- [Binance HMAC Signature](https://academy.binance.com/en/articles/hmac-signature-what-it-is-and-how-to-use-it-for-binance-api-security)
- [Kraken API Key Creation](https://support.kraken.com/articles/360000919966-how-to-create-an-api-key)

---

*매트릭스 생성: 2025-12-19*
*검증 방법: 공식 문서 + 웹 검색 교차 검증*
