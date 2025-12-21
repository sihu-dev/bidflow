/**
 * @module i18n/config
 * @description 다국어 지원 설정
 */

export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ko';

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};

export const localeFlagEmojis: Record<Locale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
};

/**
 * 로케일 감지 (브라우저 또는 쿠키)
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // 1. 쿠키에서 확인
  const cookieLocale = document.cookie
    .split('; ')
    .find((row) => row.startsWith('locale='))
    ?.split('=')[1] as Locale | undefined;

  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. 브라우저 언어에서 확인
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (locales.includes(browserLang)) {
    return browserLang;
  }

  return defaultLocale;
}

/**
 * 로케일 저장
 */
export function setLocale(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.cookie = `locale=${locale}; path=/; max-age=31536000`; // 1년
  }
}

/**
 * 날짜 포맷터
 */
export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * 금액 포맷터
 */
export function formatCurrency(amount: number, locale: Locale): string {
  const currency = locale === 'ko' ? 'KRW' : 'USD';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 상대 시간 포맷터
 */
export function formatRelativeTime(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return rtf.format(diffHours, 'hour');
  }

  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, 'day');
  }

  const diffMonths = Math.round(diffDays / 30);
  return rtf.format(diffMonths, 'month');
}
