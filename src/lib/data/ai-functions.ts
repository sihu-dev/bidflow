/**
 * AI 스마트 함수 정의
 * 랜딩 페이지 데모용 AI 함수 목록
 */

export interface AIFunction {
  name: string;
  syntax: string;
  description: string;
  example: string;
  output: string;
  icon: 'FileText' | 'TrendingUp' | 'Target' | 'Tag' | 'Clock' | 'MessageSquare';
  category: 'analysis' | 'extraction' | 'matching';
}

export const AI_SMART_FUNCTIONS: AIFunction[] = [
  {
    name: 'AI_SUMMARY',
    syntax: '=AI_SUMMARY()',
    description: '입찰 공고를 2-3문장으로 자동 요약',
    example: '=AI_SUMMARY()',
    output: '서울시 상수도사업본부에서 발주한 초음파유량계 구매 입찰입니다.',
    icon: 'FileText',
    category: 'analysis',
  },
  {
    name: 'AI_SCORE',
    syntax: '=AI_SCORE()',
    description: '낙찰 가능성 점수 예측 (0-100%)',
    example: '=AI_SCORE()',
    output: '92',
    icon: 'TrendingUp',
    category: 'analysis',
  },
  {
    name: 'AI_MATCH',
    syntax: '=AI_MATCH()',
    description: '가장 적합한 제품명 자동 추천',
    example: '=AI_MATCH()',
    output: 'UR-1000PLUS',
    icon: 'Target',
    category: 'matching',
  },
  {
    name: 'AI_KEYWORDS',
    syntax: '=AI_KEYWORDS()',
    description: '핵심 키워드 3개 자동 추출',
    example: '=AI_KEYWORDS()',
    output: '초음파, 상수도, 유량계',
    icon: 'Tag',
    category: 'extraction',
  },
  {
    name: 'AI_DEADLINE',
    syntax: '=AI_DEADLINE()',
    description: '마감일 분석 및 권장 액션 제안',
    example: '=AI_DEADLINE()',
    output: 'D-7 - 검토 완료 권장',
    icon: 'Clock',
    category: 'analysis',
  },
];

/**
 * 추가 AI 함수 (향후 확장용)
 */
export const AI_EXTENDED_FUNCTIONS: AIFunction[] = [
  {
    name: 'AI_RISK',
    syntax: '=AI_RISK()',
    description: '입찰 리스크 분석',
    example: '=AI_RISK()',
    output: '중간 - 경쟁 입찰 예상',
    icon: 'MessageSquare',
    category: 'analysis',
  },
  {
    name: 'AI_PROPOSAL',
    syntax: '=AI_PROPOSAL()',
    description: '제안서 초안 생성',
    example: '=AI_PROPOSAL()',
    output: '[제안서 템플릿 생성됨]',
    icon: 'FileText',
    category: 'analysis',
  },
];

/**
 * 카테고리별 함수 필터링
 */
export function getFunctionsByCategory(category: AIFunction['category']): AIFunction[] {
  return AI_SMART_FUNCTIONS.filter((f) => f.category === category);
}

/**
 * 함수명으로 조회
 */
export function getAIFunction(name: string): AIFunction | undefined {
  return AI_SMART_FUNCTIONS.find((f) => f.name === name);
}
