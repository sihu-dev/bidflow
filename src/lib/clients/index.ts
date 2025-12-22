/**
 * @module clients
 * @description BIDFLOW 외부 API 클라이언트 통합 모듈
 *
 * 총 8개 API 클라이언트:
 * - 조달/입찰: TED (EU), SAM.gov (US)
 * - 관세/무역: UNIPASS (관세청)
 * - 금융: ExchangeRate (수출입은행)
 * - 번역: DeepL
 * - 기업정보: NTS (국세청)
 * - 국가정보: Countries (REST Countries)
 * - 국내조달: G2B (나라장터) - TODO
 */

import type { BidData, CreateInput } from '@forge-labs/types/bidding';

// ============================================================================
// 내부 임포트 (함수 사용용)
// ============================================================================

import {
  TEDAPIClient,
  getTEDClient as _getTEDClient,
  convertTEDToBidData as _convertTEDToBidData,
} from './ted-api';

import {
  SAMGovAPIClient,
  getSAMGovClient as _getSAMGovClient,
  convertSAMToBidData as _convertSAMToBidData,
} from './sam-gov-api';

import {
  UnipassClient,
  getUnipassClient as _getUnipassClient,
  hsCodeToCPV,
  hsCodeToNAICS,
} from './unipass-api';

import {
  ExchangeRateClient,
  getExchangeRateClient as _getExchangeRateClient,
} from './exchange-rate-api';

import {
  DeepLClient,
  getDeepLClient as _getDeepLClient,
  postProcessBidTranslation,
  detectLanguage,
} from './deepl-api';

import {
  NTSClient,
  getNTSClient as _getNTSClient,
  formatBusinessNo,
  getTaxTypeName,
  checkBidEligibility,
} from './nts-api';

import {
  CountriesClient,
  getCountriesClient as _getCountriesClient,
  EU_COUNTRIES as _EU_COUNTRIES,
  EEA_COUNTRIES,
  FTA_COUNTRIES,
  PROCUREMENT_PORTALS,
  getCountryNameKo,
  getTimezoneOffset,
} from './countries-api';

// ============================================================================
// 조달/입찰 API - 재export
// ============================================================================

export { TEDAPIClient } from './ted-api';
export { getTEDClient, convertTEDToBidData } from './ted-api';
export type { TEDSearchParams, TEDNotice, TEDSearchResponse } from './ted-api';

export { SAMGovAPIClient } from './sam-gov-api';
export { getSAMGovClient, convertSAMToBidData } from './sam-gov-api';

// ============================================================================
// 관세/무역 API - 재export
// ============================================================================

export { UnipassClient, getUnipassClient, hsCodeToCPV, hsCodeToNAICS } from './unipass-api';
export type { HSCodeInfo, TariffInfo, CargoTrackingInfo } from './unipass-api';

// ============================================================================
// 금융 API - 재export
// ============================================================================

export { ExchangeRateClient, getExchangeRateClient } from './exchange-rate-api';
export type { ExchangeRate } from './exchange-rate-api';

// ============================================================================
// 번역 API - 재export
// ============================================================================

export { DeepLClient, getDeepLClient, postProcessBidTranslation, detectLanguage } from './deepl-api';
export type {
  DeepLSourceLang,
  DeepLTargetLang,
  TranslationResult,
  TranslationRequest,
} from './deepl-api';

// ============================================================================
// 기업정보 API - 재export
// ============================================================================

export { NTSClient, getNTSClient, formatBusinessNo, getTaxTypeName, checkBidEligibility } from './nts-api';
export type { BusinessVerification, BusinessStatus } from './nts-api';

// ============================================================================
// 국가정보 API - 재export
// ============================================================================

export {
  CountriesClient,
  getCountriesClient,
  EU_COUNTRIES,
  EEA_COUNTRIES,
  FTA_COUNTRIES,
  PROCUREMENT_PORTALS,
  getCountryNameKo,
  getTimezoneOffset,
} from './countries-api';
export type { CountryInfo, CountryBidInfo } from './countries-api';

// ============================================================================
// 통합 클라이언트 인터페이스
// ============================================================================

export interface BidflowClients {
  ted: TEDAPIClient;
  sam: SAMGovAPIClient;
  unipass: UnipassClient;
  exchangeRate: ExchangeRateClient;
  deepL: DeepLClient;
  nts: NTSClient;
  countries: CountriesClient;
}

/**
 * 모든 API 클라이언트 초기화
 */
export function initAllClients(): BidflowClients {
  return {
    ted: _getTEDClient(),
    sam: _getSAMGovClient(),
    unipass: _getUnipassClient(),
    exchangeRate: _getExchangeRateClient(),
    deepL: _getDeepLClient(),
    nts: _getNTSClient(),
    countries: _getCountriesClient(),
  };
}

// ============================================================================
// 환경변수 검증
// ============================================================================

export interface ApiKeyStatus {
  name: string;
  envVar: string;
  required: boolean;
  configured: boolean;
}

/**
 * API 키 설정 상태 확인
 */
export function checkApiKeys(): ApiKeyStatus[] {
  return [
    {
      name: 'TED API',
      envVar: 'TED_API_KEY',
      required: false, // 공개 API
      configured: true,
    },
    {
      name: 'SAM.gov API',
      envVar: 'SAM_GOV_API_KEY',
      required: true,
      configured: !!process.env.SAM_GOV_API_KEY,
    },
    {
      name: 'UNIPASS API',
      envVar: 'UNIPASS_API_KEY',
      required: true,
      configured: !!process.env.UNIPASS_API_KEY,
    },
    {
      name: '수출입은행 환율',
      envVar: 'KOREAEXIM_API_KEY',
      required: true,
      configured: !!process.env.KOREAEXIM_API_KEY,
    },
    {
      name: 'DeepL 번역',
      envVar: 'DEEPL_API_KEY',
      required: true,
      configured: !!process.env.DEEPL_API_KEY,
    },
    {
      name: '국세청 (data.go.kr)',
      envVar: 'NTS_API_KEY',
      required: true,
      configured: !!(process.env.NTS_API_KEY || process.env.DATA_GO_KR_API_KEY),
    },
    {
      name: 'REST Countries',
      envVar: 'N/A',
      required: false, // 공개 API
      configured: true,
    },
  ];
}

/**
 * 필수 API 키 누락 확인
 */
export function getMissingApiKeys(): string[] {
  return checkApiKeys()
    .filter(k => k.required && !k.configured)
    .map(k => k.envVar);
}

// ============================================================================
// 입찰 데이터 통합 수집
// ============================================================================

export interface BidSearchOptions {
  keywords?: string[];
  cpvCodes?: string[];
  naicsCodes?: string[];
  countries?: string[];
  fromDate?: Date;
  toDate?: Date;
  maxResults?: number;
}

/**
 * 모든 소스에서 입찰 공고 통합 검색
 */
export async function searchAllBids(
  options: BidSearchOptions
): Promise<{ source: string; bids: CreateInput<BidData>[]; error?: string }[]> {
  const clients = initAllClients();
  const results: { source: string; bids: CreateInput<BidData>[]; error?: string }[] = [];

  // TED (EU) 검색
  try {
    const tedNotices = await clients.ted.searchFlowMeterTenders({
      fromDate: options.fromDate,
      toDate: options.toDate,
      countries: options.countries?.filter(c => _EU_COUNTRIES.includes(c)),
    });
    const tedBids = tedNotices.map(_convertTEDToBidData);
    results.push({ source: 'ted', bids: tedBids });
  } catch (error) {
    results.push({ source: 'ted', bids: [], error: String(error) });
  }

  // SAM.gov (US) 검색
  try {
    const samNotices = await clients.sam.searchOpportunities({
      keywords: options.keywords,
      naicsCode: options.naicsCodes,
      postedFrom: options.fromDate?.toISOString().slice(0, 10),
      postedTo: options.toDate?.toISOString().slice(0, 10),
    });
    const samBids = samNotices.opportunitiesData.map(_convertSAMToBidData);
    results.push({ source: 'sam', bids: samBids });
  } catch (error) {
    results.push({ source: 'sam', bids: [], error: String(error) });
  }

  return results;
}

/**
 * 입찰 공고 번역 (영어 → 한국어)
 */
export async function translateBidToKorean(
  title: string,
  description?: string
): Promise<{ title: string; description?: string }> {
  const client = _getDeepLClient();

  const translatedTitle = await client.translateBidNotice(title, 'KO');

  let translatedDesc: string | undefined;
  if (description) {
    translatedDesc = await client.translateBidNotice(description, 'KO');
  }

  return {
    title: translatedTitle,
    description: translatedDesc,
  };
}

/**
 * 입찰 금액 환율 변환 (→ KRW)
 */
export async function convertBidAmountToKRW(
  amount: number,
  currency: string
): Promise<number> {
  if (currency === 'KRW') return amount;

  const client = _getExchangeRateClient();
  return client.convertToKRW(amount, currency);
}
