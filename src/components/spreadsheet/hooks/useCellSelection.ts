/**
 * @module useCellSelection
 * @description 셀 선택 상태 관리 훅
 */

import { useState, useCallback } from 'react';

export interface CellRef {
  row: number;
  col: number;
  value: unknown;
}

export interface CellRange {
  start: CellRef;
  end: CellRef;
}

export interface UseCellSelectionReturn {
  selectedCell: CellRef | null;
  selectedRange: CellRange | null;
  isSelecting: boolean;
  selectCell: (row: number, col: number, value: unknown) => void;
  selectRange: (start: CellRef, end: CellRef) => void;
  clearSelection: () => void;
  getCellAddress: (row: number, col: number) => string;
  getRangeAddress: () => string | null;
}

/**
 * 컬럼 인덱스를 알파벳으로 변환 (0 -> A, 1 -> B, ..., 26 -> AA)
 */
function columnToLetter(col: number): string {
  let result = '';
  let temp = col;
  while (temp >= 0) {
    result = String.fromCharCode(65 + (temp % 26)) + result;
    temp = Math.floor(temp / 26) - 1;
  }
  return result;
}

/**
 * 셀 선택 상태 관리 훅
 */
export function useCellSelection(): UseCellSelectionReturn {
  const [selectedCell, setSelectedCell] = useState<CellRef | null>(null);
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const getCellAddress = useCallback((row: number, col: number): string => {
    return `${columnToLetter(col)}${row + 1}`;
  }, []);

  const selectCell = useCallback(
    (row: number, col: number, value: unknown) => {
      setSelectedCell({ row, col, value });
      setSelectedRange(null);
      setIsSelecting(false);
    },
    []
  );

  const selectRange = useCallback((start: CellRef, end: CellRef) => {
    setSelectedRange({ start, end });
    setSelectedCell(start);
    setIsSelecting(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCell(null);
    setSelectedRange(null);
    setIsSelecting(false);
  }, []);

  const getRangeAddress = useCallback((): string | null => {
    if (!selectedRange) {
      if (selectedCell) {
        return getCellAddress(selectedCell.row, selectedCell.col);
      }
      return null;
    }
    const startAddr = getCellAddress(selectedRange.start.row, selectedRange.start.col);
    const endAddr = getCellAddress(selectedRange.end.row, selectedRange.end.col);
    return startAddr === endAddr ? startAddr : `${startAddr}:${endAddr}`;
  }, [selectedCell, selectedRange, getCellAddress]);

  return {
    selectedCell,
    selectedRange,
    isSelecting,
    selectCell,
    selectRange,
    clearSelection,
    getCellAddress,
    getRangeAddress,
  };
}
