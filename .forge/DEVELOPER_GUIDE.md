# BIDFLOW 개발자 가이드

> **버전**: v0.1.0
> **업데이트**: 2025-12-21
> **대상**: 개발자, 기술 검토자

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [데이터 모델](#데이터-모델)
5. [API 설계](#api-설계)
6. [핵심 모듈](#핵심-모듈)
7. [개발 환경 설정](#개발-환경-설정)
8. [테스트 전략](#테스트-전략)
9. [배포 프로세스](#배포-프로세스)
10. [성능 최적화](#성능-최적화)

---

## 프로젝트 개요

### 목적

제조업 SME(중소기업)를 위한 **입찰 공고 자동 수집 및 AI 제품 매칭 시스템**

### 핵심 가치

- **자동화**: 45+ 데이터 소스에서 입찰 공고 자동 수집
- **AI 매칭**: CMNTech 5개 제품과 공고 자동 매칭 (92% 정확도)
- **생산성**: 입찰 준비 시간 70% 단축
- **글로벌**: TED(EU), SAM.gov(US) 등 해외 입찰 지원

### 타겟 사용자

- 씨엠엔텍 영업팀 (유량계/열량계 제조)
- 중소 제조업 입찰 담당자
- 공공조달 컨설턴트

---

## 기술 스택

### Frontend

```yaml
프레임워크: Next.js 15.5.9 (App Router)
UI 라이브러리: React 19
언어: TypeScript 5.7 (strict mode)
스타일링: Tailwind CSS 4.0
상태 관리: React Context + Zustand (예정)
폼 검증: Zod
HTTP 클라이언트: fetch (Next.js)
```

### Backend

```yaml
런타임: Node.js 20 LTS
프레임워크: Next.js API Routes
데이터베이스: Supabase (PostgreSQL 15)
ORM: Supabase Client SDK
인증: Supabase Auth
파일 스토리지: Supabase Storage
```

### 인프라

```yaml
호스팅: Vercel (권장)
CDN: Vercel Edge Network
데이터베이스: Supabase Cloud
캐싱: Upstash Redis (예정)
크롤링: Inngest (예정)
모니터링: Vercel Analytics + Sentry (예정)
```

### 개발 도구

```yaml
패키지 매니저: pnpm 8
린터: ESLint 9
포맷터: Prettier (PostToolUse Hook)
E2E 테스트: Playwright 1.57.0
타입 체크: tsc --noEmit
Git Hooks: Husky (예정)
```

---

## 시스템 아키텍처

### 전체 구조도

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Landing   │  │  Dashboard  │  │  Proposals  │         │
│  │   Pages     │  │     UI      │  │   Generator │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└──────────────────────┬──────────────────────────────────────┘
                       │ API Routes (/api/v1/*)
┌──────────────────────▼──────────────────────────────────────┐
│                     Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Enhanced   │  │  AI Smart    │  │   Crawler    │      │
│  │   Matcher    │  │  Functions   │  │   Manager    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Organization │  │  Pipe Size   │  │  Labeling    │      │
│  │  Dictionary  │  │  Extractor   │  │  Template    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │ Data Access Layer
┌──────────────────────▼──────────────────────────────────────┐
│                   Supabase (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  bids  │  products  │  matches  │  users  │  proposals      │
└─────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    External Data Sources                     │
├─────────────────────────────────────────────────────────────┤
│  TED API │ 나라장터 │ K-water │ SAM.gov │ KOICA │ ADB      │
└─────────────────────────────────────────────────────────────┘
```

### 디렉토리 구조

```
bidflow/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (marketing)/          # 랜딩 페이지 그룹
│   │   │   └── page.tsx          # 홈페이지
│   │   ├── api/v1/               # API v1 엔드포인트
│   │   │   ├── bids/             # 입찰 공고 CRUD
│   │   │   ├── matches/          # 매칭 결과
│   │   │   └── stats/            # 통계
│   │   └── layout.tsx            # 루트 레이아웃
│   │
│   ├── components/               # React 컴포넌트
│   │   ├── landing/              # 랜딩 페이지 섹션
│   │   │   ├── Hero.tsx
│   │   │   ├── SpreadsheetDemo/
│   │   │   └── ...
│   │   └── ui/                   # 재사용 UI
│   │
│   ├── lib/                      # 비즈니스 로직
│   │   ├── data/                 # 데이터 정의
│   │   │   ├── products.ts       # CMNTech 5개 제품
│   │   │   ├── mock-bids.ts      # 샘플 입찰 데이터
│   │   │   └── ai-functions.ts   # AI 함수 정의
│   │   │
│   │   ├── matching/             # 매칭 엔진
│   │   │   ├── enhanced-matcher.ts
│   │   │   ├── pipe-size-extractor.ts
│   │   │   ├── organization-dictionary.ts
│   │   │   └── labeling-template.ts
│   │   │
│   │   ├── clients/              # 외부 API 클라이언트
│   │   │   ├── ted-api.ts        # TED API
│   │   │   └── naramarket.ts     # 나라장터
│   │   │
│   │   └── utils/                # 유틸리티
│   │
│   └── types/                    # TypeScript 타입
│
├── tests/
│   └── e2e/                      # Playwright E2E 테스트
│       ├── spreadsheet-demo.spec.ts
│       └── landing-sections.spec.ts
│
├── public/                       # 정적 파일
├── docs/                         # 프로젝트 문서
├── .forge/                       # 설계 문서
└── supabase/                     # Supabase 설정 (예정)
```

---

## 데이터 모델

### 핵심 엔티티

#### Product (제품)

```typescript
interface Product {
  id: string; // 'UR-1000PLUS'
  name: string; // '다회선 초음파 유량계'
  category: string; // '상수도'
  pipeSizeRange: {
    min: number; // 300 (DN)
    max: number; // 4000 (DN)
  };
  strongKeywords: string[]; // ['초음파유량계', '상수도']
  weakKeywords: string[]; // ['유량계', '계측기']
  excludeKeywords: string[]; // ['전자유량계', '비만관']
}
```

#### BidAnnouncement (입찰 공고)

```typescript
interface BidAnnouncement {
  id: string; // 고유 ID
  title: string; // 공고명
  organization: string; // 발주기관
  description: string; // 공고 상세
  estimatedPrice: number; // 추정가격 (원)
  deadline: Date; // 마감일
  source: "naramarket" | "ted" | "kwater" | "kepco";
  sourceUrl: string; // 원문 링크
  createdAt: Date;
}
```

#### MatchResult (매칭 결과)

```typescript
interface MatchResult {
  productId: string; // 매칭된 제품 ID
  score: number; // 총점 (0-175)
  confidence: "high" | "medium" | "low";
  breakdown: {
    keywordScore: number; // 키워드 점수 (0-100)
    pipeSizeScore: number; // 규격 점수 (0-25)
    organizationScore: number; // 기관 점수 (0-50)
  };
  reasons: string[]; // 매칭 이유
  gaps?: string[]; // 요구사항 갭
}
```

### 데이터베이스 스키마 (예정)

```sql
-- 입찰 공고 테이블
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  description TEXT,
  estimated_price BIGINT,
  deadline TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 매칭 결과 테이블
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES bids(id),
  product_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  confidence TEXT NOT NULL,
  keyword_score INTEGER,
  pipe_size_score INTEGER,
  organization_score INTEGER,
  reasons JSONB,
  gaps JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_bids_deadline ON bids(deadline);
CREATE INDEX idx_bids_source ON bids(source);
CREATE INDEX idx_matches_bid_id ON matches(bid_id);
CREATE INDEX idx_matches_score ON matches(score DESC);
```

---

## API 설계

### API v1 엔드포인트

#### 입찰 공고 관리

```http
GET  /api/v1/bids
  - 쿼리: page, limit, source, status
  - 응답: { data: BidAnnouncement[], pagination: {...} }

GET  /api/v1/bids/:id
  - 응답: { data: BidAnnouncement }

POST /api/v1/bids
  - 바디: BidAnnouncement (title, organization, ...)
  - 응답: { data: BidAnnouncement }

PATCH /api/v1/bids/:id
  - 바디: Partial<BidAnnouncement>
  - 응답: { data: BidAnnouncement }

DELETE /api/v1/bids/:id (Admin only)
  - 응답: { success: true }
```

#### 매칭 엔진

```http
POST /api/v1/matches/analyze
  - 바디: { bidId: string }
  - 응답: {
      bestMatch: MatchResult,
      allMatches: MatchResult[],
      recommendation: 'BID' | 'REVIEW' | 'SKIP'
    }

GET  /api/v1/matches?bidId=xxx
  - 응답: { data: MatchResult[] }
```

#### 통계 및 분석

```http
GET  /api/v1/stats
  - 응답: {
      totalBids: number,
      avgMatchScore: number,
      topProducts: Array<{ productId, count }>,
      sourceDistribution: Record<string, number>
    }
```

### API 응답 형식

```typescript
// 성공
{
  data: T,
  meta?: {
    page: number,
    limit: number,
    total: number
  }
}

// 에러
{
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR',
    message: string,
    details?: Record<string, any>
  }
}
```

---

## 핵심 모듈

### 1. Enhanced Matcher (매칭 엔진)

**위치**: `src/lib/matching/enhanced-matcher.ts`

**알고리즘**:

```
총점 = 키워드 점수 (100점) + 규격 점수 (25점) + 기관 점수 (50점)
최대 175점

신뢰도:
- high: 80점 이상
- medium: 60-79점
- low: 60점 미만

추천 전략:
- BID: high 신뢰도 + 요구사항 100% 충족
- REVIEW: medium 신뢰도 또는 일부 갭 존재
- SKIP: low 신뢰도 또는 제외 키워드 발견
```

**주요 함수**:

```typescript
export function matchBidToProducts(bid: BidAnnouncement): {
  bestMatch: MatchResult | null;
  allMatches: MatchResult[];
  recommendation: "BID" | "REVIEW" | "SKIP";
};
```

### 2. Pipe Size Extractor (규격 추출)

**위치**: `src/lib/matching/pipe-size-extractor.ts`

**지원 패턴**:

- 국제 규격: `DN50`, `DN1000`
- 한국 표기: `구경 300mm`, `φ500`
- 범위: `DN100~DN500`
- 복수: `DN50, DN80, DN100`

**검증 규칙**:

- 표준 DN: 50, 80, 100, 125, 150, 200, 250, 300, ..., 4000
- 커스텀: 50 또는 100의 배수

### 3. Organization Dictionary (기관 정규화)

**위치**: `src/lib/matching/organization-dictionary.ts`

**45개 주요 기관**:

- 중앙정부: 환경부, 국토부, 산업부
- 공기업: K-water, 한전, 농어촌공사
- 지자체: 서울시, 부산시, 인천시
- 해외: TED(EU), ADB, World Bank

**기능**:

```typescript
normalizeOrganization(orgName: string): {
  canonical: string;     // 정규화된 이름
  confidence: 'exact' | 'alias' | 'partial';
  entry?: OrganizationEntry;
}
```

---

## 개발 환경 설정

### 1. 사전 요구사항

```bash
Node.js: 20 LTS
pnpm: 8.x
Git: 2.x
```

### 2. 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/yourusername/bidflow.git
cd bidflow

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집 (Supabase URL, API 키)

# 개발 서버 시작 (http://localhost:3010)
pnpm dev

# 타입 체크
pnpm typecheck

# 린트
pnpm lint

# 프로덕션 빌드
pnpm build

# E2E 테스트
pnpm test:e2e
```

### 3. 환경 변수

```bash
# 필수
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3010

# 선택 (프로덕션)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=Axxx...
INNGEST_EVENT_KEY=...
OPENAI_API_KEY=sk-...
```

---

## 테스트 전략

### E2E 테스트 (Playwright)

**총 46개 테스트**:

- SpreadsheetDemo: 10개
- Landing Sections: 23개 (Desktop)
- Landing Sections: 23개 (Mobile)

**실행**:

```bash
# 헤드리스 모드
pnpm test:e2e

# UI 모드 (인터랙티브)
pnpm test:e2e:ui

# 특정 테스트만
pnpm test:e2e spreadsheet-demo
```

### 단위 테스트 (예정)

```bash
# Vitest 사용 예정
pnpm test:unit

# 커버리지
pnpm test:coverage
```

### 테스트 커버리지 목표

- 유틸리티 함수: 90%+
- 비즈니스 로직: 80%+
- UI 컴포넌트: 70%+

---

## 배포 프로세스

### Vercel 배포 (권장)

```bash
# 1회성 배포
vercel --prod

# GitHub 연동 (자동 배포)
1. Vercel 대시보드에서 GitHub 저장소 Import
2. 환경 변수 설정
3. main 브랜치 푸시 시 자동 배포
```

### Docker 배포

```bash
# 빌드
docker build -t bidflow:0.1.0 .

# 실행
docker run -p 3010:3010 --env-file .env.production bidflow:0.1.0

# Docker Compose
docker-compose up -d
```

자세한 내용은 [DEPLOYMENT.md](DEPLOYMENT.md) 참조

---

## 성능 최적화

### 1. Code Splitting

```typescript
// SpreadsheetDemo 동적 임포트
const SpreadsheetDemo = dynamic(
  () => import('@/components/landing/SpreadsheetDemo'),
  { loading: () => <Spinner /> }
);
```

### 2. 이미지 최적화

```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="Logo"
/>
```

### 3. 캐싱 전략 (예정)

- Redis 캐싱: 매칭 결과 (TTL 1시간)
- Vercel Edge Caching: 정적 페이지
- SWR: 클라이언트 데이터 페칭

### 4. 성능 지표 (목표)

```yaml
Lighthouse Score:
  Performance: 90+
  Accessibility: 95+
  Best Practices: 95+
  SEO: 100

Core Web Vitals:
  LCP: < 2.5s
  FID: < 100ms
  CLS: < 0.1
```

---

## 코딩 컨벤션

### TypeScript

```typescript
// ✅ Good
export function calculateMatchScore(bid: BidAnnouncement): number {
  // ...
}

// ❌ Bad
export function calculate(bid: any): any {
  // ...
}
```

### 네이밍

- **컴포넌트**: PascalCase (`Hero.tsx`)
- **함수**: camelCase (`matchBidToProducts`)
- **상수**: UPPER_SNAKE_CASE (`PIPE_SIZE_PATTERNS`)
- **타입**: PascalCase (`MatchResult`)

### 파일 구조

```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces
interface Props { ... }

// 3. Constants
const MAX_SCORE = 100;

// 4. Main Component/Function
export function Component() { ... }

// 5. Helper Functions
function helper() { ... }
```

---

## 보안 가이드

### 1. 환경 변수

```typescript
// ✅ Good
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ❌ Bad
const apiKey = "sk-1234567890abcdef";
```

### 2. 입력 검증

```typescript
import { z } from "zod";

const bidSchema = z.object({
  title: z.string().min(1).max(500),
  estimatedPrice: z.number().positive(),
});

const result = bidSchema.safeParse(input);
```

### 3. SQL Injection 방지

```typescript
// ✅ Supabase 쿼리 빌더 사용
const { data } = await supabase.from("bids").select("*").eq("id", bidId);

// ❌ Raw SQL 지양
```

---

## 문제 해결

### 빌드 에러

```bash
# 캐시 삭제
rm -rf .next node_modules
pnpm install
pnpm build
```

### 타입 에러

```bash
# 타입 체크
pnpm typecheck

# node_modules/@types 재설치
rm -rf node_modules/@types
pnpm install
```

### E2E 테스트 실패

- [E2E_TEST_GUIDE.md](E2E_TEST_GUIDE.md) 참조
- WSL 환경: `npx playwright install-deps chromium`

---

## 참고 자료

### 내부 문서

- [README.md](README.md) - 프로젝트 개요
- [CHANGELOG.md](CHANGELOG.md) - 버전 히스토리
- [DEPLOYMENT.md](DEPLOYMENT.md) - 배포 가이드
- [docs/README.md](docs/README.md) - 문서 센터

### 외부 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Playwright 문서](https://playwright.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 기여 가이드

### Git Workflow

```bash
# Feature 브랜치 생성
git checkout -b feat/add-notification-system

# 커밋 (Conventional Commits)
git commit -m "feat: add email notification system"

# 푸시
git push origin feat/add-notification-system

# PR 생성
# GitHub에서 Pull Request 생성
```

### 커밋 메시지 규칙

```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 변경
refactor: 리팩토링
test: 테스트 추가
chore: 빌드/도구 변경
```

---

## 팀 연락처

- **기술 문의**: dev@bidflow.com
- **버그 리포트**: https://github.com/yourusername/bidflow/issues
- **Slack**: #bidflow-dev

---

**마지막 업데이트**: 2025-12-21
**문서 버전**: 1.0.0
**작성자**: BIDFLOW 개발팀
