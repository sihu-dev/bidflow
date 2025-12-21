'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AnimatedMetric } from '@/components/ai-dashboard/AnimatedMetric';
import { AnomalyAlert } from '@/components/ai-dashboard/AnomalyAlert';
import { demoDataByProduct, type ProductTab } from '@/constants/ai-dashboard-demo-data';

const FlowGauge = dynamic(() => import('@/components/ai-dashboard/FlowGauge'), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-neutral-100 rounded" />,
});

const SludgeMap = dynamic(
  () => import('@/components/ai-dashboard/SludgeMap').then((mod) => ({ default: mod.SludgeMap })),
  {
    ssr: false,
    loading: () => <div className="h-full animate-pulse bg-neutral-100 rounded" />,
  }
);

export default function AIDashboardPage() {
  const [activeTab, setActiveTab] = useState<ProductTab>('UR-1010PLUS');

  // Memoize current data to prevent unnecessary recalculations
  const currentData = useMemo(() => demoDataByProduct[activeTab], [activeTab]);

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">AI Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-600">
              CMNTech Flow Meter Monitoring System
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500" aria-live="polite">
            <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" aria-hidden="true" />
            <span>Live Data</span>
            <span className="sr-only">Dashboard is receiving live data updates</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-neutral-200" role="tablist" aria-label="Product selection">
          {(['UR-1010PLUS', 'SL-3000PLUS', 'EnerRay'] as ProductTab[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-neutral-900 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Layout */}
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {/* Left Column - Map */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="h-[400px] md:h-[600px]">
              <SludgeMap />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:col-span-2 lg:col-span-2">
            {/* Gauge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentData.gauges.map((gauge, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <FlowGauge
                    label={gauge.label}
                    value={gauge.value}
                    max={gauge.max}
                    unit={gauge.unit}
                    status={gauge.status}
                  />
                </div>
              ))}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentData.metrics.map((metric, idx) => (
                <AnimatedMetric
                  key={idx}
                  label={metric.label}
                  value={metric.value}
                  previousValue={metric.previousValue}
                  unit={metric.unit}
                  trend={metric.trend}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Anomaly Alerts
          </h2>
          <AnomalyAlert alerts={currentData.alerts} />
        </div>
      </div>
    </div>
  );
}
