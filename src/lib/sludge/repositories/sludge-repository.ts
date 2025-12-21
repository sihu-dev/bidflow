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
} from '../entities';

// ============================================
// Repository Interface
// ============================================

export interface ISludgeRepository {
  // Sites
  getSites(): Promise<SludgeSite[]>;
  getSiteById(id: SiteId): Promise<SludgeSite | null>;
  createSite(dto: CreateSiteDto): Promise<SludgeSite>;
  updateSite(id: SiteId, dto: Partial<CreateSiteDto>): Promise<SludgeSite>;
  deleteSite(id: SiteId): Promise<void>;

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
  // Mappers
  // ============================================

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapSite(row: any): SludgeSite {
    return {
      id: row.id as SiteId,
      name: row.name,
      type: row.type,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      capacityM3Day: row.capacity_m3_day,
      organizationId: row.organization_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at || row.created_at),
    };
  }

  private mapSensor(row: any): SludgeSensor {
    return {
      id: row.id as SensorId,
      siteId: row.site_id as SiteId,
      name: row.name,
      type: row.type,
      model: row.model,
      protocol: row.protocol,
      address: row.address,
      register: row.register,
      scale: row.scale,
      unit: row.unit,
      isActive: row.is_active,
      lastReading: row.last_reading ? new Date(row.last_reading) : undefined,
      createdAt: new Date(row.created_at),
    };
  }

  private mapReading(row: any): SludgeReading {
    return {
      id: row.id as ReadingId,
      time: new Date(row.time),
      siteId: row.site_id as SiteId,
      sensorId: row.sensor_id as SensorId,
      value: row.value,
      unit: row.unit,
      quality: row.quality,
    };
  }

  private mapPrediction(row: any): SludgePrediction {
    return {
      id: row.id as PredictionId,
      siteId: row.site_id as SiteId,
      predictionType: row.prediction_type,
      predictedAt: new Date(row.predicted_at),
      targetDate: new Date(row.target_date),
      predictedValue: row.predicted_value,
      confidenceLow: row.confidence_low,
      confidenceHigh: row.confidence_high,
      actualValue: row.actual_value,
      modelVersion: row.model_version,
    };
  }

  private mapReport(row: any): SludgeReport {
    return {
      id: row.id as ReportId,
      siteId: row.site_id as SiteId,
      reportType: row.report_type,
      periodStart: new Date(row.period_start),
      periodEnd: new Date(row.period_end),
      status: row.status,
      data: row.data,
      fileUrl: row.file_url,
      submittedAt: row.submitted_at ? new Date(row.submitted_at) : undefined,
      createdAt: new Date(row.created_at),
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

// Singleton instance
let repositoryInstance: SludgeRepository | null = null;

export function getSludgeRepository(): ISludgeRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SludgeRepository();
  }
  return repositoryInstance;
}
