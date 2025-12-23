# BIDFLOW V2 Beta Design Document

## Part 2: Database & Architecture

> GPT 5.2 Pro 검수용 마스터 설계 문서
> Version: 2.0-beta
> Date: 2025-12-21

---

# 3. System Architecture

## 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BIDFLOW V2 Architecture                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        Data Sources Layer                         │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐              │   │
│  │  │ TED API │  │ SAM.gov │  │ G2B API │  │ Future  │              │   │
│  │  │   (EU)  │  │  (US)   │  │  (KR)   │  │ Sources │              │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘              │   │
│  │       │            │            │            │                    │   │
│  └───────┼────────────┼────────────┼────────────┼────────────────────┘   │
│          │            │            │            │                        │
│          ▼            ▼            ▼            ▼                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Connector Framework Layer                      │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │  Source Connector Interface                                 │  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │  │   │
│  │  │  │ TED      │  │ SAM      │  │ G2B      │  │ Generic  │   │  │   │
│  │  │  │ Connector│  │ Connector│  │ Connector│  │ Connector│   │  │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  │                              │                                    │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │  Common Services                                            │  │   │
│  │  │  • Deduplication  • Rate Limiting  • Error Handling         │  │   │
│  │  │  • Retry Logic    • Logging        • Normalization          │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       Data Storage Layer                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │                    Supabase PostgreSQL                       │ │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │ │   │
│  │  │  │ tenants │ │ bids    │ │ products│ │ matches │            │ │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │ │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │ │   │
│  │  │  │ sources │ │profiles │ │ alerts  │ │audit_log│            │ │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  │                              │                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │  Row Level Security (RLS)                                    │ │   │
│  │  │  • Tenant isolation  • User permissions  • Data masking      │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Processing Layer                             │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │   │
│  │  │  Matching Engine │  │  Alert Generator │  │  AI Enrichment │  │   │
│  │  │  (175-point)     │  │  (Email/Slack)   │  │  (Future)      │  │   │
│  │  └──────────────────┘  └──────────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Application Layer                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │                   Next.js 15 App Router                      │ │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │ │   │
│  │  │  │Dashboard│ │ Bid List│ │ Product │ │ Settings│            │ │   │
│  │  │  │  Page   │ │  Page   │ │  Page   │ │  Page   │            │ │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │                      API Routes                              │ │   │
│  │  │  /api/v1/bids  /api/v1/matches  /api/v1/admin/ingest        │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Deployment Layer                             │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │   │
│  │  │    Vercel      │  │    Supabase    │  │    Inngest         │  │   │
│  │  │  (Frontend +   │  │  (Database +   │  │  (Scheduled Jobs)  │  │   │
│  │  │   API Routes)  │  │   Auth + RLS)  │  │                    │  │   │
│  │  └────────────────┘  └────────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Tech Stack

```yaml
Frontend:
  Framework: Next.js 15 (App Router)
  Language: TypeScript 5.x (strict mode)
  Styling: Tailwind CSS 3.x
  Components: shadcn/ui
  State: React Query (TanStack Query)
  Tables: Handsontable (스프레드시트 뷰)

Backend:
  Runtime: Next.js API Routes (Edge/Node)
  Language: TypeScript 5.x
  Validation: Zod
  Auth: Supabase Auth (JWT)

Database:
  Primary: Supabase PostgreSQL
  Cache: Redis (via Upstash) - Future
  Search: PostgreSQL Full-Text Search

Deployment:
  Hosting: Vercel
  Database: Supabase (hosted)
  Scheduler: Inngest (background jobs)
  Monitoring: Vercel Analytics + Sentry

External APIs:
  EU: TED API (publications.europa.eu)
  US: SAM.gov API (api.sam.gov)
  KR: 나라장터 API (조사 후 결정)
```

---

# 4. Database Schema

## 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BIDFLOW ERD                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐           ┌──────────────┐                            │
│  │   tenants    │           │   profiles   │                            │
│  ├──────────────┤           ├──────────────┤                            │
│  │ id (PK)      │◄──────────┤ tenant_id(FK)│                            │
│  │ name         │           │ id (PK)      │                            │
│  │ slug         │           │ user_id (FK) │──────► Supabase Auth       │
│  │ settings     │           │ role         │                            │
│  │ created_at   │           │ display_name │                            │
│  └──────┬───────┘           └──────────────┘                            │
│         │                                                                │
│         │ 1:N                                                            │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │   products   │                                                        │
│  ├──────────────┤                                                        │
│  │ id (PK)      │                                                        │
│  │ tenant_id(FK)│                                                        │
│  │ name         │                                                        │
│  │ model_number │                                                        │
│  │ category     │                                                        │
│  │ keywords     │ (JSONB)                                                │
│  │ specs        │ (JSONB)                                                │
│  │ is_active    │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         │ 1:N (matches)                                                  │
│         ▼                                                                │
│  ┌──────────────┐           ┌──────────────┐                            │
│  │   matches    │           │    bids      │                            │
│  ├──────────────┤           ├──────────────┤                            │
│  │ id (PK)      │           │ id (PK)      │                            │
│  │ bid_id (FK)  │──────────►│ source_id(FK)│                            │
│  │ product_id   │           │ notice_id    │                            │
│  │ tenant_id    │           │ title        │                            │
│  │ total_score  │           │ organization │                            │
│  │ keyword_score│           │ deadline     │                            │
│  │ spec_score   │           │ price        │                            │
│  │ org_score    │           │ description  │                            │
│  │ action       │           │ source_url   │                            │
│  │ reason       │           │ raw_data     │ (JSONB)                    │
│  │ created_at   │           │ hash         │ (중복 방지)                 │
│  └──────────────┘           │ created_at   │                            │
│                             └──────┬───────┘                            │
│                                    │                                     │
│                                    │ N:1                                 │
│                                    ▼                                     │
│                             ┌──────────────┐                            │
│                             │   sources    │                            │
│                             ├──────────────┤                            │
│                             │ id (PK)      │                            │
│                             │ name         │ (ted, sam_gov, g2b)        │
│                             │ type         │ (api, scraper, stub)       │
│                             │ config       │ (JSONB)                    │
│                             │ is_active    │                            │
│                             │ last_sync_at │                            │
│                             │ status       │                            │
│                             └──────────────┘                            │
│                                                                          │
│  ┌──────────────┐           ┌──────────────┐                            │
│  │   alerts     │           │  audit_logs  │                            │
│  ├──────────────┤           ├──────────────┤                            │
│  │ id (PK)      │           │ id (PK)      │                            │
│  │ tenant_id    │           │ tenant_id    │                            │
│  │ user_id      │           │ user_id      │                            │
│  │ match_id     │           │ action       │                            │
│  │ channel      │           │ entity_type  │                            │
│  │ status       │           │ entity_id    │                            │
│  │ sent_at      │           │ old_value    │                            │
│  │ created_at   │           │ new_value    │                            │
│  └──────────────┘           │ ip_address   │                            │
│                             │ created_at   │                            │
│                             └──────────────┘                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Table Definitions

### 4.2.1 tenants (고객사)

```sql
-- 멀티테넌트 지원을 위한 고객사 테이블
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 회사명 (예: CMNTech)
  slug TEXT UNIQUE NOT NULL,             -- URL용 슬러그 (예: cmntech)
  settings JSONB DEFAULT '{}',           -- 고객별 설정
  plan TEXT DEFAULT 'starter',           -- starter, pro, enterprise
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);

-- 설정 JSONB 구조 예시
/*
{
  "notification": {
    "email": true,
    "slack": false,
    "webhook_url": null
  },
  "matching": {
    "min_score": 70,
    "auto_action": false
  },
  "sources": {
    "ted": true,
    "sam_gov": true,
    "g2b": true
  }
}
*/
```

### 4.2.2 profiles (사용자 프로필)

```sql
-- Supabase Auth와 연동되는 사용자 프로필
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',   -- admin, member
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 인덱스
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Role enum 대신 CHECK constraint
ALTER TABLE profiles ADD CONSTRAINT valid_role
  CHECK (role IN ('admin', 'member'));
```

### 4.2.3 products (제품)

```sql
-- 고객사의 제품 카탈로그
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- 제품명 (예: UR-1000PLUS)
  model_number TEXT,                     -- 모델번호
  category TEXT,                         -- 카테고리 (예: 초음파유량계)
  description TEXT,

  -- 매칭용 키워드 (JSONB)
  keywords JSONB DEFAULT '{}',
  /*
  {
    "primary": ["초음파", "유량계", "다회선"],
    "secondary": ["DN100", "DN200", "DN500"],
    "specs": ["상수도", "취수", "정수"],
    "exclude": ["전자식", "와류"]
  }
  */

  -- 스펙 정보 (JSONB)
  specs JSONB DEFAULT '{}',
  /*
  {
    "diameter_range": "DN100-DN4000",
    "accuracy": "±0.5%",
    "communication": ["RS-485", "Modbus"],
    "protection": "IP68"
  }
  */

  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_keywords ON products USING GIN(keywords);
```

### 4.2.4 sources (데이터 소스)

```sql
-- 입찰 데이터 소스 정의
CREATE TABLE sources (
  id TEXT PRIMARY KEY,                   -- ted, sam_gov, g2b, etc.
  name TEXT NOT NULL,                    -- 표시명
  type TEXT NOT NULL,                    -- api, scraper, stub
  region TEXT,                           -- EU, US, KR, etc.
  base_url TEXT,

  -- API 설정 (JSONB)
  config JSONB DEFAULT '{}',
  /*
  {
    "api_key_env": "TED_API_KEY",
    "rate_limit": 100,
    "rate_window": 60,
    "timeout": 30000,
    "retry_count": 3
  }
  */

  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'idle',            -- idle, running, error
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  sync_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 소스 데이터
INSERT INTO sources (id, name, type, region, base_url, is_active) VALUES
  ('ted', 'EU TED', 'api', 'EU', 'https://ted.europa.eu/api', true),
  ('sam_gov', 'US SAM.gov', 'api', 'US', 'https://api.sam.gov', true),
  ('g2b', 'Korea G2B', 'api', 'KR', 'https://apis.data.go.kr', false),
  ('g2b_stub', 'Korea G2B (Stub)', 'stub', 'KR', null, true);
```

### 4.2.5 bids (입찰 공고)

```sql
-- 수집된 입찰 공고 (정규화된 형태)
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT REFERENCES sources(id),

  -- 원천 정보
  source_notice_id TEXT NOT NULL,        -- 원천 시스템의 고유 ID
  source_url TEXT,                       -- 원천 URL

  -- 정규화된 공고 정보
  title TEXT NOT NULL,
  organization TEXT,                     -- 발주기관
  country TEXT,                          -- 국가 코드 (KR, DE, US, etc.)
  deadline TIMESTAMPTZ,                  -- 마감일
  published_at TIMESTAMPTZ,              -- 공고일

  -- 금액 정보
  estimated_price NUMERIC,               -- 예정가격
  currency TEXT DEFAULT 'KRW',           -- 통화

  -- 상세 정보
  description TEXT,                      -- 요약/설명
  category TEXT,                         -- 카테고리

  -- 원본 데이터 (감사/재파싱용)
  raw_data JSONB,

  -- 중복 방지용 해시
  content_hash TEXT NOT NULL,

  -- 상태
  status TEXT DEFAULT 'active',          -- active, expired, cancelled

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 유니크 제약 (소스 + 공고ID)
  UNIQUE(source_id, source_notice_id)
);

-- 인덱스
CREATE INDEX idx_bids_source_id ON bids(source_id);
CREATE INDEX idx_bids_deadline ON bids(deadline);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_country ON bids(country);
CREATE INDEX idx_bids_content_hash ON bids(content_hash);
CREATE INDEX idx_bids_created_at ON bids(created_at DESC);

-- Full-text search 인덱스
CREATE INDEX idx_bids_fts ON bids
  USING GIN(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));
```

### 4.2.6 matches (매칭 결과)

```sql
-- 제품-공고 매칭 결과
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,

  -- 매칭 점수 (175점 만점)
  total_score INTEGER NOT NULL,          -- 총점 (0-175)
  keyword_score INTEGER DEFAULT 0,       -- 키워드 점수 (0-100)
  spec_score INTEGER DEFAULT 0,          -- 스펙 점수 (0-25)
  org_score INTEGER DEFAULT 0,           -- 기관 점수 (0-50)

  -- 매칭 상세
  match_details JSONB DEFAULT '{}',
  /*
  {
    "matched_keywords": ["초음파", "유량계", "DN200"],
    "matched_specs": ["정확도 ±0.5%", "RS-485"],
    "org_history": {
      "prev_contracts": 3,
      "preference_level": "high"
    },
    "excluded_keywords": []
  }
  */

  -- 권장 액션
  action TEXT NOT NULL,                  -- BID, REVIEW, SKIP
  action_reason TEXT,

  -- 사용자 피드백
  user_action TEXT,                      -- accepted, rejected, pending
  user_note TEXT,
  actioned_at TIMESTAMPTZ,
  actioned_by UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 유니크 제약 (테넌트 + 공고 + 제품)
  UNIQUE(tenant_id, bid_id, product_id)
);

-- 인덱스
CREATE INDEX idx_matches_tenant_id ON matches(tenant_id);
CREATE INDEX idx_matches_bid_id ON matches(bid_id);
CREATE INDEX idx_matches_product_id ON matches(product_id);
CREATE INDEX idx_matches_total_score ON matches(total_score DESC);
CREATE INDEX idx_matches_action ON matches(action);
CREATE INDEX idx_matches_created_at ON matches(created_at DESC);
```

### 4.2.7 alerts (알림)

```sql
-- 사용자 알림
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,

  -- 알림 정보
  type TEXT NOT NULL,                    -- new_match, deadline, competitor
  channel TEXT NOT NULL,                 -- email, slack, in_app

  -- 상태
  status TEXT DEFAULT 'pending',         -- pending, sent, failed, read
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  -- 내용
  subject TEXT,
  body TEXT,
  metadata JSONB DEFAULT '{}',

  -- 에러 정보
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_alerts_tenant_id ON alerts(tenant_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
```

### 4.2.8 audit_logs (감사 로그)

```sql
-- 시스템 감사 로그
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES profiles(id),

  -- 액션 정보
  action TEXT NOT NULL,                  -- create, update, delete, login, etc.
  entity_type TEXT NOT NULL,             -- bid, match, product, etc.
  entity_id UUID,

  -- 변경 내용
  old_value JSONB,
  new_value JSONB,

  -- 요청 정보
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,

  -- 시간
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (파티셔닝 고려)
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## 4.3 Row Level Security (RLS) Policies

### 4.3.1 tenants RLS

```sql
-- RLS 활성화
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 테넌트만 조회 가능
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM profiles
      WHERE user_id = auth.uid()
    )
  );

-- 정책: Admin만 테넌트 수정 가능
CREATE POLICY "Admins can update own tenant" ON tenants
  FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### 4.3.2 profiles RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 프로필 조회
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- 정책: 같은 테넌트 멤버 조회 (Admin)
CREATE POLICY "Admins can view tenant members" ON profiles
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 정책: 자신의 프로필 수정
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (user_id = auth.uid());
```

### 4.3.3 products RLS

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 테넌트 제품만 조회
CREATE POLICY "Users can view tenant products" ON products
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE user_id = auth.uid()
    )
  );

-- 정책: Admin만 제품 CUD
CREATE POLICY "Admins can manage products" ON products
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### 4.3.4 bids RLS

```sql
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 인증 사용자가 공고 조회 가능 (공개 데이터)
CREATE POLICY "Authenticated users can view bids" ON bids
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 정책: 서비스 롤만 공고 삽입/수정 (수집기)
CREATE POLICY "Service role can manage bids" ON bids
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 4.3.5 matches RLS

```sql
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 테넌트 매칭만 조회
CREATE POLICY "Users can view tenant matches" ON matches
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE user_id = auth.uid()
    )
  );

-- 정책: 서비스 롤이 매칭 생성
CREATE POLICY "Service role can create matches" ON matches
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 정책: 사용자가 자기 테넌트 매칭 수정 (피드백)
CREATE POLICY "Users can update tenant matches" ON matches
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE user_id = auth.uid()
    )
  );
```

---

## 4.4 Seed Data

### 4.4.1 CMNTech Tenant Seed

```sql
-- CMNTech 테넌트 생성
INSERT INTO tenants (id, name, slug, plan, settings) VALUES (
  'cmntech-0001-0001-0001-000000000001',
  'CMNTech',
  'cmntech',
  'pro',
  '{
    "notification": {
      "email": true,
      "slack": false
    },
    "matching": {
      "min_score": 70,
      "auto_action": false
    },
    "sources": {
      "ted": true,
      "sam_gov": true,
      "g2b": true
    }
  }'::jsonb
);

-- CMNTech 제품 5개 생성
INSERT INTO products (tenant_id, name, model_number, category, keywords, specs, is_active, display_order) VALUES
(
  'cmntech-0001-0001-0001-000000000001',
  'UR-1000PLUS',
  'UR-1000PLUS',
  '초음파유량계',
  '{
    "primary": ["초음파", "유량계", "다회선", "ultrasonic", "flowmeter"],
    "secondary": ["DN100", "DN200", "DN300", "DN500", "DN1000", "DN2000", "DN4000"],
    "specs": ["상수도", "취수", "정수", "water supply", "intake"],
    "exclude": ["전자식", "와류", "질량", "turbine"]
  }'::jsonb,
  '{
    "diameter_range": "DN100-DN4000",
    "accuracy": "±0.5%",
    "communication": ["RS-485", "Modbus RTU", "HART"],
    "protection": "IP68",
    "paths": "4-8"
  }'::jsonb,
  true,
  1
),
(
  'cmntech-0001-0001-0001-000000000001',
  'MF-1000C',
  'MF-1000C',
  '전자식유량계',
  '{
    "primary": ["전자식", "유량계", "일체형", "electromagnetic", "mag meter"],
    "secondary": ["DN15", "DN25", "DN50", "DN80", "DN100", "DN150", "DN200"],
    "specs": ["공정수", "냉각수", "온수", "process water", "cooling"],
    "exclude": ["초음파", "개수로", "열량", "ultrasonic"]
  }'::jsonb,
  '{
    "diameter_range": "DN15-DN2000",
    "accuracy": "±0.3%",
    "communication": ["RS-485", "HART", "Profibus"],
    "protection": "IP68",
    "liner": "PTFE"
  }'::jsonb,
  true,
  2
),
(
  'cmntech-0001-0001-0001-000000000001',
  'UR-1010PLUS',
  'UR-1010PLUS',
  '비만관형유량계',
  '{
    "primary": ["하수", "슬러지", "비만관", "sludge", "wastewater"],
    "secondary": ["이물질", "막힘", "오폐수", "sewage"],
    "specs": ["하수처리장", "펌프장", "관거", "treatment plant"],
    "exclude": ["상수도", "음용수", "정밀", "drinking water"]
  }'::jsonb,
  '{
    "diameter_range": "DN100-DN3000",
    "accuracy": "±1.0%",
    "solid_content": "up to 5%",
    "self_cleaning": true
  }'::jsonb,
  true,
  3
),
(
  'cmntech-0001-0001-0001-000000000001',
  'SL-3000PLUS',
  'SL-3000PLUS',
  '개수로유량계',
  '{
    "primary": ["개수로", "수위", "유속", "open channel", "level"],
    "secondary": ["하천", "수로", "농업용수", "river", "canal"],
    "specs": ["방류", "취수", "수문", "weir", "flume"],
    "exclude": ["관로", "배관", "폐쇄형", "pipe"]
  }'::jsonb,
  '{
    "level_type": "radar",
    "velocity_type": "doppler",
    "power": ["AC", "solar"],
    "communication": ["LTE", "LoRa", "WiFi"]
  }'::jsonb,
  true,
  4
),
(
  'cmntech-0001-0001-0001-000000000001',
  'EnerRay',
  'EnerRay',
  '열량계',
  '{
    "primary": ["열량계", "에너지", "난방", "BTU", "heat meter"],
    "secondary": ["지역난방", "빌딩", "district heating", "building"],
    "specs": ["스마트미터", "AMI", "원격검침", "smart meter"],
    "exclude": ["유량계", "수도", "하수", "water meter"]
  }'::jsonb,
  '{
    "diameter_range": "DN15-DN300",
    "accuracy": "Class 2",
    "bidirectional": true,
    "certification": ["MID", "KS"]
  }'::jsonb,
  true,
  5
);
```

---

## 4.5 Migration Files Structure

```
supabase/migrations/
├── 20250101000000_create_tenants.sql
├── 20250101000001_create_profiles.sql
├── 20250101000002_create_sources.sql
├── 20250101000003_create_products.sql
├── 20250101000004_create_bids.sql
├── 20250101000005_create_matches.sql
├── 20250101000006_create_alerts.sql
├── 20250101000007_create_audit_logs.sql
├── 20250101000008_create_rls_policies.sql
├── 20250101000009_create_indexes.sql
└── 20250101000010_seed_data.sql
```

---

_Part 2 끝 - Part 3: Connector & Matching Engine으로 계속_
