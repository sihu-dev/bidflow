-- =========================================
-- BIDFLOW V2 Migration: RLS Policies
-- =========================================

-- RLS 활성화
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- bids는 공개 데이터로 RLS 비활성화

-- =========================================
-- 헬퍼 함수: 현재 테넌트 ID 조회
-- =========================================
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 헬퍼 함수: 현재 사용자가 관리자인지 확인
CREATE OR REPLACE FUNCTION is_tenant_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =========================================
-- TENANTS 정책
-- =========================================
DROP POLICY IF EXISTS "tenant_select" ON tenants;
CREATE POLICY "tenant_select" ON tenants
  FOR SELECT USING (
    id = get_current_tenant_id()
  );

DROP POLICY IF EXISTS "tenant_update" ON tenants;
CREATE POLICY "tenant_update" ON tenants
  FOR UPDATE USING (
    id = get_current_tenant_id() AND is_tenant_admin()
  );

-- =========================================
-- PROFILES 정책
-- =========================================
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    user_id = auth.uid() OR tenant_id = get_current_tenant_id()
  );

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    user_id = auth.uid() OR (tenant_id = get_current_tenant_id() AND is_tenant_admin())
  );

-- =========================================
-- PRODUCTS 정책 (테넌트 격리)
-- =========================================
DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select" ON products
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
  );

DROP POLICY IF EXISTS "products_insert" ON products;
CREATE POLICY "products_insert" ON products
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

DROP POLICY IF EXISTS "products_update" ON products;
CREATE POLICY "products_update" ON products
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

DROP POLICY IF EXISTS "products_delete" ON products;
CREATE POLICY "products_delete" ON products
  FOR DELETE USING (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

-- =========================================
-- MATCHES 정책 (테넌트 격리)
-- =========================================
DROP POLICY IF EXISTS "matches_select" ON matches;
CREATE POLICY "matches_select" ON matches
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
  );

DROP POLICY IF EXISTS "matches_insert" ON matches;
CREATE POLICY "matches_insert" ON matches
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id()
  );

DROP POLICY IF EXISTS "matches_update" ON matches;
CREATE POLICY "matches_update" ON matches
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id()
  );

-- =========================================
-- ORG_SCORES 정책 (테넌트 격리)
-- =========================================
DROP POLICY IF EXISTS "org_scores_select" ON org_scores;
CREATE POLICY "org_scores_select" ON org_scores
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
  );

DROP POLICY IF EXISTS "org_scores_insert" ON org_scores;
CREATE POLICY "org_scores_insert" ON org_scores
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id()
  );

DROP POLICY IF EXISTS "org_scores_update" ON org_scores;
CREATE POLICY "org_scores_update" ON org_scores
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id()
  );

DROP POLICY IF EXISTS "org_scores_delete" ON org_scores;
CREATE POLICY "org_scores_delete" ON org_scores
  FOR DELETE USING (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

-- =========================================
-- ALERTS 정책 (테넌트 + 사용자)
-- =========================================
DROP POLICY IF EXISTS "alerts_select" ON alerts;
CREATE POLICY "alerts_select" ON alerts
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND
    (user_id IS NULL OR user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );

DROP POLICY IF EXISTS "alerts_update" ON alerts;
CREATE POLICY "alerts_update" ON alerts
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id() AND
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- =========================================
-- AUDIT_LOGS 정책 (읽기 전용, 관리자만)
-- =========================================
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND is_tenant_admin()
  );

-- 감사 로그 삽입은 서비스 역할로만 가능
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (true);  -- service_role만 삽입 가능하도록 API에서 제어

-- =========================================
-- BIDS 정책 (공개 읽기)
-- =========================================
-- bids는 RLS 비활성화 (공개 데이터)
-- 대신 서비스 역할만 쓰기 가능하도록 API에서 제어
