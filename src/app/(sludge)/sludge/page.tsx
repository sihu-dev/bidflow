'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Gauge,
  Settings,
  Plus,
  RefreshCw,
  TrendingUp,
  Droplets,
  Thermometer,
  Zap,
  Package,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface Site {
  id: string;
  name: string;
  type: string;
  address?: string;
  capacityM3Day?: number;
  status: 'online' | 'offline' | 'warning';
  sensorsCount: number;
  alertsCount: number;
}

interface DashboardStats {
  totalSites: number;
  activeSensors: number;
  alertsToday: number;
  avgEfficiency: number;
}

// ============================================
// API Functions
// ============================================

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch('/api/v1/sludge/stats', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stats');
  const json = await res.json();
  return json.data;
}

async function fetchSites(): Promise<Site[]> {
  const res = await fetch('/api/v1/sludge/sites', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch sites');
  const json = await res.json();
  return json.data.map((site: any) => ({
    ...site,
    status: 'online' as const, // TODO: 실제 상태 계산
    sensorsCount: 0, // TODO: 센서 카운트
    alertsCount: 0, // TODO: 알림 카운트
  }));
}

// ============================================
// Components
// ============================================

function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-neutral-100 rounded-lg">
          <Icon className="h-5 w-5 text-neutral-600" />
        </div>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.positive ? 'text-neutral-900' : 'text-neutral-500'
            }`}
          >
            {trend.positive ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-neutral-500">{title}</p>
        <p className="text-2xl font-semibold text-neutral-900">
          {value}
          {unit && <span className="text-sm font-normal text-neutral-500 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

function SiteCard({ site }: { site: Site }) {
  const statusColors = {
    online: 'bg-neutral-900',
    offline: 'bg-neutral-300',
    warning: 'bg-neutral-600',
  };

  const typeLabels: Record<string, string> = {
    public_wwtp: '공공 하수처리장',
    private_wwtp: '민간 폐수처리',
    biogas: '바이오가스 시설',
    industrial: '산업 처리장',
  };

  return (
    <Link
      href={`/sludge/monitoring?site=${site.id}`}
      className="block bg-white rounded-lg border border-neutral-200 p-6 hover:border-neutral-400 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusColors[site.status]}`} />
            <h3 className="font-semibold text-neutral-900">{site.name}</h3>
          </div>
          <p className="text-sm text-neutral-500 mt-1">{typeLabels[site.type]}</p>
          {site.address && (
            <p className="text-sm text-neutral-400 mt-1">{site.address}</p>
          )}
        </div>
        <Droplets className="h-8 w-8 text-neutral-300" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-semibold text-neutral-900">{site.sensorsCount}</p>
          <p className="text-xs text-neutral-500">센서</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-neutral-900">
            {site.capacityM3Day ? `${(site.capacityM3Day / 1000).toFixed(0)}K` : '-'}
          </p>
          <p className="text-xs text-neutral-500">용량(m³/일)</p>
        </div>
        <div>
          <p className={`text-lg font-semibold ${site.alertsCount > 0 ? 'text-neutral-900' : 'text-neutral-400'}`}>
            {site.alertsCount}
          </p>
          <p className="text-xs text-neutral-500">알림</p>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-neutral-200 hover:border-neutral-400 transition-colors"
    >
      <div className="p-3 bg-neutral-100 rounded-lg">
        <Icon className="h-5 w-5 text-neutral-600" />
      </div>
      <div>
        <p className="font-medium text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
    </Link>
  );
}

// ============================================
// Main Page
// ============================================

export default function SludgeDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 0,
    activeSensors: 0,
    alertsToday: 0,
    avgEfficiency: 0,
  });
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsData, sitesData] = await Promise.all([fetchStats(), fetchSites()]);
      setStats(statsData);
      setSites(sitesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('[Sludge Dashboard]', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Droplets className="h-8 w-8 text-neutral-900" />
                <span className="text-xl font-bold text-neutral-900">SludgeAI Pro</span>
              </Link>
              <span className="text-sm text-neutral-400 hidden sm:inline">by 씨엠엔텍</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/sludge/monitoring"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                모니터링
              </Link>
              <Link
                href="/sludge/predictions"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                AI 예측
              </Link>
              <Link
                href="/sludge/reports"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                보고서
              </Link>
              <Link
                href="/sludge/products"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                제품
              </Link>
              <Link
                href="/sludge/settings"
                className="p-2 text-neutral-600 hover:text-neutral-900"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">대시보드</h1>
            <p className="text-neutral-500 mt-1">슬러지 처리 시설 통합 모니터링</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
            <Link
              href="/sludge/settings/sites/new"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              시설 추가
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="등록 시설"
            value={stats.totalSites}
            unit="개소"
            icon={Activity}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="활성 센서"
            value={stats.activeSensors}
            unit="개"
            icon={Gauge}
          />
          <StatCard
            title="오늘 알림"
            value={stats.alertsToday}
            unit="건"
            icon={AlertTriangle}
          />
          <StatCard
            title="평균 효율"
            value={stats.avgEfficiency.toFixed(1)}
            unit="%"
            icon={TrendingUp}
            trend={{ value: 2.3, positive: true }}
          />
        </div>

        {/* Sites Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">등록 시설</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">빠른 실행</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              title="실시간 모니터링"
              description="센서 데이터 실시간 확인"
              icon={Activity}
              href="/sludge/monitoring"
            />
            <QuickAction
              title="AI 예측"
              description="슬러지/바이오가스 예측"
              icon={BarChart3}
              href="/sludge/predictions"
            />
            <QuickAction
              title="보고서 생성"
              description="정책 보고서 자동 작성"
              icon={TrendingUp}
              href="/sludge/reports"
            />
            <QuickAction
              title="센서 설정"
              description="유량계/센서 관리"
              icon={Settings}
              href="/sludge/settings"
            />
            <QuickAction
              title="제품 카탈로그"
              description="씨엠엔텍 유량계 사양"
              icon={Package}
              href="/sludge/products"
            />
          </div>
        </section>

        {/* Footer Info */}
        <footer className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <div className="flex items-center gap-4">
              <span>씨엠엔텍 유량계 연동</span>
              <span className="text-neutral-300">|</span>
              <span>UR-1010PLUS, SL-3000PLUS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-neutral-900 rounded-full" />
              <span>시스템 정상 운영 중</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
