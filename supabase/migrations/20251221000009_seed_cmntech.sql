-- =========================================
-- BIDFLOW V2 Migration: CMNTech Seed Data
-- =========================================

-- CMNTech 테넌트 생성
INSERT INTO tenants (id, name, slug, settings, plan) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '(주)씨엠엔텍',
  'cmntech',
  '{
    "notification": {
      "email": true,
      "slack": true,
      "webhook": false
    },
    "matching": {
      "minScore": 50,
      "autoAction": false
    },
    "sources": {
      "ted": true,
      "sam_gov": true,
      "g2b": true
    },
    "industry": ["water", "sensor", "measurement"],
    "region": ["KR", "EU", "US"]
  }',
  'pro'
) ON CONFLICT (slug) DO NOTHING;

-- CMNTech 5개 제품 등록
INSERT INTO products (tenant_id, name, model_number, keywords, specs, is_active) VALUES

-- 1. UR-1000PLUS: 다회선 초음파 유량계
(
  '11111111-1111-1111-1111-111111111111',
  'UR-1000PLUS 다회선 초음파 유량계',
  'UR-1000PLUS',
  '{
    "primary": ["초음파유량계", "다회선", "만관", "ultrasonic flow meter", "multi-path"],
    "secondary": ["상수도", "취수장", "정수장", "water meter", "수자원"],
    "specs": ["DN100", "DN200", "DN300", "DN500", "DN1000", "DN2000", "DN4000"],
    "exclude": ["전자유량계", "열량계", "비만관", "개수로"]
  }',
  '{
    "accuracy": "±0.5%",
    "diameter_range": "DN100-DN4000",
    "protocol": ["RS-485", "Modbus RTU", "4-20mA"],
    "power": "AC 220V",
    "protection": "IP68",
    "application": ["상수도", "취수장", "정수장", "수자원관리"]
  }',
  true
),

-- 2. MF-1000C: 일체형 전자식 유량계
(
  '11111111-1111-1111-1111-111111111111',
  'MF-1000C 일체형 전자유량계',
  'MF-1000C',
  '{
    "primary": ["전자유량계", "일체형", "electromagnetic", "전자식"],
    "secondary": ["공업용수", "상거래", "냉온수", "공정수"],
    "specs": ["DN15", "DN25", "DN50", "DN80", "DN100", "DN150", "DN200", "DN2000"],
    "exclude": ["초음파", "열량계", "비만관"]
  }',
  '{
    "accuracy": "±0.3%",
    "diameter_range": "DN15-DN2000",
    "protocol": ["RS-485", "HART", "Modbus", "4-20mA"],
    "power": "AC 220V / DC 24V",
    "protection": "IP67",
    "application": ["공업용수", "상거래용", "빌딩", "공정"]
  }',
  true
),

-- 3. UR-1010PLUS: 비만관형 초음파 유량계
(
  '11111111-1111-1111-1111-111111111111',
  'UR-1010PLUS 비만관형 초음파 유량계',
  'UR-1010PLUS',
  '{
    "primary": ["비만관", "하수유량계", "초음파", "open channel ultrasonic"],
    "secondary": ["하수", "우수", "복류수", "슬러지", "sewage"],
    "specs": ["DN100", "DN200", "DN500", "DN1000", "DN3000"],
    "exclude": ["만관", "상수도", "정수장", "전자유량계"]
  }',
  '{
    "accuracy": "±1.0%",
    "diameter_range": "DN100-DN3000",
    "protocol": ["RS-485", "Modbus RTU"],
    "debris_tolerance": "5%",
    "power": "AC 220V",
    "protection": "IP68",
    "application": ["하수처리", "우수관거", "복류수", "슬러지"]
  }',
  true
),

-- 4. SL-3000PLUS: 개수로 유량계
(
  '11111111-1111-1111-1111-111111111111',
  'SL-3000PLUS 개수로 유량계',
  'SL-3000PLUS',
  '{
    "primary": ["개수로", "하천유량계", "open channel", "비접촉"],
    "secondary": ["하천", "수로", "농업용수", "방류", "river"],
    "specs": ["레이더", "도플러", "비접촉", "다지점"],
    "exclude": ["만관", "관로", "배관"]
  }',
  '{
    "method": "레이더 + 도플러 유속",
    "measurement": "비접촉 수위 + 다지점 유속",
    "power": ["AC 220V", "태양광"],
    "communication": ["CDMA", "LTE", "WiFi"],
    "protection": "IP66",
    "application": ["하천", "수로", "농업용수", "방류구"]
  }',
  true
),

-- 5. EnerRay: 초음파 열량계
(
  '11111111-1111-1111-1111-111111111111',
  'EnerRay 초음파 열량계',
  'EnerRay',
  '{
    "primary": ["열량계", "초음파열량계", "heat meter", "에너지미터"],
    "secondary": ["지역난방", "냉난방", "에너지", "난방"],
    "specs": ["DN15", "DN25", "DN50", "DN100", "DN300", "Class 2"],
    "exclude": ["유량계", "하수"]
  }',
  '{
    "accuracy": "Class 2 (EN 1434)",
    "diameter_range": "DN15-DN300",
    "protocol": ["M-Bus", "Modbus", "RS-485"],
    "power": "Battery / AC",
    "protection": "IP65",
    "application": ["지역난방", "빌딩 에너지", "냉난방"]
  }',
  true
)
ON CONFLICT (tenant_id, model_number) DO UPDATE SET
  name = EXCLUDED.name,
  keywords = EXCLUDED.keywords,
  specs = EXCLUDED.specs,
  is_active = EXCLUDED.is_active;

-- CMNTech 주요 거래 기관 점수 초기화
INSERT INTO org_scores (
  tenant_id, organization_name, organization_id,
  win_count, total_amount, history_score,
  is_preferred, preference_weight, preference_score,
  budget_tier, annual_bid_count, scale_score,
  industry_tags, region_tags
) VALUES

-- K-water (한국수자원공사)
(
  '11111111-1111-1111-1111-111111111111',
  'K-water (한국수자원공사)',
  'kwater-001',
  5, 500000000, 25.0,
  true, 1.5, 15.0,
  'S', 150, 10.0,
  ARRAY['water', 'infrastructure'],
  ARRAY['전국']
),

-- 한국환경공단
(
  '11111111-1111-1111-1111-111111111111',
  '한국환경공단',
  'keco-001',
  3, 300000000, 17.0,
  true, 1.3, 12.0,
  'A', 80, 8.0,
  ARRAY['environment', 'water'],
  ARRAY['전국']
),

-- 서울시 상수도사업본부
(
  '11111111-1111-1111-1111-111111111111',
  '서울특별시 상수도사업본부',
  'seoul-water-001',
  2, 200000000, 10.0,
  true, 1.2, 10.0,
  'A', 60, 8.0,
  ARRAY['water', 'municipal'],
  ARRAY['서울']
),

-- 부산시 환경시설공단
(
  '11111111-1111-1111-1111-111111111111',
  '부산광역시 환경시설공단',
  'busan-env-001',
  1, 100000000, 5.0,
  false, 1.0, 5.0,
  'B', 30, 6.0,
  ARRAY['environment', 'water'],
  ARRAY['부산']
),

-- 인천시 상수도사업본부
(
  '11111111-1111-1111-1111-111111111111',
  '인천광역시 상수도사업본부',
  'incheon-water-001',
  0, 0, 0.0,
  false, 1.0, 3.0,
  'B', 40, 6.0,
  ARRAY['water', 'municipal'],
  ARRAY['인천']
),

-- 한국도로공사
(
  '11111111-1111-1111-1111-111111111111',
  '한국도로공사',
  'ex-001',
  0, 0, 0.0,
  false, 1.0, 2.0,
  'S', 100, 8.0,
  ARRAY['infrastructure', 'road'],
  ARRAY['전국']
)

ON CONFLICT (tenant_id, organization_name) DO UPDATE SET
  win_count = EXCLUDED.win_count,
  total_amount = EXCLUDED.total_amount,
  history_score = EXCLUDED.history_score,
  is_preferred = EXCLUDED.is_preferred,
  preference_weight = EXCLUDED.preference_weight,
  preference_score = EXCLUDED.preference_score,
  budget_tier = EXCLUDED.budget_tier,
  annual_bid_count = EXCLUDED.annual_bid_count,
  scale_score = EXCLUDED.scale_score;
