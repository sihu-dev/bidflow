-- ============================================================================
-- BIDFLOW 성능 최적화 - 복합 인덱스 추가
-- ============================================================================
-- 예상 효과: 쿼리 성능 90% 개선 (200ms → 20ms)

-- 1. 입찰 상태 + 마감일 복합 인덱스
-- 사용처: Dashboard 입찰 목록 필터링
CREATE INDEX IF NOT EXISTS idx_bids_status_deadline
ON bids(status, deadline)
WHERE status IN ('open', 'matched');

-- 2. 소스 + 외부 ID 복합 인덱스 (중복 방지)
-- 사용처: 크롤링 시 중복 체크
CREATE INDEX IF NOT EXISTS idx_bids_source_external
ON bids(source, external_id);

-- 3. 테넌트 + 상태 복합 인덱스 (멀티테넌트)
-- 사용처: 테넌트별 입찰 조회
CREATE INDEX IF NOT EXISTS idx_bids_tenant_status
ON bids(tenant_id, status);

-- 4. 매칭 점수 인덱스 (정렬 최적화)
-- 사용처: 고득점 매칭 조회
CREATE INDEX IF NOT EXISTS idx_matches_score
ON matches(score DESC)
WHERE score >= 100;

-- 5. 기관 점수 인덱스
-- 사용처: 기관별 과거 실적 조회
CREATE INDEX IF NOT EXISTS idx_org_scores_tenant_org
ON org_scores(tenant_id, organization_name);

-- 6. 알림 발송 상태 인덱스
-- 사용처: 대기 중인 알림 조회
CREATE INDEX IF NOT EXISTS idx_alerts_status_scheduled
ON alerts(status, scheduled_at)
WHERE status = 'pending';

-- 7. 감사 로그 시간 인덱스 (파티셔닝 준비)
-- 사용처: 최근 로그 조회
CREATE INDEX IF NOT EXISTS idx_audit_logs_created
ON audit_logs(created_at DESC);

-- ============================================================================
-- 인덱스 검증 쿼리
-- ============================================================================

-- 인덱스 목록 확인
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('bids', 'matches', 'org_scores', 'alerts', 'audit_logs')
ORDER BY tablename, indexname;

-- 인덱스 사용 통계
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN ('bids', 'matches', 'org_scores', 'alerts', 'audit_logs')
ORDER BY idx_scan DESC;
