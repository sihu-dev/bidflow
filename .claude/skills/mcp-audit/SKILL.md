# MCP 기반 종합 검수 마스터 프롬프트

> **버전**: 1.0.0
> **MCP 서버**: playwright, sequential-thinking
> **모델**: opus (검수) + sonnet (실행)

---

## 개요

Playwright MCP와 Sequential Thinking MCP를 활용한 BIDFLOW 종합 품질 검수 시스템입니다.
콘솔 오류, E2E 테스트, 기능 검수를 자동화합니다.

---

## 검수 항목 (총 200점)

| 카테고리 | 배점 | MCP 도구 |
|----------|------|----------|
| A. 콘솔 오류 검사 | 40점 | playwright |
| B. E2E 기능 테스트 | 50점 | playwright |
| C. 반응형 UI 검사 | 30점 | playwright |
| D. 접근성 검사 | 30점 | playwright |
| E. 성능 지표 검사 | 30점 | playwright |
| F. 보안 검사 | 20점 | sequential-thinking |

---

## 사전 조건

```bash
# 개발 서버 실행 확인
curl -s http://localhost:3010 > /dev/null && echo "✓ 서버 실행 중" || echo "✗ 서버 미실행"
```

---

## A. 콘솔 오류 검사 (40점)

### 검사 항목

| 항목 | 배점 | 기준 |
|------|------|------|
| JavaScript 에러 | 15점 | 에러 0개 = 15점, 1-3개 = 10점, 4+ = 0점 |
| React 경고 | 10점 | 경고 0개 = 10점, 1-5개 = 5점, 6+ = 0점 |
| 네트워크 에러 | 10점 | 404/500 0개 = 10점 |
| TypeScript 에러 | 5점 | 빌드 성공 = 5점 |

### MCP 실행 절차

```yaml
Step 1: 브라우저 시작
  - mcp__playwright__browser_navigate: url="http://localhost:3010"

Step 2: 콘솔 로그 수집
  - 각 페이지 방문하며 console.error, console.warn 수집
  - 페이지 목록: /, /features, /pricing, /login, /signup, /dashboard

Step 3: 네트워크 에러 확인
  - 404, 500 응답 확인
  - 깨진 이미지/리소스 확인

Step 4: 스크린샷 촬영
  - mcp__playwright__browser_take_screenshot
```

### 에러 분류

```yaml
Critical (즉시 수정):
  - Uncaught TypeError
  - Uncaught ReferenceError
  - Hydration failed
  - ChunkLoadError

Warning (권장 수정):
  - Each child should have unique "key"
  - Cannot update a component while rendering
  - findDOMNode is deprecated

Ignore (무시 가능):
  - DevTools failed to load
  - Third-party cookie warnings
```

---

## B. E2E 기능 테스트 (50점)

### 테스트 시나리오

#### B-1. 랜딩 페이지 플로우 (15점)

```yaml
테스트 ID: E2E-LANDING-001
페이지: /
검증 항목:
  - [ ] 페이지 로드 성공 (HTTP 200)
  - [ ] Hero 섹션 표시
  - [ ] Features 섹션 스크롤 도달
  - [ ] CTA 버튼 클릭 가능
  - [ ] 콘솔 에러 없음

MCP 명령:
  1. mcp__playwright__browser_navigate url="http://localhost:3010"
  2. mcp__playwright__browser_take_screenshot
  3. mcp__playwright__browser_click element="무료로 시작하기" (text selector)
  4. URL 변경 확인 → /signup
```

#### B-2. 인증 플로우 (15점)

```yaml
테스트 ID: E2E-AUTH-001
페이지: /login, /signup

로그인 테스트:
  1. mcp__playwright__browser_navigate url="http://localhost:3010/login"
  2. mcp__playwright__browser_fill element="input[type=email]" value="test@test.com"
  3. mcp__playwright__browser_fill element="input[type=password]" value="password123"
  4. mcp__playwright__browser_click element="button[type=submit]"
  5. 에러 메시지 또는 리다이렉트 확인

데모 모드 테스트:
  1. mcp__playwright__browser_click element="로그인 없이 둘러보기"
  2. URL 확인 → /dashboard?demo=true
```

#### B-3. 대시보드 플로우 (10점)

```yaml
테스트 ID: E2E-DASHBOARD-001
페이지: /dashboard?demo=true

검증 항목:
  - [ ] 스프레드시트 로드
  - [ ] 데이터 표시 (12 rows)
  - [ ] 필터 동작
  - [ ] 사이드 패널 열기
```

#### B-4. 네비게이션 테스트 (10점)

```yaml
테스트 ID: E2E-NAV-001

헤더 네비게이션:
  1. 기능 링크 → /features
  2. 요금제 링크 → /pricing
  3. 로그인 링크 → /login
  4. 로고 클릭 → /

푸터 네비게이션:
  1. 각 링크 접근 가능 확인
```

---

## C. 반응형 UI 검사 (30점)

### 뷰포트별 테스트

```yaml
뷰포트:
  mobile: { width: 375, height: 667 }
  tablet: { width: 768, height: 1024 }
  desktop: { width: 1440, height: 900 }
  wide: { width: 1920, height: 1080 }
```

### 검사 항목

| 뷰포트 | 검사 항목 | 배점 |
|--------|----------|------|
| Mobile | 햄버거 메뉴 표시, 수평 스크롤 없음 | 10점 |
| Tablet | 2컬럼 레이아웃, 터치 타겟 44px+ | 10점 |
| Desktop | 전체 네비게이션, 사이드바 표시 | 10점 |

### MCP 실행

```yaml
각 뷰포트마다:
  1. mcp__playwright__browser_resize width=375 height=667
  2. mcp__playwright__browser_navigate url="http://localhost:3010"
  3. mcp__playwright__browser_take_screenshot
  4. 수평 오버플로우 체크:
     - document.body.scrollWidth > window.innerWidth → FAIL
```

---

## D. 접근성 검사 (30점)

### 검사 항목

| 항목 | 배점 | 기준 |
|------|------|------|
| 이미지 alt 속성 | 10점 | 모든 img에 alt 존재 |
| ARIA 레이블 | 10점 | 인터랙티브 요소에 label |
| 키보드 접근성 | 5점 | Tab 순서 논리적 |
| 색상 대비 | 5점 | WCAG AA 기준 |

### 검사 방법

```yaml
1. 이미지 alt 체크:
   - document.querySelectorAll('img:not([alt])')
   - 결과 0개 = PASS

2. 버튼 접근성:
   - button 요소에 텍스트 또는 aria-label 존재

3. 폼 접근성:
   - input에 연결된 label 또는 aria-label

4. 포커스 표시:
   - :focus 스타일 적용 확인
```

---

## E. 성능 지표 검사 (30점)

### Core Web Vitals

| 지표 | 기준 | 배점 |
|------|------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 10점 |
| FID (First Input Delay) | < 100ms | 10점 |
| CLS (Cumulative Layout Shift) | < 0.1 | 10점 |

### 측정 방법

```yaml
1. Playwright로 페이지 로드
2. Performance API 사용:
   - performance.getEntriesByType('largest-contentful-paint')
   - PerformanceObserver 활용
3. 번들 사이즈 확인:
   - First Load JS < 150KB 권장
```

---

## F. 보안 검사 (20점)

### 검사 항목

| 항목 | 배점 | 방법 |
|------|------|------|
| 하드코딩 시크릿 | 10점 | grep으로 API_KEY, SECRET 패턴 검색 |
| XSS 취약점 | 5점 | 입력 필드 sanitization 확인 |
| HTTPS 강제 | 5점 | HTTP 리다이렉트 확인 |

---

## 실행 명령어

### 전체 검수

```
/mcp-audit
```

### 개별 검수

```
/mcp-audit --console    # 콘솔 오류만
/mcp-audit --e2e        # E2E 테스트만
/mcp-audit --responsive # 반응형만
/mcp-audit --a11y       # 접근성만
/mcp-audit --perf       # 성능만
/mcp-audit --security   # 보안만
```

### 특정 페이지

```
/mcp-audit --page /features
/mcp-audit --page /dashboard
```

---

## 검수 프로세스 (순차 실행)

```
┌──────────────────────────────────────────────────────────────┐
│                    MCP 종합 검수 시작                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ [1단계] 사전 검사                                              │
│   ├── 개발 서버 실행 확인 (localhost:3010)                     │
│   ├── TypeScript 빌드 확인 (npm run typecheck)                │
│   └── ESLint 검사 (npm run lint)                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ [2단계] Playwright MCP 브라우저 시작                           │
│   ├── mcp__playwright__browser_navigate                       │
│   └── 콘솔 로그 리스너 설정                                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ [3단계] 페이지별 순회 테스트                                    │
│   ├── / (랜딩)                                                │
│   ├── /features                                               │
│   ├── /pricing                                                │
│   ├── /login                                                  │
│   ├── /signup                                                 │
│   └── /dashboard?demo=true                                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ [4단계] 반응형 테스트                                          │
│   ├── Mobile (375x667)                                        │
│   ├── Tablet (768x1024)                                       │
│   └── Desktop (1440x900)                                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ [5단계] 접근성 & 성능 검사                                      │
│   ├── ARIA 검사                                               │
│   ├── 색상 대비                                                │
│   └── Core Web Vitals                                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ [6단계] 보안 검사                                              │
│   ├── 하드코딩 시크릿 스캔                                      │
│   └── 취약점 패턴 검사                                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ [7단계] 보고서 생성                                            │
│   ├── Markdown 보고서                                         │
│   ├── JSON 데이터                                             │
│   └── 스크린샷 저장                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 출력 형식

```
╔══════════════════════════════════════════════════════════════════════╗
║                   BIDFLOW MCP 종합 검수 보고서                          ║
╠══════════════════════════════════════════════════════════════════════╣
║  검수 시간: 2025-12-21 15:30:00                                        ║
║  MCP 서버: playwright ✓  sequential-thinking ✓                         ║
║  대상 URL: http://localhost:3010                                       ║
╚══════════════════════════════════════════════════════════════════════╝

┌─ A. 콘솔 오류 검사 ──────────────────────────── 38/40점 ─────────────┐
│                                                                       │
│  JavaScript 에러: 0개                                    ✓ 15/15      │
│  React 경고: 2개                                         ⚠ 8/10       │
│    - Warning: Each child should have unique "key"                     │
│    - Warning: validateDOMNesting                                      │
│  네트워크 에러: 0개                                       ✓ 10/10      │
│  TypeScript 에러: 0개                                    ✓ 5/5        │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─ B. E2E 기능 테스트 ─────────────────────────── 48/50점 ─────────────┐
│                                                                       │
│  B-1. 랜딩 페이지 플로우                                  ✓ 15/15     │
│       - 페이지 로드: 1.2s                                             │
│       - CTA 버튼 동작 확인                                            │
│                                                                       │
│  B-2. 인증 플로우                                         ✓ 15/15     │
│       - 로그인 폼 제출 정상                                           │
│       - 데모 모드 진입 정상                                           │
│                                                                       │
│  B-3. 대시보드 플로우                                     ⚠ 8/10      │
│       - 스프레드시트 로드: OK                                         │
│       - 필터 동작: 일부 지연                                          │
│                                                                       │
│  B-4. 네비게이션 테스트                                   ✓ 10/10     │
│       - 모든 링크 정상 작동                                           │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─ C. 반응형 UI 검사 ──────────────────────────── 30/30점 ─────────────┐
│                                                                       │
│  Mobile (375x667)                                         ✓ 10/10     │
│    - 햄버거 메뉴: 표시됨                                              │
│    - 수평 스크롤: 없음                                                │
│                                                                       │
│  Tablet (768x1024)                                        ✓ 10/10     │
│    - 2컬럼 레이아웃: 적용됨                                           │
│                                                                       │
│  Desktop (1440x900)                                       ✓ 10/10     │
│    - 전체 네비게이션: 표시됨                                          │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─ D. 접근성 검사 ─────────────────────────────── 25/30점 ─────────────┐
│                                                                       │
│  이미지 alt 속성                                          ✓ 10/10     │
│  ARIA 레이블                                              ⚠ 7/10      │
│    - 누락: DropdownMenu, Modal                                        │
│  키보드 접근성                                            ✓ 5/5       │
│  색상 대비                                                ⚠ 3/5       │
│    - 일부 muted 텍스트 대비 부족                                       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─ E. 성능 지표 검사 ──────────────────────────── 28/30점 ─────────────┐
│                                                                       │
│  LCP (Largest Contentful Paint)                           ✓ 10/10     │
│    - 측정값: 1.8s (기준: < 2.5s)                                      │
│                                                                       │
│  FID (First Input Delay)                                  ✓ 10/10     │
│    - 측정값: 45ms (기준: < 100ms)                                     │
│                                                                       │
│  CLS (Cumulative Layout Shift)                            ⚠ 8/10      │
│    - 측정값: 0.12 (기준: < 0.1)                                       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─ F. 보안 검사 ───────────────────────────────── 20/20점 ─────────────┐
│                                                                       │
│  하드코딩 시크릿                                          ✓ 10/10     │
│  XSS 취약점                                               ✓ 5/5       │
│  HTTPS 강제                                               ✓ 5/5       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════
                        총점: 189/200점 (94.5%)
════════════════════════════════════════════════════════════════════════

등급: A (우수)
판정: ✓ PASS

┌─ 개선 권장사항 ──────────────────────────────────────────────────────┐
│                                                                       │
│  [HIGH] React key 경고 수정 필요                                       │
│    - src/components/landing/Features.tsx:45                           │
│                                                                       │
│  [MEDIUM] ARIA 레이블 추가                                             │
│    - DropdownMenu 컴포넌트                                             │
│    - Modal 컴포넌트                                                    │
│                                                                       │
│  [LOW] CLS 개선                                                        │
│    - 이미지 width/height 명시                                          │
│    - 폰트 로드 최적화                                                  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

스크린샷:
  - .claude/audit-reports/screenshots/landing-desktop.png
  - .claude/audit-reports/screenshots/landing-mobile.png
  - .claude/audit-reports/screenshots/dashboard-demo.png
```

---

## 등급 기준

| 등급 | 점수 | 판정 |
|------|------|------|
| S | 190+ | EXCELLENT |
| A | 160-189 | PASS |
| B | 130-159 | PASS |
| C | 100-129 | CONDITIONAL PASS |
| D | 70-99 | NEEDS IMPROVEMENT |
| F | < 70 | FAIL |

---

## 자동 실행 조건

```yaml
자동 실행 트리거:
  - PR 생성 전
  - main 브랜치 머지 전
  - /mcp-audit 명령어 입력 시

주기적 실행:
  - 매일 빌드 후 (CI/CD)
```

---

## 보고서 저장 위치

```
.claude/audit-reports/
├── mcp-audit-2025-12-21-153000.md
├── mcp-audit-2025-12-21-153000.json
└── screenshots/
    ├── landing-desktop.png
    ├── landing-tablet.png
    ├── landing-mobile.png
    ├── features-desktop.png
    ├── dashboard-demo.png
    └── login-form.png
```

---

*MCP 종합 검수 마스터 프롬프트 v1.0.0*
