-- =========================================
-- BIDFLOW V2 Migration: Bids Table
-- =========================================

CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL REFERENCES sources(id),
  source_notice_id TEXT NOT NULL,

  -- 기본 정보
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'KR',
  deadline TIMESTAMPTZ,

  -- 금액
  estimated_price BIGINT,
  currency TEXT DEFAULT 'KRW',

  -- 상세
  description TEXT,
  category TEXT,
  region TEXT,

  -- 원본 데이터
  raw_data JSONB,
  content_hash TEXT NOT NULL,

  -- 상태
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'matched', 'expired')),

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 방지
  UNIQUE(source_id, source_notice_id)
);

-- Full-Text Search 인덱스
CREATE INDEX IF NOT EXISTS idx_bids_fts ON bids
  USING GIN(to_tsvector('simple', title || ' ' || COALESCE(description, '')));

-- 기본 인덱스
CREATE INDEX IF NOT EXISTS idx_bids_deadline ON bids(deadline);
CREATE INDEX IF NOT EXISTS idx_bids_source ON bids(source_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_country ON bids(country);
CREATE INDEX IF NOT EXISTS idx_bids_created ON bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_content_hash ON bids(content_hash);

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_bids_updated_at ON bids;
CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
