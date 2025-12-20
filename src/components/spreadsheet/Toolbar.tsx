'use client';

/**
 * 스프레드시트 툴바 - Supabase UI 스타일
 * 전문적이고 미니멀한 디자인
 */

import { useState } from 'react';
import {
  RefreshCw,
  Download,
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Sparkles,
  X,
  Clock,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { PromptLibrary } from '@/components/prompts/PromptLibrary';
import type { PromptContext } from '@/lib/prompts/engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ToolbarProps {
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, unknown>) => void;
  onExport?: (format: 'csv' | 'excel' | 'json') => void;
  onAddBid?: () => void;
  onAIExecute?: (prompt: string, templateId: string) => void;
  promptContext?: PromptContext;
  isLoading?: boolean;
  totalCount?: number;
  filteredCount?: number;
  stats?: {
    new?: number;
    reviewing?: number;
    preparing?: number;
    urgent?: number;
    highMatch?: number;
  };
}

// 상태 필터 옵션 (모노크롬)
const STATUS_OPTIONS = [
  { value: 'new', label: '신규', icon: '●', color: 'bg-neutral-200 text-neutral-800' },
  { value: 'reviewing', label: '검토중', icon: '◐', color: 'bg-neutral-300 text-neutral-800' },
  { value: 'preparing', label: '준비중', icon: '◑', color: 'bg-neutral-400 text-neutral-900' },
  { value: 'submitted', label: '제출완료', icon: '◉', color: 'bg-neutral-500 text-white' },
  { value: 'won', label: '낙찰', icon: '✓', color: 'bg-neutral-800 text-white' },
  { value: 'lost', label: '탈락', icon: '✗', color: 'bg-neutral-100 text-neutral-500' },
];

// 우선순위 필터 옵션 (모노크롬)
const PRIORITY_OPTIONS = [
  { value: 'high', label: '높음', icon: '●●●' },
  { value: 'medium', label: '보통', icon: '●●○' },
  { value: 'low', label: '낮음', icon: '●○○' },
];

// 출처 필터 옵션
const SOURCE_OPTIONS = [
  { value: 'narajangto', label: '나라장터' },
  { value: 'ted', label: 'TED (EU)' },
  { value: 'kepco', label: '한전' },
  { value: 'manual', label: '수동 등록' },
];

export function Toolbar({
  onRefresh,
  onSearch,
  onFilter,
  onExport,
  onAddBid,
  onAIExecute,
  promptContext = {},
  isLoading,
  totalCount = 0,
  filteredCount,
  stats,
}: ToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'spreadsheet' | 'kanban'>('spreadsheet');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    status: string[];
    priority: string[];
    source: string[];
  }>({
    status: [],
    priority: [],
    source: [],
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterToggle = (type: 'status' | 'priority' | 'source', value: string) => {
    setActiveFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      const newFilters = { ...prev, [type]: updated };
      onFilter?.(newFilters);
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ status: [], priority: [], source: [] });
    setSearchQuery('');
    onFilter?.({});
    onSearch?.('');
  };

  const hasActiveFilters =
    activeFilters.status.length > 0 ||
    activeFilters.priority.length > 0 ||
    activeFilters.source.length > 0 ||
    searchQuery !== '';

  const displayCount = filteredCount !== undefined ? filteredCount : totalCount;

  return (
    <div className="border-b bg-white">
      {/* 메인 툴바 */}
      <div className="flex items-center justify-between px-4 py-2.5 gap-4">
        {/* 좌측: 검색 및 필터 */}
        <div className="flex items-center gap-3 flex-1">
          {/* 검색 */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="공고 검색..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm border-slate-200 focus:border-neutral-500 focus-visible:ring-neutral-100"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 필터 팝오버 */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-9 gap-2 text-sm font-medium border-slate-200',
                  hasActiveFilters && 'border-neutral-400 bg-neutral-100 text-neutral-800'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                필터
                {hasActiveFilters && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-neutral-200 text-neutral-700">
                    {activeFilters.status.length + activeFilters.priority.length + activeFilters.source.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-3 border-b bg-slate-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700">필터</h4>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      모두 초기화
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 space-y-4">
                {/* 상태 필터 */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">상태</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleFilterToggle('status', status.value)}
                        className={cn(
                          'px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all',
                          activeFilters.status.includes(status.value)
                            ? status.color + ' ring-2 ring-offset-1 ring-current'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {status.icon} {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 우선순위 필터 */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">우선순위</h5>
                  <div className="flex gap-1.5">
                    {PRIORITY_OPTIONS.map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() => handleFilterToggle('priority', priority.value)}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                          activeFilters.priority.includes(priority.value)
                            ? 'bg-neutral-200 text-neutral-800 ring-2 ring-offset-1 ring-neutral-400'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {priority.icon} {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 출처 필터 */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">출처</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {SOURCE_OPTIONS.map((source) => (
                      <button
                        key={source.value}
                        onClick={() => handleFilterToggle('source', source.value)}
                        className={cn(
                          'px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all',
                          activeFilters.source.includes(source.value)
                            ? 'bg-neutral-200 text-neutral-800 ring-2 ring-offset-1 ring-neutral-400'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {source.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* 결과 카운트 */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span className="font-medium text-slate-700">{displayCount.toLocaleString()}</span>
            <span>건</span>
            {filteredCount !== undefined && filteredCount !== totalCount && (
              <span className="text-slate-400">/ {totalCount.toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* 우측: 액션 버튼 */}
        <div className="flex items-center gap-2">
          {/* 뷰 전환 */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('spreadsheet')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'spreadsheet'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
              title="스프레드시트 뷰"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'kanban'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
              title="칸반 뷰"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* AI 템플릿 */}
          <PromptLibrary
            context={promptContext}
            onExecute={onAIExecute}
            triggerButton={
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-sm font-medium border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI</span>
              </Button>
            }
          />

          {/* 새로고침 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 w-9 p-0 text-slate-500 hover:text-slate-700"
            title="새로고침"
            aria-label="새로고침"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} aria-hidden="true" />
          </Button>

          {/* 내보내기 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-sm text-slate-600 hover:text-slate-900"
                aria-label="내보내기 형식 선택"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">내보내기</span>
                <ChevronDown className="w-3 h-3 opacity-50" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-slate-500">형식 선택</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport?.('excel')} className="gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-neutral-600">📊</span>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('csv')} className="gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-neutral-600">📄</span>
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('json')} className="gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-neutral-600">{ }</span>
                JSON (.json)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 새 입찰 추가 */}
          <Button
            size="sm"
            onClick={onAddBid}
            className="h-9 gap-1.5 text-sm font-medium bg-neutral-900 hover:bg-neutral-800 text-white"
            aria-label="새 입찰 추가"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">입찰 추가</span>
          </Button>
        </div>
      </div>

      {/* 통계 바 (optional) */}
      {stats && (
        <div className="flex items-center gap-4 px-4 py-2 border-t bg-slate-50/50">
          {stats.new !== undefined && stats.new > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-neutral-600" />
              <span className="text-slate-600">신규</span>
              <span className="font-semibold text-slate-800">{stats.new}</span>
            </div>
          )}
          {stats.reviewing !== undefined && stats.reviewing > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-neutral-500" />
              <span className="text-slate-600">검토중</span>
              <span className="font-semibold text-slate-800">{stats.reviewing}</span>
            </div>
          )}
          {stats.urgent !== undefined && stats.urgent > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-neutral-700" />
              <span className="text-slate-600">마감 임박</span>
              <span className="font-semibold text-neutral-800">{stats.urgent}</span>
            </div>
          )}
          {stats.highMatch !== undefined && stats.highMatch > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-700" />
              <span className="text-slate-600">높은 매칭</span>
              <span className="font-semibold text-neutral-800">{stats.highMatch}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Toolbar;
