'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { MetricCard } from '@/components/ui/MetricCard'

/**
 * CMNTECH AI 유량계 진단 대시보드
 * HEPHAITOS 디자인 시스템 적용
 */
export default function CMNTechDashboard() {
  // Mock 유량계 데이터
  const flowMeters = [
    { id: 'UR-1010PLUS', name: 'UR-1010PLUS', status: '정상', clogProb: 5, leakDetected: false, uptime: 99.8 },
    { id: 'MF-1000C', name: 'MF-1000C', status: '주의', clogProb: 35, leakDetected: false, uptime: 97.2 },
    { id: 'UR-1000PLUS', name: 'UR-1000PLUS', status: '정상', clogProb: 8, leakDetected: false, uptime: 99.5 },
    { id: 'SL-3000PLUS', name: 'SL-3000PLUS', status: '경고', clogProb: 72, leakDetected: true, uptime: 85.3 },
    { id: 'EnerRay', name: 'EnerRay', status: '정상', clogProb: 12, leakDetected: false, uptime: 98.9 },
  ]

  const totalDevices = flowMeters.length
  const avgClogProb = Math.round(flowMeters.reduce((sum, m) => sum + m.clogProb, 0) / totalDevices)
  const leakCount = flowMeters.filter(m => m.leakDetected).length
  const avgUptime = (flowMeters.reduce((sum, m) => sum + m.uptime, 0) / totalDevices).toFixed(1)

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:pl-52">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              CMNTECH AI 유량계 진단
            </h1>
            <p className="text-zinc-400">
              실시간 AI 기반 막힘 예측 및 누수 감지 시스템
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              label="전체 유량계"
              value={totalDevices.toString()}
              suffix="대"
              trend="neutral"
            />
            <MetricCard
              label="평균 막힘 확률"
              value={avgClogProb.toString()}
              suffix="%"
              trend={avgClogProb > 50 ? 'down' : avgClogProb > 30 ? 'neutral' : 'up'}
            />
            <MetricCard
              label="누수 감지"
              value={leakCount.toString()}
              suffix="건"
              trend={leakCount > 0 ? 'down' : 'up'}
            />
            <MetricCard
              label="평균 가동률"
              value={avgUptime}
              suffix="%"
              trend="up"
            />
          </div>

          {/* Device List */}
          <div className="card-cinematic p-6">
            <h2 className="text-xl font-semibold text-white mb-6">유량계 상태</h2>
            <div className="space-y-4">
              {flowMeters.map((meter) => (
                <div
                  key={meter.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{meter.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>막힘 확률: {meter.clogProb}%</span>
                      <span>가동률: {meter.uptime}%</span>
                      {meter.leakDetected && (
                        <span className="text-red-400">⚠ 누수 감지</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        meter.status === '정상'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : meter.status === '주의'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {meter.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
