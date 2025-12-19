# IO 기획 - 2026 통합 플랫폼 시뮬레이션

> **프로젝트**: IO BLOCK + ADE + 명량 통합
> **생성일**: 2025-12-19
> **버전**: v2.0 (확정)
> **분석 도구**: Claude 4.5 Opus + WebSearch + Sequential Thinking + Context7

---

## 0. 브랜딩 (확정)

### 0.1 브랜드 아이덴티티

| 항목 | 확정 내용 |
|------|-----------|
| **브랜드명** | **FORGEONE** (포지원) |
| **슬로건** | "1인이지만, 혼자가 아닙니다" |
| **서브 슬로건** | "당신의 AI 에이전트 팀" |
| **영문 태그라인** | "Solo, Not Alone" |

### 0.2 컬러 팔레트

| 용도 | 컬러 | HEX | 설명 |
|------|------|-----|------|
| **Primary** | Deep Indigo | `#4F46E5` | 신뢰, 전문성 |
| **Secondary** | Warm Gold | `#D4A574` | 프리미엄, 성공 |
| **Accent** | Emerald | `#10B981` | 성장, 긍정 |
| **Background** | Dark Slate | `#0F172A` | 다크모드 기본 |
| **Surface** | Slate 800 | `#1E293B` | 카드 배경 |
| **Text** | Slate 100 | `#F1F5F9` | 본문 텍스트 |

### 0.3 타이포그래피

| 용도 | 폰트 | 스타일 |
|------|------|--------|
| **Display** | Noto Serif KR | 프리미엄 헤드라인 |
| **Body** | Pretendard | 본문 가독성 |
| **Code** | Geist Mono | 코드 블록 |

---

## 1. 프로젝트 개요

### 1.1 통합 컨셉

| 항목 | 내용 |
|------|------|
| **브랜드명** | FORGEONE (포지원) |
| **슬로건** | "1인이지만, 혼자가 아닙니다" |
| **핵심 가치** | 월 5만원으로 AI 에이전트 팀 고용 |
| **통합 대상** | IO BLOCK + ADE + 명량 MVP |

### 1.2 통합 프로젝트 현황

| 프로젝트 | 역할 | 완성도 | 위치 |
|----------|------|--------|------|
| IO BLOCK | 경영 자동화 | 기획 완료 | `io-extracted/` |
| ADE | AI 코드/디자인 생성 | 10% | `apps/ade/` |
| 명량 MVP | 법률 AI 진단 | 100% | `myeongryang-mvp/` |

---

## 2. 2026 트렌드 분석 결과

### 2.1 메가트렌드 5가지

#### 1) Agentic AI 원년 (2026)
- **출처**: [Gartner Strategic Predictions](https://www.gartner.com/en/articles/strategic-predictions-for-2026)
- **핵심**: 40% 기업 앱에 AI 에이전트 탑재 예정
- **시장 규모**: 2025년 $12-15B → 2030년 $80-100B (CAGR 40-50%)
- **주의**: AI 에이전트 프로젝트 40% 취소 예상 (비용/ROI 문제)

#### 2) 바이브 코딩 폭발
- **출처**: [와우테일](https://wowtale.net/2025/12/16/251974/)
- **정의**: 자연어 → 애플리케이션 생성 (Andrej Karpathy 명명)
- **시장**: 2024년 $4.7B → 2032년 $37B
- **주요 플레이어**:
  - Cursor: $29.3B 기업가치
  - Lovable: 8개월 만에 유니콘

#### 3) 1인 무인 창업 트렌드
- **출처**: [한국AI부동산신문](https://www.kairnews.com/news/436192), [Shopify](https://www.shopify.com/kr/blog/small-business-trends)
- **핵심**:
  - 무인/자동화 창업 급부상
  - AI 콘텐츠 창업 생산성 3배 향상
  - 스터디카페 등 무인 공간업종 성장

#### 4) 정부지원 확대
- **출처**: [NIPA](https://www.nipa.kr/home/2-2/15816), [KB Think](https://kbthink.com/business/tips/business-support-policy.html)
- **2025 AI바우처**: 최대 2억원/과제, 2025.05~12
- **2026 신규 사업**:
  - 혁신 소상공인 AI활용 지원사업
  - AI 도우미 지원사업
  - 경영안정 바우처 확대

#### 5) 리걸테크 폭발적 성장
- **출처**: [법률신문](https://www.lawtimes.co.kr/news/208961)
- **시장**: 2021년 $8.1B → 2027년 $46.5B
- **국내 투자**:
  - 로앤컴퍼니: 500억원 시리즈C2
  - 엘박스: 130억원 시리즈C
- **정책**: 리걸테크 진흥법 발의 중

---

## 3. 팔란티어 AIP 레퍼런스

### 3.1 팔란티어 아키텍처 참조

| Palantir 구성요소 | 설명 | FORGE ONE 적용 |
|-------------------|------|----------------|
| **Ontology** | 기업 데이터 통합 모델 | 1인 사업자 데이터 모델 |
| **Foundry** | 데이터 파이프라인 | SMS/Email 파싱 |
| **AIP Logic** | 비즈니스 로직 | 장부/법률/빌더 로직 |
| **Assist** | 자연어 인터페이스 | 대화형 AI 인터페이스 |
| **Agent** | 자율 실행 에이전트 | 3개 전문 에이전트 |
| **Guard Rails** | 권한/보안 통제 | PII 마스킹, 법적 고지 |

### 3.2 한국 사례

#### 인핸스 (Enhance)
- **출처**: [경향신문](https://www.khan.co.kr/article/202505261002018)
- **성과**: 한국 유일 팔란티어 스타트업 펠로우십 선정
- **기술**: LAM(Large Action Model) 기반 버티컬 AI 에이전트
- **계획**: Foundry/AIP 플랫폼 연동 고도화

#### KT 파트너십
- **출처**: [한국일보](https://www.hankookilbo.com/News/Read/A2025031310540002283)
- **성과**: 네트워크 장애 해결 시간 70% 단축
- **계획**: AIP 부트캠프 한국 버전 공동 개발

---

## 4. 타겟 세그먼트

### 4.1 Tier 1: 1인 전문사업자 (핵심)

| 직종 | 추정 인원 | 핵심 페인포인트 | FORGE ONE 솔루션 |
|------|----------|-----------------|------------------|
| 1인 변호사 | 5,000+ | 사건관리, 판례검색, 장부 | Legal + IO Agent |
| 1인 세무사 | 10,000+ | 고객관리, 세무자동화 | IO Agent + 홈택스 |
| 1인 회계사 | 3,000+ | 감사 자료, 리포트 | IO Agent + 문서생성 |
| 1인 디자이너 | 50,000+ | 포트폴리오, 인보이스 | ADE + IO Agent |
| 1인 개발자 | 100,000+ | 웹사이트, 계약관리 | ADE + Legal Agent |
| 1인 컨설턴트 | 20,000+ | 제안서, 정산 | ADE + IO Agent |

### 4.2 Tier 2: 1인 소상공인

| 업종 | 페인포인트 | 솔루션 |
|------|------------|--------|
| 온라인 셀러 | 장부, 세금계산서 | IO Agent |
| 프리랜서 | 인보이스, 웹사이트 | IO + ADE |
| 무인점포 운영자 | 경영 분석, 법률 | 전체 통합 |

---

## 5. 기술 아키텍처

### 5.1 Agent 시스템 설계

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORGE ONE Agent Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🧠 Orchestrator Agent (중앙 조율)                             │
│   ├── 사용자 의도 분석                                          │
│   ├── 하위 에이전트 조율                                        │
│   └── 결과 통합 및 보고                                         │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │ IO Agent   │  │ ADE Agent   │  │ Legal Agent │            │
│   │ (경영)     │  │ (빌더)      │  │ (법률)      │            │
│   ├─────────────┤  ├─────────────┤  ├─────────────┤            │
│   │ SMS 파싱   │  │ 웹 생성    │  │ 계약 검토   │            │
│   │ 장부 자동화│  │ 코드 생성  │  │ 분쟁 진단   │            │
│   │ 세금 계산  │  │ 배포 자동화│  │ 법률 상담   │            │
│   │ 지원금 매칭│  │ 디자인 AI  │  │ 리스크 알림 │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│   🔧 Shared Infrastructure                                      │
│   ├── Vector DB (법률/세무 지식)                                │
│   ├── RAG Pipeline                                              │
│   ├── Tool Registry (API 연동)                                  │
│   └── Human-in-the-Loop Gateway                                 │
│                                                                 │
│   🛡️ Guard Rails                                                │
│   ├── PII 자동 마스킹 (주민번호, 카드번호)                      │
│   ├── 법적 고지 자동 삽입                                       │
│   ├── Human-in-the-Loop (중요 결정)                             │
│   └── 감사 로그 (Audit Trail)                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 온톨로지 (데이터 모델)

```typescript
// FORGE ONE Ontology - 1인 전문가용 데이터 모델

interface Professional {
  id: string;
  type: "lawyer" | "accountant" | "taxAgent" | "designer" | "developer" | "consultant";
  license?: {
    number: string;
    expiry: Date;
    authority: string;
  };
  specialties: string[];
  clients: Client[];
}

interface Client {
  id: string;
  name: string;
  contact: ContactInfo;
  company?: string;
  projects: Project[];
}

interface Project {
  id: string;
  type: "case" | "audit" | "design" | "dev" | "consulting";
  status: "pending" | "active" | "completed" | "cancelled";
  deadline?: Date;
  fee: {
    total: number;
    paid: number;
    pending: number;
  };
  documents: Document[];
  transactions: Transaction[];
}

interface Document {
  id: string;
  type: "contract" | "invoice" | "report" | "brief" | "design";
  content: string;
  version: number;
  signature?: Signature;
  riskFlags: RiskFlag[];
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: Date;
  category: string;
  taxInfo: {
    deductible: boolean;
    vatIncluded: boolean;
    receipt?: string;
  };
}

interface Case extends Project {
  court: string;
  caseNumber: string;
  opponent?: string;
  timeline: CaseEvent[];
  precedents: Precedent[];
}
```

### 5.3 기술 스택 (2026 확정)

| 레이어 | 기술 | 버전 | 선정 이유 |
|--------|------|------|-----------|
| **Frontend** | Next.js | 16+ | App Router, Server Components |
| **UI** | React | 19+ | Concurrent Features |
| **Styling** | Tailwind CSS | 4+ | JIT, Container Queries |
| **Animation** | Framer Motion | 11+ | 모션 브랜딩 |
| **State** | Zustand | 5+ | 경량, DevTools |
| **Server State** | TanStack Query | 5+ | 캐싱, Prefetch |
| **AI** | Claude API | 4.5+ | 에이전트 메인 |
| **AI (백업)** | OpenAI | o3 | 추론 백업 |
| **Agent** | LangGraph | Latest | 멀티 에이전트 |
| **Vector DB** | Pinecone | Latest | 법률/세무 RAG |
| **Database** | Supabase Postgres | Latest | Row Level Security |
| **Cache** | Upstash Redis | Latest | 세션, 캐시 |
| **Edge** | Supabase Edge Functions | Latest | Deno 기반 |
| **인프라** | Vercel | Latest | 글로벌 엣지 |

### 5.4 웹앱 폴더 구조 (Next.js 16 App Router)

```
apps/io/
├── app/
│   ├── layout.tsx                 # 루트 레이아웃 (다크모드 기본)
│   ├── page.tsx                   # 랜딩 페이지
│   ├── (auth)/
│   │   ├── login/page.tsx         # 소셜 로그인 (Google, Kakao)
│   │   ├── signup/page.tsx        # 회원가입 (1인 사업자 온보딩)
│   │   └── callback/page.tsx      # OAuth 콜백
│   ├── (dashboard)/
│   │   ├── layout.tsx             # 대시보드 레이아웃 (사이드바)
│   │   ├── page.tsx               # 메인 대시보드 (AI 요약)
│   │   ├── io/                    # IO Agent - 경영관리
│   │   │   ├── page.tsx           # 경영 현황 개요
│   │   │   ├── cashflow/          # 현금흐름
│   │   │   ├── tax/               # 세금 관리
│   │   │   └── schedule/          # 일정 관리
│   │   ├── ade/                   # ADE Agent - 빌더
│   │   │   ├── page.tsx           # 빌더 메인
│   │   │   ├── projects/          # 프로젝트 목록
│   │   │   └── builder/           # No-Code 빌더
│   │   ├── legal/                 # Legal Agent - 법률
│   │   │   ├── page.tsx           # 법률 진단 메인
│   │   │   ├── defense/           # 형사 초동대응
│   │   │   └── contracts/         # 계약서 검토
│   │   └── settings/              # 설정
│   │       ├── page.tsx           # 계정 설정
│   │       ├── billing/           # 결제/구독
│   │       └── integrations/      # 외부 연동
│   └── api/
│       ├── auth/[...supabase]/    # Supabase Auth 라우트
│       ├── agents/
│       │   ├── orchestrator/route.ts  # 메인 에이전트 진입점
│       │   ├── io/route.ts            # IO Agent API
│       │   ├── ade/route.ts           # ADE Agent API
│       │   └── legal/route.ts         # Legal Agent API
│       └── webhooks/
│           ├── stripe/route.ts        # Stripe 결제 웹훅
│           └── supabase/route.ts      # Supabase 이벤트
├── components/
│   ├── ui/                        # 디자인 시스템 컴포넌트
│   ├── layout/                    # 레이아웃 컴포넌트
│   ├── agents/                    # 에이전트 UI 컴포넌트
│   └── dashboard/                 # 대시보드 컴포넌트
├── lib/
│   ├── supabase/                  # Supabase 클라이언트
│   ├── agents/                    # 에이전트 클라이언트
│   └── utils/                     # 유틸리티
├── hooks/                         # React 훅
├── stores/                        # Zustand 스토어
└── types/                         # TypeScript 타입
```

### 5.5 모듈 구조 (모노레포)

```
/packages/
├── core/              # 공통 비즈니스 로직
├── types/             # 공유 타입 정의
├── ui/                # 디자인 시스템 (FORGEONE 브랜드)
├── auth/              # 인증/인가 모듈
└── agents/            # AI 에이전트 공통
    ├── orchestrator/  # 중앙 조율자
    ├── io-agent/      # 경영 에이전트
    ├── ade-agent/     # 빌더 에이전트
    └── legal-agent/   # 법률 에이전트
```

### 5.6 API 엔드포인트 구조

```
/api/
├── auth/              # 인증 API
│   ├── login          # POST - 로그인
│   ├── logout         # POST - 로그아웃
│   └── refresh        # POST - 토큰 갱신
├── agents/            # 에이전트 API
│   ├── orchestrator   # POST - 메인 진입점
│   ├── io/run         # POST - IO Agent 실행
│   ├── ade/run        # POST - ADE Agent 실행
│   └── legal/run      # POST - Legal Agent 실행
├── transactions/      # 거래 CRUD
├── projects/          # 프로젝트 CRUD
├── documents/         # 문서 CRUD
└── webhooks/          # 외부 연동
    ├── stripe         # 결제 웹훅
    ├── hometax        # 홈택스 연동
    └── solapi         # 알림톡 연동
```

### 5.7 외부 API 연동

| API | 용도 | 우선순위 |
|-----|------|----------|
| **홈택스 API** | 세금계산서 자동화 | P0 |
| **국세청 현금영수증 API** | 영수증 자동 수집 | P1 |
| **법제처 API** | 법령 검색 | P0 |
| **SOLAPI** | 알림톡/SMS | P0 |
| **Stripe** | 결제 | P0 |
| **Google Calendar** | 일정 동기화 | P1 |

---

## 6. 수익 모델

### 6.1 B2C: 직종별 맞춤 요금제

| 플랜 | 월 가격 | 대상 | 포함 기능 |
|------|---------|------|-----------|
| **Free** | ₩0 | 체험 | 장부 30건, 법률진단 3회 |
| **Starter** | ₩29,000 | 프리랜서 | IO + ADE 기본 |
| **Pro** | ₩59,000 | 1인 전문가 | 3 Agent 통합 |
| **Legal+** | ₩99,000 | 1인 변호사 | + 판례DB + 사건관리 |
| **Tax+** | ₩79,000 | 1인 세무사 | + 홈택스 연동 |

### 6.2 B2G: 정부지원사업

| 사업명 | 지원 규모 | FORGE ONE 역할 | 예상 매출 |
|--------|----------|----------------|-----------|
| AI바우처 | 최대 2억/과제 | 공급기업 | ₩40억/년 (20과제) |
| 혁신소상공인AI | 2026 신규 | 솔루션 제공 | ₩10억/년 |
| SaaS 개발지원 | NIPA | 해외진출 | 지원금 활용 |

### 6.3 B2B: 화이트라벨

| 고객 유형 | 솔루션 | 예상 매출 |
|----------|--------|-----------|
| 대형 로펌 | Legal Agent API | ₩50M/년 |
| 세무법인 | IO Agent API | ₩30M/년 |
| 디자인 에이전시 | ADE Agent API | ₩20M/년 |

### 6.4 예상 수익 (3개년)

| 연도 | ARR | 유료 사용자 | 주요 수익원 |
|------|-----|------------|-------------|
| 2026 Q2 | ₩600M | 3,000명 | B2C + AI바우처 |
| 2026 Q4 | ₩1.2B | 8,000명 | + B2B 화이트라벨 |
| 2027 | ₩3B | 25,000명 | + 해외 진출 |

---

## 7. 로드맵

### 7.1 Phase 1: MVP (2025 Q4 - 2026 Q1)

- [ ] IO Agent 베타 (문자 → 장부)
- [ ] Legal Agent 베타 (형사 진단)
- [ ] ADE 랜딩페이지 빌더
- [ ] AI바우처 공급기업 등록
- **목표**: 유료 사용자 1,000명

### 7.2 Phase 2: Agent 통합 (2026 Q2-Q3)

- [ ] 3 Agent Orchestrator 연결
- [ ] 1인 변호사 버전 출시
- [ ] 1인 세무사 버전 출시
- [ ] 정부지원금 자동 매칭
- [ ] 세무회계사무소 B2B 파트너십
- **목표**: MRR ₩50M, AI바우처 10과제

### 7.3 Phase 3: Scale (2026 Q4)

- [ ] 리걸테크 화이트라벨 출시
- [ ] 바이브 코딩 풀버전 (음성 → 앱)
- [ ] 해외 진출 (동남아 프리랜서 시장)
- **목표**: ARR ₩1B, 사용자 10만

---

## 8. 마케팅 전략

### 8.1 채널 (저비용 고효율)

| 채널 | 전략 | 예상 CAC |
|------|------|----------|
| 정부지원사업 홍보 연계 | NIPA/중기부 공동 마케팅 | ₩0 |
| 유튜브 창업 채널 | 인플루언서 협업 | ₩50,000 |
| 네이버 카페/블로그 | SEO 콘텐츠 | ₩10,000 |
| 프리랜서 커뮤니티 | 위시켓, 크몽 파트너십 | ₩30,000 |
| 전문가 협회 | 세무사회, 변호사회 | ₩20,000 |

### 8.2 핵심 메시지

> **"2026년, 1인 전문가가 AI 에이전트 팀을 고용하는 시대"**
>
> 월 5만원으로:
> - 💰 **경영팀** (IO Agent) - 장부, 세금, 정부지원금
> - 🎨 **개발팀** (ADE Agent) - 웹사이트, 앱, 마케팅
> - ⚖️ **법무팀** (Legal Agent) - 계약, 분쟁, 리스크
>
> *"1인이지만 혼자가 아닙니다"*

---

## 9. 리스크 분석

### 9.1 리스크 매트릭스

| 리스크 | 확률 | 영향도 | 대응 전략 |
|--------|------|--------|-----------|
| AI 에이전트 프로젝트 실패 | 중 | 고 | MVP 빠른 검증, 비용 통제 |
| 빅테크 진입 (네이버/카카오) | 중 | 고 | 직종별 특화로 차별화 |
| AI 규제 강화 | 중 | 중 | Human-in-the-Loop 필수 설계 |
| 변호사법 저촉 | 중 | 고 | "참고용" 명시, 변호사 연결 |
| 개발 비용 초과 | 고 | 중 | AI바우처 수요기업 먼저 신청 |
| 데이터 보안 이슈 | 중 | 고 | 팔란티어 Guard Rails 참조 |

### 9.2 규제 대응

- **변호사법**: 법률 자문 아닌 "정보 제공" + "변호사 연결" 명시
- **세무사법**: 세무 신고 대행 아닌 "장부 정리 도구" 포지셔닝
- **개인정보보호법**: PII 자동 마스킹, 동의 기반 처리
- **AI 규제 (EU AI Act)**: Human-in-the-Loop, Kill Switch 구현

---

## 10. 경쟁 분석

### 10.1 직접 경쟁

| 경쟁사 | 영역 | 강점 | 약점 | FORGE ONE 차별화 |
|--------|------|------|------|------------------|
| 캐시노트 | 장부 | 카드매출 자동화 | 법률 없음 | 법률+빌더 통합 |
| 로톡 | 법률 | 변호사 DB | 경영 없음 | 경영+빌더 통합 |
| 프립 | 웹빌더 | 쉬운 UX | AI 부족 | AI 에이전트 |

### 10.2 간접 경쟁 (빅테크)

| 경쟁사 | 위협도 | 대응 |
|--------|--------|------|
| 네이버 스마트플레이스 | 중 | 전문가 특화로 차별화 |
| 카카오 비즈니스 | 중 | 깊은 도메인 지식 |
| 토스 비즈니스 | 고 | B2G 해자 구축 |

---

## 11. 팀 구성 (권장)

### 11.1 초기 팀 (MVP)

| 역할 | 인원 | 주요 역량 |
|------|------|-----------|
| CEO/PM | 1 | 사업 기획, 정부사업 |
| CTO | 1 | AI/ML, 시스템 아키텍처 |
| 풀스택 개발자 | 2 | Next.js, Supabase |
| AI 엔지니어 | 1 | LangChain, RAG |
| 디자이너 | 1 | UI/UX, 디자인 시스템 |

### 11.2 확장 팀 (Scale)

| 역할 | 인원 | 시점 |
|------|------|------|
| 세일즈 | 2 | 2026 Q2 |
| 고객 성공 | 2 | 2026 Q2 |
| 법률 자문 | 1 | 2026 Q1 |
| 세무 자문 | 1 | 2026 Q1 |

---

## 12. 참고 자료 (Sources)

### 12.1 트렌드 분석
- [Gartner Strategic Predictions 2026](https://www.gartner.com/en/articles/strategic-predictions-for-2026)
- [바이브 코딩 시장 분석 - 와우테일](https://wowtale.net/2025/12/16/251974/)
- [2026 창업 트렌드 - 한국AI부동산신문](https://www.kairnews.com/news/436192)
- [소규모 사업 트렌드 - Shopify](https://www.shopify.com/kr/blog/small-business-trends)

### 12.2 정부지원
- [AI바우처 지원사업 - NIPA](https://www.nipa.kr/home/2-2/15816)
- [2026 소상공인 지원정책 - KB Think](https://kbthink.com/business/tips/business-support-policy.html)
- [SaaS 개발 지원사업 - 정보통신산업진흥원](https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000104797)

### 12.3 리걸테크
- [LTAS 2025 - 법률신문](https://www.lawtimes.co.kr/news/208961)
- [리걸테크 진흥법 - 전자신문](https://www.etnews.com/20250624000313)

### 12.4 팔란티어
- [인핸스 펠로우십 - 경향신문](https://www.khan.co.kr/article/202505261002018)
- [KT 파트너십 - 한국일보](https://www.hankookilbo.com/News/Read/A2025031310540002283)
- [Palantir AIP](https://www.palantir.com/platforms/aip/)

### 12.5 AI 에이전트
- [AI Agents 2026 - MIT Sloan](https://mitsloan.mit.edu/ideas-made-to-matter/ai-agents-tech-circularity-whats-ahead-platforms-2026)
- [Agentic AI Trends - Blue Prism](https://www.blueprism.com/resources/blog/future-ai-agents-trends/)
- [PwC AI Predictions 2026](https://www.pwc.com/us/en/tech-effect/ai-analytics/ai-predictions.html)

---

## 13. 다음 단계

### 즉시 실행 (This Week)
1. [ ] MVP 기능 우선순위 결정
2. [ ] AI바우처 공급기업 등록 절차 확인
3. [ ] 1인 변호사/세무사 인터뷰 (니즈 검증)

### 단기 (1개월)
1. [ ] IO Agent 프로토타입 개발
2. [ ] 명량 MVP 코드 통합 검토
3. [ ] 기술 스택 확정 및 환경 구축

### 중기 (3개월)
1. [ ] MVP 베타 런칭
2. [ ] 초기 사용자 피드백 수집
3. [ ] AI바우처 과제 신청

---

## 14. MVP 라우트 우선순위

### 14.1 핵심 라우트 (P0)

| 경로 | 페이지 | 기능 |
|------|--------|------|
| `/` | 랜딩 | 마케팅 페이지, CTA |
| `/login` | 로그인 | 소셜 로그인 (Google, Kakao) |
| `/dashboard` | 대시보드 | AI 요약, 빠른 액션 |
| `/dashboard/io/*` | IO 에이전트 | 경영/세금/일정 |

### 14.2 확장 라우트 (P1)

| 경로 | 페이지 | 기능 |
|------|--------|------|
| `/dashboard/legal/*` | Legal 에이전트 | 법률/계약 (명량 MVP 통합) |
| `/dashboard/settings/*` | 설정 | 계정/결제/연동 |

### 14.3 고도화 라우트 (P2)

| 경로 | 페이지 | 기능 |
|------|--------|------|
| `/dashboard/ade/*` | ADE 에이전트 | 빌더/프로젝트 |
| `/dashboard/ade/builder` | No-Code 빌더 | 바이브 코딩 |

---

## 15. 확정 사항 요약

| 항목 | 확정 내용 |
|------|-----------|
| **브랜드명** | FORGEONE (포지원) |
| **슬로건** | "1인이지만, 혼자가 아닙니다" |
| **Primary Color** | Deep Indigo `#4F46E5` |
| **Secondary Color** | Warm Gold `#D4A574` |
| **Frontend** | Next.js 16+ / React 19+ |
| **Backend** | Supabase + Edge Functions |
| **AI** | Claude 4.5 API + LangGraph |
| **아키텍처** | Modular Monolith + Serverless Edge |
| **MVP 우선순위** | 인증 → IO Agent → Legal Agent → ADE Agent |

---

*Generated by Claude 4.5 Opus on 2025-12-19*
*Version: 2.0 (확정)*
*FORGEONE - 1인이지만, 혼자가 아닙니다*
