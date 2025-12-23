# 📁 .forge/ 디렉토리

> **설계 문서 및 비즈니스 계획 보관소**

---

## ⚠️ 중요 안내

### CMNTech 관련 문서는 **목업(Mock-up)**입니다
다음 파일들은 실제 고객이 아닌 **컨셉 증명용 시나리오**입니다:
- `CMNTECH_*.md` - 씨엠엔텍 유량계 회사 목업
- `PRODUCT_CATALOG_CMENTECH.md` - 제품 카탈로그 샘플
- `CMNTECH_BIDFLOW_SERVICE_STORY.md` - 서비스 스토리 예시

**실제 비즈니스 모델:** 해외 수출 입찰 플랫폼 (TED, SAM.gov)

---

## 📂 문서 분류

### 핵심 설계 문서
- `BIDFLOW_V2_DESIGN_PART*.md` - V2 시스템 설계 (5부작)
- `BID_AUTOMATION_SPEC.md` - 자동화 기능 명세
- `BID_DATA_SOURCES.md` - 45+ 데이터 소스 가이드

### 비즈니스 계획
- `BUSINESS_PLAN.md` - **HEPHAITOS** 트레이딩 교육 플랫폼 (별도 사업)
- `AI_VOUCHER_ENTERPRISE_PLAN.md` - AI 바우처 전략

### 기술 문서
- `AI_SPREADSHEET_ARCHITECTURE.md` - AI 셀 함수 아키텍처
- `TECH_ARCHITECTURE.md` - 기술 스택
- `UI_DESIGN_SPEC.md` - UI/UX 설계

### 도메인 리서치
- `FLOWMETER_AI_INTEGRATION_PLAN.md` - 유량계 AI 접목
- `CMNTECH_FLOWMETER_AI_PATENT_FINAL.md` - AI 특허 전략
- `CMNTECH_SLUDGE_AI_STRATEGY.md` - Sludge AI 전략

---

## 🎯 실제 비즈니스 모델

**BIDFLOW = 해외 수출 입찰 자동화 플랫폼**

```yaml
타겟 시장: 제조업 SME의 해외 진출
핵심 가치: EU TED + US SAM.gov 입찰 자동 발굴
차별화: 국내+해외 통합 대시보드, AI 제안서
수익 모델: SaaS 구독 + 성공 보수
```

### 해외 입찰의 중요성
- 국내 시장: 레드오션, 가격 경쟁
- 해외 시장: 블루오션, 높은 단가
- Pain Point: 영어 장벽, 정보 접근성

### 해결 방법
1. TED/SAM.gov API 자동 수집
2. AI 번역 + 요약
3. 한국 제품 자동 매칭
4. 영문 제안서 AI 생성

---

*이 디렉토리의 문서들은 설계 및 컨셉 증명용입니다.*
*실제 구현은 `/src` 디렉토리를 참고하세요.*
