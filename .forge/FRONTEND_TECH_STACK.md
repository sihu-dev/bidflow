# CMNTech AI 대시보드 프론트엔드 기술 스택

> **통합 문서**: 7개 병렬 조사 결과 단일화
> **작성일**: 2025-12-21
> **용도**: 유량계 슬러지 AI 대시보드 개발

---

## 최종 기술 스택

| 카테고리 | 라이브러리 | 버전 | 용도 |
|----------|------------|------|------|
| **지도** | MapLibre GL JS | ^4.x | 센서 위치 시각화 |
| **차트** | Recharts | ^2.x | 기본 라인/바 차트 |
| **게이지** | ECharts | ^5.x | 반원형 게이지, 히트맵 |
| **실시간** | Supabase Realtime | 내장 | 센서 데이터 구독 |
| **애니메이션** | Framer Motion | ^12.x | 값 전환, 알림 |
| **UI** | Tailwind CSS | ^3.x | 모노크롬 디자인 |

---

## 1. 지도: MapLibre GL JS

### 선택 이유
- Mapbox 무료 대안 (BSD-3 라이선스)
- WebGL 기반 고성능 (10,000+ 마커)
- 모노크롬 필터 적용 가능

### 무료 타일 소스
| 소스 | 무료 한도 | URL |
|------|-----------|-----|
| OpenStreetMap | 무제한 | tile.openstreetmap.org |
| Stadia Maps | 월 50만 | tiles.stadiamaps.com |
| Protomaps | 자체호스팅 | protomaps.com |

### 사용법
```tsx
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256
      }
    },
    layers: [{
      id: 'osm',
      type: 'raster',
      source: 'osm',
      paint: { 'raster-saturation': -1 } // 모노크롬
    }]
  },
  center: [127.0, 37.5], // 한국
  zoom: 7
});
```

---

## 2. 차트: Recharts + ECharts

### Recharts (기본)
- 번들: ~60KB
- 용도: 라인, 바, 에어리어 차트
- React 네이티브 통합

### ECharts (고급)
- 번들: ~400KB (커스텀 빌드 시 60KB)
- 용도: 게이지, 히트맵, 대용량 데이터
- WebGL 가속

### 게이지 예시
```tsx
const option = {
  series: [{
    type: 'gauge',
    startAngle: 180,
    endAngle: 0,
    min: 0,
    max: 100,
    axisLine: {
      lineStyle: {
        width: 20,
        color: [[0.7, '#a3a3a3'], [1, '#171717']]
      }
    },
    pointer: { show: true },
    detail: { formatter: '{value}%' },
    data: [{ value: 75 }]
  }]
};
```

---

## 3. 실시간 데이터: Supabase Realtime

### 성능
- 지연시간: 46ms (중앙값)
- 처리량: 2,500 메시지/초
- 동시 연결: 10,000 클라이언트

### 사용법
```tsx
const supabase = createClient(url, key);

const channel = supabase
  .channel('sensors')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
    (payload) => setSensorData(payload.new)
  )
  .subscribe();
```

---

## 4. 애니메이션: Framer Motion

### 이미 설치됨 (v12.23.26)

### 값 전환
```tsx
<AnimatePresence mode="wait">
  <motion.span
    key={value}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    {value}
  </motion.span>
</AnimatePresence>
```

---

## 5. 모노크롬 디자인 팔레트

```yaml
Primary: "#171717"     # neutral-900
Secondary: "#525252"   # neutral-600
Muted: "#a3a3a3"       # neutral-400
Background: "#fafafa"  # neutral-50
Border: "#e5e5e5"      # neutral-200

# 상태 (예외)
Critical: "#171717" + 진한 테두리
Warning: "#525252" + 점선 테두리
Normal: "#a3a3a3" + 기본 테두리
```

---

## 6. 컴포넌트 구조

```
src/components/ai-dashboard/
├── SludgeMap.tsx        # MapLibre 지도
├── FlowGauge.tsx        # ECharts 게이지
├── AnimatedMetric.tsx   # 애니메이션 메트릭
├── AnomalyAlert.tsx     # 이상 탐지 알림
├── SensorCard.tsx       # 센서 정보 카드
└── index.ts             # 배럴 export

src/hooks/
├── useRealtimeSensor.ts # Supabase 실시간
└── useSensorHistory.ts  # 히스토리 조회

src/app/(dashboard)/ai-dashboard/
├── page.tsx             # 메인 대시보드
└── layout.tsx           # 레이아웃
```

---

## 7. 설치 명령어

```bash
npm install maplibre-gl echarts echarts-for-react
npm install -D @types/maplibre-gl
```

---

## 8. 대시보드 레이아웃

```
┌─────────────────────────────────────────────────┐
│  [UR-1010PLUS] [SL-3000PLUS] [EnerRay]  탭     │
├────────────────────┬────────────────────────────┤
│                    │  ┌────┐ ┌────┐            │
│                    │  │게이지│ │게이지│            │
│     지도 (50%)      │  └────┘ └────┘            │
│   (센서 위치)       │  ┌────┐ ┌────┐            │
│                    │  │게이지│ │게이지│            │
│                    │  └────┘ └────┘            │
├────────────────────┴────────────────────────────┤
│  [메트릭] [메트릭] [메트릭] [메트릭]              │
├─────────────────────────────────────────────────┤
│  ⚠️ 이상 탐지 알림 배너                          │
└─────────────────────────────────────────────────┘
```

---

## 참고 자료

- [MapLibre GL JS](https://maplibre.org/)
- [ECharts](https://echarts.apache.org/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Framer Motion](https://motion.dev/)

---

*이 문서는 BIDFLOW AI 대시보드 개발 가이드입니다.*
