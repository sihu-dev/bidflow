# [QUERY-004] 검증 프롬프트

> 구현 완료 후 품질 검증 시 실행

---

## 입력 변수
- `{{COMPONENT_NAME}}`: 컴포넌트명
- `{{LEVEL}}`: 나노 레벨 (0-5)
- `{{SOURCE_FILES}}`: 검증 대상 파일들

---

## 프롬프트

```
당신은 FORGE LABS의 QA 엔지니어입니다.
다음 구현물을 검증해주세요.

## 컴포넌트: {{COMPONENT_NAME}}
## 레벨: L{{LEVEL}}
## 대상 파일: {{SOURCE_FILES}}

### 검증 체크리스트

#### 1. 코드 품질 (Code Quality)

##### 타입 안전성
- [ ] TypeScript strict mode 통과
- [ ] any 타입 사용 없음
- [ ] 모든 함수에 반환 타입 명시
- [ ] null/undefined 적절히 처리

##### 네이밍 컨벤션
- [ ] 파일명: kebab-case
- [ ] 클래스: PascalCase
- [ ] 함수/변수: camelCase
- [ ] 상수: UPPER_SNAKE_CASE
- [ ] 인터페이스: I + PascalCase

##### 코드 스타일
- [ ] ESLint 경고 없음
- [ ] Prettier 포맷팅 적용
- [ ] 미사용 import 없음
- [ ] 중복 코드 없음

#### 2. 설계 원칙 (Design Principles)

##### SOLID 준수
- [ ] SRP: 단일 책임 원칙
- [ ] OCP: 개방/폐쇄 원칙
- [ ] LSP: 리스코프 치환 원칙
- [ ] ISP: 인터페이스 분리 원칙
- [ ] DIP: 의존성 역전 원칙

##### 의존성 검사
- [ ] 순환 의존성 없음
- [ ] 상위 레벨이 하위 레벨만 참조
- [ ] 외부 의존성 최소화

#### 3. 기능 검증 (Functional Verification)

##### 정상 케이스
- [ ] 주요 기능 정상 작동
- [ ] 예상 출력 일치
- [ ] 성능 기준 충족

##### 경계 케이스
- [ ] 빈 입력 처리
- [ ] 최대값 입력 처리
- [ ] 특수 문자 입력 처리

##### 에러 케이스
- [ ] 잘못된 입력 거부
- [ ] 적절한 에러 메시지
- [ ] 에러 복구 가능

#### 4. 테스트 커버리지 (Test Coverage)

##### 단위 테스트
- [ ] 모든 public 메서드 테스트
- [ ] 커버리지 80% 이상
- [ ] 모킹 적절히 사용

##### 통합 테스트 (L2 이상)
- [ ] 의존성 간 연동 테스트
- [ ] 실제 환경 시뮬레이션

#### 5. 문서화 (Documentation)

##### 코드 문서
- [ ] JSDoc 주석 완료
- [ ] 복잡한 로직 설명
- [ ] 사용 예제 포함

##### API 문서 (L4)
- [ ] 엔드포인트 명세
- [ ] 요청/응답 스키마
- [ ] 에러 코드 목록

### 검증 결과 템플릿

```yaml
verification:
  component: "{{COMPONENT_NAME}}"
  level: L{{LEVEL}}
  timestamp: "{{TIMESTAMP}}"

  scores:
    code_quality: 0/100
    design_principles: 0/100
    functional: 0/100
    test_coverage: 0/100
    documentation: 0/100
    total: 0/100

  issues:
    critical: []
    major: []
    minor: []

  recommendations: []

  verdict: "PASS | FAIL | CONDITIONAL"
```

### 점수 기준

| 등급 | 점수 | 조건 |
|------|------|------|
| S | 95-100 | 모든 항목 통과, 베스트 프랙티스 |
| A | 85-94 | Critical 0, Major 1개 이하 |
| B | 75-84 | Critical 0, Major 3개 이하 |
| C | 65-74 | Critical 1개 이하 |
| F | 0-64 | Critical 2개 이상 또는 주요 기능 불량 |

### 이슈 분류

| 유형 | 설명 | 예시 |
|------|------|------|
| Critical | 즉시 수정 필요 | 보안 취약점, 데이터 손실 위험 |
| Major | 배포 전 수정 | 기능 버그, 성능 이슈 |
| Minor | 개선 권장 | 코드 스타일, 문서 부족 |

### 출력
검증 결과를 `.forge/reports/{{COMPONENT_NAME}}-verification.yaml`로 저장
```

