/**
 * @module clients/unipass-api
 * @description 관세청 UNIPASS API 클라이언트 (HS코드, 관세율 조회)
 * @see https://unipass.customs.go.kr/
 */

// ============================================================================
// 타입 정의
// ============================================================================

export interface HSCodeInfo {
  hsCode: string;           // HS 코드 (10자리)
  hsCodeDesc: string;       // 품목명
  hsSummary: string;        // 간략 설명
  unit: string;             // 단위
  basicTariffRate: number;  // 기본관세율 (%)
  wtoTariffRate?: number;   // WTO 양허세율
  ftaTariffRates?: {        // FTA 특혜세율
    country: string;
    rate: number;
  }[];
}

export interface TariffInfo {
  hsCode: string;
  countryCode: string;
  tariffRate: number;
  tariffType: string;       // 기본, WTO, FTA 등
  effectiveDate: string;
  expiryDate?: string;
}

export interface CargoTrackingInfo {
  blNo: string;             // B/L 번호
  cargMtNo: string;         // 화물관리번호
  prgsStts: string;         // 진행상태
  prcsDttm: string;         // 처리일시
  shpmNm: string;           // 선박명
  loadPortNm: string;       // 선적항
  dsprPortNm: string;       // 양하항
  etprDt: string;           // 입항예정일
  csclPrgsStts: string;     // 통관진행상태
}

// ============================================================================
// UNIPASS API 클라이언트
// ============================================================================

export class UnipassClient {
  private baseUrl = 'https://unipass.customs.go.kr:38010/ext/rest';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.UNIPASS_API_KEY || '';
  }

  /**
   * HS코드 검색
   */
  async searchHSCode(keyword: string): Promise<HSCodeInfo[]> {
    const url = `${this.baseUrl}/hsSrch/retrieveHsSrch`;
    const params = new URLSearchParams({
      crkyCn: this.apiKey,
      hsSgn: keyword,
      searchOpt: '1', // 1: 품명검색, 2: HS코드검색
    });

    try {
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`UNIPASS API 오류 (${response.status})`);
      }

      const data = await response.text();
      return this.parseHSCodeResponse(data);
    } catch (error) {
      console.error('[UNIPASS] HS코드 검색 실패:', error);
      return [];
    }
  }

  /**
   * HS코드로 상세 정보 조회
   */
  async getHSCodeInfo(hsCode: string): Promise<HSCodeInfo | null> {
    const url = `${this.baseUrl}/hsInfo/retrieveHsInfo`;
    const params = new URLSearchParams({
      crkyCn: this.apiKey,
      hsSgn: hsCode,
    });

    try {
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) return null;

      const data = await response.text();
      const results = this.parseHSCodeResponse(data);
      return results[0] || null;
    } catch (error) {
      console.error('[UNIPASS] HS코드 조회 실패:', error);
      return null;
    }
  }

  /**
   * 관세율 조회
   */
  async getTariffRate(hsCode: string, countryCode?: string): Promise<TariffInfo[]> {
    const url = `${this.baseUrl}/tffRtInfo/retrieveTffRtInfo`;
    const params = new URLSearchParams({
      crkyCn: this.apiKey,
      hsSgn: hsCode,
      ...(countryCode ? { ntnCd: countryCode } : {}),
    });

    try {
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`UNIPASS API 오류 (${response.status})`);
      }

      const data = await response.text();
      return this.parseTariffResponse(data, hsCode);
    } catch (error) {
      console.error('[UNIPASS] 관세율 조회 실패:', error);
      return [];
    }
  }

  /**
   * 화물 통관 진행 조회
   */
  async trackCargo(blNo: string): Promise<CargoTrackingInfo[]> {
    const url = `${this.baseUrl}/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo`;
    const params = new URLSearchParams({
      crkyCn: this.apiKey,
      blNo: blNo,
    });

    try {
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`UNIPASS API 오류 (${response.status})`);
      }

      const data = await response.text();
      return this.parseCargoTrackingResponse(data);
    } catch (error) {
      console.error('[UNIPASS] 화물 추적 실패:', error);
      return [];
    }
  }

  /**
   * 유량계 관련 HS 코드 조회
   */
  async getFlowMeterHSCodes(): Promise<HSCodeInfo[]> {
    // 유량계/계량기 관련 HS 코드
    const flowMeterHSPrefixes = [
      '9026.10',  // 액체 유량 또는 유면 측정기기
      '9026.20',  // 압력 측정기기
      '9028.10',  // 가스미터
      '9028.20',  // 액체미터
      '9028.30',  // 전기미터
      '9032.89',  // 자동 조절 또는 제어기기
    ];

    const results: HSCodeInfo[] = [];

    for (const prefix of flowMeterHSPrefixes) {
      const codes = await this.searchHSCode(prefix);
      results.push(...codes);
    }

    return results;
  }

  // ============================================================================
  // Private 파싱 메서드
  // ============================================================================

  private parseHSCodeResponse(xmlData: string): HSCodeInfo[] {
    // XML 파싱 (간단한 정규식 사용)
    const results: HSCodeInfo[] = [];

    const itemRegex = /<hsSrchRsltVo>([\s\S]*?)<\/hsSrchRsltVo>/g;
    let match;

    while ((match = itemRegex.exec(xmlData)) !== null) {
      const item = match[1];
      results.push({
        hsCode: this.extractXmlValue(item, 'hsSgn') || '',
        hsCodeDesc: this.extractXmlValue(item, 'hskNm') || '',
        hsSummary: this.extractXmlValue(item, 'hsDesc') || '',
        unit: this.extractXmlValue(item, 'qtyUnitCd') || 'KG',
        basicTariffRate: parseFloat(this.extractXmlValue(item, 'bascTxrt') || '0'),
      });
    }

    return results;
  }

  private parseTariffResponse(xmlData: string, hsCode: string): TariffInfo[] {
    const results: TariffInfo[] = [];

    const itemRegex = /<tffRtInfoVo>([\s\S]*?)<\/tffRtInfoVo>/g;
    let match;

    while ((match = itemRegex.exec(xmlData)) !== null) {
      const item = match[1];
      results.push({
        hsCode,
        countryCode: this.extractXmlValue(item, 'ntnCd') || 'ALL',
        tariffRate: parseFloat(this.extractXmlValue(item, 'txrt') || '0'),
        tariffType: this.extractXmlValue(item, 'txrtSeCd') || 'BASIC',
        effectiveDate: this.extractXmlValue(item, 'aplBgnDt') || '',
        expiryDate: this.extractXmlValue(item, 'aplEndDt'),
      });
    }

    return results;
  }

  private parseCargoTrackingResponse(xmlData: string): CargoTrackingInfo[] {
    const results: CargoTrackingInfo[] = [];

    const itemRegex = /<cargCsclPrgsInfoVo>([\s\S]*?)<\/cargCsclPrgsInfoVo>/g;
    let match;

    while ((match = itemRegex.exec(xmlData)) !== null) {
      const item = match[1];
      results.push({
        blNo: this.extractXmlValue(item, 'blNo') || '',
        cargMtNo: this.extractXmlValue(item, 'cargMtNo') || '',
        prgsStts: this.extractXmlValue(item, 'prgsStts') || '',
        prcsDttm: this.extractXmlValue(item, 'prcsDttm') || '',
        shpmNm: this.extractXmlValue(item, 'shpmNm') || '',
        loadPortNm: this.extractXmlValue(item, 'loadPortNm') || '',
        dsprPortNm: this.extractXmlValue(item, 'dsprPortNm') || '',
        etprDt: this.extractXmlValue(item, 'etprDt') || '',
        csclPrgsStts: this.extractXmlValue(item, 'csclPrgsStts') || '',
      });
    }

    return results;
  }

  private extractXmlValue(xml: string, tagName: string): string | undefined {
    const regex = new RegExp(`<${tagName}>([^<]*)</${tagName}>`);
    const match = xml.match(regex);
    return match ? match[1].trim() : undefined;
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let unipassClient: UnipassClient | null = null;

export function getUnipassClient(): UnipassClient {
  if (!unipassClient) {
    unipassClient = new UnipassClient();
  }
  return unipassClient;
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * HS 코드 → CPV 코드 매핑 (EU 입찰용)
 */
export function hsCodeToCPV(hsCode: string): string[] {
  const mappings: Record<string, string[]> = {
    '9026.10': ['38421100', '38421110'], // 유량계
    '9026.20': ['38424000'],              // 압력계
    '9028.10': ['38551000'],              // 가스미터
    '9028.20': ['38411000', '38421000'],  // 수도미터
    '9028.30': ['31682000'],              // 전기미터
    '9032.89': ['38500000'],              // 제어기기
  };

  const prefix = hsCode.substring(0, 7);
  return mappings[prefix] || [];
}

/**
 * HS 코드 → NAICS 코드 매핑 (미국 입찰용)
 */
export function hsCodeToNAICS(hsCode: string): string[] {
  const mappings: Record<string, string[]> = {
    '9026': ['334514', '334519'],  // 측정기기
    '9028': ['334514', '334516'],  // 미터/계량기
    '9032': ['334513', '334519'],  // 제어기기
  };

  const prefix = hsCode.substring(0, 4);
  return mappings[prefix] || [];
}
