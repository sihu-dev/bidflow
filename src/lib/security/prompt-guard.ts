/**
 * @module security/prompt-guard
 * @description Prompt Injection 방어
 */

import DOMPurify from 'isomorphic-dompurify';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// 위험한 패턴 정의
// ============================================================================

const DANGEROUS_PATTERNS = [
  // 시스템 프롬프트 조작 시도
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/gi,
  /forget\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/gi,
  /override\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/gi,

  // 역할 변경 시도
  /you\s+are\s+(now\s+)?(a|an|the)\s+/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /act\s+as\s+(if\s+you\s+are|a|an|the)/gi,
  /roleplay\s+as/gi,

  // 시스템 프롬프트 노출 시도
  /what\s+is\s+your\s+(system\s+)?prompt/gi,
  /show\s+(me\s+)?your\s+(system\s+)?instructions/gi,
  /reveal\s+your\s+(system\s+)?prompt/gi,
  /print\s+your\s+(system\s+)?prompt/gi,

  // 특수 토큰 주입
  /\[\[SYSTEM\]\]/gi,
  /\[\[USER\]\]/gi,
  /\[\[ASSISTANT\]\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<\|system\|>/gi,
  /<\|user\|>/gi,

  // 탈옥 시도
  /jailbreak/gi,
  /DAN\s+mode/gi,
  /developer\s+mode/gi,
  /unrestricted\s+mode/gi,

  // 코드 실행 시도
  /```\s*(python|javascript|bash|shell|cmd)/gi,
  /exec\s*\(/gi,
  /eval\s*\(/gi,
  /system\s*\(/gi,
  /__import__/gi,

  // Base64 인코딩된 명령
  /base64\s*decode/gi,
  /atob\s*\(/gi,
];

// ============================================================================
// 입력 검증 함수
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  threats: string[];
}

/**
 * 프롬프트 입력 검증
 * @param input - 사용자 입력
 */
export function validatePromptInput(input: string): ValidationResult {
  const threats: string[] = [];

  // 빈 입력 체크
  if (!input || typeof input !== 'string') {
    return { isValid: true, sanitized: '', threats: [] };
  }

  // 길이 제한 (10,000자)
  if (input.length > 10000) {
    threats.push('입력이 너무 깁니다 (최대 10,000자)');
    return {
      isValid: false,
      sanitized: input.slice(0, 10000),
      threats,
    };
  }

  // 위험한 패턴 검사
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      threats.push(`위험한 패턴 감지: ${pattern.source.slice(0, 30)}...`);
    }
    // 플래그 리셋
    pattern.lastIndex = 0;
  }

  // HTML/스크립트 제거
  const sanitized = sanitizeInput(input);

  return {
    isValid: threats.length === 0,
    sanitized,
    threats,
  };
}

// ============================================================================
// 입력 정제 함수
// ============================================================================

/**
 * 입력 정제 (XSS, HTML 제거)
 */
export function sanitizeInput(input: string): string {
  // HTML 태그 제거
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // 모든 태그 제거
    ALLOWED_ATTR: [], // 모든 속성 제거
  });

  // 특수 문자 정규화
  sanitized = sanitized
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // 제로 너비 문자 제거
    .replace(/\u00A0/g, ' ')               // Non-breaking space → 일반 공백
    .trim();

  return sanitized;
}

/**
 * SQL Injection 방지용 입력 정제
 */
export function sanitizeForSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
}

// ============================================================================
// AI 프롬프트 래퍼
// ============================================================================

/**
 * 시스템 프롬프트와 사용자 입력 분리
 */
export function wrapUserInput(systemPrompt: string, userInput: string): string {
  const validation = validatePromptInput(userInput);

  if (!validation.isValid) {
    logger.warn('위험한 프롬프트 감지:', { threats: validation.threats });
    // 정제된 버전 사용
    return `${systemPrompt}\n\n---\n\n[사용자 입력]\n${validation.sanitized}`;
  }

  return `${systemPrompt}\n\n---\n\n[사용자 입력]\n${userInput}`;
}

/**
 * AI 응답 정제
 */
export function sanitizeAIResponse(response: string): string {
  // 민감한 정보 마스킹
  let sanitized = response
    .replace(/api[_-]?key\s*[:=]\s*['"]?[\w-]+['"]?/gi, 'api_key: [REDACTED]')
    .replace(/password\s*[:=]\s*['"]?[\w-]+['"]?/gi, 'password: [REDACTED]')
    .replace(/secret\s*[:=]\s*['"]?[\w-]+['"]?/gi, 'secret: [REDACTED]')
    .replace(/token\s*[:=]\s*['"]?[\w-]+['"]?/gi, 'token: [REDACTED]');

  // HTML 정제
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });

  return sanitized;
}

// ============================================================================
// 셀 수식 검증
// ============================================================================

/**
 * AI 셀 수식 검증
 */
export function validateAIFormula(formula: string): ValidationResult {
  const threats: string[] = [];

  // 허용된 함수 목록
  const allowedFunctions = [
    'AI',
    'AI_SUMMARY',
    'AI_EXTRACT',
    'AI_SCORE',
    'AI_PROPOSAL',
    'AI_PRICE',
  ];

  // 수식 패턴 추출
  const functionMatch = formula.match(/^=(\w+)\(/);
  if (!functionMatch) {
    threats.push('유효한 AI 함수 형식이 아닙니다');
    return { isValid: false, sanitized: formula, threats };
  }

  const functionName = functionMatch[1].toUpperCase();
  if (!allowedFunctions.includes(functionName)) {
    threats.push(`허용되지 않은 함수: ${functionName}`);
    return { isValid: false, sanitized: formula, threats };
  }

  // 인수 내 위험한 내용 검사
  const argsMatch = formula.match(/\((.+)\)$/);
  if (argsMatch) {
    const args = argsMatch[1];
    const argsValidation = validatePromptInput(args);
    if (!argsValidation.isValid) {
      return argsValidation;
    }
  }

  return { isValid: true, sanitized: formula, threats: [] };
}

// ============================================================================
// 통합 가드 미들웨어
// ============================================================================

/**
 * 요청 본문 검증 미들웨어
 */
export async function validateRequestBody<T extends Record<string, unknown>>(
  body: T,
  textFields: (keyof T)[]
): Promise<{ isValid: boolean; sanitizedBody: T; threats: string[] }> {
  const allThreats: string[] = [];
  const sanitizedBody = { ...body };

  for (const field of textFields) {
    const value = body[field];
    if (typeof value === 'string') {
      const validation = validatePromptInput(value);
      if (!validation.isValid) {
        allThreats.push(`필드 '${String(field)}': ${validation.threats.join(', ')}`);
      }
      (sanitizedBody as Record<string, unknown>)[field as string] = validation.sanitized;
    }
  }

  return {
    isValid: allThreats.length === 0,
    sanitizedBody,
    threats: allThreats,
  };
}
