# BIDFLOW 입찰 자동화 규칙

## 프로젝트 개요
- 제조업 SME를 위한 입찰 자동화 시스템
- TED API, 나라장터, SAM.gov 연동

## 보안 (CRITICAL)
- API 인증 미들웨어 필수
- Rate Limiting 적용
- CSRF 보호 활성화
- Prompt Injection 방지

## 데이터 소스
- TED (EU 공공입찰)
- 나라장터 (G2B) - 한국
- SAM.gov - 미국

## 기술 스택
- Next.js 15 + TypeScript
- Supabase (PostgreSQL)
- Upstash Redis (Rate Limiting)
- Branded Types 사용

## Repository 패턴
- DDD Lite 아키텍처
- Zod 입력 검증 필수
- API v1 버저닝
