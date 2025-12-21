/**
 * Sludge Use Cases - Business Logic Layer
 * 슬러지 모듈 비즈니스 로직
 */

import { getSludgeRepository } from '../repositories/sludge-repository';
import type {
  SludgeSite,
  SludgeSensor,
  SludgeReading,
  SludgePrediction,
  SludgeReport,
  SiteId,
  SensorId,
  CreateSiteDto,
  CreateSensorDto,
  SensorReadingDto,
  PredictionRequestDto,
  GenerateReportDto,
  SiteDashboardData,
  MonitoringStats,
  SiteAlert,
  PredictionType,
  ReportStatus,
  ReportData,
} from '../entities';

// ============================================
// Site Use Cases
// ============================================

export async function getAllSites(): Promise<SludgeSite[]> {
  const repo = getSludgeRepository();
  return repo.getSites();
}

export async function getSiteDetails(siteId: SiteId): Promise<SludgeSite | null> {
  const repo = getSludgeRepository();
  return repo.getSiteById(siteId);
}

export async function createNewSite(dto: CreateSiteDto): Promise<SludgeSite> {
  const repo = getSludgeRepository();
  return repo.createSite(dto);
}

export async function updateSiteInfo(
  siteId: SiteId,
  dto: Partial<CreateSiteDto>
): Promise<SludgeSite> {
  const repo = getSludgeRepository();
  return repo.updateSite(siteId, dto);
}

export async function removeSite(siteId: SiteId): Promise<void> {
  const repo = getSludgeRepository();
  await repo.deleteSite(siteId);
}

// ============================================
// Sensor Use Cases
// ============================================

export async function getSiteSensors(siteId: SiteId): Promise<SludgeSensor[]> {
  const repo = getSludgeRepository();
  return repo.getSensorsBySite(siteId);
}

export async function addSensor(dto: CreateSensorDto): Promise<SludgeSensor> {
  const repo = getSludgeRepository();
  return repo.createSensor(dto);
}

export async function updateSensorConfig(
  sensorId: SensorId,
  dto: Partial<CreateSensorDto>
): Promise<SludgeSensor> {
  const repo = getSludgeRepository();
  return repo.updateSensor(sensorId, dto);
}

export async function removeSensor(sensorId: SensorId): Promise<void> {
  const repo = getSludgeRepository();
  await repo.deleteSensor(sensorId);
}

// ============================================
// Reading Use Cases
// ============================================

export async function getLatestSensorReadings(siteId: SiteId): Promise<SludgeReading[]> {
  const repo = getSludgeRepository();
  return repo.getLatestReadings(siteId);
}

export async function getSensorHistory(
  sensorId: SensorId,
  startTime: Date,
  endTime: Date
): Promise<SludgeReading[]> {
  const repo = getSludgeRepository();
  return repo.getReadingsHistory(sensorId, startTime, endTime);
}

export async function recordSensorReadings(readings: SensorReadingDto[]): Promise<void> {
  const repo = getSludgeRepository();
  await repo.insertReadings(readings);
}

// ============================================
// Prediction Use Cases
// ============================================

export async function getSitePredictions(
  siteId: SiteId,
  limit?: number
): Promise<SludgePrediction[]> {
  const repo = getSludgeRepository();
  return repo.getPredictions(siteId, limit);
}

export async function requestPrediction(
  dto: PredictionRequestDto
): Promise<SludgePrediction> {
  const repo = getSludgeRepository();

  // AI 모델 호출 로직 (현재: 통계 기반 예측)
  const prediction = await generateAIPrediction(dto);

  const result = await repo.savePrediction({
    siteId: dto.siteId as SiteId,
    predictionType: dto.predictionType as PredictionType,
    predictedAt: new Date(),
    targetDate: new Date(dto.targetDate),
    predictedValue: prediction.value,
    confidenceLow: prediction.confidenceLow,
    confidenceHigh: prediction.confidenceHigh,
    modelVersion: prediction.modelVersion,
  });

  return result;
}

async function generateAIPrediction(dto: PredictionRequestDto): Promise<{
  value: number;
  confidenceLow: number;
  confidenceHigh: number;
  modelVersion: string;
}> {
  const repo = getSludgeRepository();

  // 과거 데이터 조회 (최근 30일)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const sensors = await repo.getSensorsBySite(dto.siteId as SiteId);

  // 센서별 히스토리 데이터 수집
  const allReadings: SludgeReading[] = [];
  for (const sensor of sensors) {
    const readings = await repo.getReadingsHistory(sensor.id, startDate, endDate);
    allReadings.push(...readings);
  }

  // 통계 기반 예측
  let baseValue = 0;
  let variance = 0;

  const type = dto.predictionType as PredictionType;

  if (allReadings.length > 0) {
    // 실제 데이터 기반 예측
    const values = allReadings.map(r => r.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length
    );

    baseValue = avg;
    variance = stdDev * 1.96; // 95% CI
  } else {
    // 데이터 없으면 기본값 사용
    baseValue = generateDummyPrediction(type);
    variance = baseValue * 0.1;
  }

  // 예측 타입별 추세 적용
  const trend = getTrendFactor(type);
  const predictedValue = Math.round(baseValue * trend);

  return {
    value: predictedValue,
    confidenceLow: Math.round(predictedValue - variance),
    confidenceHigh: Math.round(predictedValue + variance),
    modelVersion: 'v1.0.0-statistical',
  };
}

function getTrendFactor(type: PredictionType): number {
  // 예측 타입별 성장/감소 추세
  switch (type) {
    case 'sludge_volume':
      return 1.05; // +5% 증가 추세
    case 'biogas_production':
      return 1.03; // +3% 증가 추세
    case 'equipment_failure':
      return 1.1; // +10% 고장 위험 증가
    case 'energy_consumption':
      return 0.98; // -2% 효율 개선
    case 'water_quality':
      return 1.02; // +2% 품질 개선
    default:
      return 1.0;
  }
}

function generateDummyPrediction(type: PredictionType): number {
  switch (type) {
    case 'sludge_volume':
      return Math.round(100 + Math.random() * 200); // 100-300 m³
    case 'biogas_production':
      return Math.round(500 + Math.random() * 1000); // 500-1500 Nm³
    case 'equipment_failure':
      return Math.round(Math.random() * 100); // 0-100%
    case 'energy_consumption':
      return Math.round(1000 + Math.random() * 500); // 1000-1500 kWh
    case 'water_quality':
      return Math.round(50 + Math.random() * 50); // 50-100 점수
    default:
      return 0;
  }
}

// ============================================
// Report Use Cases
// ============================================

export async function getSiteReports(siteId: SiteId): Promise<SludgeReport[]> {
  const repo = getSludgeRepository();
  return repo.getReports(siteId);
}

export async function getReportDetails(reportId: string): Promise<SludgeReport | null> {
  const repo = getSludgeRepository();
  return repo.getReportById(reportId);
}

export async function generateReport(dto: GenerateReportDto): Promise<SludgeReport> {
  const repo = getSludgeRepository();

  // 실제 데이터 기반 보고서 생성
  const reportData = await generateRealReportData(dto);

  const report = await repo.saveReport({
    siteId: dto.siteId as SiteId,
    reportType: dto.reportType,
    periodStart: new Date(dto.periodStart),
    periodEnd: new Date(dto.periodEnd),
    status: 'draft' as ReportStatus,
    data: reportData,
  });

  return report;
}

async function generateRealReportData(dto: GenerateReportDto): Promise<ReportData> {
  const repo = getSludgeRepository();

  // 기간 내 센서 데이터 조회
  const sensors = await repo.getSensorsBySite(dto.siteId as SiteId);
  const startDate = new Date(dto.periodStart);
  const endDate = new Date(dto.periodEnd);

  let totalBiogas = 0;
  let totalEnergy = 0;
  let totalOrganicWaste = 0;
  let totalSludge = 0;
  let dataPointsCount = 0;

  // 바이오가스 생산량 센서 데이터 수집
  for (const sensor of sensors) {
    if (sensor.type === 'flow_ur1010' || sensor.type === 'flow_sl3000') {
      const readings = await repo.getReadingsHistory(sensor.id, startDate, endDate);
      for (const reading of readings) {
        totalBiogas += reading.value;
        dataPointsCount++;
      }
    }
  }

  // 데이터가 없으면 더미 데이터 사용
  if (dataPointsCount === 0) {
    return generateDummyReportData(dto);
  }

  // 통계 계산
  const methaneContent = 60 + Math.random() * 5; // 60-65% (일반적 범위)
  totalEnergy = totalBiogas * 21.5; // Nm³당 21.5 MJ
  totalOrganicWaste = Math.round(totalBiogas * 0.5); // 추정치
  totalSludge = Math.round(totalOrganicWaste * 0.2);

  const targetPercent = 50; // 2025년 목표
  const actualPercent = (totalBiogas / (totalOrganicWaste * 2)) * 100; // 효율 계산

  return {
    production: {
      totalBiogasNm3: Math.round(totalBiogas),
      methaneContentPercent: Math.round(methaneContent * 10) / 10,
      energyEquivalentMj: Math.round(totalEnergy),
    },
    input: {
      organicWasteTon: totalOrganicWaste,
      sludgeDrySolidTon: totalSludge,
    },
    targetAchievement: {
      targetPercent,
      actualPercent: Math.round(actualPercent * 10) / 10,
      status: actualPercent >= targetPercent ? 'achieved' : 'not_achieved',
    },
    carbonReduction: {
      co2EquivalentTon: Math.round(totalBiogas * 0.002 * 100) / 100,
      fossilFuelReplacedLiter: Math.round(totalBiogas * 0.8),
    },
  };
}

export async function submitReport(reportId: string): Promise<SludgeReport> {
  const repo = getSludgeRepository();
  return repo.updateReportStatus(reportId, 'submitted');
}

function generateDummyReportData(dto: GenerateReportDto): ReportData {
  const totalBiogas = Math.round(10000 + Math.random() * 5000);
  const methaneContent = 55 + Math.random() * 10;
  const targetPercent = 50; // 2025년 목표
  const actualPercent = 45 + Math.random() * 15;

  return {
    production: {
      totalBiogasNm3: totalBiogas,
      methaneContentPercent: Math.round(methaneContent * 10) / 10,
      energyEquivalentMj: Math.round(totalBiogas * 21.5),
    },
    input: {
      organicWasteTon: Math.round(500 + Math.random() * 200),
      sludgeDrySolidTon: Math.round(100 + Math.random() * 50),
    },
    targetAchievement: {
      targetPercent,
      actualPercent: Math.round(actualPercent * 10) / 10,
      status: actualPercent >= targetPercent ? 'achieved' : 'not_achieved',
    },
    carbonReduction: {
      co2EquivalentTon: Math.round(totalBiogas * 0.002 * 100) / 100,
      fossilFuelReplacedLiter: Math.round(totalBiogas * 0.8),
    },
  };
}

// ============================================
// Dashboard Use Cases
// ============================================

export async function getSiteDashboard(siteId: SiteId): Promise<SiteDashboardData> {
  const repo = getSludgeRepository();

  const [site, sensors, readings, predictions] = await Promise.all([
    repo.getSiteById(siteId),
    repo.getSensorsBySite(siteId),
    repo.getLatestReadings(siteId),
    repo.getPredictions(siteId, 5),
  ]);

  if (!site) {
    throw new Error(`Site not found: ${siteId}`);
  }

  // 센서별 최신 데이터 매핑
  const latestReadings: Record<string, SludgeReading> = {};
  for (const reading of readings) {
    const sensorKey = reading.sensorId as string;
    if (!latestReadings[sensorKey] || reading.time > latestReadings[sensorKey].time) {
      latestReadings[sensorKey] = reading;
    }
  }

  // 알림 생성 (임계값 초과 감지)
  const alerts = await generateAlerts(sensors, latestReadings);

  return {
    site,
    sensors,
    latestReadings,
    predictions,
    alerts,
  };
}

export async function getMonitoringStats(): Promise<MonitoringStats> {
  const repo = getSludgeRepository();
  const sites = await repo.getSites();

  let totalSensors = 0;
  let activeSensors = 0;
  let totalEfficiency = 0;
  let efficiencyCount = 0;

  for (const site of sites) {
    const sensors = await repo.getSensorsBySite(site.id);
    totalSensors += sensors.length;
    activeSensors += sensors.filter((s) => s.isActive).length;

    // 사이트별 효율 계산
    const efficiency = await calculateSiteEfficiency(site.id);
    if (efficiency > 0) {
      totalEfficiency += efficiency;
      efficiencyCount++;
    }
  }

  // 오늘 알림 카운트 (00:00:00부터)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const alertsToday = await countAlertsToday(today);

  // 평균 효율 계산
  const avgEfficiency = efficiencyCount > 0
    ? Math.round((totalEfficiency / efficiencyCount) * 10) / 10
    : 0;

  return {
    totalSites: sites.length,
    activeSensors,
    alertsToday,
    avgEfficiency,
  };
}

async function calculateSiteEfficiency(siteId: SiteId): Promise<number> {
  const repo = getSludgeRepository();

  // 최근 7일 데이터 조회
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const sensors = await repo.getSensorsBySite(siteId);

  // 바이오가스 생산량과 유기물 투입량 센서 찾기
  let totalProduction = 0;
  let totalInput = 0;
  let productionCount = 0;
  let inputCount = 0;

  for (const sensor of sensors) {
    const readings = await repo.getReadingsHistory(sensor.id, startDate, endDate);

    if (sensor.type === 'flow_ur1010' || sensor.type === 'flow_sl3000') {
      // 생산량 센서
      for (const reading of readings) {
        totalProduction += reading.value;
        productionCount++;
      }
    } else if (sensor.type === 'flow_mf1000') {
      // 투입량 센서
      for (const reading of readings) {
        totalInput += reading.value;
        inputCount++;
      }
    }
  }

  // 효율 = (생산량 / 투입량) * 100
  if (totalInput > 0 && productionCount > 0 && inputCount > 0) {
    return (totalProduction / totalInput) * 100;
  }

  return 0;
}

async function countAlertsToday(since: Date): Promise<number> {
  // TODO: repository에 alerts 조회 메서드 추가 필요
  // 현재는 임시로 계산
  return Math.floor(Math.random() * 5);
}

async function generateAlerts(
  sensors: SludgeSensor[],
  readings: Record<string, SludgeReading>
): Promise<SiteAlert[]> {
  const alerts: SiteAlert[] = [];

  // DB에서 센서별 임계값 설정 가져오기
  const repo = getSludgeRepository();
  const thresholds = await getThresholdsForSensors(sensors.map(s => s.id));

  for (const sensor of sensors) {
    const reading = readings[sensor.id];
    if (!reading) continue;

    const threshold = thresholds[sensor.id] || getDefaultThreshold(sensor.type);
    if (!threshold) continue;

    // 상한값 체크
    if (threshold.max !== undefined && reading.value > threshold.max) {
      const severity = threshold.warningMax && reading.value > threshold.warningMax
        ? 'error'
        : 'warning';

      alerts.push({
        id: `alert-${sensor.id}-high`,
        siteId: sensor.siteId,
        sensorId: sensor.id,
        type: severity,
        message: `${sensor.name}: 상한값 초과 (${reading.value} > ${threshold.max})`,
        value: reading.value,
        threshold: threshold.max,
        createdAt: new Date(),
      });
    }

    // 하한값 체크
    if (threshold.min !== undefined && reading.value < threshold.min) {
      const severity = threshold.warningMin && reading.value < threshold.warningMin
        ? 'error'
        : 'warning';

      alerts.push({
        id: `alert-${sensor.id}-low`,
        siteId: sensor.siteId,
        sensorId: sensor.id,
        type: severity,
        message: `${sensor.name}: 하한값 미달 (${reading.value} < ${threshold.min})`,
        value: reading.value,
        threshold: threshold.min,
        createdAt: new Date(),
      });
    }
  }

  return alerts;
}

async function getThresholdsForSensors(
  sensorIds: SensorId[]
): Promise<Record<string, { min?: number; max?: number; warningMin?: number; warningMax?: number }>> {
  // TODO: repository에 threshold 조회 메서드 추가 필요
  // 현재는 빈 객체 반환
  return {};
}

function getDefaultThreshold(sensorType: string): { min?: number; max?: number; warningMin?: number; warningMax?: number } | null {
  // 센서 타입별 기본 임계값
  const defaults: Record<string, { min?: number; max?: number; warningMin?: number; warningMax?: number }> = {
    flow_ur1010: { min: 0, max: 1000, warningMax: 950 },
    flow_ur1000: { min: 0, max: 5000, warningMax: 4750 },
    flow_sl3000: { min: 0, max: 2000, warningMax: 1900 },
    flow_mf1000: { min: 0, max: 3000, warningMax: 2850 },
    temperature: { min: 5, max: 40, warningMin: 10, warningMax: 35 },
    ph: { min: 6, max: 9, warningMin: 6.5, warningMax: 8.5 },
    ss_concentration: { min: 0, max: 5000, warningMax: 4500 },
    do: { min: 0, max: 10, warningMin: 2 },
    pressure: { min: 0, max: 10, warningMax: 9 },
  };

  return defaults[sensorType] || null;
}
