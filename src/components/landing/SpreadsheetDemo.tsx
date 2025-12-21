'use client';

/**
 * 스프레드시트 데모 섹션 - CMNTech 제품 매칭 버전
 * 11컬럼 + 사이드패널 + AI 함수 데모
 */

import { useState } from 'react';
import {
  LayoutGrid,
  Zap,
  Filter,
  BarChart3,
  Download,
  Play,
  X,
  ExternalLink,
  Sparkles,
  FileText,
  ChevronDown,
  Target,
  Clock,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  MOCK_BIDS,
  MOCK_STATS,
  formatAmount,
} from '@/lib/data/mock-bids';
import {
  CMNTECH_PRODUCTS,
  getProductById,
  getConfidenceLevel,
} from '@/lib/data/products';
import { AI_SMART_FUNCTIONS } from '@/lib/data/ai-functions';

export function SpreadsheetDemo() {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showFunctions, setShowFunctions] = useState(false);

  const selectedBid = MOCK_BIDS[selectedRow];
  const matchedProduct = selectedBid?.matchedProduct
    ? getProductById(selectedBid.matchedProduct)
    : null;
  const confidence = selectedBid ? getConfidenceLevel(selectedBid.matchScore) : null;

  return (
    <section className="py-24 bg-neutral-50" id="spreadsheet">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 text-white text-sm font-medium mb-6">
            <LayoutGrid className="w-4 h-4" />
            핵심 기능
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            CMNTech 5개 제품<br />
            <span className="text-neutral-500">AI 자동 매칭</span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            나라장터, TED, 한전 공고를 실시간 수집하고 UR-1000PLUS, EnerRay 등
            최적의 제품을 AI가 자동으로 매칭합니다.
          </p>
        </div>

        {/* Main Demo Container */}
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4">
            {/* Spreadsheet */}
            <div className={cn(
              'rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden transition-all',
              showSidePanel ? 'flex-1' : 'w-full'
            )}>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                    <div className="w-3 h-3 rounded-full bg-neutral-300" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">BIDFLOW Spreadsheet</span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-200 text-neutral-600">
                    Demo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                          aria-label="필터 열기"
                        >
                          <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                          <span className="hidden sm:inline">필터</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden">
                        <p>필터</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                          aria-label="분석 열기"
                        >
                          <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span className="hidden sm:inline">분석</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden">
                        <p>분석</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                          aria-label="데이터 내보내기"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span className="hidden sm:inline">내보내기</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden">
                        <p>내보내기</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Formula Bar */}
              <div className="flex items-center gap-3 px-4 py-2 border-b bg-white">
                <div className="px-2.5 py-1 bg-neutral-100 rounded text-xs font-mono font-medium text-neutral-700">
                  {String.fromCharCode(65 + selectedRow)}1
                </div>
                <div className="h-5 w-px bg-neutral-200" />
                <div className="flex items-center gap-2 flex-1">
                  <Zap className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                  <span className="text-sm text-neutral-500 font-mono" aria-label={`AI 매칭 결과: ${selectedBid?.matchedProduct || '없음'}`}>
                    =AI_MATCH() → <span className="text-neutral-900">{selectedBid?.matchedProduct || '-'}</span>
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFunctions(!showFunctions)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 transition-colors"
                    aria-label={showFunctions ? 'AI 함수 메뉴 닫기' : 'AI 함수 메뉴 열기'}
                    aria-expanded={showFunctions}
                    aria-haspopup="true"
                  >
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    AI 함수
                    <ChevronDown className={cn('w-3 h-3 transition-transform', showFunctions && 'rotate-180')} aria-hidden="true" />
                  </button>

                  {/* AI Functions Dropdown */}
                  {showFunctions && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 z-50 py-2">
                      <div className="px-3 py-2 border-b">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">AI 스마트 함수</p>
                      </div>
                      {AI_SMART_FUNCTIONS.map((fn) => (
                        <button
                          key={fn.name}
                          className="w-full px-3 py-2 text-left hover:bg-neutral-50 transition-colors"
                          onClick={() => setShowFunctions(false)}
                          aria-label={`${fn.name} 함수: ${fn.description}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs font-mono text-neutral-900 font-medium">{fn.syntax}</code>
                          </div>
                          <p className="text-xs text-neutral-500">{fn.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Spreadsheet Grid */}
              <div className="overflow-x-auto" role="region" aria-label="입찰 공고 목록">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b">
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-10">No</th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-20">출처</th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider min-w-[150px] sm:min-w-[200px]">공고명</th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">발주기관</th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-20">추정가</th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-16">마감</th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-20">상태</th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-12 hidden md:table-cell">우선</th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-24">매칭</th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden xl:table-cell">제품</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_BIDS.map((bid, idx) => (
                      <tr
                        key={bid.id}
                        onClick={() => {
                          setSelectedRow(idx);
                          setShowSidePanel(true);
                        }}
                        className={cn(
                          'border-b cursor-pointer transition-colors',
                          idx === selectedRow
                            ? 'bg-neutral-100'
                            : 'hover:bg-neutral-50'
                        )}
                      >
                        <td className="px-3 py-3 text-neutral-400 font-mono text-xs">{bid.id}</td>
                        <td className="px-3 py-3">
                          <SourceBadge source={bid.source} label={bid.sourceLabel} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-neutral-900 truncate max-w-[200px]" title={bid.title}>
                            {bid.title}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-neutral-600 hidden lg:table-cell truncate max-w-[150px]">
                          {bid.organization}
                        </td>
                        <td className="px-3 py-3 text-neutral-900 font-medium font-mono text-xs">
                          {formatAmount(bid.estimatedAmount)}
                        </td>
                        <td className="px-3 py-3">
                          <DdayBadge dday={bid.dday} isUrgent={bid.isUrgent} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={bid.status} label={bid.statusLabel} />
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <PriorityIndicator priority={bid.priority} />
                        </td>
                        <td className="px-3 py-3">
                          <ScoreBar score={bid.matchScore} />
                        </td>
                        <td className="px-3 py-3 hidden xl:table-cell">
                          {bid.matchedProduct && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-neutral-100 text-neutral-700">
                              {bid.matchedProduct}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-neutral-50">
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>{MOCK_BIDS.length}개 공고 표시</span>
                  <span className="hidden sm:inline">|</span>
                  <span className="hidden sm:inline">신규 {MOCK_STATS.new}</span>
                  <span className="hidden sm:inline">긴급 {MOCK_STATS.urgent}</span>
                  <span className="hidden sm:inline">높은매칭 {MOCK_STATS.highMatch}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="hidden sm:inline">동기화: 방금 전</span>
                  <span className="w-2 h-2 bg-neutral-900 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Side Panel */}
            {showSidePanel && selectedBid && (
              <div className="hidden md:block w-64 lg:w-80 rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden flex-shrink-0">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-neutral-50">
                  <div className="flex items-center gap-2">
                    <SourceBadge source={selectedBid.source} label={selectedBid.sourceLabel} />
                  </div>
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className="p-1 hover:bg-neutral-200 rounded transition-colors"
                    aria-label="상세 패널 닫기"
                  >
                    <X className="w-4 h-4 text-neutral-500" aria-hidden="true" />
                  </button>
                </div>

                {/* Panel Content */}
                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm leading-snug">
                      {selectedBid.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">{selectedBid.organization}</p>
                  </div>

                  {/* D-Day & Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-xs text-neutral-500 mb-1">마감일</p>
                      <p className={cn(
                        'text-lg font-bold font-mono',
                        selectedBid.isUrgent ? 'text-neutral-900' : 'text-neutral-700'
                      )}>
                        {selectedBid.dday}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-xs text-neutral-500 mb-1">추정가격</p>
                      <p className="text-lg font-bold font-mono text-neutral-900">
                        {formatAmount(selectedBid.estimatedAmount)}
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="p-3 border border-neutral-200 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-neutral-600" />
                      <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">AI 분석 결과</span>
                    </div>

                    {/* Match Score */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-500">매칭 점수</span>
                        <span className="text-xs font-medium text-neutral-700">{confidence?.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 rounded-full transition-all"
                            style={{ width: `${selectedBid.matchScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold font-mono text-neutral-900">
                          {selectedBid.matchScore}%
                        </span>
                      </div>
                    </div>

                    {/* Matched Product */}
                    {matchedProduct && (
                      <div className="p-2 bg-neutral-50 rounded-lg">
                        <p className="text-xs text-neutral-500 mb-1">추천 제품</p>
                        <p className="font-semibold text-neutral-900 text-sm">{matchedProduct.name}</p>
                        <p className="text-xs text-neutral-500">{matchedProduct.fullName}</p>
                      </div>
                    )}

                    {/* AI Summary */}
                    {selectedBid.aiSummary && (
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">AI 요약</p>
                        <p className="text-xs text-neutral-700 leading-relaxed">
                          {selectedBid.aiSummary}
                        </p>
                      </div>
                    )}

                    {/* Keywords */}
                    <div>
                      <p className="text-xs text-neutral-500 mb-1.5">키워드</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedBid.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      원문
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                      <Sparkles className="w-3.5 h-3.5" />
                      분석
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      제안서
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Function Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {AI_SMART_FUNCTIONS.slice(0, 5).map((fn) => (
            <span
              key={fn.name}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 font-medium"
            >
              <FunctionIcon name={fn.icon} />
              <code className="font-mono text-xs">{fn.syntax}</code>
            </span>
          ))}
        </div>

        {/* Product Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {CMNTECH_PRODUCTS.map((product) => (
            <span
              key={product.id}
              className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs text-neutral-700 font-medium"
            >
              {product.name}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4 mt-12">
          <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white" asChild>
            <Link href="/signup">무료로 시작하기</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-neutral-300 hover:bg-neutral-50" asChild>
            <Link href="/features/spreadsheet" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              자세히 보기
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Sub-components

function SourceBadge({ source, label }: { source: string; label: string }) {
  const colors: Record<string, string> = {
    narajangto: 'bg-neutral-100 text-neutral-700',
    ted: 'bg-neutral-200 text-neutral-800',
    kwater: 'bg-neutral-100 text-neutral-700',
    kepco: 'bg-neutral-200 text-neutral-800',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', colors[source] || colors.narajangto)}>
      {label}
    </span>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const styles: Record<string, string> = {
    new: 'bg-neutral-100 text-neutral-900 border border-neutral-300',
    reviewing: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    preparing: 'bg-neutral-200 text-neutral-700',
    submitted: 'bg-neutral-900 text-white',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', styles[status] || styles.new)}>
      {label}
    </span>
  );
}

function DdayBadge({ dday, isUrgent }: { dday: string; isUrgent: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold',
      isUrgent
        ? 'bg-neutral-900 text-white'
        : 'bg-neutral-100 text-neutral-600'
    )}>
      {dday}
    </span>
  );
}

function PriorityIndicator({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const indicators: Record<string, string> = {
    high: '●●●',
    medium: '●●○',
    low: '●○○',
  };

  return (
    <span className="text-xs text-neutral-500 font-mono">{indicators[priority]}</span>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            score >= 80 ? 'bg-neutral-900' : score >= 60 ? 'bg-neutral-600' : 'bg-neutral-400'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono font-medium text-neutral-700">{score}%</span>
    </div>
  );
}

function FunctionIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    FileText: <FileText className="w-3.5 h-3.5" />,
    TrendingUp: <TrendingUp className="w-3.5 h-3.5" />,
    Target: <Target className="w-3.5 h-3.5" />,
    Tag: <Tag className="w-3.5 h-3.5" />,
    Clock: <Clock className="w-3.5 h-3.5" />,
  };

  return <span className="text-neutral-400">{icons[name] || <Zap className="w-3.5 h-3.5" />}</span>;
}
