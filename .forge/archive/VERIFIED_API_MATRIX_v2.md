# 증권사/거래소 API 인증 방식 - 검증 완료 매트릭스 v2

> **검증일**: 2025-12-19
> **방법론**: 공식 문서 직접 확인 + 검색 교차 검증
> **목적**: HEPHAITOS 키 주입 모듈 현실성 최종 검증

---

## 검증된 사실만 기록

### 1. 한국투자증권 (KIS) ✅ 검증 완료

| 항목 | 내용 | 출처 |
|------|------|------|
| **인증 방식** | App Key + App Secret → Access Token | [KIS Developers](https://apiportal.koreainvestment.com/) |
| **토큰 유효시간** | 24시간 | 공식 문서 |
| **토큰 재발급** | 1분당 1회 제한 | GitHub 샘플 코드 |
| **개인 사용** | ✅ 가능 (무료) | 공식 문서 |
| **플랫폼** | REST API (크로스플랫폼) | 공식 문서 |
| **OAuth** | ❌ 없음 (Token 기반) | 공식 문서 |

```
인증 흐름:
1. KIS Developers 가입
2. 계좌 연결 후 App Key, App Secret 발급
3. /oauth2/token 엔드포인트로 Access Token 발급
4. Authorization 헤더에 Token 포함하여 API 호출
```

---

### 2. Alpaca ✅ 검증 완료

| 항목 | 내용 | 출처 |
|------|------|------|
| **인증 방식 1** | OAuth 2.0 (Client Credentials) | [Alpaca Docs](https://docs.alpaca.markets/docs/authentication) |
| **인증 방식 2** | API Key + Secret (헤더 또는 Basic Auth) | 공식 문서 |
| **OAuth 토큰 유효시간** | 15분 | 공식 문서 |
| **개인 사용** | ✅ 가능 | 공식 문서 |
| **환경** | 실계좌(api.alpaca.markets), 모의(paper-api) | 공식 문서 |

```
두 가지 방식 모두 지원:
1. OAuth 2.0: authx.alpaca.markets에서 토큰 발급 (15분 유효)
2. API Key: APCA-API-KEY-ID, APCA-API-SECRET-KEY 헤더
```

---

### 3. Interactive Brokers ⚠️ 검증 완료 (주의)

| 항목 | 내용 | 출처 |
|------|------|------|
| **OAuth 지원** | 있음 (OAuth 1.0a, OAuth 2.0) | [IBKR Campus](https://www.interactivebrokers.com/campus/ibkr-api-page/oauth-1-0a-extended/) |
| **개인 투자자 OAuth** | ⚠️ 가능하지만 Java Gateway 필요 | 공식 문서 |
| **Third-Party OAuth** | Compliance 승인 필요 | 공식 문서 |
| **First-Party OAuth** | Self Service Portal에서 설정 | 공식 문서 |
| **일반 접근 방식** | Client Portal Gateway (Java 기반) | 공식 문서 |

```
핵심 사실:
- OAuth 2.0 지원함 (기존 조사 오류 수정)
- 단, 개인 투자자는 Client Portal Gateway 사용이 일반적
- Third-Party 앱은 Compliance 승인 필수
- 동일 머신에서 Gateway 인증 + API 호출 필요
```

---

### 4. E*TRADE ✅ 검증 완료

| 항목 | 내용 | 출처 |
|------|------|------|
| **인증 방식** | OAuth 1.0a (⚠️ v2 아님) | [E*TRADE Developer](https://developer.etrade.com/) |
| **개인 사용** | ✅ 가능 | 공식 문서 |
| **Sandbox 발급** | 자동 (몇 시간 내) | 공식 문서 |
| **Production 발급** | Developer Agreement 서명 필요 | 공식 문서 |
| **토큰 만료** | 자정 (US Eastern) | 공식 문서 |

```
주의사항:
- OAuth 1.0a 사용 (OAuth 2.0 아님!)
- 비표준 파라미터 일부 사용
- Sandbox → Production 전환 시 계약서 필요
```

---

### 5. Binance ✅ 검증 완료

| 항목 | 내용 | 출처 |
|------|------|------|
| **인증 방식** | API Key + HMAC-SHA256 서명 | [Binance Developers](https://developers.binance.com/) |
| **지원 서명** | HMAC, RSA, Ed25519 | 공식 문서 |
| **개인 사용** | ✅ 가능 | 공식 문서 |
| **OAuth** | ❌ 없음 | 공식 문서 |

```
서명 생성:
1. timestamp (밀리초 또는 마이크로초)
2. 쿼리스트링 + body 결합
3. HMAC-SHA256 또는 RSA/Ed25519로 서명
```

---

### 6. Kraken ✅ 검증 완료

| 항목 | 내용 | 출처 |
|------|------|------|
| **인증 방식** | API Key + HMAC-SHA512 서명 | [Kraken Docs](https://docs.kraken.com/) |
| **서명 알고리즘** | SHA256(nonce + POST) → HMAC-SHA512 | [Support Article](https://support.kraken.com/articles/360029054811-what-is-the-authentication-algorithm-for-private-endpoints-) |
| **Nonce** | 필수 (증가하는 정수) | 공식 문서 |
| **개인 사용** | ✅ 가능 | 공식 문서 |
| **OAuth** | ❌ 없음 | 공식 문서 |

```
서명 생성:
1. nonce 생성 (항상 이전보다 큰 값)
2. SHA256(nonce + POST data)
3. Base64 디코딩된 Secret으로 HMAC-SHA512
4. API-Sign 헤더에 포함

2025년 변경:
- Futures API 인증 방식 변경 (2024.02.20 적용)
- 구 방식 폐기: 2025.10.01
```

---

### 7. Coinbase ✅ 검증 완료

| 항목 | 내용 | 출처 |
|------|------|------|
| **인증 방식 1** | OAuth 2.0 | [Coinbase CDP](https://docs.cdp.coinbase.com/) |
| **인증 방식 2** | CDP API Key | 공식 문서 |
| **개인 사용** | ✅ 가능 | 공식 문서 |
| **Advanced Trade** | OAuth 또는 CDP API Key 선택 | 공식 문서 |

```
핵심 사실:
- OAuth 2.0과 API Key 둘 다 지원
- Advanced Trade는 경험자 대상
- 공식 SDK: Python, TypeScript, Go, Java
```

---

### 8. 업비트 (Upbit) ✅ 검증 완료

| 항목 | 내용 | 출처 |
|------|------|------|
| **인증 방식** | API Key + JWT | [Upbit Docs](https://docs.upbit.com/) |
| **개인 사용** | ✅ 가능 | 공식 문서 |
| **IP 등록** | 필수 | 공식 문서 |
| **OAuth** | ❌ 없음 | 공식 문서 |

```
제한사항:
- 사전 등록된 IP에서만 API 접근 가능
- 키 유출 시 사용자 책임
```

---

## 최종 요약 매트릭스

### OAuth 1-클릭 연동 가능 여부

| 거래소/브로커 | OAuth | 버전 | 개인 사용 | 1-클릭 가능 |
|--------------|-------|------|----------|------------|
| **Alpaca** | ✅ | 2.0 | ✅ | ✅ 가능 |
| **Coinbase** | ✅ | 2.0 | ✅ | ✅ 가능 |
| **E*TRADE** | ✅ | 1.0a | ✅ | ⚠️ 가능 (구버전) |
| **IBKR** | ✅ | 1.0a/2.0 | ⚠️ | ⚠️ Gateway 필요 |
| **KIS** | ❌ | - | ✅ | ❌ API Key 입력 필요 |
| **Binance** | ❌ | - | ✅ | ❌ API Key 입력 필요 |
| **Kraken** | ❌ | - | ✅ | ❌ API Key 입력 필요 |
| **Upbit** | ❌ | - | ✅ | ❌ API Key 입력 필요 |

### API Key 입력 난이도

| 거래소/브로커 | 필요 항목 | 서명 필요 | 복잡도 |
|--------------|----------|----------|--------|
| **KIS** | App Key + App Secret | Token 발급만 | 🟢 낮음 |
| **Alpaca** | Key ID + Secret | 없음 | 🟢 낮음 |
| **Coinbase** | CDP Key | 상황에 따라 | 🟡 중간 |
| **Binance** | Key + Secret | HMAC-SHA256 | 🟡 중간 |
| **Kraken** | Key + Private Key | HMAC-SHA512 + Nonce | 🔴 높음 |
| **Upbit** | Key + Secret | JWT | 🟡 중간 |

---

## HEPHAITOS 통합 권장

### Tier 1: 즉시 구현 가능

| 거래소 | 이유 |
|--------|------|
| **KIS** | 한국 주식 필수, REST API, Token 기반 단순 |
| **Alpaca** | 미국 주식, OAuth 2.0 1-클릭 가능 |

### Tier 2: 구현 가능 (중간 복잡도)

| 거래소 | 이유 |
|--------|------|
| **Binance** | 글로벌 코인, HMAC 서명 필요 |
| **Coinbase** | 미국 코인, OAuth/API Key 선택 가능 |
| **Upbit** | 한국 코인, JWT + IP 등록 필요 |

### Tier 3: 고급 구현 필요

| 거래소 | 이유 |
|--------|------|
| **Kraken** | Nonce 관리 필요, 서명 복잡 |
| **IBKR** | Gateway 필요, Compliance 이슈 |
| **E*TRADE** | OAuth 1.0a 구버전, 계약 필요 |

---

## 이전 조사 오류 정정

| 항목 | 이전 오류 | 정정된 사실 |
|------|----------|------------|
| **IBKR OAuth** | "기관 전용" | First-Party OAuth 가능, 단 Gateway 필요 |
| **E*TRADE OAuth** | OAuth 2.0 가정 | OAuth 1.0a (구버전) |
| **Coinbase** | "CDP만 가능" | OAuth 2.0도 지원 |

---

## 출처

- [KIS Developers](https://apiportal.koreainvestment.com/)
- [KIS GitHub](https://github.com/koreainvestment/open-trading-api)
- [Alpaca Authentication](https://docs.alpaca.markets/docs/authentication)
- [IBKR OAuth](https://www.interactivebrokers.com/campus/ibkr-api-page/oauth-1-0a-extended/)
- [E*TRADE Developer](https://developer.etrade.com/)
- [Binance Developers](https://developers.binance.com/)
- [Kraken API](https://docs.kraken.com/)
- [Kraken Auth Algorithm](https://support.kraken.com/articles/360029054811-what-is-the-authentication-algorithm-for-private-endpoints-)
- [Coinbase CDP](https://docs.cdp.coinbase.com/)
- [Upbit Docs](https://docs.upbit.com/)

---

*검증 완료: 2025-12-19*
*방법: 공식 문서 직접 확인*
