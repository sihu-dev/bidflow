/**
 * @module clients/countries-api
 * @description REST Countries API 클라이언트 (국가 정보 조회)
 * @see https://restcountries.com/
 */

// ============================================================================
// 타입 정의
// ============================================================================

export interface CountryInfo {
  code: string;           // ISO 3166-1 alpha-2 (KR, US, DE)
  code3: string;          // ISO 3166-1 alpha-3 (KOR, USA, DEU)
  name: string;           // 공식 국가명
  nameKo?: string;        // 한국어 국가명
  capital: string[];      // 수도
  region: string;         // 대륙 (Asia, Europe, Americas)
  subregion: string;      // 세부 지역
  population: number;     // 인구
  currencies: {           // 통화 정보
    code: string;
    name: string;
    symbol: string;
  }[];
  languages: {            // 공용어
    code: string;
    name: string;
  }[];
  timezones: string[];    // 시간대
  flag: string;           // 국기 이모지
  flagUrl: string;        // 국기 이미지 URL
  callingCode: string;    // 국제전화 코드
  tld: string[];          // 최상위 도메인
}

export interface CountryBidInfo {
  countryCode: string;
  procurementPortal?: string;      // 조달 포털 URL
  procurementCurrency: string;     // 조달 통화
  bidLanguages: string[];          // 입찰 언어
  tradingBloc?: string;            // 무역 블록 (EU, NAFTA, ASEAN)
  tedAccess: boolean;              // TED 접근 가능 여부
  samAccess: boolean;              // SAM.gov 접근 가능 여부
  ftaWithKorea: boolean;           // 한국과 FTA 여부
}

interface RESTCountryResponse {
  cca2: string;
  cca3: string;
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { common: string; official: string }>;
  };
  translations?: Record<string, { common: string; official: string }>;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  timezones: string[];
  flag: string;
  flags: { png: string; svg: string };
  idd?: { root?: string; suffixes?: string[] };
  tld?: string[];
}

// ============================================================================
// REST Countries API 클라이언트
// ============================================================================

export class CountriesClient {
  private baseUrl = 'https://restcountries.com/v3.1';
  private cache: Map<string, { data: CountryInfo; timestamp: number }> = new Map();
  private cacheTTL = 86400000; // 24시간

  /**
   * 모든 국가 목록 조회
   */
  async getAllCountries(): Promise<CountryInfo[]> {
    const cached = this.cache.get('all');
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return [cached.data]; // 단일 캐시가 아닌 전체 캐시 필요
    }

    const response = await fetch(`${this.baseUrl}/all?fields=cca2,cca3,name,capital,region,subregion,population,currencies,languages,timezones,flag,flags,idd,tld,translations`);

    if (!response.ok) {
      throw new Error(`REST Countries API 오류 (${response.status})`);
    }

    const data: RESTCountryResponse[] = await response.json();
    return data.map(this.parseCountry);
  }

  /**
   * 국가 코드로 조회
   */
  async getCountryByCode(code: string): Promise<CountryInfo | null> {
    const cacheKey = `code:${code.toUpperCase()}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/alpha/${code}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`REST Countries API 오류 (${response.status})`);
      }

      const data: RESTCountryResponse[] = await response.json();
      if (data.length === 0) return null;

      const country = this.parseCountry(data[0]);
      this.cache.set(cacheKey, { data: country, timestamp: Date.now() });
      return country;
    } catch (error) {
      console.error('[Countries API] 국가 조회 실패:', error);
      return null;
    }
  }

  /**
   * 국가명으로 검색
   */
  async searchByName(name: string): Promise<CountryInfo[]> {
    const response = await fetch(`${this.baseUrl}/name/${encodeURIComponent(name)}`);

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`REST Countries API 오류 (${response.status})`);
    }

    const data: RESTCountryResponse[] = await response.json();
    return data.map(this.parseCountry);
  }

  /**
   * 지역별 국가 목록
   */
  async getCountriesByRegion(region: string): Promise<CountryInfo[]> {
    const response = await fetch(`${this.baseUrl}/region/${encodeURIComponent(region)}`);

    if (!response.ok) {
      throw new Error(`REST Countries API 오류 (${response.status})`);
    }

    const data: RESTCountryResponse[] = await response.json();
    return data.map(this.parseCountry);
  }

  /**
   * 입찰 관련 국가 정보 조회
   */
  async getBidInfo(countryCode: string): Promise<CountryBidInfo | null> {
    const country = await this.getCountryByCode(countryCode);
    if (!country) return null;

    return {
      countryCode: country.code,
      procurementPortal: PROCUREMENT_PORTALS[country.code],
      procurementCurrency: country.currencies[0]?.code || 'USD',
      bidLanguages: country.languages.map(l => l.name),
      tradingBloc: getTradingBloc(country.code),
      tedAccess: EU_COUNTRIES.includes(country.code) || EEA_COUNTRIES.includes(country.code),
      samAccess: country.code === 'US' || isNAFTACountry(country.code),
      ftaWithKorea: FTA_COUNTRIES.includes(country.code),
    };
  }

  /**
   * EU 회원국 목록
   */
  async getEUCountries(): Promise<CountryInfo[]> {
    const allCountries = await this.getAllCountries();
    return allCountries.filter(c => EU_COUNTRIES.includes(c.code));
  }

  /**
   * 한국 FTA 체결국 목록
   */
  async getFTACountries(): Promise<CountryInfo[]> {
    const allCountries = await this.getAllCountries();
    return allCountries.filter(c => FTA_COUNTRIES.includes(c.code));
  }

  // ============================================================================
  // Private 메서드
  // ============================================================================

  private parseCountry(data: RESTCountryResponse): CountryInfo {
    const currencies = data.currencies
      ? Object.entries(data.currencies).map(([code, info]) => ({
          code,
          name: info.name,
          symbol: info.symbol,
        }))
      : [];

    const languages = data.languages
      ? Object.entries(data.languages).map(([code, name]) => ({
          code,
          name,
        }))
      : [];

    const callingCode = data.idd?.root
      ? `${data.idd.root}${data.idd.suffixes?.[0] || ''}`
      : '';

    return {
      code: data.cca2,
      code3: data.cca3,
      name: data.name.official,
      nameKo: data.translations?.kor?.common,
      capital: data.capital || [],
      region: data.region,
      subregion: data.subregion || '',
      population: data.population,
      currencies,
      languages,
      timezones: data.timezones,
      flag: data.flag,
      flagUrl: data.flags.svg,
      callingCode,
      tld: data.tld || [],
    };
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let countriesClient: CountriesClient | null = null;

export function getCountriesClient(): CountriesClient {
  if (!countriesClient) {
    countriesClient = new CountriesClient();
  }
  return countriesClient;
}

// ============================================================================
// 상수 및 유틸리티
// ============================================================================

/** EU 회원국 */
export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
];

/** EEA 회원국 (EU + 노르웨이, 아이슬란드, 리히텐슈타인) */
export const EEA_COUNTRIES = [...EU_COUNTRIES, 'NO', 'IS', 'LI'];

/** 한국 FTA 체결국 */
export const FTA_COUNTRIES = [
  // 아시아
  'SG', 'IN', 'MY', 'VN', 'ID', 'TH', 'PH', 'BN', 'KH', 'LA', 'MM',
  // 유럽
  ...EU_COUNTRIES, 'GB', 'TR', 'NO', 'IS', 'LI', 'CH',
  // 아메리카
  'US', 'CA', 'MX', 'CL', 'PE', 'CO', 'PA', 'HN', 'SV', 'CR', 'NI',
  // 오세아니아
  'AU', 'NZ',
  // 중국/기타
  'CN',
];

/** 주요 조달 포털 */
export const PROCUREMENT_PORTALS: Record<string, string> = {
  'US': 'https://sam.gov/',
  'KR': 'https://www.g2b.go.kr/',
  'DE': 'https://www.evergabe-online.de/',
  'FR': 'https://www.boamp.fr/',
  'GB': 'https://www.gov.uk/contracts-finder',
  'JP': 'https://www.jetro.go.jp/en/database/procurement/',
  'AU': 'https://www.tenders.gov.au/',
  'CA': 'https://buyandsell.gc.ca/',
  'SG': 'https://www.gebiz.gov.sg/',
  'IN': 'https://eprocure.gov.in/',
};

/**
 * 무역 블록 반환
 */
function getTradingBloc(countryCode: string): string | undefined {
  if (EU_COUNTRIES.includes(countryCode)) return 'EU';
  if (['US', 'CA', 'MX'].includes(countryCode)) return 'USMCA';
  if (['SG', 'MY', 'TH', 'ID', 'PH', 'VN', 'BN', 'KH', 'LA', 'MM'].includes(countryCode)) return 'ASEAN';
  if (['AU', 'NZ', 'JP', 'KR', 'CN'].includes(countryCode)) return 'RCEP';
  return undefined;
}

/**
 * NAFTA/USMCA 국가 여부
 */
function isNAFTACountry(code: string): boolean {
  return ['US', 'CA', 'MX'].includes(code);
}

/**
 * 국가 코드 → 한국어 국가명
 */
export function getCountryNameKo(code: string): string {
  const names: Record<string, string> = {
    'US': '미국',
    'GB': '영국',
    'DE': '독일',
    'FR': '프랑스',
    'JP': '일본',
    'CN': '중국',
    'KR': '한국',
    'AU': '호주',
    'CA': '캐나다',
    'SG': '싱가포르',
    'IT': '이탈리아',
    'ES': '스페인',
    'NL': '네덜란드',
    'BE': '벨기에',
    'AT': '오스트리아',
    'CH': '스위스',
    'SE': '스웨덴',
    'NO': '노르웨이',
    'DK': '덴마크',
    'FI': '핀란드',
    'PL': '폴란드',
    'CZ': '체코',
    'HU': '헝가리',
    'PT': '포르투갈',
    'GR': '그리스',
    'IE': '아일랜드',
    'RO': '루마니아',
    'BG': '불가리아',
    'SK': '슬로바키아',
    'SI': '슬로베니아',
    'HR': '크로아티아',
    'LT': '리투아니아',
    'LV': '라트비아',
    'EE': '에스토니아',
    'MX': '멕시코',
    'BR': '브라질',
    'AR': '아르헨티나',
    'CL': '칠레',
    'CO': '콜롬비아',
    'PE': '페루',
    'VN': '베트남',
    'TH': '태국',
    'MY': '말레이시아',
    'ID': '인도네시아',
    'PH': '필리핀',
    'IN': '인도',
    'AE': '아랍에미리트',
    'SA': '사우디아라비아',
    'TR': '튀르키예',
    'ZA': '남아프리카공화국',
    'EG': '이집트',
    'NG': '나이지리아',
    'NZ': '뉴질랜드',
  };
  return names[code] || code;
}

/**
 * 국가 코드로 시간대 오프셋 계산 (한국 기준)
 */
export function getTimezoneOffset(countryCode: string): number {
  const offsets: Record<string, number> = {
    'US': -14, // EST (뉴욕)
    'GB': -9,
    'DE': -8,
    'FR': -8,
    'JP': 0,
    'CN': -1,
    'AU': 1, // AEST (시드니)
    'SG': -1,
  };
  return offsets[countryCode] ?? 0;
}
