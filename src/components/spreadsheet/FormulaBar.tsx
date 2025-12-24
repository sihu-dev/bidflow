'use client';

/**
 * FormulaBar - 스마트 수식 입력 컴포넌트
 * Supabase UI 벤치마킹 기반 전문 디자인
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Check,
  X,
  Zap,
  ChevronDown,
  ChevronUp,
  FunctionSquare,
  FileText,
  TrendingUp,
  MessageSquare,
  Target,
  Lightbulb,
  Loader2,
  Copy,
} from 'lucide-react';
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
  isExecuting?: boolean;
}

// 스마트 함수 목록 (모노크롬) - AI_ prefix로 통일
const SMART_FUNCTIONS = [
  {
    name: 'AI_SUMMARY',
    description: '입찰 공고를 3줄로 요약',
    example: '=AI_SUMMARY()',
    icon: FileText,
    color: 'text-neutral-700',
    bg: 'bg-neutral-100',
  },
  {
    name: 'AI_SCORE',
    description: '낙찰 확률 예측 (0-100%)',
    example: '=AI_SCORE()',
    icon: TrendingUp,
    color: 'text-neutral-700',
    bg: 'bg-neutral-100',
  },
  {
    name: 'AI_MATCH',
    description: '자사 제품 매칭 점수',
    example: '=AI_MATCH()',
    icon: Target,
    color: 'text-neutral-700',
    bg: 'bg-neutral-100',
  },
  {
    name: 'AI_KEYWORDS',
    description: '핵심 키워드 3개 추출',
    example: '=AI_KEYWORDS()',
    icon: Lightbulb,
    color: 'text-neutral-700',
    bg: 'bg-neutral-100',
  },
  {
    name: 'AI_DEADLINE',
    description: 'D-Day 분석 및 액션 권고',
    example: '=AI_DEADLINE()',
    icon: Target,
    color: 'text-neutral-700',
    bg: 'bg-neutral-100',
  },
  {
    name: 'AI',
    description: '자유 질문 (커스텀 프롬프트)',
    example: '=AI("핵심 요구사항은?")',
    icon: MessageSquare,
    color: 'text-neutral-700',
    bg: 'bg-neutral-100',
  },
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
  isExecuting = false,
}: FormulaBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

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
        setShowAIMenu(true);
      }
    },
    [onCommit, onCancel, value]
  );

  // 스마트 함수 삽입
  const handleInsertSmartFunction = useCallback(
    (fn: string, example: string) => {
      onValueChange(example);
      setShowAIMenu(false);
      setIsExpanded(false);
      onAIFunction?.(fn);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [onValueChange, onAIFunction]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSmartFormula = value.startsWith('=AI_') || value.startsWith('=AI(');

  return (
    <div className="border-b bg-white">
      {/* 메인 수식 바 */}
      <div className="flex items-center h-11 px-3 gap-2">
        {/* 셀 주소 표시 */}
        <div className="flex items-center">
          <div className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md min-w-[70px] transition-colors',
            selectedCell ? 'bg-slate-100' : 'bg-slate-50'
          )}>
            <span
              className={cn(
                'text-xs font-mono font-semibold',
                selectedCell ? 'text-slate-700' : 'text-slate-400'
              )}
            >
              {cellAddress || '—'}
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-6 w-px bg-slate-200" />

        {/* 함수 아이콘 */}
        <div className={cn(
          'p-1.5 rounded-md transition-colors',
          isSmartFormula ? 'bg-neutral-200' : 'bg-neutral-50'
        )}>
          {isSmartFormula ? (
            <Zap className="w-4 h-4 text-neutral-900" />
          ) : (
            <FunctionSquare className="w-4 h-4 text-neutral-400" />
          )}
        </div>

        {/* 수식 입력 */}
        <div className="flex-1 flex items-center">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onStartEditing}
            placeholder={selectedCell ? '수식 또는 값 입력... (= 로 시작하면 스마트 함수)' : '셀을 선택하세요'}
            disabled={!selectedCell}
            className={cn(
              'h-8 text-sm font-mono border rounded-md transition-all',
              isSmartFormula
                ? 'border-neutral-400 bg-neutral-50 focus:border-neutral-900 focus-visible:ring-neutral-200'
                : 'border-neutral-200 focus:border-neutral-900 focus-visible:ring-neutral-100',
              !selectedCell && 'bg-neutral-50 text-neutral-400'
            )}
          />
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-1">
          {/* 편집 컨트롤 */}
          {isEditing && (
            <div className="flex items-center gap-0.5 mr-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                onClick={onCancel}
                title="취소 (Esc)"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-900 hover:text-neutral-900 hover:bg-neutral-200"
                onClick={onCommit}
                disabled={isExecuting}
                title="확인 (Enter)"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {/* 복사 버튼 */}
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-400 hover:text-neutral-700"
              onClick={handleCopy}
              title="수식 복사"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-neutral-900" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          )}

          {/* 스마트 함수 드롭다운 */}
          <DropdownMenu open={showAIMenu} onOpenChange={setShowAIMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 gap-1.5 text-xs font-medium transition-colors',
                  showAIMenu || isSmartFormula
                    ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
                disabled={!selectedCell}
                title="스마트 함수 삽입"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Smart</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-neutral-500">
                <Zap className="h-3.5 w-3.5 text-neutral-700" />
                스마트 함수 라이브러리
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SMART_FUNCTIONS.map((fn) => (
                <DropdownMenuItem
                  key={fn.name}
                  onClick={() => handleInsertSmartFunction(fn.name, fn.example)}
                  className="flex items-start gap-3 py-2.5 cursor-pointer"
                >
                  <div className={cn('p-1.5 rounded-md mt-0.5', fn.bg)}>
                    <fn.icon className={cn('h-3.5 w-3.5', fn.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-neutral-700">
                        ={fn.name}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500">{fn.description}</span>
                    <div className="font-mono text-xs mt-0.5 text-neutral-600">
                      {fn.example}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 확장 토글 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-400 hover:text-neutral-700"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? '접기' : '스마트 함수 목록 확장'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 확장된 스마트 함수 목록 */}
      {isExpanded && (
        <div className="border-t bg-gradient-to-b from-neutral-50 to-white px-4 py-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-neutral-200 rounded-md">
              <Zap className="w-4 h-4 text-neutral-700" />
            </div>
            <span className="text-sm font-semibold text-neutral-700">스마트 함수 라이브러리</span>
            <span className="text-xs text-neutral-400 ml-auto">클릭하여 삽입</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {SMART_FUNCTIONS.map((fn) => (
              <button
                key={fn.name}
                onClick={() => handleInsertSmartFunction(fn.name, fn.example)}
                disabled={!selectedCell}
                className={cn(
                  'flex flex-col items-start p-3 bg-white border border-neutral-200 rounded-xl transition-all group',
                  'hover:border-neutral-400 hover:shadow-md hover:-translate-y-0.5',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('p-1.5 rounded-lg', fn.bg)}>
                    <fn.icon className={cn('w-4 h-4', fn.color)} />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    ={fn.name}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 text-left line-clamp-2">
                  {fn.description}
                </span>
              </button>
            ))}
          </div>

          {/* 사용 가이드 */}
          <div className="mt-4 p-3 bg-neutral-100 border border-neutral-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-neutral-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-neutral-700 mb-1">사용 팁</p>
                <p className="text-xs text-neutral-600">
                  <code className="px-1.5 py-0.5 bg-white rounded font-mono">=SUMMARY()</code>
                  를 입력하고 Enter를 누르면 선택된 셀의 공고를 자동으로 요약합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormulaBar;
