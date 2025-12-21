# E2E 테스트 실행 가이드

## 문제: WSL 환경에서 Chromium 실행 에러

```
error while loading shared libraries: libnspr4.so: cannot open shared object file
```

## 해결 방법

### 1. 시스템 의존성 설치 (필요)

```bash
# Playwright 의존성 자동 설치
npx playwright install-deps chromium

# 또는 수동 설치
sudo apt-get update
sudo apt-get install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libdbus-1-3 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2
```

### 2. E2E 테스트 실행

```bash
# 헤드리스 모드 (CI/CD)
npm run test:e2e

# UI 모드 (개발)
npm run test:e2e:ui

# 특정 테스트만
npm run test:e2e landing-sections

# 디버그 모드
npx playwright test --debug
```

## 테스트 구조

### 총 46개 테스트 (2개 프로젝트)

**Desktop Chrome (23개)**
- Hero Section: 4개
- Stats Section: 2개
- Features Section: 2개
- HowItWorks: 1개
- Testimonials: 1개
- FAQ: 2개
- CTA: 2개
- SpreadsheetDemo: 10개

**Mobile Chrome (23개)**
- 동일한 테스트를 모바일 뷰포트에서 실행

## 대안: Docker로 실행

```bash
# Playwright Docker 이미지 사용
docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:v1.57.0-jammy /bin/bash

# 컨테이너 내에서
npm install
npm run test:e2e
```

## 현재 상태

✅ 테스트 파일 작성 완료 (33개 테스트)
✅ Playwright 설정 완료
✅ 코드 에러 수정 (ssr: false 제거)
⚠️  시스템 의존성 설치 필요

## 다음 단계

1. 시스템 의존성 설치
2. `npm run test:e2e` 실행
3. 모든 테스트 통과 확인
4. 테스트 리포트 확인 (`playwright-report/`)
