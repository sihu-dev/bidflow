# FORGE LABS 쿼리 실행 시스템

> 나노인자 기반 개발 워크플로우 실행기

---

## 쿼리 실행 순서

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORGE QUERY PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [1] FEATURE REQUEST                                             │
│       ↓                                                          │
│  [2] QUERY-001: Feature Analysis ──→ specs/*.yaml                │
│       ↓                                                          │
│  [3] QUERY-002: Architecture Design ──→ specs/arch/*.md          │
│       ↓                                                          │
│  [4] QUERY-003: Implementation ──→ src/**/*.ts                   │
│       ↓                                                          │
│  [5] QUERY-004: Verification ──→ reports/*-verification.yaml     │
│       ↓                                                          │
│  [6] COMPLETE / ITERATE                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 쿼리 명령어

### 새 기능 시작
```bash
# 형식
/forge feature <NAME> --app <APP> --priority <P0-P3>

# 예시
/forge feature portfolio-sync --app hephaitos --priority P1
```

### 아키텍처 설계
```bash
# 형식
/forge design <MODULE> --level <0-5> --parent <PARENT>

# 예시
/forge design ExchangeService --level 2 --parent portfolio-sync
```

### 구현
```bash
# 형식
/forge implement <COMPONENT> --spec <SPEC_FILE>

# 예시
/forge implement ExchangeService --spec specs/portfolio-sync.yaml
```

### 검증
```bash
# 형식
/forge verify <COMPONENT> --files <FILES>

# 예시
/forge verify ExchangeService --files "src/services/exchange-service.ts"
```

---

## 쿼리 컨텍스트

각 쿼리 실행 시 다음 컨텍스트가 자동으로 주입됩니다:

### 1. 프로젝트 컨텍스트
```yaml
project:
  name: "forge-labs"
  version: "1.0.0"
  apps:
    - hephaitos  # AI 에이전트 엔진
    - folio      # 소상공인 AI SaaS
    - dryon      # 산업 IoT AI
```

### 2. 기술 컨텍스트
```yaml
tech_stack:
  language: "TypeScript 5.x"
  runtime: "Node.js 22 LTS"
  framework: "Next.js 15"
  database: "Supabase (PostgreSQL)"
  ai:
    - "OpenAI GPT-4o"
    - "Anthropic Claude"
```

### 3. 설계 원칙 컨텍스트
```yaml
principles:
  - "SOLID 원칙 준수"
  - "나노인자 계층 구조"
  - "DDD (Domain-Driven Design)"
  - "Clean Architecture"
```

### 4. 메모리 컨텍스트
- 이전 쿼리 결과
- 설계 결정 이력
- 의존성 그래프

---

## 쿼리 실행 예제

### 예제 1: 포트폴리오 동기화 기능

```markdown
## Step 1: 기능 분석
/forge feature portfolio-sync --app hephaitos --priority P1

→ 출력: .forge/specs/portfolio-sync.yaml

## Step 2: L0 설계 (타입)
/forge design PortfolioTypes --level 0 --parent portfolio-sync

→ 출력: .forge/specs/arch/PortfolioTypes.md

## Step 3: L1 설계 (유틸)
/forge design BalanceUtils --level 1 --parent portfolio-sync

→ 출력: .forge/specs/arch/BalanceUtils.md

## Step 4: L2 설계 (서비스)
/forge design ExchangeService --level 2 --parent portfolio-sync

→ 출력: .forge/specs/arch/ExchangeService.md

## Step 5: L3 설계 (에이전트)
/forge design PortfolioSyncAgent --level 3 --parent portfolio-sync

→ 출력: .forge/specs/arch/PortfolioSyncAgent.md

## Step 6: 구현
/forge implement PortfolioTypes --spec specs/portfolio-sync.yaml
/forge implement BalanceUtils --spec specs/portfolio-sync.yaml
/forge implement ExchangeService --spec specs/portfolio-sync.yaml
/forge implement PortfolioSyncAgent --spec specs/portfolio-sync.yaml

## Step 7: 검증
/forge verify portfolio-sync --files "src/**/*portfolio*"

→ 출력: .forge/reports/portfolio-sync-verification.yaml
```

---

## 쿼리 상태 관리

### 상태 파일
`.forge/state/current-query.yaml`

```yaml
current_query:
  id: "QRY-2024-001"
  feature: "portfolio-sync"
  phase: "design"  # analysis | design | implement | verify
  level: 2
  started_at: "2024-12-19T10:00:00Z"

  progress:
    L0: "completed"
    L1: "completed"
    L2: "in_progress"
    L3: "pending"
    L4: "pending"

  artifacts:
    - path: ".forge/specs/portfolio-sync.yaml"
      type: "spec"
    - path: ".forge/specs/arch/PortfolioTypes.md"
      type: "design"
```

### 이력 파일
`.forge/state/query-history.yaml`

```yaml
history:
  - id: "QRY-2024-001"
    feature: "portfolio-sync"
    status: "completed"
    duration: "4h 30m"
    artifacts: 12
```

---

## 자동화 훅

### Pre-Query 훅
각 쿼리 실행 전 자동 실행:
- 컨텍스트 로드
- 의존성 체크
- 이전 결과 확인

### Post-Query 훅
각 쿼리 완료 후 자동 실행:
- 결과 저장
- 메모리 업데이트
- 다음 쿼리 제안

---

## 오류 처리

| 오류 유형 | 대응 |
|----------|------|
| 컨텍스트 부족 | 추가 정보 요청 |
| 의존성 미충족 | 선행 쿼리 실행 제안 |
| 검증 실패 | 이슈 목록과 수정 가이드 제공 |
| 순환 의존성 | 설계 재검토 제안 |
