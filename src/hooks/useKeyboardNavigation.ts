/**
 * @hook useKeyboardNavigation
 * @description 키보드 네비게이션 지원 (화살표, Enter, Escape)
 *
 * 접근성 개선: 마우스 없이 키보드만으로 UI 조작 가능
 *
 * @example
 * ```tsx
 * const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
 *   itemCount: 10,
 *   onSelect: (index) => console.log('Selected:', index),
 *   onEscape: () => console.log('Closed'),
 * });
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface KeyboardNavigationOptions {
  /** 아이템 총 개수 */
  itemCount: number;
  /** 초기 포커스 인덱스 (기본값: 0) */
  initialIndex?: number;
  /** Enter 키로 선택 시 콜백 */
  onSelect?: (index: number) => void;
  /** Escape 키로 닫기 시 콜백 */
  onEscape?: () => void;
  /** 자동 포커스 활성화 (기본값: true) */
  autoFocus?: boolean;
  /** 순환 네비게이션 활성화 (기본값: true) */
  loop?: boolean;
  /** 방향 (수평/수직, 기본값: vertical) */
  orientation?: 'horizontal' | 'vertical';
}

export interface KeyboardNavigationReturn {
  /** 현재 포커스된 인덱스 */
  focusedIndex: number;
  /** 포커스 인덱스 설정 */
  setFocusedIndex: (index: number) => void;
  /** 키보드 이벤트 핸들러 */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** 특정 인덱스가 포커스되었는지 확인 */
  isFocused: (index: number) => boolean;
}

export function useKeyboardNavigation(
  options: KeyboardNavigationOptions
): KeyboardNavigationReturn {
  const {
    itemCount,
    initialIndex = 0,
    onSelect,
    onEscape,
    autoFocus = true,
    loop = true,
    orientation = 'vertical',
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const containerRef = useRef<boolean>(false);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && !containerRef.current) {
      containerRef.current = true;
    }
  }, [autoFocus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isVertical = orientation === 'vertical';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          setFocusedIndex((prev) => {
            if (prev >= itemCount - 1) {
              return loop ? 0 : prev;
            }
            return prev + 1;
          });
          break;

        case prevKey:
          e.preventDefault();
          setFocusedIndex((prev) => {
            if (prev <= 0) {
              return loop ? itemCount - 1 : prev;
            }
            return prev - 1;
          });
          break;

        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          setFocusedIndex(itemCount - 1);
          break;

        case 'Enter':
        case ' ': // Space
          e.preventDefault();
          if (onSelect) {
            onSelect(focusedIndex);
          }
          break;

        case 'Escape':
          e.preventDefault();
          if (onEscape) {
            onEscape();
          }
          break;

        default:
          break;
      }
    },
    [focusedIndex, itemCount, loop, orientation, onSelect, onEscape]
  );

  const isFocused = useCallback(
    (index: number) => index === focusedIndex,
    [focusedIndex]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    isFocused,
  };
}

/**
 * 포커스 가능한 엘리먼트 선택자
 */
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * 컨테이너 내 포커스 가능한 모든 엘리먼트 가져오기
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
  );
}
