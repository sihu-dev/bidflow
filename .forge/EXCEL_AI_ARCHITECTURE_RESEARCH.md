# 스프레드시트 AI 아키텍처 비교 연구 (2025)

> **목적**: BIDFLOW 최적 스프레드시트 기술 스택 결정
> **조사일**: 2025-12-20
> **결론**: 웹앱 형태 (Handsontable + 커스텀 AI)

---

## 1. 플랫폼별 AI 기능 비교

### 1.1 Microsoft Excel + Copilot (2025)

| 기능 | 상세 | BIDFLOW 적용 가능성 |
|------|------|---------------------|
| **Python in Excel** | 셀에서 직접 Python 실행 | ❌ 데스크톱 전용 |
| **COPILOT 함수** | `=COPILOT("요약해줘", A1:B10)` | ⚠️ M365 구독 필요 |
| **Agent Mode** | 자동 리파인, 전문가 수준 자동화 | ❌ 엔터프라이즈 전용 |
| **Think Deeper** | 추론 모델로 심층 분석 | ❌ M365 Copilot 필요 |

**장점**:
- 가장 강력한 AI 기능
- Python 직접 실행
- 기존 .xlsx 호환

**단점**:
- M365 구독 필수 ($30/user/month)
- 데스크톱 앱 의존성
- 커스터마이징 제한

**Sources**:
- [Microsoft 365 Copilot Wave 2](https://www.microsoft.com/en-us/microsoft-365/blog/2024/09/16/microsoft-365-copilot-wave-2-pages-python-in-excel-and-agents/)
- [Excel Copilot 일반 출시](https://techcommunity.microsoft.com/blog/excelblog/unlock-the-power-of-copilot-in-excel-now-generally-available/4242810)
- [Excel Copilot with Python](https://support.microsoft.com/en-us/office/copilot-in-excel-with-python-364e4ae9-9343-4d56-952a-5f62b0f70db6)

---

### 1.2 Google Sheets + Gemini (2025)

| 기능 | 상세 | BIDFLOW 적용 가능성 |
|------|------|---------------------|
| **=AI() 함수** | `=AI("분류해줘", A1)` | ⚠️ Workspace 구독 |
| **Help Me Analyze** | 24/7 분석가 AI | ⚠️ Workspace Labs |
| **Workspace Studio** | 커스텀 AI 에이전트 빌더 | ⚠️ 2025-12월 출시 |
| **Workspace Flows** | 멀티스텝 자동화 + Gems | ⚠️ 엔터프라이즈 |

**장점**:
- 실시간 협업
- 웹 네이티브
- API 연동 용이
- Gemini 통합

**단점**:
- AI 기능은 Workspace 구독 필요
- 데이터 소유권 우려
- 오프라인 제한

**Sources**:
- [Google Workspace Studio](https://workspaceupdates.googleblog.com/2025/12/workspace-studio.html)
- [Gemini in Google Sheets](https://workspace.google.com/resources/spreadsheet-ai/)
- [Generate Data with Gemini](https://workspaceupdates.googleblog.com/2025/06/generate-data-with-gemini-in-google-sheets.html)

---

### 1.3 웹앱 스프레드시트 프레임워크

| 라이브러리 | 라이선스 | 가격 | AI 통합 | BIDFLOW 적합도 |
|------------|----------|------|---------|----------------|
| **Handsontable** | Commercial | $999+/dev | 커스텀 | ✅ 현재 사용중 |
| **AG Grid** | MIT/Commercial | $999/dev | 커스텀 | ✅ 대안 |
| **Jspreadsheet** | MIT/Commercial | $499/year | 커스텀 | ⚠️ 기능 제한 |
| **SpreadJS** | Commercial | 견적 | 커스텀 | ⚠️ 고가 |
| **RevoGrid** | MIT | 무료 | 커스텀 | ⚠️ 생태계 작음 |
| **EtherCalc** | MIT | 무료 | 없음 | ❌ 기능 부족 |
| **Bricks** | SaaS | 구독 | 내장 AI | ⚠️ 의존성 |

**Sources**:
- [Handsontable Alternatives](https://alternativeto.net/software/handsontable/)
- [Top 5 Handsontable Alternatives](https://www.thefrontendcompany.com/posts/handsontable-alternatives)
- [JS Spreadsheets 비교](https://jspreadsheets.com/)

---

## 2. 기술 아키텍처 비교

### Option A: Excel 파일 기반 (전통적)

```
[사용자] → [Excel 파일 (.xlsx)] → [VBA/Office Scripts] → [Power Automate]
                                            ↓
                                    [Copilot AI] (M365)
```

**장점**: 익숙함, 오프라인, 강력한 수식
**단점**: 협업 제한, 버전 관리 어려움, AI 제한적

---

### Option B: Google Sheets 기반 (클라우드)

```
[사용자] ←→ [Google Sheets] ←→ [Apps Script] ←→ [Gemini API]
                ↓
        [Workspace Flows] → [멀티스텝 자동화]
```

**장점**: 실시간 협업, 무료 시작, API 풍부
**단점**: 인터넷 필수, 데이터 보안 우려, 커스터마이징 한계

---

### Option C: 웹앱 기반 (BIDFLOW 현재) ✅ 권장

```
[사용자] ←→ [Next.js 웹앱]
                ↓
        [Handsontable Grid] ←→ [Custom AI Layer]
                ↓                      ↓
        [Supabase DB]           [Claude API]
                ↓                      ↓
        [실시간 동기화]          [AI 셀 함수]
```

**장점**:
- 완전한 제어권
- 커스텀 AI 함수 자유롭게 구현
- 브랜딩/UI 완전 커스터마이징
- 데이터 소유권 100%
- 오프라인 캐싱 가능 (PWA)

**단점**:
- 개발/유지보수 비용
- 기본 수식 엔진 직접 구현 필요

---

## 3. BIDFLOW 권장 아키텍처

### 3.1 핵심 스택

```yaml
UI Layer:
  - Framework: Next.js 15 (App Router)
  - Spreadsheet: Handsontable 14+
  - Components: shadcn/ui + Radix UI
  - State: React Hooks + Zustand (필요시)

AI Layer:
  - Primary: Claude API (Anthropic)
  - Formula: =AI_SUMMARY(), =AI_SCORE(), =AI_PROPOSAL()
  - Prompt: 커스텀 템플릿 라이브러리

Data Layer:
  - Database: Supabase (PostgreSQL)
  - Realtime: Supabase Realtime
  - Cache: Redis (Upstash)
  - Files: Supabase Storage

Export/Share:
  - Excel: xlsx 라이브러리
  - Google Sheets: gapi (선택)
  - PDF: @react-pdf/renderer
```

### 3.2 AI 셀 함수 아키텍처

```typescript
// 커스텀 AI 함수 구조
interface AICellFunction {
  name: string;                    // "AI_SUMMARY"
  description: string;             // "공고 요약"
  execute: (context: CellContext) => Promise<AIResult>;
}

// 실행 흐름
1. 사용자 입력: =AI_SUMMARY(A1:D1)
2. FormulaBar 파싱 → AI 함수 감지
3. API 호출: POST /api/v1/ai/formula
4. Claude API 호출 (컨텍스트 포함)
5. 결과 캐싱 + 셀 업데이트
```

### 3.3 Export 전략

| 형식 | 라이브러리 | 용도 |
|------|------------|------|
| **.xlsx** | `xlsx` / `exceljs` | Excel 호환 배포 |
| **.csv** | 내장 | 범용 데이터 교환 |
| **.pdf** | `@react-pdf/renderer` | 보고서/제안서 |
| **Google Sheets** | Google Sheets API | 실시간 공유 (선택) |

---

## 4. 글로벌 AI 스프레드시트 스타트업 동향 (2025)

### 4.1 Paradigm - 셀마다 AI 에이전트 🔥 **HOT**

> "AI-powered spreadsheet with an AI agent in every cell"
> **창업자**: Anna Monaco (22세, UPenn), Y Combinator 출신
> **펀딩**: $7M (General Catalyst 리드)

| 특징 | 상세 |
|------|------|
| **핵심 기술** | 5,000+ AI 에이전트, 셀별 프롬프트 할당 |
| **속도** | 분당 5,000셀 자동 생성 (1000x 빠름) |
| **모델** | Anthropic, OpenAI, Gemini 멀티모델 |
| **고객** | EY, Etched, Cognition |
| **가격** | $20/월~ |

**아키텍처 인사이트**:
- 각 셀이 독립적인 AI 에이전트로 동작
- 웹 크롤링 + 데이터 수집 자동화
- 프롬프트 기반 컬럼 정의

**Sources**:
- [TechCrunch: Paradigm 스프레드시트](https://techcrunch.com/2025/08/18/why-paradigm-built-a-spreadsheet-with-an-ai-agent-in-every-cell/)
- [VentureBeat: Paradigm 런칭](https://venturebeat.com/ai/paradigm-launches-to-reinvent-the-spreadsheet-with-generative-ai-filling-in-500-cells-per-minute)

---

### 4.2 Genspark AI Sheets 🔥 **NEW (2025-11)**

> "The Excel you know, now on autopilot"
> **런칭**: 2025년 5월 (2.0: 2025년 11월)

| 특징 | 상세 |
|------|------|
| **Auto Data Collection** | 회사, 제품, 인물 자동 검색 |
| **AI = New Formula** | 배치 처리 with AI 모델 |
| **Personal Analyst** | 자연어로 데이터 분석/시각화 |
| **Import** | PDF, Word, 이미지 → 테이블 변환 |
| **Export** | .xlsx 완벽 호환 |

**AI Sheets 2.0 (2025-11) 신기능**:
- Jupyter 코드 자동 실행
- SQL 쿼리 자동 생성
- 데이터베이스 직접 연결

**Sources**:
- [Genspark AI Sheets](https://www.genspark.ai/agents?type=sheets_agent_new)
- [Medium: Genspark AI Sheets 분석](https://medium.com/the-ai-entrepreneurs/genspark-ai-sheets-transform-data-into-insights-in-minutes-6eec149d886d)

---

### 4.3 Quadratic - Python 네이티브 스프레드시트

> "A spreadsheet that speaks Python natively"
> **펀딩**: $6M+ (GV 리드, Pandas 창시자 투자)
> **사용자**: 200,000+

| 특징 | 상세 |
|------|------|
| **핵심** | 스프레드시트 내 Python/SQL 직접 실행 |
| **타겟** | 데이터 분석가, 개발자 |
| **장점** | 비개발자와 협업 가능한 스프레드시트 형태 |

**Sources**:
- [TechCrunch: Quadratic](https://techcrunch.com/2024/04/02/quadratic-is-reimagining-the-spreadsheet-with-a-focus-on-data/)
- [Quadratic 공식](https://www.quadratichq.com/)

---

### 4.4 Rows - AI Analyst 내장

> "World's first AI Analyst in spreadsheets"
> **펀딩**: €8M (Indico Capital, Cherry Ventures)
> **본사**: 베를린

| 특징 | 상세 |
|------|------|
| **AI Analyst** | 세계 최초 스프레드시트 내장 AI 분석가 |
| **통합** | 50+ 외부 서비스 네이티브 연동 |
| **UX** | Excel/Sheets 기능 100% + 고유 레이아웃 |

**Sources**:
- [EU-Startups: Rows](https://www.eu-startups.com/2024/05/berlin-based-rows-raises-e8-million-to-spread-ai-powered-spreadsheets-around-the-world/)

---

### 4.5 Equals - 분석 특화 스프레드시트

> "Supercharged spreadsheet for analytics"
> **펀딩**: $16M Series A (a16z 리드)
> **창업자**: 前 Intercom 엔지니어

| 특징 | 상세 |
|------|------|
| **DB 연결** | 데이터베이스 네이티브 연결 |
| **버전 관리** | Git 스타일 히스토리 |
| **협업** | 실시간 멀티유저 |

**Sources**:
- [TechCrunch: Equals](https://techcrunch.com/2022/11/09/equals-secures-15m-investment-to-supercharge-spreadsheets/)

---

### 4.6 Airtable Cobuilder + Omni AI (2025)

> "No-code app creation powered by AI"
> **최신**: Omni AI (Cobuilder + Assistant 통합)

| 특징 | 상세 |
|------|------|
| **Cobuilder** | 자연어 → 앱 자동 생성 |
| **Omni AI** | 레코드 일괄 추가/편집 |
| **Field Agents** | AI 필드가 복잡한 액션 수행 |
| **PDF 분석** | 수천 페이지 PDF → 테이블 추출 |

**가격**: $20-45/user/월 + AI 크레딧

**Sources**:
- [Airtable Cobuilder](https://blog.airtable.com/airtable-cobuilder-launch/)
- [VentureBeat: Airtable AI](https://venturebeat.com/ai/forget-coding-bootcamps-airtables-ai-can-build-your-app-in-seconds/)

---

### 4.7 Coda AI - 문서+테이블+자동화

> "Docs that work like apps"

| 특징 | 상세 |
|------|------|
| **AI Column** | 데이터 → 인사이트 자동 변환 |
| **AI Agents** | 디지털 팀원으로서 자동 수식/시각화 |
| **Automation** | 트리거 기반 규칙 엔진 |

**Sources**:
- [Coda AI Guide](https://bestaiprojecthub.com/execution-collaboration/coda-overview-features)

---

### 4.8 Notion AI (3.0) - 에이전트 진화

> "AI Agents execute work, not just suggest"
> **런칭**: 2025년 9월

| 특징 | 상세 |
|------|------|
| **AI Agents** | 제안이 아닌 실행 (자율 수행) |
| **Selective Knowledge** | 특정 페이지만 참조 가능 |
| **6개 뷰** | Table, Board, Calendar, Timeline, Gallery, List |

**제한**: 10,000행 이상 시 성능 저하

**Sources**:
- [Notion AI Review 2025](https://max-productive.ai/ai-tools/notion-ai/)

---

## 4.9 경쟁 환경 요약

| 제품 | 핵심 강점 | 가격 | BIDFLOW 위협도 |
|------|----------|------|----------------|
| **Paradigm** | 셀별 AI 에이전트 | $20/월 | ⚠️ 중간 |
| **Genspark** | 올인원 AI 워크스페이스 | 미정 | ⚠️ 중간 |
| **Quadratic** | Python 네이티브 | 무료/유료 | 🟢 낮음 |
| **Rows** | AI Analyst | 무료/유료 | 🟢 낮음 |
| **Equals** | DB 분석 특화 | 유료 | 🟢 낮음 |
| **Airtable** | 노코드 앱 빌더 | $20+/user | ⚠️ 중간 |
| **Coda** | 문서+테이블 통합 | $10+/user | 🟢 낮음 |
| **Notion** | 올인원 워크스페이스 | $10+/user | 🟢 낮음 |

**BIDFLOW 차별화 전략**:
1. **도메인 특화**: 한국 공공조달/입찰 전문
2. **데이터 소스**: 나라장터, TED, SAM.gov 직접 연동
3. **AI 프롬프트**: 입찰 분석 특화 템플릿
4. **온프레미스**: 자체 호스팅 가능 (데이터 보안)

---

## 5. 결론 및 권장사항

### 5.1 BIDFLOW 최적 선택: **웹앱 형태 유지**

| 요소 | 결정 | 이유 |
|------|------|------|
| **플랫폼** | 웹앱 (PWA) | 접근성, 커스터마이징 |
| **스프레드시트** | Handsontable 유지 | 이미 통합됨, 안정성 |
| **AI** | Claude API | 최고 품질, 한국어 지원 |
| **Export** | xlsx + Google Sheets API | 범용성 |

### 5.2 구현 우선순위

1. **Phase 3**: AI 프롬프트 템플릿 라이브러리 ← 현재 진행
2. **Phase 4**: Excel Export 강화 (exceljs)
3. **Phase 5**: Google Sheets 연동 (선택)
4. **Phase 6**: PWA + 오프라인 지원

### 5.3 기본 스프레드시트 기능 체크리스트

- [x] 셀 선택/편집
- [x] FormulaBar
- [x] 정렬/필터
- [x] 검색
- [ ] 기본 수식 (SUM, AVERAGE) - HyperFormula 필요
- [ ] 조건부 서식
- [ ] 셀 병합
- [ ] 고정 행/열
- [ ] Excel Import/Export
- [ ] 실시간 협업 (Supabase Realtime)

---

## 6. 참고 자료

### Microsoft
- [What's New in Excel (September 2025)](https://techcommunity.microsoft.com/blog/excelblog/whats-new-in-excel-september-2025/4448368)
- [Copilot Studio November 2025](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/whats-new-in-microsoft-copilot-studio-november-2025/)

### Google
- [Workspace Studio](https://workspaceupdates.googleblog.com/2025/12/workspace-studio.html)
- [Gemini in Sheets Guide](https://www.kdnuggets.com/a-beginners-guide-to-mastering-gemini-google-sheets)

### Open Source
- [AG Grid Alternatives](https://www.infragistics.com/blogs/ag-grid-alternatives/)
- [Awesome Grid GitHub](https://github.com/FancyGrid/awesome-grid)

---

*문서 작성: Claude Code (Opus 4.5)*
*BIDFLOW v0.1.0*
