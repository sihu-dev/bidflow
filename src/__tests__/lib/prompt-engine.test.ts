/**
 * Prompt Engine 유닛 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  interpolate,
  executeTemplate,
  extractVariables,
  validateTemplate,
  createBidContext,
  type PromptContext,
} from '@/lib/prompts/engine';
import type { PromptVariable } from '@/lib/supabase/types';

describe('prompt-engine', () => {
  // ============================================================================
  // interpolate 테스트
  // ============================================================================
  describe('interpolate', () => {
    describe('기본 변수 치환', () => {
      it('단일 변수 치환', () => {
        const template = '{{title}} 입찰 분석';
        const context: PromptContext = { title: '서울시 유량계 구매' };

        const result = interpolate(template, context);
        expect(result.prompt).toBe('서울시 유량계 구매 입찰 분석');
        expect(result.success).toBe(true);
        expect(result.usedVariables).toContain('title');
      });

      it('여러 변수 치환', () => {
        const template = '{{organization}}에서 발주한 {{title}} 공고입니다.';
        const context: PromptContext = {
          organization: '서울특별시',
          title: '초음파유량계 구매',
        };

        const result = interpolate(template, context);
        expect(result.prompt).toBe('서울특별시에서 발주한 초음파유량계 구매 공고입니다.');
        expect(result.usedVariables).toEqual(['organization', 'title']);
      });

      it('동일 변수 여러 번 사용', () => {
        const template = '{{title}} - {{title}}';
        const context: PromptContext = { title: '테스트' };

        const result = interpolate(template, context);
        expect(result.prompt).toBe('테스트 - 테스트');
      });
    });

    describe('기본값 처리', () => {
      it('변수 없을 때 기본값 사용', () => {
        const template = '{{missing|기본값}} 테스트';
        const result = interpolate(template, {});

        expect(result.prompt).toBe('기본값 테스트');
        expect(result.success).toBe(true);
      });

      it('빈 문자열일 때 기본값 사용', () => {
        const template = '{{empty|기본값}}';
        const context: PromptContext = { empty: '' };

        const result = interpolate(template, context);
        expect(result.prompt).toBe('기본값');
      });

      it('null일 때 기본값 사용', () => {
        const template = '{{nullValue|기본값}}';
        const context: PromptContext = { nullValue: null };

        const result = interpolate(template, context);
        expect(result.prompt).toBe('기본값');
      });
    });

    describe('필수 변수 검증', () => {
      it('필수 변수 누락 시 실패', () => {
        const template = '{{required}} 분석';
        const variables: PromptVariable[] = [
          { name: 'required', description: '필수값', required: true },
        ];

        const result = interpolate(template, {}, variables);
        expect(result.success).toBe(false);
        expect(result.missingVariables).toContain('required');
      });

      it('필수 변수 있으면 성공', () => {
        const template = '{{required}} 분석';
        const variables: PromptVariable[] = [
          { name: 'required', description: '필수값', required: true },
        ];

        const result = interpolate(template, { required: '값' }, variables);
        expect(result.success).toBe(true);
        expect(result.missingVariables).toHaveLength(0);
      });

      it('변수 정의에서 기본값 사용', () => {
        const template = '{{withDefault}}';
        const variables: PromptVariable[] = [
          { name: 'withDefault', description: '설명', default: '변수기본값' },
        ];

        const result = interpolate(template, {}, variables);
        expect(result.prompt).toBe('변수기본값');
      });
    });

    describe('값 포맷팅', () => {
      it('억 단위 금액 포맷팅', () => {
        const template = '추정가: {{estimatedAmount}}';
        const context: PromptContext = { estimatedAmount: 450000000 };

        const result = interpolate(template, context);
        expect(result.prompt).toContain('4.5억원');
      });

      it('만 단위 금액 포맷팅', () => {
        const template = '추정가: {{amount}}';
        const context: PromptContext = { amount: 50000 };

        const result = interpolate(template, context);
        expect(result.prompt).toContain('5만원');
      });

      it('배열을 쉼표로 연결', () => {
        const template = '키워드: {{keywords}}';
        const context: PromptContext = { keywords: ['유량계', '계측기', '상수도'] };

        const result = interpolate(template, context);
        expect(result.prompt).toBe('키워드: 유량계, 계측기, 상수도');
      });

      it('Date 객체 포맷팅', () => {
        const template = '마감일: {{dueDate}}';
        const context: PromptContext = { dueDate: new Date('2025-01-15') };

        const result = interpolate(template, context);
        expect(result.prompt).toMatch(/마감일: \d{4}\. \d{1,2}\. \d{1,2}\./);
      });
    });

    describe('치환 실패 시 원본 유지', () => {
      it('정의되지 않은 선택적 변수는 원본 유지', () => {
        const template = '{{defined}} {{undefined}}';
        const context: PromptContext = { defined: '값' };

        const result = interpolate(template, context);
        expect(result.prompt).toBe('값 {{undefined}}');
      });
    });
  });

  // ============================================================================
  // extractVariables 테스트
  // ============================================================================
  describe('extractVariables', () => {
    it('단일 변수 추출', () => {
      const template = '{{title}}';
      expect(extractVariables(template)).toEqual(['title']);
    });

    it('여러 변수 추출', () => {
      const template = '{{title}} by {{organization}} - {{deadline}}';
      expect(extractVariables(template)).toEqual(['title', 'organization', 'deadline']);
    });

    it('중복 변수 제거', () => {
      const template = '{{title}} and {{title}} again {{title}}';
      expect(extractVariables(template)).toEqual(['title']);
    });

    it('기본값 있는 변수 추출', () => {
      const template = '{{name|기본값}}';
      expect(extractVariables(template)).toEqual(['name']);
    });

    it('변수 없는 템플릿', () => {
      const template = '일반 텍스트입니다.';
      expect(extractVariables(template)).toEqual([]);
    });

    it('복잡한 템플릿에서 변수 추출', () => {
      const template = `
        제목: {{title}}
        기관: {{organization}}
        금액: {{amount|미정}}
        상태: {{status}}
      `;
      const vars = extractVariables(template);
      expect(vars).toContain('title');
      expect(vars).toContain('organization');
      expect(vars).toContain('amount');
      expect(vars).toContain('status');
      expect(vars).toHaveLength(4);
    });
  });

  // ============================================================================
  // validateTemplate 테스트
  // ============================================================================
  describe('validateTemplate', () => {
    it('유효한 템플릿', () => {
      const template = '{{title}} - {{organization}}';
      const variables: PromptVariable[] = [
        { name: 'title', description: '공고명' },
        { name: 'organization', description: '기관' },
      ];

      const result = validateTemplate(template, variables);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('정의되지 않은 변수 사용 시 에러', () => {
      const template = '{{title}} {{undefined}}';
      const variables: PromptVariable[] = [
        { name: 'title', description: '공고명' },
      ];

      const result = validateTemplate(template, variables);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('undefined'))).toBe(true);
    });

    it('정의됐지만 사용되지 않은 변수 경고', () => {
      const template = '{{title}}';
      const variables: PromptVariable[] = [
        { name: 'title', description: '공고명' },
        { name: 'unused', description: '미사용' },
      ];

      const result = validateTemplate(template, variables);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('unused'))).toBe(true);
    });
  });

  // ============================================================================
  // createBidContext 테스트
  // ============================================================================
  describe('createBidContext', () => {
    it('기본 입찰 데이터 변환', () => {
      const bid = {
        id: '123',
        title: '테스트 공고',
        organization: '테스트 기관',
        deadline: '2025-01-15T18:00:00',
        estimated_amount: 100000000,
        status: 'reviewing',
        priority: 'high',
      };

      const ctx = createBidContext(bid);

      expect(ctx.bidId).toBe('123');
      expect(ctx.title).toBe('테스트 공고');
      expect(ctx.organization).toBe('테스트 기관');
      expect(ctx.estimatedAmount).toBe(100000000);
      expect(ctx.status).toBe('reviewing');
      expect(ctx.priority).toBe('high');
    });

    it('키워드 배열을 문자열로 변환', () => {
      const bid = {
        keywords: ['유량계', '계측기', '상수도'],
      };

      const ctx = createBidContext(bid);
      expect(ctx.keywords).toBe('유량계, 계측기, 상수도');
    });

    it('null/undefined 필드 처리', () => {
      const bid = {
        id: '123',
        title: null,
        estimated_amount: null,
        ai_summary: undefined,
      };

      const ctx = createBidContext(bid as Record<string, unknown>);
      expect(ctx.title).toBe('');
      expect(ctx.estimatedAmount).toBe('');
      expect(ctx.aiSummary).toBe('');
    });

    it('날짜 포맷팅', () => {
      const bid = {
        deadline: '2025-01-15T18:00:00',
      };

      const ctx = createBidContext(bid);
      expect(ctx.deadline).toMatch(/\d{4}\. \d{1,2}\. \d{1,2}\./);
    });

    it('빈 객체 처리', () => {
      const ctx = createBidContext({});

      expect(ctx.bidId).toBeUndefined();
      expect(ctx.title).toBe('');
      expect(ctx.organization).toBe('');
    });
  });

  // ============================================================================
  // executeTemplate 테스트
  // ============================================================================
  describe('executeTemplate', () => {
    it('템플릿 실행 성공', () => {
      const template = {
        id: 'test-1',
        name: '테스트 템플릿',
        category: 'analysis' as const,
        prompt: '{{title}} 분석 결과',
        description: '테스트용',
        isSystem: true,
        variables: [
          { name: 'title', description: '공고명', required: true },
        ],
      };

      const context: PromptContext = { title: '테스트 공고' };
      const result = executeTemplate(template, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toBe('테스트 공고 분석 결과');
    });

    it('필수 변수 누락 시 실패', () => {
      const template = {
        id: 'test-2',
        name: '테스트 템플릿',
        category: 'analysis' as const,
        prompt: '{{required}}',
        description: '테스트용',
        isSystem: true,
        variables: [
          { name: 'required', description: '필수', required: true },
        ],
      };

      const result = executeTemplate(template, {});
      expect(result.success).toBe(false);
      expect(result.missingVariables).toContain('required');
    });
  });
});
