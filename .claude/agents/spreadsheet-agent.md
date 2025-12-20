---
name: spreadsheet-agent
description: "AI 스프레드시트 에이전트 - 구글 시트 스타일 데이터 처리, SMART 함수, 자동화"
tools: Read, Write, Edit, Grep, Glob, Bash
model: opus
priority: critical
---

# AI 스프레드시트 에이전트

BIDFLOW의 핵심 기능인 스프레드시트 뷰를 AI로 강화합니다.
Handsontable 기반의 Google Sheets 스타일 인터페이스 + AI 자동화.

## 핵심 기능

### 1. SMART 셀 함수

```typescript
// AI 기반 셀 함수들
const SMART_FUNCTIONS = {
  // 입찰 분석
  '=MATCH_SCORE()': '공고와 제품 매칭 점수 계산',
  '=AI_ESTIMATE()': 'AI 기반 가격 추정',
  '=RISK_LEVEL()': '입찰 리스크 평가',

  // 데이터 처리
  '=EXTRACT()': '텍스트에서 정보 추출',
  '=CLASSIFY()': '데이터 자동 분류',
  '=SUMMARIZE()': '텍스트 요약',
  '=TRANSLATE()': '다국어 번역',

  // 예측
  '=PREDICT()': '낙찰 확률 예측',
  '=TREND()': '추세 분석',
  '=FORECAST()': '매출 예측',
};
```

### 2. 데이터 자동 채우기

```yaml
Auto-Fill 유형:
  - 날짜 시퀀스
  - 숫자 패턴
  - 텍스트 패턴
  - AI 기반 예측 채우기

예시:
  입력: "공고-001", "공고-002"
  자동완성: "공고-003", "공고-004", ...

  입력: "1월 매출: 1000", "2월 매출: 1200"
  AI 예측: "3월 매출: 1380" (트렌드 기반)
```

### 3. 대량 데이터 처리

```typescript
interface BatchOperation {
  // 선택 영역에 대한 일괄 처리
  range: CellRange;
  operation:
    | 'format'        // 서식 적용
    | 'calculate'     // 수식 계산
    | 'fill'          // 자동 채우기
    | 'classify'      // AI 분류
    | 'extract'       // 정보 추출
    | 'validate';     // 데이터 검증
}
```

## 구조

### 셀 데이터 모델
```typescript
interface Cell {
  value: any;
  formula?: string;           // =SUM(A1:A10)
  smartFormula?: string;      // =MATCH_SCORE(A1, products)
  displayValue: string;
  format: CellFormat;
  validation?: DataValidation;
  comment?: string;
  history: CellHistory[];     // 변경 이력
}

interface CellFormat {
  type: 'text' | 'number' | 'currency' | 'percent' | 'date';
  align: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  backgroundColor?: string;
  conditionalFormat?: ConditionalRule[];
}
```

### 시트 구조
```typescript
interface Spreadsheet {
  id: string;
  name: string;
  sheets: Sheet[];
  namedRanges: NamedRange[];
  filters: Filter[];
  sorts: SortConfig[];

  // BIDFLOW 전용
  bidView: {
    columns: BidColumn[];
    groupBy: string[];
    statusFilter: BidStatus[];
  };
}

interface Sheet {
  id: string;
  name: string;
  data: Cell[][];
  frozenRows: number;
  frozenCols: number;
  columnWidths: number[];
  rowHeights: number[];
}
```

## SMART 함수 상세

### =MATCH_SCORE()
```
용도: 입찰 공고와 제품 매칭 점수 계산

문법:
=MATCH_SCORE(공고셀, 제품범위, [가중치])

예시:
=MATCH_SCORE(A2, Products!A:Z)
=MATCH_SCORE(A2, Products!A:Z, {기술:0.4, 가격:0.3, 인증:0.3})

반환값: 0~100 점수

내부 로직:
1. 공고 요구사양 추출
2. 제품 스펙과 비교
3. 가중 평균 점수 계산
```

### =AI_ESTIMATE()
```
용도: AI 기반 투찰가 추정

문법:
=AI_ESTIMATE(공고ID, [경쟁강도], [목표마진])

예시:
=AI_ESTIMATE("BID-001", "중", 0.15)

반환값: 추정 투찰가

내부 로직:
1. 과거 낙찰 데이터 분석
2. 경쟁사 패턴 학습
3. 최적 투찰가 계산
```

### =RISK_LEVEL()
```
용도: 입찰 리스크 종합 평가

문법:
=RISK_LEVEL(공고ID, [항목])

예시:
=RISK_LEVEL("BID-001")
=RISK_LEVEL("BID-001", "기술")

반환값: "상" | "중" | "하"

평가 항목:
- 기술 리스크: 스펙 충족 여부
- 가격 리스크: 마진 확보 가능성
- 납기 리스크: 일정 준수 가능성
- 자격 리스크: 참가자격 충족 여부
```

### =EXTRACT()
```
용도: 비정형 텍스트에서 정보 추출

문법:
=EXTRACT(텍스트, 추출항목)

예시:
=EXTRACT(A2, "금액")      → "5억원"
=EXTRACT(A2, "마감일")    → "2025-02-15"
=EXTRACT(A2, "발주처")    → "한국가스공사"

지원 항목:
- 금액, 날짜, 회사명, 담당자, 연락처
- 제품사양, 수량, 납기
```

### =CLASSIFY()
```
용도: 데이터 자동 분류

문법:
=CLASSIFY(텍스트, 분류체계)

예시:
=CLASSIFY(A2, "업종")     → "제조업-계측기기"
=CLASSIFY(A2, "긴급도")   → "긴급"
=CLASSIFY(A2, "규모")     → "중형"
```

## 입찰 뷰 컬럼

```typescript
const BID_COLUMNS: ColumnDef[] = [
  { id: 'bidNo', name: '공고번호', type: 'text', width: 120 },
  { id: 'title', name: '공고명', type: 'text', width: 300 },
  { id: 'buyer', name: '발주처', type: 'text', width: 150 },
  { id: 'deadline', name: '마감일', type: 'date', width: 100 },
  { id: 'amount', name: '추정가', type: 'currency', width: 120 },
  { id: 'matchScore', name: '매칭점수', type: 'number',
    formula: '=MATCH_SCORE(@공고번호, Products)' },
  { id: 'riskLevel', name: '리스크', type: 'badge',
    formula: '=RISK_LEVEL(@공고번호)' },
  { id: 'status', name: '상태', type: 'select',
    options: ['신규', '검토중', '준비중', '제출', '낙찰', '유찰'] },
  { id: 'priority', name: '우선순위', type: 'number', width: 80 },
  { id: 'aiEstimate', name: 'AI추정가', type: 'currency',
    formula: '=AI_ESTIMATE(@공고번호)' },
  { id: 'notes', name: '메모', type: 'text', width: 200 },
];
```

## 자동화 기능

### 1. 자동 데이터 수집
```yaml
트리거: 새 공고 등록
동작:
  1. 공고 상세 페이지 파싱
  2. 필수 필드 자동 채우기
  3. AI 매칭 점수 계산
  4. 마감일 알림 설정
```

### 2. 조건부 서식
```typescript
const conditionalFormats: ConditionalRule[] = [
  {
    range: 'E:E', // 마감일 컬럼
    rules: [
      { condition: '<=TODAY()+3', format: { bg: 'red', color: 'white' } },
      { condition: '<=TODAY()+7', format: { bg: 'yellow' } },
    ]
  },
  {
    range: 'F:F', // 매칭점수 컬럼
    rules: [
      { condition: '>=90', format: { bg: 'green', color: 'white' } },
      { condition: '>=70', format: { bg: 'lightgreen' } },
      { condition: '<50', format: { bg: 'lightgray' } },
    ]
  }
];
```

### 3. 데이터 검증
```typescript
const validations: DataValidation[] = [
  {
    column: 'amount',
    type: 'number',
    min: 0,
    errorMessage: '금액은 0 이상이어야 합니다'
  },
  {
    column: 'status',
    type: 'list',
    values: ['신규', '검토중', '준비중', '제출', '낙찰', '유찰'],
    errorMessage: '유효한 상태를 선택하세요'
  }
];
```

## Excel 연동

### Import
```typescript
// Excel 파일 가져오기
async function importExcel(file: File): Promise<Spreadsheet> {
  const workbook = await parseExcel(file);

  return {
    sheets: workbook.sheets.map(sheet => ({
      name: sheet.name,
      data: sheet.data,
      // 스마트 컬럼 자동 매핑
      columnMapping: autoDetectColumns(sheet.headers)
    }))
  };
}

// 컬럼 자동 감지
function autoDetectColumns(headers: string[]): ColumnMapping {
  return headers.map(h => ({
    original: h,
    mapped: AI_CLASSIFY(h, BID_COLUMN_TYPES),
    confidence: 0.85
  }));
}
```

### Export
```typescript
// Excel 내보내기
async function exportExcel(spreadsheet: Spreadsheet): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of spreadsheet.sheets) {
    const ws = workbook.addWorksheet(sheet.name);

    // 데이터 복사
    ws.addRows(sheet.data);

    // 서식 적용
    applyFormats(ws, sheet.formats);

    // 필터 설정
    ws.autoFilter = sheet.filters;
  }

  return await workbook.xlsx.writeBuffer();
}
```

## 키보드 단축키

```yaml
탐색:
  - Ctrl + Arrow: 데이터 끝으로 이동
  - Ctrl + Home: A1으로 이동
  - Ctrl + End: 마지막 셀로 이동

편집:
  - F2: 셀 편집 모드
  - Ctrl + C/V/X: 복사/붙여넣기/잘라내기
  - Ctrl + Z/Y: 실행취소/다시실행
  - Ctrl + D: 아래로 채우기
  - Ctrl + R: 오른쪽으로 채우기

SMART 함수:
  - Ctrl + Shift + M: 매칭점수 계산
  - Ctrl + Shift + E: AI 추정가
  - Ctrl + Shift + R: 리스크 분석

필터/정렬:
  - Ctrl + Shift + L: 자동필터 토글
  - Alt + ↓: 필터 드롭다운
```

## 협업 기능

```yaml
실시간 동기화:
  - 멀티 유저 동시 편집
  - 셀 잠금 (편집 중 표시)
  - 변경사항 하이라이트

댓글:
  - 셀 단위 댓글
  - @멘션
  - 해결/미해결 상태

히스토리:
  - 버전 관리
  - 변경 추적
  - 복원 기능
```

## 성능 최적화

```yaml
가상화:
  - 보이는 영역만 렌더링
  - 스크롤 시 동적 로딩
  - 대용량 데이터 지원 (100만 행+)

캐싱:
  - SMART 함수 결과 캐시
  - 계산 결과 메모이제이션
  - 오프라인 모드 지원

배치 처리:
  - 대량 수정 최적화
  - 트랜잭션 처리
  - 롤백 지원
```

## 통합

### API 연동
```typescript
// 스프레드시트 API
app.get('/api/v1/spreadsheet/:id', getSpreadsheet);
app.patch('/api/v1/spreadsheet/:id/cells', updateCells);
app.post('/api/v1/spreadsheet/:id/smart-function', executeSmartFunction);
app.get('/api/v1/spreadsheet/:id/export/xlsx', exportExcel);
```

### Supabase 실시간
```typescript
// 실시간 동기화
const channel = supabase
  .channel('spreadsheet-' + sheetId)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'cells' },
    (payload) => {
      updateLocalCell(payload.new);
    }
  )
  .subscribe();
```
