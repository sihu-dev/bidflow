-- =========================================
-- BIDFLOW V2 Migration: Products Table
-- =========================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model_number TEXT NOT NULL,

  -- 175점 매칭용 키워드
  keywords JSONB NOT NULL DEFAULT '{
    "primary": [],
    "secondary": [],
    "specs": [],
    "exclude": []
  }',

  -- 제품 스펙
  specs JSONB DEFAULT '{}',

  -- 상태
  is_active BOOLEAN DEFAULT true,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, model_number)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_keywords ON products USING GIN(keywords);

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
