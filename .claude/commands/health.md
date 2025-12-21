---
description: "시스템 상태 확인 - DB, 커넥터, API 헬스체크"
argument-hint: "[component: all|db|connectors|api]"
model: haiku
allowed-tools: Read, Bash
---

# /health - 시스템 상태 확인

## 사용법

```bash
# 전체 상태
/health

# 특정 컴포넌트
/health db
/health connectors
/health api
```

## 확인 항목

### 1. Database
```bash
# Supabase 연결 확인
curl -s http://localhost:3010/api/v1/health | jq '.checks.database'
```

### 2. Connectors
```bash
# 커넥터 상태
curl -s http://localhost:3010/api/v1/health | jq '.checks.connectors'
```

### 3. API
```bash
# API 응답 시간
time curl -s http://localhost:3010/api/v1/health > /dev/null
```

### 4. 환경 변수
```bash
# 필수 환경변수 확인 (값은 숨김)
echo "NEXT_PUBLIC_SUPABASE_URL: $([ -n \"$NEXT_PUBLIC_SUPABASE_URL\" ] && echo 'SET' || echo 'MISSING')"
echo "SUPABASE_SERVICE_ROLE_KEY: $([ -n \"$SUPABASE_SERVICE_ROLE_KEY\" ] && echo 'SET' || echo 'MISSING')"
echo "TED_API_KEY: $([ -n \"$TED_API_KEY\" ] && echo 'SET' || echo 'MISSING')"
echo "SAM_GOV_API_KEY: $([ -n \"$SAM_GOV_API_KEY\" ] && echo 'SET' || echo 'MISSING')"
```

## 출력 형식

```
🏥 BIDFLOW 시스템 상태

┌─────────────────────────────────────────┐
│ Component       │ Status │ Latency     │
├─────────────────────────────────────────┤
│ Database        │ ✅ UP  │ 45ms        │
│ TED Connector   │ ✅ UP  │ Last: 2h ago│
│ SAM Connector   │ ✅ UP  │ Last: 2h ago│
│ G2B Connector   │ ⚠️ STUB│ N/A         │
│ API             │ ✅ UP  │ 120ms       │
└─────────────────────────────────────────┘

📊 통계:
- 총 공고: 1,234건
- 오늘 수집: 45건
- 활성 매칭: 892건

🔧 환경변수: 4/4 설정됨
```

## 관련 파일

- `src/app/api/v1/health/route.ts` - Health API
