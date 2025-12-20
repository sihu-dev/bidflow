'use client';

/**
 * 입찰 상세 사이드 패널
 */

import { useState } from 'react';
import {
  X,
  ExternalLink,
  Building2,
  DollarSign,
  Tag,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  SOURCE_LABELS,
  PRIORITY_COLORS,
  calculateDDay,
} from '@/lib/spreadsheet/column-definitions';

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

interface SidePanelProps {
  bid: Bid;
  onClose: () => void;
  onUpdate?: (updates: Partial<Bid>) => Promise<void>;
}

export function SidePanel({ bid, onClose, onUpdate }: SidePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!onUpdate) return;

    setIsUpdating(true);
    try {
      await onUpdate({ status: newStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!onUpdate) return;

    setIsUpdating(true);
    try {
      await onUpdate({ priority: newPriority });
    } finally {
      setIsUpdating(false);
    }
  };

  const dday = calculateDDay(bid.deadline);
  const isUrgent = dday.startsWith('D-') && parseInt(dday.slice(2)) <= 3;

  return (
    <div className="w-96 border-l bg-white flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-medium text-gray-900 truncate">{bid.title}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {/* 기본 정보 */}
        <div className="p-4 space-y-4">
          {/* 상태 & 우선순위 */}
          <div className="flex items-center gap-3">
            {/* 상태 */}
            <select
              value={bid.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className={`px-2 py-1 text-sm font-medium rounded-full border-0 cursor-pointer ${STATUS_COLORS[bid.status]}`}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* 우선순위 */}
            <select
              value={bid.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              disabled={isUpdating}
              className="px-2 py-1 text-sm border rounded cursor-pointer"
            >
              {Object.entries(PRIORITY_COLORS).map(([value, icon]) => (
                <option key={value} value={value}>
                  {icon} {value}
                </option>
              ))}
            </select>
          </div>

          {/* D-Day */}
          <div className={`text-center py-3 rounded-lg ${isUrgent ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
              {dday}
            </div>
            <div className="text-sm text-gray-500">
              마감: {new Date(bid.deadline).toLocaleDateString('ko-KR')}
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="space-y-3">
            {/* 발주기관 */}
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">발주기관</div>
                <div className="font-medium">{bid.organization}</div>
              </div>
            </div>

            {/* 추정가격 */}
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">추정가격</div>
                <div className="font-medium">
                  {bid.estimated_amount
                    ? `₩${bid.estimated_amount.toLocaleString()}`
                    : '-'}
                </div>
              </div>
            </div>

            {/* 출처 */}
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">출처</div>
                <div className="font-medium">{SOURCE_LABELS[bid.source] || bid.source}</div>
              </div>
            </div>

            {/* 키워드 */}
            {bid.keywords && bid.keywords.length > 0 && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">키워드</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {bid.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 원본 링크 */}
          {bid.url && (
            <a
              href={bid.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <ExternalLink className="w-4 h-4" />
              원본 공고 보기
            </a>
          )}
        </div>

        {/* AI 요약 섹션 */}
        <div className="border-t">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-medium">AI 분석</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {isExpanded && (
            <div className="px-4 pb-4">
              {bid.ai_summary ? (
                <div className="p-3 bg-purple-50 rounded-lg text-sm text-gray-700">
                  {bid.ai_summary}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">
                  AI 분석 대기중...
                  <button className="block w-full mt-2 py-1.5 text-purple-600 bg-white border border-purple-200 rounded hover:bg-purple-50 transition">
                    분석 실행
                  </button>
                </div>
              )}

              {/* 매칭 점수 */}
              {bid.match_score !== undefined && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">제품 매칭 점수</span>
                    <span className="font-medium">
                      {Math.round(bid.match_score * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        bid.match_score >= 0.7
                          ? 'bg-green-500'
                          : bid.match_score >= 0.4
                          ? 'bg-yellow-500'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${bid.match_score * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 메모 섹션 */}
        <div className="border-t p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">메모</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="이 입찰에 대한 메모를 입력하세요..."
            className="w-full h-24 p-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 푸터 액션 */}
      <div className="border-t p-4 space-y-2">
        <button className="w-full py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">
          제안서 작성 시작
        </button>
        <button className="w-full py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
          파이프라인에 추가
        </button>
      </div>
    </div>
  );
}

export default SidePanel;
