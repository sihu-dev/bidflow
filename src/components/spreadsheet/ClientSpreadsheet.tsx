'use client';

/**
 * 클라이언트 전용 스프레드시트 래퍼
 * Handsontable SSR 문제 해결을 위한 동적 로딩
 */

import { useEffect, useState, type ReactNode } from 'react';

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

interface SpreadsheetViewProps {
  initialData?: Bid[];
  onBidUpdate?: (id: string, updates: Partial<Bid>) => Promise<void>;
  onBidCreate?: (bid: Omit<Bid, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

type SpreadsheetModule = { SpreadsheetView: (props: SpreadsheetViewProps) => ReactNode };

// SSR에서는 null 반환 (typeof window 체크)
const isClient = typeof window !== 'undefined';

export function ClientSpreadsheet(props: SpreadsheetViewProps) {
  const [mod, setMod] = useState<SpreadsheetModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 마운트 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // 클라이언트 사이드에서만 Handsontable 로드
    if (!isClient || !isMounted) return;

    let mounted = true;

    const loadModule = async () => {
      try {
        // 동적 import - 서버에서는 null-loader가 빈 모듈 반환
        const loadedMod = await import('./SpreadsheetView');
        if (mounted && 'SpreadsheetView' in loadedMod) {
          setMod(loadedMod as SpreadsheetModule);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load SpreadsheetView:', err);
        setIsLoading(false);
      }
    };

    loadModule();

    return () => {
      mounted = false;
    };
  }, [isMounted]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">스프레드시트 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-red-600">스프레드시트 로드 실패</p>
      </div>
    );
  }

  const { SpreadsheetView } = mod;
  return <SpreadsheetView {...props} />;
}

export default ClientSpreadsheet;
