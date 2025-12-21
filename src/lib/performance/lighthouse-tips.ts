/**
 * @module performance/lighthouse-tips
 * @description Lighthouse 성능 최적화 가이드
 */

/**
 * Lighthouse 성능 최적화 체크리스트
 *
 * ## 1. LCP (Largest Contentful Paint) - 2.5초 이하
 * - Hero 이미지에 priority 속성 추가
 * - 폰트 preload
 * - 서버 응답 시간 최적화
 *
 * ## 2. FID (First Input Delay) - 100ms 이하
 * - JavaScript 번들 분할
 * - Heavy 컴포넌트 dynamic import
 * - Web Worker 활용
 *
 * ## 3. CLS (Cumulative Layout Shift) - 0.1 이하
 * - 이미지에 width/height 명시
 * - 폰트 swap 설정
 * - 광고/삽입 콘텐츠 공간 확보
 *
 * ## 4. FCP (First Contentful Paint) - 1.8초 이하
 * - Critical CSS 인라인
 * - 렌더 블로킹 리소스 제거
 * - 서버 사이드 렌더링
 *
 * ## 5. TTI (Time to Interactive) - 3.8초 이하
 * - 메인 스레드 작업 최소화
 * - Third-party 스크립트 지연 로드
 * - 코드 스플리팅
 */

export const LighthouseScoreTargets = {
  performance: 90,
  accessibility: 95,
  bestPractices: 95,
  seo: 95,
} as const;

/**
 * 성능 최적화 적용 사항
 */
export const PerformanceOptimizations = {
  // 이미지 최적화
  images: {
    nextImage: true, // next/image 사용
    lazyLoading: true, // 지연 로딩
    webpFormat: true, // WebP 포맷
    placeholders: true, // 블러 플레이스홀더
  },

  // 번들 최적화
  bundles: {
    codeSpiltting: true, // 코드 분할
    treeShaking: true, // 트리 쉐이킹
    dynamicImports: true, // 동적 임포트
    heavyLibsLazy: ['maplibre-gl', 'echarts', 'handsontable'], // 무거운 라이브러리 지연 로드
  },

  // 캐싱 전략
  caching: {
    staticAssets: 31536000, // 1년
    apiResponses: 0, // no-store
    pages: 3600, // 1시간 (ISR)
  },

  // 폰트 최적화
  fonts: {
    preload: true, // 프리로드
    swap: true, // font-display: swap
    subset: true, // 서브셋
  },

  // 압축
  compression: {
    gzip: true,
    brotli: true,
    minify: true,
  },
} as const;

/**
 * Lighthouse 측정 명령어
 */
export const LighthouseCommands = {
  // CLI 측정
  cli: 'npx lighthouse http://localhost:3010 --view --chrome-flags="--headless"',

  // Chrome DevTools
  devtools: 'F12 -> Lighthouse 탭 -> Analyze page load',

  // PageSpeed Insights
  psi: 'https://pagespeed.web.dev/',

  // Web Vitals 측정
  webVitals: 'import { getCLS, getFID, getLCP } from "web-vitals"',
} as const;

/**
 * 개선 권장사항
 */
export const ImprovementSuggestions = [
  {
    issue: 'LCP 느림',
    solutions: [
      'Hero 이미지에 priority 추가',
      '폰트 preload',
      'Critical CSS 인라인',
    ],
  },
  {
    issue: '큰 JavaScript 번들',
    solutions: [
      'dynamic import 사용',
      '사용하지 않는 의존성 제거',
      'Tree shaking 확인',
    ],
  },
  {
    issue: 'CLS 높음',
    solutions: [
      '이미지에 width/height 명시',
      '폰트 font-display: swap',
      '동적 콘텐츠 공간 확보',
    ],
  },
  {
    issue: '렌더 블로킹 리소스',
    solutions: [
      'CSS 분할',
      'JS defer/async',
      'Critical CSS 인라인',
    ],
  },
] as const;
