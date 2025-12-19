# [QUERY-001] 기능 분석 프롬프트

> 새로운 기능 요청 시 실행

---

## 입력 변수
- `{{FEATURE_NAME}}`: 기능명
- `{{TARGET_APP}}`: 대상 앱 (hephaitos | folio | dryon | portal)
- `{{PRIORITY}}`: 우선순위 (P0 | P1 | P2 | P3)

---

## 프롬프트

```
당신은 FORGE LABS의 시스템 아키텍트입니다.
다음 기능을 나노인자 단위로 분석해주세요.

## 기능: {{FEATURE_NAME}}
## 대상: {{TARGET_APP}}
## 우선순위: {{PRIORITY}}

### 분석 단계

#### 1. 문제 정의
- 이 기능이 해결하는 핵심 문제는 무엇인가?
- 현재 사용자가 겪는 Pain Point는?
- 이 기능이 없으면 어떤 대안을 사용하는가?

#### 2. 사용자 스토리
다음 형식으로 3-5개의 사용자 스토리 작성:
AS A [역할]
I WANT TO [행동]
SO THAT [가치/이유]

#### 3. 수락 기준 (Acceptance Criteria)
Given-When-Then 형식으로 작성:
- GIVEN [전제조건]
- WHEN [행동]
- THEN [기대결과]

#### 4. 나노인자 분해

| Level | 구성요소 | 파일 경로 | 설명 |
|-------|---------|----------|------|
| L0 (Atoms) | 타입, 상수 | packages/@forge/types/ | |
| L1 (Molecules) | 유틸 함수 | packages/@forge/utils/ | |
| L2 (Cells) | 서비스 | packages/@forge/core/ | |
| L3 (Tissues) | 에이전트 | apps/{{TARGET_APP}}/agents/ | |
| L4 (Organs) | API 레이어 | apps/{{TARGET_APP}}/api/ | |

#### 5. 의존성 매핑
- 이 기능이 의존하는 기존 모듈:
- 이 기능에 의존할 미래 모듈:
- 외부 서비스 의존:

#### 6. 리스크 평가
| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| | | | |

#### 7. 예상 일정
- L0-L1 구현:
- L2-L3 구현:
- L4 통합:
- 테스트:

### 출력 형식
분석 결과를 `.forge/specs/{{FEATURE_NAME}}.yaml` 형식으로 저장
```

---

## 출력 예시

```yaml
# .forge/specs/portfolio-sync.yaml
feature:
  name: portfolio-sync
  app: hephaitos
  priority: P1
  created: 2024-12-19

problem:
  statement: "사용자가 여러 거래소의 포트폴리오를 통합 관리할 수 없음"
  pain_points:
    - "거래소별로 따로 로그인해야 함"
    - "통합 수익률 계산이 어려움"
  alternatives:
    - "수동 스프레드시트 관리"
    - "유료 포트폴리오 앱 사용"

user_stories:
  - as: "암호화폐 투자자"
    want: "바이낸스, 업비트 포트폴리오를 한눈에 보고 싶다"
    so_that: "전체 자산 현황을 파악할 수 있다"

acceptance_criteria:
  - given: "사용자가 거래소 API 키를 등록했을 때"
    when: "대시보드에 접속하면"
    then: "모든 거래소의 잔고가 통합 표시된다"

nano_factors:
  L0:
    - name: "ExchangeType"
      path: "packages/@forge/types/exchange.ts"
      description: "거래소 종류 enum"
    - name: "PortfolioAsset"
      path: "packages/@forge/types/portfolio.ts"
      description: "자산 타입 정의"
  L1:
    - name: "normalizeBalance"
      path: "packages/@forge/utils/balance.ts"
      description: "잔고 정규화 함수"
  L2:
    - name: "ExchangeService"
      path: "packages/@forge/core/exchange-service.ts"
      description: "거래소 API 통합 서비스"
  L3:
    - name: "PortfolioSyncAgent"
      path: "apps/hephaitos/agents/portfolio-sync.ts"
      description: "포트폴리오 동기화 에이전트"

dependencies:
  internal:
    - "@forge/crawler"
    - "@forge/llm-extract"
  external:
    - "Binance API"
    - "Upbit API"

risks:
  - risk: "API 레이트 리밋"
    probability: "HIGH"
    impact: "MEDIUM"
    mitigation: "캐싱 + 배치 처리"

timeline:
  L0_L1: "0.5일"
  L2_L3: "1일"
  L4: "0.5일"
  test: "0.5일"
  total: "2.5일"
```
