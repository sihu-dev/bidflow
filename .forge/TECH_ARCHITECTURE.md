# FORGEONE 입찰 자동화 - 기술 아키텍처

> **생성일**: 2025-12-19
> **버전**: v1.0
> **목적**: 제조업 B2B 입찰 자동화 시스템 기술 설계

---

## 1. 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FORGEONE PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    PRESENTATION LAYER                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │Dashboard │  │Spreadsheet│  │ Document │  │ Settings │        │    │
│  │  │   View   │  │   View   │  │  Editor  │  │  Panel   │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    APPLICATION LAYER                             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │    │
│  │  │ Spreadsheet  │  │   Pipeline   │  │     AI       │          │    │
│  │  │   Engine     │  │   Manager    │  │   Service    │          │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │    │
│  │  │   Crawler    │  │ Notification │  │   Document   │          │    │
│  │  │   Service    │  │   Service    │  │   Generator  │          │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      DATA LAYER                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │    │
│  │  │   Supabase   │  │    Redis     │  │  S3/Storage  │          │    │
│  │  │  PostgreSQL  │  │    Cache     │  │    Files     │          │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 기술 스택 상세

### 2.1 Frontend

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15.x | App Router, SSR/SSG |
| React | 19.x | UI 렌더링 |
| TypeScript | 5.x | 타입 안정성 |
| TailwindCSS | 4.x | 스타일링 |
| Handsontable | 14.x | 스프레드시트 엔진 |
| Zustand | 5.x | 상태 관리 |
| TanStack Query | 5.x | 서버 상태 관리 |
| Framer Motion | 11.x | 애니메이션 |

### 2.2 Backend

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js API Routes | 15.x | API 엔드포인트 |
| Supabase | 2.x | DB, Auth, Realtime |
| Inngest | 3.x | 백그라운드 작업, 스케줄링 |
| Upstash Redis | - | 캐싱, Rate Limiting |

### 2.3 AI & 외부 서비스

| 서비스 | 용도 |
|--------|------|
| Claude API | 문서 생성, 요약, 분석 |
| Playwright | 웹 크롤링 |
| Cheerio | HTML 파싱 |
| 카카오 알림톡 API | 알림 발송 |
| Resend | 이메일 발송 |

---

## 3. 데이터베이스 스키마

### 3.1 ERD

```
┌──────────────────┐     ┌──────────────────┐
│    workspaces    │     │      users       │
├──────────────────┤     ├──────────────────┤
│ id (PK)          │     │ id (PK)          │
│ name             │     │ email            │
│ owner_id (FK)    │────→│ name             │
│ settings         │     │ phone            │
│ created_at       │     │ created_at       │
└──────────────────┘     └──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐     ┌──────────────────┐
│      bids        │     │  bid_pipeline    │
├──────────────────┤     ├──────────────────┤
│ id (PK)          │←────│ id (PK)          │
│ workspace_id(FK) │     │ bid_id (FK)      │
│ source           │     │ stage            │
│ source_id        │     │ assignee_id (FK) │
│ title            │     │ notes            │
│ organization     │     │ result           │
│ amount           │     │ updated_at       │
│ deadline         │     └──────────────────┘
│ category         │
│ requirements     │     ┌──────────────────┐
│ raw_data         │     │    documents     │
│ ai_summary       │     ├──────────────────┤
│ win_probability  │     │ id (PK)          │
│ created_at       │←────│ bid_id (FK)      │
└──────────────────┘     │ type             │
                         │ name             │
┌──────────────────┐     │ content          │
│  company_assets  │     │ file_url         │
├──────────────────┤     │ ai_generated     │
│ id (PK)          │     │ version          │
│ workspace_id(FK) │     │ created_at       │
│ type             │     └──────────────────┘
│ name             │
│ file_url         │     ┌──────────────────┐
│ metadata         │     │   sheet_cells    │
│ expires_at       │     ├──────────────────┤
│ created_at       │     │ id (PK)          │
└──────────────────┘     │ sheet_id (FK)    │
                         │ row              │
┌──────────────────┐     │ col              │
│     sheets       │     │ value            │
├──────────────────┤     │ formula          │
│ id (PK)          │────→│ computed_value   │
│ workspace_id(FK) │     │ ai_status        │
│ name             │     │ updated_at       │
│ type             │     └──────────────────┘
│ config           │
│ created_at       │
└──────────────────┘
```

### 3.2 SQL 스키마

```sql
-- 워크스페이스
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 입찰 공고
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'narajangteo', 'kepco', 'custom'
  source_id TEXT, -- 원본 공고 ID
  title TEXT NOT NULL,
  organization TEXT, -- 발주기관
  amount BIGINT, -- 예정가격
  deadline TIMESTAMPTZ, -- 마감일
  category TEXT[], -- 분류 태그
  requirements JSONB, -- 자격요건
  raw_data JSONB, -- 원본 데이터
  ai_summary TEXT, -- AI 요약
  win_probability REAL, -- 낙찰 확률 (0-1)
  status TEXT DEFAULT 'new', -- 'new', 'reviewing', 'preparing', 'submitted', 'won', 'lost', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 파이프라인 관리
CREATE TABLE bid_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
  stage TEXT NOT NULL, -- 'discovered', 'qualified', 'preparing', 'submitted', 'result'
  assignee_id UUID REFERENCES auth.users(id),
  notes TEXT,
  checklist JSONB DEFAULT '[]',
  result TEXT, -- 'won', 'lost', null
  result_amount BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 생성된 문서
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'proposal', 'pricing', 'technical_spec', 'certificate'
  name TEXT NOT NULL,
  content TEXT, -- 텍스트 컨텐츠
  file_url TEXT, -- 파일 URL
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT, -- 생성에 사용된 프롬프트
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 회사 자산 (재사용 자료)
CREATE TABLE company_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'business_license', 'certificate', 'past_proposal', 'product_catalog'
  name TEXT NOT NULL,
  file_url TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ, -- 만료일 (인증서 등)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 스프레드시트
CREATE TABLE sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'custom', -- 'bids', 'pipeline', 'custom'
  config JSONB DEFAULT '{}', -- 열 설정, 필터 등
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 스프레드시트 셀
CREATE TABLE sheet_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id UUID REFERENCES sheets(id) ON DELETE CASCADE,
  row INTEGER NOT NULL,
  col INTEGER NOT NULL,
  value TEXT,
  formula TEXT, -- =AI(), =SUM() 등
  computed_value TEXT, -- 수식 계산 결과
  ai_status TEXT, -- 'pending', 'computing', 'done', 'error'
  error_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sheet_id, row, col)
);

-- 알림 설정
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'kakao', 'email', 'slack'
  config JSONB NOT NULL, -- 채널별 설정
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 크롤링 작업
CREATE TABLE crawl_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  keywords TEXT[],
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheet_cells ENABLE ROW LEVEL SECURITY;

-- 워크스페이스 멤버 기반 접근 정책
CREATE POLICY "workspace_member_access" ON bids
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );
```

---

## 4. 스프레드시트 엔진

### 4.1 Handsontable 통합

```typescript
// lib/spreadsheet/engine.ts
import Handsontable from 'handsontable';
import { evaluateFormula } from './formula-parser';

interface SpreadsheetConfig {
  sheetId: string;
  readonly?: boolean;
  onCellChange?: (row: number, col: number, value: any) => void;
}

export function createSpreadsheetEngine(
  container: HTMLElement,
  config: SpreadsheetConfig
) {
  const hot = new Handsontable(container, {
    data: [],
    rowHeaders: true,
    colHeaders: true,
    contextMenu: true,
    formulas: true,
    licenseKey: 'non-commercial-and-evaluation',

    // 커스텀 셀 렌더러
    cells(row, col) {
      const cellProperties: any = {};
      const cellMeta = this.getCellMeta(row, col);

      // AI 수식 셀 스타일
      if (cellMeta.formula?.startsWith('=AI')) {
        cellProperties.renderer = aiCellRenderer;
      }

      return cellProperties;
    },

    // 셀 변경 핸들러
    afterChange(changes, source) {
      if (source === 'loadData') return;

      changes?.forEach(([row, col, oldValue, newValue]) => {
        // 수식 감지 및 처리
        if (typeof newValue === 'string' && newValue.startsWith('=')) {
          handleFormula(row, col as number, newValue);
        }

        config.onCellChange?.(row, col as number, newValue);
      });
    },
  });

  return hot;
}

// AI 셀 렌더러 (XSS 방지: textContent 사용)
function aiCellRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: any,
  cellProperties: any
) {
  const meta = instance.getCellMeta(row, col);

  // 기존 내용 초기화
  td.textContent = '';
  td.className = '';

  // AI 처리 중
  if (meta.aiStatus === 'computing') {
    const span = document.createElement('span');
    span.className = 'ai-loading';
    span.textContent = '⏳ AI 처리중...';
    td.appendChild(span);
    td.classList.add('ai-cell', 'computing');
  }
  // AI 완료
  else if (meta.aiStatus === 'done') {
    td.textContent = value;
    td.classList.add('ai-cell', 'done');
  }
  // AI 오류
  else if (meta.aiStatus === 'error') {
    const span = document.createElement('span');
    span.className = 'ai-error';
    span.textContent = `⚠️ ${meta.errorMessage || 'Error'}`;
    td.appendChild(span);
    td.classList.add('ai-cell', 'error');
  }
  else {
    td.textContent = value;
  }
}
```

### 4.2 AI 수식 파서

```typescript
// lib/spreadsheet/ai-functions.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface AIFunction {
  name: string;
  description: string;
  execute: (args: string[], context: SpreadsheetContext) => Promise<string>;
}

const AI_FUNCTIONS: Record<string, AIFunction> = {
  'AI': {
    name: 'AI',
    description: '자연어 프롬프트로 AI 응답 생성',
    execute: async (args, ctx) => {
      const prompt = args[0];
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    },
  },

  'AI_SUMMARY': {
    name: 'AI_SUMMARY',
    description: '범위 데이터 요약',
    execute: async (args, ctx) => {
      const range = parseRange(args[0]);
      const data = ctx.getCellRange(range);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `다음 데이터를 3줄로 요약해주세요:\n\n${JSON.stringify(data)}`,
        }],
      });
      return response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    },
  },

  'AI_EXTRACT': {
    name: 'AI_EXTRACT',
    description: 'PDF/문서에서 필드 추출',
    execute: async (args, ctx) => {
      const [fileUrl, field] = args;
      const fileContent = await ctx.getFileContent(fileUrl);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `다음 문서에서 "${field}" 정보를 추출해주세요:\n\n${fileContent}`,
        }],
      });
      return response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    },
  },

  'AI_SCORE': {
    name: 'AI_SCORE',
    description: '입찰 낙찰 확률 예측',
    execute: async (args, ctx) => {
      const bidId = args[0];
      const bid = await ctx.getBid(bidId);
      const history = await ctx.getBidHistory(ctx.workspaceId);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 64,
        messages: [{
          role: 'user',
          content: `
입찰 정보:
${JSON.stringify(bid)}

과거 입찰 이력:
${JSON.stringify(history)}

이 입찰의 낙찰 확률을 0-100% 숫자로만 응답해주세요.
          `,
        }],
      });
      const text = response.content[0].type === 'text'
        ? response.content[0].text
        : '0';
      return text.replace(/[^0-9]/g, '') + '%';
    },
  },

  'AI_PROPOSAL': {
    name: 'AI_PROPOSAL',
    description: '제안서 초안 생성',
    execute: async (args, ctx) => {
      const bidId = args[0];
      const bid = await ctx.getBid(bidId);
      const assets = await ctx.getCompanyAssets(ctx.workspaceId);
      const pastProposals = assets.filter(a => a.type === 'past_proposal');

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `
입찰 공고:
${JSON.stringify(bid)}

회사 과거 제안서 스타일:
${JSON.stringify(pastProposals.slice(0, 3))}

위 정보를 바탕으로 기술 제안서 초안을 작성해주세요.
구성: 1. 회사 소개 / 2. 수행 실적 / 3. 기술 역량 / 4. 수행 방안 / 5. 기대 효과
          `,
        }],
      });
      return response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    },
  },

  'AI_PRICE': {
    name: 'AI_PRICE',
    description: '적정 가격 추천',
    execute: async (args, ctx) => {
      const [bidId, margin = '10'] = args;
      const bid = await ctx.getBid(bidId);
      const history = await ctx.getBidHistory(ctx.workspaceId);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `
입찰 정보:
- 예정가격: ${bid.amount}
- 분류: ${bid.category}

과거 낙찰 이력:
${JSON.stringify(history.filter(h => h.result === 'won').slice(0, 10))}

마진율 ${margin}%를 고려하여 적정 입찰가를 추천해주세요.
숫자와 간단한 근거만 응답해주세요.
          `,
        }],
      });
      return response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    },
  },
};

// 수식 파서
export function parseFormula(formula: string): { fn: string; args: string[] } | null {
  const match = formula.match(/^=(\w+)\((.*)\)$/);
  if (!match) return null;

  const fn = match[1].toUpperCase();
  const argsStr = match[2];

  // 인자 파싱 (쉼표 분리, 따옴표 고려)
  const args = parseArgs(argsStr);

  return { fn, args };
}

export async function executeFormula(
  formula: string,
  context: SpreadsheetContext
): Promise<string> {
  const parsed = parseFormula(formula);
  if (!parsed) return '#ERROR: Invalid formula';

  const handler = AI_FUNCTIONS[parsed.fn];
  if (!handler) return `#ERROR: Unknown function ${parsed.fn}`;

  try {
    return await handler.execute(parsed.args, context);
  } catch (error) {
    return `#ERROR: ${error.message}`;
  }
}
```

---

## 5. 크롤링 시스템

### 5.1 Inngest 백그라운드 작업

```typescript
// lib/crawling/inngest.ts
import { Inngest } from 'inngest';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

const inngest = new Inngest({ id: 'forgeone' });

// 크롤링 스케줄러
export const crawlScheduler = inngest.createFunction(
  { id: 'crawl-scheduler' },
  { cron: '0 9,15,21 * * *' }, // 매일 9시, 15시, 21시
  async ({ step }) => {
    const activeJobs = await step.run('get-active-jobs', async () => {
      return supabase.from('crawl_jobs')
        .select('*')
        .eq('status', 'active');
    });

    // 각 작업에 대해 크롤링 이벤트 발행
    for (const job of activeJobs.data || []) {
      await step.sendEvent('crawl-job', {
        name: 'crawl/execute',
        data: { jobId: job.id },
      });
    }
  }
);

// 나라장터 크롤링
export const narajangtoCrawler = inngest.createFunction(
  { id: 'narajangto-crawler' },
  { event: 'crawl/narajangto' },
  async ({ event, step }) => {
    const { keywords, workspaceId } = event.data;

    const results = await step.run('crawl-narajangto', async () => {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      const bids: any[] = [];

      for (const keyword of keywords) {
        await page.goto(`https://www.g2b.go.kr/pt/menu/selectSubFrame.do`);
        await page.fill('#bidNm', keyword);
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        const html = await page.content();
        const $ = cheerio.load(html);

        // 공고 목록 파싱
        $('table.list tbody tr').each((i, el) => {
          bids.push({
            source: 'narajangto',
            source_id: $(el).find('td:nth-child(1)').text().trim(),
            title: $(el).find('td:nth-child(2)').text().trim(),
            organization: $(el).find('td:nth-child(3)').text().trim(),
            deadline: $(el).find('td:nth-child(5)').text().trim(),
            amount: parseAmount($(el).find('td:nth-child(4)').text()),
          });
        });
      }

      await browser.close();
      return bids;
    });

    // AI 요약 생성
    const enrichedBids = await step.run('ai-enrich', async () => {
      return Promise.all(results.map(async (bid) => {
        const summary = await generateAISummary(bid);
        return { ...bid, ai_summary: summary };
      }));
    });

    // DB 저장
    await step.run('save-bids', async () => {
      const { error } = await supabase.from('bids').upsert(
        enrichedBids.map(b => ({ ...b, workspace_id: workspaceId })),
        { onConflict: 'source,source_id' }
      );
      if (error) throw error;
    });

    // 알림 발송
    await step.run('send-notifications', async () => {
      if (enrichedBids.length > 0) {
        await sendNotification(workspaceId, {
          type: 'new_bids',
          count: enrichedBids.length,
          bids: enrichedBids.slice(0, 5),
        });
      }
    });

    return { crawled: enrichedBids.length };
  }
);
```

---

## 6. 알림 시스템

### 6.1 카카오 알림톡

```typescript
// lib/notifications/kakao.ts
interface KakaoAlimtalkRequest {
  templateCode: string;
  recipientNo: string;
  variables: Record<string, string>;
}

export async function sendKakaoAlimtalk(req: KakaoAlimtalkRequest) {
  const response = await fetch('https://api-alimtalk.cloud.toast.com/alimtalk/v2.2/appkeys/{appKey}/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Secret-Key': process.env.KAKAO_SECRET_KEY!,
    },
    body: JSON.stringify({
      templateCode: req.templateCode,
      recipientList: [{
        recipientNo: req.recipientNo,
        templateParameter: req.variables,
      }],
    }),
  });

  return response.json();
}

// 알림 템플릿
export const TEMPLATES = {
  NEW_BID: 'TP_NEW_BID',
  DEADLINE_D3: 'TP_DEADLINE_D3',
  DEADLINE_D1: 'TP_DEADLINE_D1',
  RESULT: 'TP_RESULT',
};

// 마감 알림 스케줄러
export const deadlineNotifier = inngest.createFunction(
  { id: 'deadline-notifier' },
  { cron: '0 9 * * *' }, // 매일 오전 9시
  async ({ step }) => {
    // D-3 알림
    const d3Bids = await step.run('get-d3-bids', async () => {
      const d3 = new Date();
      d3.setDate(d3.getDate() + 3);

      return supabase.from('bids')
        .select('*, workspaces(owner_id)')
        .gte('deadline', d3.toISOString())
        .lt('deadline', new Date(d3.getTime() + 86400000).toISOString())
        .in('status', ['reviewing', 'preparing']);
    });

    for (const bid of d3Bids.data || []) {
      await sendKakaoAlimtalk({
        templateCode: TEMPLATES.DEADLINE_D3,
        recipientNo: bid.workspaces.phone,
        variables: {
          bidTitle: bid.title,
          deadline: formatDate(bid.deadline),
          link: `https://forgeone.io/bids/${bid.id}`,
        },
      });
    }
  }
);
```

---

## 7. API 엔드포인트

### 7.1 라우트 구조

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── callback/route.ts
├── bids/
│   ├── route.ts              # GET: 목록, POST: 수동 등록
│   ├── [id]/route.ts         # GET, PATCH, DELETE
│   └── [id]/pipeline/route.ts
├── documents/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── generate/route.ts     # AI 문서 생성
├── sheets/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── [id]/cells/route.ts   # 셀 데이터
├── crawl/
│   ├── jobs/route.ts
│   └── trigger/route.ts      # 수동 크롤링 트리거
├── ai/
│   ├── formula/route.ts      # AI 수식 실행
│   └── summary/route.ts
└── notifications/
    └── settings/route.ts
```

### 7.2 예시 API

```typescript
// app/api/bids/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const supabase = createServerClient(/* ... */);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('bids')
    .select('*, bid_pipeline(*)', { count: 'exact' })
    .order('deadline', { ascending: true })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count });
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const body = await request.json();

  // 수동 입찰 등록
  const { data, error } = await supabase
    .from('bids')
    .insert({
      ...body,
      source: 'manual',
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 파이프라인 초기화
  await supabase.from('bid_pipeline').insert({
    bid_id: data.id,
    stage: 'discovered',
  });

  return NextResponse.json(data);
}
```

---

## 8. 배포 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │  API Routes  │  │   Inngest    │      │
│  │   (Edge)     │  │  (Serverless)│  │   (Workers)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│     Supabase     │ │   Upstash Redis  │ │    Cloudflare    │
│  (PostgreSQL)    │ │     (Cache)      │ │    R2 (Files)    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│                    External Services                          │
├──────────────────────────────────────────────────────────────┤
│  Claude API │ 카카오 알림톡 │ Resend │ 나라장터/조달청       │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. 성능 최적화

### 9.1 캐싱 전략

| 데이터 | 캐시 위치 | TTL |
|--------|----------|-----|
| 입찰 목록 | Redis | 5분 |
| AI 수식 결과 | Redis | 1시간 |
| 정적 자산 | CDN | 1일 |
| 사용자 세션 | Redis | 24시간 |

### 9.2 AI 비용 최적화

```typescript
// AI 결과 캐싱
async function cachedAI(prompt: string, options: { ttl?: number } = {}) {
  const cacheKey = `ai:${hashPrompt(prompt)}`;

  // 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // AI 호출
  const result = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  // 캐시 저장
  await redis.setex(cacheKey, options.ttl || 3600, JSON.stringify(result));

  return result;
}
```

---

## 10. 보안

### 10.1 인증/인가

- Supabase Auth (Magic Link + OAuth)
- Row Level Security (RLS) 적용
- JWT 토큰 기반 API 인증

### 10.2 데이터 보안

- 민감 정보 암호화 (AES-256)
- 파일 업로드 검증
- SQL Injection 방지 (Parameterized Query)

### 10.3 API 보안

- Rate Limiting (Upstash)
- CORS 설정
- API Key 관리

---

*Generated by Claude 4.5 Opus*
*Version: v1.0*
