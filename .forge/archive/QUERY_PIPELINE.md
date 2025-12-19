# FORGE LABS Query Pipeline v2.0
# 병렬 실행 + 자가검수 최적화

## 실행 모드

### Mode A: 순차 실행 (기본)
```
ㄱ → QRY-N 구현 → 검수 → 완료 → ㄱ
```

### Mode B: 배치 실행 (권장)
```
"QRY-010~012 연속" → 3개 순차 구현 (한 턴)
```

### Mode C: 병렬 실행 (최대 효율)
```
"QRY-010~012 병렬" → 3개 동시 구현 (독립 레이어만)
```

---

## 병렬 실행 규칙

### 병렬 가능 조건
| 조건 | 설명 |
|------|------|
| 다른 앱 | HEPHAITOS, FOLIO, DRYON 간 병렬 OK |
| 독립 레이어 | L0/L1은 의존성 없으면 병렬 OK |
| 같은 앱 다른 기능 | 파일 충돌 없으면 OK |

### 병렬 불가 조건
| 조건 | 이유 |
|------|------|
| 같은 index.ts 수정 | 편집 충돌 |
| L2→L3 의존성 | L2 완료 후 L3 가능 |
| 타입 참조 | L0 완료 후 L1/L2 가능 |

---

## 자가검수 체크리스트

각 레이어 완료 시 자동 검수:

### L0 (Types) 검수
- [ ] 모든 타입에 export 키워드
- [ ] index.ts에 re-export 추가
- [ ] JSDoc 주석 존재

### L1 (Utils) 검수
- [ ] 순수 함수 (side-effect 없음)
- [ ] 타입 안전성 (any 금지)
- [ ] index.ts에 export 추가

### L2 (Repository) 검수
- [ ] 인터페이스 정의
- [ ] InMemory 구현체
- [ ] Factory 함수

### L3 (Agent) 검수
- [ ] 의존성 주입 패턴
- [ ] Config 타입 정의
- [ ] App index.ts에 export
- [ ] initialize 팩토리 함수

---

## 최적 병렬 구성

### 3개 앱 동시 작업 예시
```
┌─────────────┬─────────────┬─────────────┐
│ HEPHAITOS   │ FOLIO       │ DRYON       │
├─────────────┼─────────────┼─────────────┤
│ QRY-010     │ QRY-011     │ QRY-012     │
│ Risk Mgr   │ Promo Opt   │ Process Sch │
└─────────────┴─────────────┴─────────────┘
         ↓ 병렬 실행 (독립적)
```

### 레이어별 순차 내 병렬
```
L0 병렬: [010-L0] [011-L0] [012-L0]
    ↓ 완료 대기
L1 병렬: [010-L1] [011-L1] [012-L1]
    ↓ 완료 대기
L2 병렬: [010-L2] [011-L2] [012-L2]
    ↓ 완료 대기
L3 순차: [010-L3] → [011-L3] → [012-L3]
         (index.ts 충돌 방지)
```

---

## 트리거 명령어

| 명령 | 동작 |
|------|------|
| `ㄱ` | 다음 1개 쿼리 구현 |
| `ㄱㄱㄱ` | 다음 3개 쿼리 순차 구현 |
| `ㄱN` | 다음 N개 쿼리 순차 구현 |
| `QRY-XXX` | 특정 쿼리 구현 |
| `QRY-N~M` | N부터 M까지 순차 구현 |
| `QRY-N~M 병렬` | N부터 M까지 병렬 구현 |
| `상태` | 현재 진행 상태 표시 |
| `검수` | 현재까지 구현 검수 실행 |
| `다음` | 다음 쿼리 후보 표시 |

---

## 컨텍스트 유지 (Continuous Loop)

### SHARED_TASK_NOTES.md 패턴
```markdown
## 현재 진행 상황
- [x] QRY-001 ~ QRY-009 완료
- [ ] QRY-010 진행 중

## 다음 반복에서 할 일
- L3 에이전트 index.ts export 추가
- 검수 실행

## 발견된 이슈
- (자동 기록)
```

---

---

## 에러 처리

### Task 에이전트 오류
```
API Error: 404 {"model": "sonnet"}
→ 원인: 시스템 레벨 모델 설정 문제
→ 해결: 직접 도구(Glob, Grep, Read) 사용
→ 영향: 작업 수행에 영향 없음
```

### 컨텍스트 복구
```
1. CLAUDE.md 읽기
2. .forge/QUERY_PIPELINE.md 읽기
3. apps/*/src/agents/*.ts 스캔
4. 완료된 쿼리 식별
5. 상태 복구 완료
```

---

## Sources
- [Continuous Claude](https://github.com/AnandChowdhary/continuous-claude)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [ClaudeLog Agent Engineering](https://claudelog.com/mechanics/agent-engineering/)
- [Claude Opus 4.5 Guide](https://claudefa.st/blog/guide/performance/claude-opus-4-5-guide)
