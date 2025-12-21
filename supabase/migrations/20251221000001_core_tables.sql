-- =========================================
-- BIDFLOW V2 Migration: Core Tables
-- =========================================

-- 1. TENANTS (고객사)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES (사용자 프로필)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. SOURCES (데이터 소스)
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'api' CHECK (type IN ('api', 'scraper', 'stub')),
  config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 데이터 소스
INSERT INTO sources (id, name, type, config) VALUES
  ('ted', 'TED (EU)', 'api', '{"baseUrl": "https://ted.europa.eu/api/v3.0", "rateLimit": 100}'),
  ('sam_gov', 'SAM.gov (US)', 'api', '{"baseUrl": "https://api.sam.gov/opportunities/v2", "rateLimit": 600}'),
  ('g2b', '나라장터 (KR)', 'stub', '{"status": "pending_api_verification"}'),
  ('kepco', 'KEPCO', 'stub', '{"status": "planned"}'),
  ('kogas', 'KOGAS', 'stub', '{"status": "planned"}'),
  ('kwater', 'K-water', 'stub', '{"status": "planned"}')
ON CONFLICT (id) DO NOTHING;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- updated_at 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- tenants updated_at 트리거
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
