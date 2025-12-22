/**
 * @component ErrorBoundary
 * @description React Error Boundary with rollback visualization
 *
 * 에러 발생 시 앱 크래시 방지 및 사용자 친화적 메시지 표시
 * - 에러 캡처 및 로깅
 * - 재시도 버튼
 * - 롤백 시각화 (이전 상태로 복구)
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={(error, reset) => <CustomError error={error} reset={reset} />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 커스텀 에러 UI (옵션) */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** 에러 발생 시 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 롤백 활성화 (기본값: true) */
  enableRollback?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private previousState: unknown = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('[ErrorBoundary] Error caught:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    // 에러 카운트 증가
    this.setState((prev) => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // 외부 콜백 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 에러 모니터링 서비스에 전송 (Sentry 등)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // 페이지 새로고침 (롤백 시뮬레이션)
    if (this.props.enableRollback !== false) {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 Fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleReset);
      }

      // 기본 에러 UI
      return (
        <DefaultErrorFallback
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          errorCount={this.state.errorCount}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// DEFAULT ERROR FALLBACK
// ============================================================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  onReset: () => void;
  onGoHome: () => void;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  errorCount,
  onReset,
  onGoHome,
}: DefaultErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl p-8">
          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">
            문제가 발생했습니다
          </h1>

          {/* Description */}
          <p className="text-neutral-600 text-center mb-6">
            일시적인 오류로 페이지를 표시할 수 없습니다.
            {errorCount > 1 && (
              <span className="block mt-2 text-sm text-neutral-500">
                ({errorCount}회 재시도됨)
              </span>
            )}
          </p>

          {/* Error Message */}
          <div className="bg-neutral-100 rounded-lg p-4 mb-6">
            <p className="text-sm font-mono text-neutral-700 break-words">
              {error.message || '알 수 없는 오류'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-2"
              variant="default"
            >
              <RotateCcw className="w-4 h-4" />
              다시 시도
            </Button>
            <Button
              onClick={onGoHome}
              className="flex-1 flex items-center justify-center gap-2"
              variant="outline"
            >
              <Home className="w-4 h-4" />
              홈으로 이동
            </Button>
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <Bug className="w-4 h-4" />
            {showDetails ? '기술 정보 숨기기' : '기술 정보 보기'}
          </button>

          {/* Technical Details */}
          {showDetails && (
            <div className="mt-4 p-4 bg-neutral-900 rounded-lg overflow-auto max-h-60">
              <pre className="text-xs text-neutral-300 font-mono whitespace-pre-wrap">
                {error.stack}
                {errorInfo?.componentStack && `\n\nComponent Stack:${errorInfo.componentStack}`}
              </pre>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-sm text-neutral-500 text-center mt-6">
          문제가 지속되면{' '}
          <a href="mailto:support@bidflow.com" className="text-neutral-700 hover:underline">
            support@bidflow.com
          </a>
          으로 문의해 주세요.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * 에러 핸들링 훅
 *
 * @example
 * ```tsx
 * const { handleError, clearError, error } = useErrorHandler();
 *
 * const handleSubmit = async () => {
 *   try {
 *     await saveBid(data);
 *   } catch (err) {
 *     handleError(err);
 *   }
 * };
 * ```
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: unknown) => {
    const error = err instanceof Error ? err : new Error(String(err));
    setError(error);
    console.error('[useErrorHandler]', error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
