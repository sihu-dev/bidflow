/**
 * Sludge Repository - Data Access Layer
 * 슬러지 모듈 데이터 접근 레이어
 */

import { createClient } from '@supabase/supabase-js';
import type {
  SludgeSite,
  SludgeSensor,
  SludgeReading,
  SludgePrediction,
  SludgeReport,
  SiteId,
  SensorId,
  ReadingId,
  PredictionId,
  ReportId,
  CreateSiteDto,
  CreateSensorDto,
  SensorReadingDto,
  SiteType,
  SensorType,
  SensorProtocol,
  PredictionType,
  ReportType,
  ReportStatus,
  ReportData,
} from '../entities';

// ============================================
// Database Row Types (Supabase 응답)
// ============================================

/** Supabase에서 반환하는 DB row의 기본 타입 */
type DatabaseRow = Record<string, unknown>;

// ============================================
// Repository Interface
// ============================================

export interface SensorThreshold {
  min?: number;
  max?: number;
  warningMin?: number;
  warningMax?: number;
}

export interface SensorAlert {
  id: string;
  siteId: SiteId;
  sensorId: SensorId;
  type: 'warning' | 'error';
  message: string;
  value: number;
  threshold: number;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface ISludgeRepository {
  // Sites
  getSites(): Promise<SludgeSite[]>;
  getSiteById(id: SiteId): Promise<SludgeSite | null>;
  createSite(dto: CreateSiteDto): Promise<SludgeSite>;
  updateSite(id: SiteId, dto: Partial<CreateSiteDto>): Promise<SludgeSite>;
  deleteSite(id: SiteId): Promise<void>;

  // Alerts
  getAlertsBySite(siteId: SiteId): Promise<SensorAlert[]>;
  getAlertsSince(since: Date): Promise<SensorAlert[]>;
  createAlert(alert: Omit<SensorAlert, 'id' | 'createdAt'>): Promise<SensorAlert>;
  acknowledgeAlert(id: string): Promise<void>;

  // Thresholds
  getThresholdsBySensorIds(sensorIds: SensorId[]): Promise<Record<string, SensorThreshold>>;
  setThreshold(sensorId: SensorId, threshold: SensorThreshold): Promise<void>;

  // Sensors
  getSensorsBySite(siteId: SiteId): Promise<SludgeSensor[]>;
  getSensorById(id: SensorId): Promise<SludgeSensor | null>;
  createSensor(dto: CreateSensorDto): Promise<SludgeSensor>;
  updateSensor(id: SensorId, dto: Partial<CreateSensorDto>): Promise<SludgeSensor>;
  deleteSensor(id: SensorId): Promise<void>;

  // Readings
  getLatestReadings(siteId: SiteId): Promise<SludgeReading[]>;
  getReadingsHistory(
    sensorId: SensorId,
    startTime: Date,
    endTime: Date
  ): Promise<SludgeReading[]>;
  insertReadings(readings: SensorReadingDto[]): Promise<void>;

  // Predictions
  getPredictions(siteId: SiteId, limit?: number): Promise<SludgePrediction[]>;
  savePrediction(prediction: Omit<SludgePrediction, 'id'>): Promise<SludgePrediction>;

  // Reports
  getReports(siteId: SiteId): Promise<SludgeReport[]>;
  getReportById(id: string): Promise<SludgeReport | null>;
  saveReport(report: Omit<SludgeReport, 'id' | 'createdAt'>): Promise<SludgeReport>;
  updateReportStatus(id: string, status: string): Promise<SludgeReport>;
}

// ============================================
// Supabase Implementation
// ============================================

export class SludgeRepository implements ISludgeRepository {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // ============================================
  // Sites
  // ============================================

  async getSites(): Promise<SludgeSite[]> {
    const { data, error } = await this.supabase
      .from('sludge_sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get sites: ${error.message}`);
    return (data || []).map(this.mapSite);
  }

  async getSiteById(id: SiteId): Promise<SludgeSite | null> {
    const { data, error } = await this.supabase
      .from('sludge_sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get site: ${error.message}`);
    }
    return data ? this.mapSite(data) : null;
  }

  async createSite(dto: CreateSiteDto): Promise<SludgeSite> {
    const { data, error } = await this.supabase
      .from('sludge_sites')
      .insert({
        name: dto.name,
        type: dto.type,
        address: dto.address,
        capacity_m3_day: dto.capacityM3Day,
        latitude: dto.latitude,
        longitude: dto.longitude,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create site: ${error.message}`);
    return this.mapSite(data);
  }

  async updateSite(id: SiteId, dto: Partial<CreateSiteDto>): Promise<SludgeSite> {
    const { data, error } = await this.supabase
      .from('sludge_sites')
      .update({
        name: dto.name,
        type: dto.type,
        address: dto.address,
        capacity_m3_day: dto.capacityM3Day,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update site: ${error.message}`);
    return this.mapSite(data);
  }

  async deleteSite(id: SiteId): Promise<void> {
    const { error } = await this.supabase
      .from('sludge_sites')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete site: ${error.message}`);
  }

  // ============================================
  // Sensors
  // ============================================

  async getSensorsBySite(siteId: SiteId): Promise<SludgeSensor[]> {
    const { data, error } = await this.supabase
      .from('sludge_sensors')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get sensors: ${error.message}`);
    return (data || []).map(this.mapSensor);
  }

  async getSensorById(id: SensorId): Promise<SludgeSensor | null> {
    const { data, error } = await this.supabase
      .from('sludge_sensors')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get sensor: ${error.message}`);
    }
    return data ? this.mapSensor(data) : null;
  }

  async createSensor(dto: CreateSensorDto): Promise<SludgeSensor> {
    const { data, error } = await this.supabase
      .from('sludge_sensors')
      .insert({
        site_id: dto.siteId,
        name: dto.name,
        type: dto.type,
        model: dto.model,
        protocol: dto.protocol,
        address: dto.address,
        unit: dto.unit,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create sensor: ${error.message}`);
    return this.mapSensor(data);
  }

  async updateSensor(id: SensorId, dto: Partial<CreateSensorDto>): Promise<SludgeSensor> {
    const { data, error } = await this.supabase
      .from('sludge_sensors')
      .update({
        name: dto.name,
        type: dto.type,
        model: dto.model,
        protocol: dto.protocol,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update sensor: ${error.message}`);
    return this.mapSensor(data);
  }

  async deleteSensor(id: SensorId): Promise<void> {
    const { error } = await this.supabase
      .from('sludge_sensors')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete sensor: ${error.message}`);
  }

  // ============================================
  // Readings
  // ============================================

  async getLatestReadings(siteId: SiteId): Promise<SludgeReading[]> {
    const { data, error } = await this.supabase
      .from('sludge_readings')
      .select('*')
      .eq('site_id', siteId)
      .order('time', { ascending: false })
      .limit(100);

    if (error) throw new Error(`Failed to get readings: ${error.message}`);
    return (data || []).map(this.mapReading);
  }

  async getReadingsHistory(
    sensorId: SensorId,
    startTime: Date,
    endTime: Date
  ): Promise<SludgeReading[]> {
    const { data, error } = await this.supabase
      .from('sludge_readings')
      .select('*')
      .eq('sensor_id', sensorId)
      .gte('time', startTime.toISOString())
      .lte('time', endTime.toISOString())
      .order('time', { ascending: true });

    if (error) throw new Error(`Failed to get readings history: ${error.message}`);
    return (data || []).map(this.mapReading);
  }

  async insertReadings(readings: SensorReadingDto[]): Promise<void> {
    const now = new Date().toISOString();
    const rows = readings.map((r) => ({
      time: now,
      sensor_id: r.sensorId,
      value: r.value,
      quality: r.quality ?? 100,
    }));

    const { error } = await this.supabase
      .from('sludge_readings')
      .insert(rows);

    if (error) throw new Error(`Failed to insert readings: ${error.message}`);
  }

  // ============================================
  // Predictions
  // ============================================

  async getPredictions(siteId: SiteId, limit = 10): Promise<SludgePrediction[]> {
    const { data, error } = await this.supabase
      .from('sludge_predictions')
      .select('*')
      .eq('site_id', siteId)
      .order('predicted_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get predictions: ${error.message}`);
    return (data || []).map(this.mapPrediction);
  }

  async savePrediction(prediction: Omit<SludgePrediction, 'id'>): Promise<SludgePrediction> {
    const { data, error } = await this.supabase
      .from('sludge_predictions')
      .insert({
        site_id: prediction.siteId,
        prediction_type: prediction.predictionType,
        target_date: prediction.targetDate,
        predicted_value: prediction.predictedValue,
        confidence_low: prediction.confidenceLow,
        confidence_high: prediction.confidenceHigh,
        model_version: prediction.modelVersion,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save prediction: ${error.message}`);
    return this.mapPrediction(data);
  }

  // ============================================
  // Reports
  // ============================================

  async getReports(siteId: SiteId): Promise<SludgeReport[]> {
    const { data, error } = await this.supabase
      .from('sludge_reports')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get reports: ${error.message}`);
    return (data || []).map(this.mapReport);
  }

  async getReportById(id: string): Promise<SludgeReport | null> {
    const { data, error } = await this.supabase
      .from('sludge_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get report: ${error.message}`);
    }
    return data ? this.mapReport(data) : null;
  }

  async saveReport(report: Omit<SludgeReport, 'id' | 'createdAt'>): Promise<SludgeReport> {
    const reportId = `RPT-${report.siteId}-${Date.now()}`;
    const { data, error } = await this.supabase
      .from('sludge_reports')
      .insert({
        id: reportId,
        site_id: report.siteId,
        report_type: report.reportType,
        period_start: report.periodStart,
        period_end: report.periodEnd,
        status: report.status,
        data: report.data,
        file_url: report.fileUrl,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save report: ${error.message}`);
    return this.mapReport(data);
  }

  async updateReportStatus(id: string, status: string): Promise<SludgeReport> {
    const { data, error } = await this.supabase
      .from('sludge_reports')
      .update({ status, submitted_at: status === 'submitted' ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update report status: ${error.message}`);
    return this.mapReport(data);
  }

  // ============================================
  // Alerts
  // ============================================

  async getAlertsBySite(siteId: SiteId): Promise<SensorAlert[]> {
    const { data, error } = await this.supabase
      .from('sludge_alerts')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) {
      // 테이블이 없으면 빈 배열 반환
      if (error.code === '42P01') return [];
      throw new Error(`Failed to get alerts: ${error.message}`);
    }
    return (data || []).map(this.mapAlert);
  }

  async getAlertsSince(since: Date): Promise<SensorAlert[]> {
    const { data, error } = await this.supabase
      .from('sludge_alerts')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') return [];
      throw new Error(`Failed to get alerts: ${error.message}`);
    }
    return (data || []).map(this.mapAlert);
  }

  async createAlert(alert: Omit<SensorAlert, 'id' | 'createdAt'>): Promise<SensorAlert> {
    const { data, error } = await this.supabase
      .from('sludge_alerts')
      .insert({
        site_id: alert.siteId,
        sensor_id: alert.sensorId,
        type: alert.type,
        message: alert.message,
        value: alert.value,
        threshold: alert.threshold,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create alert: ${error.message}`);
    return this.mapAlert(data);
  }

  async acknowledgeAlert(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('sludge_alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to acknowledge alert: ${error.message}`);
  }

  // ============================================
  // Thresholds
  // ============================================

  async getThresholdsBySensorIds(sensorIds: SensorId[]): Promise<Record<string, SensorThreshold>> {
    if (sensorIds.length === 0) return {};

    const { data, error } = await this.supabase
      .from('sludge_thresholds')
      .select('*')
      .in('sensor_id', sensorIds);

    if (error) {
      // 테이블이 없으면 빈 객체 반환
      if (error.code === '42P01') return {};
      throw new Error(`Failed to get thresholds: ${error.message}`);
    }

    const result: Record<string, SensorThreshold> = {};
    for (const row of data || []) {
      result[row.sensor_id] = {
        min: row.min_value,
        max: row.max_value,
        warningMin: row.warning_min,
        warningMax: row.warning_max,
      };
    }
    return result;
  }

  async setThreshold(sensorId: SensorId, threshold: SensorThreshold): Promise<void> {
    const { error } = await this.supabase
      .from('sludge_thresholds')
      .upsert({
        sensor_id: sensorId,
        min_value: threshold.min,
        max_value: threshold.max,
        warning_min: threshold.warningMin,
        warning_max: threshold.warningMax,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'sensor_id' });

    if (error) throw new Error(`Failed to set threshold: ${error.message}`);
  }

  // ============================================
  // Mappers (DatabaseRow → Entity)
  // ============================================

  private mapAlert(row: DatabaseRow): SensorAlert {
    return {
      id: row.id as string,
      siteId: row.site_id as SiteId,
      sensorId: row.sensor_id as SensorId,
      type: row.type as 'warning' | 'error',
      message: row.message as string,
      value: row.value as number,
      threshold: row.threshold as number,
      acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at as string) : undefined,
      createdAt: new Date(row.created_at as string),
    };
  }

  private mapSite(row: DatabaseRow): SludgeSite {
    return {
      id: row.id as SiteId,
      name: row.name as string,
      type: row.type as SiteType,
      address: row.address as string | undefined,
      latitude: row.latitude as number | undefined,
      longitude: row.longitude as number | undefined,
      capacityM3Day: row.capacity_m3_day as number | undefined,
      organizationId: row.organization_id as string | undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date((row.updated_at || row.created_at) as string),
    };
  }

  private mapSensor(row: DatabaseRow): SludgeSensor {
    return {
      id: row.id as SensorId,
      siteId: row.site_id as SiteId,
      name: row.name as string,
      type: row.type as SensorType,
      model: row.model as string | undefined,
      protocol: (row.protocol || 'modbus_rtu') as SensorProtocol,
      address: row.address as number | undefined,
      register: row.register as number | undefined,
      scale: row.scale as number | undefined,
      unit: row.unit as string,
      isActive: row.is_active as boolean,
      lastReading: row.last_reading ? new Date(row.last_reading as string) : undefined,
      createdAt: new Date(row.created_at as string),
    };
  }

  private mapReading(row: DatabaseRow): SludgeReading {
    return {
      id: row.id as ReadingId,
      time: new Date(row.time as string),
      siteId: row.site_id as SiteId,
      sensorId: row.sensor_id as SensorId,
      value: row.value as number,
      unit: row.unit as string,
      quality: (row.quality as number) ?? 100,
    };
  }

  private mapPrediction(row: DatabaseRow): SludgePrediction {
    return {
      id: row.id as PredictionId,
      siteId: row.site_id as SiteId,
      predictionType: row.prediction_type as PredictionType,
      predictedAt: new Date(row.predicted_at as string),
      targetDate: new Date(row.target_date as string),
      predictedValue: row.predicted_value as number,
      confidenceLow: row.confidence_low as number | undefined,
      confidenceHigh: row.confidence_high as number | undefined,
      actualValue: row.actual_value as number | undefined,
      modelVersion: (row.model_version as string) || 'v1.0',
    };
  }

  private mapReport(row: DatabaseRow): SludgeReport {
    return {
      id: row.id as ReportId,
      siteId: row.site_id as SiteId,
      reportType: row.report_type as ReportType,
      periodStart: new Date(row.period_start as string),
      periodEnd: new Date(row.period_end as string),
      status: row.status as ReportStatus,
      data: (row.data || {}) as ReportData,
      fileUrl: row.file_url as string | undefined,
      submittedAt: row.submitted_at ? new Date(row.submitted_at as string) : undefined,
      createdAt: new Date(row.created_at as string),
    };
  }
}

// Singleton instance
let repositoryInstance: SludgeRepository | null = null;

export function getSludgeRepository(): ISludgeRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SludgeRepository();
  }
  return repositoryInstance;
}
