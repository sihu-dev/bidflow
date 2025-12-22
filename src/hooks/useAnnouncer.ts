/**
 * @hook useAnnouncer
 * @description 스크린 리더용 실시간 알림 (ARIA Live Region)
 *
 * 접근성 개선: 시각적 변화를 스크린 리더 사용자에게 음성으로 전달
 *
 * @example
 * ```tsx
 * const announce = useAnnouncer();
 *
 * const handleSave = () => {
 *   saveBid();
 *   announce('입찰 공고가 저장되었습니다', 'polite');
 * };
 * ```
 */

import { useCallback, useEffect, useRef } from 'react';

export type AriaLiveType = 'polite' | 'assertive' | 'off';

/**
 * 스크린 리더 알림 함수
 */
export type AnnounceFunction = (message: string, priority?: AriaLiveType) => void;

/**
 * ARIA Live Region을 사용한 스크린 리더 알림 훅
 */
export function useAnnouncer(): AnnounceFunction {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Live region 생성 (전역 싱글톤)
    if (!announcerRef.current) {
      const existing = document.getElementById('a11y-announcer');
      if (existing) {
        announcerRef.current = existing as HTMLDivElement;
      } else {
        const announcer = document.createElement('div');
        announcer.id = 'a11y-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.setAttribute('role', 'status');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);
        announcerRef.current = announcer;
      }
    }

    // Cleanup: 컴포넌트 언마운트 시 제거하지 않음 (전역 공유)
  }, []);

  const announce = useCallback<AnnounceFunction>((message, priority = 'polite') => {
    if (!announcerRef.current) {
      return;
    }

    const announcer = announcerRef.current;

    // aria-live 속성 업데이트
    announcer.setAttribute('aria-live', priority);

    // 메시지 업데이트 (스크린 리더가 감지)
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);

    // 자동 초기화 (3초 후)
    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  }, []);

  return announce;
}

/**
 * 글로벌 Announcer 컴포넌트
 * _app.tsx 또는 layout.tsx에 추가
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <AriaAnnouncer />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AriaAnnouncer() {
  useEffect(() => {
    // Live region 생성
    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('role', 'status');
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    `;
    document.body.appendChild(announcer);

    return () => {
      document.body.removeChild(announcer);
    };
  }, []);

  return null;
}

/**
 * 유틸리티: 즉시 알림 (전역 함수)
 */
export function announceToScreenReader(message: string, priority: AriaLiveType = 'polite') {
  const announcer = document.getElementById('a11y-announcer');
  if (!announcer) {
    console.warn('[A11y] Announcer not found. Add <AriaAnnouncer /> to your layout.');
    return;
  }

  announcer.setAttribute('aria-live', priority);
  announcer.textContent = '';
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);

  setTimeout(() => {
    announcer.textContent = '';
  }, 3000);
}
