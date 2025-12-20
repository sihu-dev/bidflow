'use client';

/**
 * 스프레드시트 툴바
 */

import { useState } from 'react';
import { RefreshCw, Filter, Download, Plus, Search, LayoutGrid, List } from 'lucide-react';

interface ToolbarProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  totalCount?: number;
}

export function Toolbar({ onRefresh, isLoading, totalCount = 0 }: ToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'spreadsheet' | 'kanban'>('spreadsheet');

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
      {/* 좌측: 검색 및 필터 */}
      <div className="flex items-center gap-3">
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="공고 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 w-64 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 필터 버튼 */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Filter className="w-4 h-4" />
          필터
        </button>

        {/* 카운트 */}
        <span className="text-sm text-gray-500">
          총 {totalCount.toLocaleString()}건
        </span>
      </div>

      {/* 우측: 액션 버튼 */}
      <div className="flex items-center gap-2">
        {/* 뷰 전환 */}
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('spreadsheet')}
            className={`p-1.5 ${viewMode === 'spreadsheet' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
            title="스프레드시트 뷰"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 ${viewMode === 'kanban' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
            title="칸반 뷰"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* 새로고침 */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </button>

        {/* 내보내기 */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Download className="w-4 h-4" />
          내보내기
        </button>

        {/* 새 입찰 추가 */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">
          <Plus className="w-4 h-4" />
          입찰 추가
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
