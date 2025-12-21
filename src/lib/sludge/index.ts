/**
 * Sludge AI Module - Public API
 * 슬러지 AI 모듈 공개 API
 */

// Entities & Types
export * from './entities';

// Repository
export { getSludgeRepository } from './repositories/sludge-repository';
export type { ISludgeRepository } from './repositories/sludge-repository';

// Use Cases
export {
  // Sites
  getAllSites,
  getSiteDetails,
  createNewSite,
  updateSiteInfo,
  removeSite,
  // Sensors
  getSiteSensors,
  addSensor,
  updateSensorConfig,
  removeSensor,
  // Readings
  getLatestSensorReadings,
  getSensorHistory,
  recordSensorReadings,
  // Predictions
  getSitePredictions,
  requestPrediction,
  // Reports
  getSiteReports,
  getReportDetails,
  generateReport,
  submitReport,
  // Dashboard
  getSiteDashboard,
  getMonitoringStats,
} from './usecases/sludge-usecases';
