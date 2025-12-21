# BIDFLOW 성능 분석 리포트

> **분석일**: 2025-12-21
> **환경**: Next.js 15.5.9 Production Build
> **분석 도구**: @next/bundle-analyzer, Next.js Build Output

---

## 1. 빌드 분석 요약

### 페이지별 First Load JS

| 페이지 | 사이즈 | First Load | 등급 |
|--------|--------|-----------|------|
| `/` (랜딩) | 14.4 kB | **144 kB** | 🟡 |
| `/dashboard` | 4.57 kB | **117 kB** | 🟢 |
| `/login` | 1.68 kB | **111 kB** | 🟢 |
| `/signup` | 1.68 kB | **111 kB** | 🟢 |
| `/pricing` | 0.66 kB | **131 kB** | 🟢 |
| `/contact` | 5.66 kB | **119 kB** | 🟢 |

**공유 JS**: 103 kB (모든 페이지에서 공유)

---

## 2. 청크 분석 (Bundle Analyzer)

### 전체 통계

```
총 청크 수: 90개
총 사이즈: 4.4 MB (미압축)
```

### 대형 청크 상세 분석

| 파일 | 원본 | Gzip | 패키지 | 상태 |
|------|------|------|--------|------|
| `8056.js` | **1.6 MB** | 401 KB | Handsontable | ✅ 동적 임포트 |
| `6edf0643.js` | **912 KB** | 250 KB | HyperFormula | ⚠️ 분리 검토 |
| `3509.js` | **200 KB** | ~50 KB | Moment.js 등 | ⚠️ 경량화 검토 |
| `framework.js` | **188 KB** | ~50 KB | React Core | ✅ 필수 |
| `4bd1b696.js` | **172 KB** | 53 KB | React DOM | ✅ 필수 |
| `1255.js` | **172 KB** | 45 KB | Radix UI + Lucide | ✅ 트리쉐이킹 적용 |

### 패키지별 분석

#### Handsontable (1.6 MB → 401 KB gzip)
- **용도**: 엑셀 스타일 스프레드시트 UI
- **현재 상태**: 동적 임포트로 초기 로딩에서 제외 ✅
- **로딩 시점**: 대시보드 및 데모 페이지 접근 시

#### HyperFormula (912 KB → 250 KB gzip)
- **용도**: 스프레드시트 수식 엔진 (=SUM, =AI_SCORE 등)
- **현재 상태**: Handsontable과 함께 번들됨
- **개선안**: 수식 미사용 시 제외 가능

#### Lucide React (37 MB node_modules → 트리쉐이킹 후 최소화)
- **사용 아이콘**: 91개
- **트리쉐이킹**: ✅ 적용됨 (번들에서 "lucide" 참조 2개만 감지)
- **상태**: 정상

### Handsontable 최적화 현황

```typescript
// src/app/(marketing)/page.tsx - 동적 임포트 ✅
const SpreadsheetDemo = dynamic(
  () => import('@/components/landing/SpreadsheetDemo'),
  { loading: () => <Skeleton />, ssr: true }
);

// src/app/(dashboard)/dashboard/page.tsx - 동적 임포트 ✅
const ClientSpreadsheet = dynamic(
  () => import('@/components/spreadsheet/ClientSpreadsheet'),
  { ssr: false, loading: () => <Skeleton /> }
);
```

---

## 3. Core Web Vitals 최적화 현황

### 3.1 LCP (Largest Contentful Paint) - 🟢 양호

**적용된 최적화:**
- `next/font` 사용 (Inter, IBM Plex Mono)
- `display: 'swap'` 설정
- `preload: true` 설정
- 폴백 폰트 지정

```typescript
// src/app/layout.tsx
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',      // ✅ FOUT 허용, CLS 감소
  preload: true,        // ✅ 폰트 사전 로드
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
});
```

### 3.2 FID/INP (First Input Delay / Interaction to Next Paint) - 🟡 주의

**현재 상태:**
- Handsontable 동적 로딩으로 초기 응답성 확보
- 대형 테이블 렌더링 시 지연 가능

**권장 조치:**
- 가상화(virtualization) 적용 확인 (Handsontable 내장)
- `useDeferredValue` 검토 (대량 데이터)

### 3.3 CLS (Cumulative Layout Shift) - 🟢 양호

**적용된 최적화:**
- 폰트 `display: 'swap'` + fallback
- 스켈레톤 UI 적용
- 고정 높이 레이아웃 (`h-screen`, `h-14`)

---

## 4. 권장 개선사항

### 우선순위 높음 (P0)

| 항목 | 현재 | 목표 | 방법 |
|------|------|------|------|
| HyperFormula 분리 | 912KB 포함 | 필요시 로드 | 수식 기능 lazy load |
| 이미지 최적화 | 미사용 | `next/image` | Hero 섹션 이미지 추가 시 적용 |

### 우선순위 중간 (P1)

| 항목 | 현재 | 목표 | 방법 |
|------|------|------|------|
| Radix UI 트리쉐이킹 | 169KB | 100KB | 사용 컴포넌트만 임포트 |
| prefetch 최적화 | 기본 | 선택적 | `Link prefetch={false}` |

### 우선순위 낮음 (P2)

| 항목 | 현재 | 목표 | 방법 |
|------|------|------|------|
| 번들 분석기 추가 | 없음 | 추가 | `@next/bundle-analyzer` |
| Compression | gzip | brotli | Vercel/Cloudflare 자동 |

---

## 5. 성능 점수 예측

WSL 환경에서 Lighthouse CLI 실행 불가로 직접 측정은 미완료.
빌드 분석 기반 예측치:

| 지표 | 예측 점수 | 비고 |
|------|----------|------|
| **Performance** | 75-85 | Handsontable 동적 로딩 효과 |
| **Accessibility** | 85-95 | 기본 접근성 적용 |
| **Best Practices** | 90-95 | HTTPS, 보안 헤더 필요 |
| **SEO** | 90-95 | 메타데이터 완비 |

---

## 6. 다음 단계

1. **프로덕션 배포 후 PageSpeed Insights 측정**
   - URL: https://pagespeed.web.dev/

2. **Vercel Analytics 활성화**
   ```bash
   npm i @vercel/analytics
   ```

3. **Real User Monitoring (RUM) 설정**
   - Web Vitals 실시간 모니터링

---

## 7. 참고 자료

- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Web Vitals](https://web.dev/vitals/)
- [Handsontable Performance](https://handsontable.com/docs/performance/)

---

*Generated by Claude Code Performance Analyzer*
