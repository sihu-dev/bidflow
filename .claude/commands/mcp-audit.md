# /mcp-audit 명령어

MCP(Playwright + Sequential Thinking)를 활용한 종합 품질 검수

## 사용법

```bash
/mcp-audit              # 전체 검수
/mcp-audit --quick      # 빠른 검수 (콘솔+E2E만)
/mcp-audit --console    # 콘솔 오류만
/mcp-audit --e2e        # E2E 테스트만
/mcp-audit --responsive # 반응형만
/mcp-audit --page PATH  # 특정 페이지만
```

## 실행 절차

### 1. 사전 검사

```yaml
Step: pre-check
Actions:
  - 개발 서버 확인: curl http://localhost:3010
  - TypeScript 검사: npm run typecheck
  - ESLint 검사: npm run lint
Pass Criteria: 모든 검사 통과
```

### 2. Playwright MCP 브라우저 테스트

```yaml
Step: browser-test
MCP Server: playwright
Actions:
  - browser_navigate: 각 페이지 순회
  - browser_take_screenshot: 스크린샷 촬영
  - browser_console: 콘솔 로그 수집

Pages:
  - http://localhost:3010/
  - http://localhost:3010/features
  - http://localhost:3010/pricing
  - http://localhost:3010/login
  - http://localhost:3010/signup
  - http://localhost:3010/dashboard?demo=true
```

### 3. 콘솔 오류 검사

```yaml
Step: console-check
검사 항목:
  - JavaScript Error (Uncaught, TypeError, ReferenceError)
  - React Warning (key, hydration, DOM nesting)
  - Network Error (404, 500, CORS)
  - TypeScript Error (컴파일 에러)

무시 패턴:
  - DevTools failed to load
  - Third-party cookie
  - favicon.ico 404
```

### 4. E2E 기능 테스트

```yaml
Step: e2e-test
시나리오:
  - Landing Flow: CTA 클릭 → /signup 이동
  - Auth Flow: 로그인 폼 → 에러 메시지 → 데모 모드
  - Dashboard Flow: 스프레드시트 로드 → 필터 → 사이드패널
  - Navigation Flow: 헤더/푸터 링크 → 페이지 이동
```

### 5. 반응형 테스트

```yaml
Step: responsive-test
Viewports:
  - mobile: 375x667
  - tablet: 768x1024
  - desktop: 1440x900

검사:
  - 수평 오버플로우 없음
  - 모바일 햄버거 메뉴 표시
  - 적절한 폰트 크기
```

### 6. 접근성 검사

```yaml
Step: a11y-check
검사:
  - 이미지 alt 속성
  - ARIA 레이블
  - 키보드 접근성
  - 색상 대비
```

### 7. 성능 검사

```yaml
Step: performance-check
지표:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
```

### 8. 보안 검사

```yaml
Step: security-check
검사:
  - 하드코딩 시크릿 (API_KEY, SECRET, PASSWORD)
  - XSS 취약점
  - SQL Injection 패턴
```

## 출력

```
총점: XXX/200점 (XX%)
등급: A/B/C/D/F
판정: PASS/FAIL

개선 권장사항:
  - [HIGH] ...
  - [MEDIUM] ...
  - [LOW] ...
```

## 보고서 저장

```
.claude/audit-reports/
├── mcp-audit-YYYY-MM-DD-HHMMSS.md
├── mcp-audit-YYYY-MM-DD-HHMMSS.json
└── screenshots/
```
