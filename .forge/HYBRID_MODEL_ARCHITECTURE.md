# BIDFLOW 하이브리드 모델 아키텍처

> **목적**: 비용 최적화 + 성능 극대화
> **작성일**: 2025-12-20
> **상태**: 설계 완료

---

## 1. 모델 배치 전략

```
┌─────────────────────────────────────────────────────────────┐
│                    BIDFLOW 하이브리드 엔진                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │         Orchestrator (비즈니스 로직)                  │  │
│   └──────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│          ┌───────────┴───────────┐                         │
│          ▼                       ▼                         │
│   ┌──────────────┐       ┌───────────────┐                │
│   │  Simple API  │       │  Agent Tasks  │                │
│   │   (Gemini)   │       │   (Claude)    │                │
│   └──────────────┘       └───────────────┘                │
│          │                       │                         │
│   ┌──────┴──────┐         ┌──────┴──────┐                 │
│   │ gemini-2.0  │         │ claude-3.5  │                 │
│   │ flash-exp   │         │   sonnet    │                 │
│   └─────────────┘         └─────────────┘                 │
│                                                             │
│   예상 비용: $0.001/1K tokens      $0.003/1K tokens         │
│   속도: ~200ms                    ~500ms                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 모델별 역할 분담

### 2.1 Gemini (간단한 API 작업)

| 작업 | 모델 | 비용 | 용도 |
|------|------|------|------|
| 텍스트 요약 | `gemini-2.0-flash-exp` | $0.001/1K | 공고 요약 |
| 키워드 추출 | `gemini-2.0-flash-exp` | $0.001/1K | 태그 자동 생성 |
| 번역 | `gemini-2.0-flash-exp` | $0.001/1K | 다국어 변환 |
| 분류 | `gemini-2.0-flash-exp` | $0.001/1K | 카테고리 분류 |
| 간단한 Q&A | `gemini-2.0-flash-exp` | $0.001/1K | 단순 질의응답 |

```typescript
// src/lib/models/gemini-client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

export async function summarize(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const result = await model.generateContent(`
    다음 입찰 공고를 3문장으로 요약하세요:
    ${text}
  `);
  return result.response.text();
}

export async function extractKeywords(text: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const result = await model.generateContent(`
    다음 텍스트에서 핵심 키워드 5개를 추출하세요. JSON 배열로 반환:
    ${text}
  `);
  return JSON.parse(result.response.text());
}

export async function classify(text: string, categories: string[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const result = await model.generateContent(`
    다음 텍스트를 분류하세요. 카테고리: ${categories.join(', ')}
    텍스트: ${text}
    카테고리만 반환:
  `);
  return result.response.text().trim();
}
```

### 2.2 Claude (복잡한 에이전트 작업)

| 작업 | 모델 | 비용 | 용도 |
|------|------|------|------|
| 워크플로우 조율 | `claude-3.5-sonnet` | $0.003/1K | 오케스트레이터 |
| 제안서 생성 | `claude-3.5-sonnet` | $0.003/1K | 장문 생성 |
| 복합 분석 | `claude-3.5-sonnet` | $0.003/1K | 다단계 추론 |
| 의사결정 | `claude-opus-4-5` | $0.015/1K | 핵심 판단 |

```typescript
// src/lib/models/claude-client.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function analyzeComplex(context: AnalysisContext): Promise<Analysis> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `
        입찰 공고 분석:
        - 공고: ${context.bidTitle}
        - 요구사항: ${context.requirements}
        - 자사 제품: ${context.products}

        분석 항목:
        1. 기술 적합성
        2. 가격 경쟁력
        3. 리스크 요인
        4. 권장 사항
      `
    }]
  });
  return parseAnalysis(response.content[0].text);
}

export async function generateProposal(bid: Bid, company: Company): Promise<Proposal> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `
        다음 입찰에 대한 제안서를 작성하세요:

        ## 공고 정보
        ${JSON.stringify(bid, null, 2)}

        ## 회사 정보
        ${JSON.stringify(company, null, 2)}

        ## 작성 형식
        1. Executive Summary
        2. 기술 제안
        3. 가격 제안
        4. 이행 일정
      `
    }]
  });
  return parseProposal(response.content[0].text);
}
```

---

## 3. 라우팅 로직

```typescript
// src/lib/models/router.ts

type TaskType =
  | 'summarize'
  | 'extract_keywords'
  | 'translate'
  | 'classify'
  | 'simple_qa'
  | 'analyze'
  | 'generate_proposal'
  | 'orchestrate'
  | 'decision';

const GEMINI_TASKS: TaskType[] = [
  'summarize',
  'extract_keywords',
  'translate',
  'classify',
  'simple_qa'
];

const CLAUDE_TASKS: TaskType[] = [
  'analyze',
  'generate_proposal',
  'orchestrate',
  'decision'
];

export function routeTask(taskType: TaskType): 'gemini' | 'claude' {
  if (GEMINI_TASKS.includes(taskType)) {
    return 'gemini';
  }
  return 'claude';
}

export async function executeTask<T>(
  taskType: TaskType,
  input: unknown
): Promise<T> {
  const provider = routeTask(taskType);

  if (provider === 'gemini') {
    return executeGeminiTask<T>(taskType, input);
  } else {
    return executeClaudeTask<T>(taskType, input);
  }
}
```

---

## 4. 비용 추정

### 4.1 월간 사용량 (중소기업 기준)

| 작업 | 건수/월 | 토큰/건 | 모델 | 비용 |
|------|--------|--------|------|------|
| 공고 요약 | 1,000 | 500 | Gemini | $0.50 |
| 키워드 추출 | 1,000 | 200 | Gemini | $0.20 |
| 분류 | 1,000 | 100 | Gemini | $0.10 |
| 번역 | 200 | 1,000 | Gemini | $0.20 |
| 복합 분석 | 100 | 2,000 | Claude | $0.60 |
| 제안서 생성 | 20 | 5,000 | Claude | $0.30 |
| **합계** | | | | **$1.90/월** |

### 4.2 비용 절감 효과

```
기존 (Claude 단독): ~$15/월
하이브리드:         ~$2/월
절감율:             87%
```

---

## 5. 구현 로드맵

### Phase 1: Gemini 통합 (1주)
- [ ] Google AI SDK 설치
- [ ] Gemini 클라이언트 구현
- [ ] 요약/키워드/분류 API

### Phase 2: Claude 에이전트 (1주)
- [ ] Anthropic SDK 설정
- [ ] 분석/생성 에이전트
- [ ] 오케스트레이터 통합

### Phase 3: 라우터 통합 (1주)
- [ ] 태스크 라우터 구현
- [ ] 폴백 메커니즘
- [ ] 비용 모니터링

---

## 6. 환경 변수

```env
# Google AI (Gemini)
GOOGLE_AI_KEY=AIza...

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# 모델 설정
GEMINI_MODEL=gemini-2.0-flash-exp
CLAUDE_MODEL=claude-sonnet-4-20250514
CLAUDE_OPUS_MODEL=claude-opus-4-5-20251101
```

---

*하이브리드 모델 아키텍처 v1.0*
*2025-12-20*
