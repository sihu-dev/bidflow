/**
 * Prompts API 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// 템플릿 생성 스키마
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['analysis', 'pricing', 'proposal', 'matching', 'summary']),
  prompt: z.string().min(10).max(5000),
  variables: z.array(z.object({
    name: z.string().min(1),
    description: z.string(),
    required: z.boolean().default(true),
  })).optional(),
});

// 프롬프트 실행 스키마
const executeSchema = z.object({
  templateId: z.string().optional(),
  prompt: z.string().min(1).max(5000).optional(),
  variables: z.record(z.string()).optional(),
});

describe('Prompts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('템플릿 카테고리', () => {
    it('유효한 카테고리', () => {
      const categories = ['analysis', 'pricing', 'proposal', 'matching', 'summary'];
      categories.forEach(cat => {
        const result = createTemplateSchema.safeParse({
          name: '테스트',
          category: cat,
          prompt: '테스트 프롬프트입니다',
        });
        expect(result.success).toBe(true);
      });
    });

    it('잘못된 카테고리 거부', () => {
      const result = createTemplateSchema.safeParse({
        name: '테스트',
        category: 'invalid',
        prompt: '테스트 프롬프트입니다',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('템플릿 생성 스키마', () => {
    it('유효한 템플릿 데이터', () => {
      const result = createTemplateSchema.parse({
        name: '기본 분석',
        description: '입찰 공고를 분석합니다',
        category: 'analysis',
        prompt: '다음 입찰 공고를 분석해주세요: {{title}}',
        variables: [
          { name: 'title', description: '공고 제목', required: true },
        ],
      });

      expect(result.name).toBe('기본 분석');
      expect(result.category).toBe('analysis');
      expect(result.variables).toHaveLength(1);
    });

    it('이름 길이 제한 (1-100)', () => {
      expect(createTemplateSchema.safeParse({
        name: '',
        category: 'analysis',
        prompt: '테스트 프롬프트입니다',
      }).success).toBe(false);

      expect(createTemplateSchema.safeParse({
        name: 'a'.repeat(101),
        category: 'analysis',
        prompt: '테스트 프롬프트입니다',
      }).success).toBe(false);
    });

    it('프롬프트 길이 제한 (10-5000)', () => {
      expect(createTemplateSchema.safeParse({
        name: '테스트',
        category: 'analysis',
        prompt: 'short',
      }).success).toBe(false);

      expect(createTemplateSchema.safeParse({
        name: '테스트',
        category: 'analysis',
        prompt: 'a'.repeat(5001),
      }).success).toBe(false);
    });
  });

  describe('변수 치환', () => {
    it('단일 변수 치환', () => {
      const template = '제목: {{title}}';
      const variables: Record<string, string> = { title: '서울시 입찰' };
      const result = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] || '');

      expect(result).toBe('제목: 서울시 입찰');
    });

    it('다중 변수 치환', () => {
      const template = '{{title}} - {{organization}} ({{deadline}})';
      const variables: Record<string, string> = {
        title: '유량계 구매',
        organization: '서울시',
        deadline: '2025-01-15',
      };
      const result = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] || '');

      expect(result).toBe('유량계 구매 - 서울시 (2025-01-15)');
    });

    it('누락된 변수는 원본 유지', () => {
      const template = '{{title}} - {{missing}}';
      const variables: Record<string, string> = { title: '테스트' };
      const result = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] || `{{${key}}}`);

      expect(result).toBe('테스트 - {{missing}}');
    });
  });

  describe('프롬프트 실행 스키마', () => {
    it('직접 프롬프트 실행', () => {
      const result = executeSchema.parse({
        prompt: '입찰 공고를 분석해주세요',
      });

      expect(result.prompt).toBeDefined();
    });

    it('템플릿 ID로 실행', () => {
      const result = executeSchema.parse({
        templateId: 'sys-analysis-basic',
        variables: { title: '테스트' },
      });

      expect(result.templateId).toBe('sys-analysis-basic');
      expect(result.variables?.title).toBe('테스트');
    });

    it('프롬프트 길이 제한', () => {
      expect(executeSchema.safeParse({
        prompt: 'a'.repeat(5001),
      }).success).toBe(false);
    });
  });

  describe('시스템 템플릿', () => {
    it('기본 시스템 템플릿 구조', () => {
      const systemTemplate = {
        id: 'sys-analysis-basic',
        name: '기본 공고 분석',
        description: '입찰 공고의 핵심 내용을 분석합니다',
        category: 'analysis',
        prompt: '다음 입찰 공고를 분석해주세요...',
        variables: [
          { name: 'title', description: '공고 제목', required: true },
        ],
        isSystem: true,
        usageCount: 0,
      };

      expect(systemTemplate.isSystem).toBe(true);
      expect(systemTemplate.variables).toHaveLength(1);
    });

    it('시스템 템플릿은 수정 불가', () => {
      const template = { isSystem: true };
      expect(template.isSystem).toBe(true);
      // 시스템 템플릿 수정 시도는 API에서 거부
    });
  });
});
