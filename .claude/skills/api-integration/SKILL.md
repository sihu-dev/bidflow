# API 통합 스킬

> 외부 입찰 플랫폼 API 연동

## 트리거

- `/api` - API 통합 작업
- "TED", "나라장터", "G2B", "SAM" 키워드

## 지원 API

### 1. 나라장터 (G2B)
```typescript
// 조달청 공공데이터 API
baseUrl: "https://apis.data.go.kr/1230000"
endpoints:
  - /BidPublicInfoService  # 입찰공고
  - /ContractInfoService   # 계약정보
```

### 2. TED (EU)
```typescript
// Tenders Electronic Daily
baseUrl: "https://ted.europa.eu/api"
format: XML/JSON
auth: API Key
```

### 3. SAM.gov (US)
```typescript
// System for Award Management
baseUrl: "https://api.sam.gov"
auth: API Key + Entity ID
```

## 클라이언트 구조

```
lib/clients/
├── ted-client.ts       # EU 입찰
├── g2b-client.ts       # 나라장터
├── sam-client.ts       # 미국 연방
└── base-client.ts      # 공통 HTTP 클라이언트
```

## 사용법

```
> /api test ted
> /api fetch g2b --keyword "유량계"
> /api status
```
