# FORGEONE 입찰 자동화 시스템 설계

> **생성일**: 2025-12-19
> **타겟**: 제조업 중소기업 (HTCM, 유량계 회사 등)
> **핵심 Pain Point**: 입찰 놓침, 체계 없음, 서류 수작업

---

## Executive Summary

| 항목       | 내용                                 |
| ---------- | ------------------------------------ |
| **제품**   | 입찰 관리 + AI 서류 자동화 웹앱      |
| **UI**     | 구글시트형 스프레드시트 + AI 셀 함수 |
| **차별화** | =AI() 셀 함수로 서류 자동 생성       |
| **수익**   | AI바우처 B2B (₩50-200M/건)           |

---

## 1. 핵심 Pain Point

| Pain        | 현재           | 자동화 후       |
| ----------- | -------------- | --------------- |
| 입찰 놓침   | 수동 확인      | 자동 알림       |
| 체계 없음   | 엑셀/메일 분산 | 파이프라인 통합 |
| 서류 수작업 | 3-5일          | AI 30분         |

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORGEONE 입찰 자동화                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│  │  입찰 발견   │ → │  입찰 관리   │ → │  서류 생성   │            │
│  │  (크롤링)   │   │ (파이프라인) │   │    (AI)     │            │
│  └─────────────┘   └─────────────┘   └─────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              구글시트형 스프레드시트 UI                   │    │
│  │         =AI() 셀 함수로 어디서든 AI 호출                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 기능 모듈

### 3.1 입찰 발견

| 기능        | 설명                      |
| ----------- | ------------------------- |
| 자동 크롤링 | 나라장터, 조달청, 한전 등 |
| 키워드 필터 | 유량계, 계측기, 밸브 등   |
| 알림        | 카카오톡, 이메일, 슬랙    |
| AI 요약     | 공고 핵심 내용 요약       |

### 3.2 입찰 관리

| 기능        | 설명                      |
| ----------- | ------------------------- |
| 파이프라인  | 발견→검토→준비→제출→결과  |
| D-Day 관리  | 마감일 자동 계산, 알림    |
| 통계        | 참여율, 낙찰률, 금액 분석 |
| 담당자 배정 | 팀원별 할당               |

### 3.3 서류 생성 (AI)

| 기능             | 설명                    |
| ---------------- | ----------------------- |
| 제안서 자동 생성 | 과거 자료 기반          |
| 가격제안서       | 경쟁 분석 기반 추천가   |
| 기술사양서       | 제품 정보 자동 구성     |
| 회사 자료 관리   | 사업자등록증, 인증서 등 |

---

## 4. AI 셀 함수

```
=AI(prompt)              → 자연어로 뭐든 생성
=AI_SUMMARY(range)       → 범위 요약
=AI_EXTRACT(file, field) → PDF에서 필드 추출
=AI_SCORE(bidId)         → 낙찰 확률 예측
=AI_PROPOSAL(bidId)      → 제안서 초안 생성
=AI_PRICE(bidId, margin) → 적정 가격 추천
```

---

## 5. 기술 스택

| 레이어       | 기술                                |
| ------------ | ----------------------------------- |
| Frontend     | Next.js 15, React 19, TailwindCSS 4 |
| 스프레드시트 | Handsontable 또는 AG Grid           |
| Backend      | Next.js API Routes, Supabase        |
| AI           | Claude API (문서 생성/분석)         |
| 크롤링       | Playwright, Cheerio, Inngest        |
| 알림         | 카카오 알림톡, Resend, Slack        |

---

## 6. 데이터 모델

### 핵심 테이블

```sql
bids              -- 입찰 공고
bid_pipeline      -- 파이프라인 상태
documents         -- 생성된 서류
company_assets    -- 회사 자료 (재사용)
sheet_data        -- 스프레드시트 데이터
```

---

## 7. MVP 우선순위

| 순위 | 기능                    | 기간 |
| ---- | ----------------------- | ---- |
| P0   | 입찰 수동 등록 + 시트뷰 | 1주  |
| P0   | 파이프라인 관리         | 1주  |
| P0   | 마감 알림 (카톡)        | 3일  |
| P1   | AI 서류 생성            | 2주  |
| P1   | 나라장터 크롤링         | 1주  |
| P2   | AI 셀 함수              | 2주  |

**MVP 총 개발: 약 6-8주**

---

## 8. 엑셀 AI 트렌드 참조

### 벤치마크

| 서비스                                                                                                                                                         | 특징                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| [MS Copilot =COPILOT()](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/bring-ai-to-your-formulas-with-the-copilot-function-in-excel/4443487) | 셀 내 AI 호출        |
| [Google Sheets =AI()](https://www.geekwire.com/2025/excel-formula-meets-ai-prompt-microsoft-brings-new-copilot-function-to-spreadsheet-cells/)                 | Gemini 통합          |
| [Rows.com](https://rows.com/ai)                                                                                                                                | =ASK_OPENAI() 함수   |
| [Paradigm](https://techcrunch.com/2025/08/18/why-paradigm-built-a-spreadsheet-with-an-ai-agent-in-every-cell/)                                                 | 셀마다 AI Agent      |
| [AppSheet + Gemini](https://workspace.google.com/blog/ai-and-machine-learning/democratizing-app-development-using-appsheet-gemini)                             | PDF/이미지 자동 추출 |

### 적용 포인트

1. **=AI() 셀 함수**: 어디서든 AI 호출
2. **자동 갱신**: 데이터 변경 시 AI 결과 자동 업데이트
3. **PDF 추출**: 공고문에서 핵심 정보 자동 추출
4. **Agent Mode**: 멀티스텝 작업 자동화

---

## 9. 즉시 실행

| 순서 | 액션                             | 기한    |
| ---- | -------------------------------- | ------- |
| 1    | HTCM 미팅 - Pain Point 상세 확인 | 이번 주 |
| 2    | 현재 입찰 프로세스 관찰          | D+7     |
| 3    | 서류 샘플 수집                   | D+7     |
| 4    | Figma 목업 제작                  | D+14    |
| 5    | MVP 개발 착수                    | D+21    |

---

## Sources

- [MS Excel COPILOT Function](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/bring-ai-to-your-formulas-with-the-copilot-function-in-excel/4443487)
- [Google Sheets AI](https://www.geekwire.com/2025/excel-formula-meets-ai-prompt-microsoft-brings-new-copilot-function-to-spreadsheet-cells/)
- [Rows AI](https://rows.com/ai)
- [Paradigm $7M Raise](https://techcrunch.com/2025/08/18/why-paradigm-built-a-spreadsheet-with-an-ai-agent-in-every-cell/)
- [AppSheet Gemini](https://workspace.google.com/blog/ai-and-machine-learning/democratizing-app-development-using-appsheet-gemini)

---

_Generated by Claude 4.5 Opus_
_Version: 1.0_
