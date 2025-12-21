# CMNTech AI 대시보드 시각화 기술 스택

> **목적**: 유량계 슬러지/IoT 센서 대시보드용 인터랙티브 시각화
> **작성일**: 2025-12-21
> **기준**: 무료/오픈소스 우선, 모노크롬 디자인 호환

---

## 1. 지도 라이브러리 (Mapbox 대안)

### 최종 권장: **MapLibre GL JS** + **React-Leaflet**

| 라이브러리 | 라이선스 | 번들 크기 | WebGL | 벡터타일 | IoT 적합성 | 추천도 |
|------------|----------|-----------|-------|----------|------------|--------|
| **MapLibre GL JS** | BSD-3 | ~200KB | ✅ | ✅ | ⭐⭐⭐⭐⭐ | **1순위** |
| **Leaflet** | BSD-2 | ~40KB | ❌ | ❌ | ⭐⭐⭐⭐ | 2순위 |
| OpenLayers | BSD-2 | ~300KB | ✅ | ✅ | ⭐⭐⭐ | 3순위 |
| Deck.gl | MIT | ~500KB | ✅ | ✅ | ⭐⭐⭐⭐ | 대규모 전용 |
| CesiumJS | Apache-2 | ~2MB | ✅ | ✅ | ⭐⭐⭐ | 3D 전용 |

### MapLibre GL JS 선택 이유

```yaml
장점:
  - Mapbox GL JS v1 오픈소스 포크 (BSD-3 라이선스)
  - WebGL 기반 고성능 렌더링
  - 벡터 타일 지원 (동적 스타일링)
  - 대규모 센서 데이터 처리 가능
  - 모노크롬 테마 완벽 커스터마이징

무료 타일 소스:
  - OpenStreetMap (기본)
  - Stadia Maps (월 50만 요청 무료)
  - Protomaps (자체 호스팅)
  - Maptiler (월 10만 무료)

React 통합:
  - react-map-gl (Uber 유지)
  - @vis.gl/react-google-maps 호환
```

### 슬러지 유량계 맵 구현 코드

```tsx
// src/components/dashboard/SludgeMap.tsx
'use client';

import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface SensorLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'UR-1010PLUS' | 'SL-3000PLUS' | 'EnerRay';
  status: 'normal' | 'warning' | 'critical';
  value: number;
}

export function SludgeMap({ sensors }: { sensors: SensorLocation[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            // 모노크롬 필터 적용
            paint: {
              'raster-saturation': -1, // 흑백
              'raster-contrast': 0.1
            }
          }
        ]
      },
      center: [127.0, 37.5], // 한국 중심
      zoom: 7
    });

    // 센서 마커 추가
    sensors.forEach(sensor => {
      const el = document.createElement('div');
      el.className = `sensor-marker sensor-${sensor.status}`;

      new maplibregl.Marker(el)
        .setLngLat([sensor.lng, sensor.lat])
        .setPopup(
          new maplibregl.Popup().setHTML(`
            <div class="p-2">
              <strong>${sensor.name}</strong>
              <p>${sensor.type}: ${sensor.value}</p>
            </div>
          `)
        )
        .addTo(map.current!);
    });

    return () => map.current?.remove();
  }, [sensors]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] rounded-lg border border-neutral-200"
    />
  );
}
```

---

## 2. 차트 라이브러리

### 최종 권장: **Recharts** + **ECharts** (하이브리드)

| 라이브러리 | 라이선스 | 번들 크기 | 실시간 | 게이지 | 스파크라인 | 추천도 |
|------------|----------|-----------|--------|--------|------------|--------|
| **Recharts** | MIT | ~60KB | ✅ | ❌ | ✅ | **기본** |
| **ECharts** | Apache-2 | ~400KB | ✅ | ✅ | ✅ | **고급** |
| Chart.js | MIT | ~65KB | ✅ | ❌ | ✅ | 대안 |
| ApexCharts | MIT | ~120KB | ✅ | ✅ | ✅ | 대안 |
| Tremor | Apache-2 | ~80KB | ✅ | ❌ | ✅ | Tailwind |
| Nivo | MIT | ~150KB | ⚠️ | ❌ | ✅ | D3 기반 |
| Highcharts | 유료 | ~300KB | ✅ | ✅ | ✅ | 상용 전용 |

### 하이브리드 전략

```yaml
Recharts (기본):
  - 단순 라인/바/에어리어 차트
  - React 네이티브 (선언적)
  - 번들 최적화

ECharts (고급):
  - 게이지 미터
  - 히트맵
  - 대용량 실시간 데이터
  - WebGL 가속
```

### 실시간 게이지 컴포넌트

```tsx
// src/components/dashboard/FlowGauge.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-neutral-100" />
});

interface FlowGaugeProps {
  value: number;
  max: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

export function FlowGauge({ value, max, unit, status }: FlowGaugeProps) {
  const getColor = () => {
    // 모노크롬 스타일
    switch (status) {
      case 'critical': return '#171717'; // neutral-900
      case 'warning': return '#525252';  // neutral-600
      default: return '#a3a3a3';         // neutral-400
    }
  };

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: max,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [value / max, getColor()],
              [1, '#e5e5e5']
            ]
          }
        },
        pointer: {
          show: true,
          length: '60%',
          width: 4,
          itemStyle: { color: '#171717' }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          distance: -30,
          color: '#525252',
          fontSize: 10
        },
        detail: {
          valueAnimation: true,
          formatter: `{value} ${unit}`,
          color: '#171717',
          fontSize: 20,
          offsetCenter: [0, '40%']
        },
        data: [{ value }]
      }
    ]
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <ReactECharts
        option={option}
        style={{ height: 200 }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}
```

---

## 3. 실시간 데이터 기술

### 최종 권장: **Supabase Realtime** (기존 스택 활용)

| 기술 | 지연시간 | 확장성 | Next.js 호환 | 비용 | 추천도 |
|------|----------|--------|--------------|------|--------|
| **Supabase Realtime** | ~100ms | ⭐⭐⭐⭐ | ✅ | 무료 티어 | **1순위** |
| WebSocket | ~50ms | ⭐⭐⭐ | ✅ | 서버 필요 | 2순위 |
| SSE | ~100ms | ⭐⭐⭐ | ✅ | 서버 필요 | 3순위 |
| Socket.io | ~80ms | ⭐⭐⭐⭐ | ⚠️ | 서버 필요 | 대안 |
| MQTT | ~20ms | ⭐⭐⭐⭐⭐ | ⚠️ | IoT 전용 | Edge 전용 |

### Supabase Realtime 훅

```typescript
// src/hooks/useRealtimeSensor.ts
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useRealtimeSensor(sensorId: string) {
  const [data, setData] = useState<SensorReading | null>(null);

  useEffect(() => {
    // 초기 데이터 로드
    supabase
      .from('sensor_readings')
      .select('*')
      .eq('sensor_id', sensorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setData(data));

    // 실시간 구독
    const channel = supabase
      .channel(`sensor:${sensorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          filter: `sensor_id=eq.${sensorId}`
        },
        (payload) => setData(payload.new as SensorReading)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sensorId]);

  return data;
}
```

---

## 4. 애니메이션 라이브러리

### 최종 권장: **Framer Motion**

| 라이브러리 | 번들 크기 | React 통합 | 성능 | 학습 곡선 | 추천도 |
|------------|-----------|------------|------|-----------|--------|
| **Framer Motion** | ~30KB | ✅ 네이티브 | ⭐⭐⭐⭐ | 낮음 | **1순위** |
| React Spring | ~25KB | ✅ 네이티브 | ⭐⭐⭐⭐⭐ | 중간 | 2순위 |
| GSAP | ~60KB | ⚠️ 래퍼 필요 | ⭐⭐⭐⭐⭐ | 높음 | 프로 전용 |
| Lottie | ~50KB | ⚠️ JSON 필요 | ⭐⭐⭐ | 낮음 | 아이콘 전용 |
| Auto Animate | ~5KB | ✅ | ⭐⭐⭐ | 최저 | 간단한 용도 |

### 실시간 데이터 전환 애니메이션

```tsx
// src/components/dashboard/AnimatedMetric.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedMetricProps {
  value: number;
  label: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export function AnimatedMetric({ value, label, unit, trend }: AnimatedMetricProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <p className="text-sm text-neutral-600">{label}</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-baseline gap-2"
        >
          <span className="text-3xl font-bold text-neutral-900">
            {value.toLocaleString()}
          </span>
          <span className="text-neutral-500">{unit}</span>
          <motion.span
            animate={{
              rotate: trend === 'up' ? -45 : trend === 'down' ? 45 : 0
            }}
            className="text-neutral-600"
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </motion.span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

---

## 5. 3D 시각화 (선택적)

### 권장: **React Three Fiber** (Three.js 래퍼)

```yaml
사용 시나리오:
  - 파이프라인 3D 뷰 (배관 흐름)
  - 설비 배치도 시각화
  - VR/AR 확장 가능

구현 난이도: 높음 (Phase 2+ 권장)

대안:
  - Spline (노코드 3D 디자인 → React export)
  - Babylon.js (게임 엔진급)
```

---

## 6. 최종 기술 스택 권장안

### Phase 1 (MVP)

```yaml
지도: MapLibre GL JS + react-map-gl
차트: Recharts (기본) + ECharts (게이지)
실시간: Supabase Realtime
애니메이션: Framer Motion
스타일: Tailwind CSS (모노크롬)
```

### Phase 2 (확장)

```yaml
지도: + Deck.gl (대규모 센서)
차트: + Apache Superset (BI)
3D: React Three Fiber
Edge ML: TensorFlow.js / ONNX Runtime Web
```

### 설치 명령어

```bash
# Phase 1 패키지
pnpm add maplibre-gl react-map-gl recharts echarts echarts-for-react framer-motion

# 타입 정의
pnpm add -D @types/maplibre-gl
```

---

## 7. 모노크롬 테마 적용

### 차트 컬러 팔레트

```typescript
// src/lib/theme/chartColors.ts
export const monochromeColors = {
  primary: '#171717',   // neutral-900
  secondary: '#525252', // neutral-600
  tertiary: '#a3a3a3',  // neutral-400
  background: '#fafafa', // neutral-50
  border: '#e5e5e5',    // neutral-200

  // 상태 표시 (패턴으로 구분)
  status: {
    normal: { fill: '#a3a3a3', pattern: 'solid' },
    warning: { fill: '#525252', pattern: 'dashed' },
    critical: { fill: '#171717', pattern: 'bold' }
  }
};
```

---

## Sources

- [MapLibre GL JS vs Leaflet](https://blog.jawg.io/maplibre-gl-vs-leaflet-choosing-the-right-tool-for-your-interactive-map/)
- [Map Libraries Comparison](https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/)
- [React Map Library Comparison](https://blog.logrocket.com/react-map-library-comparison/)
- [Mapbox Alternatives](https://www.gispeople.com.au/mapbox-vs-maptiler-vs-maplibre-vs-leaflet-which-to-choose/)
- [Best React Chart Libraries 2025](https://embeddable.com/blog/react-chart-libraries)

---

*이 문서는 CMNTech AI 바우처 대시보드 구현 가이드입니다.*
