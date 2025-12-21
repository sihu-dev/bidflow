# 컴포넌트 인덱스

> HEPHAITOS 디자인 시스템 컴포넌트 전체 목록

---

## 📊 Dashboard Components

### 1. Sidebar
**파일**: `components-dashboard/Sidebar.tsx`
**크기**: 11.7 KB
**용도**: 메인 네비게이션 사이드바

**특징**:
- COPY/LEARN/BUILD 3단계 워크플로우
- 접기/펴기 기능
- 모바일 반응형
- 아이콘 + 텍스트 네비게이션

**사용 예시**:
```tsx
import { Sidebar } from '@/components/dashboard/Sidebar';

<Sidebar />
```

---

### 2. PerformanceMetrics
**파일**: `components-dashboard/PerformanceMetrics.tsx`
**크기**: 2.7 KB
**용도**: 성과 지표 대시보드

**특징**:
- MetricCard 래퍼 컴포넌트
- 실시간 포트폴리오 데이터 연동
- 4개 주요 지표 표시

---

### 3. PerformanceChart
**파일**: `components-dashboard/PerformanceChart.tsx`
**크기**: 6.5 KB
**용도**: 성과 차트 시각화

**특징**:
- Recharts 기반
- 라인 차트
- 반응형 툴팁

---

### 4. MetricCard (Dashboard)
**파일**: `components-dashboard/MetricCard.tsx`
**크기**: 4.7 KB
**용도**: 대시보드용 지표 카드

---

## 🎨 UI Components

### 1. MetricCard
**파일**: `components-ui/MetricCard.tsx`
**크기**: 4.3 KB
**용도**: 범용 지표 카드

**Props**:
```typescript
interface MetricCardProps {
  label: string;                    // 지표 이름
  value: string | number;           // 값
  suffix?: string;                  // 접미사 (%, 원 등)
  trend?: 'up' | 'down' | 'neutral'; // 트렌드 방향
  change?: number;                  // 변화율
  icon?: React.ReactNode;           // 아이콘
}
```

**예시**:
```tsx
<MetricCard
  label="총 매출"
  value={1250000}
  suffix="원"
  trend="up"
  change={12.5}
/>
```

---

### 2. LiveIndicator
**파일**: `components-ui/LiveIndicator.tsx`
**크기**: 1.9 KB
**용도**: 실시간 상태 표시

**Props**:
```typescript
interface LiveIndicatorProps {
  status: 'active' | 'inactive' | 'error';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**예시**:
```tsx
<LiveIndicator status="active" label="실시간 연결" />
```

**시각적 표현**:
- `active`: 🟢 녹색 점멸
- `inactive`: ⚪ 회색
- `error`: 🔴 빨간색

---

### 3. AnimatedValue
**파일**: `components-ui/AnimatedValue.tsx`
**크기**: 3.2 KB
**용도**: 숫자 카운트업 애니메이션

**Props**:
```typescript
interface AnimatedValueProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  format?: 'currency' | 'percent' | 'number' | 'compact';
  locale?: string;
  flashOnChange?: boolean;
}
```

**예시**:
```tsx
<AnimatedValue
  value={1250000}
  format="currency"
  locale="ko-KR"
  duration={600}
  flashOnChange={true}
/>
```

**애니메이션**:
- Ease-out-expo 함수
- requestAnimationFrame 사용
- 변경 시 색상 플래시 (녹색/빨간색)

---

### 4. Disclaimer
**파일**: `components-ui/Disclaimer.tsx`
**크기**: 6.5 KB
**용도**: 법률 면책 조항

**변형**:
1. **DisclaimerBanner** - 페이지 상단
2. **DisclaimerInline** - 카드 내부
3. **DisclaimerFooter** - 페이지 하단
4. **DisclaimerModal** - 모달
5. **TradeWarning** - 거래 경고
6. **BacktestWarning** - 백테스트 경고

**예시**:
```tsx
// 배너
<DisclaimerBanner dismissible={true} />

// 인라인
<DisclaimerInline className="mt-4" />

// 모달
<DisclaimerModal
  isOpen={showModal}
  onAccept={() => setShowModal(false)}
/>
```

**사용 시나리오**:
- 금융 서비스
- 의료 정보
- 법률 자문
- AI 예측/분석

---

### 5. EmptyState
**파일**: `components-ui/EmptyState.tsx`
**크기**: 5.1 KB
**용도**: 빈 상태 표시

**Props**:
```typescript
interface EmptyStateProps {
  icon?: 'document' | 'chart' | 'user' | 'sparkles' | 'bell' | 'cube';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**예시**:
```tsx
<EmptyState
  icon="document"
  title="아직 프로젝트가 없습니다"
  description="첫 프로젝트를 만들어보세요"
  action={{
    label: "프로젝트 생성",
    onClick: () => router.push('/create')
  }}
/>
```

**애니메이션**:
- Framer Motion 기반
- Fade-in + Scale 효과
- 아이콘 bounce 애니메이션

---

## 📁 Dashboard Sample

### CMNTECH AI 유량계 진단 대시보드
**파일**: `dashboard-sample/page.tsx`
**크기**: 4.3 KB

**구성**:
1. **Sidebar** - 고정 사이드바
2. **Header** - 제목 + 설명
3. **Stats Grid** - 4개 MetricCard (전체 유량계, 막힘 확률, 누수 감지, 가동률)
4. **Device List** - 5개 유량계 상태 (UR-1010PLUS, MF-1000C, etc.)

**데이터**:
```typescript
const flowMeters = [
  { id: 'UR-1010PLUS', status: '정상', clogProb: 5, uptime: 99.8 },
  { id: 'MF-1000C', status: '주의', clogProb: 35, uptime: 97.2 },
  { id: 'UR-1000PLUS', status: '정상', clogProb: 8, uptime: 99.5 },
  { id: 'SL-3000PLUS', status: '경고', clogProb: 72, leakDetected: true, uptime: 85.3 },
  { id: 'EnerRay', status: '정상', clogProb: 12, uptime: 98.9 },
];
```

---

## 🎨 Design Tokens

### Colors

```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: '#5E6AD2',
    50: '#F0F1FC',
    100: '#E0E3F9',
    // ... 900: '#1E2366'
  },
  profit: '#22C55E',
  loss: '#EF4444',
}
```

### Typography

```css
--font-inter: 'Inter', sans-serif;
--font-ibm-plex-mono: 'IBM Plex Mono', monospace;
```

### Effects

```css
/* Glass Morphism */
.card-cinematic {
  backdrop-filter: blur(20px);
  background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Aurora Background */
.aurora-bg {
  background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(94, 106, 210, 0.15), transparent);
}
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.x",
    "@heroicons/react": "^2.x",
    "clsx": "^2.x",
    "recharts": "^2.x"
  }
}
```

---

## 🔗 컴포넌트 의존성 그래프

```
Dashboard Sample (page.tsx)
  ├── Sidebar
  └── MetricCard (UI)

Sidebar
  └── @heroicons/react

MetricCard (Dashboard)
  ├── MetricCard (UI)
  └── usePortfolioMetrics hook

MetricCard (UI)
  └── clsx

LiveIndicator
  └── clsx

AnimatedValue
  └── clsx

Disclaimer
  ├── @heroicons/react
  ├── clsx
  └── useI18n hook

EmptyState
  ├── framer-motion
  ├── @heroicons/react
  └── Button (UI)
```

---

## 📊 컴포넌트 통계

| 카테고리 | 개수 | 총 크기 |
|----------|------|---------|
| Dashboard | 4 | ~26 KB |
| UI | 5 | ~25 KB |
| Sample | 1 | ~4 KB |
| **Total** | **10** | **~55 KB** |

---

## 🚀 빠른 참조

### 자주 사용하는 컴포넌트

1. **MetricCard** - 숫자 지표 표시
2. **EmptyState** - 빈 상태 UI
3. **Disclaimer** - 법률 면책 조항
4. **AnimatedValue** - 애니메이션 숫자

### 추천 조합

**대시보드 헤더**:
```tsx
<div className="grid grid-cols-4 gap-6">
  <MetricCard label="사용자" value={1234} trend="up" />
  <MetricCard label="매출" value={5000000} format="currency" />
  <MetricCard label="전환율" value={3.2} suffix="%" />
  <LiveIndicator status="active" label="실시간" />
</div>
```

**빈 상태 + 액션**:
```tsx
<EmptyState
  icon="document"
  title="데이터 없음"
  action={{ label: "추가", onClick: handleAdd }}
/>
```

---

*Components Index v1.0.0*
*Last Updated: 2025-12-21*
