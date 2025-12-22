# BIDFLOW 마이그레이션 가이드

## 벡터 검색 마이그레이션 (20251222000001)

### 적용 방법

#### 옵션 1: Supabase CLI (권장)
```bash
supabase db push
```

#### 옵션 2: Supabase Dashboard
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. SQL Editor 열기
3. `20251222000001_add_vector_search.sql` 내용 복사/붙여넣기
4. Run 실행

#### 옵션 3: 스크립트 실행
```bash
node scripts/migrate-vector.js
```

### 마이그레이션 내용

| 항목 | 설명 |
|------|------|
| `pgvector` 확장 | 벡터 검색 지원 |
| `bids.embedding` | 입찰 임베딩 (1536 dim) |
| `products.embedding` | 제품 임베딩 (1536 dim) |
| `match_bids()` | 입찰 시맨틱 검색 함수 |
| `match_products()` | 제품 시맨틱 검색 함수 |
| `semantic_match_bid_to_products()` | 입찰-제품 매칭 함수 |
| `embedding_stats` 뷰 | 임베딩 통계 조회 |

### 마이그레이션 후 작업

```bash
# 1. 제품 임베딩 생성
curl -X POST http://localhost:3010/api/v1/match \
  -H "Content-Type: application/json" \
  -d '{"action": "embed-products"}'

# 2. 통계 확인
curl http://localhost:3010/api/v1/match
```

### 롤백

```sql
-- 함수 삭제
DROP FUNCTION IF EXISTS match_bids;
DROP FUNCTION IF EXISTS match_products;
DROP FUNCTION IF EXISTS semantic_match_bid_to_products;

-- 뷰 삭제
DROP VIEW IF EXISTS embedding_stats;

-- 인덱스 삭제
DROP INDEX IF EXISTS idx_bids_embedding;
DROP INDEX IF EXISTS idx_products_embedding;

-- 컬럼 삭제
ALTER TABLE bids DROP COLUMN IF EXISTS embedding;
ALTER TABLE products DROP COLUMN IF EXISTS embedding;
```
