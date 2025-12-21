-- ============================================
-- Sludge AI Module - Database Schema
-- 슬러지 AI 모듈 데이터베이스 스키마
-- Version: 1.0.0
-- Created: 2025-12-21
-- ============================================

-- ============================================
-- 1. Sites (슬러지 처리 시설)
-- ============================================

CREATE TABLE IF NOT EXISTS sludge_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('public_wwtp', 'private_wwtp', 'biogas', 'industrial')),
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    capacity_m3_day DECIMAL,
    organization_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sludge_sites IS '슬러지 처리 시설';
COMMENT ON COLUMN sludge_sites.type IS 'public_wwtp: 공공 하수처리장, private_wwtp: 민간 폐수처리, biogas: 바이오가스, industrial: 산업';
COMMENT ON COLUMN sludge_sites.capacity_m3_day IS '일 처리 용량 (m³/일)';

-- Index
CREATE INDEX IF NOT EXISTS idx_sludge_sites_type ON sludge_sites(type);
CREATE INDEX IF NOT EXISTS idx_sludge_sites_organization ON sludge_sites(organization_id);

-- ============================================
-- 2. Sensors (센서 - 씨엠엔텍 유량계 등)
-- ============================================

CREATE TABLE IF NOT EXISTS sludge_sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sludge_sites(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'flow_ur1010', 'flow_ur1000', 'flow_sl3000', 'flow_mf1000',
        'temperature', 'ph', 'ss_concentration', 'do', 'pressure', 'power'
    )),
    model VARCHAR(100),
    protocol VARCHAR(50) CHECK (protocol IN ('modbus_rtu', 'modbus_tcp', 'analog_4_20ma', 'rs485', 'mqtt')),
    address INT,
    register_addr INT,
    scale DOUBLE PRECISION DEFAULT 1.0,
    unit VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_reading TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sludge_sensors IS '센서 (씨엠엔텍 유량계 등)';
COMMENT ON COLUMN sludge_sensors.type IS '센서 유형 (flow_ur1010: UR-1010PLUS, flow_sl3000: SL-3000PLUS 등)';
COMMENT ON COLUMN sludge_sensors.model IS '센서 모델명 (UR-1010PLUS, SL-3000PLUS 등)';
COMMENT ON COLUMN sludge_sensors.protocol IS '통신 프로토콜';

-- Index
CREATE INDEX IF NOT EXISTS idx_sludge_sensors_site ON sludge_sensors(site_id);
CREATE INDEX IF NOT EXISTS idx_sludge_sensors_type ON sludge_sensors(type);
CREATE INDEX IF NOT EXISTS idx_sludge_sensors_active ON sludge_sensors(is_active);

-- ============================================
-- 3. Readings (센서 측정값)
-- ============================================

CREATE TABLE IF NOT EXISTS sludge_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    site_id UUID NOT NULL REFERENCES sludge_sites(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES sludge_sensors(id) ON DELETE CASCADE,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    quality SMALLINT DEFAULT 100 CHECK (quality >= 0 AND quality <= 100)
);

COMMENT ON TABLE sludge_readings IS '센서 측정값 (시계열 데이터)';
COMMENT ON COLUMN sludge_readings.quality IS '데이터 품질 점수 (0-100)';

-- Index (시계열 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_sludge_readings_time ON sludge_readings(time DESC);
CREATE INDEX IF NOT EXISTS idx_sludge_readings_site_time ON sludge_readings(site_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_sludge_readings_sensor_time ON sludge_readings(sensor_id, time DESC);

-- TimescaleDB 확장 사용 시 (선택적)
-- SELECT create_hypertable('sludge_readings', 'time', if_not_exists => TRUE);
-- SELECT add_compression_policy('sludge_readings', INTERVAL '30 days');

-- ============================================
-- 4. Predictions (AI 예측 결과)
-- ============================================

CREATE TABLE IF NOT EXISTS sludge_predictions (
    id SERIAL PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES sludge_sites(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN (
        'sludge_volume', 'biogas_production', 'equipment_failure', 'energy_consumption', 'water_quality'
    )),
    predicted_at TIMESTAMPTZ DEFAULT NOW(),
    target_date DATE NOT NULL,
    predicted_value DOUBLE PRECISION NOT NULL,
    confidence_low DOUBLE PRECISION,
    confidence_high DOUBLE PRECISION,
    actual_value DOUBLE PRECISION,
    model_version VARCHAR(50) NOT NULL,
    UNIQUE (site_id, prediction_type, target_date, model_version)
);

COMMENT ON TABLE sludge_predictions IS 'AI 예측 결과';
COMMENT ON COLUMN sludge_predictions.prediction_type IS '예측 유형 (sludge_volume, biogas_production 등)';
COMMENT ON COLUMN sludge_predictions.actual_value IS '사후 기록된 실제값 (정확도 검증용)';

-- Index
CREATE INDEX IF NOT EXISTS idx_sludge_predictions_site ON sludge_predictions(site_id);
CREATE INDEX IF NOT EXISTS idx_sludge_predictions_type ON sludge_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_sludge_predictions_date ON sludge_predictions(target_date);

-- ============================================
-- 5. Reports (정책 보고서)
-- ============================================

CREATE TABLE IF NOT EXISTS sludge_reports (
    id VARCHAR(50) PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES sludge_sites(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
        'monthly_biogas', 'quarterly_efficiency', 'annual_summary', 'esg_report'
    )),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    data JSONB NOT NULL DEFAULT '{}',
    file_url TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (site_id, report_type, period_start, period_end)
);

COMMENT ON TABLE sludge_reports IS '정책 보고서 (바이오가스 생산목표제 등)';
COMMENT ON COLUMN sludge_reports.data IS '보고서 데이터 (JSON)';
COMMENT ON COLUMN sludge_reports.file_url IS '생성된 PDF/Excel 파일 URL';

-- Index
CREATE INDEX IF NOT EXISTS idx_sludge_reports_site ON sludge_reports(site_id);
CREATE INDEX IF NOT EXISTS idx_sludge_reports_type ON sludge_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_sludge_reports_status ON sludge_reports(status);
CREATE INDEX IF NOT EXISTS idx_sludge_reports_period ON sludge_reports(period_start, period_end);

-- ============================================
-- 6. Alerts (알림)
-- ============================================

CREATE TABLE IF NOT EXISTS sludge_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sludge_sites(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES sludge_sensors(id) ON DELETE SET NULL,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    value DOUBLE PRECISION,
    threshold DOUBLE PRECISION,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sludge_alerts IS '알림 (임계값 초과 등)';

-- Index
CREATE INDEX IF NOT EXISTS idx_sludge_alerts_site ON sludge_alerts(site_id);
CREATE INDEX IF NOT EXISTS idx_sludge_alerts_created ON sludge_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sludge_alerts_unack ON sludge_alerts(acknowledged_at) WHERE acknowledged_at IS NULL;

-- ============================================
-- 7. Sensor Thresholds (센서 임계값 설정)
-- ============================================

CREATE TABLE IF NOT EXISTS sludge_sensor_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES sludge_sensors(id) ON DELETE CASCADE,
    min_value DOUBLE PRECISION,
    max_value DOUBLE PRECISION,
    warning_min DOUBLE PRECISION,
    warning_max DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (sensor_id)
);

COMMENT ON TABLE sludge_sensor_thresholds IS '센서별 임계값 설정';

-- ============================================
-- 8. RLS (Row Level Security) - 선택적
-- ============================================

-- 기본적으로 비활성화, 필요시 활성화
-- ALTER TABLE sludge_sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sludge_sensors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sludge_readings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. Triggers
-- ============================================

-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_sludge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sludge_sites_updated
    BEFORE UPDATE ON sludge_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_sludge_updated_at();

CREATE TRIGGER trigger_sludge_thresholds_updated
    BEFORE UPDATE ON sludge_sensor_thresholds
    FOR EACH ROW
    EXECUTE FUNCTION update_sludge_updated_at();

-- ============================================
-- 10. Sample Data (개발용)
-- ============================================

-- INSERT INTO sludge_sites (name, type, address, capacity_m3_day) VALUES
-- ('용인 하수처리장', 'public_wwtp', '경기도 용인시 기흥구', 50000),
-- ('화성 바이오가스 시설', 'biogas', '경기도 화성시', 10000),
-- ('안산 산업폐수 처리장', 'industrial', '경기도 안산시 단원구', 20000);

-- ============================================
-- Done
-- ============================================
