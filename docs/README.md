# BIDFLOW 문서 센터

> **버전**: v0.1.0
> **업데이트**: 2025-12-21
> **프로젝트**: 입찰 자동화 시스템

---

## 📚 문서 구조

```
docs/
├── README.md (이 파일)
└── cmntech-analysis/
    ├── 00_INDEX.txt
    ├── 01_PRODUCT_CATALOG_CMENTECH.txt
    ├── 02_PRODUCTS_DATA.txt
    ├── 03_MOCK_BIDS_DATA.txt
    ├── 04_AI_SMART_FUNCTIONS.txt
    ├── 05_PRODUCT_MATCHER_LOGIC.txt
    ├── 06_BID_DATA_SOURCES.txt
    ├── 07_ENTERPRISE_PLAN.txt
    ├── 08_TEAM_POSITIONING.txt
    └── 09_PHASE3_ROADMAP_SUMMARY.txt
```

---

## 🎯 빠른 시작

### 새로운 개발자를 위한 필독 문서

| 순서 | 문서 | 설명 | 읽기 시간 |
|------|------|------|----------|
| 1️⃣ | [README.md](../README.md) | 프로젝트 개요 및 설치 가이드 | 5분 |
| 2️⃣ | [CHANGELOG.md](../CHANGELOG.md) | v0.1.0 릴리스 노트 | 3분 |
| 3️⃣ | [.forge/BID_AUTOMATION_SPEC.md](../.forge/BID_AUTOMATION_SPEC.md) | 기능 명세 | 10분 |
| 4️⃣ | [.forge/TECH_ARCHITECTURE.md](../.forge/TECH_ARCHITECTURE.md) | 기술 아키텍처 | 15분 |
| 5️⃣ | [cmntech-analysis/00_INDEX.txt](./cmntech-analysis/00_INDEX.txt) | CMNTech 제품 분석 인덱스 | 3분 |

---

## 📂 주요 문서 카테고리

### 1. 프로젝트 기본 문서

| 파일 | 설명 |
|------|------|
| [README.md](../README.md) | 프로젝트 개요, 설치, 실행 가이드 |
| [CHANGELOG.md](../CHANGELOG.md) | 버전별 변경사항 |
| [DEPLOYMENT.md](../DEPLOYMENT.md) | 배포 가이드 (Vercel, AWS, Docker) |
| [E2E_TEST_GUIDE.md](../E2E_TEST_GUIDE.md) | E2E 테스트 실행 가이드 |
| [CLAUDE.md](../CLAUDE.md) | 프로젝트 마스터 프롬프트 |

### 2. 기술 설계 문서 (.forge/)

| 파일 | 설명 |
|------|------|
| [BID_AUTOMATION_SPEC.md](../.forge/BID_AUTOMATION_SPEC.md) | 입찰 자동화 기능 명세 |
| [TECH_ARCHITECTURE.md](../.forge/TECH_ARCHITECTURE.md) | 기술 아키텍처 및 스택 |
| [UI_DESIGN_SPEC.md](../.forge/UI_DESIGN_SPEC.md) | UI/UX 디자인 시스템 |
| [BID_DATA_SOURCES.md](../.forge/BID_DATA_SOURCES.md) | 45+ 입찰 데이터 소스 |
| [PRODUCT_CATALOG_CMENTECH.md](../.forge/PRODUCT_CATALOG_CMENTECH.md) | 씨엠엔텍 제품 카탈로그 |

### 3. 비즈니스 문서 (.forge/)

| 파일 | 설명 |
|------|------|
| [BUSINESS_PLAN.md](../.forge/BUSINESS_PLAN.md) | 사업 계획서 |
| [AI_VOUCHER_ENTERPRISE_PLAN.md](../.forge/AI_VOUCHER_ENTERPRISE_PLAN.md) | AI 바우처 기업 기획 |
| [TEAM_POSITIONING.md](../.forge/TEAM_POSITIONING.md) | 팀 포지셔닝 전략 |
| [TREND_ANALYSIS_2026.md](../.forge/TREND_ANALYSIS_2026.md) | 2026 트렌드 분석 |

### 4. 개발 로드맵 (.forge/)

| 파일 | 설명 |
|------|------|
| [PHASE_1_2_COMPLETION_REPORT.md](../.forge/PHASE_1_2_COMPLETION_REPORT.md) | Phase 1-2 완료 보고서 |
| [PHASE_3_ROADMAP.md](../.forge/PHASE_3_ROADMAP.md) | Phase 3 개발 로드맵 |
| [DEVELOPMENT_PLAN.md](../.forge/DEVELOPMENT_PLAN.md) | 전체 개발 계획 |

### 5. CMNTech 분석 자료 (cmntech-analysis/)

> **파일명 규칙**: 숫자 접두어 (00-09) + 설명 + .txt

| 파일 | 설명 | 참조 원본 |
|------|------|----------|
| [00_INDEX.txt](./cmntech-analysis/00_INDEX.txt) | 전체 인덱스 | - |
| [01_PRODUCT_CATALOG_CMENTECH.txt](./cmntech-analysis/01_PRODUCT_CATALOG_CMENTECH.txt) | 5개 제품 상세 스펙 | `.forge/PRODUCT_CATALOG_CMENTECH.md` |
| [02_PRODUCTS_DATA.txt](./cmntech-analysis/02_PRODUCTS_DATA.txt) | TypeScript 제품 데이터 | `src/lib/data/products.ts` |
| [03_MOCK_BIDS_DATA.txt](./cmntech-analysis/03_MOCK_BIDS_DATA.txt) | 6개 샘플 입찰 | `src/lib/data/mock-bids.ts` |
| [04_AI_SMART_FUNCTIONS.txt](./cmntech-analysis/04_AI_SMART_FUNCTIONS.txt) | 5개 AI 함수 | `src/lib/data/ai-functions.ts` |
| [05_PRODUCT_MATCHER_LOGIC.txt](./cmntech-analysis/05_PRODUCT_MATCHER_LOGIC.txt) | 매칭 알고리즘 | `src/lib/matching/enhanced-matcher.ts` |
| [06_BID_DATA_SOURCES.txt](./cmntech-analysis/06_BID_DATA_SOURCES.txt) | 45+ 데이터 소스 | `.forge/BID_DATA_SOURCES.md` |
| [07_ENTERPRISE_PLAN.txt](./cmntech-analysis/07_ENTERPRISE_PLAN.txt) | 엔터프라이즈 기획 | `.forge/AI_VOUCHER_ENTERPRISE_PLAN.md` |
| [08_TEAM_POSITIONING.txt](./cmntech-analysis/08_TEAM_POSITIONING.txt) | 팀 비전 및 전략 | `.forge/TEAM_POSITIONING.md` |
| [09_PHASE3_ROADMAP_SUMMARY.txt](./cmntech-analysis/09_PHASE3_ROADMAP_SUMMARY.txt) | 로드맵 요약 | `.forge/PHASE_3_ROADMAP.md` |

### 6. Claude Code 설정 (.claude/)

| 디렉토리/파일 | 설명 |
|---------------|------|
| `.claude/CLAUDE.md` | 마스터 프롬프트 및 워크플로우 |
| `.claude/rules/bidflow-rules.md` | 프로젝트별 규칙 |
| `.claude/agents/` | 17개 전문 에이전트 정의 |
| `.claude/commands/` | 6개 커스텀 명령어 (/audit, /review 등) |
| `.claude/skills/` | 6개 스킬 (api-integration, bid-automation 등) |
| `.claude/audit-reports/` | 검수 보고서 (디자인, MCP 등) |

### 7. 테스트 문서

| 파일 | 설명 |
|------|------|
| [E2E_TEST_GUIDE.md](../E2E_TEST_GUIDE.md) | E2E 테스트 실행 가이드 |
| `playwright.config.ts` | Playwright 설정 |
| `tests/e2e/spreadsheet-demo.spec.ts` | SpreadsheetDemo E2E 테스트 (10개) |
| `tests/e2e/landing-sections.spec.ts` | 랜딩 페이지 E2E 테스트 (23개) |

---

## 🔍 핵심 기능별 문서 찾기

### 입찰 자동화
1. [BID_AUTOMATION_SPEC.md](../.forge/BID_AUTOMATION_SPEC.md) - 전체 기능 명세
2. [BID_DATA_SOURCES.md](../.forge/BID_DATA_SOURCES.md) - 45+ 데이터 소스
3. [06_BID_DATA_SOURCES.txt](./cmntech-analysis/06_BID_DATA_SOURCES.txt) - 크롤링 우선순위

### CMNTech 제품 매칭
1. [PRODUCT_CATALOG_CMENTECH.md](../.forge/PRODUCT_CATALOG_CMENTECH.md) - 5개 제품 카탈로그
2. [01_PRODUCT_CATALOG_CMENTECH.txt](./cmntech-analysis/01_PRODUCT_CATALOG_CMENTECH.txt) - 제품 상세 스펙
3. [05_PRODUCT_MATCHER_LOGIC.txt](./cmntech-analysis/05_PRODUCT_MATCHER_LOGIC.txt) - 매칭 알고리즘
4. `src/lib/matching/enhanced-matcher.ts` - 실제 구현 코드

### AI 스마트 함수
1. [04_AI_SMART_FUNCTIONS.txt](./cmntech-analysis/04_AI_SMART_FUNCTIONS.txt) - 5개 함수 정의
2. `src/lib/data/ai-functions.ts` - TypeScript 정의
3. `src/components/landing/SpreadsheetDemo/` - 데모 UI 구현

### UI/UX 디자인
1. [UI_DESIGN_SPEC.md](../.forge/UI_DESIGN_SPEC.md) - 디자인 시스템
2. `.claude/audit-reports/design-audit-2025-12-21.md` - 디자인 검수 결과
3. `src/components/landing/` - 9개 랜딩 페이지 섹션 구현

### 배포 및 운영
1. [DEPLOYMENT.md](../DEPLOYMENT.md) - 배포 가이드 (Vercel, AWS, Docker)
2. [CHANGELOG.md](../CHANGELOG.md) - 버전 히스토리
3. [E2E_TEST_GUIDE.md](../E2E_TEST_GUIDE.md) - 테스트 가이드

---

## 🧭 학습 경로

### 1주차: 프로젝트 이해
- [ ] README.md 읽기
- [ ] CHANGELOG.md v0.1.0 확인
- [ ] BID_AUTOMATION_SPEC.md 기능 파악
- [ ] cmntech-analysis/00_INDEX.txt 읽기

### 2주차: 기술 스택
- [ ] TECH_ARCHITECTURE.md 아키텍처 이해
- [ ] UI_DESIGN_SPEC.md 디자인 시스템 학습
- [ ] src/lib/matching/enhanced-matcher.ts 코드 분석
- [ ] tests/e2e/ E2E 테스트 실행

### 3주차: 비즈니스 모델
- [ ] BUSINESS_PLAN.md 사업 계획 이해
- [ ] AI_VOUCHER_ENTERPRISE_PLAN.md 기획안 검토
- [ ] PHASE_3_ROADMAP.md 다음 개발 계획 파악

---

## 📊 CMNTech 5개 제품 요약

| ID | 제품명 | 카테고리 | 우선순위 | 키워드 |
|----|--------|----------|----------|--------|
| **UR-1000PLUS** | 다회선 초음파 유량계 | 상수도 | P1 (핵심) | 초음파, 상수도, DN300-4000 |
| **MF-1000C** | 일체형 전자 유량계 | 상거래 | P2 | 전자, 공업용수 |
| **UR-1010PLUS** | 비만관형 유량계 | 하수처리 | P1 (핵심) | 비만관, 하수, 우수 |
| **SL-3000PLUS** | 개수로 유량계 | 하천/수로 | P2 | 개수로, 하천, 농업용수 |
| **EnerRay** | 초음파 열량계 | 에너지 | P3 | 열량계, 에너지, 난방 |

**주요 타겟 기관**: K-water, 서울시 상수도본부, 환경부, 한전, 농어촌공사, 지역난방공사

---

## 🔗 외부 링크

| 리소스 | URL |
|--------|-----|
| **TED API** | https://ted.europa.eu/api |
| **나라장터** | https://www.g2b.go.kr |
| **Vercel 배포** | https://vercel.com |
| **Supabase** | https://supabase.com |
| **씨엠엔텍** | http://www.cmentech.co.kr |

---

## 📝 문서 컨벤션

### 파일명 규칙
- **대문자**: 프로젝트 루트 문서 (README.md, CHANGELOG.md)
- **소문자**: 컴포넌트/모듈 문서 (component-name.md)
- **숫자 접두어**: cmntech-analysis 시리즈 (00-09)

### 마크다운 스타일
- Heading: `#` (H1), `##` (H2), `###` (H3)
- 코드 블록: ` ```typescript ` (언어 명시)
- 테이블: GitHub Flavored Markdown
- 링크: 상대 경로 우선

### 버전 관리
- 모든 문서에 업데이트 날짜 명시
- 주요 변경사항은 CHANGELOG.md에 기록

---

## 🛠️ 문서 관리

### 새 문서 추가 시
1. 적절한 디렉토리에 파일 생성
2. 이 README.md 업데이트 (해당 섹션에 링크 추가)
3. Git 커밋 메시지: `docs: add [문서명]`

### 문서 업데이트 시
1. 파일 상단 업데이트 날짜 변경
2. CHANGELOG.md에 변경사항 기록 (주요 업데이트)
3. Git 커밋 메시지: `docs: update [문서명] - [변경 요약]`

### 문서 삭제 시
1. 이 README.md에서 링크 제거
2. 참조하는 다른 문서도 업데이트
3. Git 커밋 메시지: `docs: remove [문서명] - [삭제 사유]`

---

## ❓ FAQ

### Q1. 어떤 문서부터 읽어야 하나요?
**A**: [빠른 시작](#-빠른-시작) 섹션의 1️⃣ → 5️⃣ 순서대로 읽으세요.

### Q2. CMNTech 제품 정보는 어디에 있나요?
**A**: `cmntech-analysis/01_PRODUCT_CATALOG_CMENTECH.txt` 또는 `.forge/PRODUCT_CATALOG_CMENTECH.md`

### Q3. 배포 방법은 어디서 확인하나요?
**A**: [DEPLOYMENT.md](../DEPLOYMENT.md) - Vercel, AWS, Docker 가이드 포함

### Q4. E2E 테스트 실행이 안 되는데요?
**A**: [E2E_TEST_GUIDE.md](../E2E_TEST_GUIDE.md) 참조 - WSL 환경 해결책 포함

### Q5. 다음 개발 계획은 무엇인가요?
**A**: [PHASE_3_ROADMAP.md](../.forge/PHASE_3_ROADMAP.md) 또는 [CHANGELOG.md](../CHANGELOG.md) "다음 버전 계획" 섹션

---

## 📞 문의

- **이메일**: support@bidflow.com
- **GitHub Issues**: https://github.com/yourusername/bidflow/issues
- **회사 연락처**: 031-702-4910 (씨엠엔텍)

---

**버전**: v0.1.0
**최종 업데이트**: 2025-12-21
**문서 관리자**: BIDFLOW 개발팀
