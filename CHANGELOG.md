# Changelog

All notable changes to BIDFLOW will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2025-12-21

### 🎉 Initial Release - CMNTech 제품 매칭 시스템

**랜딩 페이지 및 AI 매칭 엔진 구현 완료**

### Added

#### 데이터 레이어

- **CMNTech 5개 제품 카탈로그** (`src/lib/data/products.ts`)
  - UR-1000PLUS (다회선 초음파 유량계)
  - MF-1000C (일체형 전자 유량계)
  - UR-1010PLUS (비만관형 유량계)
  - SL-3000PLUS (개수로 유량계)
  - EnerRay (초음파 열량계)

- **AI 스마트 함수 5개** (`src/lib/data/ai-functions.ts`)
  - `=AI_SUMMARY()` - 공고 2-3문장 요약
  - `=AI_SCORE()` - 낙찰 가능성 0-100%
  - `=AI_MATCH()` - 최적 제품 추천
  - `=AI_KEYWORDS()` - 핵심 키워드 3개
  - `=AI_DEADLINE()` - 마감일 분석

- **6개 샘플 입찰 데이터** (`src/lib/data/mock-bids.ts`)
  - 나라장터, TED, K-water, 한전 출처
  - Enhanced Matcher 실시간 연동

#### AI 매칭 엔진

- **Enhanced Matcher** (`src/lib/matching/enhanced-matcher.ts`)
  - 가중치 기반 알고리즘 (키워드 100점 + 규격 25점 + 기관 50점)
  - 신뢰도 계산 (High/Medium/Low)
  - BID/REVIEW/SKIP 추천 전략

- **Pipe Size Extractor** (`src/lib/matching/pipe-size-extractor.ts`)
  - DN/구경 자동 추출 (DN50, DN1000 등)
  - 규격 매칭 점수 계산

- **Organization Dictionary** (`src/lib/matching/organization-dictionary.ts`)
  - 발주기관 정규화 (서울시, K-water 등)
  - 기관별 제품 점수 매핑

#### 랜딩 페이지 (9개 섹션)

- **Hero** - CMNTech 유량계 전문 배지, 5개 제품 Pills
- **Stats** - 92% 매칭 정확도, 5+ 제품, 150+ 공고, 3.2x 참여율
- **Features** - 4개 핵심 기능 (자동 수집, 제품 매칭, AI 함수, 제안서)
- **SpreadsheetDemo** - 11컬럼 그리드 + 사이드패널 + AI 함수
- **HowItWorks** - 3단계 워크플로우
- **Testimonials** - 씨엠엔텍 고객 사례 3건
- **PricingPreview** - Starter/Pro/Enterprise 플랜
- **FAQ** - CMNTech 관련 5개 질문
- **CTA** - 5개 제품 입찰 자동화 CTA

#### 테스트

- **E2E 테스트 46개** (Playwright)
  - Desktop Chrome: 23개
  - Mobile Chrome: 23개
  - SpreadsheetDemo: 10개
  - Landing Sections: 13개 (Hero, Stats, Features 등)

#### 문서화

- **README.md** - 400+ 줄 포괄적 프로젝트 문서
- **E2E_TEST_GUIDE.md** - E2E 테스트 실행 가이드
- **CMNTech 분석 문서 10개** (`docs/cmntech-analysis/`)
  - 제품 카탈로그, 매칭 로직, 데이터 소스 등

### Changed

#### 성능 최적화

- **Code Splitting** - SpreadsheetDemo dynamic import 적용
- **Loading UI** - 스피너 + 텍스트 개선
- **SSR 유지** - SEO 손실 없이 최적화

#### 반응형 디자인

- 40개 반응형 클래스 적용
- 모바일/태블릿/데스크톱 3단계 브레이크포인트
- SpreadsheetDemo 테이블 overflow-x-auto

### Fixed

- Next.js 15 Server Component `ssr: false` 에러 수정
- ESLint 경고 수정 (normalizeOrganization 미사용 import)
- TypeScript strict mode 준수

### Technical Details

#### 빌드 성과

- **빌드 시간**: ~7.4초
- **First Load JS**: 103KB (공유), 127KB (홈페이지)
- **총 라우트**: 51개
- **타입 에러**: 0개
- **ESLint 경고**: 0개

#### 코드 통계

- **총 파일 변경**: 36개
- **총 코드 추가**: 5,102줄
- **신규 파일**: 24개
- **수정 파일**: 12개

#### 기술 스택

- Next.js 15.5.9 (App Router)
- React 19
- TypeScript 5.7
- Tailwind CSS 4.0
- Playwright 1.57.0
- Supabase (PostgreSQL)

### Breaking Changes

없음 (초기 릴리스)

### Deprecated

없음

### Removed

없음

### Security

- API 인증 미들웨어 구현
- Rate Limiting 준비 (Upstash Redis)
- CSRF 보호 구현
- Prompt Injection 방지
- Zod 입력 검증

---

## 다음 버전 (v0.2.0) 계획

### Planned

- [ ] AI 셀 함수 실제 구현
- [ ] 크롤링 자동화 (Inngest)
- [ ] 알림 시스템 (이메일/Slack)
- [ ] Upstash Redis Rate Limiting 활성화
- [ ] TED API 실시간 연동
- [ ] 나라장터 크롤러
- [ ] 대시보드 UI 완성
- [ ] 제안서 생성 AI (Claude 3.5 Sonnet)

---

[0.1.0]: https://github.com/yourusername/bidflow/releases/tag/v0.1.0
