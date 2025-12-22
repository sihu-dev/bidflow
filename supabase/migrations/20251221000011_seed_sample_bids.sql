-- =========================================
-- BIDFLOW V2 Migration: Sample Bids Seed Data
-- =========================================
-- Demo/Test용 샘플 입찰 공고 데이터

-- 샘플 입찰 공고 6건 (CMNTech 제품 매칭용)
INSERT INTO bids (
  source_id, source_notice_id, title, organization, country, deadline,
  estimated_price, currency, description, category, region, raw_data, content_hash, status
) VALUES

-- 1. 서울시 상수도 초음파유량계 (UR-1000PLUS 매칭)
(
  'g2b',
  'DEMO-2025-001',
  '[긴급] 서울시 상수도본부 초음파유량계 설치 및 유지관리 (DN300-1000, 25대)',
  '서울시 상수도사업본부',
  'KR',
  (CURRENT_DATE + INTERVAL '14 days')::TIMESTAMPTZ,
  450000000,
  'KRW',
  '정수장 및 배수지 대구경 초음파유량계 설치 공사. DN300~1000 규격 25대 납품 및 설치. 만관형 다회선 초음파유량계 우선.',
  '유량계측',
  '서울',
  '{"priority": "high", "type": "installation", "contact": "02-3146-xxxx"}',
  MD5('seoul-water-demo-001'),
  'new'
),

-- 2. K-water 전자유량계 (MF-1000C 매칭)
(
  'kwater',
  'DEMO-2025-002',
  'K-water 정수장 전자유량계 교체 공사 (DN50-150, 일체형)',
  'K-water 한국수자원공사',
  'KR',
  (CURRENT_DATE + INTERVAL '21 days')::TIMESTAMPTZ,
  280000000,
  'KRW',
  '공업용수 공급 시설 일체형 전자식 유량계 교체. DN50~150 소구경 플랜지형. 전자유량계 일체형.',
  '유량계측',
  '전국',
  '{"priority": "medium", "type": "replacement", "quantity": 30}',
  MD5('kwater-demo-002'),
  'new'
),

-- 3. EU TED 초음파유량계 (UR-1000PLUS 매칭)
(
  'ted',
  'DEMO-2025-003',
  'Ultrasonic Water Flow Meters Supply - Berlin Water Authority (DN500-2000)',
  'Berliner Wasserbetriebe',
  'DE',
  (CURRENT_DATE + INTERVAL '35 days')::TIMESTAMPTZ,
  850000000,
  'EUR',
  'Supply and installation of ultrasonic flow meters for water treatment facilities. Multi-path ultrasonic required.',
  'Flow Measurement',
  'Berlin',
  '{"priority": "high", "ted_id": "2025/S-DEMO-003", "cpv": "38421000"}',
  MD5('ted-berlin-demo-003'),
  'processing'
),

-- 4. 한전 열량계 (EnerRay 매칭)
(
  'kepco',
  'DEMO-2025-004',
  '한국전력 발전소 초음파 열량계 납품 (지역난방 연계)',
  '한국전력공사',
  'KR',
  (CURRENT_DATE + INTERVAL '28 days')::TIMESTAMPTZ,
  120000000,
  'KRW',
  '발전소 지역난방 열공급 계량을 위한 초음파 열량계 100대 납품. 지역난방 연계.',
  '열량계측',
  '전국',
  '{"priority": "low", "type": "supply", "quantity": 100}',
  MD5('kepco-demo-004'),
  'new'
),

-- 5. 부산 하수처리장 비만관 (UR-1010PLUS 매칭)
(
  'g2b',
  'DEMO-2025-005',
  '부산시 하수처리장 비만관형 유량계 설치 (DN1000, 비접촉식)',
  '부산환경공단',
  'KR',
  (CURRENT_DATE + INTERVAL '7 days')::TIMESTAMPTZ,
  95000000,
  'KRW',
  '하수처리장 우수관거 비만관형 비접촉 유량계 DN1000 5대 설치. 하수 슬러지 환경.',
  '유량계측',
  '부산',
  '{"priority": "high", "type": "installation", "urgent": true}',
  MD5('busan-demo-005'),
  'matched'
),

-- 6. 농어촌공사 개수로 (SL-3000PLUS 매칭)
(
  'g2b',
  'DEMO-2025-006',
  '농어촌공사 농업용수로 개수로 유량측정 시스템 설치',
  '한국농어촌공사',
  'KR',
  (CURRENT_DATE + INTERVAL '40 days')::TIMESTAMPTZ,
  180000000,
  'KRW',
  '농업용 관개수로 개수로 레벨센서 유량계 10개소 설치. 비접촉 레이더 방식.',
  '유량계측',
  '전국',
  '{"priority": "medium", "type": "installation", "sites": 10}',
  MD5('kr-rural-demo-006'),
  'new'
)

ON CONFLICT (source_id, source_notice_id) DO UPDATE SET
  title = EXCLUDED.title,
  organization = EXCLUDED.organization,
  deadline = EXCLUDED.deadline,
  estimated_price = EXCLUDED.estimated_price,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 샘플 매칭 결과 (bids와 products 연결)
-- Note: 실제 매칭은 enhanced-matcher가 런타임에 수행하므로,
-- 여기서는 미리 계산된 매칭 결과만 삽입

INSERT INTO matches (bid_id, product_id, score, confidence, reasons, is_approved)
SELECT
  b.id,
  p.id,
  CASE
    WHEN b.source_notice_id = 'DEMO-2025-001' THEN 85
    WHEN b.source_notice_id = 'DEMO-2025-002' THEN 78
    WHEN b.source_notice_id = 'DEMO-2025-003' THEN 92
    WHEN b.source_notice_id = 'DEMO-2025-004' THEN 75
    WHEN b.source_notice_id = 'DEMO-2025-005' THEN 88
    WHEN b.source_notice_id = 'DEMO-2025-006' THEN 82
  END,
  CASE
    WHEN b.source_notice_id IN ('DEMO-2025-001', 'DEMO-2025-003', 'DEMO-2025-005') THEN 'high'
    ELSE 'medium'
  END,
  CASE
    WHEN b.source_notice_id = 'DEMO-2025-001' THEN '["초음파유량계 키워드", "DN300-1000 규격", "서울시 상수도"]'
    WHEN b.source_notice_id = 'DEMO-2025-002' THEN '["전자유량계 키워드", "DN50-150 규격", "K-water"]'
    WHEN b.source_notice_id = 'DEMO-2025-003' THEN '["ultrasonic 키워드", "DN500-2000 규격", "EU TED"]'
    WHEN b.source_notice_id = 'DEMO-2025-004' THEN '["열량계 키워드", "지역난방"]'
    WHEN b.source_notice_id = 'DEMO-2025-005' THEN '["비만관 키워드", "하수 슬러지"]'
    WHEN b.source_notice_id = 'DEMO-2025-006' THEN '["개수로 키워드", "농업용수"]'
  END::JSONB,
  false
FROM bids b
CROSS JOIN products p
WHERE b.source_notice_id LIKE 'DEMO-2025-%'
  AND p.tenant_id = '11111111-1111-1111-1111-111111111111'
  AND (
    (b.source_notice_id = 'DEMO-2025-001' AND p.model_number = 'UR-1000PLUS') OR
    (b.source_notice_id = 'DEMO-2025-002' AND p.model_number = 'MF-1000C') OR
    (b.source_notice_id = 'DEMO-2025-003' AND p.model_number = 'UR-1000PLUS') OR
    (b.source_notice_id = 'DEMO-2025-004' AND p.model_number = 'EnerRay') OR
    (b.source_notice_id = 'DEMO-2025-005' AND p.model_number = 'UR-1010PLUS') OR
    (b.source_notice_id = 'DEMO-2025-006' AND p.model_number = 'SL-3000PLUS')
  )
ON CONFLICT (bid_id, product_id) DO UPDATE SET
  score = EXCLUDED.score,
  confidence = EXCLUDED.confidence,
  reasons = EXCLUDED.reasons,
  updated_at = NOW();
