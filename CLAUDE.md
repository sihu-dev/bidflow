# BIDFLOW - 해외 수출 입찰 자동화 플랫폼

> **목적**: 한국 제조업 SME의 글로벌 입찰 진출 지원
> **핵심**: EU TED + US SAM.gov 자동 수집 + AI 매칭
> **기술 스택**: Next.js 15 + Supabase + TailwindCSS + Claude AI
> **포트**: 3010
> **모델**: opusplan (Opus 계획 + Sonnet 실행)

---

## ⚠️ 중요: CMNTech는 목업입니다

**실제 비즈니스 모델:**

- 🌍 **해외 입찰 플랫폼** (TED, SAM.gov, GeBIZ, UN 등)
- 🎯 **타겟**: 한국 제조업 수출 SME
- 💡 **핵심 가치**: 영어 장벽 + 정보 접근성 해결

**CMNTech 관련 파일은 "컨셉 증명용 시나리오"입니다:**

- `.forge/CMNTECH_*.md` - 목업 문서
- `src/lib/data/products.ts` - 샘플 제품 카탈로그
- 실제 고객 아님!

---

## Claude Code 자동화 설정

```yaml
모델: opusplan (하이브리드)
자율성: acceptEdits (편집 자동 승인)
Extended Thinking: 활성화
Hooks: PostToolUse (자동 포맷팅)
```

### 권장 작업 패턴

1. `/init` - 프로젝트 컨텍스트 초기화
2. `think hard` - 복잡한 문제 깊은 사고
3. `#` 키 - 반복 지침 CLAUDE.md에 저장

---

## 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 3. 개발 서버 시작
pnpm dev
```

---

## 프로젝트 구조

```
bidflow-standalone/
├── bidflow/                    # Next.js 앱
│   ├── src/
│   │   ├── app/api/v1/        # API v1 버저닝
│   │   ├── lib/
│   │   │   ├── security/      # 인증, Rate Limit, CSRF
│   │   │   ├── validation/    # Zod 스키마
│   │   │   ├── domain/        # Repository, Use Cases
│   │   │   └── clients/       # TED API, 나라장터
│   │   └── components/        # UI 컴포넌트
│   └── supabase/migrations/   # DB 스키마
├── types/                      # Branded Types
├── .forge/                     # 설계 문서
└── package.json
```

---

## 핵심 문서

| 문서                                | 설명                 | 비고              |
| ----------------------------------- | -------------------- | ----------------- |
| `.forge/README.md`                  | 문서 디렉토리 가이드 | ⭐ 먼저 읽기      |
| `.forge/BID_DATA_SOURCES.md`        | 45+ 데이터 소스      | TED, SAM.gov 포함 |
| `.forge/BIDFLOW_V2_DESIGN_PART*.md` | V2 시스템 설계 (5부) | 해외 입찰 중심    |
| `.forge/BID_AUTOMATION_SPEC.md`     | 자동화 기능 명세     |                   |
| `.forge/TECH_ARCHITECTURE.md`       | 기술 아키텍처        |                   |
| `.forge/CMNTECH_*.md`               | ⚠️ **목업 문서**     | 실제 고객 아님    |

---

## 보안 구현 (완료)

| 항목             | 파일                              | 상태 |
| ---------------- | --------------------------------- | ---- |
| API 인증         | `lib/security/auth-middleware.ts` | ✅   |
| Rate Limiting    | `lib/security/rate-limiter.ts`    | ✅   |
| CSRF 보호        | `lib/security/csrf.ts`            | ✅   |
| Prompt Injection | `lib/security/prompt-guard.ts`    | ✅   |
| Zod 검증         | `lib/validation/schemas.ts`       | ✅   |

---

## API 엔드포인트

```
GET  /api/v1/bids          # 입찰 목록
POST /api/v1/bids          # 입찰 생성
GET  /api/v1/bids/:id      # 상세 조회
PATCH /api/v1/bids/:id     # 수정
DELETE /api/v1/bids/:id    # 삭제 (Admin)
```

---

## 현재 상태 (81% 완성)

### ✅ 완료

- [x] 인프라 (Supabase, Upstash, Inngest)
- [x] 5계층 보안 (Auth, CSRF, Rate Limit, Prompt Guard, Zod)
- [x] 175점 매칭 엔진
- [x] AI 셀 함수 5개 정의
- [x] 알림 시스템 (Slack, Email, Kakao)
- [x] 크롤링 스케줄러 (Inngest)
- [x] Dashboard UI (스프레드시트형)

### 🚧 진행 중

- [ ] TED API 실시간 연동
- [ ] SAM.gov API 연동
- [ ] AI 제안서 생성 (GPT-4o)
- [ ] E2E 테스트 실행
- [ ] 프로덕션 배포

## 다음 단계

**옵션 A: 포트폴리오 완성** (추천, 1주)

1. README.md 스크린샷 추가
2. 데모 영상 제작 (Loom 5분)
3. GitHub Public 전환

**옵션 B: 실제 서비스 런칭** (1-2주)

1. Supabase 프로젝트 생성 (무료)
2. Upstash Redis 설정 (무료)
3. Vercel 배포
4. TED/SAM.gov API 테스트

**옵션 C: 첫 고객 확보** (1-3개월)

1. 제조업 SME 리스트 작성 (100개)
2. 콜드 이메일 캠페인
3. 무료 파일럿 제안

자세한 내용: [NEXT_STEPS.md](/NEXT_STEPS.md)

---

## 개발 원칙

- TypeScript strict mode
- Branded Types 사용
- Zod 입력 검증
- Repository 패턴 (DDD Lite)
- API v1 버저닝

---

_BIDFLOW v0.1.0_
