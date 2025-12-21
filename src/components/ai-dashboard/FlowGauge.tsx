'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { EChartsOption } from 'echarts';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-neutral-800 rounded" />,
});

interface FlowGaugeProps {
  value: number;
  max: number;
  unit: string;
  label: string;
  status: 'normal' | 'warning' | 'critical';
}

const FlowGauge: React.FC<FlowGaugeProps> = ({
  value,
  max,
  unit,
  label,
  status,
}) => {
  const getStatusColor = (): string => {
    switch (status) {
      case 'critical':
        return '#171717'; // neutral-900 - 위험: 어두움 (강조)
      case 'warning':
        return '#525252'; // neutral-600 - 경고: 중간
      case 'normal':
      default:
        return '#a3a3a3'; // neutral-400 - 정상: 밝음
    }
  };

  const option: EChartsOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [1, '#404040'], // neutral-700 background
            ],
          },
        },
        pointer: {
          itemStyle: {
            color: getStatusColor(),
          },
          width: 4,
          length: '70%',
        },
        axisTick: {
          distance: -24,
          length: 6,
          lineStyle: {
            color: '#525252', // neutral-600
            width: 1,
          },
        },
        splitLine: {
          distance: -28,
          length: 12,
          lineStyle: {
            color: '#737373', // neutral-500
            width: 2,
          },
        },
        axisLabel: {
          color: '#a3a3a3', // neutral-400
          distance: 30,
          fontSize: 11,
          formatter: (val: number) => {
            if (val === 0 || val === max) return String(val);
            return '';
          },
        },
        detail: {
          valueAnimation: true,
          formatter: `{value} ${unit}`,
          color: '#e5e5e5', // neutral-200
          fontSize: 20,
          fontWeight: 'bold',
          offsetCenter: [0, '80%'],
        },
        title: {
          show: true,
          offsetCenter: [0, '100%'],
          color: '#a3a3a3', // neutral-400
          fontSize: 13,
        },
        data: [
          {
            value,
            name: label,
          },
        ],
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            color: getStatusColor(),
          },
        },
      },
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
  };

  return (
    <div className="w-full h-48" role="img" aria-label={`${label} gauge showing ${value} ${unit} out of ${max} ${unit}, status: ${status}`}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default FlowGauge;
