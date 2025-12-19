-- ============================================================================
-- BIDFLOW 데이터베이스 스키마 및 인덱스 전략
-- 버전: 1.0.0
-- 생성일: 2025-12-19
-- ============================================================================

-- ============================================================================
-- 1. 기본 테이블 생성
-- ============================================================================

-- 프로필 테이블 (Supabase Auth 연동)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  company_name TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 입찰 공고 테이블
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN (
    'narajangto', 'kepco', 'kwater', 'koroad', 'lh', 'korail',
    'kogas', 'khnp', 'ted', 'ungm', 'sam', 'kotra', 'custom', 'manual'
  )),
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  estimated_amount NUMERIC(20, 0),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'reviewing', 'preparing', 'submitted', 'won', 'lost', 'cancelled'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  type TEXT NOT NULL CHECK (type IN ('product', 'service', 'construction', 'facility')),
  keywords TEXT[] DEFAULT '{}',
  url TEXT,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 방지 (소스 + 외부ID)
  CONSTRAINT unique_source_external_id UNIQUE (source, external_id)
);

-- 파이프라인 테이블
CREATE TABLE IF NOT EXISTS bid_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN (
    'new', 'reviewing', 'preparing', 'submitted', 'won', 'lost', 'cancelled'
  )),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  due_date TIMESTAMPTZ,
  match_score NUMERIC(5, 4) DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 1),
  matched_products JSONB DEFAULT '[]',
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 첨부 문서 테이블
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'specification', 'proposal', 'contract', 'attachment', 'other'
  )),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 회사 자산 테이블 (제품 카탈로그, 실적 등)
CREATE TABLE IF NOT EXISTS company_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'product', 'reference', 'certification', 'template'
  )),
  name TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 스프레드시트 테이블
CREATE TABLE IF NOT EXISTS sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  columns JSONB NOT NULL DEFAULT '[]',
  default_view TEXT DEFAULT 'spreadsheet' CHECK (default_view IN (
    'spreadsheet', 'kanban', 'calendar'
  )),
  filters JSONB DEFAULT '[]',
  sorts JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 셀 데이터 테이블
CREATE TABLE IF NOT EXISTS sheet_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id UUID NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  col_index INTEGER NOT NULL,
  value JSONB,
  formula TEXT,
  ai_status TEXT DEFAULT 'idle' CHECK (ai_status IN (
    'idle', 'computing', 'complete', 'error'
  )),
  ai_result JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 셀 위치 유니크
  CONSTRAINT unique_cell_position UNIQUE (sheet_id, row_index, col_index)
);

-- 크롤링 작업 테이블
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'completed', 'failed'
  )),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  items_found INTEGER DEFAULT 0,
  items_processed INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 설정 테이블
CREATE TABLE IF NOT EXISTS notification_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'kakao', 'slack', 'webhook')),
  enabled BOOLEAN DEFAULT true,
  types TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_channel UNIQUE (user_id, channel)
);

-- ============================================================================
-- 2. 인덱스 전략 (성능 최적화)
-- ============================================================================

-- [bids] 마감일 + 상태 복합 인덱스 (대시보드 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_bids_deadline_status
  ON bids (deadline, status)
  WHERE status NOT IN ('won', 'lost', 'cancelled');

-- [bids] 상태별 조회
CREATE INDEX IF NOT EXISTS idx_bids_status
  ON bids (status);

-- [bids] 소스별 조회
CREATE INDEX IF NOT EXISTS idx_bids_source
  ON bids (source);

-- [bids] 우선순위별 조회
CREATE INDEX IF NOT EXISTS idx_bids_priority
  ON bids (priority)
  WHERE priority = 'high';

-- [bids] 제목 풀텍스트 검색
CREATE INDEX IF NOT EXISTS idx_bids_title_search
  ON bids USING gin (to_tsvector('korean', title));

-- [bids] 기관명 풀텍스트 검색
CREATE INDEX IF NOT EXISTS idx_bids_organization_search
  ON bids USING gin (to_tsvector('korean', organization));

-- [bids] 키워드 배열 검색
CREATE INDEX IF NOT EXISTS idx_bids_keywords
  ON bids USING gin (keywords);

-- [bids] 생성일 (최신순 조회)
CREATE INDEX IF NOT EXISTS idx_bids_created_at
  ON bids (created_at DESC);

-- [bids] 금액 범위 조회
CREATE INDEX IF NOT EXISTS idx_bids_estimated_amount
  ON bids (estimated_amount)
  WHERE estimated_amount IS NOT NULL;

-- [bid_pipeline] 담당자별 조회
CREATE INDEX IF NOT EXISTS idx_pipeline_assigned_to
  ON bid_pipeline (assigned_to)
  WHERE assigned_to IS NOT NULL;

-- [bid_pipeline] 스테이지별 조회
CREATE INDEX IF NOT EXISTS idx_pipeline_stage
  ON bid_pipeline (stage);

-- [bid_pipeline] 매칭 점수 (높은 점수 우선)
CREATE INDEX IF NOT EXISTS idx_pipeline_match_score
  ON bid_pipeline (match_score DESC)
  WHERE match_score > 0;

-- [documents] 입찰별 문서 조회
CREATE INDEX IF NOT EXISTS idx_documents_bid_id
  ON documents (bid_id);

-- [company_assets] 유형별 활성 자산
CREATE INDEX IF NOT EXISTS idx_assets_type_active
  ON company_assets (asset_type)
  WHERE is_active = true;

-- [company_assets] 키워드 검색
CREATE INDEX IF NOT EXISTS idx_assets_keywords
  ON company_assets USING gin (keywords);

-- [sheet_cells] 시트별 셀 조회
CREATE INDEX IF NOT EXISTS idx_cells_sheet_id
  ON sheet_cells (sheet_id);

-- [sheet_cells] AI 처리 중인 셀
CREATE INDEX IF NOT EXISTS idx_cells_ai_status
  ON sheet_cells (ai_status)
  WHERE ai_status = 'computing';

-- [crawl_jobs] 소스별 최근 작업
CREATE INDEX IF NOT EXISTS idx_crawl_source_created
  ON crawl_jobs (source, created_at DESC);

-- ============================================================================
-- 3. Row Level Security (RLS) 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheet_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_configs ENABLE ROW LEVEL SECURITY;

-- profiles: 본인만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- bids: 모든 인증된 사용자 조회 가능, admin만 생성/수정
CREATE POLICY "Authenticated users can view bids"
  ON bids FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage bids"
  ON bids FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- sheets: 소유자만 접근 가능
CREATE POLICY "Users can access own sheets"
  ON sheets FOR ALL
  USING (owner_id = auth.uid());

-- sheet_cells: 시트 소유자만 접근 가능
CREATE POLICY "Users can access cells of own sheets"
  ON sheet_cells FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sheets
      WHERE id = sheet_cells.sheet_id AND owner_id = auth.uid()
    )
  );

-- notification_configs: 본인 설정만 접근
CREATE POLICY "Users can manage own notifications"
  ON notification_configs FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- 4. 트리거 (자동 updated_at 갱신)
-- ============================================================================

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_pipeline_updated_at
  BEFORE UPDATE ON bid_pipeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_assets_updated_at
  BEFORE UPDATE ON company_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_sheets_updated_at
  BEFORE UPDATE ON sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_cells_updated_at
  BEFORE UPDATE ON sheet_cells
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON notification_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 5. 초기 데이터 (제품 카탈로그)
-- ============================================================================

INSERT INTO company_assets (asset_type, name, description, keywords, data) VALUES
(
  'product',
  'UR-1000PLUS',
  'UR-1000PLUS® 다회선 초음파 유량계 (만관형)',
  ARRAY['초음파유량계', '다회선', '만관', '상수도', '취수장', '정수장'],
  '{
    "pipeSize": {"min": 100, "max": 4000},
    "accuracy": "±0.5%",
    "flowVelocity": "-10~+10m/s",
    "turndownRatio": "100:1",
    "applications": ["상하수도", "취수장", "정수장", "관개수로"],
    "sellingPoints": [
      "±0.5% 고정밀 측정 (유량계수 불필요)",
      "25년간 1.5만대 이상 설치 실적",
      "곡관부/밸브 후류에서도 정확한 측정"
    ],
    "priority": 1
  }'::jsonb
),
(
  'product',
  'MF-1000C',
  'MF-1000C 일체형 전자유량계',
  ARRAY['전자유량계', '전자식', '상거래', '공업용수', '계량기'],
  '{
    "pipeSize": {"min": 15, "max": 2000},
    "accuracy": "±0.5%",
    "pressure": "1.6MPa",
    "outputs": ["4-20mA", "Pulse", "RS485", "HART"],
    "applications": ["상하수도", "공업용수", "농업용수"],
    "priority": 2
  }'::jsonb
),
(
  'product',
  'UR-1010PLUS',
  'UR-1010PLUS® 비만관형 초음파 유량계',
  ARRAY['비만관', '하수', '우수', '복류수', '하수관로'],
  '{
    "pipeSize": {"min": 200, "max": 3000},
    "accuracy": "±1.0~±2.0%",
    "applications": ["하수관로", "우수관로", "복류수"],
    "priority": 1
  }'::jsonb
),
(
  'product',
  'SL-3000PLUS',
  'SL-3000PLUS 개수로 유량계',
  ARRAY['개수로', '하천', '방류', '농업용수', '수로'],
  '{
    "channelWidth": "unlimited",
    "accuracy": "±3~±5%",
    "applications": ["하천", "개수로", "농업용수로", "방류구"],
    "priority": 2
  }'::jsonb
),
(
  'product',
  'EnerRay',
  'EnerRay 초음파 열량계',
  ARRAY['열량계', '에너지', '난방', '냉난방', '지역난방'],
  '{
    "pipeSize": {"min": 15, "max": 300},
    "accuracy": "Class 2 (EN 1434)",
    "applications": ["지역난방", "냉난방", "공장 에너지"],
    "priority": 3
  }'::jsonb
);

-- ============================================================================
-- 완료
-- ============================================================================

COMMENT ON TABLE bids IS '입찰 공고 마스터 테이블';
COMMENT ON TABLE bid_pipeline IS '입찰 파이프라인 (진행 상태 관리)';
COMMENT ON TABLE documents IS '입찰 관련 문서';
COMMENT ON TABLE company_assets IS '회사 자산 (제품, 실적, 인증 등)';
COMMENT ON TABLE sheets IS '스프레드시트 정의';
COMMENT ON TABLE sheet_cells IS '스프레드시트 셀 데이터';
COMMENT ON TABLE crawl_jobs IS '크롤링 작업 로그';
