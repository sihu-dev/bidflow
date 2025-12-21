/**
 * @module i18n
 * @description 다국어 지원 모듈 내보내기
 */

export * from './config';

// 메시지 타입 (자동 완성용)
export type Messages = typeof import('./messages/ko.json');
