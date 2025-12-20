/**
 * @module prompts/engine
 * @description 프롬프트 변수 치환 엔진
 */

import type { PromptVariable } from '../supabase/types';
import type { PromptTemplate } from './templates';

// ============================================================================
// 타입 정의
// ============================================================================

export interface PromptContext {
  // 입찰 데이터
  bidId?: string;
  title?: string;
  organization?: string;
  deadline?: string;
  estimatedAmount?: string | number;
  status?: string;

  // 셀 컨텍스트
  row?: number;
  col?: number;
  cellValue?: unknown;

  // 사용자 입력
  [key: string]: unknown;
}

export interface InterpolateResult {
  success: boolean;
  prompt: string;
  missingVariables: string[];
  usedVariables: string[];
}

// ============================================================================
// 변수 치환 엔진
// ============================================================================

/**
 * Mustache 스타일 변수 치환 {{variable}}
 */
export function interpolate(
  template: string,
  context: PromptContext,
  variables?: PromptVariable[]
): InterpolateResult {
  const missingVariables: string[] = [];
  const usedVariables: string[] = [];

  // 변수 패턴: {{variableName}} 또는 {{variableName|default}}
  const pattern = /\{\{(\w+)(?:\|([^}]*))?\}\}/g;

  const prompt = template.replace(pattern, (match, varName, defaultValue) => {
    const value = context[varName];

    if (value !== undefined && value !== null && value !== '') {
      usedVariables.push(varName);
      return formatValue(value);
    }

    // 변수 정의에서 기본값 확인
    const varDef = variables?.find((v) => v.name === varName);

    if (defaultValue !== undefined) {
      usedVariables.push(varName);
      return defaultValue;
    }

    if (varDef?.default) {
      usedVariables.push(varName);
      return varDef.default;
    }

    // 필수 변수 누락 체크
    if (varDef?.required) {
      missingVariables.push(varName);
    }

    return match; // 치환 실패 시 원본 유지
  });

  return {
    success: missingVariables.length === 0,
    prompt,
    missingVariables,
    usedVariables,
  };
}

/**
 * 값 포맷팅
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    // 금액 포맷팅
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억원`;
    }
    if (value >= 10000) {
      return `${Math.round(value / 10000)}만원`;
    }
    return value.toLocaleString('ko-KR');
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('ko-KR');
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
}

// ============================================================================
// 템플릿 실행
// ============================================================================

/**
 * 템플릿 실행 (변수 치환 + 검증)
 */
export function executeTemplate(
  template: PromptTemplate,
  context: PromptContext
): InterpolateResult {
  return interpolate(template.prompt, context, template.variables);
}

/**
 * 빠른 프롬프트 생성 (템플릿 ID 기반)
 */
export function quickPrompt(
  templateId: string,
  context: PromptContext,
  templates: PromptTemplate[]
): InterpolateResult | null {
  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    return null;
  }
  return executeTemplate(template, context);
}

// ============================================================================
// 변수 추출
// ============================================================================

/**
 * 템플릿에서 변수 목록 추출
 */
export function extractVariables(template: string): string[] {
  const pattern = /\{\{(\w+)(?:\|[^}]*)?\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = pattern.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * 템플릿 유효성 검사
 */
export function validateTemplate(
  template: string,
  variables: PromptVariable[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const extractedVars = extractVariables(template);
  const definedVars = variables.map((v) => v.name);

  // 정의되지 않은 변수 사용 체크
  for (const varName of extractedVars) {
    if (!definedVars.includes(varName)) {
      errors.push(`정의되지 않은 변수: {{${varName}}}`);
    }
  }

  // 정의됐지만 사용되지 않은 변수 체크
  for (const varDef of variables) {
    if (!extractedVars.includes(varDef.name)) {
      errors.push(`사용되지 않은 변수: ${varDef.name}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// 입찰 컨텍스트 생성
// ============================================================================

/**
 * 입찰 데이터에서 프롬프트 컨텍스트 생성
 */
export function createBidContext(bid: {
  id?: string;
  title?: string;
  organization?: string;
  deadline?: string;
  estimated_amount?: number | null;
  status?: string;
  priority?: string;
  type?: string;
  keywords?: string[];
  ai_summary?: string | null;
  url?: string | null;
}): PromptContext {
  return {
    bidId: bid.id,
    title: bid.title || '',
    organization: bid.organization || '',
    deadline: bid.deadline ? new Date(bid.deadline).toLocaleDateString('ko-KR') : '',
    estimatedAmount: bid.estimated_amount || '',
    status: bid.status || '',
    priority: bid.priority || '',
    type: bid.type || '',
    keywords: bid.keywords?.join(', ') || '',
    aiSummary: bid.ai_summary || '',
    url: bid.url || '',
  };
}

const promptEngine = {
  interpolate,
  executeTemplate,
  quickPrompt,
  extractVariables,
  validateTemplate,
  createBidContext,
};

export default promptEngine;
