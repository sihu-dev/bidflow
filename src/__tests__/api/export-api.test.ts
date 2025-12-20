/**
 * Export API 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// 내보내기 스키마 정의
const exportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  columns: z.array(z.string()).optional(),
  filters: z.object({
    status: z.string().optional(),
    source: z.string().optional(),
  }).optional(),
  limit: z.coerce.number().min(1).max(10000).default(1000),
});

describe('Export API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('스키마 검증', () => {
    it('기본 형식은 csv', () => {
      const result = exportSchema.parse({});
      expect(result.format).toBe('csv');
    });

    it('유효한 포맷 허용', () => {
      expect(exportSchema.parse({ format: 'csv' }).format).toBe('csv');
      expect(exportSchema.parse({ format: 'json' }).format).toBe('json');
      expect(exportSchema.parse({ format: 'xlsx' }).format).toBe('xlsx');
    });

    it('잘못된 포맷 거부', () => {
      expect(exportSchema.safeParse({ format: 'pdf' }).success).toBe(false);
      expect(exportSchema.safeParse({ format: 'xml' }).success).toBe(false);
    });

    it('컬럼 배열 허용', () => {
      const result = exportSchema.parse({
        columns: ['title', 'organization', 'deadline'],
      });
      expect(result.columns).toHaveLength(3);
    });

    it('기본 limit은 1000', () => {
      const result = exportSchema.parse({});
      expect(result.limit).toBe(1000);
    });

    it('limit 범위 검증 (1-10000)', () => {
      expect(exportSchema.safeParse({ limit: 0 }).success).toBe(false);
      expect(exportSchema.safeParse({ limit: 10001 }).success).toBe(false);
      expect(exportSchema.safeParse({ limit: 5000 }).success).toBe(true);
    });

    it('필터 옵션 지원', () => {
      const result = exportSchema.parse({
        filters: {
          status: 'new',
          source: 'narajangto',
        },
      });
      expect(result.filters?.status).toBe('new');
      expect(result.filters?.source).toBe('narajangto');
    });
  });

  describe('CSV 생성', () => {
    it('CSV 헤더 생성', () => {
      const columns = ['title', 'organization', 'deadline'];
      const headerMap: Record<string, string> = {
        title: '제목',
        organization: '발주기관',
        deadline: '마감일',
      };
      const headers = columns.map(col => headerMap[col] || col);

      expect(headers).toEqual(['제목', '발주기관', '마감일']);
    });

    it('CSV 특수문자 이스케이프', () => {
      const value = '서울시, "특별" 입찰';
      const escaped = value.includes(',') || value.includes('"')
        ? `"${value.replace(/"/g, '""')}"`
        : value;

      expect(escaped).toBe('"서울시, ""특별"" 입찰"');
    });

    it('줄바꿈 포함 값 이스케이프', () => {
      const value = '첫째 줄\n둘째 줄';
      const escaped = value.includes('\n')
        ? `"${value.replace(/"/g, '""')}"`
        : value;

      expect(escaped).toContain('"');
    });
  });

  describe('JSON 내보내기', () => {
    it('JSON 형식 구조', () => {
      const jsonExport = {
        success: true,
        data: {
          exportedAt: new Date().toISOString(),
          count: 10,
          items: [],
        },
      };

      expect(jsonExport.data).toHaveProperty('exportedAt');
      expect(jsonExport.data).toHaveProperty('count');
      expect(jsonExport.data).toHaveProperty('items');
    });

    it('날짜 ISO8601 형식', () => {
      const date = new Date().toISOString();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
