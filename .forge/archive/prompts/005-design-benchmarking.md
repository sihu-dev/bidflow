# [QUERY-005] 디자인 벤치마킹 프롬프트

> UI/UX 디자인 품질 검증 및 벤치마킹 시 실행

---

## 입력 변수
- `{{COMPONENT_NAME}}`: 컴포넌트명
- `{{TARGET_APP}}`: 대상 앱 (hephaitos | folio | dryon)
- `{{DESIGN_REFERENCE}}`: 벤치마킹 대상 (선택적)

---

## 프롬프트

```
당신은 FORGE LABS의 UI/UX 디자인 전문가입니다.
다음 컴포넌트의 디자인 품질을 검증하고 벤치마킹해주세요.

## 컴포넌트: {{COMPONENT_NAME}}
## 대상 앱: {{TARGET_APP}}
## 벤치마킹 참조: {{DESIGN_REFERENCE}}

### 1. 디자인 시스템 준수 검사

#### 1.1 색상 시스템
- [ ] 앱별 프라이머리 색상 사용
  - HEPHAITOS: #3B82F6 (Blue)
  - FOLIO: #8B5CF6 (Purple)
  - DRYON: #22C55E (Green)
- [ ] 배경색 토큰 사용 (bg-primary, bg-secondary)
- [ ] 텍스트 색상 토큰 사용 (text-primary, text-muted)
- [ ] 하드코딩된 색상값 없음

#### 1.2 타이포그래피
- [ ] 폰트 패밀리 토큰 사용
- [ ] 폰트 사이즈 스케일 준수 (text-xs ~ text-6xl)
- [ ] 폰트 웨이트 토큰 사용
- [ ] 줄 높이 적정

#### 1.3 스페이싱
- [ ] Tailwind 스페이싱 스케일 사용 (p-1 ~ p-16)
- [ ] 일관된 간격 시스템
- [ ] 반응형 스페이싱

#### 1.4 컴포넌트
- [ ] Glass Morphism 일관성
  - backdrop-blur-md 또는 backdrop-blur-xl
  - bg-white/5 ~ bg-white/10
  - border-white/10
- [ ] 그림자 토큰 사용
- [ ] 라운딩 일관성 (rounded-lg, rounded-xl)

### 2. 시각적 품질 평가

#### 2.1 레이아웃
| 항목 | 점수 | 비고 |
|-----|------|------|
| 그리드 정렬 | /10 | |
| 시각적 균형 | /10 | |
| 공백 활용 | /10 | |
| 계층 구조 | /10 | |

#### 2.2 인터랙션
| 항목 | 점수 | 비고 |
|-----|------|------|
| 호버 효과 | /10 | |
| 클릭 피드백 | /10 | |
| 트랜지션 | /10 | |
| 로딩 상태 | /10 | |

#### 2.3 모션
| 항목 | 점수 | 비고 |
|-----|------|------|
| 애니메이션 타이밍 | /10 | |
| Easing 적정성 | /10 | |
| 성능 영향 | /10 | |
| 브랜드 일관성 | /10 | |

### 3. 접근성 검사

#### WCAG 2.1 준수
- [ ] 색상 대비율 4.5:1 이상
- [ ] 포커스 표시자 명확
- [ ] 키보드 내비게이션 지원
- [ ] 스크린 리더 호환
- [ ] aria-* 속성 적절

### 4. 반응형 검사

#### 브레이크포인트
| 뷰포트 | 크기 | 상태 |
|--------|------|------|
| Mobile | < 640px | |
| Tablet | 640-1024px | |
| Desktop | 1024-1440px | |
| Large | > 1440px | |

### 5. 성능 검사

#### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

#### 번들 최적화
- [ ] Tree-shaking 적용
- [ ] Code splitting 적용
- [ ] 이미지 최적화

### 6. 벤치마킹 비교

#### 참조 디자인 분석
```
참조: {{DESIGN_REFERENCE}}

강점:
-

약점:
-

적용 가능 요소:
-
```

#### 개선 제안
| 영역 | 현재 | 제안 | 우선순위 |
|------|------|------|----------|
| | | | |

### 검증 결과 템플릿

```yaml
design_benchmark:
  component: "{{COMPONENT_NAME}}"
  app: "{{TARGET_APP}}"
  timestamp: "{{TIMESTAMP}}"

  scores:
    design_system: 0/100
    visual_quality: 0/100
    accessibility: 0/100
    responsive: 0/100
    performance: 0/100
    total: 0/100

  grade: "S | A | B | C | F"

  issues:
    critical: []
    major: []
    minor: []

  improvements:
    - area: ""
      current: ""
      suggested: ""
      priority: "P0 | P1 | P2"

  benchmark_reference: "{{DESIGN_REFERENCE}}"
  benchmark_score: 0/100
```

### 등급 기준

| 등급 | 점수 | 기준 |
|------|------|------|
| S | 95-100 | 업계 최고 수준, 벤치마킹 대상 |
| A | 85-94 | 프로덕션 레디, 사소한 개선만 필요 |
| B | 75-84 | 양호, 일부 개선 권장 |
| C | 65-74 | 기본 충족, 다수 개선 필요 |
| F | 0-64 | 재작업 필요 |

### 출력
검증 결과를 `.forge/reports/design/{{COMPONENT_NAME}}-benchmark.yaml`로 저장
```

---

## 자동 트리거

### frontend-design 플러그인 연동
```
디자인 벤치마킹 요청 시:
1. frontend-design 플러그인 자동 활성화
2. 컴포넌트 렌더링 스크린샷 캡처
3. 디자인 토큰 사용 분석
4. 결과 리포트 생성
```

### 트리거 명령어
| 명령 | 동작 |
|------|------|
| `디자인` | 전체 디자인 시스템 검수 |
| `벤치마크` | 특정 컴포넌트 벤치마킹 |
| `UI검수` | UI 품질 검사 |
| `접근성` | 접근성 검사만 실행 |

---

*FORGE LABS 디자인 벤치마킹 시스템 v1.0*
