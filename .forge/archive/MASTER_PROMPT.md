# FORGE LABS 마스터 프롬프트 시스템 v1.0

> **나노인자 단위 체계적 설계 프레임워크**
> **생성일**: 2024-12-19
> **버전**: 1.0.0

---

## 🎯 프로젝트 개요

```
┌─────────────────────────────────────────────────────────────────┐
│  FORGE LABS = AI Agent Platform Holding Company                 │
│                                                                 │
│  3개 사업 통합:                                                   │
│  🔥 HEPHAITOS - Personal AI Agent Engine (B2C)                  │
│  📊 FOLIO - 소상공인 AI SaaS (B2B)                               │
│  🌱 DRYON - 산업 IoT AI (B2G)                                    │
│                                                                 │
│  핵심 가치: LLM Agent + 자연어 인터페이스 + MCP = 2026 AI Value   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📐 나노인자 설계 계층 (Nano-Factor Design Hierarchy)

### Level 0: 원자 (Atoms)
```
최소 단위 - 더 이상 분해 불가
├── Type Definition (타입 정의)
├── Constant (상수)
├── Config Key (설정 키)
├── Error Code (에러 코드)
└── Event Name (이벤트명)
```

### Level 1: 분자 (Molecules)
```
원자 조합 - 단일 책임
├── Utility Function (유틸 함수)
├── Validator (검증기)
├── Transformer (변환기)
├── Parser (파서)
└── Formatter (포매터)
```

### Level 2: 세포 (Cells)
```
분자 조합 - 독립 실행 가능
├── Repository (저장소)
├── Service (서비스)
├── Handler (핸들러)
├── Middleware (미들웨어)
└── Hook (훅)
```

### Level 3: 조직 (Tissues)
```
세포 조합 - 도메인 단위
├── Use Case (유스케이스)
├── Controller (컨트롤러)
├── Agent (에이전트)
├── Module (모듈)
└── Feature (기능)
```

### Level 4: 기관 (Organs)
```
조직 조합 - 서비스 단위
├── API Layer
├── Business Layer
├── Data Layer
├── Infrastructure Layer
└── Presentation Layer
```

### Level 5: 시스템 (System)
```
기관 조합 - 애플리케이션 단위
├── HEPHAITOS App
├── FOLIO App
├── DRYON App
└── Shared Platform
```

---

## 🔄 설계 워크플로우

### Phase 1: DISCOVER (발견)
```yaml
목표: 문제 정의 및 요구사항 수집

쿼리:
  - "이 기능의 핵심 사용자 스토리는?"
  - "해결하려는 문제의 근본 원인은?"
  - "기존 솔루션의 한계점은?"
  - "성공 지표(KPI)는?"

산출물:
  - Problem Statement
  - User Stories
  - Success Criteria
  - Constraints & Assumptions
```

### Phase 2: DEFINE (정의)
```yaml
목표: 범위 확정 및 우선순위 설정

쿼리:
  - "MVP 범위는? (Must/Should/Could/Won't)"
  - "기술적 제약사항은?"
  - "의존성 및 선행 조건은?"
  - "리스크 요인은?"

산출물:
  - Scope Definition
  - Priority Matrix
  - Dependency Graph
  - Risk Assessment
```

### Phase 3: DESIGN (설계)
```yaml
목표: 나노인자 단위 아키텍처 설계

쿼리:
  - "Level 0 (Atoms): 필요한 타입/상수는?"
  - "Level 1 (Molecules): 유틸 함수 목록은?"
  - "Level 2 (Cells): 서비스/저장소 구조는?"
  - "Level 3 (Tissues): 에이전트/모듈 구성은?"
  - "Level 4 (Organs): 레이어 분리 방식은?"

산출물:
  - Type Definitions (.d.ts)
  - Architecture Diagram
  - Data Flow Diagram
  - API Contract
```

### Phase 4: DEVELOP (개발)
```yaml
목표: Bottom-Up 구현

순서:
  1. Atoms → Types, Constants, Configs
  2. Molecules → Utils, Validators
  3. Cells → Services, Repositories
  4. Tissues → Agents, Modules
  5. Organs → Layers Integration
  6. System → App Assembly

쿼리:
  - "현재 구현 중인 레벨은?"
  - "의존성 충족 여부는?"
  - "테스트 커버리지는?"
```

### Phase 5: DELIVER (배포)
```yaml
목표: 검증 및 릴리스

쿼리:
  - "모든 테스트 통과?"
  - "문서화 완료?"
  - "성능 기준 충족?"
  - "보안 검토 완료?"

산출물:
  - Test Report
  - Documentation
  - Release Notes
  - Deployment Guide
```

---

## 📋 쿼리 템플릿

### 🔍 [QUERY-001] 기능 분석
```markdown
## 기능명: [기능명]

### 1. 문제 정의
- 해결할 문제:
- 대상 사용자:
- 기대 효과:

### 2. 사용자 스토리
AS A [역할]
I WANT TO [행동]
SO THAT [가치]

### 3. 수락 기준
- [ ] 기준 1
- [ ] 기준 2
- [ ] 기준 3

### 4. 나노인자 분해
| Level | 구성요소 | 설명 |
|-------|---------|------|
| L0 | | |
| L1 | | |
| L2 | | |
| L3 | | |
```

### 🏗️ [QUERY-002] 아키텍처 설계
```markdown
## 모듈명: [모듈명]

### 1. 책임 (Responsibility)
- 단일 책임:
- 경계:

### 2. 의존성 (Dependencies)
- 상위 의존:
- 하위 의존:
- 외부 의존:

### 3. 인터페이스 (Interface)
```typescript
interface I[ModuleName] {
  // 메서드 시그니처
}
```

### 4. 데이터 흐름
```
[Input] → [Process] → [Output]
```
```

### 🧪 [QUERY-003] 구현 검증
```markdown
## 컴포넌트: [컴포넌트명]

### 1. 테스트 케이스
| 케이스 | 입력 | 기대 출력 | 결과 |
|--------|------|----------|------|
| | | | |

### 2. 경계 조건
- 최소값:
- 최대값:
- 널/언정의:
- 에러 케이스:

### 3. 성능 기준
- 응답시간:
- 처리량:
- 메모리:
```

---

## 🗂️ 디렉토리 컨벤션

```
forge-labs/
├── .forge/                    # 🧠 AI 메모리 & 프롬프트
│   ├── MASTER_PROMPT.md       # 이 파일
│   ├── prompts/               # 재사용 프롬프트
│   ├── specs/                 # 기능 명세
│   └── memory/                # 컨텍스트 저장
│
├── packages/                  # 📦 공유 패키지 (Level 1-2)
│   ├── @forge/types/          # L0: 타입 정의
│   ├── @forge/utils/          # L1: 유틸리티
│   ├── @forge/core/           # L2: 핵심 서비스
│   ├── @forge/crawler/        # L2: 크롤러
│   ├── @forge/llm/            # L2: LLM 추출
│   └── @forge/export/         # L2: 내보내기
│
├── apps/                      # 🚀 애플리케이션 (Level 3-5)
│   ├── hephaitos/             # 🔥 트레이딩 AI
│   ├── folio/                 # 📊 소상공인 AI
│   ├── dryon/                 # 🌱 산업 IoT
│   └── portal/                # 🌐 통합 포털
│
├── docs/                      # 📚 문서
│   ├── architecture/          # 아키텍처 문서
│   ├── api/                   # API 문서
│   └── guides/                # 가이드
│
└── infra/                     # 🏗️ 인프라
    ├── supabase/              # DB 마이그레이션
    └── docker/                # 컨테이너
```

---

## 🚀 퀵스타트 쿼리

### 새 기능 시작
```
@forge new feature [기능명]

→ QUERY-001 템플릿 생성
→ 나노인자 분해 시작
```

### 아키텍처 검토
```
@forge design [모듈명]

→ QUERY-002 템플릿 생성
→ 의존성 그래프 분석
```

### 구현 시작
```
@forge implement [컴포넌트] --level [0-5]

→ 해당 레벨 코드 생성
→ 테스트 템플릿 생성
```

### 검증
```
@forge verify [컴포넌트]

→ QUERY-003 실행
→ 테스트 & 린트 수행
```

---

## 📊 현재 상태

### 완료된 패키지
- [x] @forge/crawler (v1.0.0)
- [x] @forge/llm-extract (v1.0.0)
- [x] @forge/excel-export (v1.0.0)

### 완료된 앱
- [x] hephaitos 에이전트 (3개)
- [x] folio 에이전트 (3개)
- [x] dryon 에이전트 (3개)

### 다음 단계
- [ ] @forge/types 분리
- [ ] @forge/core 통합
- [ ] portal 앱 개발
- [ ] Supabase 스키마 통합

---

*FORGE LABS Master Prompt v1.0*
*나노인자 단위 체계적 설계 프레임워크*
