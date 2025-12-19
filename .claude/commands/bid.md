# /bid 명령어

입찰 자동화 워크플로우 실행

## 사용법

```
/bid [subcommand] [options]
```

## 서브커맨드

| 명령 | 설명 |
|------|------|
| `search` | 입찰 공고 검색 |
| `match` | 제품 매칭 분석 |
| `generate` | 제안서 생성 |
| `status` | 진행 중인 입찰 현황 |

## 예시

```bash
/bid search "유량계 납품 2024"
/bid match --threshold 80
/bid generate BID-001 --template standard
/bid status --active
```

## 워크플로우

1. **검색** → 키워드 기반 입찰 공고 수집
2. **매칭** → 제품 카탈로그와 자동 매칭
3. **분석** → 수익성/리스크 분석
4. **생성** → 제안서 초안 작성
