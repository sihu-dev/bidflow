-- =========================================
-- BIDFLOW V2 Migration: Matches Table (175점 매칭)
-- =========================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- 175점 점수 체계
  total_score DECIMAL(5,2) NOT NULL,
  keyword_score DECIMAL(5,2) DEFAULT 0,  -- 0-100
  spec_score DECIMAL(5,2) DEFAULT 0,     -- 0-25
  org_score DECIMAL(5,2) DEFAULT 0,      -- 0-50

  -- 액션 결정 (BID: 120+, REVIEW: 70-119, SKIP: <70)
  action TEXT NOT NULL CHECK (action IN ('BID', 'REVIEW', 'SKIP')),
  match_details JSONB DEFAULT '{}',

  -- 사용자 피드백
  user_action TEXT CHECK (user_action IN ('BID', 'REVIEW', 'SKIP')),
  actioned_by UUID REFERENCES profiles(id),
  actioned_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 방지
  UNIQUE(tenant_id, bid_id, product_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_matches_tenant ON matches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_matches_bid ON matches(bid_id);
CREATE INDEX IF NOT EXISTS idx_matches_product ON matches(product_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_action ON matches(action);
CREATE INDEX IF NOT EXISTS idx_matches_user_action ON matches(user_action);
CREATE INDEX IF NOT EXISTS idx_matches_created ON matches(created_at DESC);

-- 복합 인덱스 (대시보드 쿼리용)
CREATE INDEX IF NOT EXISTS idx_matches_tenant_action ON matches(tenant_id, action);
CREATE INDEX IF NOT EXISTS idx_matches_tenant_score ON matches(tenant_id, total_score DESC);
