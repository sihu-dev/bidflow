'use client';

/**
 * BIDFLOW 스프레드시트 뷰
 * Handsontable 기반 입찰 관리 테이블
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import Handsontable from 'handsontable';
import type { HyperFormula as HyperFormulaType } from 'hyperformula';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

import { Toolbar } from './Toolbar';
import { SidePanel } from './SidePanel';
import {
  BID_COLUMNS,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  SOURCE_LABELS,
  calculateDDay,
  formatAmount,
} from '@/lib/spreadsheet/column-definitions';
import { exportToExcel, exportToCSV, exportToJSON } from '@/lib/spreadsheet/excel-export';
import { logger } from '@/lib/utils/logger';

// Handsontable 모듈 등록
registerAllModules();

// HyperFormula lazy load 상태를 위한 전역 캐시
let hyperformulaInstanceCache: HyperFormulaType | null = null;
let hyperformulaLoadPromise: Promise<HyperFormulaType> | null = null;

// HyperFormula lazy loader
async function loadHyperFormula() {
  if (hyperformulaInstanceCache) {
    return hyperformulaInstanceCache;
  }

  if (!hyperformulaLoadPromise) {
    hyperformulaLoadPromise = (async () => {
      const [{ HyperFormula }, { hyperFormulaConfig }] = await Promise.all([
        import('hyperformula'),
        import('@/lib/spreadsheet/formula-engine'),
      ]);
      hyperformulaInstanceCache = HyperFormula.buildEmpty(hyperFormulaConfig);
      return hyperformulaInstanceCache;
    })();
  }

  return hyperformulaLoadPromise;
}

// ============================================================================
// 타입 정의
// ============================================================================

export interface Bid {
  id: string;
  source: string;
  external_id: string;
  title: string;
  organization: string;
  deadline: string;
  estimated_amount: number | null;
  status: string;
  priority: string;
  type: string;
  keywords: string[];
  url: string | null;
  match_score?: number;
  ai_summary?: string | null;
  created_at: string;
  updated_at: string;
}

interface SpreadsheetViewProps {
  initialData?: Bid[];
  onBidUpdate?: (id: string, updates: Partial<Bid>) => Promise<void>;
  onBidCreate?: (bid: Partial<Bid>) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

// ============================================================================
// 커스텀 셀 렌더러
// ============================================================================

function statusRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: string
) {
  td.innerHTML = '';
  td.className = 'htCenter htMiddle';

  if (!value) return td;

  const badge = document.createElement('span');
  badge.textContent = STATUS_LABELS[value] || value;
  badge.className = `inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[value] || 'bg-gray-100 text-gray-800'}`;
  td.appendChild(badge);

  return td;
}

function priorityRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: string
) {
  td.innerHTML = '';
  td.className = 'htCenter htMiddle';

  if (!value) return td;

  const icon = PRIORITY_COLORS[value] || '⚪';
  td.textContent = icon;

  return td;
}

function sourceRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: string
) {
  td.innerHTML = '';
  td.className = 'htCenter htMiddle text-xs';

  td.textContent = SOURCE_LABELS[value] || value;

  return td;
}

function amountRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: number | null
) {
  td.innerHTML = '';
  td.className = 'htRight htMiddle';

  td.textContent = formatAmount(value);

  return td;
}

function deadlineRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: string
) {
  td.innerHTML = '';
  td.className = 'htCenter htMiddle';

  if (!value) return td;

  const container = document.createElement('div');
  container.className = 'flex flex-col items-center';

  const date = document.createElement('span');
  date.className = 'text-sm';
  date.textContent = value.slice(0, 10);

  const dday = document.createElement('span');
  const ddayText = calculateDDay(value);
  dday.className = `text-xs ${ddayText.startsWith('D-') && parseInt(ddayText.slice(2)) <= 3 ? 'text-neutral-700 font-bold' : 'text-gray-500'}`;
  dday.textContent = ddayText;

  container.appendChild(date);
  container.appendChild(dday);
  td.appendChild(container);

  return td;
}

function scoreRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: number
) {
  td.innerHTML = '';
  td.className = 'htCenter htMiddle';

  if (value === undefined || value === null) {
    td.textContent = '-';
    return td;
  }

  const percent = Math.round(value * 100);
  const container = document.createElement('div');
  container.className = 'flex items-center gap-1';

  const bar = document.createElement('div');
  bar.className = 'w-12 h-2 bg-gray-200 rounded-full overflow-hidden';

  const fill = document.createElement('div');
  fill.className = `h-full ${percent >= 70 ? 'bg-neutral-800' : percent >= 40 ? 'bg-neutral-500' : 'bg-neutral-400'}`;
  fill.style.width = `${percent}%`;

  bar.appendChild(fill);

  const label = document.createElement('span');
  label.className = 'text-xs text-gray-600';
  label.textContent = `${percent}%`;

  container.appendChild(bar);
  container.appendChild(label);
  td.appendChild(container);

  return td;
}

function keywordsRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: string | string[]
) {
  td.innerHTML = '';
  td.className = 'htLeft htMiddle';

  if (!value) return td;

  // 문자열이면 배열로 변환 (쉼표 구분)
  const keywords = Array.isArray(value) ? value : String(value).split(',').map(s => s.trim()).filter(Boolean);

  if (keywords.length === 0) return td;

  const container = document.createElement('div');
  container.className = 'flex flex-wrap gap-1';

  keywords.slice(0, 3).forEach(keyword => {
    const tag = document.createElement('span');
    tag.className = 'px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded';
    tag.textContent = keyword;
    container.appendChild(tag);
  });

  if (keywords.length > 3) {
    const more = document.createElement('span');
    more.className = 'text-xs text-gray-400';
    more.textContent = `+${keywords.length - 3}`;
    container.appendChild(more);
  }

  td.appendChild(container);

  return td;
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

// HyperFormula가 배열을 처리하지 못하므로 keywords를 문자열로 변환
function transformBidData(bids: Bid[]): Bid[] {
  return bids.map(bid => ({
    ...bid,
    keywords: Array.isArray(bid.keywords) ? bid.keywords.join(', ') : bid.keywords,
  })) as unknown as Bid[];
}

// ============================================================================
// 메인 컴포넌트
// ============================================================================

export function SpreadsheetView({
  initialData = [],
  onBidUpdate,
  onBidCreate: _onBidCreate,
  onRefresh,
}: SpreadsheetViewProps) {
  // TODO: onBidCreate will be used for new bid creation
  void _onBidCreate;
  const hotRef = useRef<HotTableClass | null>(null);
  // 초기 데이터를 미리 변환하여 HyperFormula 파싱 오류 방지
  const [data, setData] = useState<Bid[]>(() => transformBidData(initialData));
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formulaEngine, setFormulaEngine] = useState<HyperFormulaType | null>(null);

  // HyperFormula lazy load
  useEffect(() => {
    // 수식 기능이 필요한 경우에만 로드 (첫 렌더링 후 백그라운드 로드)
    const timer = setTimeout(() => {
      loadHyperFormula().then(engine => {
        setFormulaEngine(engine);
      });
    }, 1000); // 1초 후 백그라운드 로드

    return () => clearTimeout(timer);
  }, []);

  // 데이터 업데이트 (initialData 변경 시)
  useEffect(() => {
    setData(transformBidData(initialData));
  }, [initialData]);

  // 셀 변경 핸들러
  const handleAfterChange = useCallback(
    async (changes: Handsontable.CellChange[] | null, source: string) => {
      if (source === 'loadData' || !changes) return;

      for (const [row, prop, oldValue, newValue] of changes) {
        if (oldValue === newValue) continue;

        const bid = data[row];
        if (!bid || !onBidUpdate) continue;

        try {
          await onBidUpdate(bid.id, { [prop as string]: newValue });
        } catch (error) {
          logger.error('업데이트 실패:', error);
        }
      }
    },
    [data, onBidUpdate]
  );

  // 행 선택 핸들러
  const handleAfterSelectionEnd = useCallback(
    (row: number) => {
      const bid = data[row];
      if (bid) {
        setSelectedBid(bid);
        setSidePanelOpen(true);
      }
    },
    [data]
  );

  // 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;

    setIsLoading(true);
    try {
      await onRefresh();
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh]);

  // 내보내기 핸들러
  const handleExport = useCallback(
    async (format: 'csv' | 'excel' | 'json') => {
      const exportData = data.map(bid => ({
        id: bid.id,
        source: bid.source,
        external_id: bid.external_id,
        title: bid.title,
        organization: bid.organization,
        deadline: bid.deadline,
        estimated_amount: bid.estimated_amount,
        status: bid.status,
        priority: bid.priority,
        type: bid.type,
        keywords: bid.keywords,
        match_score: bid.match_score,
        ai_summary: bid.ai_summary,
        url: bid.url,
      }));

      switch (format) {
        case 'csv':
          exportToCSV(exportData);
          break;
        case 'excel':
          await exportToExcel(exportData);
          break;
        case 'json':
          exportToJSON(exportData);
          break;
      }
    },
    [data]
  );

  // 열 설정 (렌더러 적용)
  const columns = BID_COLUMNS.map(col => {
    switch (col.data) {
      case 'status':
        return { ...col, renderer: statusRenderer };
      case 'priority':
        return { ...col, renderer: priorityRenderer };
      case 'source':
        return { ...col, renderer: sourceRenderer };
      case 'estimated_amount':
        return { ...col, renderer: amountRenderer };
      case 'deadline':
        return { ...col, renderer: deadlineRenderer };
      case 'match_score':
        return { ...col, renderer: scoreRenderer };
      case 'keywords':
        return { ...col, renderer: keywordsRenderer };
      default:
        return col;
    }
  });

  return (
    <div className="flex h-full">
      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 툴바 */}
        <Toolbar
          onRefresh={handleRefresh}
          onExport={handleExport}
          isLoading={isLoading}
          totalCount={data.length}
        />

        {/* 테이블 */}
        <div className="flex-1 overflow-hidden ht-theme-main">
          <HotTable
            ref={hotRef}
            data={data}
            columns={columns}
            colHeaders={BID_COLUMNS.map(c => c.title || '')}
            rowHeaders
            height="100%"
            stretchH="all"
            licenseKey="non-commercial-and-evaluation"
            // 성능 최적화
            renderAllRows={false}
            viewportRowRenderingOffset={20}
            // 이벤트
            afterChange={handleAfterChange}
            afterSelectionEnd={(row: number) => handleAfterSelectionEnd(row)}
            // 스타일
            className="htCustom ht-theme-main"
            // 컨텍스트 메뉴
            contextMenu={['row_above', 'row_below', '---------', 'remove_row', '---------', 'copy', 'cut']}
            // 정렬
            columnSorting
            // 필터
            filters
            dropdownMenu={['filter_by_condition', 'filter_by_value', 'filter_action_bar']}
            // 수식 엔진 (HyperFormula) - lazy load 후 활성화
            {...(formulaEngine ? { formulas: { engine: formulaEngine } } : {})}
          />
        </div>
      </div>

      {/* 사이드 패널 */}
      {sidePanelOpen && selectedBid && (
        <SidePanel
          bid={selectedBid}
          onClose={() => setSidePanelOpen(false)}
          onUpdate={async (updates) => {
            if (onBidUpdate) {
              await onBidUpdate(selectedBid.id, updates);
            }
          }}
        />
      )}
    </div>
  );
}

export default SpreadsheetView;
