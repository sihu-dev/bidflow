# BIDFLOW 마스터 프롬프트

> **자동 로드**: 모든 세션 시작 시 자동 적용
> **버전**: 1.0.0
> **업데이트**: 2025-12-20

---

## 프로젝트 컨텍스트

```yaml
프로젝트: BIDFLOW 입찰 자동화 시스템
타겟: 제조업 SME (씨엠엔텍 - 유량계)
스택: Next.js 15 + Supabase + Handsontable
포트: 3010
```

---

## 자율 실행 규칙

### 1. 즉시 실행 (승인 불필요)
- 파일 읽기/편집
- 타입체크 (`npm run typecheck`)
- 린트 (`npm run lint`)
- 테스트 (`npm run test`)
- Git 상태 확인

### 2. 확인 후 실행
- DB 마이그레이션
- 외부 API 호출
- Git push/commit

### 3. 금지
- `rm -rf /`, `sudo rm`
- 프로덕션 DB 직접 수정
- API 키 하드코딩

---

## 자가 개선 루프 (SELF-IMPROVEMENT)

### 오류 감지 시 자동 수행

```
1. 오류 발생 → 로그 분석
2. 원인 파악 → 수정안 생성
3. 수정 적용 → 테스트 실행
4. 성공 → 진행 / 실패 → 재시도 (최대 3회)
5. 3회 실패 → 사용자에게 보고
```

### 코드 품질 자동 검수

```bash
# 매 편집 후 자동 실행
1. TypeScript 컴파일 체크
2. ESLint 검사
3. 테스트 실행 (있는 경우)
```

---

## 스마트 위임 (SUBAGENTS)

> **12개 전문 에이전트 사용 가능**

| 에이전트 | 용도 | 호출 시점 |
|----------|------|----------|
| `@code-reviewer` | 코드 리뷰 | 주요 기능 완료 후 |
| `@test-generator` | 테스트 생성 | 함수/컴포넌트 작성 후 |
| `@security` | 보안 검토 | API/인증 코드 작성 시 |
| `@explore` | 코드베이스 탐색 | 컨텍스트 파악 필요 시 |

### 위임 기준
- **단순 작업 (30%)**: 직접 처리
- **복잡한 작업 (70%)**: 전문 에이전트 위임

---

## 컨텍스트 관리

### 중요 파일 우선 읽기
1. `CLAUDE.md` (이 파일)
2. `.forge/PHASE_3_ROADMAP.md`
3. `package.json`
4. 작업 관련 소스 파일

### Git 백업 필수
```
편집 전: git stash 또는 commit
위험한 작업 전: 브랜치 생성
```

---

## 기본 응답 스타일

```yaml
언어: 한국어
형식: 간결한 마크다운
코드 주석: 영어/한국어 혼용
진행상황: TodoWrite 도구 활용
```

---

## 현재 작업 상태

### 완료
- [x] Supabase 프로젝트 설정
- [x] DB 마이그레이션 (9개 테이블)
- [x] 환경변수 설정
- [x] 나라장터 API 클라이언트
- [x] UI 스프레드시트 컴포넌트

### 진행중
- [ ] 프로덕션 빌드 수정 (Handsontable SSR)
- [ ] Upstash Redis Rate Limiting
- [ ] E2E 테스트

### 예정
- [ ] AI 셀 함수 구현
- [ ] 크롤링 자동화 (Inngest)
- [ ] 알림 시스템

---

## 엔터 입력 시 (빈 입력)

사용자가 엔터만 입력하면:

1. **현재 상태 확인**
   ```bash
   git status --short
   npm run typecheck 2>&1 | tail -5
   ```

2. **다음 작업 제안**
   - 미완료 TODO 확인
   - 오류 있으면 자동 수정 시도
   - 다음 우선순위 작업 제안

3. **자율 진행 옵션**
   - "계속" → 다음 작업 자동 진행
   - "검토" → 코드 리뷰 실행
   - "테스트" → 전체 테스트 실행

---

## 핵심 명령어

```bash
# 개발
npm run dev          # 개발 서버 (3010)
npm run typecheck    # 타입 체크
npm run lint         # 린트
npm run test         # 테스트

# DB
node scripts/migrate-api.js  # 마이그레이션

# Git
git status && git diff --stat
```

---

## 학습된 패턴 (자동 업데이트)

### 발생했던 오류 및 해결책

| 오류 | 원인 | 해결 |
|------|------|------|
| `korean` text search 없음 | PostgreSQL 기본 미포함 | `simple`로 변경 |
| Handsontable SSR 에러 | 서버 렌더링 불가 | `dynamic import` 사용 |
| Network unreachable | WSL IPv6 문제 | REST API 사용 |

### 자주 사용하는 패턴

```typescript
// Supabase 클라이언트
import { createClient } from '@supabase/supabase-js';

// Zod 검증
const schema = z.object({...});
const result = schema.safeParse(data);

// 에러 처리
try { ... } catch (e) {
  console.error('[Module]', e);
  return { error: e.message };
}
```

---

*이 파일은 Claude Code가 자동으로 읽고 적용합니다.*
*오류 패턴이 발견되면 자동으로 업데이트됩니다.*
