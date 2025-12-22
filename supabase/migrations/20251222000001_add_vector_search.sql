-- =========================================
-- BIDFLOW V2 Migration: Vector Search Support
-- pgvector 확장 및 임베딩 컬럼 추가
-- =========================================

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================================
-- 1. bids 테이블에 임베딩 컬럼 추가
-- =========================================

ALTER TABLE bids
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 임베딩 인덱스 (IVFFlat - 빠른 근사 검색)
CREATE INDEX IF NOT EXISTS idx_bids_embedding
ON bids USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- =========================================
-- 2. products 테이블에 임베딩 컬럼 추가
-- =========================================

ALTER TABLE products
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 임베딩 인덱스
CREATE INDEX IF NOT EXISTS idx_products_embedding
ON products USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- =========================================
-- 3. 시맨틱 검색 함수
-- =========================================

-- 입찰 공고 유사도 검색
CREATE OR REPLACE FUNCTION match_bids(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  organization text,
  description text,
  deadline timestamptz,
  estimated_price bigint,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.title,
    b.organization,
    b.description,
    b.deadline,
    b.estimated_price,
    1 - (b.embedding <=> query_embedding) AS similarity
  FROM bids b
  WHERE
    b.embedding IS NOT NULL
    AND b.status != 'expired'
    AND 1 - (b.embedding <=> query_embedding) > match_threshold
  ORDER BY b.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 제품 유사도 검색
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(1536),
  tenant_uuid uuid DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  model_number text,
  keywords jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.model_number,
    p.keywords,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE
    p.embedding IS NOT NULL
    AND p.is_active = true
    AND (tenant_uuid IS NULL OR p.tenant_id = tenant_uuid)
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 입찰-제품 시맨틱 매칭
CREATE OR REPLACE FUNCTION semantic_match_bid_to_products(
  bid_uuid uuid,
  tenant_uuid uuid DEFAULT NULL,
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  model_number text,
  similarity float,
  combined_score float
)
LANGUAGE plpgsql
AS $$
DECLARE
  bid_embedding vector(1536);
BEGIN
  -- 입찰 임베딩 조회
  SELECT embedding INTO bid_embedding
  FROM bids
  WHERE id = bid_uuid;

  IF bid_embedding IS NULL THEN
    RAISE EXCEPTION 'Bid embedding not found for id: %', bid_uuid;
  END IF;

  RETURN QUERY
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.model_number,
    1 - (p.embedding <=> bid_embedding) AS similarity,
    -- 키워드 매칭 보너스 (향후 확장)
    (1 - (p.embedding <=> bid_embedding)) * 1.0 AS combined_score
  FROM products p
  WHERE
    p.embedding IS NOT NULL
    AND p.is_active = true
    AND (tenant_uuid IS NULL OR p.tenant_id = tenant_uuid)
    AND 1 - (p.embedding <=> bid_embedding) > match_threshold
  ORDER BY p.embedding <=> bid_embedding
  LIMIT match_count;
END;
$$;

-- =========================================
-- 4. 임베딩 통계 뷰
-- =========================================

CREATE OR REPLACE VIEW embedding_stats AS
SELECT
  'bids' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(embedding) AS embedded_rows,
  ROUND(COUNT(embedding)::numeric / NULLIF(COUNT(*)::numeric, 0) * 100, 2) AS embedded_pct
FROM bids
UNION ALL
SELECT
  'products' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(embedding) AS embedded_rows,
  ROUND(COUNT(embedding)::numeric / NULLIF(COUNT(*)::numeric, 0) * 100, 2) AS embedded_pct
FROM products;

-- =========================================
-- 5. 코멘트 추가
-- =========================================

COMMENT ON COLUMN bids.embedding IS 'OpenAI text-embedding-3-small 1536 dim vector';
COMMENT ON COLUMN products.embedding IS 'OpenAI text-embedding-3-small 1536 dim vector';
COMMENT ON FUNCTION match_bids IS '입찰 공고 시맨틱 검색 - 코사인 유사도 기반';
COMMENT ON FUNCTION match_products IS '제품 시맨틱 검색 - 코사인 유사도 기반';
COMMENT ON FUNCTION semantic_match_bid_to_products IS '입찰-제품 시맨틱 매칭';
