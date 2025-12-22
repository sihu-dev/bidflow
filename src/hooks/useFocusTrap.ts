/**
 * @hook useFocusTrap
 * @description 모달/드롭다운에서 포커스 가둬두기 (Focus Trap)
 *
 * 접근성 개선: 모달 열린 상태에서 Tab 키로 배경 요소에 포커스되는 것 방지
 *
 * @example
 * ```tsx
 * const dialogRef = useFocusTrap<HTMLDivElement>({ isActive: isOpen });
 *
 * return (
 *   <div ref={dialogRef} role="dialog">
 *     <button>Close</button>
 *   </div>
 * );
 * ```
 */

import { useEffect, useRef } from 'react';
import { getFocusableElements } from './useKeyboardNavigation';

export interface FocusTrapOptions {
  /** 포커스 트랩 활성화 여부 */
  isActive: boolean;
  /** 초기 포커스 엘리먼트 선택자 (기본: 첫 번째 포커스 가능 요소) */
  initialFocusSelector?: string;
  /** 트랩 비활성화 시 포커스 복원 여부 (기본값: true) */
  restoreFocus?: boolean;
}

export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: FocusTrapOptions
) {
  const { isActive, initialFocusSelector, restoreFocus = true } = options;

  const containerRef = useRef<T>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) {
      return;
    }

    const container = containerRef.current;

    // 이전 포커스 요소 저장
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // 초기 포커스 설정
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) {
      return;
    }

    let initialElement = focusableElements[0];
    if (initialFocusSelector) {
      const customElement = container.querySelector<HTMLElement>(
        initialFocusSelector
      );
      if (customElement) {
        initialElement = customElement;
      }
    }

    initialElement.focus();

    // Tab 키 핸들러
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(container);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab (역방향)
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (순방향)
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // 이벤트 리스너 등록
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // 포커스 복원
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isActive, initialFocusSelector, restoreFocus]);

  return containerRef;
}

/**
 * 포커스 트랩과 키보드 네비게이션을 함께 사용하는 훅
 *
 * @example
 * ```tsx
 * const { containerRef, focusedIndex, handleKeyDown } = useFocusableList({
 *   isActive: isOpen,
 *   itemCount: items.length,
 *   onSelect: handleSelect,
 *   onEscape: handleClose,
 * });
 * ```
 */
export function useFocusableList<T extends HTMLElement = HTMLElement>(
  options: FocusTrapOptions & {
    itemCount: number;
    onSelect?: (index: number) => void;
    onEscape?: () => void;
  }
) {
  const { isActive, itemCount, onSelect, onEscape, ...trapOptions } = options;

  const containerRef = useFocusTrap<T>({ isActive, ...trapOptions });

  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case 'Enter':
      case ' ':
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
  };

  return {
    containerRef,
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
}

// React import for useFocusableList
import * as React from 'react';
