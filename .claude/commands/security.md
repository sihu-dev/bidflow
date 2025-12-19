# /security 명령어

보안 검토 및 취약점 분석

## 사용법

```
/security [subcommand] [options]
```

## 서브커맨드

| 명령 | 설명 |
|------|------|
| `audit` | 전체 보안 감사 |
| `check-env` | 환경변수 보안 검토 |
| `validate-api` | API 엔드포인트 검증 |
| `scan` | 취약점 스캔 |

## 검토 항목

1. **인증**: Supabase Auth, JWT
2. **인가**: RLS, API 권한
3. **입력 검증**: Zod 스키마
4. **Rate Limiting**: Upstash Redis
5. **CSRF**: 토큰 검증

## 예시

```bash
/security audit
/security check-env --strict
/security validate-api /api/v1/bids
/security scan --owasp-top10
```
