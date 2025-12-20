/**
 * @module useSpreadsheet
 * @description 스프레드시트 상태 관리 핵심 훅
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import type { HotTableClass } from '@handsontable/react';
import type Handsontable from 'handsontable';
import { useCellSelection, type CellRef } from './useCellSelection';

export interface UseSpreadsheetOptions {
  onCellChange?: (row: number, col: number, oldValue: unknown, newValue: unknown) => void;
  onSelectionChange?: (cell: CellRef | null) => void;
}

export interface UseSpreadsheetReturn {
  // Refs
  hotRef: React.RefObject<HotTableClass | null>;

  // Cell Selection State
  selectedCell: CellRef | null;
  selectedRange: ReturnType<typeof useCellSelection>['selectedRange'];

  // Editing State
  editingValue: string;
  isEditing: boolean;

  // Actions
  setEditingValue: (value: string) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  commitEditing: () => void;
  updateCellFromFormula: (value: string) => void;

  // Selection
  selectCell: (row: number, col: number, value: unknown) => void;
  getCellAddress: (row: number, col: number) => string;
  getRangeAddress: () => string | null;

  // Data
  getCellValue: (row: number, col: number) => unknown;
  setCellValue: (row: number, col: number, value: unknown) => void;
}

/**
 * 스프레드시트 상태 관리 훅
 */
export function useSpreadsheet(options: UseSpreadsheetOptions = {}): UseSpreadsheetReturn {
  const { onCellChange, onSelectionChange } = options;

  const hotRef = useRef<HotTableClass | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const {
    selectedCell,
    selectedRange,
    selectCell: selectCellInternal,
    getCellAddress,
    getRangeAddress,
  } = useCellSelection();

  // 셀 선택 핸들러
  const selectCell = useCallback(
    (row: number, col: number, value: unknown) => {
      selectCellInternal(row, col, value);
      setEditingValue(value?.toString() || '');
      setIsEditing(false);
      onSelectionChange?.({ row, col, value });
    },
    [selectCellInternal, onSelectionChange]
  );

  // 편집 시작
  const startEditing = useCallback(() => {
    if (selectedCell) {
      setIsEditing(true);
    }
  }, [selectedCell]);

  // 편집 취소
  const cancelEditing = useCallback(() => {
    if (selectedCell) {
      setEditingValue(selectedCell.value?.toString() || '');
    }
    setIsEditing(false);
  }, [selectedCell]);

  // 편집 커밋
  const commitEditing = useCallback(() => {
    if (!selectedCell || !isEditing) return;

    const hot = hotRef.current?.hotInstance as Handsontable | undefined;
    if (!hot) return;

    const oldValue = hot.getDataAtCell(selectedCell.row, selectedCell.col);
    if (oldValue !== editingValue) {
      hot.setDataAtCell(selectedCell.row, selectedCell.col, editingValue);
      onCellChange?.(selectedCell.row, selectedCell.col, oldValue, editingValue);
    }

    setIsEditing(false);
  }, [selectedCell, isEditing, editingValue, onCellChange]);

  // 수식 바에서 값 변경
  const updateCellFromFormula = useCallback(
    (value: string) => {
      if (!selectedCell) return;

      const hot = hotRef.current?.hotInstance as Handsontable | undefined;
      if (!hot) return;

      const oldValue = hot.getDataAtCell(selectedCell.row, selectedCell.col);
      if (oldValue !== value) {
        hot.setDataAtCell(selectedCell.row, selectedCell.col, value);
        onCellChange?.(selectedCell.row, selectedCell.col, oldValue, value);
      }
    },
    [selectedCell, onCellChange]
  );

  // 셀 값 가져오기
  const getCellValue = useCallback((row: number, col: number): unknown => {
    const hot = hotRef.current?.hotInstance as Handsontable | undefined;
    return hot?.getDataAtCell(row, col);
  }, []);

  // 셀 값 설정
  const setCellValue = useCallback(
    (row: number, col: number, value: unknown) => {
      const hot = hotRef.current?.hotInstance as Handsontable | undefined;
      if (!hot) return;

      const oldValue = hot.getDataAtCell(row, col);
      hot.setDataAtCell(row, col, value);
      onCellChange?.(row, col, oldValue, value);
    },
    [onCellChange]
  );

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      if (e.key === 'Enter' && isEditing) {
        e.preventDefault();
        commitEditing();
      } else if (e.key === 'Escape' && isEditing) {
        e.preventDefault();
        cancelEditing();
      } else if (e.key === 'F2' && !isEditing) {
        e.preventDefault();
        startEditing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, isEditing, commitEditing, cancelEditing, startEditing]);

  return {
    hotRef,
    selectedCell,
    selectedRange,
    editingValue,
    isEditing,
    setEditingValue,
    startEditing,
    cancelEditing,
    commitEditing,
    updateCellFromFormula,
    selectCell,
    getCellAddress,
    getRangeAddress,
    getCellValue,
    setCellValue,
  };
}
