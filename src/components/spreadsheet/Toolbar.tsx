'use client';

/**
 * 스프레드시트 툴바 (shadcn/ui 기반)
 */

import { useState } from 'react';
import { RefreshCw, Filter, Download, Plus, Search, LayoutGrid, List, ChevronDown, Sparkles } from 'lucide-react';
import { PromptLibrary } from '@/components/prompts/PromptLibrary';
import type { PromptContext } from '@/lib/prompts/engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
}

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
}: ToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'spreadsheet' | 'kanban'>('spreadsheet');
  const [filterOpen, setFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const displayCount = filteredCount !== undefined ? filteredCount : totalCount;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
      {/* 좌측: 검색 및 필터 */}
      <div className="flex items-center gap-3">
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="공고 검색..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-64 h-8"
          />
        </div>

        {/* 필터 팝오버 */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Filter className="w-4 h-4" />
              필터
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">상태</h4>
                <div className="flex flex-wrap gap-2">
                  {['new', 'reviewing', 'preparing', 'submitted', 'won', 'lost'].map((status) => (
                    <Badge
                      key={status}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => onFilter?.({ status })}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">우선순위</h4>
                <div className="flex gap-2">
                  {['high', 'medium', 'low'].map((priority) => (
                    <Badge
                      key={priority}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => onFilter?.({ priority })}
                    >
                      {priority === 'high' ? '🔴 높음' : priority === 'medium' ? '🟡 중간' : '🟢 낮음'}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">출처</h4>
                <div className="flex flex-wrap gap-2">
                  {['narajangto', 'ted', 'kepco', 'manual'].map((source) => (
                    <Badge
                      key={source}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => onFilter?.({ source })}
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onFilter?.({});
                  setFilterOpen(false);
                }}
              >
                필터 초기화
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 카운트 */}
        <span className="text-sm text-muted-foreground">
          {filteredCount !== undefined && filteredCount !== totalCount ? (
            <>
              {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}건
            </>
          ) : (
            <>총 {displayCount.toLocaleString()}건</>
          )}
        </span>
      </div>

      {/* 우측: 액션 버튼 */}
      <div className="flex items-center gap-2">
        {/* 뷰 전환 */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="h-8">
            <TabsTrigger value="spreadsheet" className="h-7 px-2" title="스프레드시트 뷰">
              <List className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="kanban" className="h-7 px-2" title="칸반 뷰">
              <LayoutGrid className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* AI 템플릿 */}
        <PromptLibrary
          context={promptContext}
          onExecute={onAIExecute}
          triggerButton={
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI 템플릿</span>
            </Button>
          }
        />

        {/* 새로고침 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">새로고침</span>
        </Button>

        {/* 내보내기 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">내보내기</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>내보내기 형식</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExport?.('csv')}>
              CSV 파일 (.csv)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.('excel')}>
              Excel 파일 (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.('json')}>
              JSON 파일 (.json)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 새 입찰 추가 */}
        <Button size="sm" onClick={onAddBid} className="h-8 gap-1.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">입찰 추가</span>
        </Button>
      </div>
    </div>
  );
}

export default Toolbar;
