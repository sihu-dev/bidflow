# [QUERY-003] 구현 프롬프트

> 실제 코드 작성 시 실행

---

## 입력 변수
- `{{COMPONENT_NAME}}`: 컴포넌트명
- `{{LEVEL}}`: 나노 레벨 (0-5)
- `{{SPEC_FILE}}`: 스펙 파일 경로

---

## 프롬프트

```
당신은 FORGE LABS의 시니어 개발자입니다.
다음 스펙에 따라 코드를 구현해주세요.

## 컴포넌트: {{COMPONENT_NAME}}
## 레벨: L{{LEVEL}}
## 스펙: {{SPEC_FILE}}

### 구현 가이드라인

#### 코드 스타일
- TypeScript strict mode
- ESLint + Prettier 준수
- 함수형 우선, 필요시 클래스
- 불변성 (immutable) 우선

#### 네이밍 컨벤션
| 유형 | 규칙 | 예시 |
|------|------|------|
| 파일 | kebab-case | `user-service.ts` |
| 클래스 | PascalCase | `UserService` |
| 함수 | camelCase | `getUserById` |
| 상수 | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| 타입 | PascalCase | `UserProfile` |
| 인터페이스 | I + PascalCase | `IUserService` |

#### 레벨별 구현 패턴

##### L0 (Atoms) - 타입/상수
```typescript
// ✅ Good
export type UserId = string;
export const MAX_RETRIES = 3;

// ❌ Bad
export type userId = string; // lowercase
export let maxRetries = 3; // mutable
```

##### L1 (Molecules) - 유틸 함수
```typescript
// ✅ Good - 순수 함수
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency }).format(amount);
}

// ❌ Bad - 부작용 있음
let lastResult: string;
export function formatCurrency(amount: number): string {
  lastResult = `$${amount}`;
  return lastResult;
}
```

##### L2 (Cells) - 서비스
```typescript
// ✅ Good - 의존성 주입
export class UserService {
  constructor(
    private readonly repository: IUserRepository,
    private readonly logger: ILogger
  ) {}
}

// ❌ Bad - 하드코딩 의존성
export class UserService {
  private repository = new UserRepository();
}
```

##### L3 (Tissues) - 에이전트
```typescript
// ✅ Good - 구성 가능
export class AnalysisAgent {
  constructor(private config: AgentConfig) {}

  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    const validated = this.validate(input);
    const processed = await this.process(validated);
    return this.format(processed);
  }
}
```

#### 에러 처리
```typescript
// 커스텀 에러 클래스
export class ForgeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ForgeError';
  }
}

// 사용
throw new ForgeError('User not found', 'USER_NOT_FOUND', { userId });
```

#### 로깅
```typescript
// 구조화된 로깅
logger.info('Operation completed', {
  operation: 'userFetch',
  userId,
  duration: Date.now() - startTime,
});
```

### 구현 체크리스트

#### 필수
- [ ] TypeScript 타입 정의 완료
- [ ] JSDoc 주석 작성
- [ ] 에러 처리 구현
- [ ] 단위 테스트 작성

#### 권장
- [ ] 통합 테스트 작성
- [ ] 성능 테스트 (필요시)
- [ ] 사용 예제 작성

### 테스트 템플릿

```typescript
// {{COMPONENT_NAME}}.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';

describe('{{COMPONENT_NAME}}', () => {
  let sut: {{COMPONENT_NAME}}; // System Under Test

  beforeEach(() => {
    sut = new {{COMPONENT_NAME}}(/* mocks */);
  });

  describe('핵심 기능', () => {
    it('정상 입력에 대해 올바른 결과를 반환한다', async () => {
      // Arrange
      const input = { /* ... */ };

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({ /* ... */ });
    });
  });

  describe('에러 케이스', () => {
    it('잘못된 입력에 대해 ValidationError를 던진다', async () => {
      // Arrange
      const invalidInput = { /* ... */ };

      // Act & Assert
      await expect(sut.execute(invalidInput))
        .rejects.toThrow('ValidationError');
    });
  });
});
```

### 출력
- 구현 코드: `{적절한 경로}`
- 테스트 코드: `{적절한 경로}.test.ts`
- 타입 정의: `{적절한 경로}.types.ts` (필요시)
```
