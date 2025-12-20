'use client';

/**
 * @module FormulaBar
 * @description Google Sheets 스타일 수식 바
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, Sparkles, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { CellRef } from './hooks/useCellSelection';

interface FormulaBarProps {
  selectedCell: CellRef | null;
  cellAddress: string | null;
  value: string;
  isEditing: boolean;
  onValueChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  onStartEditing: () => void;
  onAIFunction?: (fn: string) => void;
}

// AI 함수 목록
const AI_FUNCTIONS = [
  { name: 'AI_SUMMARY', description: '공고 요약', example: '=AI_SUMMARY()' },
  { name: 'AI_SCORE', description: '낙찰 확률 예측', example: '=AI_SCORE()' },
  { name: 'AI_MATCH', description: '제품 매칭', example: '=AI_MATCH()' },
  { name: 'AI_KEYWORDS', description: '키워드 추출', example: '=AI_KEYWORDS()' },
  { name: 'AI_DEADLINE', description: 'D-Day 계산', example: '=AI_DEADLINE()' },
  { name: 'AI', description: '자유 질문', example: '=AI("질문내용")' },
];

export function FormulaBar({
  selectedCell,
  cellAddress,
  value,
  isEditing,
  onValueChange,
  onCommit,
  onCancel,
  onStartEditing,
  onAIFunction,
}: FormulaBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);

  // 셀 선택 시 포커스 처리
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onCommit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === '=' && value === '') {
        // = 입력 시 AI 함수 메뉴 표시
        setShowAIMenu(true);
      }
    },
    [onCommit, onCancel, value]
  );

  // AI 함수 삽입
  const handleInsertAIFunction = useCallback(
    (fn: string) => {
      const formula = `=${fn}()`;
      onValueChange(formula);
      setShowAIMenu(false);
      onAIFunction?.(fn);
    },
    [onValueChange, onAIFunction]
  );

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-white border-b">
      {/* 셀 주소 표시 */}
      <div className="flex items-center min-w-[80px]">
        <span
          className={cn(
            'px-2 py-1 text-sm font-mono rounded',
            selectedCell ? 'bg-muted text-foreground' : 'text-muted-foreground'
          )}
        >
          {cellAddress || '-'}
        </span>
      </div>

      {/* 구분선 */}
      <div className="h-6 w-px bg-border" />

      {/* 편집 컨트롤 */}
      {isEditing && (
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onCancel}
            title="취소 (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-success-600 hover:text-success-600"
            onClick={onCommit}
            title="확인 (Enter)"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 수식 입력 */}
      <div className="flex-1 flex items-center gap-1">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onStartEditing}
          placeholder={selectedCell ? '값을 입력하세요...' : '셀을 선택하세요'}
          disabled={!selectedCell}
          className={cn(
            'h-7 text-sm font-mono border-0 shadow-none focus-visible:ring-0',
            value.startsWith('=') && 'text-blue-600'
          )}
        />
      </div>

      {/* AI 함수 드롭다운 */}
      <DropdownMenu open={showAIMenu} onOpenChange={setShowAIMenu}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            disabled={!selectedCell}
            title="AI 함수"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            AI 함수
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {AI_FUNCTIONS.map((fn) => (
            <DropdownMenuItem
              key={fn.name}
              onClick={() => handleInsertAIFunction(fn.name)}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="font-mono text-sm text-blue-600">{fn.example}</span>
              <span className="text-xs text-muted-foreground">{fn.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
