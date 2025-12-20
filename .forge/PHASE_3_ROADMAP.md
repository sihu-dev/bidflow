# BIDFLOW Phase 3 로드맵 - 최우선 작업 상세 설계

> **생성일**: 2025-12-20
> **목표**: Production Ready 배포
> **예상 소요**: 2-3주

---

## Executive Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BIDFLOW Phase 3 로드맵                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   현재 상태: Phase 1-2 완료 (85/100점)                                   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  P0 (Critical)     │  P1 (High)         │  P2 (Medium)         │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │  1. 인프라 설정     │  4. 나라장터 API   │  6. AI 셀 함수       │   │
│   │  2. 환경변수 구성   │  5. UI 스프레드시트│  7. 크롤링 자동화    │   │
│   │  3. DB 마이그레이션 │                    │  8. 알림 시스템      │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   목표: MVP 배포 가능 상태 달성                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## P0-1: 인프라 설정 (Supabase + Upstash)

### 1.1 Supabase 프로젝트 생성

**단계별 가이드:**

```bash
# 1. Supabase CLI 설치 (이미 설치된 경우 생략)
npm install -g supabase

# 2. 로그인
supabase login

# 3. 프로젝트 링크
supabase link --project-ref <your-project-ref>

# 4. 마이그레이션 적용
supabase db push
```

**Supabase 대시보드 설정:**

| 항목 | 설정값 | 설명 |
|------|--------|------|
| Region | Northeast Asia (Seoul) | 최소 지연 |
| Plan | Free → Pro (필요시) | 500MB → 8GB |
| Auth Providers | Email, Kakao | 소셜 로그인 |
| RLS | Enabled | 행 수준 보안 |

**필수 환경변수 (Supabase):**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.2 Upstash Redis 설정

**생성 절차:**

1. https://console.upstash.com 접속
2. Create Database 클릭
3. Region: `ap-northeast-1` (Tokyo) 선택
4. TLS 활성화

**필수 환경변수 (Upstash):**

```env
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx...
```

**Rate Limiting 설정:**

```typescript
// 현재 구현된 rate-limiter.ts 설정값
const rateLimits = {
  default: { requests: 60, window: '1m' },    // 일반 API
  search: { requests: 30, window: '1m' },     // 검색
  ai: { requests: 10, window: '1m' },         // AI 호출
  admin: { requests: 120, window: '1m' },     // 관리자
};
```

---

## P0-2: 환경변수 전체 구성

### 2.1 필수 환경변수 체크리스트

```env
# ============================================================
# BIDFLOW 환경 변수 (.env.local)
# ============================================================

# [필수] Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# [필수] Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# [필수] 보안
CSRF_SECRET=                    # 32자 이상 랜덤 문자열

# [필수] AI
ANTHROPIC_API_KEY=

# [선택] 공공데이터 API
NARA_JANGTO_API_KEY=           # 나라장터
TED_API_KEY=                    # EU TED
SAM_GOV_API_KEY=                # 미국 SAM.gov

# [선택] 알림
KAKAO_ALIMTALK_KEY=
RESEND_API_KEY=
SLACK_WEBHOOK_URL=
```

### 2.2 환경변수 검증 로직 (이미 구현됨)

```typescript
// bidflow/src/lib/validation/env.ts
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  CSRF_SECRET: z.string().min(32),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
});
```

---

## P0-3: DB 마이그레이션 적용

### 3.1 마이그레이션 실행

```bash
cd /home/sihu2129/bidflow/bidflow

# 1. Supabase 링크 확인
supabase link

# 2. 마이그레이션 상태 확인
supabase db diff

# 3. 마이그레이션 적용
supabase db push

# 4. 확인
supabase db status
```

### 3.2 생성되는 테이블 목록

| 테이블 | 설명 | 인덱스 수 |
|--------|------|----------|
| `profiles` | 사용자 프로필 | 1 |
| `bids` | 입찰 공고 | 9 |
| `bid_pipeline` | 파이프라인 상태 | 3 |
| `documents` | 첨부 문서 | 1 |
| `company_assets` | 회사 자산/제품 | 2 |
| `sheets` | 스프레드시트 | 1 |
| `sheet_cells` | 셀 데이터 | 2 |
| `crawl_jobs` | 크롤링 작업 | 1 |
| `notification_configs` | 알림 설정 | 1 |

### 3.3 RLS 정책 확인

```sql
-- 적용된 RLS 정책 확인
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

---

## P1-4: 나라장터 API 연동

### 4.1 공공데이터포털 API 신청

**신청 URL:** https://www.data.go.kr/data/15000766/openapi.do

**필요한 API 목록:**

| API명 | 용도 | 일일 호출 |
|-------|------|----------|
| 입찰공고정보 | 공고 조회 | 1,000 |
| 낙찰정보 | 결과 조회 | 1,000 |
| 계약정보 | 계약 상세 | 1,000 |

### 4.2 나라장터 API 클라이언트 설계

```typescript
// bidflow/src/lib/clients/narajangto-api.ts

import { z } from 'zod';

// API 응답 스키마
const BidNoticeSchema = z.object({
  bidNtceNo: z.string(),           // 입찰공고번호
  bidNtceNm: z.string(),           // 입찰공고명
  ntceInsttNm: z.string(),         // 공고기관명
  dminsttNm: z.string(),           // 수요기관명
  presmptPrce: z.number(),         // 추정가격
  bidBeginDt: z.string(),          // 입찰시작일
  bidClseDt: z.string(),           // 입찰마감일
  bidNtceDtlUrl: z.string(),       // 상세 URL
  ntceKindNm: z.string(),          // 공고종류
  prcrmntMthdNm: z.string(),       // 조달방법
  cntrctMthdNm: z.string(),        // 계약방법
});

export type BidNotice = z.infer<typeof BidNoticeSchema>;

export class NaraJangtoClient {
  private readonly baseUrl = 'http://apis.data.go.kr/1230000';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 물품 입찰공고 검색
   */
  async searchProductBids(params: {
    keywords?: string[];
    fromDate?: Date;
    toDate?: Date;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<BidNotice[]> {
    const url = new URL(`${this.baseUrl}/BidPublicInfoService04/getBidPblancListInfoThng`);

    url.searchParams.set('serviceKey', this.apiKey);
    url.searchParams.set('pageNo', String(params.pageNo || 1));
    url.searchParams.set('numOfRows', String(params.numOfRows || 100));
    url.searchParams.set('type', 'json');

    if (params.fromDate) {
      url.searchParams.set('inqryBgnDt', formatDate(params.fromDate));
    }
    if (params.toDate) {
      url.searchParams.set('inqryEndDt', formatDate(params.toDate));
    }
    if (params.keywords?.length) {
      url.searchParams.set('bidNtceNm', params.keywords.join(' '));
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    return z.array(BidNoticeSchema).parse(data.response.body.items || []);
  }

  /**
   * 유량계 관련 입찰 검색 (씨엠엔텍 전용)
   */
  async searchFlowMeterBids(options?: {
    fromDate?: Date;
    toDate?: Date;
  }): Promise<BidNotice[]> {
    const flowMeterKeywords = [
      '유량계',
      '초음파유량계',
      '전자유량계',
      '계측기',
      '수도미터',
      '열량계',
      '상수도계량',
    ];

    const allResults: BidNotice[] = [];

    for (const keyword of flowMeterKeywords) {
      const results = await this.searchProductBids({
        keywords: [keyword],
        ...options,
      });
      allResults.push(...results);
    }

    // 중복 제거
    const uniqueResults = Array.from(
      new Map(allResults.map(b => [b.bidNtceNo, b])).values()
    );

    return uniqueResults;
  }
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}
```

### 4.3 데이터 매핑

```typescript
// narajangto → bids 테이블 매핑
function mapNaraJangtoBid(notice: BidNotice): Partial<Bid> {
  return {
    source: 'narajangto',
    external_id: notice.bidNtceNo,
    title: notice.bidNtceNm,
    organization: notice.ntceInsttNm,
    deadline: new Date(notice.bidClseDt),
    estimated_amount: notice.presmptPrce,
    url: notice.bidNtceDtlUrl,
    type: 'product',
    status: 'new',
    raw_data: notice,
  };
}
```

---

## P1-5: UI 스프레드시트 컴포넌트

### 5.1 컴포넌트 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    SpreadsheetView                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────────────────────┐   │
│  │  Toolbar    │  │              Handsontable                │   │
│  │  - 필터     │  │  ┌─────┬─────┬─────┬─────┬─────┬─────┐  │   │
│  │  - 정렬     │  │  │ No  │제목 │기관 │금액 │마감 │상태 │  │   │
│  │  - 뷰 전환  │  │  ├─────┼─────┼─────┼─────┼─────┼─────┤  │   │
│  │  - AI 함수  │  │  │  1  │ ... │ ... │ ... │ ... │ ... │  │   │
│  └─────────────┘  │  │  2  │ ... │ ... │ ... │ ... │ ... │  │   │
│                   │  │  3  │ ... │ ... │ ... │ ... │ ... │  │   │
│  ┌─────────────┐  │  │  :  │     │     │     │     │     │  │   │
│  │ SidePanel   │  │  └─────┴─────┴─────┴─────┴─────┴─────┘  │   │
│  │ - 상세정보  │  └─────────────────────────────────────────┘   │
│  │ - AI 요약   │                                                 │
│  │ - 파이프라인│                                                 │
│  └─────────────┘                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 파일 구조

```
bidflow/src/
├── components/
│   ├── spreadsheet/
│   │   ├── index.ts
│   │   ├── SpreadsheetView.tsx       # 메인 컨테이너
│   │   ├── Toolbar.tsx               # 상단 도구바
│   │   ├── BidTable.tsx              # Handsontable 래퍼
│   │   ├── SidePanel.tsx             # 우측 상세 패널
│   │   ├── FilterPopover.tsx         # 필터 팝오버
│   │   ├── ColumnConfig.tsx          # 열 설정
│   │   └── hooks/
│   │       ├── useSpreadsheetData.ts # 데이터 페칭
│   │       ├── useColumnResize.ts    # 열 크기 조절
│   │       └── useAIFormula.ts       # AI 수식 처리
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── ...
└── lib/
    └── spreadsheet/
        ├── column-definitions.ts     # 열 정의
        ├── cell-renderers.ts         # 셀 렌더러
        └── formula-parser.ts         # 수식 파서
```

### 5.3 열 정의

```typescript
// bidflow/src/lib/spreadsheet/column-definitions.ts

import { type ColumnSettings } from 'handsontable/settings';

export const BID_COLUMNS: ColumnSettings[] = [
  {
    data: 'id',
    title: 'No',
    width: 50,
    readOnly: true,
  },
  {
    data: 'title',
    title: '공고명',
    width: 300,
    renderer: 'text',
  },
  {
    data: 'organization',
    title: '발주기관',
    width: 150,
  },
  {
    data: 'estimated_amount',
    title: '추정가격',
    width: 120,
    type: 'numeric',
    numericFormat: {
      pattern: '₩0,0',
    },
  },
  {
    data: 'deadline',
    title: '마감일',
    width: 120,
    type: 'date',
    dateFormat: 'YYYY-MM-DD',
  },
  {
    data: 'status',
    title: '상태',
    width: 100,
    type: 'dropdown',
    source: ['new', 'reviewing', 'preparing', 'submitted', 'won', 'lost'],
    renderer: 'statusRenderer',
  },
  {
    data: 'priority',
    title: '우선순위',
    width: 80,
    type: 'dropdown',
    source: ['high', 'medium', 'low'],
    renderer: 'priorityRenderer',
  },
  {
    data: 'match_score',
    title: '매칭점수',
    width: 100,
    type: 'numeric',
    readOnly: true,
    renderer: 'scoreRenderer',
  },
  {
    data: 'ai_summary',
    title: 'AI 요약',
    width: 200,
    readOnly: true,
    renderer: 'aiCellRenderer',
  },
];
```

### 5.4 메인 컴포넌트

```typescript
// bidflow/src/components/spreadsheet/SpreadsheetView.tsx

'use client';

import { useRef, useEffect, useState } from 'react';
import { HotTable, HotColumn } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.css';

import { Toolbar } from './Toolbar';
import { SidePanel } from './SidePanel';
import { BID_COLUMNS } from '@/lib/spreadsheet/column-definitions';
import { useSpreadsheetData } from './hooks/useSpreadsheetData';
import type { Bid } from '@/types';

registerAllModules();

export function SpreadsheetView() {
  const hotRef = useRef<HotTable>(null);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const { data, isLoading, refetch, updateBid } = useSpreadsheetData();

  const handleCellChange = async (
    changes: [number, string | number, unknown, unknown][] | null
  ) => {
    if (!changes) return;

    for (const [row, prop, oldValue, newValue] of changes) {
      if (oldValue === newValue) continue;

      const bid = data[row];
      if (!bid) continue;

      await updateBid(bid.id, { [prop]: newValue });
    }
  };

  const handleRowSelect = (row: number) => {
    const bid = data[row];
    if (bid) {
      setSelectedBid(bid);
      setSidePanelOpen(true);
    }
  };

  return (
    <div className="flex h-screen">
      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        <Toolbar onRefresh={refetch} />

        <div className="flex-1 overflow-auto">
          <HotTable
            ref={hotRef}
            data={data}
            columns={BID_COLUMNS}
            rowHeaders
            colHeaders
            contextMenu
            licenseKey="non-commercial-and-evaluation"
            height="100%"
            stretchH="all"
            afterChange={handleCellChange}
            afterSelectionEnd={(row) => handleRowSelect(row)}
            // 성능 최적화
            renderAllRows={false}
            viewportRowRenderingOffset={20}
          />
        </div>
      </div>

      {/* 사이드 패널 */}
      {sidePanelOpen && selectedBid && (
        <SidePanel
          bid={selectedBid}
          onClose={() => setSidePanelOpen(false)}
          onUpdate={(updates) => updateBid(selectedBid.id, updates)}
        />
      )}
    </div>
  );
}
```

### 5.5 커스텀 셀 렌더러

```typescript
// bidflow/src/lib/spreadsheet/cell-renderers.ts

import Handsontable from 'handsontable';

// 상태 배지 렌더러
export function statusRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string,
  value: string
) {
  td.innerHTML = '';
  td.className = '';

  const badge = document.createElement('span');
  badge.textContent = STATUS_LABELS[value] || value;
  badge.className = `inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[value]}`;

  td.appendChild(badge);
  td.classList.add('htCenter', 'htMiddle');
}

const STATUS_LABELS: Record<string, string> = {
  new: '신규',
  reviewing: '검토중',
  preparing: '준비중',
  submitted: '제출완료',
  won: '낙찰',
  lost: '유찰',
  cancelled: '취소',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-purple-100 text-purple-800',
  submitted: 'bg-green-100 text-green-800',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

// 우선순위 렌더러
export function priorityRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string,
  value: string
) {
  td.innerHTML = '';

  const colors: Record<string, string> = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  td.textContent = `${colors[value] || '⚪'} ${value}`;
  td.classList.add('htCenter', 'htMiddle');
}

// 매칭 점수 렌더러 (프로그레스 바)
export function scoreRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string,
  value: number
) {
  td.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'flex items-center gap-2';

  const bar = document.createElement('div');
  bar.className = 'flex-1 h-2 bg-gray-200 rounded-full overflow-hidden';

  const fill = document.createElement('div');
  fill.className = `h-full ${value > 0.7 ? 'bg-green-500' : value > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`;
  fill.style.width = `${value * 100}%`;

  bar.appendChild(fill);

  const label = document.createElement('span');
  label.className = 'text-xs text-gray-600';
  label.textContent = `${Math.round(value * 100)}%`;

  container.appendChild(bar);
  container.appendChild(label);
  td.appendChild(container);
}

// AI 셀 렌더러
export function aiCellRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string,
  value: string,
  cellProperties: Handsontable.CellProperties
) {
  td.innerHTML = '';
  td.className = '';

  const meta = instance.getCellMeta(row, col) as { aiStatus?: string; errorMessage?: string };

  if (meta.aiStatus === 'computing') {
    const loader = document.createElement('span');
    loader.className = 'animate-pulse text-gray-400';
    loader.textContent = '⏳ AI 분석중...';
    td.appendChild(loader);
  } else if (meta.aiStatus === 'error') {
    const error = document.createElement('span');
    error.className = 'text-red-500';
    error.textContent = `⚠️ ${meta.errorMessage || 'Error'}`;
    td.appendChild(error);
  } else {
    td.textContent = value || '-';
    td.className = 'text-gray-600 text-sm';
  }
}
```

---

## P2-6: AI 셀 함수 시스템

### 6.1 지원 함수 목록

| 함수 | 설명 | 예시 |
|------|------|------|
| `=AI(prompt)` | 자유 프롬프트 | `=AI("이 공고 요약")` |
| `=AI_SUMMARY(range)` | 범위 요약 | `=AI_SUMMARY(A1:F10)` |
| `=AI_SCORE(bidId)` | 낙찰 확률 | `=AI_SCORE("bid_123")` |
| `=AI_MATCH(bidId)` | 제품 매칭 | `=AI_MATCH("bid_123")` |
| `=AI_EXTRACT(url, field)` | PDF 추출 | `=AI_EXTRACT(G1, "납품기한")` |

### 6.2 수식 파서

```typescript
// bidflow/src/lib/spreadsheet/formula-parser.ts

import { z } from 'zod';

const FormulaSchema = z.object({
  fn: z.string(),
  args: z.array(z.string()),
});

export function parseFormula(formula: string) {
  if (!formula.startsWith('=')) return null;

  const match = formula.match(/^=([A-Z_]+)\((.*)\)$/i);
  if (!match) return null;

  const fn = match[1].toUpperCase();
  const argsStr = match[2];

  // 인자 파싱 (따옴표, 쉼표 처리)
  const args = parseArgs(argsStr);

  return FormulaSchema.parse({ fn, args });
}

function parseArgs(str: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (const char of str) {
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === ',' && !inQuotes) {
      args.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args.map(arg => arg.replace(/^["']|["']$/g, ''));
}
```

### 6.3 AI 함수 실행 API

```typescript
// bidflow/src/app/api/v1/ai/formula/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/security/rate-limiter';
import { parseFormula } from '@/lib/spreadsheet/formula-parser';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  // Rate Limiting (AI 호출 제한)
  const rateLimitResult = await rateLimit(request, 'ai');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many AI requests' },
      { status: 429, headers: rateLimitResult.headers }
    );
  }

  const { formula, context } = await request.json();
  const parsed = parseFormula(formula);

  if (!parsed) {
    return NextResponse.json({ error: 'Invalid formula' }, { status: 400 });
  }

  try {
    const result = await executeAIFunction(parsed.fn, parsed.args, context);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI error' },
      { status: 500 }
    );
  }
}

async function executeAIFunction(
  fn: string,
  args: string[],
  context: { bidId?: string; sheetId?: string }
): Promise<string> {
  switch (fn) {
    case 'AI':
      return executeGeneralAI(args[0]);
    case 'AI_SUMMARY':
      return executeSummaryAI(args[0], context);
    case 'AI_SCORE':
      return executeScoreAI(args[0]);
    case 'AI_MATCH':
      return executeMatchAI(args[0]);
    default:
      throw new Error(`Unknown function: ${fn}`);
  }
}

async function executeGeneralAI(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
```

---

## P2-7: 크롤링 자동화 (Inngest)

### 7.1 크롤링 스케줄러

```typescript
// bidflow/src/inngest/functions/crawl-scheduler.ts

import { inngest } from '../client';
import { NaraJangtoClient } from '@/lib/clients/narajangto-api';
import { TedApiClient } from '@/lib/clients/ted-api';
import { createClient } from '@supabase/supabase-js';

export const scheduledCrawl = inngest.createFunction(
  { id: 'scheduled-bid-crawl' },
  { cron: '0 9,15,21 * * *' },  // 매일 9시, 15시, 21시
  async ({ step }) => {
    // 나라장터 크롤링
    const naraResults = await step.run('crawl-narajangto', async () => {
      const client = new NaraJangtoClient(process.env.NARA_JANGTO_API_KEY!);
      return client.searchFlowMeterBids({
        fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 최근 7일
      });
    });

    // TED 크롤링 (EU)
    const tedResults = await step.run('crawl-ted', async () => {
      const client = new TedApiClient(process.env.TED_API_KEY);
      return client.searchFlowMeterTenders({
        fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });
    });

    // DB 저장
    const saved = await step.run('save-bids', async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const allBids = [...naraResults, ...tedResults].map(mapToBid);

      const { data, error } = await supabase
        .from('bids')
        .upsert(allBids, { onConflict: 'source,external_id' })
        .select();

      if (error) throw error;
      return data;
    });

    // 알림 발송
    if (saved.length > 0) {
      await step.run('send-notification', async () => {
        // 카카오 알림톡 또는 Slack 웹훅
        await sendNewBidsNotification(saved);
      });
    }

    return { crawled: saved.length };
  }
);
```

### 7.2 Inngest 설정

```typescript
// bidflow/src/inngest/client.ts

import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'bidflow',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
```

```typescript
// bidflow/src/app/api/inngest/route.ts

import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { scheduledCrawl } from '@/inngest/functions/crawl-scheduler';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scheduledCrawl],
});
```

---

## P2-8: 알림 시스템

### 8.1 알림 채널

| 채널 | 용도 | 우선순위 |
|------|------|----------|
| 카카오 알림톡 | D-3, D-1 마감 알림 | P0 |
| 이메일 (Resend) | 일간 리포트 | P1 |
| Slack Webhook | 실시간 알림 | P1 |

### 8.2 알림 서비스

```typescript
// bidflow/src/lib/notifications/index.ts

import { sendKakaoAlimtalk } from './kakao';
import { sendEmail } from './resend';
import { sendSlackMessage } from './slack';

export type NotificationChannel = 'kakao' | 'email' | 'slack';

export interface NotificationPayload {
  type: 'new_bids' | 'deadline_d3' | 'deadline_d1' | 'result';
  recipients: string[];
  data: Record<string, unknown>;
}

export async function sendNotification(
  channels: NotificationChannel[],
  payload: NotificationPayload
) {
  const promises = channels.map(channel => {
    switch (channel) {
      case 'kakao':
        return sendKakaoAlimtalk(payload);
      case 'email':
        return sendEmail(payload);
      case 'slack':
        return sendSlackMessage(payload);
    }
  });

  return Promise.allSettled(promises);
}
```

---

## 실행 순서 요약

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         실행 순서                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Day 1-2: P0 인프라 설정                                                │
│   ├─ Supabase 프로젝트 생성                                              │
│   ├─ Upstash Redis 생성                                                  │
│   ├─ .env.local 환경변수 설정                                            │
│   └─ supabase db push 실행                                               │
│                                                                          │
│   Day 3-5: P1 나라장터 API                                               │
│   ├─ 공공데이터포털 API 신청                                             │
│   ├─ narajangto-api.ts 클라이언트 구현                                   │
│   └─ 데이터 매핑 및 테스트                                               │
│                                                                          │
│   Day 6-10: P1 UI 스프레드시트                                           │
│   ├─ SpreadsheetView 메인 컴포넌트                                       │
│   ├─ 커스텀 셀 렌더러                                                    │
│   ├─ 사이드 패널 (상세 정보)                                             │
│   └─ 필터/정렬 기능                                                      │
│                                                                          │
│   Day 11-14: P2 AI + 크롤링                                              │
│   ├─ AI 수식 파서 및 API                                                 │
│   ├─ Inngest 크롤링 스케줄러                                             │
│   └─ 알림 시스템                                                         │
│                                                                          │
│   Day 15+: 테스트 및 배포                                                │
│   ├─ E2E 테스트                                                          │
│   ├─ Vercel 배포                                                         │
│   └─ 모니터링 설정                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 환경변수 템플릿

```bash
# .env.example
# ============================================================
# BIDFLOW 환경 변수
# ============================================================

# [필수] Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# [필수] Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=

# [필수] 보안
CSRF_SECRET=your-32-character-or-longer-secret-key

# [필수] AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# [선택] 공공데이터 API
NARA_JANGTO_API_KEY=
TED_API_KEY=

# [선택] 알림
KAKAO_ALIMTALK_KEY=
RESEND_API_KEY=
SLACK_WEBHOOK_URL=

# [선택] Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

---

*Generated by Claude Opus 4.5*
*Date: 2025-12-20*
