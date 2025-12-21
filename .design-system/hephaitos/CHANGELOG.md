# Changelog

> HEPHAITOS Design System 변경 이력

---

## [1.0.0] - 2025-12-21

### Added - 초기 릴리스

#### 디자인 토큰
- ✅ Tailwind Config (Linear Design System)
  - Primary Color: #5E6AD2
  - Dark Mode Only
  - Glass Morphism 변수
  - Aurora Background
  - Noise Overlay

- ✅ Global CSS (~800 lines)
  - `.card-cinematic` - Glass morphism 카드
  - `.aurora-bg` - 오로라 배경
  - `.noise-overlay` - 노이즈 텍스처
  - 애니메이션 클래스
  - 반응형 유틸리티

#### 폰트
- ✅ IBM Plex Mono (400, 500, 600, 700)
- ✅ Inter (Variable)

#### Dashboard Components (4개)
1. **Sidebar** (11.7 KB)
   - COPY/LEARN/BUILD 워크플로우
   - 접기/펴기 기능
   - 모바일 반응형

2. **PerformanceMetrics** (2.7 KB)
   - 포트폴리오 지표 표시
   - MetricCard 래퍼

3. **PerformanceChart** (6.5 KB)
   - Recharts 기반 차트
   - 반응형 툴팁

4. **MetricCard** (4.7 KB)
   - 대시보드 전용 지표 카드

#### UI Components (5개)
1. **MetricCard** (4.3 KB)
   - 범용 지표 카드
   - Props: label, value, trend, change
   - Format: currency, percent, number

2. **LiveIndicator** (1.9 KB)
   - 실시간 상태 표시
   - Status: active, inactive, error
   - 점멸 애니메이션

3. **AnimatedValue** (3.2 KB)
   - 숫자 카운트업 애니메이션
   - Ease-out-expo 함수
   - 변경 시 색상 플래시

4. **Disclaimer** (6.5 KB)
   - 법률 면책 조항
   - 6가지 변형 (Banner, Inline, Footer, Modal, TradeWarning, BacktestWarning)
   - i18n 지원

5. **EmptyState** (5.1 KB)
   - 빈 상태 UI
   - Framer Motion 애니메이션
   - 6가지 아이콘 옵션
   - 액션 버튼 지원

#### Sample
- ✅ CMNTECH AI 유량계 진단 대시보드 (4.3 KB)
  - Sidebar + MetricCard 조합
  - 5개 유량계 목록
  - 반응형 그리드 (1/2/4 컬럼)

#### Documentation
- ✅ README.md - 종합 가이드
- ✅ COMPONENTS.md - 컴포넌트 인덱스
- ✅ CHANGELOG.md - 변경 이력

---

## 통계

### 파일 구조
```
.design-system/hephaitos/
├── README.md              (10.6 KB)
├── COMPONENTS.md          (7.8 KB)
├── CHANGELOG.md           (이 파일)
├── tailwind.config.ts     (6.2 KB)
├── globals.css            (16.9 KB)
├── dashboard-sample/
│   └── page.tsx           (4.3 KB)
├── components-dashboard/
│   ├── Sidebar.tsx        (11.9 KB)
│   ├── PerformanceMetrics.tsx (2.7 KB)
│   ├── PerformanceChart.tsx (6.6 KB)
│   ├── MetricCard.tsx     (4.7 KB)
│   └── index.ts           (0.1 KB)
└── components-ui/
    ├── MetricCard.tsx     (4.3 KB)
    ├── LiveIndicator.tsx  (1.9 KB)
    ├── AnimatedValue.tsx  (3.2 KB)
    ├── Disclaimer.tsx     (6.5 KB)
    └── EmptyState.tsx     (5.1 KB)

Total: 10 components + 3 docs + 2 configs = ~95 KB
```

### 컴포넌트 분류
- 📊 Dashboard: 4개 (26 KB)
- 🎨 UI: 5개 (21 KB)
- 📄 Sample: 1개 (4 KB)
- 📚 Docs: 3개 (18 KB)
- ⚙️ Config: 2개 (23 KB)

### 기술 스택
- React 19
- Next.js 15
- Tailwind CSS 4.0
- TypeScript
- Framer Motion
- Recharts
- Heroicons

---

## 향후 계획 (Roadmap)

### v1.1.0 (예정)
- [ ] Button 컴포넌트 추가
- [ ] Input 컴포넌트 추가
- [ ] Select 컴포넌트 추가
- [ ] Modal 컴포넌트 추가

### v1.2.0 (예정)
- [ ] Table 컴포넌트
- [ ] Pagination 컴포넌트
- [ ] Toast 알림 시스템

### v2.0.0 (예정)
- [ ] Light Mode 지원
- [ ] 테마 커스터마이징 도구
- [ ] Storybook 통합

---

## 마이그레이션 가이드

### 외주 프로젝트에 적용하기

#### Step 1: 디자인 토큰 복사
```bash
cp .design-system/hephaitos/tailwind.config.ts ./
cp .design-system/hephaitos/globals.css src/app/
```

#### Step 2: 컴포넌트 복사
```bash
# 필요한 컴포넌트만 선택적으로 복사
cp .design-system/hephaitos/components-ui/MetricCard.tsx src/components/ui/
cp .design-system/hephaitos/components-ui/EmptyState.tsx src/components/ui/
```

#### Step 3: 의존성 설치
```bash
npm install framer-motion @heroicons/react clsx recharts
```

#### Step 4: 폰트 설정
```typescript
// app/layout.tsx
import { Inter, IBM_Plex_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono'
});
```

---

## 라이선스 및 사용 조건

### 내부 사용
- BIDFLOW 프로젝트 및 관련 외주 개발: ✅ 자유 사용

### 외부 사용
- 상업적 사용: ⚠️ 별도 협의 필요
- 오픈소스: ⚠️ 별도 협의 필요

---

## 크레딧

- **디자인**: Linear Design System 기반
- **개발**: Claude Opus 4.5
- **프로젝트**: HEPHAITOS Trading Platform
- **적용**: BIDFLOW Enterprise

---

## 문의

디자인 시스템 관련 문의:
- GitHub Issues: [링크]
- Email: [이메일]

---

*Changelog v1.0.0*
*Last Updated: 2025-12-21*
