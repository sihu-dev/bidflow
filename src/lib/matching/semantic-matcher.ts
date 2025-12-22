/**
 * @module matching/semantic-matcher
 * @description 시맨틱 매칭 서비스 - 벡터 검색 기반 입찰-제품 매칭
 *
 * 기술 스택:
 * - OpenAI text-embedding-3-small (1536 dim)
 * - Supabase pgvector
 * - 하이브리드 매칭 (규칙 + 점수 + 시맨틱)
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ============================================================================
// 클라이언트 초기화
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

// ============================================================================
// 타입 정의
// ============================================================================

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
  model: string;
}

export interface SemanticMatch {
  productId: string;
  productName: string;
  modelNumber: string;
  similarity: number;
  combinedScore: number;
}

export interface HybridMatchResult {
  bidId: string;
  matches: Array<{
    productId: string;
    productName: string;
    modelNumber: string;
    ruleScore: number;      // 규칙 기반 점수 (0-100)
    semanticScore: number;  // 시맨틱 유사도 (0-1)
    combinedScore: number;  // 최종 점수 (0-100)
    confidence: 'high' | 'medium' | 'low' | 'none';
    reasons: string[];
  }>;
  recommendation: 'BID' | 'REVIEW' | 'SKIP';
}

// ============================================================================
// 임베딩 생성
// ============================================================================

/**
 * 텍스트 임베딩 생성
 * @param text - 임베딩할 텍스트
 * @param model - 임베딩 모델 (기본: text-embedding-3-small)
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<EmbeddingResult> {
  const client = getOpenAI();

  // 텍스트 정규화 (최대 8000자)
  const normalizedText = text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);

  const response = await client.embeddings.create({
    model,
    input: normalizedText,
  });

  return {
    embedding: response.data[0].embedding,
    tokens: response.usage.total_tokens,
    model,
  };
}

/**
 * 배치 임베딩 생성 (비용 효율)
 * @param texts - 임베딩할 텍스트 배열
 */
export async function generateBatchEmbeddings(
  texts: string[],
  model: string = 'text-embedding-3-small'
): Promise<EmbeddingResult[]> {
  const client = getOpenAI();

  const normalizedTexts = texts.map((text) =>
    text.replace(/\s+/g, ' ').trim().slice(0, 8000)
  );

  const response = await client.embeddings.create({
    model,
    input: normalizedTexts,
  });

  return response.data.map((item) => ({
    embedding: item.embedding,
    tokens: Math.floor(response.usage.total_tokens / texts.length),
    model,
  }));
}

// ============================================================================
// 임베딩 저장
// ============================================================================

/**
 * 입찰 공고 임베딩 저장
 */
export async function embedBid(bidId: string): Promise<void> {
  // 입찰 공고 조회
  const { data: bid, error: fetchError } = await supabase
    .from('bids')
    .select('id, title, organization, description')
    .eq('id', bidId)
    .single();

  if (fetchError || !bid) {
    throw new Error(`입찰 공고를 찾을 수 없습니다: ${bidId}`);
  }

  // 임베딩 텍스트 구성
  const text = [
    bid.title,
    bid.organization,
    bid.description,
  ].filter(Boolean).join(' ');

  // 임베딩 생성
  const { embedding } = await generateEmbedding(text);

  // 저장
  const { error: updateError } = await supabase
    .from('bids')
    .update({ embedding: JSON.stringify(embedding) })
    .eq('id', bidId);

  if (updateError) {
    throw new Error(`임베딩 저장 실패: ${updateError.message}`);
  }
}

/**
 * 제품 임베딩 저장
 */
export async function embedProduct(productId: string): Promise<void> {
  // 제품 조회
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('id, name, model_number, keywords, specs')
    .eq('id', productId)
    .single();

  if (fetchError || !product) {
    throw new Error(`제품을 찾을 수 없습니다: ${productId}`);
  }

  // 키워드 추출
  const keywords = product.keywords as {
    primary?: string[];
    secondary?: string[];
    specs?: string[];
  };

  // 임베딩 텍스트 구성
  const text = [
    product.name,
    product.model_number,
    ...(keywords.primary || []),
    ...(keywords.secondary || []),
    ...(keywords.specs || []),
    JSON.stringify(product.specs),
  ].filter(Boolean).join(' ');

  // 임베딩 생성
  const { embedding } = await generateEmbedding(text);

  // 저장
  const { error: updateError } = await supabase
    .from('products')
    .update({ embedding: JSON.stringify(embedding) })
    .eq('id', productId);

  if (updateError) {
    throw new Error(`임베딩 저장 실패: ${updateError.message}`);
  }
}

/**
 * 모든 제품 임베딩 갱신
 */
export async function embedAllProducts(tenantId?: string): Promise<number> {
  let query = supabase
    .from('products')
    .select('id')
    .is('embedding', null)
    .eq('is_active', true);

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data: products, error } = await query;

  if (error) {
    throw new Error(`제품 조회 실패: ${error.message}`);
  }

  let embedded = 0;
  for (const product of products || []) {
    try {
      await embedProduct(product.id);
      embedded++;
    } catch (e) {
      console.error(`[SemanticMatcher] 제품 임베딩 실패: ${product.id}`, e);
    }
  }

  return embedded;
}

// ============================================================================
// 시맨틱 검색
// ============================================================================

/**
 * 시맨틱 입찰 검색
 * @param query - 검색 쿼리
 * @param options - 검색 옵션
 */
export async function searchBids(
  query: string,
  options: {
    threshold?: number;
    limit?: number;
    country?: string;
  } = {}
): Promise<Array<{
  id: string;
  title: string;
  organization: string;
  similarity: number;
}>> {
  const { threshold = 0.7, limit = 10, country } = options;

  // 쿼리 임베딩 생성
  const { embedding } = await generateEmbedding(query);

  // RPC 호출
  const { data, error } = await supabase.rpc('match_bids', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    throw new Error(`시맨틱 검색 실패: ${error.message}`);
  }

  // 국가 필터링 (DB 레벨에서 못한 경우)
  let results = data || [];
  if (country) {
    results = results.filter((r: { country?: string }) => r.country === country);
  }

  return results;
}

/**
 * 시맨틱 제품 검색
 */
export async function searchProducts(
  query: string,
  options: {
    tenantId?: string;
    threshold?: number;
    limit?: number;
  } = {}
): Promise<Array<{
  id: string;
  name: string;
  modelNumber: string;
  similarity: number;
}>> {
  const { tenantId, threshold = 0.7, limit = 5 } = options;

  // 쿼리 임베딩 생성
  const { embedding } = await generateEmbedding(query);

  // RPC 호출
  const { data, error } = await supabase.rpc('match_products', {
    query_embedding: embedding,
    tenant_uuid: tenantId || null,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    throw new Error(`시맨틱 검색 실패: ${error.message}`);
  }

  return (data || []).map((p: {
    id: string;
    name: string;
    model_number: string;
    similarity: number;
  }) => ({
    id: p.id,
    name: p.name,
    modelNumber: p.model_number,
    similarity: p.similarity,
  }));
}

// ============================================================================
// 하이브리드 매칭
// ============================================================================

/**
 * 하이브리드 매칭 (규칙 + 점수 + 시맨틱)
 *
 * 가중치:
 * - 규칙 기반 점수: 60%
 * - 시맨틱 유사도: 40%
 */
export async function hybridMatch(
  bidId: string,
  options: {
    tenantId?: string;
    ruleWeight?: number;
    semanticWeight?: number;
    threshold?: number;
  } = {}
): Promise<HybridMatchResult> {
  const {
    tenantId,
    ruleWeight = 0.6,
    semanticWeight = 0.4,
    threshold = 0.5,
  } = options;

  // 1. 입찰 공고 조회
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .select('id, title, organization, description, embedding')
    .eq('id', bidId)
    .single();

  if (bidError || !bid) {
    throw new Error(`입찰 공고를 찾을 수 없습니다: ${bidId}`);
  }

  // 2. 임베딩이 없으면 생성
  let bidEmbedding = bid.embedding;
  if (!bidEmbedding) {
    await embedBid(bidId);
    const { data: refreshed } = await supabase
      .from('bids')
      .select('embedding')
      .eq('id', bidId)
      .single();
    bidEmbedding = refreshed?.embedding;
  }

  // 3. 시맨틱 매칭 (DB 함수 호출)
  const { data: semanticMatches, error: matchError } = await supabase.rpc(
    'semantic_match_bid_to_products',
    {
      bid_uuid: bidId,
      tenant_uuid: tenantId || null,
      match_threshold: threshold,
      match_count: 10,
    }
  );

  if (matchError) {
    console.error('[HybridMatch] 시맨틱 매칭 오류:', matchError);
  }

  // 4. 규칙 기반 매칭 (enhanced-matcher 연동)
  // TODO: enhanced-matcher와 통합

  // 5. 점수 결합
  const matches = (semanticMatches || []).map((match: {
    product_id: string;
    product_name: string;
    model_number: string;
    similarity: number;
  }) => {
    const semanticScore = match.similarity;
    const ruleScore = 50; // TODO: enhanced-matcher에서 가져오기

    const combinedScore =
      ruleScore * ruleWeight + semanticScore * 100 * semanticWeight;

    // 신뢰도 결정
    let confidence: 'high' | 'medium' | 'low' | 'none';
    if (combinedScore >= 80) confidence = 'high';
    else if (combinedScore >= 60) confidence = 'medium';
    else if (combinedScore >= 40) confidence = 'low';
    else confidence = 'none';

    return {
      productId: match.product_id,
      productName: match.product_name,
      modelNumber: match.model_number,
      ruleScore,
      semanticScore,
      combinedScore: Math.round(combinedScore),
      confidence,
      reasons: [
        `시맨틱 유사도: ${Math.round(semanticScore * 100)}%`,
      ],
    };
  });

  // 6. 추천 결정
  let recommendation: 'BID' | 'REVIEW' | 'SKIP';
  const bestMatch = matches[0];
  if (bestMatch && bestMatch.combinedScore >= 70) {
    recommendation = 'BID';
  } else if (bestMatch && bestMatch.combinedScore >= 50) {
    recommendation = 'REVIEW';
  } else {
    recommendation = 'SKIP';
  }

  return {
    bidId,
    matches,
    recommendation,
  };
}

// ============================================================================
// 유틸리티
// ============================================================================

/**
 * 임베딩 통계 조회
 */
export async function getEmbeddingStats(): Promise<{
  bids: { total: number; embedded: number; percentage: number };
  products: { total: number; embedded: number; percentage: number };
}> {
  const { data, error } = await supabase
    .from('embedding_stats')
    .select('*');

  if (error) {
    throw new Error(`통계 조회 실패: ${error.message}`);
  }

  const stats = {
    bids: { total: 0, embedded: 0, percentage: 0 },
    products: { total: 0, embedded: 0, percentage: 0 },
  };

  for (const row of data || []) {
    if (row.table_name === 'bids') {
      stats.bids = {
        total: row.total_rows,
        embedded: row.embedded_rows,
        percentage: row.embedded_pct,
      };
    } else if (row.table_name === 'products') {
      stats.products = {
        total: row.total_rows,
        embedded: row.embedded_rows,
        percentage: row.embedded_pct,
      };
    }
  }

  return stats;
}

/**
 * 코사인 유사도 계산 (클라이언트 사이드)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('벡터 차원이 일치하지 않습니다');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
