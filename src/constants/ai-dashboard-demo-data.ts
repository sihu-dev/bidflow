/**
 * @module ai-dashboard-demo-data
 * @description Demo data for AI Dashboard (separated for bundle optimization)
 */

export type ProductTab = 'UR-1010PLUS' | 'SL-3000PLUS' | 'EnerRay';

export interface GaugeData {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface MetricData {
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface AlertData {
  id: string;
  type: 'clog_detected' | 'leak_detected' | 'efficiency_drop' | 'sensor_offline';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestedAction: string;
  timestamp: Date;
  sensorId: string;
}

export interface DemoData {
  gauges: GaugeData[];
  metrics: MetricData[];
  alerts: AlertData[];
}

export const demoDataByProduct: Record<ProductTab, DemoData> = {
  'UR-1010PLUS': {
    gauges: [
      { label: 'Flow Rate', value: 245, max: 500, unit: 'm³/h', status: 'normal' },
      { label: 'Pressure', value: 3.2, max: 10, unit: 'bar', status: 'normal' },
      { label: 'Temperature', value: 28, max: 100, unit: '°C', status: 'normal' },
      { label: 'Efficiency', value: 87, max: 100, unit: '%', status: 'warning' },
    ],
    metrics: [
      { label: 'Total Volume', value: 12450, previousValue: 12100, unit: 'm³', trend: 'up' },
      { label: 'Avg Flow', value: 242, previousValue: 238, unit: 'm³/h', trend: 'up' },
      { label: 'Uptime', value: 99.2, previousValue: 99.5, unit: '%', trend: 'down' },
      { label: 'Energy', value: 145, previousValue: 148, unit: 'kWh', trend: 'down' },
    ],
    alerts: [
      {
        id: 'ur-1',
        type: 'efficiency_drop',
        severity: 'warning',
        message: 'Efficiency dropped below 90% threshold in Zone C',
        suggestedAction: 'Check filter condition and perform maintenance',
        timestamp: new Date(Date.now() - 15 * 60000),
        sensorId: 'UR-1010-Z3',
      },
    ],
  },
  'SL-3000PLUS': {
    gauges: [
      { label: 'Flow Rate', value: 420, max: 800, unit: 'm³/h', status: 'normal' },
      { label: 'Pressure', value: 5.8, max: 15, unit: 'bar', status: 'normal' },
      { label: 'Temperature', value: 32, max: 100, unit: '°C', status: 'normal' },
      { label: 'Efficiency', value: 92, max: 100, unit: '%', status: 'normal' },
    ],
    metrics: [
      { label: 'Total Volume', value: 28900, previousValue: 28200, unit: 'm³', trend: 'up' },
      { label: 'Avg Flow', value: 418, previousValue: 405, unit: 'm³/h', trend: 'up' },
      { label: 'Uptime', value: 99.8, previousValue: 99.7, unit: '%', trend: 'up' },
      { label: 'Energy', value: 320, previousValue: 315, unit: 'kWh', trend: 'up' },
    ],
    alerts: [],
  },
  EnerRay: {
    gauges: [
      { label: 'Flow Rate', value: 156, max: 300, unit: 'm³/h', status: 'critical' },
      { label: 'Pressure', value: 2.1, max: 8, unit: 'bar', status: 'warning' },
      { label: 'Temperature', value: 45, max: 100, unit: '°C', status: 'warning' },
      { label: 'Efficiency', value: 68, max: 100, unit: '%', status: 'critical' },
    ],
    metrics: [
      { label: 'Total Volume', value: 7820, previousValue: 8100, unit: 'm³', trend: 'down' },
      { label: 'Avg Flow', value: 152, previousValue: 178, unit: 'm³/h', trend: 'down' },
      { label: 'Uptime', value: 94.2, previousValue: 97.5, unit: '%', trend: 'down' },
      { label: 'Energy', value: 98, previousValue: 92, unit: 'kWh', trend: 'up' },
    ],
    alerts: [
      {
        id: 'en-1',
        type: 'clog_detected',
        severity: 'critical',
        message: 'Potential clog detected in Zone B - flow rate 60% below normal',
        suggestedAction: 'Immediate inspection required. Stop operation and check inlet pipe',
        timestamp: new Date(Date.now() - 5 * 60000),
        sensorId: 'EN-3000-Z2',
      },
      {
        id: 'en-2',
        type: 'efficiency_drop',
        severity: 'critical',
        message: 'Critical efficiency drop across all zones',
        suggestedAction: 'Schedule emergency maintenance and system calibration',
        timestamp: new Date(Date.now() - 25 * 60000),
        sensorId: 'EN-3000-MAIN',
      },
      {
        id: 'en-3',
        type: 'leak_detected',
        severity: 'warning',
        message: 'Minor pressure fluctuation detected in Zone C',
        suggestedAction: 'Monitor for next 2 hours, check seals if persists',
        timestamp: new Date(Date.now() - 45 * 60000),
        sensorId: 'EN-3000-Z3',
      },
    ],
  },
};
