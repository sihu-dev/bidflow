/**
 * @module clients/nts-api
 * @description 국세청 사업자등록정보 진위확인 및 상태조회 API 클라이언트
 * @see https://www.data.go.kr/data/15081808/openapi.do
 */

// ============================================================================
// 타입 정의
// ============================================================================

export interface BusinessVerification {
  isValid: boolean;
  businessNo: string;
  validMessage?: string;
}

export interface BusinessStatus {
  businessNo: string;
  status: 'active' | 'suspended' | 'closed' | 'unknown';
  statusCode: string;
  taxType: string;           // 과세유형 (01: 일반, 02: 간이, 03: 면세)
  taxTypeName: string;       // 과세유형명
  closedDate?: string;       // 폐업일자
  detailMessage?: string;
}

interface NTSVerifyRequest {
  businesses: {
    b_no: string;            // 사업자등록번호
    start_dt: string;        // 개업일자 (YYYYMMDD)
    p_nm: string;            // 대표자명
    p_nm2?: string;          // 대표자명2
    b_nm?: string;           // 상호
    corp_no?: string;        // 법인등록번호
    b_sector?: string;       // 업태
    b_type?: string;         // 종목
  }[];
}

interface NTSVerifyResponse {
  request_cnt: number;
  valid_cnt: number;
  status_code: string;
  data: {
    b_no: string;
    valid: string;
    valid_msg?: string;
  }[];
}

interface NTSStatusResponse {
  request_cnt: number;
  status_code: string;
  data: {
    b_no: string;
    b_stt: string;           // 상태코드 (01: 계속, 02: 휴업, 03: 폐업)
    b_stt_cd: string;
    tax_type: string;
    tax_type_cd: string;
    end_dt?: string;
    utcc_yn?: string;
    tax_type_change_dt?: string;
    invoice_apply_dt?: string;
  }[];
}

// ============================================================================
// 국세청 API 클라이언트
// ============================================================================

export class NTSClient {
  private baseUrl = 'https://api.odcloud.kr/api/nts-businessman/v1';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NTS_API_KEY || process.env.DATA_GO_KR_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[국세청API] API 키가 설정되지 않았습니다.');
    }
  }

  /**
   * 사업자등록정보 진위확인
   */
  async verifyBusiness(
    businessNo: string,
    startDate: string,
    ownerName: string,
    options?: {
      businessName?: string;
      corpNo?: string;
    }
  ): Promise<BusinessVerification> {
    const cleanedNo = this.cleanBusinessNo(businessNo);

    const body: NTSVerifyRequest = {
      businesses: [{
        b_no: cleanedNo,
        start_dt: startDate.replace(/-/g, ''),
        p_nm: ownerName,
        ...(options?.businessName ? { b_nm: options.businessName } : {}),
        ...(options?.corpNo ? { corp_no: options.corpNo } : {}),
      }],
    };

    const response = await fetch(`${this.baseUrl}/validate?serviceKey=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`국세청 API 오류 (${response.status})`);
    }

    const data: NTSVerifyResponse = await response.json();

    if (data.data.length === 0) {
      return {
        isValid: false,
        businessNo: cleanedNo,
        validMessage: '조회 결과 없음',
      };
    }

    const result = data.data[0];
    return {
      isValid: result.valid === '01',
      businessNo: result.b_no,
      validMessage: result.valid_msg,
    };
  }

  /**
   * 사업자등록 상태조회
   */
  async getBusinessStatus(businessNo: string | string[]): Promise<BusinessStatus[]> {
    const businessNos = Array.isArray(businessNo) ? businessNo : [businessNo];
    const cleanedNos = businessNos.map(no => this.cleanBusinessNo(no));

    const body = {
      b_no: cleanedNos,
    };

    const response = await fetch(`${this.baseUrl}/status?serviceKey=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`국세청 API 오류 (${response.status})`);
    }

    const data: NTSStatusResponse = await response.json();

    return data.data.map(item => ({
      businessNo: item.b_no,
      status: this.mapStatus(item.b_stt_cd),
      statusCode: item.b_stt_cd,
      taxType: item.tax_type_cd,
      taxTypeName: item.tax_type,
      closedDate: item.end_dt,
      detailMessage: item.b_stt,
    }));
  }

  /**
   * 여러 사업자 일괄 조회
   */
  async batchCheckStatus(businessNos: string[]): Promise<Map<string, BusinessStatus>> {
    // 한 번에 최대 100건 제한
    const batches: string[][] = [];
    for (let i = 0; i < businessNos.length; i += 100) {
      batches.push(businessNos.slice(i, i + 100));
    }

    const results = new Map<string, BusinessStatus>();

    for (const batch of batches) {
      const statuses = await this.getBusinessStatus(batch);
      for (const status of statuses) {
        results.set(status.businessNo, status);
      }
    }

    return results;
  }

  /**
   * 사업자번호 유효성 검사 (형식)
   */
  isValidFormat(businessNo: string): boolean {
    const cleaned = this.cleanBusinessNo(businessNo);
    if (!/^\d{10}$/.test(cleaned)) return false;

    // 체크섬 검증
    const checkKeys = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * checkKeys[i];
    }
    sum += Math.floor((parseInt(cleaned[8]) * 5) / 10);

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(cleaned[9]);
  }

  // ============================================================================
  // Private 메서드
  // ============================================================================

  private cleanBusinessNo(businessNo: string): string {
    return businessNo.replace(/[-\s]/g, '');
  }

  private mapStatus(statusCode: string): BusinessStatus['status'] {
    switch (statusCode) {
      case '01': return 'active';
      case '02': return 'suspended';
      case '03': return 'closed';
      default: return 'unknown';
    }
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let ntsClient: NTSClient | null = null;

export function getNTSClient(): NTSClient {
  if (!ntsClient) {
    ntsClient = new NTSClient();
  }
  return ntsClient;
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 사업자등록번호 포맷팅 (XXX-XX-XXXXX)
 */
export function formatBusinessNo(businessNo: string): string {
  const cleaned = businessNo.replace(/[-\s]/g, '');
  if (cleaned.length !== 10) return businessNo;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
}

/**
 * 과세유형 코드 → 한글 변환
 */
export function getTaxTypeName(taxTypeCode: string): string {
  const types: Record<string, string> = {
    '01': '일반과세자',
    '02': '간이과세자',
    '03': '면세사업자',
    '04': '비영리법인/국가기관',
    '05': '수익사업을 영위하는 비영리법인',
    '06': '고유번호가 부여된 단체',
    '07': '법인이 아닌 단체',
  };
  return types[taxTypeCode] || '알 수 없음';
}

/**
 * 사업자 상태 검사 (입찰 자격용)
 */
export async function checkBidEligibility(
  businessNo: string
): Promise<{ eligible: boolean; reason?: string }> {
  const client = getNTSClient();

  // 형식 검증
  if (!client.isValidFormat(businessNo)) {
    return { eligible: false, reason: '사업자등록번호 형식이 올바르지 않습니다.' };
  }

  try {
    const [status] = await client.getBusinessStatus(businessNo);

    if (!status) {
      return { eligible: false, reason: '사업자 정보를 조회할 수 없습니다.' };
    }

    if (status.status === 'closed') {
      return { eligible: false, reason: `폐업 사업자입니다. (폐업일: ${status.closedDate})` };
    }

    if (status.status === 'suspended') {
      return { eligible: false, reason: '휴업 중인 사업자입니다.' };
    }

    return { eligible: true };
  } catch (error) {
    console.error('[NTS] 사업자 조회 실패:', error);
    return { eligible: false, reason: '사업자 조회 중 오류가 발생했습니다.' };
  }
}
