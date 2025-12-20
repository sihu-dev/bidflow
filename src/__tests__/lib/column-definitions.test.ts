/**
 * Column Definitions 유닛 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  calculateDDay,
  formatAmount,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  SOURCE_LABELS,
  BID_COLUMNS,
} from '@/lib/spreadsheet/column-definitions';

describe('column-definitions', () => {
  // ============================================================================
  // calculateDDay 테스트
  // ============================================================================
  describe('calculateDDay', () => {
    it('오늘 마감인 경우 D-Day 반환', () => {
      const today = new Date();
      expect(calculateDDay(today)).toBe('D-Day');
    });

    it('1일 후 마감인 경우 D-1 반환', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(calculateDDay(tomorrow)).toBe('D-1');
    });

    it('3일 후 마감인 경우 D-3 반환', () => {
      const future = new Date();
      future.setDate(future.getDate() + 3);
      expect(calculateDDay(future)).toBe('D-3');
    });

    it('1일 전 마감인 경우 D+1 반환', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(calculateDDay(yesterday)).toBe('D+1');
    });

    it('7일 전 마감인 경우 D+7 반환', () => {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      expect(calculateDDay(past)).toBe('D+7');
    });

    it('문자열 날짜 처리', () => {
      const dateStr = '2025-12-25';
      const result = calculateDDay(dateStr);
      expect(result).toMatch(/^D[+-]?\d+$|^D-Day$/);
    });

    it('ISO 문자열 날짜 처리', () => {
      const isoStr = '2025-01-15T18:00:00';
      const result = calculateDDay(isoStr);
      expect(result).toMatch(/^D[+-]?\d+$|^D-Day$/);
    });
  });

  // ============================================================================
  // formatAmount 테스트
  // ============================================================================
  describe('formatAmount', () => {
    it('1억 이상은 X.X억 형식으로 포맷', () => {
      expect(formatAmount(100000000)).toBe('1.0억');
      expect(formatAmount(450000000)).toBe('4.5억');
      expect(formatAmount(1234567890)).toBe('12.3억');
    });

    it('1만 이상 1억 미만은 만 단위로 포맷', () => {
      expect(formatAmount(10000)).toBe('1만');
      expect(formatAmount(50000)).toBe('5만');
      expect(formatAmount(99990000)).toBe('9999만');
    });

    it('1만 미만은 로케일 포맷', () => {
      expect(formatAmount(9999)).toBe('9,999');
      expect(formatAmount(1000)).toBe('1,000');
      expect(formatAmount(100)).toBe('100');
    });

    it('0은 0으로 표시', () => {
      expect(formatAmount(0)).toBe('0');
    });

    it('null 값은 - 반환', () => {
      expect(formatAmount(null)).toBe('-');
    });

    it('undefined 값은 - 반환', () => {
      expect(formatAmount(undefined as unknown as null)).toBe('-');
    });
  });

  // ============================================================================
  // 상수 정의 테스트
  // ============================================================================
  describe('STATUS_LABELS', () => {
    it('모든 상태 라벨 포함', () => {
      expect(STATUS_LABELS.new).toBe('신규');
      expect(STATUS_LABELS.reviewing).toBe('검토중');
      expect(STATUS_LABELS.preparing).toBe('준비중');
      expect(STATUS_LABELS.submitted).toBe('제출완료');
      expect(STATUS_LABELS.won).toBe('낙찰');
      expect(STATUS_LABELS.lost).toBe('유찰');
      expect(STATUS_LABELS.cancelled).toBe('취소');
    });
  });

  describe('STATUS_COLORS', () => {
    it('모든 상태에 색상 정의', () => {
      expect(STATUS_COLORS.new).toContain('blue');
      expect(STATUS_COLORS.reviewing).toContain('yellow');
      expect(STATUS_COLORS.won).toContain('emerald');
      expect(STATUS_COLORS.lost).toContain('red');
    });
  });

  describe('PRIORITY_COLORS', () => {
    it('우선순위별 이모지 정의', () => {
      expect(PRIORITY_COLORS.high).toBe('🔴');
      expect(PRIORITY_COLORS.medium).toBe('🟡');
      expect(PRIORITY_COLORS.low).toBe('🟢');
    });
  });

  describe('SOURCE_LABELS', () => {
    it('출처별 한글 라벨 정의', () => {
      expect(SOURCE_LABELS.narajangto).toBe('나라장터');
      expect(SOURCE_LABELS.ted).toBe('TED (EU)');
      expect(SOURCE_LABELS.manual).toBe('수동등록');
    });
  });

  describe('BID_COLUMNS', () => {
    it('필수 컬럼 정의 포함', () => {
      const columnKeys = BID_COLUMNS.map(c => c.data);

      expect(columnKeys).toContain('id');
      expect(columnKeys).toContain('source');
      expect(columnKeys).toContain('title');
      expect(columnKeys).toContain('organization');
      expect(columnKeys).toContain('estimated_amount');
      expect(columnKeys).toContain('deadline');
      expect(columnKeys).toContain('status');
      expect(columnKeys).toContain('priority');
    });

    it('각 컬럼에 제목 정의', () => {
      BID_COLUMNS.forEach(col => {
        expect(col.title).toBeDefined();
        expect(col.title).not.toBe('');
      });
    });

    it('각 컬럼에 너비 정의', () => {
      BID_COLUMNS.forEach(col => {
        expect(col.width).toBeGreaterThan(0);
      });
    });

    it('status 컬럼은 dropdown 타입', () => {
      const statusCol = BID_COLUMNS.find(c => c.data === 'status');
      expect(statusCol?.type).toBe('dropdown');
      expect(statusCol?.source).toContain('new');
      expect(statusCol?.source).toContain('reviewing');
    });

    it('estimated_amount 컬럼은 numeric 타입', () => {
      const amountCol = BID_COLUMNS.find(c => c.data === 'estimated_amount');
      expect(amountCol?.type).toBe('numeric');
    });

    it('deadline 컬럼은 date 타입', () => {
      const deadlineCol = BID_COLUMNS.find(c => c.data === 'deadline');
      expect(deadlineCol?.type).toBe('date');
    });

    it('readOnly 컬럼 확인', () => {
      const idCol = BID_COLUMNS.find(c => c.data === 'id');
      const sourceCol = BID_COLUMNS.find(c => c.data === 'source');

      expect(idCol?.readOnly).toBe(true);
      expect(sourceCol?.readOnly).toBe(true);
    });
  });
});
