# 기술 구현 시뮬레이션 v4

> **생성일**: 2025-12-19
> **분석 도구**: Claude 4.5 Opus Sequential Thinking (6 Steps)
> **목적**: FORGEONE MVP 기술 구현 계획

---

## Executive Summary

| 항목 | 결정 |
|------|------|
| **아키텍처** | Next.js 15 + Supabase + Claude API |
| **MVP 범위** | IO Agent + Legal Agent (50기능/30화면) |
| **개발 기간** | 12주 (버퍼 포함 16.5주) |
| **월 비용** | MVP ₩1.24M → Growth ₩15.9M |
| **손익분기** | 유료 20명 (ARPU ₩60K) |
| **런웨이** | AI바우처 활용 시 24개월+ |

---

## 1. 4-Agent 아키텍처 설계

### 1.1 시스템 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                      FORGEONE Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ IO Agent │  │  Legal   │  │   ADE    │  │   Ops    │        │
│  │  경영AI  │  │  Agent   │  │  Agent   │  │  Agent   │        │
│  │          │  │  법률AI  │  │  빌더AI  │  │  운영AI  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│  ┌────┴─────────────┴─────────────┴─────────────┴────┐         │
│  │              Orchestration Layer                   │         │
│  │         (Agent Router + Context Manager)           │         │
│  └────────────────────────┬──────────────────────────┘         │
│                           │                                     │
│  ┌────────────────────────┴──────────────────────────┐         │
│  │              Core Services Layer                   │         │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │         │
│  │  │  Auth   │ │ Billing │ │Analytics│ │  Queue  │  │         │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │         │
│  └────────────────────────┬──────────────────────────┘         │
│                           │                                     │
│  ┌────────────────────────┴──────────────────────────┐         │
│  │              Data Layer                            │         │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │         │
│  │  │Supabase │ │  Redis  │ │   S3    │ │pgvector │  │         │
│  │  │ (OLTP)  │ │ (Cache) │ │ (Files) │ │(Vector) │  │         │
│  └─────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Agent별 상세 아키텍처

#### IO Agent (경영 AI)
```typescript
interface IOAgent {
  modules: {
    finance: {       // 재무 모듈
      dashboard: true,
      invoicing: true,
      taxCalc: true,
      cashflow: true
    },
    crm: {           // 고객관리 모듈
      contacts: true,
      pipeline: true,
      communication: true,
      scheduling: true
    },
    hr: {            // 인사관리 모듈
      payroll: true,
      insurance: true,
      contracts: true
    }
  },
  llm: 'claude-3.5-sonnet',
  maxTokens: 8192,
  temperature: 0.3
}
```

#### Legal Agent (법률 AI)
```typescript
interface LegalAgent {
  modules: {
    contracts: {
      generator: true,
      analyzer: true,
      templates: 50+
    },
    compliance: {
      checker: true,
      alerts: true,
      updates: true
    },
    clientPortal: {   // 의뢰인 포털
      fileShare: true,
      timeline: true,
      messaging: true,
      excelAI: true   // 엑셀 AI 분석
    }
  },
  llm: 'claude-3.5-sonnet',
  maxTokens: 16384,
  temperature: 0.1
}
```

#### ADE Agent (빌더 AI) - Phase 2
```typescript
interface ADEAgent {
  modules: {
    workflow: {
      builder: true,
      templates: 100+,
      automation: true
    },
    code: {
      generator: true,
      reviewer: true,
      deploy: true
    },
    design: {
      systemGen: true,
      components: true,
      export: ['figma', 'code']
    }
  }
}
```

#### Ops Agent (운영 AI) - Phase 3
```typescript
interface OpsAgent {
  modules: {
    scheduling: { calendar: true, booking: true },
    inventory: { tracking: true, ordering: true },
    quality: { checklist: true, inspection: true },
    production: { planning: true, tracking: true }
  }
}
```

### 1.3 Orchestration Layer

```typescript
interface AgentOrchestrator {
  router: {
    intentClassifier: 'claude-3-haiku',  // 빠른 의도 분류
    agentSelector: (intent: Intent) => Agent[],
    multiAgentMode: true,
    fallback: 'IO'
  },
  context: {
    sessionManager: true,
    memoryStore: 'redis',
    vectorStore: 'pgvector',
    maxHistory: 50
  },
  execution: {
    parallel: true,
    timeout: 30000,
    retry: 3
  }
}
```

---

## 2. MVP 스코프 정의 (Phase 1)

### 2.1 MVP 범위 결정

| 기능 | MVP | v1.1 | v2 | 난이도 |
|------|-----|------|-----|--------|
| **IO Agent** |
| 매출/비용 대시보드 | ✅ | | | Medium |
| 견적서 생성 | ✅ | | | Low |
| 세금계산서 발행 | ✅ | | | Medium |
| 고객 DB | ✅ | | | Low |
| 일정 관리 | ✅ | | | Low |
| 현금흐름 예측 | | ✅ | | High |
| 급여/4대보험 | | ✅ | | High |
| **Legal Agent** |
| 계약서 생성 (10종) | ✅ | | | Medium |
| 계약서 분석 | ✅ | | | Medium |
| 의뢰인 포털 | ✅ | | | Medium |
| 엑셀 AI 분석 | ✅ | | | Medium |
| 법규 체크 | | ✅ | | High |
| 판례 검색 | | | ✅ | Very High |
| **공통** |
| 사용자 인증 | ✅ | | | Low |
| 결제 (Stripe) | ✅ | | | Medium |
| 다크모드 | ✅ | | | Low |

### 2.2 MVP 기능 상세 (50개)

#### IO Agent MVP (20개)
```
Dashboard (5)
├── [IO-001] 월별 매출 차트
├── [IO-002] 비용 카테고리 파이
├── [IO-003] 순이익 계산기
├── [IO-004] 미수금 알림
└── [IO-005] 현황 요약 카드

Invoicing (5)
├── [IO-006] 견적서 생성
├── [IO-007] 견적서 템플릿 (5종)
├── [IO-008] 세금계산서 생성
├── [IO-009] PDF 내보내기
└── [IO-010] 이메일 발송

CRM (5)
├── [IO-011] 고객 CRUD
├── [IO-012] 고객 검색/필터
├── [IO-013] 고객 노트
├── [IO-014] 거래 이력
└── [IO-015] 태그 관리

Scheduling (5)
├── [IO-016] 캘린더 뷰
├── [IO-017] 일정 CRUD
├── [IO-018] 알림 설정
├── [IO-019] Google Calendar 연동
└── [IO-020] 반복 일정
```

#### Legal Agent MVP (20개)
```
Contracts (8)
├── [LG-001] 계약서 생성 AI
├── [LG-002] 용역계약서 템플릿
├── [LG-003] 근로계약서 템플릿
├── [LG-004] NDA 템플릿
├── [LG-005] 임대차계약 템플릿
├── [LG-006] 계약서 분석 AI
├── [LG-007] 위험조항 하이라이트
└── [LG-008] 수정 제안

Client Portal (7)
├── [LG-009] 의뢰인 초대
├── [LG-010] 자료 업로드/다운로드
├── [LG-011] 버전 관리
├── [LG-012] 코멘트/피드백
├── [LG-013] 사건 타임라인
├── [LG-014] 보안 메시징
└── [LG-015] 접근 권한 관리

Excel AI (5)
├── [LG-016] 엑셀 파일 업로드
├── [LG-017] 데이터 분석 AI
├── [LG-018] 시각화 생성
├── [LG-019] 인사이트 리포트
└── [LG-020] 내보내기 (PDF/PPT)
```

#### 공통 기능 (10개)
```
Auth (3)
├── [CM-001] 이메일 로그인
├── [CM-002] Google OAuth
└── [CM-003] 비밀번호 재설정

Billing (4)
├── [CM-004] Stripe 결제
├── [CM-005] 구독 관리
├── [CM-006] 인보이스 조회
└── [CM-007] 플랜 변경

Settings (3)
├── [CM-008] 프로필 관리
├── [CM-009] 알림 설정
└── [CM-010] 다크모드 토글
```

### 2.3 MVP 화면 목록 (25개)

```
Public (3)
├── /                    # 랜딩 페이지
├── /pricing             # 가격 페이지
└── /login               # 로그인

Dashboard (5)
├── /dashboard           # 메인 대시보드
├── /dashboard/finance   # 재무 상세
├── /dashboard/clients   # 고객 목록
├── /dashboard/calendar  # 캘린더
└── /dashboard/settings  # 설정

IO Agent (5)
├── /io/invoice/new      # 견적서 생성
├── /io/invoice/[id]     # 견적서 상세
├── /io/clients/new      # 고객 추가
├── /io/clients/[id]     # 고객 상세
└── /io/reports          # 리포트

Legal Agent (7)
├── /legal/contracts     # 계약서 목록
├── /legal/contracts/new # 계약서 생성
├── /legal/contracts/[id]# 계약서 상세
├── /legal/analyze       # 계약서 분석
├── /legal/portal        # 의뢰인 포털
├── /legal/portal/[id]   # 사건 상세
└── /legal/excel         # 엑셀 AI

Billing (3)
├── /billing             # 결제 현황
├── /billing/plans       # 플랜 선택
└── /billing/history     # 결제 이력

Client Portal (2)
├── /client/[token]      # 의뢰인 접근
└── /client/[token]/[case] # 사건 상세
```

---

## 3. 기술 스택 상세

### 3.1 최종 기술 스택

```json
{
  "frontend": {
    "framework": "next@15.1.0",
    "react": "react@19.0.0",
    "typescript": "typescript@5.7.2",
    "styling": "tailwindcss@4.0.0",
    "ui": "shadcn/ui + radix-ui",
    "state": "zustand@5.0.0",
    "fetching": "@tanstack/react-query@5.0.0",
    "forms": "react-hook-form + zod",
    "charts": "recharts@2.12.0"
  },
  "backend": {
    "runtime": "Next.js API Routes (Edge)",
    "auth": "@supabase/auth-helpers-nextjs",
    "database": "supabase-js@2.0.0",
    "ai": "@anthropic-ai/sdk@0.30.0",
    "queue": "inngest@3.0.0",
    "email": "resend@3.0.0",
    "payments": "stripe@14.0.0"
  },
  "infrastructure": {
    "hosting": "Vercel",
    "database": "Supabase (AWS ap-northeast-2)",
    "storage": "Supabase Storage (S3)",
    "cache": "Upstash Redis",
    "vector": "Supabase pgvector"
  }
}
```

### 3.2 폴더 구조

```
forge-labs/
├── apps/
│   └── forgeone/                 # 메인 앱
│       ├── app/
│       │   ├── (public)/         # 공개 페이지
│       │   ├── (dashboard)/      # 인증 필요
│       │   │   ├── dashboard/
│       │   │   ├── io/           # IO Agent
│       │   │   ├── legal/        # Legal Agent
│       │   │   └── settings/
│       │   ├── (portal)/         # 의뢰인 포털
│       │   └── api/
│       │       ├── agents/
│       │       └── webhooks/
│       ├── src/
│       │   ├── components/
│       │   ├── lib/
│       │   ├── stores/
│       │   └── types/
│       └── package.json
├── packages/
│   ├── types/
│   └── utils/
└── turbo.json
```

### 3.3 데이터 모델 (Supabase)

```sql
-- Core
users (id, email, name, plan, created_at)
workspaces (id, user_id, name, settings)

-- IO Agent
clients (id, workspace_id, name, email, phone, tags)
invoices (id, workspace_id, client_id, type, items, total, status)
schedules (id, workspace_id, title, start_at, end_at, recurrence)

-- Legal Agent
contracts (id, workspace_id, type, title, content, parties, analysis)
cases (id, workspace_id, client_id, title, status, access_token)
case_files (id, case_id, name, url, uploaded_by, version)
case_messages (id, case_id, sender, content, attachments)

-- Billing
subscriptions (id, user_id, stripe_customer_id, plan, status)
usage (id, workspace_id, agent, action, tokens, cost)
```

---

## 4. 개발 일정 시뮬레이션

### 4.1 Solo Developer 일정 (12주)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MVP 개발 타임라인 (12주)                      │
├─────────────────────────────────────────────────────────────────┤
│ Week 1-2: 프로젝트 셋업                                          │
│ ├── 모노레포 구조 설정                                           │
│ ├── Next.js 15 + Supabase 초기화                                │
│ ├── 디자인 시스템 (shadcn/ui)                                   │
│ └── 인증 플로우 (Supabase Auth)                                 │
├─────────────────────────────────────────────────────────────────┤
│ Week 3-4: IO Agent 기초                                          │
│ ├── 대시보드 레이아웃                                            │
│ ├── 고객 CRUD (CRM)                                             │
│ ├── 일정 관리 (캘린더)                                           │
│ └── 기본 AI 연동 (Claude API)                                   │
├─────────────────────────────────────────────────────────────────┤
│ Week 5-6: IO Agent 완성                                          │
│ ├── 견적서 생성                                                  │
│ ├── 세금계산서                                                   │
│ └── 매출/비용 대시보드                                           │
├─────────────────────────────────────────────────────────────────┤
│ Week 7-8: Legal Agent 기초                                       │
│ ├── 계약서 템플릿 (5종)                                          │
│ ├── 계약서 생성 AI                                               │
│ └── 계약서 분석 AI                                               │
├─────────────────────────────────────────────────────────────────┤
│ Week 9-10: Legal Agent 의뢰인 포털                               │
│ ├── 의뢰인 초대 시스템                                           │
│ ├── 파일 공유 (버전관리)                                         │
│ └── 엑셀 AI 분석                                                │
├─────────────────────────────────────────────────────────────────┤
│ Week 11-12: 결제 + 마무리                                        │
│ ├── Stripe 구독 연동                                            │
│ ├── 랜딩 페이지                                                  │
│ └── 베타 출시                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 마일스톤

| 마일스톤 | 시점 | 완료 기준 |
|----------|------|-----------|
| M1 | Week 2 | 인프라 완료 (Auth, DB, 배포) |
| M2 | Week 4 | IO Agent Alpha (CRM, 일정) |
| M3 | Week 6 | IO Agent Beta (견적서, 대시보드) |
| M4 | Week 8 | Legal Agent Alpha (계약서) |
| M5 | Week 10 | Legal Agent Beta (포털, 엑셀AI) |
| M6 | Week 12 | MVP Launch |

### 4.3 리스크 버퍼

| 리스크 | 버퍼 |
|--------|------|
| AI API 장애 | +1주 |
| 스코프 확대 | +2주 |
| 번아웃 | +1주 |
| 기타 | +0.5주 |
| **총 버퍼** | **+4.5주** |

**총 기간: 16.5주 (약 4개월)**

---

## 5. 비용 시뮬레이션

### 5.1 인프라 비용 (월간)

#### MVP 단계 (0-1,000 유저)
| 서비스 | 플랜 | 월 비용 |
|--------|------|---------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Upstash Redis | Pay-as-you-go | $5 |
| Claude API | Pay-as-you-go | $200 |
| Resend | Free | $0 |
| Sentry | Team | $26 |
| 도메인 | - | $2 |
| **합계** | | **$278/월 (₩390K)** |

#### Growth 단계 (1,000-10,000 유저)
| 서비스 | 월 비용 |
|--------|---------|
| Vercel | $20 |
| Supabase | $100 |
| Upstash | $50 |
| Claude API | $2,000 |
| Stripe 수수료 | ~$1,500 |
| 기타 | $170 |
| **합계** | **$3,840/월 (₩5.4M)** |

### 5.2 AI 비용 상세

| 기능 | 일 비용 | 월 비용 |
|------|---------|---------|
| 계약서 생성 | $3.30 | $99 |
| 계약서 분석 | $1.62 | $49 |
| 견적서 AI | $1.65 | $50 |
| 엑셀 분석 | $0.78 | $23 |
| 일반 채팅 | $4.50 | $135 |
| **합계** | **$11.89** | **$357** |

**유저당 월 AI 비용**: ₩350~700 (규모의 경제)

### 5.3 손익분기점

| 유료 유저 | MRR | 이익/손실 |
|-----------|-----|-----------|
| 10 | ₩600K | -₩490K |
| **20** | **₩1.2M** | **+₩110K (BEP)** |
| 50 | ₩3M | +₩1.91M |
| 100 | ₩6M | +₩4.91M |

**MVP 손익분기점: 유료 20명**

### 5.4 3년 재무 시뮬레이션

| 지표 | Year 1 | Year 2 | Year 3 |
|------|--------|--------|--------|
| 유료 유저 | 500 | 5,000 | 20,000 |
| ARPU | ₩60K | ₩65K | ₩70K |
| ARR | ₩360M | ₩3.9B | ₩16.8B |
| 총 비용 | ₩140M | ₩800M | ₩2.2B |
| **영업이익** | **₩220M** | **₩3.1B** | **₩14.6B** |
| 영업이익률 | 61% | 79% | 87% |

---

## 6. 최종 권장 사항

### 6.1 기술 선택 요약

| 영역 | 결정 | 근거 |
|------|------|------|
| Frontend | Next.js 15 + React 19 | SSR, 대중성 |
| Backend | Next.js API Routes | 풀스택 통합 |
| Database | Supabase | Auth+DB+Storage |
| AI | Claude 3.5 Sonnet | 최고 품질 |
| UI | shadcn/ui + Tailwind 4 | 빠른 개발 |
| Hosting | Vercel | 자동 스케일 |

### 6.2 핵심 수치

| 항목 | 값 |
|------|-----|
| MVP 기능 | 50개 |
| MVP 화면 | 30개 |
| 개발 기간 | 12주 (+4.5주 버퍼) |
| 월 비용 (MVP) | ₩1.24M |
| 손익분기 | 유료 20명 |
| Year 1 ARR | ₩360M |

### 6.3 즉시 실행 항목 (D+7)

| 우선순위 | 항목 | 기한 |
|----------|------|------|
| P0 | 모노레포 생성 (apps/forgeone) | D+1 |
| P0 | Next.js 15 + Supabase 초기화 | D+3 |
| P0 | shadcn/ui 설치 + 테마 | D+4 |
| P0 | DB 스키마 마이그레이션 | D+5 |
| P0 | Auth 플로우 구현 | D+7 |
| P0 | Vercel 배포 설정 | D+7 |

### 6.4 성공 지표

| 시점 | 지표 | 목표 |
|------|------|------|
| Week 12 | 기능 완성도 | 100% |
| Month 3 | 가입자 | 1,000명 |
| Month 3 | 유료 전환 | 100명 (10%) |
| Month 6 | MRR | ₩30M |

---

## 다음 단계

```
1. forge-labs/apps/forgeone 폴더 생성
2. Next.js 15 프로젝트 초기화
3. Supabase 프로젝트 생성 (ap-northeast-2)
4. shadcn/ui + Tailwind CSS 4 설정
5. DB 스키마 마이그레이션
6. 인증 플로우 구현
7. 대시보드 레이아웃 구축
```

---

*Generated by Claude 4.5 Opus Sequential Thinking (6 Steps)*
*Date: 2025-12-19*
*Version: v4.0*
