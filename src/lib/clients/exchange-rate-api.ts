/**
 * @module clients/exchange-rate-api
 * @description 한국수출입은행 환율 API 클라이언트
 * @see https://www.koreaexim.go.kr/ir/HPHKIR020M01?apino=2&viewtype=C
 */

// ============================================================================
// 타입 정의
// ============================================================================

export interface ExchangeRate {
  currencyCode: string;      // 통화코드 (USD, EUR, JPY 등)
  currencyName: string;      // 통화명
  ttb: number;               // 전신환 매입률
  tts: number;               // 전신환 매도률
  dealBasR: number;          // 매매기준율
  bkpr: number;              // 장부가격
  tenDDEfeeR?: number;       // 10일물 환가료율
  kftcDealBasR?: number;     // 서울외국환중개 매매기준율
  kftcBkpr?: number;         // 서울외국환중개 장부가격
}

interface RawExchangeRateResponse {
  result: number;
  cur_unit: string;
  cur_nm: string;
  ttb: string;
  tts: string;
  deal_bas_r: string;
  bkpr: string;
  yy_efee_r?: string;
  ten_dd_efee_r?: string;
  kftc_deal_bas_r?: string;
  kftc_bkpr?: string;
}

// ============================================================================
// 환율 API 클라이언트
// ============================================================================

export class ExchangeRateClient {
  private baseUrl = 'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON';
  private apiKey: string;
  private cache: Map<string, { data: ExchangeRate[]; timestamp: number }> = new Map();
  private cacheTTL = 3600000; // 1시간

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.KOREAEXIM_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[환율API] API 키가 설정되지 않았습니다.');
    }
  }

  /**
   * 당일 환율 조회
   */
  async getExchangeRates(date?: Date): Promise<ExchangeRate[]> {
    const searchDate = date || new Date();
    const dateStr = this.formatDate(searchDate);

    // 캐시 확인
    const cached = this.cache.get(dateStr);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const url = `${this.baseUrl}?authkey=${this.apiKey}&data=AP01&searchdate=${dateStr}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`환율 API 오류 (${response.status})`);
    }

    const data: RawExchangeRateResponse[] = await response.json();

    // result가 4면 데이터 없음 (영업일 아님)
    if (!Array.isArray(data) || data.length === 0) {
      // 이전 영업일 데이터 조회
      const prevDate = new Date(searchDate);
      prevDate.setDate(prevDate.getDate() - 1);
      return this.getExchangeRates(prevDate);
    }

    const rates = data.map(this.parseRate);

    // 캐시 저장
    this.cache.set(dateStr, { data: rates, timestamp: Date.now() });

    return rates;
  }

  /**
   * 특정 통화 환율 조회
   */
  async getRate(currencyCode: string, date?: Date): Promise<ExchangeRate | null> {
    const rates = await this.getExchangeRates(date);
    return rates.find(r => r.currencyCode === currencyCode) || null;
  }

  /**
   * 원화 환산
   */
  async convertToKRW(amount: number, fromCurrency: string, date?: Date): Promise<number> {
    const rate = await this.getRate(fromCurrency, date);
    if (!rate) {
      throw new Error(`환율 정보 없음: ${fromCurrency}`);
    }
    return Math.round(amount * rate.dealBasR);
  }

  /**
   * 외화 환산
   */
  async convertFromKRW(amountKRW: number, toCurrency: string, date?: Date): Promise<number> {
    const rate = await this.getRate(toCurrency, date);
    if (!rate) {
      throw new Error(`환율 정보 없음: ${toCurrency}`);
    }
    return Math.round((amountKRW / rate.dealBasR) * 100) / 100;
  }

  /**
   * 주요 통화 환율 조회
   */
  async getMajorRates(date?: Date): Promise<Record<string, number>> {
    const majorCurrencies = ['USD', 'EUR', 'JPY(100)', 'GBP', 'CNH', 'AED'];
    const rates = await this.getExchangeRates(date);

    const result: Record<string, number> = {};
    for (const rate of rates) {
      if (majorCurrencies.some(c => rate.currencyCode.startsWith(c.split('(')[0]))) {
        result[rate.currencyCode] = rate.dealBasR;
      }
    }
    return result;
  }

  // ============================================================================
  // Private 메서드
  // ============================================================================

  private parseRate(raw: RawExchangeRateResponse): ExchangeRate {
    const parseNumber = (str?: string): number => {
      if (!str) return 0;
      return parseFloat(str.replace(/,/g, '')) || 0;
    };

    return {
      currencyCode: raw.cur_unit,
      currencyName: raw.cur_nm,
      ttb: parseNumber(raw.ttb),
      tts: parseNumber(raw.tts),
      dealBasR: parseNumber(raw.deal_bas_r),
      bkpr: parseNumber(raw.bkpr),
      tenDDEfeeR: parseNumber(raw.ten_dd_efee_r),
      kftcDealBasR: parseNumber(raw.kftc_deal_bas_r),
      kftcBkpr: parseNumber(raw.kftc_bkpr),
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let exchangeClient: ExchangeRateClient | null = null;

export function getExchangeRateClient(): ExchangeRateClient {
  if (!exchangeClient) {
    exchangeClient = new ExchangeRateClient();
  }
  return exchangeClient;
}
