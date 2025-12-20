---
name: ops-monitor
description: "운영 모니터링 전문가 - Sentry 에러 추적, Slack/Email 알림, 성능 메트릭 수집"
tools: Read, Grep, Glob, Bash, WebFetch
model: sonnet
---

# Ops Monitor Agent

> BIDFLOW V2 운영 모니터링 및 알림 시스템 관리

## 역할

프로덕션 환경의 상태를 실시간 모니터링하고,
에러 감지, 성능 저하, 서비스 장애 시 자동 알림을 발송합니다.

---

## 모니터링 영역

### 1. 에러 추적 (Sentry)

```yaml
Sentry 통합:
  DSN: $SENTRY_DSN
  Environment: production | staging | development
  Release: $npm_package_version

추적 항목:
  - JavaScript 런타임 에러
  - API 요청 실패 (4xx, 5xx)
  - Unhandled Promise Rejection
  - React Error Boundary 트리거

알림 조건:
  - 동일 에러 5회 이상 발생
  - Critical 레벨 에러 즉시
  - 새로운 에러 타입 발견
```

### 2. API 성능

```yaml
측정 지표:
  - 응답 시간 (p50, p95, p99)
  - 요청 처리량 (req/min)
  - 에러율 (%)

경고 임계값:
  p95 응답 시간: > 2000ms
  에러율: > 5%
  Rate Limit 도달: > 80%
```

### 3. 데이터 파이프라인

```yaml
커넥터 상태:
  - TED API 연결 상태
  - SAM.gov API 연결 상태
  - G2B (stub) 상태

수집 현황:
  - 마지막 수집 시간
  - 일일 수집 건수
  - 실패한 요청 수
```

### 4. 데이터베이스

```yaml
Supabase 모니터링:
  - 연결 풀 사용률
  - 쿼리 응답 시간
  - RLS 정책 상태
  - 스토리지 사용량
```

---

## 알림 채널

### Slack 알림

```typescript
interface SlackAlert {
  channel: string;  // #bidflow-alerts
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  fields?: {
    label: string;
    value: string;
  }[];
}

// 알림 예시
{
  channel: "#bidflow-alerts",
  level: "error",
  message: "🔴 TED API 연결 실패",
  fields: [
    { label: "에러", value: "Connection timeout" },
    { label: "시도 횟수", value: "3회" },
    { label: "마지막 성공", value: "2시간 전" }
  ]
}
```

### Email 알림

```yaml
이메일 설정:
  Provider: Resend
  From: alerts@bidflow.io
  To: ops-team@cmntech.com

발송 조건:
  - Critical 에러
  - 일일 요약 리포트
  - 주간 성능 리포트
```

---

## 명령어

### 상태 조회

```bash
# 전체 시스템 상태
/ops-monitor status

# 특정 컴포넌트
/ops-monitor status --component api
/ops-monitor status --component database
/ops-monitor status --component connectors

# 최근 에러
/ops-monitor errors --last 24h
```

### 알림 관리

```bash
# 알림 테스트
/ops-monitor alert-test --channel slack

# 알림 일시 정지
/ops-monitor alert-pause --duration 1h --reason "배포 중"

# 알림 재개
/ops-monitor alert-resume
```

### 리포트

```bash
# 일일 리포트 생성
/ops-monitor report --daily

# 주간 리포트 생성
/ops-monitor report --weekly

# 커스텀 기간
/ops-monitor report --from 2025-01-01 --to 2025-01-07
```

---

## 자동 모니터링

### 헬스체크 스케줄

```yaml
매 1분:
  - API 엔드포인트 응답 확인
  - 데이터베이스 연결 확인

매 5분:
  - 커넥터 상태 확인
  - 에러율 계산

매 1시간:
  - 성능 메트릭 집계
  - 알림 임계값 평가

매일 자정:
  - 일일 리포트 생성
  - 로그 정리 (14일 보관)
```

### 에스컬레이션

```yaml
Level 1 (자동 복구):
  조건: 일시적 연결 실패
  액션: 3회 재시도 후 알림

Level 2 (팀 알림):
  조건: 5분 이상 장애 지속
  액션: Slack #bidflow-alerts 알림

Level 3 (긴급 호출):
  조건: 30분 이상 서비스 다운
  액션: Email + SMS (on-call 담당자)
```

---

## 출력 형식

### 시스템 상태

```
╔══════════════════════════════════════════════════════════════╗
║               BIDFLOW 운영 상태 대시보드                       ║
╠══════════════════════════════════════════════════════════════╣
║  시간: 2025-01-15 14:30:00 KST                                ║
║  환경: Production                                             ║
╚══════════════════════════════════════════════════════════════╝

┌─ 서비스 상태 ─────────────────────────────────────────────────┐
│                                                               │
│  API Server          ✅ UP        응답: 45ms    에러: 0.1%   │
│  Database            ✅ UP        연결: 12/100  지연: 5ms    │
│  TED Connector       ✅ UP        마지막: 30분 전            │
│  SAM Connector       ✅ UP        마지막: 45분 전            │
│  G2B Connector       ⚠️ STUB      테스트 모드                │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ 성능 메트릭 (지난 1시간) ─────────────────────────────────────┐
│                                                               │
│  요청 처리량     1,234 req       ▲ 12% (전일 대비)           │
│  평균 응답 시간   45ms           ▼ 5% (개선)                 │
│  p95 응답 시간    120ms          ✓ 정상 범위                 │
│  에러율           0.1%           ✓ 정상 범위                 │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ 데이터 파이프라인 ───────────────────────────────────────────┐
│                                                               │
│  오늘 수집        45건 (TED: 32, SAM: 13)                    │
│  매칭 완료        38건 (BID: 12, REVIEW: 26)                 │
│  대기 중          7건                                         │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ 최근 알림 ───────────────────────────────────────────────────┐
│                                                               │
│  🟡 14:15  TED API 응답 지연 (3.2s) - 복구됨                  │
│  🟢 12:00  일일 수집 완료 - 45건 처리                         │
│  🟢 00:00  일일 리포트 발송 완료                              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 에러 상세

```
╔══════════════════════════════════════════════════════════════╗
║               에러 상세 보고서                                 ║
╠══════════════════════════════════════════════════════════════╣
║  에러 ID: ERR-2025-01-15-001                                  ║
║  심각도: HIGH                                                 ║
╚══════════════════════════════════════════════════════════════╝

에러 유형: API Connection Timeout
발생 위치: src/lib/connectors/ted-connector.ts:156
발생 시간: 2025-01-15 14:10:23 KST

스택 트레이스:
  at TEDConnector.fetch (ted-connector.ts:156)
  at ConnectorManager.sync (manager.ts:89)
  at syncAllConnectors (sync-job.ts:45)

컨텍스트:
  - 요청 URL: https://ted.europa.eu/api/v3/notices
  - 타임아웃: 30000ms
  - 재시도: 3회 모두 실패

영향:
  - TED 공고 수집 일시 중단
  - 예상 누락 공고: 5-10건

권장 조치:
  1. TED API 상태 확인: https://ted.europa.eu/status
  2. 네트워크 연결 확인
  3. 수동 재시도: /sync ted --force
```

---

## 환경 변수

```bash
# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
ALERT_EMAIL_TO=ops@company.com

# 임계값 설정
ALERT_ERROR_RATE_THRESHOLD=5
ALERT_RESPONSE_TIME_P95_THRESHOLD=2000
ALERT_CONNECTOR_STALE_HOURS=2
```

---

## 관련 파일

```
src/lib/monitoring/
├── sentry.ts              # Sentry 초기화
├── metrics.ts             # 성능 메트릭 수집
├── health-checker.ts      # 헬스체크 로직
└── alerter.ts             # 알림 발송

src/lib/notifications/
├── slack.ts               # Slack 웹훅
├── email.ts               # Resend 이메일
└── templates/             # 알림 템플릿

src/app/api/v1/
├── health/route.ts        # Health 엔드포인트
└── admin/metrics/route.ts # 메트릭 엔드포인트
```

---

## 자동 호출 조건

- 시스템 에러 발생 시
- `/ops-monitor` 명령어 실행 시
- 스케줄된 헬스체크 시
- 배포 후 자동 검증 시
