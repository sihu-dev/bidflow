# 🔧 관리자 모델 설정 수정 요청서

**작성일**: 2025-12-19
**우선순위**: 높음
**영향 범위**: Task 에이전트 전체

---

## 문제 현상

```
API Error: 404
{
  "type": "error",
  "error": {
    "type": "not_found_error",
    "message": "model: sonnet"
  }
}
```

Task 에이전트 실행 시 `sonnet` 모델을 찾을 수 없음

---

## 근본 원인

1. Task tool 기본 모델이 `sonnet`으로 설정됨
2. 현재 API에서 `sonnet` 모델 ID가 등록되지 않음
3. 올바른 모델 ID: `claude-sonnet-4-20250514` 또는 유사

---

## 수정 필요 위치

### Option 1: Claude Code 전역 설정
```
%APPDATA%\Claude\config.json
또는
~/.claude/config.json
```

```json
{
  "agents": {
    "defaultModel": "claude-sonnet-4-20250514",
    "models": {
      "sonnet": "claude-sonnet-4-20250514",
      "opus": "claude-opus-4-5-20251101",
      "haiku": "claude-haiku-4-20250310"
    }
  }
}
```

### Option 2: 프로젝트 설정 (.claude/settings.local.json)
```json
{
  "agents": {
    "defaultModel": "opus",
    "modelMapping": {
      "sonnet": "claude-sonnet-4-20250514",
      "opus": "claude-opus-4-5-20251101",
      "haiku": "claude-haiku-4-20250310"
    }
  }
}
```

### Option 3: API 키 권한 확인
- Anthropic Console에서 API 키가 모든 모델에 접근 가능한지 확인
- `claude-sonnet-4-*` 모델 접근 권한 필요

---

## 임시 해결책 (현재 적용 중)

Task 에이전트 대신 직접 도구 사용:
- `Glob` + `Grep` + `Read` 조합으로 탐색
- `WebSearch` + `WebFetch`로 조사
- 병렬 Task 대신 순차 실행

---

## 확인 방법

```bash
# Claude Code 버전 확인
claude --version

# 사용 가능 모델 확인
claude models list

# 설정 파일 위치 확인
claude config path
```

---

## 요청 사항

1. [ ] 모델 매핑 설정 추가
2. [ ] API 키 권한 확인
3. [ ] Task 에이전트 테스트 실행

---

## 테스트 명령

수정 후 아래 명령으로 테스트:

```
Task tool 호출:
- subagent_type: "Explore"
- model: "sonnet" (또는 기본값)
- prompt: "List files in current directory"
```

성공 시 파일 목록 반환, 실패 시 동일 오류

---

**작성자**: Claude Opus 4.5
**참조**: [Claude Code Agent Engineering](https://claudelog.com/mechanics/agent-engineering/)
