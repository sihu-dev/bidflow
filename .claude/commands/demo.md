---
description: "CMNTech 5분 데모 모드 - 데모용 데이터 생성 및 시나리오 실행"
argument-hint: "[scenario: full|dashboard|matching|competitor]"
model: sonnet
allowed-tools: Read, Bash
---

# /demo - CMNTech 데모 모드

## 사용법

```bash
# 전체 데모 (5분)
/demo full

# 대시보드만
/demo dashboard

# 매칭 데모
/demo matching

# 경쟁사 분석 데모
/demo competitor
```

## 데모 시나리오

### 1. Full Demo (5분)

**스토리라인: 김영수 과장의 하루**

```
[00:00-01:00] 대시보드 진입
- "안녕하세요, 김영수 과장님!"
- 오늘의 알림: 12건
- 적합 공고: 8건 (85%+ 매칭)

[01:00-02:30] 공고 목록
- 소스별 현황: TED 45건, SAM 32건, G2B 70건
- 필터링: 70점 이상
- 정렬: 매칭 점수 순

[02:30-04:00] 공고 상세
- K-water 초음파 유량계 (92점)
- 매칭 분석:
  - 키워드: 95/100
  - 스펙: 20/25
  - 기관: 45/50
- 추천 제품: UR-1000PLUS

[04:00-05:00] 경쟁사 분석
- 시장 점유율: CMNTech 34%
- 예상 경쟁사: E+H, Siemens
- 전략 제안
```

### 2. Dashboard Demo

```bash
# 대시보드 데이터 확인
curl http://localhost:3010/api/v1/dashboard

# 오늘의 알림
curl http://localhost:3010/api/v1/alerts?today=true

# 추천 TOP 3
curl http://localhost:3010/api/v1/matches?action=BID&limit=3
```

### 3. Matching Demo

```bash
# 매칭 결과 조회
curl http://localhost:3010/api/v1/matches?tenant=cmntech

# 점수 분포
curl http://localhost:3010/api/v1/matches/stats
```

## 데모 데이터 생성

```bash
# G2B 스텁 데이터 10건 생성
/sync g2b_stub --count 10

# 매칭 실행
/match --tenant cmntech
```

## 주의사항

⚠️ **경쟁사 데이터 표시**
- 모든 경쟁사 분석은 "데모 데이터" 라벨 필수
- 실제 데이터 아님 명시

⚠️ **가격 정보**
- 예정가격은 참고용
- 투자 조언 아님 명시

## 출력 형식

```
🎬 BIDFLOW 데모 모드

시나리오: CMNTech 5분 데모
예상 시간: 5분

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/4] 대시보드 ✅
→ http://localhost:3010/dashboard

[2/4] 공고 목록 ✅
→ 147건 로드 완료

[3/4] 매칭 결과 ✅
→ BID 23건, REVIEW 89건

[4/4] 경쟁사 분석 ✅
→ 데모 데이터 표시됨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 데모 준비 완료!
브라우저에서 http://localhost:3010 접속
```

## 관련 파일

- `.forge/DEMO_SCRIPT_CMNTECH.md` - 데모 스크립트
- `src/lib/connectors/g2b-stub-connector.ts` - 스텁 데이터
