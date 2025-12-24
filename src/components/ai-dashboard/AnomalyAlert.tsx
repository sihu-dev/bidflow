'use client';

import { FC, useCallback } from 'react';

interface AnomalyAlert {
  id: string;
  type: 'clog_detected' | 'leak_detected' | 'efficiency_drop' | 'sensor_offline';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestedAction: string;
  timestamp: Date;
  sensorId: string;
}

interface AnomalyAlertProps {
  alerts: AnomalyAlert[];
}

const severityConfig = {
  critical: {
    bgColor: 'bg-neutral-50',
    borderColor: 'border-neutral-900',
    textColor: 'text-neutral-900',
    badgeBg: 'bg-neutral-900',
    badgeText: 'text-white',
    label: 'CRITICAL',
  },
  warning: {
    bgColor: 'bg-neutral-50',
    borderColor: 'border-neutral-600',
    textColor: 'text-neutral-900',
    badgeBg: 'bg-neutral-600',
    badgeText: 'text-white',
    label: 'WARNING',
  },
  info: {
    bgColor: 'bg-neutral-50',
    borderColor: 'border-neutral-300',
    textColor: 'text-neutral-700',
    badgeBg: 'bg-neutral-500',
    badgeText: 'text-white',
    label: 'INFO',
  },
} as const;

const typeLabels = {
  clog_detected: 'Clog Detected',
  leak_detected: 'Leak Detected',
  efficiency_drop: 'Efficiency Drop',
  sensor_offline: 'Sensor Offline',
} as const;

export const AnomalyAlert: FC<AnomalyAlertProps> = ({ alerts }) => {
  // Memoize timestamp formatting function
  const formatTimestamp = useCallback((date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  return (
    <div className="space-y-4" data-testid="anomaly-alert">
      {/* Timeline SVG */}
      <div className="relative">
        <svg
          width="100%"
          height="60"
          className="mb-4"
          viewBox="0 0 800 60"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Alert timeline showing ${alerts.length} alerts`}
        >
          {/* Timeline base line */}
          <line
            x1="40"
            y1="30"
            x2="760"
            y2="30"
            stroke="currentColor"
            strokeWidth="2"
            className="text-neutral-300"
          />

          {/* Alert points */}
          {alerts.slice(0, 5).map((alert, index) => {
            const x = 40 + (index * 180);
            const colorClass = alert.severity === 'critical' ? '#171717' :
                              alert.severity === 'warning' ? '#525252' : '#737373';

            return (
              <g key={alert.id}>
                {/* Alert dot */}
                <circle
                  cx={x}
                  cy="30"
                  r="6"
                  fill={colorClass}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Pulse ring for critical */}
                {alert.severity === 'critical' && (
                  <circle
                    cx={x}
                    cy="30"
                    r="10"
                    fill="none"
                    stroke={colorClass}
                    strokeWidth="1"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="6"
                      to="15"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Timestamp label */}
                <text
                  x={x}
                  y="50"
                  textAnchor="middle"
                  className="text-xs fill-neutral-500"
                  fontSize="10"
                >
                  {formatTimestamp(alert.timestamp)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Alert list */}
      <div className="space-y-3" role="list" aria-label="Anomaly alerts">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];

          return (
            <div
              key={alert.id}
              className={`border-l-4 ${config.borderColor} ${config.bgColor} p-4 rounded-r-lg transition-all hover:shadow-md`}
              role="listitem"
              aria-label={`${config.label} alert: ${typeLabels[alert.type]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${config.badgeBg} ${config.badgeText}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">
                      {typeLabels[alert.type]}
                    </span>
                    <span className="text-xs text-neutral-500">
                      Sensor: {alert.sensorId}
                    </span>
                  </div>

                  {/* Message */}
                  <p className={`text-sm ${config.textColor} font-medium`}>
                    {alert.message}
                  </p>

                  {/* Suggested action */}
                  <div className="flex items-start gap-2 text-sm text-neutral-600">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{alert.suggestedAction}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-neutral-500 whitespace-nowrap">
                  {formatTimestamp(alert.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">No anomalies detected</p>
        </div>
      )}
    </div>
  );
};
