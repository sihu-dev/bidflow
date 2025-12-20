---
description: "V2 데이터 수집 실행 - TED/SAM.gov 공고 수집 및 DB 저장"
argument-hint: "[source: ted|sam_gov|all] [--from YYYY-MM-DD] [--to YYYY-MM-DD]"
model: sonnet
allowed-tools: Read, Grep, Bash, WebFetch
---

# /sync - 공고 수집 명령어

## 사용법

```bash
# 전체 소스 수집
/sync all

# 특정 소스만
/sync ted
/sync sam_gov

# 날짜 범위 지정
/sync ted --from 2025-01-01 --to 2025-01-31

# 최대 결과 수 제한
/sync all --max 100
```

## 실행 순서

1. **환경 확인**
   ```bash
   # API 키 확인 (값은 출력 안 함)
   [ -n "$TED_API_KEY" ] && echo "TED API: OK" || echo "TED API: Missing"
   [ -n "$SAM_GOV_API_KEY" ] && echo "SAM API: OK" || echo "SAM API: Missing"
   ```

2. **커넥터 상태 확인**
   ```bash
   # DB 연결 확인
   curl -s http://localhost:3010/api/v1/health | jq '.checks.database'
   ```

3. **수집 실행**
   ```bash
   # API Route 호출
   curl -X POST http://localhost:3010/api/v1/admin/ingest \
     -H "Content-Type: application/json" \
     -d '{"source": "$ARGUMENTS"}'
   ```

4. **결과 보고**
   - 수집된 공고 수
   - 신규/중복 현황
   - 에러 발생 시 상세

## 출력 형식

```
✅ 수집 완료

📊 결과:
- TED: 45건 수집 (신규 32건, 중복 13건)
- SAM: 28건 수집 (신규 25건, 중복 3건)
- 소요 시간: 12.3초

⚠️ 경고:
- TED Rate Limit 근접 (80/100)

📝 다음 단계:
→ /match 실행하여 매칭 시작
```

## 관련 파일

- `src/lib/connectors/` - 커넥터 구현
- `src/app/api/v1/admin/ingest/` - API Route
- `docs/api-samples/` - API 응답 샘플
