# HEPHAITOS Design System (ADE Engine)

> **용도**: 외주업체 SaaS 개발 시 디자인 기준안
> **버전**: 1.0.0
> **최종 업데이트**: 2025-12-21
> **출처**: HEPHAITOS Trading Platform

---

## 📦 포함 내용

```
.design-system/hephaitos/
├── README.md                    # 이 파일
├── tailwind.config.ts           # Tailwind 설정 (Linear Design System)
├── globals.css                  # 글로벌 스타일 (~800 lines)
├── dashboard-sample/            # 샘플 대시보드 페이지
│   └── page.tsx                 # CMNTECH AI 유량계 진단 대시보드
├── components-dashboard/        # 대시보드 컴포넌트
│   ├── Sidebar.tsx              # 사이드바 (COPY/LEARN/BUILD)
│   ├── PerformanceMetrics.tsx   # 성과 지표 카드
│   └── PerformanceChart.tsx     # 차트 컴포넌트
└── components-ui/               # UI 기본 컴포넌트
    ├── MetricCard.tsx           # 지표 카드
    ├── LiveIndicator.tsx        # 실시간 표시기
    ├── Disclaimer.tsx           # 면책 조항
    ├── EmptyState.tsx           # 빈 상태
    └── AnimatedValue.tsx        # 애니메이션 숫자
```

---

## 🎨 디자인 시스템 개요

### Linear 2025 Design System

| 요소 | 값 | 설명 |
|------|------|------|
| **Primary Color** | `#5E6AD2` | Linear Purple |
| **Background** | `#0D0D0F` | Deep Space Black |
| **Accent** | `#22C55E` / `#EF4444` | 수익 / 손실 |
| **Typography** | IBM Plex Mono + Inter | Monospace + Sans |
| **Effect** | Glass Morphism | `backdrop-filter: blur(16px)` |

---

## 🚀 빠른 시작

### 1. Tailwind Config 적용

```bash
# HEPHAITOS tailwind.config.ts를 프로젝트에 복사
cp .design-system/hephaitos/tailwind.config.ts ./

# 또는 내용 병합
```

**핵심 토큰**:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5E6AD2',
          50: '#F0F1FC',
          // ... 900: '#1E2366'
        },
        profit: '#22C55E',
        loss: '#EF4444',
      },
      backgroundImage: {
        'aurora': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(94, 106, 210, 0.15), transparent)',
      },
    },
  },
}
```

### 2. Global CSS 적용

```bash
# globals.css를 app/globals.css에 복사
cp .design-system/hephaitos/globals.css src/app/
```

**주요 스타일**:

```css
/* Glass Morphism Card */
.card-cinematic {
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.02) inset,
    0 8px 32px rgba(0, 0, 0, 0.4);
}

.card-cinematic:hover {
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 16px 48px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

/* Aurora Background */
.aurora-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(94, 106, 210, 0.15), transparent);
  pointer-events: none;
  z-index: 0;
}

/* Noise Overlay */
.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}
```

### 3. 폰트 설정

```typescript
// app/layout.tsx
import { Inter, IBM_Plex_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}>
        <div className="aurora-bg" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
```

---

## 🧩 컴포넌트 사용 가이드

### MetricCard

**용도**: 숫자 지표 표시 (매출, 사용자 수, 성과 등)

```tsx
import { MetricCard } from '@/components/ui/MetricCard';

<MetricCard
  label="오늘의 매출"
  value={1250000}
  change={12.5}
  changeLabel="어제 대비"
  format="currency"
  trend="up"
/>
```

**Props**:
- `label`: string - 지표 이름
- `value`: number - 숫자 값
- `change`: number - 변화율 (%)
- `format`: 'currency' | 'percent' | 'number'
- `trend`: 'up' | 'down' | 'neutral'

---

### LiveIndicator

**용도**: 실시간 상태 표시

```tsx
import { LiveIndicator } from '@/components/ui/LiveIndicator';

<LiveIndicator status="active" label="실시간 데이터" />
```

**Props**:
- `status`: 'active' | 'inactive' | 'error'
- `label`: string (선택)

---

### AnimatedValue

**용도**: 숫자 카운트업 애니메이션

```tsx
import { AnimatedValue } from '@/components/ui/AnimatedValue';

<AnimatedValue
  value={1250000}
  prefix="₩"
  format="currency"
  duration={600}
  flashOnChange={true}
/>
```

**Props**:
- `value`: number - 애니메이션할 값
- `prefix`: string - 접두사 (예: ₩, $)
- `suffix`: string - 접미사 (예: %, 명)
- `format`: 'currency' | 'percent' | 'number' | 'compact'
- `duration`: number - 애니메이션 시간(ms)
- `flashOnChange`: boolean - 변경 시 플래시 효과

---

### Disclaimer

**용도**: 법률 면책 조항 (금융/의료/법률 서비스)

```tsx
import { DisclaimerBanner, DisclaimerInline } from '@/components/ui/Disclaimer';

// 페이지 상단 배너
<DisclaimerBanner dismissible={true} />

// 카드 내부
<DisclaimerInline className="mt-4" />
```

**변형**:
- `DisclaimerBanner` - 페이지 상단 배너
- `DisclaimerInline` - 카드/섹션 내부
- `DisclaimerFooter` - 페이지 하단
- `DisclaimerModal` - 모달 팝업

---

### EmptyState

**용도**: 데이터 없음 상태

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

<EmptyState
  icon="document"
  title="아직 데이터가 없습니다"
  description="첫 프로젝트를 생성하여 시작하세요"
  action={{
    label: "프로젝트 생성",
    onClick: () => router.push('/create')
  }}
/>
```

**Props**:
- `icon`: 'document' | 'chart' | 'user' | 'sparkles' | 'bell' | 'cube'
- `title`: string
- `description`: string
- `action`: { label: string, onClick: () => void }

---

## 🎯 샘플 대시보드 분석

### CMNTECH AI 유량계 진단 대시보드

**파일**: `dashboard-sample/page.tsx`

**구조**:
```tsx
<div className="flex min-h-screen bg-[var(--bg-primary)]">
  {/* Sidebar */}
  <Sidebar />

  {/* Main Content */}
  <div className="flex-1 lg:pl-52">
    {/* Header */}
    <h1>CMNTECH AI 유량계 진단</h1>

    {/* Stats Grid (4 cards) */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard label="전체 유량계" value={5} />
      <MetricCard label="평균 막힘 확률" value={26} suffix="%" />
      <MetricCard label="누수 감지" value={1} />
      <MetricCard label="평균 가동률" value={96.1} suffix="%" />
    </div>

    {/* Device List */}
    <div className="card-cinematic p-6">
      {/* 5개 유량계 목록 */}
    </div>
  </div>
</div>
```

**핵심 패턴**:
1. **Sidebar 고정** - `lg:pl-52` offset
2. **Stats Grid** - 반응형 그리드 (1/2/4 컬럼)
3. **Glass Morphism Card** - `.card-cinematic`
4. **Status Badge** - 조건부 색상 (정상/주의/경고)

---

## 🔧 커스터마이징 가이드

### 1. Primary Color 변경

```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: '#YOUR_COLOR',  // 메인 색상 변경
    50: '...', // 단계별 조정
  }
}
```

### 2. 폰트 변경

```typescript
// app/layout.tsx
import { YourFont } from 'next/font/google';

const yourFont = YourFont({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-custom',
});
```

### 3. Glass Effect 강도 조절

```css
/* globals.css */
.card-cinematic {
  backdrop-filter: blur(12px);  /* 20px → 12px (약하게) */
  background: rgba(255,255,255,0.02);  /* 0.03 → 0.02 (투명하게) */
}
```

---

## 📚 참고 자료

### 색상 팔레트

| Color | Hex | 용도 |
|-------|-----|------|
| Primary | `#5E6AD2` | CTA, 강조, 링크 |
| Background | `#0D0D0F` | 배경 |
| Surface | `#1A1A1F` | 카드 베이스 |
| Profit | `#22C55E` | 수익, 증가, 성공 |
| Loss | `#EF4444` | 손실, 감소, 오류 |
| Warning | `#F59E0B` | 경고, 주의 |
| Text Primary | `#FFFFFF` | 제목, 주요 텍스트 |
| Text Secondary | `#A1A1AA` | 설명, 보조 텍스트 |

### 타이포그래피

| 요소 | 폰트 | 크기 | 굵기 |
|------|------|------|------|
| H1 | Inter | 30px | 700 |
| H2 | Inter | 24px | 600 |
| H3 | Inter | 20px | 600 |
| Body | Inter | 14px | 400 |
| Caption | Inter | 12px | 400 |
| Monospace | IBM Plex Mono | 14px | 400 |

### 간격 (Spacing)

```
px-4: 16px (모바일 기본 padding)
px-6: 24px (카드 내부)
px-8: 32px (섹션)
gap-4: 16px (요소 간 간격)
gap-6: 24px (카드 간 간격)
```

---

## 🚨 주의사항

### 1. Dark Mode Only
- 이 디자인 시스템은 다크 모드 전용입니다
- 라이트 모드 지원이 필요하면 별도 작업 필요

### 2. 성능 최적화
- `backdrop-filter: blur()` 는 성능 영향이 큼
- 모바일에서는 블러 강도 줄이기 권장

### 3. 브라우저 호환성
- Glass Morphism은 최신 브라우저만 지원
- Safari 12+, Chrome 76+, Firefox 103+

### 4. 접근성
- 색상 대비비: WCAG AA 기준 준수
- 버튼 최소 크기: 44x44px (터치 타겟)
- 키보드 네비게이션 지원

---

## 📄 라이선스

이 디자인 시스템은 BIDFLOW 프로젝트 내부용입니다.
외부 사용 시 별도 협의 필요.

---

## 🔗 관련 링크

- [HEPHAITOS 프로젝트](https://github.com/yourusername/HEPHAITOS)
- [Linear Design System](https://linear.app/design)
- [Tailwind CSS](https://tailwindcss.com)

---

*Design System v1.0.0*
*Last Updated: 2025-12-21*
*Created by: Claude Opus 4.5*
