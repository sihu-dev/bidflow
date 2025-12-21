# BIDFLOW AI 스프레드시트 아키텍처

> **작성일**: 2025-12-21
> **목표**: 구글 시트 100% 기능 + AI 네이티브 입찰 자동화
> **권장 스택**: Univer (Apache-2.0) 또는 Handsontable + HyperFormula

---

## 핵심 AI 함수

### 1. =AI_SCORE() - 입찰 적합도 점수
```typescript
=AI_SCORE(공고ID, 회사ID?)
```
- **출력**: 0-100 점수 + 근거 설명
- **모델**: Claude Sonnet 4.5
- **예상 시간**: 2-5초

### 2. =AI_MATCH() - 제품 매칭
```typescript
=AI_MATCH(공고ID, 제품DB?)
```
- **출력**: 매칭률 % + 추천 제품 목록
- **예시**: "UR-1000PLUS (92%), MF-1000C (78%)"

### 3. =AI_SUMMARY() - 공고 요약
```typescript
=AI_SUMMARY(공고ID_또는_URL)
```
- **출력**: 구조화된 요약 (발주처, 예산, 납기, 요구사항)
- **모델**: GPT-4o-mini (빠른 응답)

### 4. =AI_RECOMMEND() - 액션 추천
```typescript
=AI_RECOMMEND(공고ID, 목표?)
```
- **출력**: 입찰 참여 여부, 적정 가격대, 전략
- **모델**: Claude Opus (복잡한 추론)

### 5. =AI_EXTRACT() - 데이터 추출
```typescript
=AI_EXTRACT(PDF_URL, "필드명")
```
- **출력**: 추출된 값 (마감일, 예산, 자격요건 등)
- **모델**: GPT-4 Vision (PDF 처리)

---

## 우선순위 로드맵

### Phase 1: P0 작업 (1주)
- [ ] FormulaBar 통합 (SpreadsheetView에 추가)
- [ ] AI_SCORE 함수 구현 (HyperFormula CustomFunction)
- [ ] AI_SUMMARY 함수 구현
- [ ] Toolbar 필터 연동 (FiltersPlugin API)

### Phase 2: P1 작업 (2주)
- [ ] AI_MATCH 함수 구현
- [ ] AI_EXTRACT 함수 구현
- [ ] 셀 포맷팅 (볼드, 색상)
- [ ] 함수 자동완성

### Phase 3: P2 작업 (4주)
- [ ] Univer 마이그레이션 (선택)
- [ ] 실시간 협업 (Supabase Realtime)
- [ ] 댓글 시스템
- [ ] 버전 히스토리

---

## 기술 스택 비교

| 항목 | Handsontable (현재) | Univer (추천) |
|------|---------------------|---------------|
| 라이선스 | $999/dev/년 | 무료 (Apache-2.0) |
| 수식 엔진 | HyperFormula (395함수) | 자체 (500+함수) |
| 실시간 협업 | 커스텀 구현 필요 | 내장 (OT 알고리즘) |
| 성능 (10만행) | 메모리 高 | 최적화됨 |
| AI 확장성 | CustomFunction | 플러그인 아키텍처 |
| 총점 | 69.5점 | 88.5점 |

---

## AI 함수 구현 예시

### HyperFormula 커스텀 함수 (현재 스택)
```typescript
// formula-engine.ts
import { FunctionPlugin, ArgumentTypes } from 'hyperformula';

class AIFunctionPlugin extends FunctionPlugin {
  static implementedFunctions = {
    'AI_SCORE': { method: 'aiScore' },
    'AI_SUMMARY': { method: 'aiSummary' },
    'AI_MATCH': { method: 'aiMatch' },
  };

  aiScore = {
    method: 'aiScore',
    parameters: [{ argumentType: ArgumentTypes.STRING }],
    description: '입찰 적합도 점수 (0-100)',
  };

  // 비동기 실행
  aiScore(ast, state) {
    const bidId = this.evaluateAst(ast.args[0], state);
    // AI API 호출
    return this.callAIAPI('score', bidId);
  }

  private async callAIAPI(type: string, input: string) {
    const response = await fetch('/api/v1/ai/' + type, {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
    return response.json();
  }
}
```

### Univer 플러그인 (권장)
```typescript
// BidflowAIPlugin.ts
import { Disposable, ICommandService } from '@univerjs/core';

export class BidflowAIPlugin extends Disposable {
  static pluginName = 'bidflow-ai';

  constructor(@ICommandService private _commandService: ICommandService) {
    super();
    this._registerFunctions();
  }

  private _registerFunctions() {
    // AI_SCORE 함수 등록
    this._commandService.registerCommand({
      id: 'formula.ai_score',
      handler: async (accessor, params) => {
        const { bidId } = params;
        const result = await this._callAI('score', bidId);
        return result.score;
      }
    });
  }
}
```

---

## API 엔드포인트

### /api/v1/ai/score
```typescript
POST /api/v1/ai/score
{
  "bidId": "UUID",
  "companyId": "UUID" // optional
}

Response:
{
  "score": 85,
  "confidence": 0.92,
  "factors": [
    { "name": "요구사항 충족도", "score": 90, "weight": 0.4 },
    { "name": "가격 경쟁력", "score": 75, "weight": 0.3 },
    { "name": "과거 수주 이력", "score": 88, "weight": 0.3 }
  ],
  "recommendation": "입찰 참여 권장"
}
```

### /api/v1/ai/summary
```typescript
POST /api/v1/ai/summary
{
  "bidId": "UUID",
  "url": "https://..." // optional
}

Response:
{
  "title": "유량계 구매",
  "buyer": "한국전력공사",
  "budget": 50000000,
  "deadline": "2025-01-15",
  "requirements": ["유량측정 정밀도 0.5%", "내압 10MPa"],
  "summary": "한전 화력발전소 유량계 교체 공고..."
}
```

---

## 벤치마크 목표

| 지표 | 목표 | 참고 |
|------|------|------|
| 첫 시도 정확도 | 85%+ | Rows.com 89% |
| 응답 시간 | 3초 이내 | 실시간 UX |
| 동적 갱신율 | 70%+ | 데이터 변경 시 자동 반영 |
| 10만 행 처리 | 크래시 없음 | Univer 2백만 수식 처리 |

---

## 가격 모델 (제안)

| 플랜 | 월 AI 호출 | 가격 |
|------|------------|------|
| 무료 | 500 | $0 |
| 스타트업 | 5,000 | $29 |
| 비즈니스 | 무제한 | $99 |

---

## 다음 단계

1. **즉시**: AI_SCORE API 엔드포인트 구현
2. **1주 내**: FormulaBar 통합 + AI 함수 UI
3. **2주 내**: Univer POC 및 마이그레이션 결정
4. **1개월**: 전체 AI 함수 구현

---

*이 문서는 에이전트 분석 결과를 바탕으로 작성되었습니다.*
