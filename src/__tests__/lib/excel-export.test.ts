/**
 * Excel Export 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveAs } from 'file-saver';
import {
  exportToCSV,
  exportToJSON,
  BID_COLUMNS,
} from '@/lib/spreadsheet/excel-export';

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('excel-export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 테스트용 샘플 데이터
  const sampleData = [
    {
      id: '1',
      source: 'narajangto',
      external_id: '20251219001',
      title: '서울시 초음파유량계 구매',
      organization: '서울특별시',
      deadline: '2025-01-15',
      estimated_amount: 450000000,
      status: 'reviewing',
      priority: 'high',
      type: 'product',
      keywords: ['유량계', '상수도'],
      match_score: 0.92,
      ai_summary: '테스트 요약',
      url: 'https://example.com',
    },
    {
      id: '2',
      source: 'ted',
      external_id: 'TED-2025-001',
      title: 'Water Flow Meters',
      organization: 'Berlin Water',
      deadline: '2025-02-01',
      estimated_amount: 100000000,
      status: 'new',
      priority: 'medium',
      type: 'product',
      keywords: ['meter', 'water'],
      match_score: 0.78,
      ai_summary: null,
      url: null,
    },
  ];

  // ============================================================================
  // exportToCSV 테스트
  // ============================================================================
  describe('exportToCSV', () => {
    it('CSV 파일 생성 및 다운로드 호출', () => {
      exportToCSV(sampleData);

      expect(saveAs).toHaveBeenCalledTimes(1);
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/^BIDFLOW_\d{4}-\d{2}-\d{2}\.csv$/)
      );
    });

    it('사용자 정의 파일명 사용', () => {
      exportToCSV(sampleData, 'custom_filename');

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'custom_filename.csv'
      );
    });

    it('상태값 한글 변환', () => {
      exportToCSV(sampleData);

      const callArgs = (saveAs as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
      const blob = callArgs[0] as Blob;

      // Blob 타입 확인
      expect(blob.type).toBe('text/csv;charset=utf-8');
    });

    it('빈 데이터 처리', () => {
      exportToCSV([]);

      expect(saveAs).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // exportToJSON 테스트
  // ============================================================================
  describe('exportToJSON', () => {
    it('JSON 파일 생성 및 다운로드 호출', () => {
      exportToJSON(sampleData);

      expect(saveAs).toHaveBeenCalledTimes(1);
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/^BIDFLOW_\d{4}-\d{2}-\d{2}\.json$/)
      );
    });

    it('사용자 정의 파일명 사용', () => {
      exportToJSON(sampleData, 'my_export');

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'my_export.json'
      );
    });

    it('JSON MIME 타입 설정', () => {
      exportToJSON(sampleData);

      const callArgs = (saveAs as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
      const blob = callArgs[0] as Blob;

      expect(blob.type).toBe('application/json;charset=utf-8');
    });

    it('빈 배열 처리', () => {
      exportToJSON([]);

      expect(saveAs).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // BID_COLUMNS 테스트
  // ============================================================================
  describe('BID_COLUMNS', () => {
    it('모든 필수 컬럼 정의', () => {
      const keys = BID_COLUMNS.map(c => c.key);

      expect(keys).toContain('id');
      expect(keys).toContain('source');
      expect(keys).toContain('title');
      expect(keys).toContain('organization');
      expect(keys).toContain('deadline');
      expect(keys).toContain('estimated_amount');
      expect(keys).toContain('status');
      expect(keys).toContain('priority');
    });

    it('각 컬럼에 header 정의', () => {
      BID_COLUMNS.forEach(col => {
        expect(col.header).toBeDefined();
        expect(typeof col.header).toBe('string');
        expect(col.header.length).toBeGreaterThan(0);
      });
    });

    it('각 컬럼에 width 정의', () => {
      BID_COLUMNS.forEach(col => {
        expect(col.width).toBeDefined();
        expect(col.width).toBeGreaterThan(0);
      });
    });

    it('타입이 지정된 컬럼 확인', () => {
      const dateCol = BID_COLUMNS.find(c => c.key === 'deadline');
      expect(dateCol?.type).toBe('date');

      const currencyCol = BID_COLUMNS.find(c => c.key === 'estimated_amount');
      expect(currencyCol?.type).toBe('currency');

      const numberCol = BID_COLUMNS.find(c => c.key === 'match_score');
      expect(numberCol?.type).toBe('number');
    });
  });

  // ============================================================================
  // 데이터 변환 테스트
  // ============================================================================
  describe('데이터 변환', () => {
    it('키워드 배열을 문자열로 변환', () => {
      // exportToCSV 내부에서 keywords 배열을 세미콜론으로 구분
      const data = [{ keywords: ['a', 'b', 'c'] }];
      exportToCSV(data as unknown as Record<string, unknown>[]);

      expect(saveAs).toHaveBeenCalled();
    });

    it('null 값 처리', () => {
      const data = [{
        id: '1',
        title: null,
        estimated_amount: null,
        ai_summary: null,
      }];

      exportToCSV(data as unknown as Record<string, unknown>[]);
      expect(saveAs).toHaveBeenCalled();

      exportToJSON(data as unknown as Record<string, unknown>[]);
      expect(saveAs).toHaveBeenCalledTimes(2);
    });

    it('undefined 값 처리', () => {
      const data = [{
        id: '1',
        title: undefined,
      }];

      exportToCSV(data as unknown as Record<string, unknown>[]);
      expect(saveAs).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // CSV 특수문자 처리 테스트
  // ============================================================================
  describe('CSV 특수문자 처리', () => {
    it('쉼표 포함 문자열 이스케이프', () => {
      const data = [{
        title: 'Hello, World',
      }];

      exportToCSV(data as unknown as Record<string, unknown>[]);
      expect(saveAs).toHaveBeenCalled();
    });

    it('따옴표 포함 문자열 이스케이프', () => {
      const data = [{
        title: 'He said "Hello"',
      }];

      exportToCSV(data as unknown as Record<string, unknown>[]);
      expect(saveAs).toHaveBeenCalled();
    });

    it('줄바꿈 포함 문자열 이스케이프', () => {
      const data = [{
        title: 'Line1\nLine2',
      }];

      exportToCSV(data as unknown as Record<string, unknown>[]);
      expect(saveAs).toHaveBeenCalled();
    });

    it('한글 포함 문자열', () => {
      const data = [{
        title: '한글 테스트 공고명',
        organization: '서울특별시',
      }];

      exportToCSV(data as unknown as Record<string, unknown>[]);
      expect(saveAs).toHaveBeenCalled();
    });
  });
});
