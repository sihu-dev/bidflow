---
name: bid-automation
description: "제조업 SME 입찰 프로세스 자동화 - 공고 수집, AI 매칭, 제안서 생성"
allowed-tools: Read, Grep, Glob, Bash, WebFetch
---

# 입찰 자동화 스킬

> 제조업 SME를 위한 입찰 프로세스 자동화

## 트리거

- `/bid` - 입찰 자동화 워크플로우 시작
- "입찰", "bid", "나라장터", "TED" 키워드

## 핵심 기능

### 1. 입찰 공고 수집
```typescript
// 데이터 소스
- 나라장터 (G2B)
- TED (EU 공공입찰)
- SAM.gov (미국)
- 조달청 API
```

### 2. AI 매칭
```typescript
// 제품 카탈로그 기반 자동 매칭
interface BidMatch {
  bidId: string;
  matchScore: number;  // 0-100
  matchedProducts: Product[];
  estimatedValue: number;
}
```

### 3. 자동 문서 생성
- 입찰 제안서 초안
- 가격 견적서
- 기술 사양서

## 사용 예시

```
> /bid search "유량계 납품"
> /bid match --threshold 80
> /bid generate-proposal BID-2024-001
```

## 관련 파일

- `.forge/BID_AUTOMATION_SPEC.md`
- `bidflow/src/lib/clients/` - API 클라이언트
- `bidflow/src/lib/domain/` - 비즈니스 로직
