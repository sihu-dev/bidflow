---
name: code-review
description: "Opus 4.5 종합 코드 검수 - 품질/보안/성능/UI/테스트 5개 카테고리 (100점 만점)"
allowed-tools: Read, Grep, Glob, Bash, Task
---

# Opus 4.5 코드 리뷰 스킬

> Claude Opus 4.5를 활용한 종합 코드 검수

## 트리거

- `/review` - 코드 리뷰 시작
- "리뷰", "검수", "코드 검사" 키워드

## 사용 에이전트

**opus-reviewer** (model: opus)
- 위치: `.claude/agents/opus-reviewer.md`
- 역할: 전문 코드 리뷰어

## 검수 체크리스트

### A. 코드 품질 (30점)
- [ ] TypeScript strict mode (`any` 금지)
- [ ] 함수형 프로그래밍 패턴
- [ ] 네이밍 컨벤션 준수
- [ ] 단일 책임 원칙

### B. 보안 (25점)
- [ ] 하드코딩된 시크릿 없음
- [ ] Injection 취약점 없음
- [ ] API 인증 적용

### C. 성능 (20점)
- [ ] 불필요한 리렌더링 방지
- [ ] 이미지 최적화
- [ ] N+1 쿼리 방지

### D. UI/UX (15점)
- [ ] **모노크롬 디자인 시스템 준수**
  - Primary: #171717 (블랙)
  - 금지 색상: indigo, purple, blue, green, red, yellow 등
- [ ] 반응형 레이아웃

### E. 테스트 (10점)
- [ ] 핵심 기능 테스트
- [ ] 엣지 케이스 처리

## 자동 호출 조건

이 스킬은 다음 상황에서 자동 호출됩니다:

1. **코드 작성 완료 후**
   - 주요 컴포넌트 구현
   - API 엔드포인트 추가

2. **커밋 전**
   - PreCommit 훅에서 호출

3. **PR 머지 전**
   - 최종 검수

## 사용법

```bash
# 전체 리뷰
/review

# 특정 파일
/review src/components/landing/Hero.tsx

# 집중 검사
/review --focus security
/review --focus design
/review --focus performance
```

## 참조 파일

```
.claude/agents/opus-reviewer.md     # 리뷰어 에이전트
.claude/scripts/code-quality-check.py  # 자동 품질 검사
.claude/settings.json               # 훅 설정
```

## 결과 형식

총점 100점 만점으로 평가:
- 80점 이상: 통과
- 60-79점: 조건부 통과 (경고 수정 권장)
- 60점 미만: 수정 필요
