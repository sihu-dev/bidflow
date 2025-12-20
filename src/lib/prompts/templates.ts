/**
 * @module prompts/templates
 * @description BIDFLOW 시스템 프롬프트 템플릿
 */

import type { PromptVariable } from '../supabase/types';

// ============================================================================
// 타입 정의
// ============================================================================

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  prompt: string;
  variables: PromptVariable[];
  isSystem: boolean;
  icon?: string;
  tags?: string[];
}

export type PromptCategory =
  | 'analysis'    // 공고 분석
  | 'pricing'     // 가격 전략
  | 'proposal'    // 제안서 작성
  | 'matching'    // 제품 매칭
  | 'summary'     // 요약
  | 'translation' // 번역
  | 'custom';     // 사용자 정의

export const CATEGORY_LABELS: Record<PromptCategory, string> = {
  analysis: '분석',
  pricing: '가격',
  proposal: '제안서',
  matching: '매칭',
  summary: '요약',
  translation: '번역',
  custom: '사용자 정의',
};

export const CATEGORY_ICONS: Record<PromptCategory, string> = {
  analysis: '🔍',
  pricing: '💰',
  proposal: '📝',
  matching: '🎯',
  summary: '📋',
  translation: '🌐',
  custom: '⚙️',
};

// ============================================================================
// 시스템 템플릿 (기본 제공)
// ============================================================================

export const SYSTEM_TEMPLATES: PromptTemplate[] = [
  // 분석 카테고리
  {
    id: 'analysis-basic',
    name: '기본 공고 분석',
    description: '입찰 공고의 핵심 내용을 분석합니다',
    category: 'analysis',
    icon: '🔍',
    prompt: `다음 입찰 공고를 분석해주세요:

**공고명**: {{title}}
**발주기관**: {{organization}}
**추정가격**: {{estimatedAmount}}
**마감일**: {{deadline}}

다음 항목을 포함해주세요:
1. 핵심 요구사항 3가지
2. 필수 자격요건
3. 납품/수행 조건
4. 주의해야 할 특이사항`,
    variables: [
      { name: 'title', description: '공고명', required: true },
      { name: 'organization', description: '발주기관', required: true },
      { name: 'estimatedAmount', description: '추정가격', required: false },
      { name: 'deadline', description: '마감일', required: false },
    ],
    isSystem: true,
    tags: ['분석', '요구사항', '자격'],
  },
  {
    id: 'analysis-risk',
    name: '리스크 분석',
    description: '입찰 참여 시 위험 요소를 분석합니다',
    category: 'analysis',
    icon: '⚠️',
    prompt: `다음 입찰 공고의 리스크를 분석해주세요:

**공고명**: {{title}}
**발주기관**: {{organization}}
**추정가격**: {{estimatedAmount}}
**납품기한**: {{deliveryPeriod}}

분석 항목:
1. 기술적 리스크 (난이도, 경험 부족 영역)
2. 일정 리스크 (납품 기한 촉박 여부)
3. 재무 리스크 (수익성, 현금흐름)
4. 경쟁 리스크 (예상 경쟁사, 진입장벽)
5. 법적/계약 리스크

각 리스크별 대응 방안도 제시해주세요.`,
    variables: [
      { name: 'title', description: '공고명', required: true },
      { name: 'organization', description: '발주기관', required: true },
      { name: 'estimatedAmount', description: '추정가격', required: false },
      { name: 'deliveryPeriod', description: '납품기한', required: false },
    ],
    isSystem: true,
    tags: ['리스크', '위험', '대응'],
  },

  // 가격 카테고리
  {
    id: 'pricing-strategy',
    name: '입찰가 전략',
    description: '최적의 입찰 가격 전략을 수립합니다',
    category: 'pricing',
    icon: '💰',
    prompt: `입찰가 책정 전략을 제안해주세요:

**공고명**: {{title}}
**추정가격**: {{estimatedAmount}}
**경쟁 예상**: {{competitionLevel}}
**목표 마진율**: {{targetMargin}}

고려사항:
- 과거 유사 공고 낙찰률
- 시장 경쟁 상황
- 원가 구조
- 마진율 목표

다음을 제안해주세요:
1. 권장 입찰가 범위
2. 최저가 제한선 (손익분기점)
3. 경쟁사 예상 입찰가
4. 낙찰 확률 시나리오`,
    variables: [
      { name: 'title', description: '공고명', required: true },
      { name: 'estimatedAmount', description: '추정가격', required: true },
      { name: 'competitionLevel', description: '경쟁 예상 (높음/중간/낮음)', required: false, default: '중간' },
      { name: 'targetMargin', description: '목표 마진율 (%)', required: false, default: '15%' },
    ],
    isSystem: true,
    tags: ['가격', '전략', '낙찰'],
  },

  // 제안서 카테고리
  {
    id: 'proposal-executive-summary',
    name: '제안서 요약문',
    description: '제안서 Executive Summary를 작성합니다',
    category: 'proposal',
    icon: '📝',
    prompt: `다음 입찰에 대한 제안서 요약문(Executive Summary)을 작성해주세요:

**공고명**: {{title}}
**발주기관**: {{organization}}
**주요 요구사항**: {{requirements}}
**당사 강점**: {{strengths}}

요약문에 포함할 내용:
1. 사업 이해도 (발주기관 니즈 파악)
2. 솔루션 개요 (제안 핵심)
3. 차별화 포인트 (경쟁 우위)
4. 기대 효과 (정량적 성과)
5. 이행 역량 (실적, 전문성)

분량: 1페이지 내외
톤앤매너: 전문적이고 신뢰감 있게`,
    variables: [
      { name: 'title', description: '공고명', required: true },
      { name: 'organization', description: '발주기관', required: true },
      { name: 'requirements', description: '주요 요구사항', required: true },
      { name: 'strengths', description: '당사 강점', required: false },
    ],
    isSystem: true,
    tags: ['제안서', '요약', 'Executive Summary'],
  },
  {
    id: 'proposal-technical',
    name: '기술 제안서 목차',
    description: '기술 제안서 목차와 구성을 생성합니다',
    category: 'proposal',
    icon: '📑',
    prompt: `다음 입찰을 위한 기술 제안서 목차를 구성해주세요:

**공고명**: {{title}}
**사업 유형**: {{projectType}}
**주요 요구사항**: {{requirements}}
**페이지 제한**: {{pageLimit}}

목차 구성 원칙:
- 평가 항목별 배점 고려
- 발주기관 관심사 우선 배치
- 시각적 자료 활용 계획 포함

각 섹션별로 핵심 포인트와 예상 페이지 수를 함께 제시해주세요.`,
    variables: [
      { name: 'title', description: '공고명', required: true },
      { name: 'projectType', description: '사업 유형 (용역/물품/공사)', required: false, default: '용역' },
      { name: 'requirements', description: '주요 요구사항', required: true },
      { name: 'pageLimit', description: '페이지 제한', required: false, default: '50페이지' },
    ],
    isSystem: true,
    tags: ['제안서', '목차', '기술'],
  },

  // 매칭 카테고리
  {
    id: 'matching-product',
    name: '제품 매칭 분석',
    description: '공고에 적합한 제품을 매칭합니다',
    category: 'matching',
    icon: '🎯',
    prompt: `다음 공고에 적합한 제품을 분석해주세요:

**공고명**: {{title}}
**요구 사양**: {{specifications}}
**당사 제품군**: {{productList}}

분석 항목:
1. 요구사양 충족도 (%)
2. 매칭되는 제품 목록
3. 부족한 사양 (Gap 분석)
4. 보완 방안 (협력사, 대체품)
5. 최종 추천 제품 및 이유`,
    variables: [
      { name: 'title', description: '공고명', required: true },
      { name: 'specifications', description: '요구 사양', required: true },
      { name: 'productList', description: '당사 제품군', required: false },
    ],
    isSystem: true,
    tags: ['매칭', '제품', '사양'],
  },

  // 요약 카테고리
  {
    id: 'summary-quick',
    name: '빠른 요약',
    description: '공고 내용을 3줄로 요약합니다',
    category: 'summary',
    icon: '📋',
    prompt: `다음 공고를 3줄로 요약해주세요:

{{content}}

형식:
1. [핵심] 무엇을, 언제까지
2. [조건] 자격/제한 사항
3. [주의] 특이사항/리스크`,
    variables: [
      { name: 'content', description: '공고 내용', required: true },
    ],
    isSystem: true,
    tags: ['요약', '빠른', '3줄'],
  },
  {
    id: 'summary-detailed',
    name: '상세 요약',
    description: '공고 내용을 구조화하여 요약합니다',
    category: 'summary',
    icon: '📄',
    prompt: `다음 공고를 상세히 요약해주세요:

{{content}}

요약 구조:
## 기본 정보
- 공고명, 기관, 예산, 기한

## 사업 개요
- 목적, 범위, 기대효과

## 참가 자격
- 필수 조건, 우대 조건, 제한 사항

## 주요 일정
- 입찰, 낙찰, 계약, 납품

## 평가 기준
- 가격, 기술, 실적 배점

## 특이사항
- 주의할 점, 질의 필요 사항`,
    variables: [
      { name: 'content', description: '공고 내용', required: true },
    ],
    isSystem: true,
    tags: ['요약', '상세', '구조화'],
  },

  // 번역 카테고리
  {
    id: 'translation-to-english',
    name: '영문 번역',
    description: '공고 내용을 영어로 번역합니다',
    category: 'translation',
    icon: '🌐',
    prompt: `다음 내용을 영어로 번역해주세요:

{{content}}

번역 가이드라인:
- 전문 용어는 정확하게 번역
- 공식 문서에 적합한 톤
- 숫자, 날짜 형식은 국제 표준으로`,
    variables: [
      { name: 'content', description: '번역할 내용', required: true },
    ],
    isSystem: true,
    tags: ['번역', '영어', 'English'],
  },
  {
    id: 'translation-ted',
    name: 'TED 공고 번역',
    description: 'EU TED 공고를 한국어로 번역합니다',
    category: 'translation',
    icon: '🇪🇺',
    prompt: `다음 TED(EU 공공입찰) 공고를 한국어로 번역하고 분석해주세요:

{{content}}

번역 후 다음을 추가로 분석:
1. 한국 기업 참여 가능 여부
2. 주요 요구사항 (한국 기준 해석)
3. 인증/자격 요건
4. 참여 시 주의사항`,
    variables: [
      { name: 'content', description: 'TED 공고 내용 (영문)', required: true },
    ],
    isSystem: true,
    tags: ['번역', 'TED', 'EU', '한국어'],
  },
];

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 카테고리별 템플릿 필터링
 */
export function getTemplatesByCategory(category: PromptCategory): PromptTemplate[] {
  return SYSTEM_TEMPLATES.filter((t) => t.category === category);
}

/**
 * 템플릿 ID로 조회
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return SYSTEM_TEMPLATES.find((t) => t.id === id);
}

/**
 * 템플릿 검색
 */
export function searchTemplates(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase();
  return SYSTEM_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

const promptTemplates = {
  SYSTEM_TEMPLATES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  getTemplatesByCategory,
  getTemplateById,
  searchTemplates,
};

export default promptTemplates;
