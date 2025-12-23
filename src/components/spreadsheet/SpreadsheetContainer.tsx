'use client';

/**
 * @module SpreadsheetContainer
 * @description Google Sheets 스타일 스프레드시트 컨테이너
 */

import { useCallback, type ReactNode } from 'react';
import { FormulaBar } from './FormulaBar';
import { useSpreadsheet } from './hooks/useSpreadsheet';
import { logger } from '@/lib/utils/logger';

interface Bid {
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

interface SpreadsheetContainerProps {
  children: (props: {
    hotRef: ReturnType<typeof useSpreadsheet>['hotRef'];
    onSelectionChange: (row: number, col: number) => void;
    onCellChange: (
      changes: Array<[number, string | number, unknown, unknown]> | null
    ) => void;
  }) => ReactNode;
  initialData?: Bid[];
  onBidUpdate?: (id: string, updates: Partial<Bid>) => Promise<void>;
  toolbar?: ReactNode;
}

// 컬럼 키 매핑
const COLUMN_KEYS = [
  'id',
  'source',
  'external_id',
  'title',
  'organization',
  'deadline',
  'estimated_amount',
  'status',
  'priority',
  'type',
  'keywords',
  'match_score',
  'ai_summary',
  'url',
] as const;

export function SpreadsheetContainer({
  children,
  initialData = [],
  onBidUpdate,
  toolbar,
}: SpreadsheetContainerProps) {
  const spreadsheet = useSpreadsheet({
    onCellChange: useCallback(
      async (row: number, col: number, _oldValue: unknown, newValue: unknown) => {
        if (!onBidUpdate || !initialData[row]) return;

        const bid = initialData[row];
        const columnKey = COLUMN_KEYS[col];
        if (!columnKey) return;

        try {
          await onBidUpdate(bid.id, { [columnKey]: newValue });
        } catch (error) {
          logger.error('셀 업데이트 실패:', error);
        }
      },
      [onBidUpdate, initialData]
    ),
  });

  const {
    hotRef,
    selectedCell,
    editingValue,
    isEditing,
    setEditingValue,
    startEditing,
    cancelEditing,
    commitEditing,
    selectCell,
    getRangeAddress,
    getCellValue,
  } = spreadsheet;

  // Handsontable 셀 선택 이벤트 핸들러
  const handleSelectionChange = useCallback(
    (row: number, col: number) => {
      const value = getCellValue(row, col);
      selectCell(row, col, value);
    },
    [getCellValue, selectCell]
  );

  // Handsontable 셀 변경 이벤트 핸들러
  const handleCellChange = useCallback(
    (changes: Array<[number, string | number, unknown, unknown]> | null) => {
      if (!changes) return;

      // 외부에서 변경된 경우 (Handsontable 내부 편집)
      // 이미 useSpreadsheet에서 처리하므로 여기서는 상태만 업데이트
      for (const [row, col, , newValue] of changes) {
        const colIndex = typeof col === 'number' ? col : COLUMN_KEYS.indexOf(col as typeof COLUMN_KEYS[number]);
        if (
          selectedCell &&
          selectedCell.row === row &&
          selectedCell.col === colIndex
        ) {
          setEditingValue(newValue?.toString() || '');
        }
      }
    },
    [selectedCell, setEditingValue]
  );

  // AI 함수 실행
  const handleAIFunction = useCallback(
    async (fn: string) => {
      if (!selectedCell || !initialData[selectedCell.row]) return;

      try {
        const bid = initialData[selectedCell.row];
        const response = await fetch('/api/v1/ai/formula', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formula: `=${fn}()`,
            context: {
              bidId: bid.id,
              row: selectedCell.row,
              col: selectedCell.col,
              cellData: bid,
            },
          }),
        });

        const data = await response.json();
        if (data.success && data.result) {
          setEditingValue(data.result);
        }
      } catch (error) {
        logger.error('AI 함수 실행 실패:', error);
      }
    },
    [selectedCell, initialData, setEditingValue]
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 툴바 */}
      {toolbar && <div className="shrink-0">{toolbar}</div>}

      {/* 수식 바 */}
      <FormulaBar
        selectedCell={selectedCell}
        cellAddress={getRangeAddress()}
        value={editingValue}
        isEditing={isEditing}
        onValueChange={setEditingValue}
        onCommit={commitEditing}
        onCancel={cancelEditing}
        onStartEditing={startEditing}
        onAIFunction={handleAIFunction}
      />

      {/* 스프레드시트 영역 */}
      <div className="flex-1 overflow-hidden">
        {children({
          hotRef,
          onSelectionChange: handleSelectionChange,
          onCellChange: handleCellChange,
        })}
      </div>
    </div>
  );
}
