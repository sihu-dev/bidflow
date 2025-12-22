/**
 * @component Toast
 * @description 경량 토스트 알림 시스템
 *
 * 사용자 친화적 에러/성공 메시지 표시
 * - 자동 닫힘 (4초)
 * - 애니메이션 (slide-in/fade-out)
 * - 접근성 (ARIA live region)
 *
 * @example
 * ```tsx
 * import { showToast } from '@/components/ui/Toast';
 *
 * showToast('입찰 공고가 저장되었습니다', 'success');
 * showToast('네트워크 오류가 발생했습니다', 'error');
 * ```
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="알림"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
}

// ============================================================================
// TOAST ITEM
// ============================================================================

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: {
    bg: 'bg-neutral-900',
    border: 'border-neutral-700',
    icon: 'text-neutral-300',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
  },
  warning: {
    bg: 'bg-neutral-800/90',
    border: 'border-neutral-700/50',
    icon: 'text-neutral-400',
  },
  info: {
    bg: 'bg-neutral-800/90',
    border: 'border-neutral-700/50',
    icon: 'text-neutral-400',
  },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = TOAST_ICONS[toast.type];
  const styles = TOAST_STYLES[toast.type];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 200);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-lg shadow-lg',
        'pointer-events-auto min-w-[320px] max-w-[420px]',
        'animate-in slide-in-from-right duration-300',
        isExiting && 'animate-out fade-out slide-out-to-right duration-200',
        styles.bg,
        styles.border
      )}
      role="alert"
    >
      {/* Icon */}
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)} />

      {/* Message */}
      <p className="flex-1 text-sm text-neutral-100 leading-relaxed">{toast.message}</p>

      {/* Close Button */}
      <button
        type="button"
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="알림 닫기"
      >
        <X className="w-4 h-4 text-neutral-400" />
      </button>
    </div>
  );
}

// ============================================================================
// GLOBAL API
// ============================================================================

/**
 * 전역 토스트 표시 (Provider 외부에서도 사용 가능)
 *
 * @example
 * ```tsx
 * import { showToast } from '@/components/ui/Toast';
 *
 * showToast('저장되었습니다', 'success');
 * ```
 */
export function showToast(message: string, type: ToastType = 'info', duration = 4000) {
  // Custom event dispatch
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration },
  });
  window.dispatchEvent(event);
}

/**
 * ToastListener 컴포넌트
 * app/layout.tsx에 추가하여 전역 토스트 활성화
 *
 * @example
 * ```tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ToastProvider>
 *           {children}
 *           <ToastListener />
 *         </ToastProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function ToastListener() {
  const { showToast: showToastContext } = useToast();

  useEffect(() => {
    const handleShowToast = (event: Event) => {
      const { message, type, duration } = (event as CustomEvent).detail;
      showToastContext(message, type, duration);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => {
      window.removeEventListener('show-toast', handleShowToast);
    };
  }, [showToastContext]);

  return null;
}
