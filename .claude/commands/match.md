---
description: "V2 매칭 엔진 실행 - 175점 시스템으로 공고-제품 매칭"
argument-hint: "[--tenant TENANT_ID] [--threshold 70]"
model: sonnet
allowed-tools: Read, Grep, Bash
---

# /match - 매칭 실행 명령어

## 사용법

```bash
# 전체 테넌트 매칭
/match

# 특정 테넌트만
/match --tenant cmntech

# 점수 임계값 설정
/match --threshold 80

# 최근 공고만
/match --since 24h
```

## 175점 매칭 시스템

### 점수 구성

| 영역 | 배점 | 비율 |
|------|------|------|
| **키워드 점수** | 100점 | 57% |
| ├─ Primary | 60점 | |
| ├─ Secondary | 25점 | |
| └─ Specs | 15점 | |
| **스펙 점수** | 25점 | 14% |
| ├─ 구경 범위 | 10점 | |
| ├─ 정확도 | 8점 | |
| └─ 통신 프로토콜 | 7점 | |
| **기관 점수** | 50점 | 29% |
| ├─ 거래 이력 | 25점 | |
| ├─ 선호도 | 15점 | |
| └─ 기관 규모 | 10점 | |

### 액션 결정

| 점수 | 액션 | 설명 |
|------|------|------|
| 120+ | **BID** | 적극 참여 권장 |
| 70-119 | **REVIEW** | 검토 후 결정 |
| <70 | **SKIP** | 건너뛰기 권장 |

## 실행 순서

1. **미처리 공고 조회**
   ```sql
   SELECT * FROM bids
   WHERE status = 'active'
   AND created_at > NOW() - INTERVAL '24 hours'
   ```

2. **테넌트별 제품 로드**
   ```sql
   SELECT * FROM products WHERE is_active = true
   ```

3. **매칭 실행**
   - 각 공고 × 각 제품 조합
   - EnhancedMatcher 사용
   - 결과 DB 저장

4. **결과 보고**

## 출력 형식

```
✅ 매칭 완료

📊 결과:
- 처리된 공고: 73건
- 생성된 매칭: 156건
  - BID 권장: 23건
  - REVIEW 필요: 89건
  - SKIP: 44건

🎯 TOP 5 매칭:
1. [92점] K-water 초음파 유량계 → UR-1000PLUS
2. [88점] Hamburg Wasserwerke → UR-1000PLUS
3. [85점] US Army Corps → MF-1000C
...

📝 다음 단계:
→ 대시보드에서 결과 확인
→ BID 권장 공고 제안서 작성
```

## 관련 파일

- `src/lib/matching/enhanced-matcher.ts` - 매칭 엔진
- `src/lib/matching/matching-pipeline.ts` - 파이프라인
- `src/app/api/v1/admin/match/` - API Route
