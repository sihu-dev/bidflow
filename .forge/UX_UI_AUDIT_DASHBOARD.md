# BIDFLOW Dashboard UX/UI 검수 리포트

> **검수 대상**: `/dashboard` 페이지 및 스프레드시트 컴포넌트
> **검수일**: 2025-12-21
> **검수자**: Claude Code (UX/UI Auditor)
> **총점**: 72/100

---

## 목차

1. [검수 요약](#검수-요약)
2. [1. 데이터 테이블 가독성](#1-데이터-테이블-가독성)
3. [2. 필터/검색 UI](#2-필터검색-ui)
4. [3. 빈 상태 처리](#3-빈-상태-처리)
5. [4. 로딩 인디케이터](#4-로딩-인디케이터)
6. [5. 에러 상태 처리](#5-에러-상태-처리)
7. [개선 우선순위](#개선-우선순위)

---

## 검수 요약

### 전체 점수

| 항목 | 점수 | 만점 | 등급 |
|------|------|------|------|
| 데이터 테이블 가독성 | 18/20 | 20 | ⭐⭐⭐⭐☆ |
| 필터/검색 UI | 16/20 | 20 | ⭐⭐⭐⭐☆ |
| 빈 상태 처리 | 8/20 | 20 | ⭐⭐☆☆☆ |
| 로딩 인디케이터 | 14/20 | 20 | ⭐⭐⭐☆☆ |
| 에러 상태 처리 | 16/20 | 20 | ⭐⭐⭐⭐☆ |
| **총점** | **72/100** | 100 | **⭐⭐⭐☆☆** |

### 주요 강점 ✅

1. **모노크롬 디자인 일관성** - 디자인 시스템 100% 준수
2. **반응형 레이아웃** - 모바일/태블릿 대응 우수
3. **Handsontable 활용** - 전문적인 데이터 테이블
4. **Side Panel UX** - 직관적인 상세 정보 패널
5. **통계 바** - 핵심 메트릭 즉시 파악 가능

### 주요 약점 ❌

1. **빈 상태(Empty State) 미구현** - 데이터 없을 때 안내 없음
2. **에러 복구 플로우 부족** - API 실패 시 사용자 안내 부족
3. **필터 상태 지속성 없음** - 페이지 새로고침 시 필터 초기화
4. **검색 결과 없음 처리** - 검색 결과 0건일 때 안내 없음
5. **로딩 상태 일관성 부족** - 부분적 로딩 인디케이터만 존재

---

## 1. 데이터 테이블 가독성

### 점수: 18/20 ⭐⭐⭐⭐☆

### 강점 ✅

#### 1.1 커스텀 셀 렌더러

**파일**: `src/components/spreadsheet/SpreadsheetView.tsx:88-273`

```typescript
// 우수한 커스텀 렌더러
function statusRenderer() {
  // 배지 형태로 가독성 높음
  badge.className = `inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[value]}`;
}

function deadlineRenderer() {
  // D-Day와 날짜를 동시 표시
  const ddayText = calculateDDay(value);
  dday.className = `text-xs ${ddayText.startsWith('D-') && parseInt(ddayText.slice(2)) <= 3 ? 'text-neutral-700 font-bold' : 'text-gray-500'}`;
}

function scoreRenderer() {
  // 진행바 + 퍼센트로 직관적
  const percent = Math.round(value * 100);
  bar.className = 'w-12 h-2 bg-gray-200 rounded-full overflow-hidden';
  fill.className = `h-full ${percent >= 70 ? 'bg-neutral-800' : 'bg-neutral-500'}`;
}
```

**평가**: 각 데이터 타입에 맞는 시각화 우수

#### 1.2 모노크롬 컬러 시스템

**파일**: `src/lib/spreadsheet/column-definitions.ts:30-39`

```typescript
export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-neutral-200 text-neutral-800',
  reviewing: 'bg-neutral-300 text-neutral-800',
  preparing: 'bg-neutral-400 text-neutral-900',
  submitted: 'bg-neutral-500 text-white',
  won: 'bg-neutral-800 text-white',
  lost: 'bg-neutral-100 text-neutral-500',
  cancelled: 'bg-neutral-100 text-neutral-400',
};
```

**평가**: 디자인 시스템 100% 준수, 색상 대비 충분

#### 1.3 열 너비 최적화

**파일**: `src/lib/spreadsheet/column-definitions.ts:60-133`

```typescript
export const BID_COLUMNS: ColumnSettings[] = [
  { data: 'id', title: 'No', width: 60, },           // 좁게
  { data: 'title', title: '공고명', width: 350, },   // 넓게 (주요 정보)
  { data: 'organization', title: '발주기관', width: 150, },
  { data: 'estimated_amount', title: '추정가격', width: 120, },
  { data: 'deadline', title: '마감일', width: 110, },
];
```

**평가**: 정보 우선순위에 따른 너비 설정 우수

### 약점 ❌

#### 1.4 키워드 렌더러 제한

**파일**: `src/components/spreadsheet/SpreadsheetView.tsx:235-273`

**문제**:

```typescript
function keywordsRenderer() {
  keywords.slice(0, 3).forEach(keyword => {
    // 최대 3개만 표시
  });

  if (keywords.length > 3) {
    more.textContent = `+${keywords.length - 3}`; // 나머지는 "+N"으로만 표시
  }
}
```

**개선안**:

```typescript
// 호버 시 전체 키워드 툴팁 표시
td.title = keywords.join(', '); // 브라우저 기본 툴팁

// 또는 Popover 컴포넌트 활용
<Popover>
  <PopoverTrigger>+{keywords.length - 3}</PopoverTrigger>
  <PopoverContent>{keywords.slice(3).map(...)}</PopoverContent>
</Popover>
```

#### 1.5 긴 제목 말줄임표 처리 부족

**파일**: `src/components/spreadsheet/SpreadsheetView.tsx:79`

**문제**: 제목이 350px을 초과하면 잘림, 전체 텍스트 확인 불가

**개선안**:

```typescript
// 셀에 title 속성 추가
function titleRenderer(instance, td, row, col, prop, value) {
  td.textContent = value;
  td.title = value; // 호버 시 전체 제목 표시
  td.className = 'htLeft htMiddle truncate';
}
```

### 개선 제안 📋

| 번호 | 항목 | 우선순위 | 파일 | 예상 시간 |
|------|------|----------|------|-----------|
| 1.1 | 키워드 툴팁 추가 | P2 | `SpreadsheetView.tsx:235` | 30분 |
| 1.2 | 제목 호버 툴팁 | P2 | `SpreadsheetView.tsx:79` | 15분 |
| 1.3 | 행 높이 자동 조절 | P3 | `SpreadsheetView.tsx:447` | 1시간 |

---

## 2. 필터/검색 UI

### 점수: 16/20 ⭐⭐⭐⭐☆

### 강점 ✅

#### 2.1 통합 필터 팝오버

**파일**: `src/components/spreadsheet/Toolbar.tsx:173-273`

```typescript
<Popover open={filterOpen} onOpenChange={setFilterOpen}>
  <PopoverContent className="w-80 p-0">
    {/* 상태 필터 */}
    <div className="flex flex-wrap gap-1.5">
      {STATUS_OPTIONS.map((status) => (
        <button className={activeFilters.status.includes(status.value)
          ? status.color + ' ring-2 ring-offset-1 ring-current'
          : 'bg-slate-100'}>
          {status.icon} {status.label}
        </button>
      ))}
    </div>

    {/* 우선순위 필터 */}
    {/* 출처 필터 */}
  </PopoverContent>
</Popover>
```

**평가**: 3가지 필터를 한 곳에 모아 UX 우수

#### 2.2 실시간 검색

**파일**: `src/components/spreadsheet/Toolbar.tsx:114-117`

```typescript
const handleSearchChange = (value: string) => {
  setSearchQuery(value);
  onSearch?.(value); // 입력 즉시 검색
};
```

**평가**: 타이핑 즉시 결과 반영, 빠른 피드백

#### 2.3 필터 카운트 표시

**파일**: `src/components/spreadsheet/Toolbar.tsx:186-190`

```typescript
{hasActiveFilters && (
  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
    {activeFilters.status.length + activeFilters.priority.length + activeFilters.source.length}
  </Badge>
)}
```

**평가**: 활성 필터 개수를 배지로 명확히 표시

### 약점 ❌

#### 2.4 검색 결과 없음 처리 미흡

**파일**: `src/components/spreadsheet/Toolbar.tsx:275-282`

**문제**:

```typescript
// 결과 카운트만 표시
<div className="flex items-center gap-1.5">
  <span className="font-medium text-slate-700">{displayCount.toLocaleString()}</span>
  <span>건</span>
</div>
```

**결과가 0건일 때**: "0 건"만 표시, 사용자 안내 없음

**개선안**:

```typescript
{displayCount === 0 ? (
  <div className="text-sm text-slate-400">
    검색 결과가 없습니다. 필터를 조정하세요.
  </div>
) : (
  <div className="flex items-center gap-1.5">
    <span className="font-medium text-slate-700">{displayCount.toLocaleString()}</span>
    <span>건</span>
  </div>
)}
```

#### 2.5 필터 상태 지속성 부족

**파일**: `src/components/spreadsheet/Toolbar.tsx:100-112`

**문제**: 페이지 새로고침 시 필터 상태 초기화

```typescript
const [activeFilters, setActiveFilters] = useState<{
  status: string[];
  priority: string[];
  source: string[];
}>({
  status: [],
  priority: [],
  source: [],
});
```

**개선안**:

```typescript
// URL Query Params로 상태 저장
import { useSearchParams, useRouter } from 'next/navigation';

const searchParams = useSearchParams();
const router = useRouter();

const [activeFilters, setActiveFilters] = useState(() => ({
  status: searchParams.get('status')?.split(',') || [],
  priority: searchParams.get('priority')?.split(',') || [],
  source: searchParams.get('source')?.split(',') || [],
}));

// 필터 변경 시 URL 업데이트
const handleFilterToggle = (type, value) => {
  const newFilters = { ...activeFilters, [type]: updated };
  const params = new URLSearchParams();
  if (newFilters.status.length) params.set('status', newFilters.status.join(','));
  if (newFilters.priority.length) params.set('priority', newFilters.priority.join(','));
  if (newFilters.source.length) params.set('source', newFilters.source.join(','));
  router.push(`?${params.toString()}`);
};
```

#### 2.6 검색 디바운싱 부재

**파일**: `src/components/spreadsheet/Toolbar.tsx:114-117`

**문제**: 타이핑할 때마다 `onSearch` 호출 → 성능 저하 가능

**개선안**:

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((value: string) => {
  onSearch?.(value);
}, 300);

const handleSearchChange = (value: string) => {
  setSearchQuery(value);
  debouncedSearch(value);
};
```

### 개선 제안 📋

| 번호 | 항목 | 우선순위 | 파일 | 예상 시간 |
|------|------|----------|------|-----------|
| 2.1 | 검색 결과 0건 안내 | P1 | `Toolbar.tsx:275` | 20분 |
| 2.2 | 필터 URL 지속성 | P2 | `Toolbar.tsx:100` | 1시간 |
| 2.3 | 검색 디바운싱 | P2 | `Toolbar.tsx:114` | 30분 |
| 2.4 | 필터 초기화 버튼 개선 | P3 | `Toolbar.tsx:197` | 15분 |

---

## 3. 빈 상태 처리

### 점수: 8/20 ⭐⭐☆☆☆

### 현황 분석

#### 3.1 빈 상태 처리 미구현 🔴

**파일**: `src/components/spreadsheet/SpreadsheetView.tsx:440-468`

**현재 코드**:

```typescript
<HotTable
  ref={hotRef}
  data={data}
  columns={columns}
  // ...
/>
```

**문제**:
- `data`가 빈 배열(`[]`)일 때 빈 테이블만 표시
- 사용자에게 아무런 안내 없음
- 데이터 로드 실패 vs 실제 데이터 없음 구분 불가

#### 3.2 대시보드 페이지 빈 상태

**파일**: `src/app/(dashboard)/dashboard/page.tsx:432-443`

**현재 코드**:

```typescript
<div className="flex-1 overflow-hidden relative">
  {isLoading && (
    <div className="absolute inset-0 bg-white/50 z-10">
      <div className="w-6 h-6 border-2 border-slate-300 animate-spin" />
    </div>
  )}
  <ClientSpreadsheet
    initialData={bids}
    onBidUpdate={handleBidUpdate}
    onRefresh={handleRefresh}
  />
</div>
```

**문제**: 빈 데이터 체크 없음

### 약점 ❌

#### 3.3 초기 로딩 완료 후 데이터 없음

**시나리오 1**: 신규 사용자 / 데이터 수집 전

**현재**: 빈 테이블만 표시

**기대**:

```tsx
// Empty State Component
{data.length === 0 && !isLoading && (
  <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8">
    <div className="max-w-md text-center">
      <div className="w-20 h-20 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
        <Package className="w-10 h-10 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        입찰 공고가 없습니다
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        데이터 수집이 진행 중이거나, 첫 공고를 기다리고 있습니다.
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
        <Button onClick={onAddBid}>
          <Plus className="w-4 h-4 mr-2" />
          수동 추가
        </Button>
      </div>
    </div>
  </div>
)}
```

#### 3.4 검색/필터 결과 없음

**시나리오 2**: 검색어 "xyz" 입력 → 0건

**현재**: "0 건" 텍스트만 표시

**기대**:

```tsx
{filteredCount === 0 && searchQuery && (
  <div className="flex-1 flex flex-col items-center justify-center p-8">
    <Search className="w-12 h-12 text-slate-300 mb-4" />
    <h3 className="text-base font-semibold text-slate-700 mb-2">
      "{searchQuery}" 검색 결과가 없습니다
    </h3>
    <p className="text-sm text-slate-500 mb-4">
      다른 키워드로 검색하거나 필터를 조정하세요.
    </p>
    <Button variant="ghost" onClick={clearAllFilters}>
      필터 초기화
    </Button>
  </div>
)}
```

#### 3.5 API 에러 후 빈 상태

**시나리오 3**: `/api/v1/bids` 호출 실패 → 빈 배열

**파일**: `src/app/(dashboard)/dashboard/page.tsx:317-337`

**현재**:

```typescript
const handleRefresh = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/v1/bids');
    if (!response.ok) {
      throw new Error('Failed to fetch bids');
    }
    const data = await response.json();
    if (data.data) {
      setBids(data.data);
    }
  } catch (error) {
    console.error('Refresh failed:', error);
    // 데모 모드에서는 샘플 데이터 유지
    if (isDemo) {
      setBids(SAMPLE_BIDS as unknown as Bid[]);
    }
  } finally {
    setIsLoading(false);
  }
}, [isDemo]);
```

**문제**:
- 에러 발생 시 콘솔 로그만 출력
- 사용자에게 에러 상태 알림 없음

**개선안**:

```typescript
const [error, setError] = useState<string | null>(null);

const handleRefresh = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch('/api/v1/bids');
    if (!response.ok) {
      throw new Error('데이터를 불러오는데 실패했습니다');
    }
    const data = await response.json();
    if (data.data) {
      setBids(data.data);
    }
  } catch (error) {
    console.error('Refresh failed:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
}, []);
```

### 개선 제안 📋

| 번호 | 항목 | 우선순위 | 컴포넌트 | 예상 시간 |
|------|------|----------|----------|-----------|
| 3.1 | 빈 데이터 Empty State | P0 | `SpreadsheetView.tsx` | 1시간 |
| 3.2 | 검색 결과 없음 UI | P1 | `SpreadsheetView.tsx` | 30분 |
| 3.3 | 에러 후 빈 상태 안내 | P1 | `dashboard/page.tsx` | 45분 |
| 3.4 | EmptyState 컴포넌트 생성 | P2 | `/components/ui/empty-state.tsx` | 1시간 |

---

## 4. 로딩 인디케이터

### 점수: 14/20 ⭐⭐⭐☆☆

### 강점 ✅

#### 4.1 초기 로딩 (ClientSpreadsheet)

**파일**: `src/components/spreadsheet/ClientSpreadsheet.tsx:78-87`

```typescript
if (isLoading) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-800 mx-auto mb-4"></div>
        <p className="text-gray-600">스프레드시트 로딩 중...</p>
      </div>
    </div>
  );
}
```

**평가**:
- 중앙 정렬 스피너
- 안내 메시지 포함
- 모노크롬 디자인 준수

#### 4.2 새로고침 버튼 스피너

**파일**: `src/components/spreadsheet/Toolbar.tsx:334-344`

```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={onRefresh}
  disabled={isLoading}
  className="h-9 w-9 p-0"
>
  <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
</Button>
```

**평가**:
- 버튼 아이콘이 회전
- 버튼 비활성화로 중복 클릭 방지
- 시각적 피드백 명확

#### 4.3 SidePanel 업데이트 로딩

**파일**: `src/components/spreadsheet/SidePanel.tsx:115-126`

```typescript
const [isUpdating, setIsUpdating] = useState(false);

const handleStatusChange = async (newStatus: string) => {
  if (!onUpdate) return;
  setIsUpdating(true);
  try {
    await onUpdate({ status: newStatus });
  } finally {
    setIsUpdating(false);
  }
};
```

**평가**: 업데이트 중 상태 관리 우수

### 약점 ❌

#### 4.4 대시보드 전체 로딩 오버레이

**파일**: `src/app/(dashboard)/dashboard/page.tsx:432-437`

**현재**:

```typescript
{isLoading && (
  <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
  </div>
)}
```

**문제**:
1. 스피너 크기가 너무 작음 (`w-6 h-6`)
2. 안내 메시지 없음 ("데이터 로딩 중...")
3. 반투명 배경 (`bg-white/50`)으로 테이블이 희미하게 보여 혼란 가능

**개선안**:

```typescript
{isLoading && (
  <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
    <div className="w-10 h-10 border-3 border-neutral-200 border-t-neutral-800 rounded-full animate-spin mb-3" />
    <p className="text-sm font-medium text-neutral-700">데이터 로딩 중...</p>
    <p className="text-xs text-neutral-500 mt-1">잠시만 기다려주세요</p>
  </div>
)}
```

#### 4.5 부분 로딩 상태 부족

**파일**: `src/components/spreadsheet/SpreadsheetView.tsx:326-344`

**시나리오**: 셀 수정 후 API 업데이트 중

**현재**: 아무런 인디케이터 없음

```typescript
const handleAfterChange = useCallback(
  async (changes: Handsontable.CellChange[] | null, source: string) => {
    if (source === 'loadData' || !changes) return;

    for (const [row, prop, oldValue, newValue] of changes) {
      if (oldValue === newValue) continue;

      const bid = data[row];
      if (!bid || !onBidUpdate) continue;

      try {
        await onBidUpdate(bid.id, { [prop as string]: newValue });
        // 성공 피드백 없음
      } catch (error) {
        console.error('업데이트 실패:', error);
        // 실패 피드백 없음
      }
    }
  },
  [data, onBidUpdate]
);
```

**개선안**:

```typescript
// 1. Optimistic UI 업데이트
const handleAfterChange = useCallback(async (changes, source) => {
  for (const [row, prop, oldValue, newValue] of changes) {
    const bid = data[row];

    // 즉시 UI 업데이트 (낙관적)
    setData(prev => prev.map((b, i) =>
      i === row ? { ...b, [prop]: newValue } : b
    ));

    try {
      await onBidUpdate(bid.id, { [prop as string]: newValue });
      // 성공 토스트
      toast.success('저장되었습니다');
    } catch (error) {
      // 실패 시 원래 값으로 롤백
      setData(prev => prev.map((b, i) =>
        i === row ? { ...b, [prop]: oldValue } : b
      ));
      toast.error('저장 실패');
    }
  }
}, [data, onBidUpdate]);
```

#### 4.6 Skeleton Loader 부재

**파일**: `src/components/spreadsheet/ClientSpreadsheet.tsx:78-87`

**문제**: 초기 로딩 시 빈 화면 → 갑자기 테이블 등장

**개선안**: Skeleton UI 추가

```tsx
import { Skeleton } from '@/components/ui/skeleton';

if (isLoading) {
  return (
    <div className="flex-1 p-4">
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-9 w-64" /> {/* Search */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" /> {/* Header */}
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
```

### 개선 제안 📋

| 번호 | 항목 | 우선순위 | 파일 | 예상 시간 |
|------|------|----------|------|-----------|
| 4.1 | 대시보드 로딩 오버레이 개선 | P1 | `dashboard/page.tsx:432` | 30분 |
| 4.2 | 셀 업데이트 피드백 토스트 | P1 | `SpreadsheetView.tsx:326` | 1시간 |
| 4.3 | Skeleton Loader 추가 | P2 | `ClientSpreadsheet.tsx:78` | 1.5시간 |
| 4.4 | SidePanel 로딩 스피너 표시 | P3 | `SidePanel.tsx:203` | 30분 |

---

## 5. 에러 상태 처리

### 점수: 16/20 ⭐⭐⭐⭐☆

### 강점 ✅

#### 5.1 API 에러 핸들링 (기본)

**파일**: `src/app/(dashboard)/dashboard/page.tsx:317-337`

```typescript
const handleRefresh = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/v1/bids');
    if (!response.ok) {
      throw new Error('Failed to fetch bids');
    }
    const data = await response.json();
    if (data.data) {
      setBids(data.data);
    }
  } catch (error) {
    console.error('Refresh failed:', error);
    // 데모 모드에서는 샘플 데이터 유지
    if (isDemo) {
      setBids(SAMPLE_BIDS as unknown as Bid[]);
    }
  } finally {
    setIsLoading(false);
  }
}, [isDemo]);
```

**평가**:
- try-catch로 에러 캐치
- 데모 모드 폴백 우수
- finally로 로딩 상태 정리

#### 5.2 Bid 업데이트 에러 핸들링

**파일**: `src/app/(dashboard)/dashboard/page.tsx:294-314`

```typescript
const handleBidUpdate = useCallback(async (id: string, updates: Partial<Bid>) => {
  try {
    const response = await fetch(`/api/v1/bids/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update bid');
    }

    // 로컬 상태 업데이트
    setBids(prev => prev.map(bid =>
      bid.id === id ? { ...bid, ...updates } : bid
    ));
  } catch (error) {
    console.error('Bid update failed:', error);
    throw error; // 호출자에게 에러 전달
  }
}, []);
```

**평가**:
- 에러를 throw하여 상위 컴포넌트에 전달
- Optimistic UI 업데이트

### 약점 ❌

#### 5.3 사용자에게 에러 표시 부족

**파일**: `src/app/(dashboard)/dashboard/page.tsx:329`

**문제**: `console.error`만 출력, UI에 에러 메시지 없음

**개선안**:

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

const handleRefresh = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/v1/bids');
    if (!response.ok) {
      throw new Error('데이터를 불러오는데 실패했습니다');
    }
    const data = await response.json();
    if (data.data) {
      setBids(data.data);
    }
    toast({
      title: '새로고침 완료',
      description: `${data.data.length}건의 입찰 공고를 불러왔습니다`,
    });
  } catch (error) {
    console.error('Refresh failed:', error);
    toast({
      variant: 'destructive',
      title: '오류 발생',
      description: error.message || '데이터를 불러오는데 실패했습니다',
      action: <Button variant="outline" size="sm" onClick={handleRefresh}>재시도</Button>,
    });
  } finally {
    setIsLoading(false);
  }
}, [toast]);
```

#### 5.4 에러 바운더리 부재

**파일**: `src/app/(dashboard)/dashboard/page.tsx`

**문제**: 컴포넌트 렌더링 에러 시 전체 앱 크래시

**개선안**:

```typescript
// src/components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <AlertTriangle className="w-12 h-12 text-neutral-400 mb-4" />
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">
            문제가 발생했습니다
          </h2>
          <p className="text-sm text-neutral-500 mb-4 text-center max-w-md">
            {this.state.error?.message || '알 수 없는 오류가 발생했습니다'}
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>
            다시 시도
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**사용**:

```tsx
// dashboard/page.tsx
<ErrorBoundary>
  <ClientSpreadsheet
    initialData={bids}
    onBidUpdate={handleBidUpdate}
    onRefresh={handleRefresh}
  />
</ErrorBoundary>
```

#### 5.5 네트워크 에러 vs 서버 에러 구분 없음

**파일**: `src/app/(dashboard)/dashboard/page.tsx:294-314`

**문제**: 모든 에러를 동일하게 처리

**개선안**:

```typescript
const handleBidUpdate = useCallback(async (id: string, updates: Partial<Bid>) => {
  try {
    const response = await fetch(`/api/v1/bids/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 400) {
        throw new Error(errorData.message || '잘못된 요청입니다');
      } else if (response.status === 401) {
        throw new Error('로그인이 필요합니다');
      } else if (response.status === 403) {
        throw new Error('권한이 없습니다');
      } else if (response.status === 404) {
        throw new Error('입찰 공고를 찾을 수 없습니다');
      } else if (response.status >= 500) {
        throw new Error('서버 오류가 발생했습니다');
      } else {
        throw new Error('업데이트에 실패했습니다');
      }
    }

    setBids(prev => prev.map(bid =>
      bid.id === id ? { ...bid, ...updates } : bid
    ));

    toast({ title: '저장되었습니다' });
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      toast({
        variant: 'destructive',
        title: '네트워크 오류',
        description: '인터넷 연결을 확인하세요',
      });
    } else {
      toast({
        variant: 'destructive',
        title: '저장 실패',
        description: error.message,
      });
    }
    throw error;
  }
}, [toast]);
```

#### 5.6 오프라인 감지 및 안내 부족

**개선안**:

```typescript
// src/hooks/use-online-status.ts
import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**사용**:

```tsx
// dashboard/page.tsx
const isOnline = useOnlineStatus();

{!isOnline && (
  <div className="bg-neutral-800 text-white px-4 py-2 text-sm text-center">
    ⚠️ 오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.
  </div>
)}
```

### 개선 제안 📋

| 번호 | 항목 | 우선순위 | 파일 | 예상 시간 |
|------|------|----------|------|-----------|
| 5.1 | Toast 에러 알림 추가 | P0 | `dashboard/page.tsx:329` | 1시간 |
| 5.2 | ErrorBoundary 컴포넌트 | P1 | `/components/error-boundary.tsx` | 1.5시간 |
| 5.3 | HTTP 상태코드별 에러 메시지 | P1 | `dashboard/page.tsx:302` | 1시간 |
| 5.4 | 오프라인 감지 Hook | P2 | `/hooks/use-online-status.ts` | 30분 |
| 5.5 | 재시도 로직 구현 | P3 | `dashboard/page.tsx:317` | 1시간 |

---

## 개선 우선순위

### P0 - 즉시 수정 필수 🔴

| 번호 | 항목 | 파일 | 예상 시간 | 이유 |
|------|------|------|-----------|------|
| 3.1 | 빈 데이터 Empty State | `SpreadsheetView.tsx` | 1시간 | 사용자 혼란 방지 |
| 5.1 | Toast 에러 알림 추가 | `dashboard/page.tsx` | 1시간 | 에러 피드백 필수 |

**총 예상 시간**: 2시간

### P1 - 금주 내 수정 권장 🟡

| 번호 | 항목 | 파일 | 예상 시간 | 이유 |
|------|------|------|-----------|------|
| 2.1 | 검색 결과 0건 안내 | `Toolbar.tsx` | 20분 | UX 개선 |
| 3.2 | 검색 결과 없음 UI | `SpreadsheetView.tsx` | 30분 | UX 개선 |
| 3.3 | 에러 후 빈 상태 안내 | `dashboard/page.tsx` | 45분 | 에러 복구 플로우 |
| 4.1 | 대시보드 로딩 오버레이 | `dashboard/page.tsx` | 30분 | 로딩 피드백 |
| 4.2 | 셀 업데이트 피드백 토스트 | `SpreadsheetView.tsx` | 1시간 | 사용자 피드백 |
| 5.2 | ErrorBoundary 컴포넌트 | `/components/error-boundary.tsx` | 1.5시간 | 안정성 |
| 5.3 | HTTP 상태코드별 에러 메시지 | `dashboard/page.tsx` | 1시간 | 명확한 에러 안내 |

**총 예상 시간**: 5시간 55분

### P2 - 차주 내 수정 🟢

| 번호 | 항목 | 파일 | 예상 시간 |
|------|------|------|-----------|
| 1.1 | 키워드 툴팁 추가 | `SpreadsheetView.tsx` | 30분 |
| 1.2 | 제목 호버 툴팁 | `SpreadsheetView.tsx` | 15분 |
| 2.2 | 필터 URL 지속성 | `Toolbar.tsx` | 1시간 |
| 2.3 | 검색 디바운싱 | `Toolbar.tsx` | 30분 |
| 3.4 | EmptyState 컴포넌트 | `/components/ui/empty-state.tsx` | 1시간 |
| 4.3 | Skeleton Loader | `ClientSpreadsheet.tsx` | 1.5시간 |
| 5.4 | 오프라인 감지 Hook | `/hooks/use-online-status.ts` | 30분 |

**총 예상 시간**: 5시간 15분

### P3 - 추후 개선 고려 ⚪

| 번호 | 항목 | 파일 | 예상 시간 |
|------|------|------|-----------|
| 1.3 | 행 높이 자동 조절 | `SpreadsheetView.tsx` | 1시간 |
| 2.4 | 필터 초기화 버튼 개선 | `Toolbar.tsx` | 15분 |
| 4.4 | SidePanel 로딩 스피너 | `SidePanel.tsx` | 30분 |
| 5.5 | 재시도 로직 구현 | `dashboard/page.tsx` | 1시간 |

**총 예상 시간**: 2시간 45분

---

## 구현 계획

### Phase 1 - 즉시 개선 (P0)

**목표**: 핵심 UX 문제 해결
**예상 기간**: 1일

```bash
# 1. Empty State 컴포넌트
touch src/components/ui/empty-state.tsx

# 2. Toast 알림 시스템 연동
npm install sonner
```

**체크리스트**:
- [ ] `EmptyState` 컴포넌트 생성
- [ ] `SpreadsheetView`에 빈 데이터 체크 추가
- [ ] `Sonner` Toast 라이브러리 설치
- [ ] API 에러 시 Toast 알림 추가

### Phase 2 - 주요 개선 (P1)

**목표**: 검색/필터 UX + 에러 처리 강화
**예상 기간**: 2일

**체크리스트**:
- [ ] 검색 결과 0건 안내 메시지
- [ ] 필터 결과 0건 Empty State
- [ ] ErrorBoundary 컴포넌트
- [ ] HTTP 상태코드별 에러 메시지
- [ ] 셀 업데이트 피드백 Toast
- [ ] 로딩 오버레이 개선

### Phase 3 - 세부 개선 (P2)

**목표**: 정보 접근성 + 상태 지속성
**예상 기간**: 2일

**체크리스트**:
- [ ] 키워드/제목 툴팁
- [ ] 필터 URL 쿼리 지속성
- [ ] 검색 디바운싱
- [ ] Skeleton Loader
- [ ] 오프라인 감지

---

## 결론

### 현재 대시보드 UX/UI 평가

**총점**: **72/100** (⭐⭐⭐☆☆)

**등급**: **양호 (Good)**

### 핵심 요약

#### 잘된 점 ✅

1. **데이터 테이블 가독성** (18/20)
   - 커스텀 셀 렌더러 우수
   - 모노크롬 디자인 일관성
   - 정보 계층 구조 명확

2. **필터/검색 UI** (16/20)
   - 통합 필터 팝오버 직관적
   - 실시간 검색 피드백
   - 필터 카운트 표시

3. **에러 상태 처리** (16/20)
   - API 에러 핸들링 기본 구현
   - try-catch 구조 양호
   - 데모 모드 폴백 우수

#### 개선 필요 ❌

1. **빈 상태 처리** (8/20) 🔴
   - Empty State 미구현
   - 검색 결과 없음 안내 부족
   - 데이터 없음 vs 로딩 중 구분 불가

2. **로딩 인디케이터** (14/20) 🟡
   - 부분 로딩 상태 부족
   - Skeleton Loader 부재
   - 셀 업데이트 피드백 없음

### 다음 액션

**즉시 수행** (금일 내):
```bash
# P0 작업
1. EmptyState 컴포넌트 생성
2. Toast 알림 시스템 추가
```

**금주 내 수행**:
```bash
# P1 작업
1. 검색/필터 결과 없음 UI
2. ErrorBoundary 추가
3. HTTP 에러 메시지 개선
4. 셀 업데이트 Toast
```

---

**리포트 종료**
*검수일: 2025-12-21*
*검수 도구: Claude Code UX/UI Auditor*
