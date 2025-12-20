# BIDFLOW 스프레드시트 테스트 시나리오

> 작성일: 2024-12-20
> 목적: 모든 스프레드시트 기능 로직 검증

---

## 1. 테스트 대상 모듈

### 1.1 Core Libraries
| 모듈 | 파일 | 테스트 유형 |
|------|------|-------------|
| Column Definitions | `lib/spreadsheet/column-definitions.ts` | Unit |
| Formula Engine | `lib/spreadsheet/formula-engine.ts` | Unit |
| Excel Export | `lib/spreadsheet/excel-export.ts` | Unit + Integration |
| Prompt Engine | `lib/prompts/engine.ts` | Unit |
| Prompt Templates | `lib/prompts/templates.ts` | Unit |

### 1.2 Components
| 컴포넌트 | 파일 | 테스트 유형 |
|----------|------|-------------|
| SpreadsheetView | `components/spreadsheet/SpreadsheetView.tsx` | Integration |
| Toolbar | `components/spreadsheet/Toolbar.tsx` | Unit + Integration |
| SidePanel | `components/spreadsheet/SidePanel.tsx` | Unit |
| FormulaBar | `components/spreadsheet/FormulaBar.tsx` | Unit |
| PromptLibrary | `components/prompts/PromptLibrary.tsx` | Integration |

---

## 2. 유닛 테스트 시나리오

### 2.1 Column Definitions (`column-definitions.test.ts`)

#### calculateDDay()
```typescript
describe('calculateDDay', () => {
  it('오늘 마감인 경우 D-Day 반환', () => {
    const today = new Date();
    expect(calculateDDay(today)).toBe('D-Day');
  });

  it('3일 후 마감인 경우 D-3 반환', () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    expect(calculateDDay(future)).toBe('D-3');
  });

  it('2일 전 마감인 경우 D+2 반환', () => {
    const past = new Date();
    past.setDate(past.getDate() - 2);
    expect(calculateDDay(past)).toBe('D+2');
  });

  it('문자열 날짜 처리', () => {
    const dateStr = '2025-12-25';
    expect(calculateDDay(dateStr)).toMatch(/^D[+-]?\d+$|^D-Day$/);
  });
});
```

#### formatAmount()
```typescript
describe('formatAmount', () => {
  it('억 단위 포맷팅 (1억 이상)', () => {
    expect(formatAmount(450000000)).toBe('4.5억');
  });

  it('만 단위 포맷팅 (1만 이상)', () => {
    expect(formatAmount(50000)).toBe('5만');
  });

  it('천 단위 이하는 로케일 포맷', () => {
    expect(formatAmount(9999)).toBe('9,999');
  });

  it('null 값 처리', () => {
    expect(formatAmount(null)).toBe('-');
  });
});
```

#### 상수 검증
```typescript
describe('상수 정의', () => {
  it('STATUS_LABELS에 모든 상태 포함', () => {
    expect(STATUS_LABELS).toHaveProperty('new');
    expect(STATUS_LABELS).toHaveProperty('reviewing');
    expect(STATUS_LABELS).toHaveProperty('won');
  });

  it('BID_COLUMNS 필수 컬럼 포함', () => {
    const keys = BID_COLUMNS.map(c => c.data);
    expect(keys).toContain('title');
    expect(keys).toContain('status');
    expect(keys).toContain('deadline');
  });
});
```

---

### 2.2 Formula Engine (`formula-engine.test.ts`)

#### validateFormula()
```typescript
describe('validateFormula', () => {
  it('유효한 수식 검증', () => {
    expect(validateFormula('=SUM(A1:A10)')).toEqual({ valid: true });
    expect(validateFormula('=IF(A1>0,"양수","음수")')).toEqual({ valid: true });
  });

  it('일반 값은 항상 유효', () => {
    expect(validateFormula('Hello')).toEqual({ valid: true });
    expect(validateFormula('12345')).toEqual({ valid: true });
  });

  it('잘못된 수식 감지', () => {
    const result = validateFormula('=INVALID_FUNC()');
    expect(result.valid).toBe(false);
  });
});
```

#### isAIFormula()
```typescript
describe('isAIFormula', () => {
  it('AI 함수 인식', () => {
    expect(isAIFormula('=AI_SUMMARY()')).toBe(true);
    expect(isAIFormula('=AI_SCORE()')).toBe(true);
    expect(isAIFormula('=AI_EXTRACT("납품기한")')).toBe(true);
  });

  it('일반 수식은 false', () => {
    expect(isAIFormula('=SUM(A1:A10)')).toBe(false);
    expect(isAIFormula('Hello')).toBe(false);
  });
});
```

#### parseAIFormula()
```typescript
describe('parseAIFormula', () => {
  it('함수명과 인자 파싱', () => {
    expect(parseAIFormula('=AI_EXTRACT("납품기한")')).toEqual({
      name: 'AI_EXTRACT',
      args: ['납품기한'],
    });
  });

  it('인자 없는 함수', () => {
    expect(parseAIFormula('=AI_SUMMARY()')).toEqual({
      name: 'AI_SUMMARY',
      args: [],
    });
  });

  it('잘못된 형식은 null', () => {
    expect(parseAIFormula('Hello')).toBe(null);
    expect(parseAIFormula('=INVALID')).toBe(null);
  });
});
```

---

### 2.3 Prompt Engine (`prompt-engine.test.ts`)

#### interpolate()
```typescript
describe('interpolate', () => {
  it('기본 변수 치환', () => {
    const template = '{{title}} 입찰 분석';
    const context = { title: '서울시 유량계 구매' };

    const result = interpolate(template, context);
    expect(result.prompt).toBe('서울시 유량계 구매 입찰 분석');
    expect(result.success).toBe(true);
  });

  it('기본값 적용', () => {
    const template = '{{missing|기본값}} 테스트';
    const result = interpolate(template, {});
    expect(result.prompt).toBe('기본값 테스트');
  });

  it('누락된 필수 변수 감지', () => {
    const template = '{{required}} 분석';
    const variables = [{ name: 'required', required: true }];

    const result = interpolate(template, {}, variables);
    expect(result.success).toBe(false);
    expect(result.missingVariables).toContain('required');
  });

  it('금액 자동 포맷팅', () => {
    const template = '추정가: {{estimatedAmount}}';
    const context = { estimatedAmount: 450000000 };

    const result = interpolate(template, context);
    expect(result.prompt).toContain('억원');
  });
});
```

#### extractVariables()
```typescript
describe('extractVariables', () => {
  it('변수 목록 추출', () => {
    const template = '{{title}} by {{organization}} - {{deadline}}';
    expect(extractVariables(template)).toEqual(['title', 'organization', 'deadline']);
  });

  it('중복 변수 제거', () => {
    const template = '{{title}} and {{title}}';
    expect(extractVariables(template)).toEqual(['title']);
  });
});
```

#### createBidContext()
```typescript
describe('createBidContext', () => {
  it('입찰 데이터를 컨텍스트로 변환', () => {
    const bid = {
      id: '1',
      title: '테스트 공고',
      organization: '테스트 기관',
      estimated_amount: 100000000,
      keywords: ['유량계', '계측기'],
    };

    const ctx = createBidContext(bid);
    expect(ctx.title).toBe('테스트 공고');
    expect(ctx.estimatedAmount).toBe(100000000);
    expect(ctx.keywords).toBe('유량계, 계측기');
  });
});
```

---

### 2.4 Excel Export (`excel-export.test.ts`)

#### exportToCSV()
```typescript
describe('exportToCSV', () => {
  it('상태값 한글 변환', () => {
    // CSV 출력에서 'new' -> '신규' 변환 확인
  });

  it('키워드 배열을 세미콜론으로 구분', () => {
    // ['a', 'b'] -> 'a; b'
  });

  it('특수문자 이스케이프', () => {
    // 쉼표, 따옴표 포함 문자열 처리
  });

  it('UTF-8 BOM 포함', () => {
    // 한글 Excel 호환
  });
});
```

#### exportToJSON()
```typescript
describe('exportToJSON', () => {
  it('JSON 포맷 정확성', () => {
    // 원본 데이터 그대로 유지
  });
});
```

---

## 3. 통합 테스트 시나리오

### 3.1 스프레드시트 워크플로우

#### 시나리오 1: 데이터 로드 및 표시
```
1. 초기 데이터 5건 로드
2. Handsontable 렌더링 확인
3. 각 셀 렌더러 정상 작동 (상태 배지, 금액 포맷 등)
4. 정렬/필터 UI 표시
```

#### 시나리오 2: 셀 편집 및 저장
```
1. 제목 셀 더블클릭하여 편집 모드
2. 값 변경 후 Enter
3. onBidUpdate 콜백 호출 확인
4. 변경사항 Supabase 동기화 (Mock)
```

#### 시나리오 3: 필터 적용
```
1. Toolbar 필터 버튼 클릭
2. 상태: '검토중' 선택
3. 필터된 데이터만 표시
4. 필터 초기화
```

#### 시나리오 4: 내보내기
```
1. 내보내기 > Excel 선택
2. .xlsx 파일 다운로드
3. 파일 열어서 데이터 정확성 검증
4. 헤더 스타일 및 고정 확인
```

### 3.2 AI 프롬프트 워크플로우

#### 시나리오 5: 템플릿 선택 및 실행
```
1. AI 템플릿 버튼 클릭
2. PromptLibrary Sheet 열림
3. '기본 공고 분석' 템플릿 선택
4. 변수 입력 폼 표시
5. 실행 -> API 호출
```

#### 시나리오 6: 변수 자동 채우기
```
1. 입찰 행 선택
2. AI 템플릿 열기
3. 선택된 입찰 정보가 컨텍스트로 자동 전달
4. {{title}}, {{organization}} 자동 치환
```

---

## 4. 엣지 케이스 테스트

### 4.1 데이터 엣지 케이스
```typescript
describe('Edge Cases', () => {
  it('빈 데이터 처리', () => {
    // initialData = []
  });

  it('대용량 데이터 (1000건)', () => {
    // 성능 및 가상화 확인
  });

  it('null/undefined 필드 처리', () => {
    // estimated_amount: null
    // ai_summary: undefined
  });

  it('특수문자 포함 데이터', () => {
    // title: "테스트 <script> & 'quote'"
  });

  it('매우 긴 텍스트', () => {
    // title: 500자 이상
  });
});
```

### 4.2 사용자 인터랙션 엣지 케이스
```typescript
describe('User Interaction Edge Cases', () => {
  it('빠른 연속 클릭', () => {
    // 새로고침 버튼 연타
  });

  it('편집 중 ESC 키', () => {
    // 변경 취소
  });

  it('동시 편집 시도', () => {
    // 여러 셀 동시 편집 시도
  });
});
```

---

## 5. 테스트 실행 계획

### Phase 1: 유닛 테스트
```bash
npm run test -- src/__tests__/lib/
```

### Phase 2: 컴포넌트 테스트
```bash
npm run test -- src/__tests__/components/
```

### Phase 3: 통합 테스트
```bash
npm run test -- src/__tests__/integration/
```

### Phase 4: 전체 테스트 + 커버리지
```bash
npm run test -- --coverage
```

---

## 6. 테스트 파일 구조

```
src/__tests__/
├── TEST_SCENARIOS.md          # 이 문서
├── setup.ts                   # 테스트 환경 설정
├── lib/
│   ├── column-definitions.test.ts
│   ├── formula-engine.test.ts
│   ├── excel-export.test.ts
│   └── prompt-engine.test.ts
├── components/
│   ├── Toolbar.test.tsx
│   ├── SidePanel.test.tsx
│   └── FormulaBar.test.tsx
└── integration/
    └── spreadsheet-workflow.test.ts
```

---

*테스트 시나리오 v1.0*
