'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Gauge,
  Thermometer,
  Droplets,
  Zap,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface SensorReading {
  sensorId: string;
  sensorName: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: Date;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'error';
}

interface SiteInfo {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline';
  lastUpdate: Date;
}

// ============================================
// API Functions
// ============================================

async function fetchSiteInfo(siteId: string): Promise<SiteInfo> {
  const res = await fetch(`/api/v1/sludge/sites/${siteId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch site info');
  const json = await res.json();
  return {
    id: json.data.id,
    name: json.data.name,
    type: json.data.type,
    status: 'online', // TODO: 실제 상태 계산
    lastUpdate: new Date(),
  };
}

async function fetchSensorReadings(siteId: string): Promise<SensorReading[]> {
  const res = await fetch(`/api/v1/sludge/sites/${siteId}/sensors`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch sensor readings');
  const json = await res.json();

  const sensors = json.data.sensors || [];
  const readings = json.data.readings || {};
  const alerts = json.data.alerts || [];

  return sensors.map((sensor: any) => {
    const reading = readings[sensor.id];
    const hasAlert = alerts.some((a: any) => a.sensorId === sensor.id);

    return {
      sensorId: sensor.id,
      sensorName: sensor.name,
      sensorType: sensor.type,
      value: reading ? reading.value : 0,
      unit: sensor.unit,
      timestamp: reading ? new Date(reading.timestamp) : new Date(),
      trend: 'stable' as const, // TODO: 트렌드 계산
      status: hasAlert ? 'warning' : 'normal',
    };
  });
}

// ============================================
// Components
// ============================================

function SensorCard({ reading }: { reading: SensorReading }) {
  const iconMap: Record<string, React.ElementType> = {
    flow_ur1010: Gauge,
    flow_sl3000: Gauge,
    flow_mf1000: Gauge,
    temperature: Thermometer,
    ph: Droplets,
    ss_concentration: Activity,
    power: Zap,
  };

  const Icon = iconMap[reading.sensorType] || Gauge;

  const statusStyles = {
    normal: 'border-neutral-200',
    warning: 'border-neutral-400 bg-neutral-50',
    error: 'border-neutral-900 bg-neutral-100',
  };

  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-neutral-600" />,
    down: <TrendingDown className="h-4 w-4 text-neutral-400" />,
    stable: <span className="w-4 h-0.5 bg-neutral-300" />,
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${statusStyles[reading.status]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-100 rounded-lg">
            <Icon className="h-5 w-5 text-neutral-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-900">{reading.sensorName}</p>
            <p className="text-xs text-neutral-500">{reading.sensorType}</p>
          </div>
        </div>
        {reading.status === 'warning' && (
          <AlertTriangle className="h-5 w-5 text-neutral-600" />
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-neutral-900">{reading.value}</span>
          <span className="text-sm text-neutral-500 mb-1">{reading.unit}</span>
          <span className="ml-auto mb-1">{trendIcon[reading.trend]}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
        <Clock className="h-3 w-3" />
        <span>
          {reading.timestamp.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

function LiveIndicator({ isLive }: { isLive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          isLive ? 'bg-neutral-900 animate-pulse' : 'bg-neutral-300'
        }`}
      />
      <span className="text-sm text-neutral-600">
        {isLive ? '실시간' : '오프라인'}
      </span>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

function MonitoringContent() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('site') || 'site-001';

  const [site, setSite] = useState<SiteInfo | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [siteId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [siteData, readingsData] = await Promise.all([
        fetchSiteInfo(siteId),
        fetchSensorReadings(siteId),
      ]);
      setSite(siteData);
      setReadings(readingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('[Monitoring]', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 자동 새로고침 (5초마다)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const readingsData = await fetchSensorReadings(siteId);
        setReadings(readingsData);
      } catch (err) {
        console.error('[Auto Refresh]', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, siteId]);

  const handleRefresh = async () => {
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-900 font-medium mb-2">데이터 로드 실패</p>
          <p className="text-neutral-500">{error || '사이트를 찾을 수 없습니다'}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/sludge"
                className="p-2 text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-semibold text-neutral-900">{site.name}</h1>
                <p className="text-sm text-neutral-500">실시간 모니터링</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LiveIndicator isLive={isLive} />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-neutral-300"
                />
                <span className="text-neutral-600">자동 새로고침</span>
              </label>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                <RefreshCw className="h-4 w-4" />
                새로고침
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sensor Grid */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            센서 현황
            <span className="text-sm font-normal text-neutral-500 ml-2">
              ({readings.length}개)
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readings.map((reading) => (
              <SensorCard key={reading.sensorId} reading={reading} />
            ))}
          </div>
        </section>

        {/* Chart Placeholder */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            유량 트렌드 (24시간)
          </h2>
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="h-64 flex items-center justify-center text-neutral-400">
              {/* TODO: ECharts 또는 Recharts로 그래프 구현 */}
              <p>차트 영역 (추후 구현)</p>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            최근 알림
          </h2>
          <div className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100">
            <div className="p-4 flex items-center gap-4">
              <AlertTriangle className="h-5 w-5 text-neutral-600" />
              <div className="flex-1">
                <p className="font-medium text-neutral-900">SS 농도 상한 경고</p>
                <p className="text-sm text-neutral-500">185 mg/L &gt; 150 mg/L 임계값</p>
              </div>
              <span className="text-sm text-neutral-400">5분 전</span>
            </div>
            <div className="p-4 flex items-center gap-4">
              <Activity className="h-5 w-5 text-neutral-400" />
              <div className="flex-1">
                <p className="font-medium text-neutral-900">유량 정상 복귀</p>
                <p className="text-sm text-neutral-500">UR-1010PLUS #1 정상 범위 진입</p>
              </div>
              <span className="text-sm text-neutral-400">1시간 전</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center">로딩 중...</div>}>
      <MonitoringContent />
    </Suspense>
  );
}
