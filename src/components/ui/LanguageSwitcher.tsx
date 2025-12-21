'use client';

/**
 * @component LanguageSwitcher
 * @description 언어 전환 드롭다운 컴포넌트
 */

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeFlagEmojis, type Locale } from '@/i18n/config';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
}

export function LanguageSwitcher({ currentLocale, className = '' }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    // 현재 경로에서 로케일 부분 교체
    let newPath = pathname;

    // 현재 로케일이 경로에 있으면 교체
    for (const locale of locales) {
      if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
        newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        break;
      }
    }

    // 로케일이 경로에 없으면 추가 (기본 로케일이 아닌 경우)
    if (newPath === pathname && newLocale !== 'ko') {
      newPath = `/${newLocale}${pathname}`;
    }

    // 쿠키에 로케일 저장
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;

    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
        aria-label="언어 선택"
        aria-expanded={isOpen}
      >
        <span>{localeFlagEmojis[currentLocale]}</span>
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* 배경 클릭으로 닫기 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 mt-2 w-40 py-1 bg-white rounded-md shadow-lg border border-neutral-200 z-20">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                  locale === currentLocale
                    ? 'bg-neutral-100 text-neutral-900 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{localeFlagEmojis[locale]}</span>
                <span>{localeNames[locale]}</span>
                {locale === currentLocale && (
                  <svg
                    className="w-4 h-4 ml-auto text-neutral-900"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
