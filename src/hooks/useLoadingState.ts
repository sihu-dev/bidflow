/**
 * @hook useLoadingState
 * @description 로딩 상태 관리 훅
 *
 * 비동기 작업의 로딩/에러 상태를 추적하고 관리
 * - 로딩 인디케이터 표시
 * - 에러 핸들링
 * - 성공/실패 토스트
 *
 * @example
 * ```tsx
 * const { isLoading, error, execute } = useLoadingState();
 *
 * const handleSave = () => {
 *   execute(async () => {
 *     await saveBid(data);
 *   }, {
 *     successMessage: '저장되었습니다',
 *     errorMessage: '저장 실패',
 *   });
 * };
 * ```
 */

import { useState, useCallback } from 'react';
import { showToast } from '@/components/ui/Toast';
import { getUserFriendlyMessage } from '@/lib/utils/error-messages';

export interface LoadingStateOptions {
  /** 성공 시 토스트 메시지 */
  successMessage?: string;
  /** 에러 시 토스트 메시지 (기본: auto-detect) */
  errorMessage?: string;
  /** 성공 시 콜백 */
  onSuccess?: () => void;
  /** 에러 시 콜백 */
  onError?: (error: Error) => void;
  /** 최종 콜백 (성공/실패 관계없이) */
  onFinally?: () => void;
}

export interface LoadingState<T> {
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 객체 */
  error: Error | null;
  /** 마지막 결과 */
  data: T | null;
  /** 비동기 작업 실행 */
  execute: (fn: () => Promise<T>, options?: LoadingStateOptions) => Promise<T | null>;
  /** 상태 초기화 */
  reset: () => void;
}

/**
 * 로딩 상태 관리 훅
 */
export function useLoadingState<T = any>(): LoadingState<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (
      fn: () => Promise<T>,
      options?: LoadingStateOptions
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fn();
        setData(result);

        // Success toast
        if (options?.successMessage) {
          showToast(options.successMessage, 'success');
        }

        // Success callback
        if (options?.onSuccess) {
          options.onSuccess();
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        // Error toast
        const errorMessage = options?.errorMessage || getUserFriendlyMessage(error);
        showToast(errorMessage, 'error');

        // Error callback
        if (options?.onError) {
          options.onError(error);
        }

        return null;
      } finally {
        setIsLoading(false);

        // Finally callback
        if (options?.onFinally) {
          options.onFinally();
        }
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
  };
}

/**
 * 여러 로딩 상태를 조합하는 훅
 *
 * @example
 * ```tsx
 * const { isAnyLoading, isAllLoading } = useCombinedLoading(
 *   loadingState1.isLoading,
 *   loadingState2.isLoading
 * );
 * ```
 */
export function useCombinedLoading(...loadingStates: boolean[]) {
  const isAnyLoading = loadingStates.some((state) => state);
  const isAllLoading = loadingStates.every((state) => state);

  return { isAnyLoading, isAllLoading };
}

/**
 * Debounced loading state
 *
 * @example
 * ```tsx
 * const { isLoading, execute } = useDebouncedLoading(500);
 *
 * const handleSearch = (query: string) => {
 *   execute(async () => {
 *     await searchBids(query);
 *   });
 * };
 * ```
 */
export function useDebouncedLoading<T = any>(delay = 300): LoadingState<T> {
  const loadingState = useLoadingState<T>();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedExecute = useCallback(
    (fn: () => Promise<T>, options?: LoadingStateOptions): Promise<T | null> => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout
      return new Promise((resolve) => {
        const id = setTimeout(async () => {
          const result = await loadingState.execute(fn, options);
          resolve(result);
        }, delay);
        setTimeoutId(id);
      });
    },
    [loadingState, delay, timeoutId]
  );

  return {
    ...loadingState,
    execute: debouncedExecute,
  };
}
