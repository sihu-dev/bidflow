---
description: "Opus 4.5 전문 코드 리뷰어 - 품질/보안/성능/UI/테스트 5개 카테고리 검수 (100점 만점)"
argument-hint: "[file_path] [--focus code|security|design|performance]"
model: opus
allowed-tools: Read, Grep, Glob, Bash, Task
---

# /review 명령어

Opus 4.5 전문 코드 리뷰어를 호출하여 종합 코드 검수를 실행합니다.

## 사용법

```
/review [options]
```

## 검수 범위

### A. 코드 품질 (30점)
- TypeScript strict mode (`any` 타입 금지)
- 함수형 프로그래밍 패턴
- 네이밍 컨벤션 (PascalCase, camelCase)
- 단일 책임 원칙

### B. 보안 (25점)
- 하드코딩된 API 키/비밀번호
- SQL/XSS/Command Injection
- API 인증 미들웨어
- Prompt Injection 방지

### C. 성능 (20점)
- React 불필요 리렌더링
- 이미지 최적화 (next/image)
- N+1 쿼리 방지
- 번들 사이즈

### D. UI/UX (15점)
- **모노크롬 디자인 시스템 준수**
  - Primary: #171717 (블랙)
  - 금지: indigo, purple, blue 등 컬러풀 색상
- 반응형 레이아웃
- 접근성 (ARIA)

### E. 테스트 (10점)
- 핵심 기능 커버리지
- 엣지 케이스 처리

## 검수 프로세스

```bash
# 1. 변경사항 파악
git diff --stat

# 2. 자동 검사
npm run typecheck
npm run lint

# 3. 상세 리뷰
# Opus 4.5 에이전트가 전체 코드 분석
```

## 결과 포맷

```
### 심각 (CRITICAL) - 반드시 수정
[파일: src/path/file.ts, 라인 45]
문제: 하드코딩된 API 키 발견
해결: 환경변수로 이동

### 경고 (WARNING) - 권장 수정
...

### 제안 (SUGGESTION) - 선택적 개선
...

### 점수
| 카테고리 | 점수 |
|---------|------|
| 코드 품질 | /30 |
| 보안 | /25 |
| 성능 | /20 |
| UI/UX | /15 |
| 테스트 | /10 |
| **총점** | **/100** |
```

## BIDFLOW 특수 규칙

1. **Handsontable**: SSR 비활성화 필수 (dynamic import)
2. **Supabase**: Row Level Security 확인
3. **API v1**: 버저닝 규칙 준수
4. **Zod**: 모든 입력 검증에 사용
5. **Repository 패턴**: DDD Lite 아키텍처 준수

## 실행

```bash
# 전체 리뷰
/review

# 특정 파일 리뷰
/review src/components/landing/Hero.tsx

# 보안 집중 리뷰
/review --focus security

# 디자인 시스템 검사
/review --focus design
```
