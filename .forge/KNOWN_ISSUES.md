# BIDFLOW 알려진 이슈

> **생성일**: 2025-12-21
> **업데이트**: 2025-12-21

---

## 🔴 Critical Issues

### Next.js 15.5.9 Prerendering Error

**증상**:
```
Error: <Html> should not be imported outside of pages/_document.
Error occurred prerendering page "/404"
```

**영향**:
- 프로덕션 빌드 (`npm run build`) 실패
- **개발 서버는 정상 작동** (`npm run dev`)
- 기능상 문제 없음 (런타임 정상)

**원인**:
- Next.js 15.5.9의 404/error 페이지 prerendering 버그
- `.next/server/chunks/5611.js` 내부에서 발생
- `global-error.tsx`, `not-found.tsx` 파일과 무관

**시도한 해결책** (모두 실패):
1. ✗ `export const dynamic = 'force-dynamic'` 추가
2. ✗ `output: 'standalone'` 설정
3. ✗ `.next` 캐시 삭제 후 재빌드

**현재 해결책**:

**Option 1: Next.js 다운그레이드** (권장)
```bash
# package.json에서 Next.js 버전 고정
npm install next@15.1.4 --save-exact

# 재빌드
rm -rf .next
npm run build
```

**Option 2: 개발 서버만 사용**
```bash
# 개발 중에는 문제 없음
npm run dev
```

**Option 3: Vercel 배포**
- Vercel에서는 자동으로 최적화되어 빌드 성공할 가능성 있음
- 로컬 빌드와 다른 설정 사용

**근본 해결**:
- Next.js 15.6+ 업데이트 대기
- GitHub Issue: https://github.com/vercel/next.js/issues

---

## 🟡 Minor Issues

### ESLint Warnings

**경고 목록**:
```
./src/components/dashboard/PerformanceMetrics.tsx:25:11
Warning: 't' is assigned a value but never used.

./src/components/dashboard/Sidebar.tsx:8:3
Warning: 'CpuChipIcon' is defined but never used.

./src/lib/utils/logger.ts:9:18
Warning: Unexpected any. Specify a different type.
```

**영향**: 없음 (빌드 성공, 경고만 표시)

**해결책**: 추후 클린업 시 수정

---

## ✅ Resolved Issues

### CMNTECH 페이지 TypeScript 에러

**증상**:
```
.next/types/app/cmntech/page.ts
Cannot find module '../../../../src/app/cmntech/page.js'
```

**해결**:
- `/src/app/cmntech/` 디렉토리를 `.design-system/hephaitos/` 로 이동
- `.next` 캐시 삭제로 해결

**해결일**: 2025-12-21

---

*Last Updated: 2025-12-21*
