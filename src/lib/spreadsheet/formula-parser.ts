/**
 * @module spreadsheet/formula-parser
 * @description AI 수식 파서 및 실행기
 */

import { z } from 'zod';

// ============================================================================
// 타입 정의
// ============================================================================

export const FormulaSchema = z.object({
  fn: z.string(),
  args: z.array(z.string()),
});

export type Formula = z.infer<typeof FormulaSchema>;

export interface FormulaContext {
  bidId?: string;
  sheetId?: string;
  row?: number;
  col?: number;
  cellData?: Record<string, unknown>;
}

export interface FormulaResult {
  success: boolean;
  value?: string;
  error?: string;
  isAsync?: boolean;
}

// ============================================================================
// 지원 함수 목록
// ============================================================================

export const SUPPORTED_FUNCTIONS = {
  AI: {
    description: '자유 프롬프트 AI 호출',
    example: '=AI("이 공고를 요약해줘")',
    minArgs: 1,
    maxArgs: 1,
  },
  AI_SUMMARY: {
    description: '입찰 공고 요약',
    example: '=AI_SUMMARY()',
    minArgs: 0,
    maxArgs: 1,
  },
  AI_SCORE: {
    description: '낙찰 확률 예측',
    example: '=AI_SCORE()',
    minArgs: 0,
    maxArgs: 0,
  },
  AI_MATCH: {
    description: '제품 매칭 분석',
    example: '=AI_MATCH()',
    minArgs: 0,
    maxArgs: 0,
  },
  AI_KEYWORDS: {
    description: '키워드 추출',
    example: '=AI_KEYWORDS()',
    minArgs: 0,
    maxArgs: 0,
  },
  AI_DEADLINE: {
    description: '마감일 D-Day 분석',
    example: '=AI_DEADLINE()',
    minArgs: 0,
    maxArgs: 0,
  },
} as const;

export type SupportedFunction = keyof typeof SUPPORTED_FUNCTIONS;

// ============================================================================
// 파서 구현
// ============================================================================

/**
 * 수식 문자열을 파싱하여 함수명과 인자 추출
 */
export function parseFormula(formula: string): Formula | null {
  // = 로 시작하지 않으면 수식이 아님
  if (!formula.startsWith('=')) {
    return null;
  }

  // 함수 패턴 매칭: =FUNCTION_NAME(args)
  const match = formula.match(/^=([A-Z_][A-Z0-9_]*)\((.*)\)$/i);
  if (!match) {
    return null;
  }

  const fn = match[1].toUpperCase();
  const argsStr = match[2].trim();

  // 인자가 없는 경우
  if (!argsStr) {
    return { fn, args: [] };
  }

  // 인자 파싱 (따옴표, 쉼표 처리)
  const args = parseArgs(argsStr);

  return { fn, args };
}

/**
 * 인자 문자열 파싱 (따옴표 및 중첩 처리)
 */
function parseArgs(str: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let depth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === '(' && !inQuotes) {
      depth++;
      current += char;
    } else if (char === ')' && !inQuotes) {
      depth--;
      current += char;
    } else if (char === ',' && !inQuotes && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  // 따옴표 제거
  return args.map((arg) => arg.replace(/^["']|["']$/g, ''));
}

/**
 * 수식이 유효한 AI 함수인지 확인
 */
export function isValidAIFormula(formula: string): boolean {
  const parsed = parseFormula(formula);
  if (!parsed) return false;

  return parsed.fn in SUPPORTED_FUNCTIONS;
}

/**
 * 수식 유효성 검증
 */
export function validateFormula(formula: string): { valid: boolean; error?: string } {
  const parsed = parseFormula(formula);

  if (!parsed) {
    return { valid: false, error: '유효한 수식 형식이 아닙니다. =FUNCTION(args) 형식을 사용하세요.' };
  }

  const fnConfig = SUPPORTED_FUNCTIONS[parsed.fn as SupportedFunction];
  if (!fnConfig) {
    const supported = Object.keys(SUPPORTED_FUNCTIONS).join(', ');
    return { valid: false, error: `지원하지 않는 함수입니다. 지원 함수: ${supported}` };
  }

  if (parsed.args.length < fnConfig.minArgs) {
    return { valid: false, error: `${parsed.fn} 함수는 최소 ${fnConfig.minArgs}개의 인자가 필요합니다.` };
  }

  if (parsed.args.length > fnConfig.maxArgs) {
    return { valid: false, error: `${parsed.fn} 함수는 최대 ${fnConfig.maxArgs}개의 인자만 허용합니다.` };
  }

  return { valid: true };
}

// ============================================================================
// 수식 실행 (클라이언트용)
// ============================================================================

/**
 * AI 수식을 서버에 전송하여 실행
 */
export async function executeFormula(formula: string, context: FormulaContext): Promise<FormulaResult> {
  const validation = validateFormula(formula);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const response = await fetch('/api/v1/ai/formula', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formula, context }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'AI 호출 실패' };
    }

    const data = await response.json();
    return { success: true, value: data.result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'AI 호출 중 오류 발생' };
  }
}

// ============================================================================
// 수식 자동완성
// ============================================================================

export interface AutocompleteItem {
  label: string;
  insertText: string;
  description: string;
}

/**
 * 수식 자동완성 제안
 */
export function getAutocompleteSuggestions(input: string): AutocompleteItem[] {
  if (!input.startsWith('=')) {
    return [];
  }

  const prefix = input.slice(1).toUpperCase();

  return Object.entries(SUPPORTED_FUNCTIONS)
    .filter(([fn]) => fn.startsWith(prefix))
    .map(([fn, config]) => ({
      label: fn,
      insertText: config.example,
      description: config.description,
    }));
}
