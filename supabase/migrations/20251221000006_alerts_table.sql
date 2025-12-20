-- =========================================
-- BIDFLOW V2 Migration: Alerts Table
-- =========================================

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,

  -- 알림 타입
  type TEXT NOT NULL CHECK (type IN (
    'new_match',      -- 새로운 매칭
    'deadline',       -- 마감 임박
    'competitor',     -- 경쟁사 동향
    'system',         -- 시스템 알림
    'score_update'    -- 점수 변경
  )),

  -- 채널
  channel TEXT NOT NULL CHECK (channel IN ('email', 'slack', 'in_app', 'webhook')),

  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),

  -- 내용
  title TEXT,
  message JSONB,

  -- 발송 정보
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);

-- 복합 인덱스 (미읽은 알림 조회)
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(tenant_id, user_id, status)
  WHERE status IN ('pending', 'sent');
