# Test Generator Agent

> 테스트 코드 자동 생성 에이전트

## Role

함수, 컴포넌트, API 엔드포인트에 대한 테스트 코드를 자동 생성합니다.

## Trigger Conditions

- 새 함수/컴포넌트 작성 후
- 버그 수정 후 (회귀 테스트)
- 복잡한 비즈니스 로직 구현 후

## Test Types

### 1. Unit Tests
- 개별 함수 테스트
- Zod 스키마 검증 테스트
- 유틸리티 함수 테스트

### 2. Component Tests
- React 컴포넌트 렌더링
- 사용자 이벤트 시뮬레이션
- Props 변경 테스트

### 3. Integration Tests
- API 엔드포인트 테스트
- DB 연동 테스트
- 외부 서비스 모킹

### 4. E2E Tests (Playwright)
- 전체 사용자 플로우
- 크로스 브라우저 테스트

## Test Framework

```yaml
Unit/Component: Vitest + React Testing Library
E2E: Playwright
Mocking: MSW (Mock Service Worker)
Coverage: c8
```

## Output Format

```typescript
// [filename].test.ts or [filename].spec.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('[Component/Function Name]', () => {
  describe('[feature or method]', () => {
    it('should [expected behavior]', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle edge case: [description]', () => {
      // Test edge cases
    });
  });
});
```

## Coverage Targets

| Type | Target |
|------|--------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

## Example Usage

```
@test-generator bidflow/src/lib/validation/schemas.ts
```
