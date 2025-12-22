# Lighthouse CI - Performance Monitoring

이 디렉토리는 Lighthouse CI를 사용한 성능 모니터링 설정을 포함합니다.

## 빠른 시작

```bash
# 1. 프로덕션 빌드 및 성능 테스트 실행
npm run perf

# 또는 개별 단계 실행
npm run build
npm run lighthouse:collect  # 데이터 수집
npm run lighthouse:assert   # 성능 기준 검증
npm run lighthouse:upload   # 결과 업로드
```

## 설정 파일

### `lighthouserc.json`

메인 설정 파일로 다음을 정의합니다:

- **수집 설정**: 테스트할 URL, 반복 횟수 등
- **성능 기준**: 각 메트릭의 임계값
- **업로드 설정**: 결과 저장 위치

### `budget.json`

리소스 및 성능 예산을 정의합니다:

- **리소스 크기**: 스크립트, 스타일시트, 이미지 등의 최대 크기 (KB)
- **리소스 개수**: 외부 리소스, 총 리소스 개수
- **성능 타이밍**: FCP, LCP, CLS, TBT 등의 Core Web Vitals

## 성능 기준 (Assertions)

### Core Web Vitals

| 메트릭 | 목표 | 임계값 |
|--------|------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ⚠️ 2.5s |
| **FID** (First Input Delay) | < 100ms | ⚠️ 130ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ❌ 0.1 |
| **FCP** (First Contentful Paint) | < 1.8s | ⚠️ 2.0s |
| **TBT** (Total Blocking Time) | < 200ms | ⚠️ 300ms |

### Lighthouse 점수

| 카테고리 | 최소 점수 | 레벨 |
|----------|-----------|------|
| **Performance** | 80% | ⚠️ Warning |
| **Accessibility** | 90% | ❌ Error |
| **Best Practices** | 85% | ⚠️ Warning |
| **SEO** | 90% | ⚠️ Warning |

## CI/CD 통합

### GitHub Actions

`.github/workflows/lighthouse-ci.yml` 파일이 다음 이벤트에서 자동 실행됩니다:

- Pull Request (main/develop 브랜치)
- Push (main 브랜치)
- 수동 트리거 (workflow_dispatch)

#### 워크플로우 단계

1. ✅ 코드 체크아웃
2. ✅ Node.js 설정
3. ✅ 의존성 설치
4. ✅ Next.js 빌드
5. ✅ Lighthouse CI 실행
6. ✅ 결과 업로드 (Artifact)
7. ✅ PR 코멘트 생성

### 결과 확인

- **GitHub Actions**: Actions 탭에서 워크플로우 실행 확인
- **Artifacts**: 상세 HTML 리포트 다운로드
- **PR Comments**: 주요 메트릭 요약 자동 코멘트

## 로컬 테스트

### 전체 테스트

```bash
npm run build
npm run perf
```

### 특정 페이지만 테스트

`lighthouserc.json`의 `url` 배열을 수정:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3010/dashboard"
      ]
    }
  }
}
```

### 모바일 테스트

`lighthouserc.json`의 `settings.preset`을 `"mobile"`로 변경:

```json
{
  "ci": {
    "collect": {
      "settings": {
        "preset": "mobile"
      }
    }
  }
}
```

## 성능 최적화 가이드

### 🟢 Good Practices

- ✅ Next.js Image 최적화 사용
- ✅ Dynamic Import로 코드 스플리팅
- ✅ CSS-in-JS 대신 Tailwind CSS
- ✅ 번들 크기 모니터링 (`npm run analyze`)
- ✅ React Server Components 활용

### 🔴 Bad Practices

- ❌ 거대한 JavaScript 번들 (> 500KB)
- ❌ Layout Shift 유발 (CLS > 0.1)
- ❌ 불필요한 리렌더링
- ❌ 비효율적인 이미지 로딩
- ❌ 블로킹 스크립트

## 문제 해결

### 빌드 타임아웃

```bash
# lighthouserc.json에서 타임아웃 증가
{
  "ci": {
    "collect": {
      "startServerReadyTimeout": 180000  // 3분
    }
  }
}
```

### 성능 기준 조정

테스트 환경이 느린 경우 `lighthouserc.json`의 `assertions`를 완화:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.7 }]
      }
    }
  }
}
```

### 캐시 문제

```bash
# Next.js 캐시 정리
rm -rf .next

# Lighthouse CI 캐시 정리
rm -rf .lighthouseci

# 재빌드
npm run build
npm run perf
```

## 추가 리소스

- [Lighthouse CI 문서](https://github.com/GoogleChrome/lighthouse-ci)
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js 성능 최적화](https://nextjs.org/docs/app/building-your-application/optimizing)
