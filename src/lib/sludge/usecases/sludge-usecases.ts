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

  // TODO: 실제 AI 모델 호출 로직 구현
  // 현재는 더미 예측값 생성
  const predictedValue = generateDummyPrediction(dto.predictionType as PredictionType);

  const prediction = await repo.savePrediction({
    siteId: dto.siteId as SiteId,
    predictionType: dto.predictionType as PredictionType,
    predictedAt: new Date(),
    targetDate: new Date(dto.targetDate),
    predictedValue,
    confidenceLow: predictedValue * 0.9,
    confidenceHigh: predictedValue * 1.1,
    modelVersion: 'v0.1.0-dummy',
  });

  return prediction;
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

  // TODO: 실제 보고서 데이터 생성 로직
  const reportData = generateDummyReportData(dto);

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
  const alerts = generateAlerts(sensors, latestReadings);

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

  for (const site of sites) {
    const sensors = await repo.getSensorsBySite(site.id);
    totalSensors += sensors.length;
    activeSensors += sensors.filter((s) => s.isActive).length;
  }

  return {
    totalSites: sites.length,
    activeSensors,
    alertsToday: Math.floor(Math.random() * 5), // TODO: 실제 알림 카운트
    avgEfficiency: 85 + Math.random() * 10, // TODO: 실제 효율 계산
  };
}

function generateAlerts(
  sensors: SludgeSensor[],
  readings: Record<string, SludgeReading>
): SiteAlert[] {
  const alerts: SiteAlert[] = [];

  // 임계값 정의 (TODO: 설정에서 가져오기)
  const thresholds: Record<string, { min?: number; max?: number }> = {
    flow_ur1010: { min: 0, max: 1000 },
    temperature: { min: 5, max: 40 },
    ph: { min: 6, max: 9 },
  };

  for (const sensor of sensors) {
    const reading = readings[sensor.id];
    if (!reading) continue;

    const threshold = thresholds[sensor.type];
    if (!threshold) continue;

    if (threshold.max !== undefined && reading.value > threshold.max) {
      alerts.push({
        id: `alert-${sensor.id}-high`,
        siteId: sensor.siteId,
        sensorId: sensor.id,
        type: 'warning',
        message: `${sensor.name}: 상한값 초과 (${reading.value} > ${threshold.max})`,
        value: reading.value,
        threshold: threshold.max,
        createdAt: new Date(),
      });
    }

    if (threshold.min !== undefined && reading.value < threshold.min) {
      alerts.push({
        id: `alert-${sensor.id}-low`,
        siteId: sensor.siteId,
        sensorId: sensor.id,
        type: 'warning',
        message: `${sensor.name}: 하한값 미달 (${reading.value} < ${threshold.min})`,
        value: reading.value,
        threshold: threshold.min,
        createdAt: new Date(),
      });
    }
  }

  return alerts;
}
