# BIDFLOW 다음 단계 상세 로드맵

**작성 일시**: 2025-12-21
**현재 상태**: Phase 1 완료 (P0 작업 100%)
**종합 점수**: 87/100 (B+)
**목표 점수**: 96/100 (A)

---

## 📊 현재 상태 요약

### 완료된 작업 (Phase 1)
- ✅ 보안 헤더 추가 (6개 OWASP 표준)
- ✅ CSRF Secret 설정 (64자 랜덤)
- ✅ 프로덕션 로그 정리 (민감정보 마스킹)
- ✅ Dashboard API 인증 (Supabase + CSRF)
- ✅ 번들 최적화 (코드 스플리팅)

### 현재 점수
| 영역 | 점수 | 등급 | 목표 |
|------|------|------|------|
| 보안 | 95/100 | A | 98/100 |
| 코드 품질 | 90/100 | A- | 95/100 |
| 성능 | 85/100 | B+ | 92/100 |
| UX/UI | 62/100 | D | 95/100 |
| 테스트 | 60/100 | D | 80/100 |
| **종합** | **87/100** | **B+** | **96/100** |

---

## 🎯 Phase 2: 성능 최적화 (2-3일)

### 우선순위: HIGH
**예상 기간**: 2-3일
**예상 점수 개선**: 87 → 92 (+5점)

---

### 2.1 데이터베이스 쿼리 최적화 (4시간)

**현재 문제점**:
- N+1 쿼리 패턴 발견 (`bid-repository.ts`)
- 복합 조건 쿼리 시 풀 테이블 스캔
- 관계형 데이터 개별 fetch

**해결 방안**:

#### A. N+1 쿼리 해결
```typescript
// AS-IS (문제)
async function getBidsWithProducts() {
  const bids = await supabase.from('bids').select('*');

  for (const bid of bids.data) {
    // N+1 쿼리 발생!
    const products = await supabase
      .from('matches')
      .select('*, products(*)')
      .eq('bid_id', bid.id);
  }
}

// TO-BE (해결)
async function getBidsWithProducts() {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      matches!inner(
        *,
        products(*)
      ),
      keywords:bid_keywords(*),
      alerts(*)
    `)
    .order('deadline', { ascending: true });

  return data;
}
```

**구현 위치**: `/home/user/bidflow/src/lib/domain/repositories/bid-repository.ts`

**예상 효과**:
- 쿼리 수: 100+ → 1-3개
- 응답 시간: ~500ms → ~50ms (90% 개선)

---

#### B. 복합 인덱스 추가

**마이그레이션 파일 생성**: `supabase/migrations/20251221_add_composite_indexes.sql`

```sql
-- 1. 입찰 상태 + 마감일 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_bids_status_deadline
ON bids(status, deadline)
WHERE status IN ('open', 'matched');

-- 2. 소스 + 외부 ID 복합 인덱스 (중복 방지)
CREATE INDEX IF NOT EXISTS idx_bids_source_external
ON bids(source, external_id);

-- 3. 테넌트 + 상태 복합 인덱스 (멀티테넌트)
CREATE INDEX IF NOT EXISTS idx_bids_tenant_status
ON bids(tenant_id, status);

-- 4. 매칭 점수 인덱스 (정렬 최적화)
CREATE INDEX IF NOT EXISTS idx_matches_score
ON matches(score DESC)
WHERE score >= 100;

-- 5. 기관 점수 인덱스
CREATE INDEX IF NOT EXISTS idx_org_scores_tenant_org
ON org_scores(tenant_id, organization_name);

-- 6. 알림 발송 상태 인덱스
CREATE INDEX IF NOT EXISTS idx_alerts_status_scheduled
ON alerts(status, scheduled_at)
WHERE status = 'pending';

-- 7. 감사 로그 시간 인덱스 (파티셔닝 준비)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created
ON audit_logs(created_at DESC);
```

**실행 명령어**:
```bash
supabase db push
```

**예상 효과**:
- 필터링 쿼리: ~200ms → ~20ms (90% 개선)
- 정렬 쿼리: ~100ms → ~10ms (90% 개선)

---

#### C. Redis 캐싱 전략

**캐싱 대상**:
1. 입찰 목록 (1분 캐시)
2. AI 함수 결과 (1시간 캐시)
3. 통계 데이터 (5분 캐시)
4. 제품 목록 (1시간 캐시)

**구현 예시**:

```typescript
// src/lib/cache/redis-cache.ts (신규 파일)
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60 // seconds
): Promise<T> {
  // 1. 캐시 조회
  const cached = await redis.get<T>(key);
  if (cached) {
    return cached;
  }

  // 2. 데이터 fetch
  const data = await fetcher();

  // 3. 캐시 저장
  await redis.setex(key, ttl, data);

  return data;
}

// 사용 예시
export async function getCachedBids(filters: BidFilters) {
  const cacheKey = `bids:list:${JSON.stringify(filters)}`;

  return getCachedOrFetch(
    cacheKey,
    () => fetchBidsFromDB(filters),
    60 // 1분 캐시
  );
}
```

**AI 함수 캐싱**:

```typescript
// src/lib/spreadsheet/ai-summary.ts 수정
import { getCachedOrFetch } from '@/lib/cache/redis-cache';

export async function AI_SUMMARY(bidText: string): Promise<string> {
  const cacheKey = `ai:summary:${hashString(bidText)}`;

  return getCachedOrFetch(
    cacheKey,
    () => callClaudeAPI(bidText),
    3600 // 1시간 캐시
  );
}
```

**예상 효과**:
- AI API 호출: 100회 → 10-20회 (80-90% 감소)
- 비용 절감: ~$50/월 → ~$5-10/월
- 응답 시간: ~2-3초 → ~50ms (95% 개선)

---

### 2.2 API 응답 최적화 (3시간)

#### A. ETag 기반 조건부 요청

```typescript
// src/app/api/v1/bids/route.ts 수정
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const data = await getBids();

  // ETag 생성
  const etag = crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');

  // 클라이언트 ETag 확인
  const clientETag = request.headers.get('If-None-Match');

  if (clientETag === etag) {
    return new Response(null, { status: 304 }); // Not Modified
  }

  return NextResponse.json(data, {
    headers: {
      'ETag': etag,
      'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
    },
  });
}
```

**예상 효과**:
- 불필요한 데이터 전송 90% 감소
- 대역폭 절약: ~1GB/월 → ~100MB/월

---

#### B. 응답 압축 (Gzip/Brotli)

```typescript
// next.config.ts 수정
const nextConfig: NextConfig = {
  compress: true, // Gzip 압축 활성화

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Content-Encoding', value: 'gzip' },
        ],
      },
    ];
  },
};
```

**예상 효과**:
- JSON 응답 크기: ~100KB → ~20KB (80% 감소)

---

#### C. 페이징 및 커서 기반 무한 스크롤

```typescript
// AS-IS (문제)
GET /api/v1/bids?page=1&limit=100 // 모든 데이터 로드

// TO-BE (해결)
GET /api/v1/bids?cursor=last_id&limit=20

// 구현
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = Number(searchParams.get('limit')) || 20;

  let query = supabase
    .from('bids')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('id', cursor);
  }

  const { data } = await query;

  return NextResponse.json({
    data,
    nextCursor: data.length === limit ? data[data.length - 1].id : null,
  });
}
```

**예상 효과**:
- 초기 로딩: ~2초 → ~200ms (90% 개선)
- 메모리 사용: ~100MB → ~10MB (90% 감소)

---

### 2.3 Core Web Vitals 개선 (4시간)

**현재 예상 점수** (미측정):
- LCP: ~3-4초
- FID: ~200-300ms
- CLS: ~0.2-0.3

**목표 점수**:
- LCP: <2.5초 ✅
- FID: <100ms ✅
- CLS: <0.1 ✅

---

#### A. LCP (Largest Contentful Paint) 개선

**문제**: 대형 이미지, 동적 컴포넌트 로딩 지연

**해결**:

```typescript
// 1. 이미지 최적화 (next/image 사용)
// src/components/landing/Hero.tsx
import Image from 'next/image';

<Image
  src="/images/hero-bg.jpg"
  alt="BIDFLOW"
  width={1920}
  height={1080}
  priority // LCP 이미지는 우선 로드
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// 2. 폰트 최적화
// src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

// 3. 서버 컴포넌트 활용
// src/app/page.tsx
export default async function HomePage() {
  // 서버에서 데이터 fetch
  const stats = await getStats();

  return <Hero stats={stats} />;
}
```

**예상 효과**:
- LCP: ~3-4초 → ~1.5-2초 (50% 개선)

---

#### B. FID (First Input Delay) 개선

**문제**: 메인 스레드 블로킹 (Handsontable 초기화)

**해결**:

```typescript
// 1. 대형 JS 분할
// src/components/spreadsheet/ClientSpreadsheet.tsx
const Handsontable = dynamic(
  () => import('handsontable'),
  {
    ssr: false,
    loading: () => <SpreadsheetSkeleton />,
  }
);

// 2. Web Worker 활용 (AI 함수 계산)
// src/lib/workers/ai-worker.ts
self.onmessage = async (e) => {
  const { type, data } = e.data;

  if (type === 'AI_SUMMARY') {
    const result = await AI_SUMMARY(data);
    self.postMessage({ type: 'result', data: result });
  }
};

// 3. requestIdleCallback 활용
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // 우선순위 낮은 작업
    preloadECharts();
  });
}
```

**예상 효과**:
- FID: ~200-300ms → ~50-80ms (70% 개선)

---

#### C. CLS (Cumulative Layout Shift) 개선

**문제**: 동적 콘텐츠 레이아웃 이동

**해결**:

```typescript
// 1. 이미지 크기 명시
<img
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  style={{ aspectRatio: '4/1' }}
/>

// 2. 스켈레톤 UI 적용
// src/components/skeletons/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-48 bg-slate-200 animate-pulse rounded" />
      <div className="h-64 bg-slate-200 animate-pulse rounded" />
    </div>
  );
}

// 사용
<Suspense fallback={<DashboardSkeleton />}>
  <Dashboard />
</Suspense>

// 3. min-height 설정
.hero-section {
  min-height: 600px; /* 동적 콘텐츠 높이 예약 */
}
```

**예상 효과**:
- CLS: ~0.2-0.3 → ~0.05 (83% 개선)

---

### 2.4 번들 사이즈 검증 및 추가 최적화 (2시간)

#### A. 번들 분석 실행

```bash
ANALYZE=true npm run build
```

**예상 결과**:
```
Page                     Size     First Load JS
┌ ○ /                   18 kB    118 KB (-30KB!)
├ ○ /dashboard          4.9 kB   108 KB (-10KB!)
├ λ /ai-dashboard       41.4 kB  134 KB (-10KB!)
└ chunks
  ├ radix-ui.js        85 KB     (분리됨)
  ├ echarts.js         280 KB    (분리됨)
  ├ supabase.js        95 KB     (분리됨)
```

---

#### B. 추가 최적화 기회

**1. Framer Motion 조건부 로드**

```typescript
// src/components/landing/AnimatedSection.tsx
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
);

// 모바일에서는 애니메이션 비활성화
const isMobile = useMediaQuery('(max-width: 768px)');

{isMobile ? (
  <div>{children}</div>
) : (
  <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    {children}
  </MotionDiv>
)}
```

**예상 효과**: -200KB (모바일)

---

**2. Lodash 개별 import**

```typescript
// AS-IS (문제)
import _ from 'lodash'; // 전체 라이브러리 로드 (~70KB)

// TO-BE (해결)
import debounce from 'lodash/debounce'; // 필요한 함수만 (~2KB)
```

**예상 효과**: -68KB

---

**3. 미사용 Radix UI 컴포넌트 제거**

```bash
# 현재 설치된 Radix UI 패키지
npm list | grep @radix-ui

# 실제 사용 중인 컴포넌트 확인
grep -r "from '@radix-ui" src/

# 미사용 패키지 제거
npm uninstall @radix-ui/react-aspect-ratio
npm uninstall @radix-ui/react-avatar
# ... (사용하지 않는 패키지)
```

**예상 효과**: -50-100KB

---

### Phase 2 완료 시 예상 점수

| 지표 | 현재 | Phase 2 후 | 개선 |
|------|------|-----------|------|
| API 응답 시간 | ~500ms | ~50ms | ⬇️ 90% |
| First Load JS | 148KB | ~110KB | ⬇️ 26% |
| LCP | ~3-4s | ~1.5-2s | ⬇️ 50% |
| FID | ~200ms | ~50ms | ⬇️ 75% |
| CLS | ~0.25 | ~0.05 | ⬇️ 80% |
| **성능 점수** | **85** | **92** | **⬆️ +7** |
| **종합 점수** | **87** | **92** | **⬆️ +5** |

---

## 🎨 Phase 3: UI/UX 폴리싱 (2일)

### 우선순위: HIGH
**예상 기간**: 2일
**예상 점수 개선**: 92 → 95 (+3점)

---

### 3.1 디자인 시스템 색상 수정 (1.5일)

**현재 문제**: 모노크롬 디자인 시스템 위반 (8/25점)

**위반 파일 (7개)**:
1. `src/components/landing/Hero.tsx`
2. `src/components/landing/Features.tsx`
3. `src/components/landing/SpreadsheetDemo.tsx`
4. `src/components/landing/PricingPreview.tsx`
5. `src/components/landing/Stats.tsx`
6. `src/components/landing/Testimonials.tsx`
7. `src/app/(marketing)/pricing/page.tsx`

---

#### A. Tailwind Config 재설계

**현재 색상 팔레트** (문제):
```javascript
// tailwind.config.ts
colors: {
  primary: colors.blue,    // ❌ 파란색 사용
  success: colors.green,   // ❌ 녹색 사용
  warning: colors.yellow,  // ❌ 노란색 사용
  danger: colors.red,      // ❌ 빨간색 사용
}
```

**모노크롬 팔레트** (해결):
```javascript
// tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      colors: {
        // 모노크롬 그레이 스케일
        mono: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // 액센트 (최소한의 색상, 강조용만)
        accent: {
          DEFAULT: '#171717', // 거의 검정
          light: '#404040',
          dark: '#0a0a0a',
        },

        // 상태 표시 (모노크롬 기반)
        status: {
          active: '#171717',
          inactive: '#a3a3a3',
          disabled: '#d4d4d4',
        },
      },

      // 그림자 - 부드러운 모노크롬
      boxShadow: {
        'mono-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'mono-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'mono-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'mono-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
};
```

---

#### B. 컴포넌트 색상 수정 예시

**Hero.tsx 수정**:

```typescript
// AS-IS (문제)
<div className="bg-gradient-to-r from-blue-600 to-purple-600"> // ❌
  <span className="text-green-500">92%</span> // ❌
</div>

// TO-BE (해결)
<div className="bg-gradient-to-r from-mono-900 to-mono-800"> // ✅
  <span className="text-mono-50 font-bold">92%</span> // ✅
</div>
```

**Features.tsx 수정**:

```typescript
// AS-IS
<div className="border-blue-500"> // ❌
  <Icon className="text-blue-600" /> // ❌
</div>

// TO-BE
<div className="border-mono-700"> // ✅
  <Icon className="text-mono-900" /> // ✅
</div>
```

**버튼 컴포넌트 통일**:

```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-mono-900 text-mono-50 hover:bg-mono-800",
        outline: "border border-mono-300 hover:bg-mono-100",
        ghost: "hover:bg-mono-100",
        link: "underline-offset-4 hover:underline",
      },
    },
  }
);
```

---

#### C. 색상 마이그레이션 스크립트

```bash
# scripts/migrate-colors.sh
#!/bin/bash

# 파란색 제거
find src -type f -name "*.tsx" -exec sed -i 's/blue-[0-9]\+/mono-800/g' {} +
find src -type f -name "*.tsx" -exec sed -i 's/from-blue/from-mono/g' {} +

# 녹색 제거
find src -type f -name "*.tsx" -exec sed -i 's/green-[0-9]\+/mono-700/g' {} +

# 빨간색 제거 (경고는 진한 회색)
find src -type f -name "*.tsx" -exec sed -i 's/red-[0-9]\+/mono-900/g' {} +

# 노란색 제거
find src -type f -name "*.tsx" -exec sed -i 's/yellow-[0-9]\+/mono-600/g' {} +

# 보라색 제거
find src -type f -name "*.tsx" -exec sed -i 's/purple-[0-9]\+/mono-800/g' {} +

echo "색상 마이그레이션 완료"
echo "npm run lint 실행하여 확인하세요"
```

**실행**:
```bash
chmod +x scripts/migrate-colors.sh
./scripts/migrate-colors.sh
npm run lint --fix
git diff # 변경사항 확인
```

**예상 효과**: 디자인 점수 8 → 24 (+16점)

---

### 3.2 접근성 개선 (0.5일)

**현재 문제**: ARIA 레이블 누락 (12개 컴포넌트)

#### A. 스크린 리더 지원

```typescript
// 버튼에 aria-label 추가
<button aria-label="입찰 공고 새로고침">
  <RefreshIcon />
</button>

// 폼 입력 필드
<input
  type="text"
  id="bidTitle"
  aria-label="입찰 공고 제목"
  aria-required="true"
  aria-describedby="titleHelp"
/>
<span id="titleHelp" className="sr-only">
  입찰 공고 제목을 입력하세요 (최대 500자)
</span>

// 모달/다이얼로그
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialogTitle"
  aria-describedby="dialogDesc"
>
  <h2 id="dialogTitle">입찰 공고 삭제</h2>
  <p id="dialogDesc">정말 삭제하시겠습니까?</p>
</div>
```

---

#### B. 키보드 네비게이션

```typescript
// 스프레드시트 키보드 단축키
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 's': // Ctrl+S: 저장
          e.preventDefault();
          handleSave();
          break;
        case 'f': // Ctrl+F: 검색
          e.preventDefault();
          focusSearchInput();
          break;
        case 'r': // Ctrl+R: 새로고침
          e.preventDefault();
          handleRefresh();
          break;
      }
    }

    // ESC: 모달 닫기
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);

// Focus 스타일 추가
<button className="focus:ring-2 focus:ring-mono-800 focus:ring-offset-2">
  저장
</button>
```

---

#### C. 색상 대비 검증

```bash
# axe-core 설치
npm install --save-dev @axe-core/react

# 개발 환경에서 자동 검사
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

**수동 검증 도구**:
- Chrome DevTools Lighthouse (Accessibility 항목)
- WAVE Extension
- axe DevTools

**예상 효과**: 접근성 점수 65 → 90 (+25점)

---

### 3.3 에러 처리 UX 개선 (2시간)

#### A. 글로벌 에러 바운더리

```typescript
// src/components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/lib/utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('ErrorBoundary caught:', error, { errorInfo });

    // Sentry 등 에러 추적 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // sendToSentry(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-mono-50">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-mono-lg">
            <h1 className="text-2xl font-bold text-mono-900 mb-4">
              문제가 발생했습니다
            </h1>
            <p className="text-mono-600 mb-6">
              죄송합니다. 예기치 않은 오류가 발생했습니다.
              페이지를 새로고침하거나 나중에 다시 시도해주세요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-mono-900 text-white rounded hover:bg-mono-800"
              >
                새로고침
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-mono-300 rounded hover:bg-mono-100"
              >
                뒤로가기
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-mono-500">
                  에러 상세 (개발 모드)
                </summary>
                <pre className="mt-2 p-3 bg-mono-100 rounded text-xs overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 사용
// src/app/layout.tsx
<ErrorBoundary>
  <Providers>
    {children}
  </Providers>
</ErrorBoundary>
```

---

#### B. API 에러 토스트 알림

```typescript
// src/components/ui/toast.tsx
import { Toaster, toast } from 'sonner';

export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
}

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
}

// Dashboard API 에러 처리
try {
  await updateBid(id, data);
  showSuccessToast('입찰 정보가 업데이트되었습니다');
} catch (error) {
  showErrorToast('업데이트에 실패했습니다. 다시 시도해주세요.');
}
```

**의존성 추가**:
```bash
npm install sonner
```

---

#### C. 네트워크 에러 재시도 UI

```typescript
// src/hooks/useRetry.ts
export function useRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = async () => {
    setIsRetrying(true);

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        setRetryCount(i + 1);

        if (i === maxRetries - 1) {
          setIsRetrying(false);
          throw error;
        }

        // 지수 백오프
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  };

  return { executeWithRetry, isRetrying, retryCount };
}

// 사용
const { executeWithRetry, isRetrying, retryCount } = useRetry(
  () => fetch('/api/v1/bids')
);

{isRetrying && (
  <div className="text-sm text-mono-600">
    재시도 중... ({retryCount}/3)
  </div>
)}
```

---

### 3.4 로딩 상태 개선 (2시간)

#### A. 스켈레톤 UI 라이브러리

```typescript
// src/components/skeletons/TableSkeleton.tsx
export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-mono-200 animate-pulse rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-mono-200 animate-pulse rounded w-3/4" />
            <div className="h-3 bg-mono-200 animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// src/components/skeletons/CardSkeleton.tsx
export function CardSkeleton() {
  return (
    <div className="p-6 border border-mono-200 rounded-lg">
      <div className="h-6 bg-mono-200 animate-pulse rounded w-1/2 mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-mono-200 animate-pulse rounded" />
        <div className="h-4 bg-mono-200 animate-pulse rounded w-5/6" />
        <div className="h-4 bg-mono-200 animate-pulse rounded w-4/6" />
      </div>
    </div>
  );
}

// 사용
<Suspense fallback={<TableSkeleton rows={20} />}>
  <BidsTable />
</Suspense>
```

---

#### B. Progressive Loading

```typescript
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <>
      {/* 즉시 표시 */}
      <DashboardHeader />

      {/* 통계: 1초 지연 */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      {/* 테이블: 2초 지연 */}
      <Suspense fallback={<TableSkeleton />}>
        <BidsTable />
      </Suspense>

      {/* 차트: 3초 지연 (중요도 낮음) */}
      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>
    </>
  );
}
```

---

### Phase 3 완료 시 예상 점수

| 지표 | 현재 | Phase 3 후 | 개선 |
|------|------|-----------|------|
| 디자인 시스템 | 8/25 | 24/25 | ⬆️ +16 |
| 접근성 | 65/100 | 90/100 | ⬆️ +25 |
| 에러 UX | 70/100 | 95/100 | ⬆️ +25 |
| **UX/UI 점수** | **62** | **95** | **⬆️ +33** |
| **종합 점수** | **92** | **95** | **⬆️ +3** |

---

## 🧪 Phase 4: 테스트 확장 (3-5일)

### 우선순위: MEDIUM
**예상 기간**: 3-5일
**예상 점수 개선**: 95 → 96 (+1점)

---

### 4.1 E2E 테스트 확장 (2일)

**현재 커버리지**: 46개 테스트 (랜딩 페이지 중심)
**목표 커버리지**: 100개+ 테스트 (전체 플로우)

#### A. Dashboard CRUD 플로우

```typescript
// tests/e2e/dashboard-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Dashboard로 이동
    await page.waitForURL('/dashboard');
  });

  test('should create new bid', async ({ page }) => {
    // 1. 새 입찰 버튼 클릭
    await page.click('button[aria-label="새 입찰 추가"]');

    // 2. 폼 입력
    await page.fill('input[name="title"]', '유량계 구매 입찰');
    await page.fill('input[name="organization"]', '서울시');
    await page.fill('textarea[name="description"]', 'DN200 초음파 유량계');
    await page.fill('input[name="deadline"]', '2025-12-31');

    // 3. 저장
    await page.click('button[type="submit"]');

    // 4. 성공 토스트 확인
    await expect(page.locator('text=입찰이 생성되었습니다')).toBeVisible();

    // 5. 테이블에 추가되었는지 확인
    await expect(page.locator('text=유량계 구매 입찰')).toBeVisible();
  });

  test('should update bid', async ({ page }) => {
    // 1. 첫 번째 입찰 선택
    await page.click('table tbody tr:first-child');

    // 2. 수정 버튼 클릭
    await page.click('button[aria-label="수정"]');

    // 3. 제목 변경
    await page.fill('input[name="title"]', '유량계 구매 입찰 (수정됨)');

    // 4. 저장
    await page.click('button[type="submit"]');

    // 5. 낙관적 업데이트 확인
    await expect(page.locator('text=유량계 구매 입찰 (수정됨)')).toBeVisible({
      timeout: 500, // 즉시 반영되어야 함
    });
  });

  test('should delete bid', async ({ page }) => {
    const initialCount = await page.locator('table tbody tr').count();

    // 1. 첫 번째 입찰 선택
    await page.click('table tbody tr:first-child');

    // 2. 삭제 버튼 클릭
    await page.click('button[aria-label="삭제"]');

    // 3. 확인 다이얼로그
    await expect(page.locator('text=정말 삭제하시겠습니까?')).toBeVisible();
    await page.click('button:has-text("삭제")');

    // 4. 테이블에서 제거되었는지 확인
    const newCount = await page.locator('table tbody tr').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // API 실패 시뮬레이션
    await page.route('/api/v1/bids/*', route => route.abort());

    // 수정 시도
    await page.click('table tbody tr:first-child');
    await page.click('button[aria-label="수정"]');
    await page.fill('input[name="title"]', '수정 시도');
    await page.click('button[type="submit"]');

    // 에러 토스트 확인
    await expect(page.locator('text=업데이트에 실패했습니다')).toBeVisible();

    // 롤백 확인 (원래 제목으로 돌아감)
    await expect(page.locator('text=수정 시도')).not.toBeVisible();
  });
});
```

---

#### B. AI 함수 실행 플로우

```typescript
// tests/e2e/ai-functions.spec.ts
test.describe('AI Functions', () => {
  test('should execute AI_SUMMARY', async ({ page }) => {
    await page.goto('/dashboard');

    // 1. 셀 선택
    await page.click('.handsontable td[data-row="0"][data-col="summary"]');

    // 2. AI 함수 실행
    await page.keyboard.type('=AI_SUMMARY(A1)');
    await page.keyboard.press('Enter');

    // 3. 로딩 상태 확인
    await expect(page.locator('.loading-spinner')).toBeVisible();

    // 4. 결과 확인 (5초 이내)
    await expect(page.locator('td:has-text("서울시 유량계")')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should cache AI results', async ({ page }) => {
    await page.goto('/dashboard');

    // 첫 번째 실행 (API 호출)
    const start1 = Date.now();
    await page.click('.handsontable td[data-row="0"][data-col="summary"]');
    await page.keyboard.type('=AI_SUMMARY(A1)');
    await page.keyboard.press('Enter');
    await page.waitForSelector('td:has-text("서울시 유량계")');
    const duration1 = Date.now() - start1;

    // 두 번째 실행 (캐시)
    const start2 = Date.now();
    await page.click('.handsontable td[data-row="1"][data-col="summary"]');
    await page.keyboard.type('=AI_SUMMARY(A1)'); // 같은 입력
    await page.keyboard.press('Enter');
    await page.waitForSelector('td:has-text("서울시 유량계")');
    const duration2 = Date.now() - start2;

    // 캐시가 90% 이상 빨라야 함
    expect(duration2).toBeLessThan(duration1 * 0.1);
  });
});
```

---

#### C. 반응형 레이아웃 테스트

```typescript
// tests/e2e/responsive.spec.ts
const devices = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

test.describe('Responsive Layout', () => {
  for (const device of devices) {
    test(`should render correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('/');

      // 스크린샷 비교
      await expect(page).toHaveScreenshot(`${device.name}-landing.png`, {
        maxDiffPixels: 100,
      });

      // 네비게이션 메뉴
      if (device.width < 768) {
        // 모바일: 햄버거 메뉴
        await expect(page.locator('button[aria-label="메뉴"]')).toBeVisible();
      } else {
        // 데스크톱: 전체 메뉴
        await expect(page.locator('nav a:has-text("기능")')).toBeVisible();
      }
    });
  }
});
```

---

### 4.2 통합 테스트 (1일)

```typescript
// tests/integration/matching-engine.test.ts
import { describe, it, expect } from 'vitest';
import { matchBidToProducts } from '@/lib/matching/enhanced-matcher';
import { SAMPLE_BIDS } from '@/lib/data/mock-bids';
import { CMNTECH_PRODUCTS } from '@/lib/data/products';

describe('Enhanced Matcher Integration', () => {
  it('should match bids to products with >100 score', () => {
    const bid = SAMPLE_BIDS[0];
    const result = matchBidToProducts(bid);

    expect(result.bestMatch).toBeDefined();
    expect(result.bestMatch.score).toBeGreaterThan(100);
    expect(result.allMatches.length).toBeGreaterThan(0);
  });

  it('should extract pipe size correctly', () => {
    const bid = {
      ...SAMPLE_BIDS[0],
      title: '상수도 DN200 초음파 유량계 구매',
    };

    const result = matchBidToProducts(bid);

    // DN200 추출 및 25점 가산
    expect(result.bestMatch.details.pipeSizeScore).toBe(25);
  });

  it('should normalize organization names', () => {
    const bid1 = { ...SAMPLE_BIDS[0], organization: '서울특별시 상수도사업본부' };
    const bid2 = { ...SAMPLE_BIDS[0], organization: '서울시 상수도' };

    const result1 = matchBidToProducts(bid1);
    const result2 = matchBidToProducts(bid2);

    // 같은 기관으로 인식되어야 함
    expect(result1.bestMatch.details.orgScore).toBe(result2.bestMatch.details.orgScore);
  });
});
```

---

### 4.3 성능 테스트 (1일)

```typescript
// tests/performance/api-benchmark.test.ts
import { describe, it } from 'vitest';

describe('API Performance Benchmarks', () => {
  it('GET /api/v1/bids should respond < 100ms', async () => {
    const start = performance.now();
    const response = await fetch('http://localhost:3010/api/v1/bids');
    const duration = performance.now() - start;

    expect(response.ok).toBe(true);
    expect(duration).toBeLessThan(100);
  });

  it('should handle 100 concurrent requests', async () => {
    const requests = Array.from({ length: 100 }, () =>
      fetch('http://localhost:3010/api/v1/bids')
    );

    const start = performance.now();
    const responses = await Promise.all(requests);
    const duration = performance.now() - start;

    // 모두 성공
    expect(responses.every(r => r.ok)).toBe(true);

    // 평균 응답 시간 < 200ms
    expect(duration / 100).toBeLessThan(200);
  });
});
```

---

### 4.4 보안 테스트 (1일)

```typescript
// tests/security/csrf.test.ts
describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const response = await fetch('http://localhost:3010/api/v1/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test' }),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      error: 'CSRF token missing',
    });
  });

  it('should accept requests with valid CSRF token', async () => {
    // 1. CSRF 토큰 획득
    const tokenResponse = await fetch('http://localhost:3010/api/csrf-token');
    const { token } = await tokenResponse.json();

    // 2. 토큰과 함께 요청
    const response = await fetch('http://localhost:3010/api/v1/bids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      body: JSON.stringify({ title: 'Test' }),
    });

    expect(response.ok).toBe(true);
  });
});
```

---

### Phase 4 완료 시 예상 점수

| 지표 | 현재 | Phase 4 후 | 개선 |
|------|------|-----------|------|
| E2E 테스트 | 46개 | 100+개 | ⬆️ +54 |
| 통합 테스트 | 24개 | 50+개 | ⬆️ +26 |
| 성능 테스트 | 0개 | 10+개 | ✨ 신규 |
| 보안 테스트 | 0개 | 15+개 | ✨ 신규 |
| **테스트 커버리지** | **60%** | **80%** | **⬆️ +20%** |
| **테스트 점수** | **60** | **85** | **⬆️ +25** |
| **종합 점수** | **95** | **96** | **⬆️ +1** |

---

## 🚀 Phase 5: 추가 기능 구현 (5-7일)

### 우선순위: LOW
**예상 기간**: 5-7일
**프로젝트 완성도**: 82% → 95%

---

### 5.1 알림 시스템 완성 (1일)

**현재 상태**: 코드 구현 완료, 실제 연동 대기

#### A. Slack Webhook 테스트

```bash
# .env 파일에 실제 Webhook URL 추가
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# 테스트 스크립트 실행
node scripts/test-slack-notification.mjs
```

```javascript
// scripts/test-slack-notification.mjs
import { sendSlackMessage } from './src/lib/notifications/slack.ts';

async function test() {
  try {
    await sendSlackMessage({
      text: '🎉 BIDFLOW 알림 테스트',
      attachments: [{
        color: '#2eb886',
        fields: [
          { title: '입찰 제목', value: '서울시 유량계 구매', short: false },
          { title: '마감일', value: '2025-12-31', short: true },
          { title: '추정가', value: '5,000만원', short: true },
        ],
      }],
    });

    console.log('✅ Slack 알림 전송 성공');
  } catch (error) {
    console.error('❌ 실패:', error);
  }
}

test();
```

---

#### B. 이메일 발송 테스트 (Resend)

```bash
# Resend API 키 발급 (https://resend.com)
# .env 파일 업데이트
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=BIDFLOW <noreply@bidflow.io>

# 도메인 인증 필요 (bidflow.io)
# DNS TXT 레코드 추가
```

```javascript
// scripts/test-email-notification.mjs
import { sendEmail } from './src/lib/notifications/email.ts';

async function test() {
  const result = await sendEmail({
    to: 'your-email@example.com',
    subject: 'BIDFLOW 테스트 이메일',
    html: `
      <h1>새로운 입찰 공고</h1>
      <p><strong>제목:</strong> 서울시 유량계 구매</p>
      <p><strong>마감일:</strong> 2025-12-31</p>
      <a href="https://bidflow.io/dashboard">대시보드 보기</a>
    `,
  });

  console.log(result.success ? '✅ 성공' : '❌ 실패', result);
}

test();
```

---

#### C. 카카오 알림톡 연동

**준비 사항**:
1. 카카오 비즈니스 채널 개설
2. 알림톡 템플릿 등록 및 검수 (2-3일 소요)
3. API 키 발급

**템플릿 예시**:
```
[BIDFLOW] 새로운 입찰 공고

#{조달기관}에서 #{입찰제목} 입찰 공고가 등록되었습니다.

• 마감일: #{마감일}
• 추정가: #{추정가}
• 매칭점수: #{점수}점

#{상세보기_URL}
```

**구현**:
```typescript
// 이미 구현됨 - 환경 변수만 설정
KAKAO_ALIMTALK_API_KEY=your-api-key
KAKAO_ALIMTALK_SENDER_KEY=your-sender-key
```

---

### 5.2 크롤링 자동화 (Inngest) (2일)

**현재 상태**: 코드 구현 완료, Inngest 설정 대기

#### A. Inngest 프로젝트 설정

```bash
# Inngest 계정 생성 (https://www.inngest.com)
# 환경 변수 추가
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
```

#### B. 크롤링 스케줄 설정

```typescript
// src/inngest/functions/crawl-scheduler.ts (이미 구현됨)
// Inngest Dev Server로 테스트
npx inngest-cli dev

// 수동 트리거 테스트
curl -X POST http://localhost:8288/e/crawl-trigger \
  -H "Content-Type: application/json" \
  -d '{"name":"bid/crawl.scheduled","data":{"source":"ted"}}'
```

#### C. 프로덕션 배포

```bash
# Vercel 환경 변수 설정
vercel env add INNGEST_EVENT_KEY
vercel env add INNGEST_SIGNING_KEY

# 배포
vercel --prod
```

**크롤링 주기 설정**:
- TED API: 매 6시간 (`0 */6 * * *`)
- 나라장터: 매 12시간 (`0 */12 * * *`)
- SAM.gov: 매일 1회 (`0 0 * * *`)

---

### 5.3 나라장터/SAM.gov API 연동 (2일)

**현재 상태**: 클라이언트 코드 Stub, 실제 구현 필요

#### A. 나라장터 API 구현

```typescript
// src/lib/clients/narajangto-api.ts 완성
import { BidData } from '@/types';

export async function searchNarajangtoTenders(
  keyword: string = '유량계'
): Promise<BidData[]> {
  const apiKey = process.env.NARA_JANGTO_API_KEY;

  if (!apiKey) {
    throw new Error('NARA_JANGTO_API_KEY not configured');
  }

  const params = new URLSearchParams({
    serviceKey: apiKey,
    numOfRows: '100',
    pageNo: '1',
    bidNtceNm: keyword, // 입찰공고명
    type: 'json',
  });

  const response = await fetch(
    `http://apis.data.go.kr/1230000/BidPublicInfoService04/getBidPblancListInfoServc04?${params}`,
    { next: { revalidate: 3600 } } // 1시간 캐시
  );

  if (!response.ok) {
    throw new Error(`Nara API Error: ${response.status}`);
  }

  const data = await response.json();
  const items = data.response?.body?.items || [];

  return items.map(convertNaraToBI dData);
}

function convertNaraToBidData(item: any): BidData {
  return {
    id: item.bidNtceNo, // 입찰공고번호
    source: 'narajangto',
    externalId: item.bidNtceNo,
    title: item.bidNtceNm,
    organization: item.ntceInsttNm, // 공고기관명
    description: item.bidNtceDtlUrl, // 상세URL
    deadline: new Date(item.bidClsedt), // 입찰마감일시
    estimatedAmount: parseFloat(item.presmptPrce), // 추정가격
    url: item.bidNtceDtlUrl,
    priority: 'normal',
    createdAt: new Date(),
  };
}
```

**API 키 발급**:
1. 공공데이터포털 (https://www.data.go.kr) 가입
2. "국가종합전자조달 입찰공고 조회" 서비스 신청
3. 승인 후 키 발급 (즉시)

---

#### B. SAM.gov API 구현

```typescript
// src/lib/clients/sam-gov-api.ts 완성
export async function searchSAMGovTenders(
  keyword: string = 'flow meter'
): Promise<BidData[]> {
  const apiKey = process.env.SAM_GOV_API_KEY;

  if (!apiKey) {
    throw new Error('SAM_GOV_API_KEY not configured');
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    q: keyword,
    limit: '100',
    postedFrom: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
  });

  const response = await fetch(
    `https://api.sam.gov/opportunities/v2/search?${params}`,
    { next: { revalidate: 3600 } }
  );

  const data = await response.json();
  return data.opportunitiesData.map(convertSAMToBidData);
}
```

**API 키 발급**:
1. SAM.gov 계정 생성
2. System Account Management에서 API 키 발급
3. 즉시 사용 가능

---

### 5.4 스프레드시트 고급 기능 (1일)

#### A. 필터/정렬 활성화

```typescript
// src/components/spreadsheet/SpreadsheetView.tsx
const hotSettings: Handsontable.GridSettings = {
  // 기존 설정...

  // 필터 활성화
  filters: true,
  dropdownMenu: [
    'filter_by_condition',
    'filter_operators',
    'filter_by_condition2',
    'filter_by_value',
    'filter_action_bar',
  ],

  // 정렬 활성화
  columnSorting: {
    indicator: true,
    headerAction: true,
    sortEmptyCells: true,
    compareFunctionFactory(sortOrder, columnMeta) {
      return function(value, nextValue) {
        // 커스텀 정렬 로직
        if (columnMeta.type === 'numeric') {
          return sortOrder === 'asc'
            ? value - nextValue
            : nextValue - value;
        }
        return sortOrder === 'asc'
          ? String(value).localeCompare(String(nextValue))
          : String(nextValue).localeCompare(String(value));
      };
    },
  },

  // 다중 컬럼 정렬
  multiColumnSorting: {
    indicator: true,
  },
};
```

---

#### B. 셀 서식 지정

```typescript
// 조건부 서식
const hotSettings: Handsontable.GridSettings = {
  cells(row, col) {
    const cellProperties: any = {};

    // 마감일 임박 (3일 이내) - 진한 회색 배경
    if (col === 5) { // deadline 컬럼
      const deadline = this.instance.getDataAtCell(row, col);
      const daysLeft = Math.floor((new Date(deadline) - new Date()) / (1000*60*60*24));

      if (daysLeft <= 3) {
        cellProperties.className = 'bg-mono-900 text-white font-bold';
      } else if (daysLeft <= 7) {
        cellProperties.className = 'bg-mono-700 text-white';
      }
    }

    // 매칭 점수 100점 이상 - 굵은 글씨
    if (col === 7) { // score 컬럼
      const score = this.instance.getDataAtCell(row, col);
      if (score >= 100) {
        cellProperties.className = 'font-bold text-mono-900';
      }
    }

    return cellProperties;
  },
};
```

---

#### C. 데이터 검증

```typescript
// 입력 검증
const hotSettings: Handsontable.GridSettings = {
  columns: [
    { data: 'title', validator: 'autocomplete', source: ['유량계', '수도계량기'] },
    { data: 'status', type: 'dropdown', source: ['open', 'matched', 'closed'] },
    { data: 'deadline', type: 'date', dateFormat: 'YYYY-MM-DD' },
    { data: 'estimatedAmount', type: 'numeric', numericFormat: { pattern: '0,0.00' } },
  ],
};
```

---

## 📊 전체 로드맵 타임라인

```
Week 1: Phase 2 (성능 최적화)
├─ Day 1-2: DB 쿼리 최적화 + 인덱스 추가
├─ Day 3-4: API 응답 최적화 + Redis 캐싱
└─ Day 5-7: Core Web Vitals + 번들 검증

Week 2: Phase 3 (UI/UX 폴리싱)
├─ Day 1-2: 디자인 시스템 색상 수정 (7개 파일)
├─ Day 3: 접근성 개선 (ARIA, 키보드)
└─ Day 4-5: 에러 UX + 로딩 상태

Week 3: Phase 4 (테스트 확장)
├─ Day 1-2: E2E 테스트 (Dashboard CRUD, AI)
├─ Day 3: 통합 테스트 (매칭 엔진)
├─ Day 4: 성능 테스트 (벤치마크)
└─ Day 5: 보안 테스트 (CSRF, XSS)

Week 4: Phase 5 (추가 기능)
├─ Day 1: 알림 시스템 실제 연동
├─ Day 2-3: 크롤링 자동화 (Inngest)
├─ Day 4-5: 나라장터/SAM.gov API
└─ Day 6-7: 스프레드시트 고급 기능
```

---

## 🎯 최종 목표 점수 예상

| Phase | 기간 | 종합 점수 | 개선 |
|-------|------|----------|------|
| **현재 (Phase 1 완료)** | - | **87/100** | - |
| Phase 2 (성능 최적화) | 1주 | 92/100 | +5 |
| Phase 3 (UI/UX 폴리싱) | 1주 | 95/100 | +3 |
| Phase 4 (테스트 확장) | 1주 | 96/100 | +1 |
| Phase 5 (추가 기능) | 1주 | 96/100 | - |
| **최종 목표** | **4주** | **96/100 (A)** | **+9** |

---

## 💡 Quick Wins (즉시 실행 가능)

다음 작업들은 1-2시간 내에 빠르게 완료할 수 있습니다:

1. **Slack Webhook 테스트** (30분)
   ```bash
   # .env 설정 후
   node scripts/test-slack-notification.mjs
   ```

2. **번들 분석 실행** (10분)
   ```bash
   ANALYZE=true npm run build
   # 브라우저에서 결과 확인
   ```

3. **Lighthouse 성능 측정** (5분)
   ```bash
   npm run build
   npm run start
   # Chrome DevTools → Lighthouse 실행
   ```

4. **색상 마이그레이션 스크립트** (1시간)
   ```bash
   ./scripts/migrate-colors.sh
   git diff # 변경사항 확인
   ```

5. **DB 인덱스 추가** (15분)
   ```bash
   # 마이그레이션 파일 생성 후
   supabase db push
   ```

---

## 🚨 주의사항

### 프로덕션 배포 전 체크리스트

- [ ] .env 파일에 실제 API 키 설정
- [ ] Supabase RLS 정책 검증
- [ ] CSRF Secret 실제 랜덤 값으로 변경
- [ ] Upstash Redis 설정 및 테스트
- [ ] 보안 헤더 프로덕션 환경 확인
- [ ] 에러 추적 서비스 연동 (Sentry 등)
- [ ] 로그 모니터링 설정
- [ ] 백업 전략 수립
- [ ] 도메인 DNS 설정
- [ ] SSL 인증서 설정

### 성능 모니터링

배포 후 지속적으로 확인:
- Vercel Analytics (트래픽, 성능)
- Supabase Dashboard (DB 쿼리 성능)
- Upstash Console (Redis 히트율)
- Anthropic Console (AI API 사용량)

---

## 📚 참고 문서

- **Next.js 15 최적화**: https://nextjs.org/docs/app/building-your-application/optimizing
- **Supabase Performance**: https://supabase.com/docs/guides/database/performance
- **Web Vitals**: https://web.dev/vitals/
- **Playwright E2E**: https://playwright.dev/docs/intro
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

**작성자**: Claude Code Analysis Team
**버전**: 1.0.0
**최종 업데이트**: 2025-12-21

**"ㄱ" 트리거 활성화됨** - 다음에 "ㄱ"이라고 입력하시면 이 로드맵이 다시 표시됩니다.
