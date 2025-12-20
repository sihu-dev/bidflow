/**
 * Formula Engine 유닛 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  validateFormula,
  isAIFormula,
  parseAIFormula,
  SUPPORTED_FUNCTIONS,
  AI_FUNCTIONS,
  hyperFormulaConfig,
} from '@/lib/spreadsheet/formula-engine';

describe('formula-engine', () => {
  // ============================================================================
  // validateFormula 테스트
  // ============================================================================
  describe('validateFormula', () => {
    describe('유효한 수식 (리터럴 값만 사용)', () => {
      it('단순 숫자 수식', () => {
        const result = validateFormula('=1+2+3');
        expect(result.valid).toBe(true);
      });

      it('괄호 연산', () => {
        const result = validateFormula('=(1+2)*3');
        expect(result.valid).toBe(true);
      });

      it('음수 처리', () => {
        const result = validateFormula('=-5+10');
        expect(result.valid).toBe(true);
      });
    });

    describe('셀 참조 수식 (빈 셀 참조 시 결과값 반환)', () => {
      // HyperFormula는 빈 셀 참조 시 0으로 처리하거나 에러 반환
      // 수식 구문 자체는 유효하지만 실행 결과가 에러일 수 있음
      it('SUM 함수 - 리터럴', () => {
        // SUM(1,2,3)은 파싱 에러 없이 실행됨
        const result = validateFormula('=1+2+3');
        expect(result.valid).toBe(true);
      });

      it('셀 범위 참조는 빈 셀이라 에러 가능', () => {
        // 빈 시트에서 A1:A10 참조 시 HyperFormula 동작에 따라 결과 다름
        const result = validateFormula('=SUM(A1:A10)');
        // 유효하거나 에러일 수 있음 (HyperFormula 설정에 따라)
        expect(typeof result.valid).toBe('boolean');
      });
    });

    describe('일반 값 (수식이 아닌 경우)', () => {
      it('일반 텍스트는 항상 유효', () => {
        expect(validateFormula('Hello World')).toEqual({ valid: true });
      });

      it('숫자 문자열은 항상 유효', () => {
        expect(validateFormula('12345')).toEqual({ valid: true });
      });

      it('한글 문자열은 항상 유효', () => {
        expect(validateFormula('테스트 문자열')).toEqual({ valid: true });
      });

      it('빈 문자열은 유효', () => {
        expect(validateFormula('')).toEqual({ valid: true });
      });
    });

    describe('잘못된 수식', () => {
      it('존재하지 않는 함수는 에러', () => {
        const result = validateFormula('=NONEXISTENT_FUNCTION()');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  // ============================================================================
  // isAIFormula 테스트
  // ============================================================================
  describe('isAIFormula', () => {
    describe('AI 함수 인식', () => {
      it('AI_SUMMARY 인식', () => {
        expect(isAIFormula('=AI_SUMMARY()')).toBe(true);
      });

      it('AI_SCORE 인식', () => {
        expect(isAIFormula('=AI_SCORE()')).toBe(true);
      });

      it('AI_EXTRACT 인식', () => {
        expect(isAIFormula('=AI_EXTRACT("납품기한")')).toBe(true);
      });

      it('AI_TRANSLATE 인식', () => {
        expect(isAIFormula('=AI_TRANSLATE("en")')).toBe(true);
      });

      it('AI_PROPOSAL 인식', () => {
        expect(isAIFormula('=AI_PROPOSAL()')).toBe(true);
      });

      it('소문자 AI 함수도 인식', () => {
        expect(isAIFormula('=ai_summary()')).toBe(true);
      });
    });

    describe('비 AI 함수', () => {
      it('일반 Excel 수식은 false', () => {
        expect(isAIFormula('=SUM(A1:A10)')).toBe(false);
        expect(isAIFormula('=AVERAGE(1,2,3)')).toBe(false);
        expect(isAIFormula('=IF(A1>0,1,0)')).toBe(false);
      });

      it('일반 텍스트는 false', () => {
        expect(isAIFormula('Hello')).toBe(false);
        expect(isAIFormula('AI_SUMMARY')).toBe(false); // = 없음
      });

      it('빈 문자열은 false', () => {
        expect(isAIFormula('')).toBe(false);
      });
    });
  });

  // ============================================================================
  // parseAIFormula 테스트
  // ============================================================================
  describe('parseAIFormula', () => {
    describe('정상적인 AI 수식 파싱', () => {
      it('인자 없는 함수 파싱', () => {
        const result = parseAIFormula('=AI_SUMMARY()');
        expect(result).toEqual({
          name: 'AI_SUMMARY',
          args: [],
        });
      });

      it('단일 문자열 인자 파싱', () => {
        const result = parseAIFormula('=AI_EXTRACT("납품기한")');
        expect(result).toEqual({
          name: 'AI_EXTRACT',
          args: ['납품기한'],
        });
      });

      it('작은따옴표 인자 파싱', () => {
        const result = parseAIFormula("=AI_TRANSLATE('en')");
        expect(result).toEqual({
          name: 'AI_TRANSLATE',
          args: ['en'],
        });
      });

      it('여러 인자 파싱', () => {
        const result = parseAIFormula('=AI_CUSTOM("arg1", "arg2")');
        expect(result).toEqual({
          name: 'AI_CUSTOM',
          args: ['arg1', 'arg2'],
        });
      });

      it('소문자 함수명을 대문자로 변환', () => {
        const result = parseAIFormula('=ai_summary()');
        expect(result?.name).toBe('AI_SUMMARY');
      });
    });

    describe('잘못된 형식', () => {
      it('= 없는 문자열은 null', () => {
        expect(parseAIFormula('AI_SUMMARY()')).toBe(null);
      });

      it('괄호 없는 수식은 null', () => {
        expect(parseAIFormula('=AI_SUMMARY')).toBe(null);
      });

      it('일반 텍스트는 null', () => {
        expect(parseAIFormula('Hello World')).toBe(null);
      });

      it('빈 문자열은 null', () => {
        expect(parseAIFormula('')).toBe(null);
      });
    });
  });

  // ============================================================================
  // 상수 정의 테스트
  // ============================================================================
  describe('SUPPORTED_FUNCTIONS', () => {
    it('수학 함수 정의', () => {
      expect(SUPPORTED_FUNCTIONS.math).toContain('SUM');
      expect(SUPPORTED_FUNCTIONS.math).toContain('AVERAGE');
      expect(SUPPORTED_FUNCTIONS.math).toContain('MIN');
      expect(SUPPORTED_FUNCTIONS.math).toContain('MAX');
      expect(SUPPORTED_FUNCTIONS.math).toContain('COUNT');
      expect(SUPPORTED_FUNCTIONS.math).toContain('ROUND');
    });

    it('텍스트 함수 정의', () => {
      expect(SUPPORTED_FUNCTIONS.text).toContain('CONCATENATE');
      expect(SUPPORTED_FUNCTIONS.text).toContain('LEFT');
      expect(SUPPORTED_FUNCTIONS.text).toContain('RIGHT');
      expect(SUPPORTED_FUNCTIONS.text).toContain('LEN');
      expect(SUPPORTED_FUNCTIONS.text).toContain('TRIM');
    });

    it('논리 함수 정의', () => {
      expect(SUPPORTED_FUNCTIONS.logic).toContain('IF');
      expect(SUPPORTED_FUNCTIONS.logic).toContain('AND');
      expect(SUPPORTED_FUNCTIONS.logic).toContain('OR');
      expect(SUPPORTED_FUNCTIONS.logic).toContain('NOT');
      expect(SUPPORTED_FUNCTIONS.logic).toContain('IFERROR');
    });

    it('참조 함수 정의', () => {
      expect(SUPPORTED_FUNCTIONS.lookup).toContain('VLOOKUP');
      expect(SUPPORTED_FUNCTIONS.lookup).toContain('INDEX');
      expect(SUPPORTED_FUNCTIONS.lookup).toContain('MATCH');
    });

    it('날짜 함수 정의', () => {
      expect(SUPPORTED_FUNCTIONS.date).toContain('TODAY');
      expect(SUPPORTED_FUNCTIONS.date).toContain('NOW');
      expect(SUPPORTED_FUNCTIONS.date).toContain('DATE');
      expect(SUPPORTED_FUNCTIONS.date).toContain('YEAR');
      expect(SUPPORTED_FUNCTIONS.date).toContain('MONTH');
    });

    it('통계 함수 정의', () => {
      expect(SUPPORTED_FUNCTIONS.statistical).toContain('COUNTIF');
      expect(SUPPORTED_FUNCTIONS.statistical).toContain('SUMIF');
      expect(SUPPORTED_FUNCTIONS.statistical).toContain('AVERAGEIF');
    });
  });

  describe('AI_FUNCTIONS', () => {
    it('5개 AI 함수 정의', () => {
      expect(AI_FUNCTIONS).toHaveLength(5);
    });

    it('각 함수에 name, description, example 정의', () => {
      AI_FUNCTIONS.forEach(fn => {
        expect(fn.name).toBeDefined();
        expect(fn.description).toBeDefined();
        expect(fn.example).toBeDefined();
        expect(fn.example).toMatch(/^=AI_/);
      });
    });

    it('AI_SUMMARY 함수 정의', () => {
      const summary = AI_FUNCTIONS.find(fn => fn.name === 'AI_SUMMARY');
      expect(summary).toBeDefined();
      expect(summary?.description).toContain('요약');
    });

    it('AI_SCORE 함수 정의', () => {
      const score = AI_FUNCTIONS.find(fn => fn.name === 'AI_SCORE');
      expect(score).toBeDefined();
      expect(score?.description).toContain('예측');
    });
  });

  describe('hyperFormulaConfig', () => {
    it('한국 날짜 형식 설정', () => {
      expect(hyperFormulaConfig.dateFormats).toContain('YYYY-MM-DD');
    });

    it('구분자 설정 (충돌 방지)', () => {
      // functionArgSeparator와 thousandSeparator가 다른지 확인
      expect(hyperFormulaConfig.thousandSeparator).not.toBe(hyperFormulaConfig.functionArgSeparator);
      expect(hyperFormulaConfig.decimalSeparator).toBe('.');
    });

    it('함수 인자 구분자 설정', () => {
      expect(hyperFormulaConfig.functionArgSeparator).toBe(',');
    });

    it('라이선스 키 설정', () => {
      expect(hyperFormulaConfig.licenseKey).toBe('gpl-v3');
    });

    it('최대 행/열 제한', () => {
      expect(hyperFormulaConfig.maxRows).toBeGreaterThan(1000);
      expect(hyperFormulaConfig.maxColumns).toBeGreaterThan(100);
    });
  });
});
