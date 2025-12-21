-- =========================================
-- BIDFLOW V2 Migration: Contact Submissions
-- =========================================

-- 문의 제출 테이블
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 문의자 정보
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(200),
  phone VARCHAR(30),

  -- 문의 내용
  inquiry_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,

  -- 상태 관리
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending: 대기중, in_progress: 처리중, resolved: 해결됨, closed: 종료

  -- 처리 정보
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- 메타데이터
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_inquiry_type ON contact_submissions(inquiry_type);

-- RLS 활성화
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (관리자만 조회 가능)
DROP POLICY IF EXISTS "contact_submissions_select" ON contact_submissions;
CREATE POLICY "contact_submissions_select" ON contact_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 삽입은 모든 사용자 가능 (익명 포함)
DROP POLICY IF EXISTS "contact_submissions_insert" ON contact_submissions;
CREATE POLICY "contact_submissions_insert" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- 업데이트는 관리자만
DROP POLICY IF EXISTS "contact_submissions_update" ON contact_submissions;
CREATE POLICY "contact_submissions_update" ON contact_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_submissions_updated_at();

-- 문의 유형 참조 테이블 (선택적)
CREATE TABLE IF NOT EXISTS inquiry_types (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);

-- 기본 문의 유형 추가
INSERT INTO inquiry_types (code, name, description, sort_order) VALUES
  ('demo', '데모 요청', '시스템 데모 시연 요청', 1),
  ('pricing', '가격 문의', '서비스 요금 및 결제 관련', 2),
  ('technical', '기술 문의', '기술적인 질문이나 연동 관련', 3),
  ('partnership', '파트너십', '제휴 및 협력 문의', 4),
  ('support', '기술 지원', '사용 중 문제 해결 요청', 5),
  ('other', '기타', '기타 문의사항', 99)
ON CONFLICT (code) DO NOTHING;

-- 코멘트
COMMENT ON TABLE contact_submissions IS '문의 제출 테이블';
COMMENT ON COLUMN contact_submissions.status IS '상태: pending, in_progress, resolved, closed';
COMMENT ON COLUMN contact_submissions.inquiry_type IS '문의 유형 코드 (inquiry_types 참조)';
