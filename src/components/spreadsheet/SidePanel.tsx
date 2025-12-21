'use client';

/**
 * 입찰 상세 사이드 패널
 * Supabase UI 벤치마킹 - 전문적 미니멀 디자인
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
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
  Clock,
  Target,
  Package,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  STATUS_LABELS,
  SOURCE_LABELS,
  PRIORITY_COLORS,
  calculateDDay,
  formatAmount,
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
  matched_product?: string | null;
  ai_summary?: string | null;
  created_at: string;
  updated_at: string;
}

interface SidePanelProps {
  bid: Bid;
  onClose: () => void;
  onUpdate?: (updates: Partial<Bid>) => Promise<void>;
}

// 제품 정보 (데모용)
const PRODUCTS: Record<string, { name: string; description: string; specs: string[] }> = {
  'UR-1000PLUS': {
    name: 'UR-1000PLUS',
    description: '다회선 초음파 유량계',
    specs: ['DN100-4000mm', '정확도 ±0.5%', '상수도 인증'],
  },
  'MF-1000C': {
    name: 'MF-1000C',
    description: '일체형 전자유량계',
    specs: ['DN15-300mm', 'MID 인증', 'IP68'],
  },
  'UR-1010PLUS': {
    name: 'UR-1010PLUS',
    description: '비만관형 유량계',
    specs: ['DN200-3000mm', '부분 충수', '하수 전용'],
  },
  'SL-3000PLUS': {
    name: 'SL-3000PLUS',
    description: '개수로 유량계',
    specs: ['폭 0.5-20m', '비접촉', '태양광'],
  },
  'EnerRay': {
    name: 'EnerRay',
    description: '초음파 열량계',
    specs: ['DN25-300mm', '열량 계량', 'EN1434'],
  },
};

// 상태 색상 매핑 (모노크롬)
const STATUS_STYLE: Record<string, string> = {
  new: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  reviewing: 'bg-neutral-200 text-neutral-700 border-neutral-300',
  preparing: 'bg-neutral-300 text-neutral-800 border-neutral-400',
  submitted: 'bg-neutral-400 text-neutral-900 border-neutral-500',
  won: 'bg-neutral-700 text-white border-neutral-800',
  lost: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};

export function SidePanel({ bid, onClose, onUpdate }: SidePanelProps) {
  const [isAIExpanded, setIsAIExpanded] = useState(true);
  const [isProductExpanded, setIsProductExpanded] = useState(true);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(bid.external_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dday = calculateDDay(bid.deadline);
  const ddayNum = dday.startsWith('D-') ? parseInt(dday.slice(2)) : dday.startsWith('D+') ? -parseInt(dday.slice(2)) : 0;
  const isUrgent = ddayNum > 0 && ddayNum <= 7;
  const isOverdue = ddayNum < 0;

  const matchScore = bid.match_score ? Math.round(bid.match_score * 100) : null;
  const matchedProductInfo = bid.matched_product ? PRODUCTS[bid.matched_product] : null;

  const keywordArray = bid.keywords || [];

  return (
    <div className="w-full md:w-[360px] lg:w-[400px] border-l border-slate-200 bg-white flex flex-col h-full animate-slide-in">
      {/* 헤더 */}
      <div className="flex items-start justify-between p-4 border-b border-slate-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">
              {SOURCE_LABELS[bid.source] || bid.source}
            </span>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition"
              title="공고번호 복사"
            >
              <span className="font-mono">{bid.external_id}</span>
              {copied ? <Check className="w-3 h-3 text-neutral-700" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
            {bid.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 -mr-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          aria-label="패널 닫기"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {/* 상태 & 우선순위 */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            {/* 상태 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition hover:opacity-80',
                    STATUS_STYLE[bid.status] || 'bg-slate-50 text-slate-600 border-slate-200'
                  )}
                  disabled={isUpdating}
                >
                  {STATUS_LABELS[bid.status] || bid.status}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => handleStatusChange(value)}
                    className={cn('text-xs', value === bid.status && 'bg-slate-100')}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 우선순위 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white flex items-center gap-1.5 hover:bg-slate-50 transition"
                  disabled={isUpdating}
                >
                  {PRIORITY_COLORS[bid.priority]} {bid.priority === 'high' ? '높음' : bid.priority === 'medium' ? '보통' : '낮음'}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-32">
                {Object.entries(PRIORITY_COLORS).map(([value, icon]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => handlePriorityChange(value)}
                    className="text-xs"
                  >
                    {icon} {value === 'high' ? '높음' : value === 'medium' ? '보통' : '낮음'}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 더보기 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition ml-auto">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="text-xs">파이프라인 추가</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">알림 설정</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-neutral-600">삭제</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* D-Day */}
          <div className={cn(
            'flex items-center justify-between p-3 rounded-xl border',
            isOverdue ? 'bg-slate-50 border-slate-200' :
            isUrgent ? 'bg-neutral-200 border-neutral-400' :
            'bg-neutral-100 border-neutral-300'
          )}>
            <div className="flex items-center gap-2">
              <Clock className={cn(
                'w-4 h-4',
                isOverdue ? 'text-slate-400' : isUrgent ? 'text-neutral-700' : 'text-neutral-600'
              )} />
              <span className="text-xs text-slate-600">마감</span>
            </div>
            <div className="text-right">
              <div className={cn(
                'text-lg font-bold',
                isOverdue ? 'text-slate-400' : isUrgent ? 'text-neutral-800' : 'text-neutral-700'
              )}>
                {dday}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(bid.deadline).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* 정보 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-xs">발주기관</span>
              </div>
              <div className="text-sm font-medium text-slate-800 truncate" title={bid.organization}>
                {bid.organization}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="text-xs">추정가격</span>
              </div>
              <div className="text-sm font-medium text-slate-800">
                {bid.estimated_amount ? formatAmount(bid.estimated_amount) : '-'}
              </div>
            </div>
          </div>

          {/* 키워드 */}
          {keywordArray.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">키워드</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keywordArray.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-md"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 원본 링크 */}
          {bid.url && (
            <a
              href={bid.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition"
            >
              <ExternalLink className="w-4 h-4" />
              원본 공고 보기
            </a>
          )}
        </div>

        {/* 제품 매칭 */}
        <div className="border-t border-slate-100">
          <button
            onClick={() => setIsProductExpanded(!isProductExpanded)}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-neutral-700" />
              <span className="text-sm font-medium text-slate-700">제품 매칭</span>
              {matchScore !== null && (
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  matchScore >= 70 ? 'bg-neutral-200 text-neutral-800' :
                  matchScore >= 50 ? 'bg-neutral-100 text-neutral-700' :
                  'bg-slate-100 text-slate-600'
                )}>
                  {matchScore}%
                </span>
              )}
            </div>
            {isProductExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isProductExpanded && (
            <div className="px-4 pb-4">
              {matchScore !== null && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500">매칭 점수</span>
                    <span className={cn(
                      'font-medium',
                      matchScore >= 70 ? 'text-neutral-800' : matchScore >= 50 ? 'text-neutral-700' : 'text-slate-500'
                    )}>
                      {matchScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        matchScore >= 70 ? 'bg-neutral-800' : matchScore >= 50 ? 'bg-neutral-500' : 'bg-slate-400'
                      )}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                </div>
              )}

              {matchedProductInfo ? (
                <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-neutral-700" />
                    <span className="text-xs font-medium text-neutral-700">추천 제품</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{matchedProductInfo.name}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{matchedProductInfo.description}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {matchedProductInfo.specs.map((spec, i) => (
                      <span key={i} className="px-1.5 py-0.5 text-xs bg-white text-slate-600 rounded border border-neutral-200">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs text-slate-500">매칭된 제품 없음</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI 분석 */}
        <div className="border-t border-slate-100">
          <button
            onClick={() => setIsAIExpanded(!isAIExpanded)}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium text-slate-700">AI 분석</span>
              {bid.ai_summary && <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700" />}
            </div>
            {isAIExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isAIExpanded && (
            <div className="px-4 pb-4">
              {bid.ai_summary ? (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-700 leading-relaxed">{bid.ai_summary}</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs text-slate-500 mb-3">AI 분석 실행</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="h-8 text-xs font-medium text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> 분석 중...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> 분석 시작</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 메모 */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-1.5 text-slate-500 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">메모</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="메모 입력..."
            className="w-full h-20 p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 푸터 */}
      <div className="border-t border-slate-100 p-4 bg-slate-50">
        <Button className="w-full h-10 text-sm font-medium bg-neutral-900 hover:bg-neutral-800 text-white">
          <FileText className="w-4 h-4 mr-2" />
          제안서 작성 시작
        </Button>
      </div>
    </div>
  );
}

export default SidePanel;
