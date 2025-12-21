---
description: "외부 API 연동 및 테스트 - TED, SAM.gov, G2B API 상태 확인 및 데이터 조회"
argument-hint: "[test|fetch|status|config] [ted|sam|g2b] [options]"
model: sonnet
allowed-tools: Read, Bash, WebFetch
---

# /api 명령어

외부 API 연동 및 테스트

## 사용법

```
/api [subcommand] [target] [options]
```

## 서브커맨드

| 명령 | 설명 |
|------|------|
| `test` | API 연결 테스트 |
| `fetch` | 데이터 조회 |
| `status` | API 상태 확인 |
| `config` | API 설정 관리 |

## 지원 API

- `ted` - EU TED API
- `g2b` - 나라장터 API
- `sam` - SAM.gov API

## 예시

```bash
/api test ted
/api fetch g2b --keyword "계측기"
/api status --all
/api config set TED_API_KEY=xxx
```
