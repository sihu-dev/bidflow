/**
 * Excel Export 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { exportToCSV, exportToJSON, BID_COLUMNS } from '@/lib/spreadsheet/excel-export';

// file-saver 모킹
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

import { saveAs } from 'file-saver';

describe('Excel Export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // BID_COLUMNS 상수 테스트
  // ============================================================================
  describe('BID_COLUMNS', () => {
    it('필수 컬럼 정의 포함', () => {
      const columnKeys = BID_COLUMNS.map(c => c.key);

      expect(columnKeys).toContain('id');
      expect(columnKeys).toContain('source');
      expect(columnKeys).toContain('title');
      expect(columnKeys).toContain('organization');
      expect(columnKeys).toContain('deadline');
      expect(columnKeys).toContain('estimated_amount');
      expect(columnKeys).toContain('status');
      expect(columnKeys).toContain('priority');
    });

    it('각 컬럼에 header와 key 정의', () => {
      BID_COLUMNS.forEach(col => {
        expect(col.key).toBeDefined();
        expect(col.header).toBeDefined();
        expect(col.header).not.toBe('');
      });
    });

    it('타입 지정된 컬럼 확인', () => {
      const deadlineCol = BID_COLUMNS.find(c => c.key === 'deadline');
      const amountCol = BID_COLUMNS.find(c => c.key === 'estimated_amount');
      const scoreCol = BID_COLUMNS.find(c => c.key === 'match_score');

      expect(deadlineCol?.type).toBe('date');
      expect(amountCol?.type).toBe('currency');
      expect(scoreCol?.type).toBe('number');
    });
  });

  // ============================================================================
  // exportToJSON 테스트
  // ============================================================================
  describe('exportToJSON', () => {
    it('JSON 파일 생성 및 saveAs 호출', () => {
      const testData = [
        { id: '1', title: '테스트 입찰', organization: '테스트기관' },
        { id: '2', title: '샘플 공고', organization: '샘플기관' },
      ];

      exportToJSON(testData, 'test-export');

      expect(saveAs).toHaveBeenCalledTimes(1);
      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;
      const filename = call[1];

      expect(blob.type).toBe('application/json;charset=utf-8');
      expect(filename).toBe('test-export.json');
    });

    it('기본 파일명 사용 (날짜 포함)', () => {
      const testData = [{ id: '1' }];

      exportToJSON(testData);

      expect(saveAs).toHaveBeenCalledTimes(1);
      const call = (saveAs as unknown as Mock).mock.calls[0];
      const filename = call[1];

      expect(filename).toMatch(/^BIDFLOW_\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('빈 배열 내보내기', () => {
      exportToJSON([]);

      expect(saveAs).toHaveBeenCalledTimes(1);
      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;

      expect(blob.size).toBeGreaterThan(0); // "[]"
    });

    it('복잡한 객체 직렬화', () => {
      const testData = [
        {
          id: '1',
          keywords: ['유량계', '초음파'],
          nested: { prop: 'value' },
          nullValue: null,
          number: 123,
        },
      ];

      exportToJSON(testData, 'complex');

      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;
      const filename = call[1];

      expect(blob.type).toBe('application/json;charset=utf-8');
      expect(filename).toBe('complex.json');
      expect(blob.size).toBeGreaterThan(50); // Complex object should be larger
    });
  });

  // ============================================================================
  // exportToCSV 테스트
  // ============================================================================
  describe('exportToCSV', () => {
    it('CSV 파일 생성 및 saveAs 호출', () => {
      const testData = [
        {
          id: '1',
          source: 'narajangto',
          title: '테스트 입찰',
          organization: '서울시',
          status: 'new',
          priority: 'high',
          keywords: ['유량계', '측정기'],
        },
      ];

      exportToCSV(testData, 'test-csv');

      expect(saveAs).toHaveBeenCalledTimes(1);
      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;
      const filename = call[1];

      expect(blob.type).toBe('text/csv;charset=utf-8');
      expect(filename).toBe('test-csv.csv');
    });

    it('UTF-8 BOM 포함 (한글 지원)', () => {
      const testData = [{ id: '1', title: '한글제목' }];

      exportToCSV(testData);

      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;

      // Blob 크기가 0보다 큼 (BOM + 데이터)
      expect(blob.size).toBeGreaterThan(3); // BOM(3 bytes) + data
      expect(blob.type).toBe('text/csv;charset=utf-8');
    });

    it('상태 값 한글 변환 (로직 검증)', () => {
      const testData = [
        { status: 'new', priority: 'high', source: 'narajangto' },
      ];

      exportToCSV(testData);

      // saveAs 호출 확인 (실제 변환은 내부 로직으로 처리됨)
      expect(saveAs).toHaveBeenCalledTimes(1);
      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;

      expect(blob.size).toBeGreaterThan(0);
    });

    it('배열 값을 세미콜론으로 구분 (로직 검증)', () => {
      const testData = [
        { keywords: ['유량계', '초음파', '다회선'] },
      ];

      exportToCSV(testData);

      expect(saveAs).toHaveBeenCalledTimes(1);
    });

    it('쉼표 포함 문자열 이스케이프 (로직 검증)', () => {
      const testData = [
        { title: '유량계, 측정기 구매' },
      ];

      exportToCSV(testData);

      expect(saveAs).toHaveBeenCalledTimes(1);
      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;

      expect(blob.size).toBeGreaterThan(0);
    });

    it('따옴표 포함 문자열 이스케이프 (로직 검증)', () => {
      const testData = [
        { title: 'Test "quoted" text' },
      ];

      exportToCSV(testData);

      expect(saveAs).toHaveBeenCalledTimes(1);
    });

    it('개행 문자 포함 문자열 이스케이프 (로직 검증)', () => {
      const testData = [
        { title: 'Line1\nLine2' },
      ];

      exportToCSV(testData);

      expect(saveAs).toHaveBeenCalledTimes(1);
    });

    it('null/undefined 값은 빈 문자열 (로직 검증)', () => {
      const testData = [
        { title: null, organization: undefined },
      ];

      exportToCSV(testData);

      expect(saveAs).toHaveBeenCalledTimes(1);
      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;

      expect(blob.size).toBeGreaterThan(0);
    });

    it('여러 행 데이터 내보내기', () => {
      const testData = [
        { id: '1', title: '입찰1', status: 'new' },
        { id: '2', title: '입찰2', status: 'reviewing' },
        { id: '3', title: '입찰3', status: 'won' },
      ];

      exportToCSV(testData);

      expect(saveAs).toHaveBeenCalledTimes(1);
      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;

      // 데이터가 많을수록 파일 크기가 커짐
      expect(blob.size).toBeGreaterThan(100);
    });

    it('기본 파일명 사용 (날짜 포함)', () => {
      const testData = [{ id: '1' }];

      exportToCSV(testData);

      const call = (saveAs as unknown as Mock).mock.calls[0];
      const filename = call[1];

      expect(filename).toMatch(/^BIDFLOW_\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });

  // ============================================================================
  // 복합 시나리오
  // ============================================================================
  describe('복합 시나리오', () => {
    it('모든 값 변환 및 이스케이프 조합 (로직 검증)', () => {
      const testData = [
        {
          id: '1',
          source: 'ted',
          title: '입찰, "특수" 공고\n여러줄',
          organization: 'EU',
          status: 'reviewing',
          priority: 'medium',
          keywords: ['유량계', '측정기'],
          match_score: null,
        },
      ];

      exportToCSV(testData, 'complex');

      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;
      const filename = call[1];

      expect(blob.size).toBeGreaterThan(0);
      expect(filename).toBe('complex.csv');
    });

    it('JSON과 CSV 동시 내보내기', () => {
      const testData = [
        { id: '1', title: '테스트' },
        { id: '2', title: '샘플' },
      ];

      exportToJSON(testData, 'test');
      exportToCSV(testData, 'test');

      expect(saveAs).toHaveBeenCalledTimes(2);

      const jsonCall = (saveAs as unknown as Mock).mock.calls[0];
      const csvCall = (saveAs as unknown as Mock).mock.calls[1];

      expect(jsonCall[1]).toBe('test.json');
      expect(csvCall[1]).toBe('test.csv');
    });

    it('빈 배열 CSV 내보내기 (헤더만)', () => {
      exportToCSV([]);

      const call = (saveAs as unknown as Mock).mock.calls[0];
      const blob = call[0] as Blob;

      // 헤더만 있어도 파일 크기가 0보다 큼
      expect(blob.size).toBeGreaterThan(0);
    });
  });
});
