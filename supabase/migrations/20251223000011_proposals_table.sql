-- =========================================
-- BIDFLOW V2 Migration: Proposals Table (Global Tender Proposals)
-- =========================================

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Proposal metadata
  language TEXT NOT NULL CHECK (language IN ('en', 'de', 'fr', 'ko')),
  format TEXT NOT NULL CHECK (format IN ('technical', 'price', 'combined')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),

  -- Proposal content (JSONB for structured data)
  sections JSONB NOT NULL DEFAULT '[]',
  executive_summary TEXT NOT NULL,
  technical_approach TEXT,
  pricing TEXT,
  timeline TEXT,

  -- AI generation metadata
  tokens_used JSONB DEFAULT '{"input": 0, "output": 0}',
  cost_usd DECIMAL(10,6) DEFAULT 0,
  effort TEXT CHECK (effort IN ('low', 'medium', 'high')),
  model TEXT DEFAULT 'claude-opus-4-5-20251101',

  -- User tracking
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,

  -- Timestamps
  generated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Export tracking
  exported_at TIMESTAMPTZ,
  export_format TEXT CHECK (export_format IN ('markdown', 'html', 'pdf')),

  -- Unique constraint: one proposal per bid-product-language-format combination
  UNIQUE(tenant_id, bid_id, product_id, language, format)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposals_tenant ON proposals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_proposals_bid ON proposals(bid_id);
CREATE INDEX IF NOT EXISTS idx_proposals_product ON proposals(product_id);
CREATE INDEX IF NOT EXISTS idx_proposals_language ON proposals(language);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_generated ON proposals(generated_at DESC);

-- Composite indexes (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_proposals_tenant_status ON proposals(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_proposals_tenant_language ON proposals(tenant_id, language);
CREATE INDEX IF NOT EXISTS idx_proposals_bid_status ON proposals(bid_id, status);

-- Full text search on proposal content
CREATE INDEX IF NOT EXISTS idx_proposals_summary_search ON proposals USING GIN(to_tsvector('simple', executive_summary));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();

-- =========================================
-- RLS Policies for Proposals
-- =========================================

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Policy 1: Select - Users can view proposals from their tenant
CREATE POLICY proposals_select_policy ON proposals
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy 2: Insert - Users can create proposals for their tenant
CREATE POLICY proposals_insert_policy ON proposals
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy 3: Update - Users can update their own drafts
CREATE POLICY proposals_update_policy ON proposals
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    AND (status = 'draft' OR created_by = auth.uid())
  );

-- Policy 4: Delete - Only admins can delete proposals
CREATE POLICY proposals_delete_policy ON proposals
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND tenant_id = proposals.tenant_id
      AND role = 'admin'
    )
  );

-- =========================================
-- Comments
-- =========================================

COMMENT ON TABLE proposals IS 'AI-generated proposals for global tenders (multi-language support)';
COMMENT ON COLUMN proposals.language IS 'Proposal language: en (English), de (German), fr (French), ko (Korean)';
COMMENT ON COLUMN proposals.format IS 'Proposal type: technical, price, or combined';
COMMENT ON COLUMN proposals.sections IS 'JSONB array of proposal sections with title, content, order';
COMMENT ON COLUMN proposals.tokens_used IS 'Claude API token usage: {input: number, output: number}';
COMMENT ON COLUMN proposals.cost_usd IS 'Total cost in USD for AI generation';
COMMENT ON COLUMN proposals.effort IS 'Claude effort parameter: low, medium, or high';
