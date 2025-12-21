/**
 * Sludge AI Module - Domain Entities
 * 슬러지 AI 모듈 도메인 엔티티 정의
 */

// ============================================
// Branded Types (Type Safety)
// ============================================

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type SiteId = Brand<string, 'SiteId'>;
export type SensorId = Brand<string, 'SensorId'>;
export type ReadingId = Brand<string, 'ReadingId'>;
export type PredictionId = Brand<string, 'PredictionId'>;
export type ReportId = Brand<string, 'ReportId'>;

// ============================================
// Enums
// ============================================

export const SiteType = {
  PUBLIC_WWTP: 'public_wwtp',      // 공공 하수처리장
  PRIVATE_WWTP: 'private_wwtp',    // 민간 폐수처리
  BIOGAS: 'biogas',                // 바이오가스 시설
  INDUSTRIAL: 'industrial',        // 산업용 처리장
} as const;

export type SiteType = typeof SiteType[keyof typeof SiteType];

export const SensorType = {
  // 씨엠엔텍 유량계
  FLOW_UR1010: 'flow_ur1010',      // UR-1010PLUS 비만관
  FLOW_UR1000: 'flow_ur1000',      // UR-1000PLUS 만관
  FLOW_SL3000: 'flow_sl3000',      // SL-3000PLUS 개수로
  FLOW_MF1000: 'flow_mf1000',      // MF-1000C 전자유량계
  // 기타 센서
  TEMPERATURE: 'temperature',
  PH: 'ph',
  SS_CONCENTRATION: 'ss_concentration',
  DO: 'do',                        // 용존산소
  PRESSURE: 'pressure',
  POWER: 'power',                  // 전력 소비
} as const;

export type SensorType = typeof SensorType[keyof typeof SensorType];

export const SensorProtocol = {
  MODBUS_RTU: 'modbus_rtu',
  MODBUS_TCP: 'modbus_tcp',
  ANALOG_4_20MA: 'analog_4_20ma',
  RS485: 'rs485',
  MQTT: 'mqtt',
} as const;

export type SensorProtocol = typeof SensorProtocol[keyof typeof SensorProtocol];

export const PredictionType = {
  SLUDGE_VOLUME: 'sludge_volume',
  BIOGAS_PRODUCTION: 'biogas_production',
  EQUIPMENT_FAILURE: 'equipment_failure',
  ENERGY_CONSUMPTION: 'energy_consumption',
  WATER_QUALITY: 'water_quality',
} as const;

export type PredictionType = typeof PredictionType[keyof typeof PredictionType];

export const ReportType = {
  MONTHLY_BIOGAS: 'monthly_biogas',
  QUARTERLY_EFFICIENCY: 'quarterly_efficiency',
  ANNUAL_SUMMARY: 'annual_summary',
  ESG_REPORT: 'esg_report',
} as const;

export type ReportType = typeof ReportType[keyof typeof ReportType];

export const ReportStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

// ============================================
// Entities
// ============================================

/**
 * 슬러지 처리 시설
 */
export interface SludgeSite {
  id: SiteId;
  name: string;
  type: SiteType;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacityM3Day?: number;         // 일 처리 용량 (m³)
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 센서 (씨엠엔텍 유량계 등)
 */
export interface SludgeSensor {
  id: SensorId;
  siteId: SiteId;
  name: string;
  type: SensorType;
  model?: string;                  // 'UR-1010PLUS', 'SL-3000PLUS' 등
  protocol: SensorProtocol;
  address?: number;                // Modbus 주소
  register?: number;               // 레지스터 주소
  scale?: number;                  // 스케일 팩터
  unit: string;                    // 'm³/h', '°C', 'pH' 등
  isActive: boolean;
  lastReading?: Date;
  createdAt: Date;
}

/**
 * 센서 측정값
 */
export interface SludgeReading {
  id?: ReadingId;
  time: Date;
  siteId: SiteId;
  sensorId: SensorId;
  value: number;
  unit: string;
  quality: number;                 // 0-100 데이터 품질
}

/**
 * AI 예측 결과
 */
export interface SludgePrediction {
  id: PredictionId;
  siteId: SiteId;
  predictionType: PredictionType;
  predictedAt: Date;
  targetDate: Date;
  predictedValue: number;
  confidenceLow?: number;
  confidenceHigh?: number;
  actualValue?: number;            // 사후 기록
  modelVersion: string;
}

/**
 * 정책 보고서
 */
export interface SludgeReport {
  id: ReportId;
  siteId: SiteId;
  reportType: ReportType;
  periodStart: Date;
  periodEnd: Date;
  status: ReportStatus;
  data: ReportData;
  fileUrl?: string;
  submittedAt?: Date;
  createdAt: Date;
}

/**
 * 보고서 데이터 (바이오가스 월간)
 */
export interface ReportData {
  production?: {
    totalBiogasNm3: number;
    methaneContentPercent: number;
    energyEquivalentMj: number;
  };
  input?: {
    organicWasteTon: number;
    sludgeDrySolidTon: number;
  };
  targetAchievement?: {
    targetPercent: number;
    actualPercent: number;
    status: 'achieved' | 'not_achieved';
  };
  carbonReduction?: {
    co2EquivalentTon: number;
    fossilFuelReplacedLiter: number;
  };
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface CreateSiteDto {
  name: string;
  type: SiteType;
  address?: string;
  capacityM3Day?: number;
  latitude?: number;
  longitude?: number;
}

export interface CreateSensorDto {
  siteId: string;
  name: string;
  type: SensorType;
  model?: string;
  protocol: SensorProtocol;
  address?: number;
  unit: string;
}

export interface SensorReadingDto {
  sensorId: string;
  value: number;
  quality?: number;
}

export interface PredictionRequestDto {
  siteId: string;
  predictionType: PredictionType;
  targetDate: string;
}

export interface GenerateReportDto {
  siteId: string;
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface SiteDashboardData {
  site: SludgeSite;
  sensors: SludgeSensor[];
  latestReadings: Record<string, SludgeReading>;
  predictions: SludgePrediction[];
  alerts: SiteAlert[];
}

export interface SiteAlert {
  id: string;
  siteId: SiteId;
  sensorId?: SensorId;
  type: 'warning' | 'error' | 'info';
  message: string;
  value?: number;
  threshold?: number;
  createdAt: Date;
  acknowledgedAt?: Date;
}

export interface MonitoringStats {
  totalSites: number;
  activeSensors: number;
  alertsToday: number;
  avgEfficiency: number;
}
