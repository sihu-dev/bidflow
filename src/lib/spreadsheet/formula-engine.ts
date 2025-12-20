/**
 * @module FormulaEngine
 * @description HyperFormula 기반 수식 엔진 설정
 *
 * Excel 호환 수식 지원:
 * - 수학: SUM, AVERAGE, MIN, MAX, COUNT, ROUND
 * - 텍스트: CONCATENATE, LEFT, RIGHT, MID, LEN, TRIM
 * - 논리: IF, AND, OR, NOT
 * - 참조: VLOOKUP, HLOOKUP, INDEX, MATCH
 * - 날짜: TODAY, NOW, DATE, YEAR, MONTH, DAY
 */

import { HyperFormula } from 'hyperformula';
import type { ConfigParams, RawCellContent } from 'hyperformula';

// HyperFormula 설정
// Note: functionArgSeparator와 thousandSeparator가 같으면 충돌 발생
// 한국어 환경에서는 세미콜론을 함수 인자 구분자로 사용
export const hyperFormulaConfig: Partial<ConfigParams> = {
  licenseKey: 'gpl-v3', // 오픈소스 라이선스

  // 수식 계산 설정
  useColumnIndex: true,
  useStats: false,
  evaluateNullToZero: true,
  precisionRounding: 10,

  // 날짜 형식 (한국)
  dateFormats: ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD/MM/YYYY'],
  timeFormats: ['HH:MM:SS', 'HH:MM'],

  // 천단위 구분자 (한국)
  thousandSeparator: ' ', // 공백 사용 (쉼표와 충돌 방지)
  decimalSeparator: '.',

  // 함수 인자 구분자 (쉼표 사용)
  functionArgSeparator: ',',

  // 배열 수식 지원
  arrayColumnSeparator: ';', // 쉼표와 다르게 설정
  arrayRowSeparator: '|',

  // 최대 행/열
  maxRows: 100000,
  maxColumns: 1000,
};

/**
 * HyperFormula 인스턴스 생성
 */
export function createFormulaEngine(data?: RawCellContent[][]): HyperFormula {
  const hf = HyperFormula.buildFromArray(data || [[]], hyperFormulaConfig);
  return hf;
}

/**
 * 수식 유효성 검사
 */
export function validateFormula(formula: string): { valid: boolean; error?: string } {
  if (!formula.startsWith('=')) {
    return { valid: true }; // 일반 값
  }

  try {
    const hf = HyperFormula.buildEmpty(hyperFormulaConfig);
    hf.addSheet('Test');
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, formula);

    const value = hf.getCellValue({ sheet: 0, row: 0, col: 0 });
    hf.destroy();

    if (typeof value === 'object' && value !== null && 'type' in value) {
      return { valid: false, error: String(value.type) };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}

/**
 * 지원하는 수식 함수 목록
 */
export const SUPPORTED_FUNCTIONS = {
  math: ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'COUNTA', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'ABS', 'POWER', 'SQRT', 'MOD'],
  text: ['CONCATENATE', 'LEFT', 'RIGHT', 'MID', 'LEN', 'TRIM', 'UPPER', 'LOWER', 'PROPER', 'SUBSTITUTE', 'REPLACE', 'TEXT'],
  logic: ['IF', 'AND', 'OR', 'NOT', 'IFERROR', 'IFNA', 'IFS', 'SWITCH'],
  lookup: ['VLOOKUP', 'HLOOKUP', 'INDEX', 'MATCH', 'OFFSET'],
  date: ['TODAY', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'DATEDIF', 'EDATE', 'EOMONTH'],
  statistical: ['COUNTIF', 'COUNTIFS', 'SUMIF', 'SUMIFS', 'AVERAGEIF', 'AVERAGEIFS', 'MAXIFS', 'MINIFS'],
};

/**
 * AI 수식 함수 (BIDFLOW 커스텀)
 * 실제 실행은 API를 통해 비동기로 처리됨
 */
export const AI_FUNCTIONS = [
  { name: 'AI_SUMMARY', description: '공고 요약 생성', example: '=AI_SUMMARY()' },
  { name: 'AI_SCORE', description: '낙찰 확률 예측', example: '=AI_SCORE()' },
  { name: 'AI_EXTRACT', description: '정보 추출', example: '=AI_EXTRACT("납품기한")' },
  { name: 'AI_TRANSLATE', description: '번역', example: '=AI_TRANSLATE("en")' },
  { name: 'AI_PROPOSAL', description: '제안서 초안 생성', example: '=AI_PROPOSAL()' },
];

/**
 * 수식이 AI 함수인지 확인
 */
export function isAIFormula(formula: string): boolean {
  if (!formula.startsWith('=')) return false;
  const upperFormula = formula.toUpperCase();
  return AI_FUNCTIONS.some(fn => upperFormula.includes(fn.name));
}

/**
 * AI 수식에서 함수명과 인자 추출
 */
export function parseAIFormula(formula: string): { name: string; args: string[] } | null {
  if (!formula.startsWith('=')) return null;

  const match = formula.match(/^=(\w+)\((.*)\)$/);
  if (!match) return null;

  const [, name, argsStr] = match;
  const args = argsStr
    .split(',')
    .map(arg => arg.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);

  return { name: name.toUpperCase(), args };
}

const formulaEngine = {
  createFormulaEngine,
  validateFormula,
  isAIFormula,
  parseAIFormula,
  SUPPORTED_FUNCTIONS,
  AI_FUNCTIONS,
  hyperFormulaConfig,
};

export default formulaEngine;
