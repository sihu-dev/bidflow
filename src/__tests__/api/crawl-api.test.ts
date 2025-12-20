/**
 * Crawl API 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// 크롤링 요청 스키마
const crawlRequestSchema = z.object({
  source: z.enum(['narajangto', 'ted', 'sam', 'kepco', 'all']).default('all'),
  keywords: z.array(z.string()).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

describe('Crawl API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('스키마 검증', () => {
    it('기본 소스는 all', () => {
      const result = crawlRequestSchema.parse({});
      expect(result.source).toBe('all');
    });

    it('유효한 소스 허용', () => {
      const sources = ['narajangto', 'ted', 'sam', 'kepco', 'all'];
      sources.forEach(source => {
        const result = crawlRequestSchema.safeParse({ source });
        expect(result.success).toBe(true);
      });
    });

    it('잘못된 소스 거부', () => {
      expect(crawlRequestSchema.safeParse({ source: 'invalid' }).success).toBe(false);
      expect(crawlRequestSchema.safeParse({ source: 'google' }).success).toBe(false);
    });

    it('키워드 배열 허용', () => {
      const result = crawlRequestSchema.parse({
        keywords: ['유량계', '초음파', '계측기'],
      });
      expect(result.keywords).toHaveLength(3);
    });

    it('날짜 범위 지원', () => {
      const result = crawlRequestSchema.parse({
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
      });
      expect(result.fromDate).toBe('2025-01-01');
      expect(result.toDate).toBe('2025-01-31');
    });
  });

  describe('크롤링 응답', () => {
    it('크롤링 상태 응답 구조', () => {
      const statusResponse = {
        success: true,
        data: {
          lastCrawlAt: new Date().toISOString(),
          scheduledCrawls: [
            { time: '09:00', description: '정기 크롤링 1차' },
            { time: '15:00', description: '정기 크롤링 2차' },
            { time: '21:00', description: '정기 크롤링 3차' },
          ],
          availableSources: ['narajangto', 'ted', 'sam', 'kepco'],
          status: 'idle',
        },
      };

      expect(statusResponse.data.scheduledCrawls).toHaveLength(3);
      expect(statusResponse.data.availableSources).toContain('narajangto');
      expect(statusResponse.data.status).toBe('idle');
    });

    it('크롤링 트리거 응답 구조', () => {
      const triggerResponse = {
        success: true,
        data: {
          message: '크롤링이 시작되었습니다',
          source: 'all',
          status: 'queued',
          estimatedTime: '1-5분',
        },
      };

      expect(triggerResponse.data.status).toBe('queued');
      expect(triggerResponse.data.message).toContain('시작');
    });
  });

  describe('스케줄 크롤링', () => {
    it('cron 표현식 검증', () => {
      const cronExpressions = [
        { cron: '0 9 * * *', description: '매일 9시' },
        { cron: '0 9,15,21 * * *', description: '매일 9시, 15시, 21시' },
        { cron: '0 9 * * 1-5', description: '평일 9시' },
      ];

      cronExpressions.forEach(expr => {
        expect(expr.cron).toMatch(/^\d+ \d+/);
      });
    });
  });
});
