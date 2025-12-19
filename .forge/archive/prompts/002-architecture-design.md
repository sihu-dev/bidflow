# [QUERY-002] 아키텍처 설계 프롬프트

> 모듈/컴포넌트 설계 시 실행

---

## 입력 변수
- `{{MODULE_NAME}}`: 모듈명
- `{{LEVEL}}`: 나노 레벨 (0-5)
- `{{PARENT_MODULE}}`: 상위 모듈 (있는 경우)

---

## 프롬프트

```
당신은 FORGE LABS의 소프트웨어 아키텍트입니다.
다음 모듈을 SOLID 원칙에 따라 설계해주세요.

## 모듈: {{MODULE_NAME}}
## 레벨: L{{LEVEL}}
## 상위 모듈: {{PARENT_MODULE}}

### 설계 원칙 체크리스트

#### S - Single Responsibility (단일 책임)
□ 이 모듈의 단 하나의 책임은?
□ 변경 이유가 하나뿐인가?
□ 모듈명이 책임을 명확히 표현하는가?

#### O - Open/Closed (개방/폐쇄)
□ 확장에 열려있는가? (새 기능 추가 용이)
□ 수정에 닫혀있는가? (기존 코드 변경 최소화)
□ 추상화 포인트는 어디인가?

#### L - Liskov Substitution (리스코프 치환)
□ 인터페이스를 정의했는가?
□ 구현체가 인터페이스를 완전히 대체할 수 있는가?
□ 예외 케이스 처리가 일관적인가?

#### I - Interface Segregation (인터페이스 분리)
□ 인터페이스가 너무 크지 않은가?
□ 클라이언트가 사용하지 않는 메서드가 있는가?
□ 역할별로 인터페이스를 분리했는가?

#### D - Dependency Inversion (의존성 역전)
□ 고수준 모듈이 저수준 모듈에 의존하지 않는가?
□ 추상화에 의존하는가?
□ 의존성 주입을 사용하는가?

### 설계 산출물

#### 1. 타입 정의
```typescript
// {{MODULE_NAME}}.types.ts

/**
 * {{MODULE_NAME}} 설정 타입
 */
export interface {{MODULE_NAME}}Config {
  // 필수 설정
}

/**
 * {{MODULE_NAME}} 결과 타입
 */
export interface {{MODULE_NAME}}Result<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
  metadata: {
    timestamp: Date;
    duration_ms: number;
  };
}
```

#### 2. 인터페이스 정의
```typescript
// {{MODULE_NAME}}.interface.ts

export interface I{{MODULE_NAME}} {
  // 핵심 메서드만 정의
  execute(input: Input): Promise<Output>;
}
```

#### 3. 구현 클래스 스켈레톤
```typescript
// {{MODULE_NAME}}.ts

export class {{MODULE_NAME}} implements I{{MODULE_NAME}} {
  private config: {{MODULE_NAME}}Config;

  constructor(config: {{MODULE_NAME}}Config) {
    this.config = config;
  }

  async execute(input: Input): Promise<Output> {
    // 구현
  }
}
```

#### 4. 의존성 그래프
```
┌─────────────────┐
│   {{MODULE}}    │
└────────┬────────┘
         │ depends on
    ┌────┴────┐
    ▼         ▼
┌──────┐  ┌──────┐
│ Dep1 │  │ Dep2 │
└──────┘  └──────┘
```

#### 5. 데이터 흐름
```
[Input]
   │
   ▼
[Validate] → (invalid) → [Error]
   │
   ▼ (valid)
[Transform]
   │
   ▼
[Process]
   │
   ▼
[Output]
```

#### 6. 에러 처리 전략
| 에러 유형 | 코드 | 처리 방식 | 재시도 |
|----------|------|----------|--------|
| Validation | E001 | 즉시 반환 | No |
| Network | E002 | 재시도 후 실패 | Yes (3회) |
| Timeout | E003 | 타임아웃 에러 | Yes (2회) |
| Unknown | E999 | 로깅 후 전파 | No |

#### 7. 테스트 전략
```typescript
describe('{{MODULE_NAME}}', () => {
  describe('정상 케이스', () => {
    it('유효한 입력 → 성공 결과');
  });

  describe('경계 케이스', () => {
    it('빈 입력 → 빈 결과');
    it('최대 입력 → 처리 성공');
  });

  describe('에러 케이스', () => {
    it('잘못된 입력 → ValidationError');
    it('네트워크 실패 → NetworkError');
  });
});
```

### 출력
설계 결과를 `.forge/specs/arch/{{MODULE_NAME}}.md`로 저장
```
