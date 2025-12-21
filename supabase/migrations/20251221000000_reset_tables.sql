-- =========================================
-- BIDFLOW V2 Migration: Reset Existing Tables
-- WARNING: This will drop all existing data!
-- =========================================

-- Drop existing tables in reverse order (dependencies first)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS org_scores CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS get_current_tenant_id() CASCADE;
DROP FUNCTION IF EXISTS is_tenant_admin() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Ready for fresh V2 schema
