---
name: security-review
description: "API 보안 및 입찰 데이터 보호 검토 - Rate Limiting, CSRF, RLS, OWASP Top 10"
allowed-tools: Read, Grep, Glob, Bash
---

# 보안 검토 스킬

> API 보안 및 입찰 데이터 보호 검토

## 트리거

- `/security` - 보안 검토 시작
- "보안", "security", "취약점" 키워드

## 검토 항목

### 1. API 보안
- [ ] Rate Limiting 적용
- [ ] CSRF 토큰 검증
- [ ] API Key 관리
- [ ] Input Validation (Zod)

### 2. 인증/인가
- [ ] Supabase Auth 설정
- [ ] RLS (Row Level Security)
- [ ] JWT 검증

### 3. 데이터 보호
- [ ] 민감정보 암호화
- [ ] .env 파일 보호
- [ ] Credential 관리

## 참조 파일

```
lib/security/auth-middleware.ts  # 인증 미들웨어
lib/security/rate-limiter.ts     # Rate Limiting
lib/security/csrf.ts             # CSRF 보호
lib/security/prompt-guard.ts     # Prompt Injection 방지
lib/validation/schemas.ts        # Zod 스키마
```

## 사용법

```
> /security audit
> /security check-env
> /security validate-api
```
