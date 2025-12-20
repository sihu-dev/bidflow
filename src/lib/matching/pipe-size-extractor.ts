/**
 * 파이프 규격 추출기
 * 공고 텍스트에서 DN/구경/관경 정보를 정규화하여 추출
 */

export interface PipeSizeResult {
  /** 추출된 DN 값 (단일) */
  dn: number | null;
  /** DN 범위 (복수 규격) */
  dnMin: number | null;
  dnMax: number | null;
  /** 추출된 모든 DN 값 */
  allDns: number[];
  /** 원본 매칭 텍스트 */
  matchedTexts: string[];
  /** 추출 신뢰도 */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * 파이프 규격 추출 패턴
 * 우선순위 순서로 정렬됨
 */
const PIPE_SIZE_PATTERNS = [
  // DN 표기 (가장 명확)
  // DN300, DN 300, DN-300
  {
    pattern: /DN\s*[-]?\s*(\d{2,4})/gi,
    type: 'DN',
    confidence: 'high' as const,
  },

  // 호칭경/호칭구경
  // 호칭경 300, 호칭구경300mm
  {
    pattern: /호칭(?:구)?경\s*[:=]?\s*(\d{2,4})\s*(?:mm|㎜)?/gi,
    type: 'nominal',
    confidence: 'high' as const,
  },

  // 구경/관경 표기
  // 구경 300mm, 관경300A
  {
    pattern: /(?:구경|관경)\s*[:=]?\s*(\d{2,4})\s*(?:mm|㎜|A)?/gi,
    type: 'diameter',
    confidence: 'high' as const,
  },

  // A 표기 (한국 배관 규격)
  // 300A, 500A
  {
    pattern: /(\d{2,4})\s*A(?:\s|,|$)/g,
    type: 'A-spec',
    confidence: 'medium' as const,
  },

  // Ø (파이) 표기
  // Ø300, Φ500, ∅800
  {
    pattern: /[ØΦ∅]\s*(\d{2,4})/gi,
    type: 'phi',
    confidence: 'medium' as const,
  },

  // mm 표기 (컨텍스트 필요)
  // 직경 300mm, 내경 500mm
  {
    pattern: /(?:직경|내경|외경|관로)\s*[:=]?\s*(\d{2,4})\s*(?:mm|㎜)/gi,
    type: 'mm-context',
    confidence: 'medium' as const,
  },

  // 범위 표기
  // DN300~1000, 300-1000mm, 300~500A
  {
    pattern: /(?:DN)?\s*(\d{2,4})\s*[~\-—–]\s*(\d{2,4})\s*(?:mm|㎜|A)?/gi,
    type: 'range',
    confidence: 'high' as const,
    isRange: true,
  },

  // 복수 규격 나열
  // DN300, DN500, DN800
  {
    pattern: /DN\s*(\d{2,4})(?:\s*[,·]\s*DN\s*(\d{2,4}))+/gi,
    type: 'multiple',
    confidence: 'high' as const,
    isMultiple: true,
  },
];

/**
 * 유효한 DN 값인지 검증
 * 표준 파이프 규격 범위: DN15 ~ DN4000
 */
function isValidDN(dn: number): boolean {
  // 일반적인 파이프 규격 범위
  if (dn < 15 || dn > 4000) return false;

  // 표준 DN 값 목록 (일부)
  const standardDNs = [
    15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300,
    350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1200,
    1350, 1400, 1500, 1600, 1800, 2000, 2200, 2400, 2600, 2800,
    3000, 3200, 3400, 3600, 3800, 4000,
  ];

  // 정확히 표준 값이면 high confidence
  // 근사치면 medium confidence로 처리
  return standardDNs.includes(dn) || (dn % 50 === 0) || (dn % 100 === 0);
}

/**
 * 공고 텍스트에서 파이프 규격 추출
 */
export function extractPipeSize(text: string): PipeSizeResult {
  const result: PipeSizeResult = {
    dn: null,
    dnMin: null,
    dnMax: null,
    allDns: [],
    matchedTexts: [],
    confidence: 'low',
  };

  if (!text || typeof text !== 'string') {
    return result;
  }

  const foundDns: number[] = [];
  const matchedTexts: string[] = [];
  let highestConfidence: 'high' | 'medium' | 'low' = 'low';

  for (const { pattern, confidence, isRange, isMultiple } of PIPE_SIZE_PATTERNS) {
    // 패턴 복사하여 사용 (lastIndex 초기화)
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      matchedTexts.push(match[0]);

      if (isRange && match[1] && match[2]) {
        // 범위 추출
        const min = parseInt(match[1], 10);
        const max = parseInt(match[2], 10);

        if (isValidDN(min) && isValidDN(max)) {
          result.dnMin = Math.min(min, max);
          result.dnMax = Math.max(min, max);
          foundDns.push(result.dnMin, result.dnMax);

          if (confidence === 'high') highestConfidence = 'high';
          else if (confidence === 'medium' && highestConfidence !== 'high') {
            highestConfidence = 'medium';
          }
        }
      } else if (isMultiple) {
        // 복수 규격 추출
        const allMatches = match[0].match(/\d{2,4}/g);
        if (allMatches) {
          for (const m of allMatches) {
            const dn = parseInt(m, 10);
            if (isValidDN(dn) && !foundDns.includes(dn)) {
              foundDns.push(dn);
            }
          }
          if (confidence === 'high') highestConfidence = 'high';
        }
      } else {
        // 단일 값 추출
        const dn = parseInt(match[1], 10);
        if (isValidDN(dn) && !foundDns.includes(dn)) {
          foundDns.push(dn);

          if (confidence === 'high') highestConfidence = 'high';
          else if (confidence === 'medium' && highestConfidence !== 'high') {
            highestConfidence = 'medium';
          }
        }
      }
    }
  }

  // 결과 정리
  result.allDns = foundDns.sort((a, b) => a - b);
  result.matchedTexts = Array.from(new Set(matchedTexts));
  result.confidence = foundDns.length > 0 ? highestConfidence : 'low';

  // 대표 DN 값 결정
  if (foundDns.length === 1) {
    result.dn = foundDns[0];
  } else if (foundDns.length > 1) {
    // 범위가 이미 설정되지 않았으면 min/max 계산
    if (result.dnMin === null) {
      result.dnMin = Math.min(...foundDns);
      result.dnMax = Math.max(...foundDns);
    }
    // 대표값은 가장 큰 값 (보통 주요 규격)
    result.dn = result.dnMax;
  }

  return result;
}

/**
 * 제품의 파이프 규격 범위와 공고 규격이 매칭되는지 확인
 */
export function matchPipeSize(
  extracted: PipeSizeResult,
  productRange: { min: number; max: number } | null
): {
  isMatch: boolean;
  matchScore: number;
  reason: string;
} {
  // 제품에 파이프 규격 조건이 없는 경우 (개수로 유량계 등)
  if (productRange === null) {
    return {
      isMatch: true,
      matchScore: 10, // 낮은 점수 (규격 무관)
      reason: '규격 조건 없음',
    };
  }

  // 공고에서 규격 추출 실패
  if (extracted.allDns.length === 0) {
    return {
      isMatch: false,
      matchScore: 0,
      reason: '규격 정보 없음',
    };
  }

  const { min, max } = productRange;

  // 단일 규격 매칭
  if (extracted.dn !== null) {
    const dn = extracted.dn;
    if (dn >= min && dn <= max) {
      // 정확히 범위 내
      const score = extracted.confidence === 'high' ? 25 : 15;
      return {
        isMatch: true,
        matchScore: score,
        reason: `DN${dn} (${min}~${max}mm 범위 내)`,
      };
    } else {
      return {
        isMatch: false,
        matchScore: 0,
        reason: `DN${dn} (범위 ${min}~${max}mm 벗어남)`,
      };
    }
  }

  // 범위 규격 매칭
  if (extracted.dnMin !== null && extracted.dnMax !== null) {
    const hasOverlap =
      extracted.dnMin <= max && extracted.dnMax >= min;

    if (hasOverlap) {
      const overlapMin = Math.max(extracted.dnMin, min);
      const overlapMax = Math.min(extracted.dnMax, max);
      const score = extracted.confidence === 'high' ? 25 : 15;

      return {
        isMatch: true,
        matchScore: score,
        reason: `DN${overlapMin}~${overlapMax} 범위 일치`,
      };
    } else {
      return {
        isMatch: false,
        matchScore: 0,
        reason: `DN${extracted.dnMin}~${extracted.dnMax} (범위 불일치)`,
      };
    }
  }

  return {
    isMatch: false,
    matchScore: 0,
    reason: '규격 매칭 실패',
  };
}

/**
 * 테스트용 예시
 */
export const PIPE_SIZE_EXAMPLES = [
  { input: 'DN300 초음파유량계', expected: { dn: 300 } },
  { input: '구경 500mm 전자유량계', expected: { dn: 500 } },
  { input: '300A 배관용', expected: { dn: 300 } },
  { input: 'Ø800 대구경', expected: { dn: 800 } },
  { input: 'DN300~1000 범위', expected: { dnMin: 300, dnMax: 1000 } },
  { input: '호칭경 150mm', expected: { dn: 150 } },
  { input: 'DN100, DN200, DN300 납품', expected: { allDns: [100, 200, 300] } },
];
