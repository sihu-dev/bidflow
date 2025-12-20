-- =========================================
-- BIDFLOW V2 Migration: Org Scores Table (기관 점수 50점)
-- =========================================

CREATE TABLE IF NOT EXISTS org_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_id TEXT,  -- 외부 기관 ID

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
  org_type TEXT DEFAULT 'public' CHECK (org_type IN ('public', 'private', 'mixed')),
  scale_score DECIMAL(5,2) DEFAULT 0,

  -- 총점 (자동 계산 - 최대 50점)
  total_score DECIMAL(5,2) GENERATED ALWAYS AS (
    LEAST(history_score + preference_score + scale_score, 50)
  ) STORED,

  -- 활동
  last_activity_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 방지
  UNIQUE(tenant_id, organization_name)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_org_scores_tenant ON org_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_scores_org_name ON org_scores(organization_name);
CREATE INDEX IF NOT EXISTS idx_org_scores_preferred ON org_scores(tenant_id, is_preferred);
CREATE INDEX IF NOT EXISTS idx_org_scores_total ON org_scores(total_score DESC);

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_org_scores_updated_at ON org_scores;
CREATE TRIGGER update_org_scores_updated_at
  BEFORE UPDATE ON org_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
