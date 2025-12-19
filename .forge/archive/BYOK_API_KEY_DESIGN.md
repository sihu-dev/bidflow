# BYOK (Bring Your Own Key) API Key 주입 시스템 설계

> **설계 일자**: 2025-12-19
> **대상 프로젝트**: FORGE LABS - HEPHAITOS
> **벤치마크**: Genspark, Plaid Link, JetBrains BYOK, Cloudflare AI Gateway

---

## Executive Summary

### 현재 방식 vs 개선 방식

| 항목 | 현재 (수동) | 개선 (BYOK) |
|------|-----------|------------|
| API Key 입력 | 폼에 직접 입력 | **1-Click OAuth** 또는 **Key Vault** |
| 보안 저장 | localStorage (평문) | **암호화 Vault + 생체인증** |
| 증권사 연결 | 5-10분 (가이드 필요) | **1-3분 (자동화)** |
| 재사용 | 매번 재입력 | **프로필 저장 + 자동 로드** |

### 적용 가능성: ✅ **매우 가능**

---

## 1. 업계 BYOK 패턴 분석

### 1.1 JetBrains BYOK (2025년 12월 출시)
```
┌─────────────────────────────────────────────────────────────┐
│  JetBrains IDE → Settings → AI → BYOK                       │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  API Key: ••••••••••••••••••••sk-xxx            │      │
│  │  Provider: [OpenAI ▼] [Anthropic] [Custom]      │      │
│  │                                                  │      │
│  │  [✓] Store locally (never shared with JetBrains)│      │
│  │                                                  │      │
│  │  [Verify Connection] [Save]                     │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**핵심 특징:**
- 키는 로컬 머신에만 저장
- JetBrains 서버로 전송 안 함
- 구독 없이 사용 가능

### 1.2 Plaid Link (금융 OAuth 표준)
```
┌─────────────────────────────────────────────────────────────┐
│  [Connect Bank Account]                                      │
│        ↓                                                     │
│  ┌──────────────────────────────────────────────────┐       │
│  │          🏦 Select your bank                     │       │
│  │                                                  │       │
│  │  [ Chase ]  [ Bank of America ]  [ Wells Fargo ]│       │
│  │  [ Citi  ]  [ Capital One ]      [ US Bank    ] │       │
│  │                                                  │       │
│  │  🔍 Search for your bank...                     │       │
│  └──────────────────────────────────────────────────┘       │
│        ↓                                                     │
│  Bank Login Page (OAuth 리다이렉트)                          │
│        ↓                                                     │
│  [✓] Connected!                                              │
└─────────────────────────────────────────────────────────────┘
```

**핵심 특징:**
- 사용자가 비밀번호 직접 입력 안 함
- OAuth로 은행 인증 위임
- 토큰 자동 관리

### 1.3 Cloudflare AI Gateway BYOK
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard → AI Gateway → Keys                               │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Stored Keys:                                    │      │
│  │                                                  │      │
│  │  🔑 OpenAI        sk-xxx...xxx    [Edit] [Delete]│      │
│  │  🔑 Anthropic     sk-ant-xxx...   [Edit] [Delete]│      │
│  │  🔑 Groq          gsk-xxx...      [Edit] [Delete]│      │
│  │                                                  │      │
│  │  [+ Add New Key]                                 │      │
│  │                                                  │      │
│  │  Usage: Reference by ID in API calls             │      │
│  │  curl -H "cf-aig-key-id: my-openai-key" ...     │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**핵심 특징:**
- 키를 한 번 저장하면 ID로 참조
- API 요청에 키 직접 포함 불필요
- 중앙 집중 키 관리

---

## 2. HEPHAITOS BYOK 설계

### 2.1 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEPHAITOS BYOK System                        │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Option A  │  │   Option B  │  │      Option C           │ │
│  │ OAuth Flow  │  │  Key Vault  │  │  Browser Extension      │ │
│  │  (추천)     │  │  (대안)     │  │  (고급)                 │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│         └────────────────┼──────────────────────┘               │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Unified Broker Manager                       │  │
│  │                                                          │  │
│  │  - Credential Provider 인터페이스                        │  │
│  │  - Auto Token Refresh                                   │  │
│  │  - Connection Health Check                              │  │
│  │  - Fallback / Recovery                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Option A: OAuth Flow (가장 편리)

**지원 증권사:**
- KIS (한국투자증권) - OAuth 2.0 지원
- Alpaca - OAuth 지원
- Binance - OAuth 지원

```typescript
// 새로운 파일: src/lib/broker/oauth-connector.ts

export interface OAuthConnector {
  // 1-Click 연결 시작
  initiateConnection(brokerId: BrokerId): Promise<string>  // authUrl 반환

  // OAuth 콜백 처리
  handleCallback(code: string, state: string): Promise<ConnectionResult>

  // 토큰 자동 갱신
  refreshToken(brokerId: BrokerId): Promise<void>
}

export class OAuthBrokerConnector implements OAuthConnector {
  private readonly redirectUri = 'http://localhost:3000/api/broker/callback'

  async initiateConnection(brokerId: BrokerId): Promise<string> {
    const config = OAUTH_CONFIGS[brokerId]

    // State 생성 (CSRF 방지)
    const state = crypto.randomUUID()
    await this.saveState(state, brokerId)

    // OAuth URL 생성
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
    })

    return `${config.authUrl}?${params}`
  }

  async handleCallback(code: string, state: string): Promise<ConnectionResult> {
    const { brokerId } = await this.getState(state)
    const config = OAUTH_CONFIGS[brokerId]

    // 토큰 교환
    const tokens = await this.exchangeCodeForTokens(code, config)

    // 암호화 저장
    await this.secureStore(brokerId, tokens)

    return { success: true, message: '연결 완료!' }
  }
}
```

**UX 플로우:**
```
┌─────────────────────────────────────────────────────────────┐
│  HEPHAITOS - 증권사 연결                                     │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │                                                  │      │
│  │   🏦 한국투자증권                                │      │
│  │   [ 1-Click 연결 ]  ← OAuth 버튼                │      │
│  │                                                  │      │
│  │   📈 Alpaca (미국주식)                          │      │
│  │   [ 1-Click 연결 ]                              │      │
│  │                                                  │      │
│  │   💰 Binance (암호화폐)                          │      │
│  │   [ 1-Click 연결 ]                              │      │
│  │                                                  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  [?] OAuth로 연결하면 API 키를 직접 입력할 필요가 없습니다   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼ 클릭 시
┌─────────────────────────────────────────────────────────────┐
│  한국투자증권 로그인 (증권사 페이지)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  🏦 한국투자증권                                 │      │
│  │                                                  │      │
│  │  아이디: [________________]                      │      │
│  │  비밀번호: [________________]                    │      │
│  │                                                  │      │
│  │  [로그인]                                        │      │
│  │                                                  │      │
│  │  ⚠️ HEPHAITOS 앱에 다음 권한을 허용합니다:       │      │
│  │     ✓ 계좌 조회                                 │      │
│  │     ✓ 주문 실행                                 │      │
│  │                                                  │      │
│  │  [허용] [거부]                                   │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
        │
        ▼ 허용 시
┌─────────────────────────────────────────────────────────────┐
│  ✅ 연결 완료!                                               │
│                                                             │
│  한국투자증권 계좌가 성공적으로 연결되었습니다.              │
│                                                             │
│  계좌번호: 12345678-01                                      │
│  잔고: ₩5,234,500                                           │
│                                                             │
│  [트레이딩 시작] [대시보드로 이동]                           │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Option B: Secure Key Vault (API 키 직접 입력)

OAuth 미지원 증권사용 (키움증권, 삼성증권 등)

```typescript
// 새로운 파일: src/lib/broker/key-vault.ts

import { webcrypto } from 'crypto'

export interface SecureKeyVault {
  // 암호화 저장
  store(brokerId: BrokerId, credentials: BrokerCredentials): Promise<void>

  // 복호화 조회
  retrieve(brokerId: BrokerId): Promise<BrokerCredentials | null>

  // 키 삭제
  remove(brokerId: BrokerId): Promise<void>

  // 전체 목록
  list(): Promise<StoredCredentialInfo[]>
}

export class BrowserKeyVault implements SecureKeyVault {
  private readonly dbName = 'hephaitos-keyvault'
  private masterKey: CryptoKey | null = null

  // 마스터 키 생성 (생체인증 또는 PIN)
  async unlock(method: 'biometric' | 'pin', pin?: string): Promise<void> {
    if (method === 'biometric') {
      // WebAuthn API 사용
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: window.location.hostname,
          userVerification: 'required',
        }
      })
      this.masterKey = await this.deriveKeyFromCredential(credential)
    } else {
      // PIN 기반 키 파생
      this.masterKey = await this.deriveKeyFromPin(pin!)
    }
  }

  async store(brokerId: BrokerId, credentials: BrokerCredentials): Promise<void> {
    if (!this.masterKey) throw new Error('Vault not unlocked')

    // AES-GCM 암호화
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.masterKey,
      new TextEncoder().encode(JSON.stringify(credentials))
    )

    // IndexedDB 저장
    const db = await this.openDB()
    await db.put('credentials', {
      brokerId,
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
      createdAt: new Date().toISOString(),
    })
  }

  async retrieve(brokerId: BrokerId): Promise<BrokerCredentials | null> {
    if (!this.masterKey) throw new Error('Vault not unlocked')

    const db = await this.openDB()
    const record = await db.get('credentials', brokerId)
    if (!record) return null

    // AES-GCM 복호화
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(record.iv) },
      this.masterKey,
      new Uint8Array(record.data)
    )

    return JSON.parse(new TextDecoder().decode(decrypted))
  }
}
```

**UX 플로우:**
```
┌─────────────────────────────────────────────────────────────┐
│  HEPHAITOS - API 키 설정                                     │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  🔐 보안 금고 (Key Vault)                        │      │
│  │                                                  │      │
│  │  ┌────────────────────────────────────────────┐ │      │
│  │  │  저장된 키:                                │ │      │
│  │  │                                            │ │      │
│  │  │  🏦 한국투자증권  ✅ 연결됨  [관리]       │ │      │
│  │  │  📈 Alpaca       ✅ 연결됨  [관리]       │ │      │
│  │  │  🔶 키움증권     ⏳ 미연결  [연결]       │ │      │
│  │  │                                            │ │      │
│  │  │  [+ 새 증권사 추가]                        │ │      │
│  │  └────────────────────────────────────────────┘ │      │
│  │                                                  │      │
│  │  🔒 암호화: AES-256-GCM                         │      │
│  │  🔑 잠금: 생체인증 / PIN                        │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Option C: QR Code 간편 연결

모바일에서 API 키를 생성하고 QR로 전송

```typescript
// 새로운 파일: src/lib/broker/qr-connector.ts

export interface QRConnector {
  // QR 코드 생성 (모바일 앱용)
  generateQR(credentials: BrokerCredentials): Promise<string>

  // QR 코드 스캔 (웹 앱용)
  scanQR(): Promise<BrokerCredentials>
}

export class QRBrokerConnector implements QRConnector {
  async generateQR(credentials: BrokerCredentials): Promise<string> {
    // 1. 임시 키 페어 생성
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey']
    )

    // 2. 암호화된 페이로드 생성
    const encrypted = await this.encryptCredentials(credentials, keyPair)

    // 3. QR 데이터 생성
    const qrData = {
      type: 'HEPHAITOS_BROKER_CREDENTIAL',
      version: 1,
      publicKey: await this.exportPublicKey(keyPair.publicKey),
      encryptedData: encrypted,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5분 유효
    }

    return JSON.stringify(qrData)
  }
}
```

---

## 3. 추천 구현 순서

### Phase 1: 핵심 인프라 (1주)

| 순서 | 파일 | 기능 |
|------|------|------|
| 1 | `src/lib/broker/key-vault.ts` | 암호화 저장소 |
| 2 | `src/lib/broker/credential-provider.ts` | 자격증명 추상화 |
| 3 | `src/components/broker/KeyVaultUI.tsx` | 금고 UI |

### Phase 2: OAuth 연결 (2주)

| 순서 | 파일 | 기능 |
|------|------|------|
| 4 | `src/lib/broker/oauth-connector.ts` | OAuth 플로우 |
| 5 | `app/api/broker/callback/route.ts` | OAuth 콜백 |
| 6 | `src/components/broker/OAuthButton.tsx` | 1-Click 버튼 |

### Phase 3: 고급 기능 (2주)

| 순서 | 파일 | 기능 |
|------|------|------|
| 7 | `src/lib/broker/qr-connector.ts` | QR 연결 |
| 8 | `src/lib/broker/biometric-auth.ts` | 생체인증 |
| 9 | `src/lib/broker/auto-refresh.ts` | 토큰 자동 갱신 |

---

## 4. 기존 코드와의 통합

### 4.1 현재 BrokerCredentials 인터페이스 확장

```typescript
// types.ts 수정

export interface BrokerCredentials {
  apiKey: string
  apiSecret: string
  accountNumber: string
  accountType?: 'real' | 'paper'
  certPassword?: string
  appId?: string

  // 새로운 필드 (BYOK 지원)
  source?: 'manual' | 'oauth' | 'vault' | 'qr'
  tokenExpiry?: number
  refreshToken?: string
  vaultKeyId?: string
}
```

### 4.2 CredentialProvider 인터페이스

```typescript
// 새로운 파일: src/lib/broker/credential-provider.ts

export interface CredentialProvider {
  // 자격증명 획득 (소스 자동 결정)
  getCredentials(brokerId: BrokerId): Promise<BrokerCredentials | null>

  // 자격증명 저장
  setCredentials(brokerId: BrokerId, credentials: BrokerCredentials): Promise<void>

  // 자격증명 갱신 (토큰 만료 시)
  refreshCredentials(brokerId: BrokerId): Promise<BrokerCredentials>

  // 연결 상태 확인
  isConnected(brokerId: BrokerId): Promise<boolean>
}

export class UnifiedCredentialProvider implements CredentialProvider {
  constructor(
    private vault: SecureKeyVault,
    private oauth: OAuthConnector,
  ) {}

  async getCredentials(brokerId: BrokerId): Promise<BrokerCredentials | null> {
    // 1. Vault에서 먼저 확인
    const stored = await this.vault.retrieve(brokerId)
    if (stored) {
      // 토큰 만료 확인
      if (stored.tokenExpiry && stored.tokenExpiry < Date.now()) {
        return this.refreshCredentials(brokerId)
      }
      return stored
    }

    // 2. 없으면 null (연결 필요)
    return null
  }
}
```

### 4.3 BrokerManager 수정

```typescript
// index.ts 수정

export class BrokerManager {
  private credentialProvider: CredentialProvider

  constructor() {
    this.credentialProvider = new UnifiedCredentialProvider(
      new BrowserKeyVault(),
      new OAuthBrokerConnector(),
    )
  }

  async connect(brokerId: BrokerId): Promise<ConnectionResult> {
    // 자격증명 자동 획득
    const credentials = await this.credentialProvider.getCredentials(brokerId)

    if (!credentials) {
      // OAuth 또는 수동 입력 필요
      return {
        success: false,
        message: '연결이 필요합니다',
        requiresAuth: true,
        authMethod: this.getAuthMethod(brokerId),
      }
    }

    // 기존 연결 로직 실행
    return this.doConnect(brokerId, credentials)
  }
}
```

---

## 5. 보안 고려사항

### 5.1 키 저장 보안

| 항목 | 구현 |
|------|------|
| 암호화 알고리즘 | AES-256-GCM |
| 키 파생 | PBKDF2 (100,000 iterations) |
| 저장소 | IndexedDB (브라우저 샌드박스) |
| 마스터 키 | 생체인증 또는 PIN |

### 5.2 전송 보안

| 항목 | 구현 |
|------|------|
| OAuth 통신 | HTTPS only |
| CSRF 방지 | State 파라미터 |
| QR 암호화 | ECDH + AES-GCM |
| 토큰 만료 | 자동 갱신 |

### 5.3 런타임 보안

| 항목 | 구현 |
|------|------|
| 메모리 클리어 | 사용 후 즉시 삭제 |
| 세션 타임아웃 | 30분 비활성 시 잠금 |
| 로깅 방지 | 키 값 마스킹 |

---

## 6. 결론: Genspark 스타일 가능 여부

### ✅ **가능합니다**

Genspark과 유사한 편리한 API Key 주입이 충분히 가능합니다:

| Genspark 기능 | HEPHAITOS 구현 | 난이도 |
|--------------|---------------|--------|
| 1-Click API 연결 | OAuth Flow | 중 |
| 키 자동 저장 | Secure Key Vault | 하 |
| 다중 프로바이더 | BrokerRegistry 확장 | 하 |
| 토큰 자동 갱신 | Auto Refresh | 중 |

### 핵심 차별화 포인트

1. **증권사 특화**: 금융 API에 최적화된 OAuth 플로우
2. **로컬 저장**: 서버 전송 없이 클라이언트에서 암호화
3. **생체인증**: WebAuthn으로 편리하면서 안전한 잠금
4. **QR 연결**: 모바일에서 PC로 키 전송

---

## 7. 구현 예상 일정

| Phase | 기간 | 주요 산출물 |
|-------|------|-----------|
| Phase 1 | 1주 | Key Vault 기본 기능 |
| Phase 2 | 2주 | OAuth 연결 (KIS, Alpaca) |
| Phase 3 | 2주 | 고급 기능 (QR, 생체인증) |
| **총계** | **5주** | **완전한 BYOK 시스템** |

---

*설계서 작성: Claude Code - FORGE LABS BYOK System*
*작성 일시: 2025-12-19*
