-- =========================================
-- BIDFLOW V2 Migration: Audit Logs Table
-- =========================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- 액션 정보
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,

  -- 변경 내용
  old_value JSONB,
  new_value JSONB,

  -- 요청 정보
  ip_address INET,
  user_agent TEXT,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- 복합 인덱스 (테넌트별 최근 로그)
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);

-- 파티셔닝 고려 (대용량 시)
COMMENT ON TABLE audit_logs IS 'Audit trail for all data changes. Consider partitioning by created_at for large datasets.';
