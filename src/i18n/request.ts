/**
 * @module i18n/request
 * @description 서버 사이드 i18n 요청 설정 (next-intl)
 */

import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, type Locale, locales } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale이 유효한지 확인
  let locale = await requestLocale;

  // 유효하지 않은 로케일이면 기본값 사용
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
