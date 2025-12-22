/**
 * @module clients/deepl-api
 * @description DeepL 번역 API 클라이언트
 * @see https://www.deepl.com/docs-api
 */

// ============================================================================
// 타입 정의
// ============================================================================

export type DeepLSourceLang = 'EN' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL' | 'PL' | 'PT' | 'RU' | 'JA' | 'ZH' | 'KO';
export type DeepLTargetLang = 'EN-US' | 'EN-GB' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL' | 'PL' | 'PT-BR' | 'PT-PT' | 'RU' | 'JA' | 'ZH' | 'KO';

export interface TranslationResult {
  text: string;
  detectedSourceLang: string;
}

export interface TranslationRequest {
  text: string | string[];
  targetLang: DeepLTargetLang;
  sourceLang?: DeepLSourceLang;
  formality?: 'default' | 'more' | 'less' | 'prefer_more' | 'prefer_less';
  preserveFormatting?: boolean;
  tagHandling?: 'xml' | 'html';
  glossaryId?: string;
}

interface DeepLResponse {
  translations: {
    detected_source_language: string;
    text: string;
  }[];
}

interface UsageResponse {
  character_count: number;
  character_limit: number;
}

// ============================================================================
// DeepL API 클라이언트
// ============================================================================

export class DeepLClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPL_API_KEY || '';

    // Free API vs Pro API URL 결정
    if (this.apiKey.endsWith(':fx')) {
      this.baseUrl = 'https://api-free.deepl.com/v2';
    } else {
      this.baseUrl = 'https://api.deepl.com/v2';
    }

    if (!this.apiKey) {
      console.warn('[DeepL] API 키가 설정되지 않았습니다.');
    }
  }

  /**
   * 텍스트 번역
   */
  async translate(request: TranslationRequest): Promise<TranslationResult[]> {
    const texts = Array.isArray(request.text) ? request.text : [request.text];

    const body = new URLSearchParams();
    texts.forEach(t => body.append('text', t));
    body.append('target_lang', request.targetLang);

    if (request.sourceLang) {
      body.append('source_lang', request.sourceLang);
    }
    if (request.formality && request.formality !== 'default') {
      body.append('formality', request.formality);
    }
    if (request.preserveFormatting) {
      body.append('preserve_formatting', '1');
    }
    if (request.tagHandling) {
      body.append('tag_handling', request.tagHandling);
    }
    if (request.glossaryId) {
      body.append('glossary_id', request.glossaryId);
    }

    const response = await fetch(`${this.baseUrl}/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepL API 오류 (${response.status}): ${errorText}`);
    }

    const data: DeepLResponse = await response.json();

    return data.translations.map(t => ({
      text: t.text,
      detectedSourceLang: t.detected_source_language,
    }));
  }

  /**
   * 단일 텍스트 번역 (편의 메서드)
   */
  async translateText(
    text: string,
    targetLang: DeepLTargetLang,
    sourceLang?: DeepLSourceLang
  ): Promise<string> {
    const results = await this.translate({ text, targetLang, sourceLang });
    return results[0]?.text || '';
  }

  /**
   * 한국어 → 영어 번역
   */
  async translateToEnglish(text: string): Promise<string> {
    return this.translateText(text, 'EN-US', 'KO');
  }

  /**
   * 영어 → 한국어 번역
   */
  async translateToKorean(text: string): Promise<string> {
    return this.translateText(text, 'KO', 'EN');
  }

  /**
   * 입찰 공고 번역 (비즈니스 문서용)
   */
  async translateBidNotice(
    text: string,
    targetLang: DeepLTargetLang = 'KO'
  ): Promise<string> {
    const results = await this.translate({
      text,
      targetLang,
      formality: 'prefer_more', // 비즈니스 문서는 격식체
      preserveFormatting: true,
    });
    return results[0]?.text || '';
  }

  /**
   * 사용량 조회
   */
  async getUsage(): Promise<{ used: number; limit: number; remaining: number }> {
    const response = await fetch(`${this.baseUrl}/usage`, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`DeepL API 오류 (${response.status})`);
    }

    const data: UsageResponse = await response.json();

    return {
      used: data.character_count,
      limit: data.character_limit,
      remaining: data.character_limit - data.character_count,
    };
  }

  /**
   * 지원 언어 목록 조회
   */
  async getSupportedLanguages(type: 'source' | 'target' = 'target'): Promise<{ code: string; name: string }[]> {
    const response = await fetch(`${this.baseUrl}/languages?type=${type}`, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`DeepL API 오류 (${response.status})`);
    }

    return response.json();
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let deepLClient: DeepLClient | null = null;

export function getDeepLClient(): DeepLClient {
  if (!deepLClient) {
    deepLClient = new DeepLClient();
  }
  return deepLClient;
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 입찰 관련 전문 용어 번역 후처리
 */
export function postProcessBidTranslation(text: string): string {
  const termMappings: Record<string, string> = {
    'tender': '입찰',
    'bid': '투찰',
    'procurement': '조달',
    'contractor': '계약자',
    'solicitation': '입찰공고',
    'RFP': '제안요청서',
    'RFQ': '견적요청서',
    'ITB': '입찰초청서',
    'deadline': '마감일',
    'award': '낙찰',
    'specifications': '규격서',
    'flow meter': '유량계',
    'water meter': '수도미터',
    'ultrasonic': '초음파',
    'electromagnetic': '전자기',
  };

  let result = text;
  // 필요시 후처리 로직 추가
  return result;
}

/**
 * 언어 코드 감지 (간단한 휴리스틱)
 */
export function detectLanguage(text: string): DeepLSourceLang | null {
  // 한글 포함
  if (/[\uAC00-\uD7AF]/.test(text)) return 'KO';
  // 일본어 포함
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'JA';
  // 중국어 포함
  if (/[\u4E00-\u9FFF]/.test(text)) return 'ZH';
  // 러시아어/키릴 문자
  if (/[\u0400-\u04FF]/.test(text)) return 'RU';
  // 기본 영어
  return 'EN';
}
