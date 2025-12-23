# BIDFLOW 공격적 검수 개선 계획

> **작성일**: 2025-12-23
> **목표**: Production-Ready 품질 달성
> **기간**: 2주 (Sprint 1-2)

---

## 📊 현재 상태 진단 (2025-12-23)

### 🔴 Critical Issues (즉시 수정)

| 항목 | 현재 | 목표 | 심각도 |
|------|------|------|--------|
| **TypeScript any 타입** | 56개 | 0개 | 🔴 Critical |
| **console.log 남용** | 104개 | 0개 (로깅 시스템 교체) | 🔴 Critical |
| **TODO/FIXME 미완료** | 10개 | 0개 | 🔴 Critical |

### 🟡 High Priority (1주 내)

| 항목 | 현재 | 목표 | 우선순위 |
|------|------|------|----------|
| **테스트 커버리지** | 25개 파일 | 80%+ | 🟡 High |
| **접근성 (a11y)** | 69개 aria | WCAG 2.1 AA | 🟡 High |
| **큰 파일 리팩토링** | 최대 571줄 | <300줄 | 🟡 High |
| **보안 감사** | 미실시 | OWASP Top 10 | 🟡 High |

### 🟢 Medium Priority (2주 내)

| 항목 | 현재 | 목표 |
|------|------|------|
| **성능 (Lighthouse)** | 미측정 | 90점+ |
| **번들 사이즈** | 4.4MB | <3MB |
| **의존성 감사** | 66개 | 취약점 0개 |

---

## 🎯 Sprint 1: Critical Issues (D-Day ~ D+7)

### Day 1-2: TypeScript any 제거 (56개)

**목표**: 모든 `any` 타입을 구체적인 타입으로 교체

**작업**:
```bash
# 1. any 타입 발견 (56개)
grep -rn "\bany\b" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"

# 2. 우선순위별 수정
P0: API 라우트 (보안 중요)
P1: 도메인 로직 (비즈니스 로직)
P2: UI 컴포넌트
```

**기대 효과**:
- 타입 안전성 100% 확보
- 런타임 에러 90% 감소
- IDE 자동완성 개선

**검증**:
```bash
npm run typecheck --strict
```

---

### Day 3-4: console.log → 구조화된 로깅 (104개)

**목표**: 프로덕션 로깅 시스템 구축

**작업**:
```typescript
// 1. 로깅 유틸 생성 (src/lib/utils/logger.ts)
export const logger = {
  info: (message: string, meta?: object) => {
    if (process.env.NODE_ENV === 'production') {
      // Sentry, DataDog 등으로 전송
    } else {
      console.log('[INFO]', message, meta);
    }
  },
  error: (message: string, error: Error, meta?: object) => {
    // 프로덕션: 에러 추적 서비스
    // 개발: console.error
  },
  warn: (message: string, meta?: object) => { /* ... */ },
};

// 2. 모든 console.log 교체 (104개)
- console.log → logger.info
- console.error → logger.error
- console.warn → logger.warn

// 3. ESLint 규칙 추가
"no-console": "error"
```

**기대 효과**:
- 프로덕션 디버깅 가능
- 에러 추적 자동화
- 성능 모니터링 기반 마련

---

### Day 5-7: TODO/FIXME 완료 (10개)

**발견된 TODO 목록**:

#### 1. Sludge 모니터링 (3개)
```typescript
// src/app/(sludge)/sludge/monitoring/page.tsx:55
status: 'online', // TODO: 실제 상태 계산
→ Supabase Realtime으로 센서 상태 실시간 조회

// :80
trend: 'stable' as const, // TODO: 트렌드 계산
→ 최근 7일 데이터 기반 트렌드 알고리즘 구현

// :321
{/* TODO: ECharts 또는 Recharts로 그래프 구현 */}
→ ECharts 연동 (이미 설치됨)
```

#### 2. AI Score API (1개)
```typescript
// src/app/api/v1/ai/score/route.ts:142
// TODO: Supabase에서 bid 조회
→ bid-repository.ts의 findById() 사용
```

#### 3. Spreadsheet (1개)
```typescript
// src/components/spreadsheet/SpreadsheetView.tsx:297
// TODO: onBidCreate will be used for new bid creation
→ createBid API 연결
```

#### 4. Use Cases (1개)
```typescript
// src/lib/domain/usecases/bid-usecases.ts:98
// TODO: notes will be used for status change history
→ bid_history 테이블 삽입 로직 구현
```

**작업 계획**:
- Day 5: Sludge 모니터링 TODO 3개 완료
- Day 6: AI/Spreadsheet TODO 2개 완료
- Day 7: 검증 및 테스트

---

## 🎯 Sprint 2: High Priority (D+8 ~ D+14)

### Day 8-10: 테스트 커버리지 80%+

**현재**: 25개 테스트 파일, E2E 46개

**목표**: 단위 테스트 커버리지 80% 이상

**우선순위**:
1. **핵심 비즈니스 로직** (필수 100%)
   - `src/lib/matching/enhanced-matcher.ts` (175점 알고리즘)
   - `src/lib/domain/usecases/bid-usecases.ts`
   - `src/lib/clients/ted-api.ts`
   - `src/lib/clients/narajangto-api.ts`

2. **보안 모듈** (필수 100%)
   - `src/lib/security/auth-middleware.ts`
   - `src/lib/security/rate-limiter.ts`
   - `src/lib/security/prompt-guard.ts`

3. **API 라우트** (80%+)
   - `src/app/api/v1/bids/route.ts`
   - `src/app/api/v1/ai/*/route.ts`

**검증**:
```bash
npm run test:coverage
# 목표: Statements 80%+, Branches 75%+, Functions 80%+
```

---

### Day 11-12: 접근성 (WCAG 2.1 AA)

**현재**: 69개 aria 속성

**체크리스트**:

#### 1. 키보드 네비게이션
```bash
- [ ] Tab 순서 논리적
- [ ] Focus 표시 명확
- [ ] Esc로 모달 닫기
- [ ] Enter/Space로 버튼 실행
```

#### 2. 스크린 리더
```bash
- [ ] 모든 버튼에 aria-label
- [ ] 폼 필드 label 연결
- [ ] 에러 메시지 aria-live
- [ ] 테이블 <th> scope 속성
```

#### 3. 색상 대비
```bash
- [ ] WCAG AA (4.5:1 이상)
- [ ] 색맹 모드 테스트
- [ ] 다크 모드 대비
```

#### 4. 반응형
```bash
- [ ] 모바일 (320px+)
- [ ] 태블릿 (768px+)
- [ ] 데스크톱 (1024px+)
- [ ] 줌 200% 테스트
```

**도구**:
```bash
npm install -D @axe-core/react
npm install -D eslint-plugin-jsx-a11y
```

**검증**:
```bash
npm run lighthouse -- --only-categories=accessibility
# 목표: 95점 이상
```

---

### Day 13-14: 보안 감사 (OWASP Top 10)

**체크리스트**:

#### 1. Injection
```bash
- [✅] SQL Injection - Supabase ORM 사용
- [✅] XSS - React 자동 이스케이프
- [🔴] Prompt Injection - prompt-guard.ts 검증 필요
```

#### 2. Broken Authentication
```bash
- [✅] JWT 검증 (auth-middleware.ts)
- [🟡] 비밀번호 정책 - 강화 필요 (최소 12자)
- [✅] 세션 타임아웃
```

#### 3. Sensitive Data Exposure
```bash
- [✅] HTTPS only
- [✅] 환경변수 (.env)
- [🔴] API 키 로그 노출 - 검증 필요
```

#### 4. XML External Entities (XXE)
```bash
- [N/A] XML 파싱 없음
```

#### 5. Broken Access Control
```bash
- [🟡] RLS 정책 검증 필요
- [🟡] tenant_id 격리 확인
```

#### 6. Security Misconfiguration
```bash
- [✅] CORS 설정
- [✅] CSRF 보호
- [🟡] 보안 헤더 추가 필요
```

#### 7. Cross-Site Scripting (XSS)
```bash
- [✅] React 자동 이스케이프
- [🟡] dangerouslySetInnerHTML 사용 확인
```

#### 8. Insecure Deserialization
```bash
- [✅] Zod 검증
- [✅] JSON.parse 안전하게 사용
```

#### 9. Using Components with Known Vulnerabilities
```bash
npm audit
npm audit fix
```

#### 10. Insufficient Logging & Monitoring
```bash
- [🔴] 구조화된 로깅 - Sprint 1에서 구현
- [🔴] 에러 추적 - Sentry 연동 필요
```

**작업**:
```bash
# 1. npm 의존성 감사
npm audit --production
npm outdated

# 2. 보안 헤더 추가 (next.config.js)
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' }
]

# 3. RLS 정책 검증
node scripts/validate-rls.js
```

---

## 🎯 Sprint 3: Medium Priority (D+15 ~ D+21)

### 1. 성능 최적화 (Lighthouse 90점+)

**현재**: 미측정

**목표**:
- Performance: 90점+
- Accessibility: 95점+
- Best Practices: 95점+
- SEO: 100점

**작업**:
```bash
# 1. 이미지 최적화
- WebP 변환
- next/image 사용
- lazy loading

# 2. 코드 스플리팅
- 동적 임포트 확대
- 번들 사이즈 분석

# 3. 캐싱 전략
- API 응답 캐시 (1분)
- 정적 에셋 CDN
```

---

### 2. 큰 파일 리팩토링 (<300줄)

**대상**:
```
571줄: src/lib/domain/repositories/bid-repository.ts
568줄: src/lib/sludge/usecases/sludge-usecases.ts
541줄: src/components/landing/SpreadsheetDemo.tsx
```

**리팩토링 전략**:
1. 단일 책임 원칙 (SRP)
2. 함수 추출
3. 컴포넌트 분리

---

### 3. 의존성 정리 (66개 → 50개)

**작업**:
```bash
# 1. 미사용 패키지 제거
npm run depcheck

# 2. 중복 패키지 통합
npm dedupe

# 3. 보안 업데이트
npm audit fix
```

---

## 📈 성공 지표

### Sprint 1 완료 기준
- [x] TypeScript any: 56개 → 0개
- [x] console.log: 104개 → 0개
- [x] TODO/FIXME: 10개 → 0개
- [x] 타입 체크: 0 에러
- [x] 프로덕션 빌드: 성공

### Sprint 2 완료 기준
- [x] 테스트 커버리지: 80%+
- [x] Lighthouse Accessibility: 95점+
- [x] OWASP Top 10: 모두 통과
- [x] npm audit: 0 vulnerabilities

### Sprint 3 완료 기준
- [x] Lighthouse Performance: 90점+
- [x] 번들 사이즈: <3MB
- [x] 파일 최대 줄 수: <300줄
- [x] 의존성: <50개

---

## 🛠️ 도구 및 자동화

### 1. 코드 품질
```bash
npm install -D eslint-plugin-sonarjs
npm install -D eslint-plugin-security
npm install -D typescript-eslint
```

### 2. 테스트
```bash
npm install -D @vitest/coverage-v8
npm install -D @testing-library/react
npm install -D @axe-core/react
```

### 3. 성능
```bash
npm install -D @next/bundle-analyzer
npm install -D lighthouse-ci
```

### 4. 보안
```bash
npm install -D @sentry/nextjs
npm install -D snyk
```

---

## 📝 체크리스트

### Pre-Audit
- [x] 현재 상태 진단 완료
- [ ] 백업 브랜치 생성
- [ ] 팀 공유 및 승인

### Sprint 1 (Critical)
- [ ] TypeScript any 제거 (56개)
- [ ] console.log → logger (104개)
- [ ] TODO/FIXME 완료 (10개)
- [ ] 타입 체크 통과

### Sprint 2 (High)
- [ ] 테스트 커버리지 80%+
- [ ] WCAG 2.1 AA 준수
- [ ] OWASP Top 10 통과
- [ ] 보안 헤더 추가

### Sprint 3 (Medium)
- [ ] Lighthouse 90점+
- [ ] 파일 리팩토링 (<300줄)
- [ ] 의존성 정리 (<50개)
- [ ] 번들 최적화 (<3MB)

### Post-Audit
- [ ] 전체 E2E 테스트 통과
- [ ] 프로덕션 배포 테스트
- [ ] 성능 벤치마크 기록
- [ ] 문서 업데이트

---

**작성자**: Claude Code
**최종 업데이트**: 2025-12-23
