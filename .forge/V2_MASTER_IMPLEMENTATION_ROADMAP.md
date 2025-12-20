# BIDFLOW V2 마스터 구현 로드맵

> **버전**: 2.0.0-beta
> **작성일**: 2025-12-21
> **분석 기반**: Part 1-5 설계 + GPT 피드백 + CMNTech 페르소나

---

## 1. 비전 요약

```yaml
프로젝트: BIDFLOW V2 - 글로벌 입찰 통합 플랫폼
타겟 고객: CMNTech (씨엠엔텍 - 유량계 제조)
핵심 가치: 입찰 업무 시간 3시간 → 35분 (-83%)
기술 스택: Next.js 15 + Supabase + Handsontable
현재 완성도: 85-90%
```

---

## 2. Supabase 스키마 시각화

### 2.1 ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BIDFLOW V2 DATABASE                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   tenants   │──1:N──│  products   │──1:N──│   matches   │
│  (고객사)    │       │   (제품)    │       │  (매칭결과)  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ name        │       │ tenant_id   │◄──┐   │ tenant_id   │◄──┐
│ slug        │       │ name        │   │   │ bid_id      │◄──┤
│ settings    │       │ model_num   │   │   │ product_id  │◄──┤
│ plan        │       │ keywords    │   │   │ total_score │   │
│ created_at  │       │ specs       │   │   │ keyword_sc  │   │
└──────┬──────┘       └─────────────┘   │   │ spec_score  │   │
       │                                │   │ org_score   │   │
       │1:N                             │   │ action      │   │
       ▼                                │   │ user_action │   │
┌─────────────┐                         │   └─────────────┘   │
│  profiles   │                         │          ▲          │
│  (사용자)    │                         │          │N:1       │
├─────────────┤                         │          │          │
│ id (PK)     │                         │   ┌──────┴──────┐   │
│ user_id     │◄─Auth.users             │   │    bids     │   │
│ tenant_id   │─────────────────────────┘   │  (입찰공고)  │   │
│ role        │                             ├─────────────┤   │
│ preferences │                             │ id (PK)     │   │
└─────────────┘                             │ source_id   │◄──┤
       │                                    │ source_nid  │   │
       │1:N                                 │ title       │   │
       ▼                                    │ org         │   │
┌─────────────┐                             │ country     │   │
│   alerts    │◄────────────────────────────│ deadline    │   │
│   (알림)    │                             │ est_price   │   │
├─────────────┤                             │ description │   │
│ id (PK)     │                             │ raw_data    │   │
│ tenant_id   │                             │ content_hash│   │
│ user_id     │                             └──────┬──────┘   │
│ match_id    │◄────────────────────────────────────┘N:1       │
│ type        │                                               │
│ channel     │                             ┌─────────────┐   │
│ status      │                             │   sources   │───┘
│ sent_at     │                             │ (데이터소스) │
└─────────────┘                             ├─────────────┤
                                            │ id (PK)     │
┌─────────────┐                             │ name        │
│ org_scores  │                             │ type        │
│ (기관점수)   │                             │ config      │
├─────────────┤                             │ status      │
│ id (PK)     │                             │ last_sync   │
│ tenant_id   │                             └─────────────┘
│ org_name    │
│ win_count   │                             ┌─────────────┐
│ total_amt   │                             │ audit_logs  │
│ history_sc  │                             │  (감사로그)  │
│ pref_score  │                             ├─────────────┤
│ scale_score │                             │ id (PK)     │
│ total_score │                             │ tenant_id   │
└─────────────┘                             │ user_id     │
                                            │ action      │
                                            │ entity_type │
                                            │ old_value   │
                                            │ new_value   │
                                            │ ip_address  │
                                            └─────────────┘
```

### 2.2 테이블 상세 스키마

```sql
-- =========================================
-- 1. TENANTS (고객사)
-- =========================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 2. PROFILES (사용자 프로필)
-- =========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =========================================
-- 3. PRODUCTS (CMNTech 제품 5개)
-- =========================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model_number TEXT NOT NULL,
  keywords JSONB NOT NULL DEFAULT '{
    "primary": [],
    "secondary": [],
    "specs": [],
    "exclude": []
  }',
  specs JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, model_number)
);

-- CMNTech 5개 제품 초기 데이터
INSERT INTO products (tenant_id, name, model_number, keywords, specs) VALUES
('cmntech-uuid', 'UR-1000PLUS', 'UR-1000PLUS', '{
  "primary": ["초음파유량계", "다회선", "만관", "ultrasonic flow meter"],
  "secondary": ["상수도", "취수장", "정수장", "water meter"],
  "specs": ["DN100", "DN200", "DN500", "DN1000", "DN4000"],
  "exclude": ["전자유량계", "열량계"]
}', '{"accuracy": "±0.5%", "diameter": "DN100-DN4000", "protocol": ["RS485", "Modbus"]}'),

('cmntech-uuid', 'MF-1000C', 'MF-1000C', '{
  "primary": ["전자유량계", "일체형", "electromagnetic"],
  "secondary": ["공업용수", "상거래", "냉온수"],
  "specs": ["DN15", "DN50", "DN100", "DN2000"],
  "exclude": ["초음파", "열량계"]
}', '{"accuracy": "±0.3%", "diameter": "DN15-DN2000", "protocol": ["RS485", "HART"]}'),

('cmntech-uuid', 'UR-1010PLUS', 'UR-1010PLUS', '{
  "primary": ["비만관형", "하수유량계", "초음파"],
  "secondary": ["하수", "우수", "복류수", "슬러지"],
  "specs": ["DN100", "DN500", "DN3000"],
  "exclude": ["만관", "상수도"]
}', '{"accuracy": "±1.0%", "diameter": "DN100-DN3000", "debris_tolerance": "5%"}'),

('cmntech-uuid', 'SL-3000PLUS', 'SL-3000PLUS', '{
  "primary": ["개수로유량계", "하천유량계", "open channel"],
  "secondary": ["하천", "수로", "농업용수", "방류"],
  "specs": ["레이더", "도플러", "비접촉"],
  "exclude": ["만관", "관로"]
}', '{"method": "레이더+도플러", "power": ["AC", "태양광"], "application": "하천/수로"}'),

('cmntech-uuid', 'EnerRay', 'EnerRay', '{
  "primary": ["열량계", "초음파열량계", "heat meter"],
  "secondary": ["지역난방", "냉난방", "에너지"],
  "specs": ["DN15", "DN100", "DN300", "Class 2"],
  "exclude": ["유량계"]
}', '{"accuracy": "Class 2", "diameter": "DN15-DN300", "application": "지역난방"}');

-- =========================================
-- 4. SOURCES (데이터 소스)
-- =========================================
CREATE TABLE sources (
  id TEXT PRIMARY KEY,  -- ted, sam_gov, g2b
  name TEXT NOT NULL,
  type TEXT DEFAULT 'api' CHECK (type IN ('api', 'scraper', 'stub')),
  config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sources (id, name, type, config) VALUES
('ted', 'TED (EU)', 'api', '{"baseUrl": "https://ted.europa.eu/api/v3.0", "rateLimit": 100}'),
('sam_gov', 'SAM.gov (US)', 'api', '{"baseUrl": "https://api.sam.gov/opportunities/v2", "rateLimit": 600}'),
('g2b', '나라장터 (KR)', 'stub', '{"status": "pending_api_verification"}');

-- =========================================
-- 5. BIDS (입찰 공고)
-- =========================================
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL REFERENCES sources(id),
  source_notice_id TEXT NOT NULL,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  country TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  estimated_price BIGINT,
  currency TEXT DEFAULT 'KRW',
  description TEXT,
  raw_data JSONB,
  content_hash TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'matched', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, source_notice_id)
);

-- FTS 인덱스
CREATE INDEX bids_fts_idx ON bids USING GIN(to_tsvector('simple', title || ' ' || COALESCE(description, '')));
CREATE INDEX bids_deadline_idx ON bids(deadline);
CREATE INDEX bids_source_idx ON bids(source_id);

-- =========================================
-- 6. MATCHES (매칭 결과 - 175점)
-- =========================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- 175점 점수 체계
  total_score DECIMAL(5,2) NOT NULL,
  keyword_score DECIMAL(5,2) DEFAULT 0,  -- 0-100
  spec_score DECIMAL(5,2) DEFAULT 0,     -- 0-25
  org_score DECIMAL(5,2) DEFAULT 0,      -- 0-50

  -- 액션 결정
  action TEXT NOT NULL CHECK (action IN ('BID', 'REVIEW', 'SKIP')),
  match_details JSONB DEFAULT '{}',

  -- 사용자 피드백
  user_action TEXT CHECK (user_action IN ('BID', 'REVIEW', 'SKIP')),
  actioned_by UUID REFERENCES profiles(id),
  actioned_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, bid_id, product_id)
);

CREATE INDEX matches_tenant_idx ON matches(tenant_id);
CREATE INDEX matches_score_idx ON matches(total_score DESC);
CREATE INDEX matches_action_idx ON matches(action);

-- =========================================
-- 7. ORG_SCORES (기관 점수 - 50점)
-- =========================================
CREATE TABLE org_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  organization_name TEXT NOT NULL,
  organization_id TEXT,

  -- 거래 이력 (25점)
  win_count INTEGER DEFAULT 0,
  total_amount BIGINT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  history_score DECIMAL(5,2) DEFAULT 0,

  -- 선호도 (15점)
  is_preferred BOOLEAN DEFAULT FALSE,
  preference_weight DECIMAL(3,2) DEFAULT 1.00,
  industry_tags TEXT[],
  region_tags TEXT[],
  preference_score DECIMAL(5,2) DEFAULT 0,

  -- 기관 규모 (10점)
  budget_tier TEXT CHECK (budget_tier IN ('S', 'A', 'B', 'C')),
  annual_bid_count INTEGER DEFAULT 0,
  org_type TEXT DEFAULT 'public',
  scale_score DECIMAL(5,2) DEFAULT 0,

  -- 총점 (자동 계산)
  total_score DECIMAL(5,2) GENERATED ALWAYS AS (
    history_score + preference_score + scale_score
  ) STORED,

  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, organization_name)
);

-- CMNTech 초기 기관 데이터
INSERT INTO org_scores (tenant_id, organization_name, win_count, total_amount, is_preferred, budget_tier) VALUES
('cmntech-uuid', 'K-water', 5, 500000000, true, 'S'),
('cmntech-uuid', '한국환경공단', 3, 300000000, true, 'A'),
('cmntech-uuid', '서울시 상수도사업본부', 2, 200000000, true, 'A'),
('cmntech-uuid', '부산시 환경시설공단', 1, 100000000, false, 'B');

-- =========================================
-- 8. ALERTS (알림)
-- =========================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES profiles(id),
  match_id UUID REFERENCES matches(id),
  type TEXT NOT NULL CHECK (type IN ('new_match', 'deadline', 'competitor', 'system')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'slack', 'in_app', 'webhook')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  message JSONB,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 9. AUDIT_LOGS (감사 로그)
-- =========================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX audit_logs_tenant_idx ON audit_logs(tenant_id, created_at DESC);
```

### 2.3 RLS (Row Level Security) 정책

```sql
-- =========================================
-- RLS 정책 활성화
-- =========================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- bids는 공개 데이터 (RLS 없음)

-- =========================================
-- 테넌트 격리 함수
-- =========================================
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- =========================================
-- 정책: 자신의 테넌트 데이터만 접근
-- =========================================
CREATE POLICY "tenant_isolation" ON products
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation" ON matches
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation" ON org_scores
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation" ON alerts
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation" ON audit_logs
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- profiles: 자신 또는 같은 테넌트 관리자만
CREATE POLICY "profile_access" ON profiles
  FOR SELECT USING (
    user_id = auth.uid() OR
    (tenant_id = get_current_tenant_id() AND
     EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'))
  );
```

---

## 3. CMNTech 하드웨어 기반 AI SW 설계

### 3.1 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CMNTech 하드웨어 + AI SW 통합 아키텍처                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              LAYER 1: HARDWARE                               │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│   UR-1000PLUS   │    MF-1000C     │  UR-1010PLUS    │  SL-3000PLUS | EnerRay │
│   (초음파유량계)  │   (전자유량계)   │   (비만관형)    │  (개수로) | (열량계)   │
├─────────────────┴─────────────────┴─────────────────┴─────────────────────────┤
│  프로토콜: RS-485 | Modbus | HART | M-Bus | GPRS | LoRa                       │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LAYER 2: EDGE GATEWAY                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ 데이터 수집  │  │ 프로토콜 변환│  │ 로컬 버퍼링 │  │ 엣지 AI    │          │
│  │ (Polling)   │  │ (Modbus→JSON│  │ (SQLite)    │  │ (이상탐지)  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                              │
│  하드웨어: Raspberry Pi 4 / Industrial Gateway                               │
│  OS: Raspbian / Debian (임베디드 Linux)                                       │
│  통신: 4G LTE / WiFi / Ethernet                                              │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ HTTPS / MQTT
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 3: CLOUD (Supabase)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Supabase Realtime                               │ │
│  │  - 센서 데이터 실시간 수신                                                │ │
│  │  - 웹소켓 기반 양방향 통신                                                │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ sensor_data │  │ device_meta │  │ ai_results  │  │ alerts      │          │
│  │  (시계열)   │  │  (장비정보) │  │  (AI 분석)  │  │   (알림)    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         PostgreSQL + TimescaleDB                        │ │
│  │  - 시계열 데이터 최적화 (hypertable)                                      │ │
│  │  - 자동 압축 (compression policy)                                        │ │
│  │  - 연속 집계 (continuous aggregates)                                      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LAYER 4: AI ENGINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│  │  이상 탐지 AI   │  │  예측 정비 AI   │  │  에너지 최적화  │               │
│  │  Anomaly Det.   │  │  Predictive     │  │  Energy Opt.    │               │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤               │
│  │ - Isolation     │  │ - LSTM 시계열   │  │ - 최적 유량     │               │
│  │   Forest        │  │ - 고장 예측     │  │ - 비용 절감     │               │
│  │ - Autoencoder   │  │ - 센서 드리프트 │  │ - ROI 분석      │               │
│  │ - 통계 기반     │  │ - 교체 시점     │  │                 │               │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘               │
│                                                                              │
│  런타임: Python + FastAPI | Supabase Edge Functions                          │
│  모델: scikit-learn | TensorFlow Lite | ONNX                                 │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LAYER 5: BIDFLOW DASHBOARD                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                      센서 모니터링 대시보드                               │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐              │ │
│  │  │ 실시간    │  │ 이상 알림 │  │ 트렌드    │  │ 리포트    │              │ │
│  │  │ 유량 현황 │  │ (Push)    │  │ 분석      │  │ (Excel)   │              │ │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘              │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                      입찰 자동화 + 제품 연동                              │ │
│  │  - 설치된 장비 기반 입찰 공고 매칭                                         │ │
│  │  - 유지보수 이력 기반 기관 점수                                            │ │
│  │  - AI 스펙 비교 (공고 vs 실제 장비)                                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  기술: Next.js 15 | Recharts | Handsontable                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 센서 데이터 스키마 (TimescaleDB)

```sql
-- =========================================
-- 시계열 확장 활성화
-- =========================================
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- =========================================
-- 1. DEVICES (설치 장비)
-- =========================================
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),

  -- 장비 정보
  serial_number TEXT UNIQUE NOT NULL,
  installation_date DATE NOT NULL,
  location TEXT NOT NULL,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),

  -- 연결 정보
  gateway_id TEXT,
  protocol TEXT CHECK (protocol IN ('modbus', 'rs485', 'mqtt', 'lora')),
  address INTEGER,  -- Modbus 주소

  -- 상태
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'offline', 'decommissioned')),
  last_seen_at TIMESTAMPTZ,

  -- 메타데이터
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 2. SENSOR_DATA (시계열 데이터)
-- =========================================
CREATE TABLE sensor_data (
  time TIMESTAMPTZ NOT NULL,
  device_id UUID NOT NULL REFERENCES devices(id),

  -- 측정값
  flow_rate DECIMAL(12, 4),      -- 순간 유량 (m³/h)
  total_volume DECIMAL(16, 4),   -- 누적 유량 (m³)
  velocity DECIMAL(8, 4),        -- 유속 (m/s)
  temperature DECIMAL(6, 2),     -- 온도 (°C)
  pressure DECIMAL(8, 2),        -- 압력 (bar)

  -- 품질 지표
  signal_strength INTEGER,       -- 신호 강도 (%)
  battery_level INTEGER,         -- 배터리 (%)
  error_code TEXT,

  -- 메타
  raw_data JSONB
);

-- 하이퍼테이블 변환
SELECT create_hypertable('sensor_data', 'time');

-- 압축 정책 (7일 이후 압축)
ALTER TABLE sensor_data SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'device_id'
);
SELECT add_compression_policy('sensor_data', INTERVAL '7 days');

-- 보존 정책 (1년 후 삭제)
SELECT add_retention_policy('sensor_data', INTERVAL '1 year');

-- =========================================
-- 3. AI_RESULTS (AI 분석 결과)
-- =========================================
CREATE TABLE ai_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id),
  analysis_type TEXT NOT NULL CHECK (analysis_type IN (
    'anomaly_detection',
    'predictive_maintenance',
    'energy_optimization',
    'drift_detection'
  )),

  -- 결과
  score DECIMAL(5, 4),           -- 0-1
  confidence DECIMAL(5, 4),      -- 0-1
  prediction JSONB,              -- 상세 예측

  -- 권장 조치
  recommendation TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),

  -- 시간
  analysis_time TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ
);

-- =========================================
-- 연속 집계 (시간별 평균)
-- =========================================
CREATE MATERIALIZED VIEW sensor_data_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS bucket,
  device_id,
  AVG(flow_rate) AS avg_flow_rate,
  MAX(flow_rate) AS max_flow_rate,
  MIN(flow_rate) AS min_flow_rate,
  SUM(flow_rate) AS total_flow,
  AVG(temperature) AS avg_temperature,
  COUNT(*) AS sample_count
FROM sensor_data
GROUP BY bucket, device_id;

-- 자동 갱신 정책
SELECT add_continuous_aggregate_policy('sensor_data_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour'
);
```

### 3.3 AI 모델 설계

```yaml
AI 모델:

  1. 이상 탐지 (Anomaly Detection):
    목적: 비정상 유량 패턴 실시간 감지
    알고리즘:
      - Isolation Forest (빠른 탐지)
      - Autoencoder (복잡한 패턴)
      - 통계 기반 (3-sigma rule)
    입력:
      - flow_rate (순간 유량)
      - velocity (유속)
      - temperature (온도)
      - 24시간 이동평균
    출력:
      - anomaly_score: 0-1
      - is_anomaly: boolean
      - anomaly_type: [leak, blockage, sensor_fault, surge]

    경고 임계값:
      - warning: score > 0.7
      - critical: score > 0.9

  2. 예측 정비 (Predictive Maintenance):
    목적: 센서 교체/정비 시점 예측
    알고리즘:
      - LSTM (시계열 패턴 학습)
      - Survival Analysis (수명 예측)
    입력:
      - 30일 센서 데이터
      - 설치 후 경과 일수
      - 이전 정비 이력
    출력:
      - days_until_failure: 예상 잔여 수명
      - maintenance_recommendation: 조치 권고
      - confidence: 신뢰도

    정비 주기:
      - 일상점검: 30일
      - 정기점검: 180일
      - 교정: 365일

  3. 에너지 최적화 (Energy Optimization):
    목적: 최적 유량 운영으로 비용 절감
    알고리즘:
      - 최적화 알고리즘 (Scipy)
      - 시뮬레이션 기반
    입력:
      - 유량 데이터
      - 전력 소비 데이터
      - 요금 체계
    출력:
      - optimal_flow_rate: 권장 유량
      - expected_savings: 예상 절감액
      - roi_analysis: 투자 대비 효과

  4. 드리프트 탐지 (Drift Detection):
    목적: 센서 정확도 저하 조기 감지
    알고리즘:
      - 기준점 비교 (Reference Comparison)
      - 트렌드 분석
    입력:
      - 교정 데이터
      - 일별 측정값
    출력:
      - drift_percentage: 드리프트율 (%)
      - calibration_needed: 교정 필요 여부
      - next_calibration_date: 권장 교정일
```

### 3.4 API 엔드포인트 설계

```yaml
API 엔드포인트:

  디바이스 관리:
    POST /api/v1/devices:
      설명: 새 장비 등록
      body: { serial_number, product_id, location, ... }

    GET /api/v1/devices:
      설명: 장비 목록 조회
      query: { tenant_id, status, product_id }

    GET /api/v1/devices/:id:
      설명: 장비 상세 조회

    PATCH /api/v1/devices/:id:
      설명: 장비 정보 수정

    DELETE /api/v1/devices/:id:
      설명: 장비 삭제 (decommission)

  센서 데이터:
    POST /api/v1/sensor-data:
      설명: 센서 데이터 수신 (게이트웨이에서 호출)
      body: { device_id, time, flow_rate, ... }
      인증: API Key (device-specific)

    GET /api/v1/sensor-data:
      설명: 센서 데이터 조회
      query: { device_id, start, end, interval }
      응답: 시계열 데이터 (pagination)

    GET /api/v1/sensor-data/realtime:
      설명: 실시간 스트림 (WebSocket)
      protocol: Supabase Realtime

  AI 분석:
    POST /api/v1/ai/analyze:
      설명: 즉석 분석 요청
      body: { device_id, analysis_type }
      응답: { score, prediction, recommendation }

    GET /api/v1/ai/results:
      설명: AI 분석 결과 조회
      query: { device_id, type, severity }

    POST /api/v1/ai/train:
      설명: 모델 재학습 트리거 (관리자)
      body: { model_type, training_data_range }

  알림:
    POST /api/v1/alerts/device:
      설명: 장비 알림 발송
      body: { device_id, alert_type, message }

    GET /api/v1/alerts/device/:device_id:
      설명: 장비별 알림 이력

  리포트:
    GET /api/v1/reports/device/:id:
      설명: 장비 리포트 생성
      query: { period: 'daily'|'weekly'|'monthly' }
      응답: PDF 또는 Excel
```

---

## 4. 구현 우선순위 (Phase 계획)

### Phase 1: 기반 시스템 (Week 1-4)

```yaml
Sprint 1 (Week 1-2):
  - [ ] Supabase 마이그레이션 실행 (9개 테이블)
  - [ ] CMNTech 초기 데이터 시딩
  - [ ] RLS 정책 적용 및 테스트
  - [ ] 프로덕션 빌드 최적화

Sprint 2 (Week 3-4):
  - [ ] 모바일 반응형 완성
  - [ ] Lighthouse 성능 측정 및 개선
  - [ ] E2E 테스트 전체 실행
  - [ ] Upstash Redis 실제 연동

담당: 개발팀
산출물:
  - 프로덕션 배포 가능한 V2
  - 테스트 커버리지 80%+
```

### Phase 2: 커넥터 & 매칭 (Week 5-8)

```yaml
Sprint 3 (Week 5-6):
  - [ ] TED API 실제 연동
  - [ ] SAM.gov API 실제 연동
  - [ ] 175점 매칭 엔진 통합 테스트
  - [ ] 기관 점수 피드백 루프

Sprint 4 (Week 7-8):
  - [ ] G2B API 합법성 검토
  - [ ] Inngest 크롤링 자동화
  - [ ] 알림 시스템 (Slack/Email)
  - [ ] CMNTech 파일럿 시작

담당: 개발팀 + CMNTech
산출물:
  - 3개 커넥터 실동작
  - CMNTech 파일럿 킥오프
```

### Phase 3: 하드웨어 연동 (Week 9-12)

```yaml
Sprint 5 (Week 9-10):
  - [ ] TimescaleDB 확장 설치
  - [ ] devices, sensor_data 테이블 생성
  - [ ] 엣지 게이트웨이 프로토타입
  - [ ] 센서 데이터 수집 API

Sprint 6 (Week 11-12):
  - [ ] Supabase Realtime 연동
  - [ ] 센서 모니터링 대시보드
  - [ ] 이상 탐지 AI (Isolation Forest)
  - [ ] CMNTech 현장 설치 테스트

담당: 개발팀 + CMNTech 기술팀
산출물:
  - 하드웨어-클라우드 연동 POC
  - 실시간 모니터링 대시보드
```

### Phase 4: AI 고도화 (Week 13-16)

```yaml
Sprint 7 (Week 13-14):
  - [ ] 예측 정비 AI (LSTM)
  - [ ] 드리프트 탐지 AI
  - [ ] 에너지 최적화 모델
  - [ ] 모델 서빙 인프라

Sprint 8 (Week 15-16):
  - [ ] AI 바우처 신청 준비
  - [ ] AI 분석 대시보드
  - [ ] 리포트 자동 생성
  - [ ] 정식 출시

담당: AI팀 + 개발팀
산출물:
  - 4개 AI 모델 배포
  - AI 바우처 신청서
  - BIDFLOW V2 정식 출시
```

---

## 5. 성공 지표 (KPI)

```yaml
비즈니스 KPI:
  - 일일 검색 시간: 3시간 → 35분 (-83%)
  - 공고 놓침률: 60% → <5% (-92%)
  - 낙찰률: 15% → 25%+ (+67%)
  - 월 입찰 건수: 5건 → 15건 (+200%)

기술 KPI:
  - 매칭 정확도 (F1): ≥ 0.80
  - API 응답 시간: < 200ms (p95)
  - 시스템 가용성: ≥ 99.5%
  - 테스트 커버리지: ≥ 80%

하드웨어 KPI:
  - 센서 데이터 수집: 1000 포인트/분
  - 이상 탐지 지연: < 30초
  - 예측 정비 정확도: ≥ 85%
  - 에너지 절감: ≥ 15%

CMNTech 성과:
  - 연간 추가 매출: ₩30억+
  - ROI: 2,500배+
  - 레퍼런스 고객 확보
```

---

## 6. 리스크 관리

```yaml
기술 리스크:
  - G2B API 합법성: 공식 API 확인 필요 → Stub 모드 유지
  - TimescaleDB 비용: Supabase 기본 PostgreSQL로 시작
  - AI 모델 정확도: 초기 단순 모델 → 점진적 고도화

비즈니스 리스크:
  - CMNTech 파일럿 실패: 주간 체크인으로 조기 대응
  - AI 바우처 탈락: 대안 자금원 확보 (엔젤 투자)

운영 리스크:
  - 데이터 보안: RLS + 암호화 + 감사 로그
  - 시스템 장애: 다중 백업 + 모니터링 알림
```

---

*마스터 로드맵 v1.0 - 2025-12-21*
*분석 기반: Part 1-5 설계 + GPT 피드백 + CMNTech 페르소나*
