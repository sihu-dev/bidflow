# BIDFLOW 디자인 시스템 규칙

> **확정**: 모노크롬 디자인 시스템
> **업데이트**: 2025-12-21
> **우선순위**: settings.json > Part 4 설계

---

## 색상 팔레트 (확정)

### 사용 가능한 색상

```yaml
Primary:
  primary: "#171717"      # neutral-900 - 주요 액션, 텍스트
  secondary: "#262626"    # neutral-800 - 보조 요소

Background:
  background: "#fafafa"   # neutral-50 - 페이지 배경
  surface: "#ffffff"      # white - 카드/패널

Border:
  border: "#e5e5e5"       # neutral-200 - 테두리
  divider: "#d4d4d4"      # neutral-300 - 구분선

Text:
  text-primary: "#171717" # neutral-900 - 본문
  text-secondary: "#525252" # neutral-600 - 보조 텍스트
  text-muted: "#a3a3a3"   # neutral-400 - 비활성
```

### 금지된 색상 (Tailwind 클래스)

```yaml
Forbidden Colors:
  - indigo, purple, blue, green, red, yellow
  - pink, orange, teal, cyan, emerald, violet
  - fuchsia, rose, amber, lime, sky

예외:
  - 차트/그래프에서 데이터 구분용으로만 사용 가능
  - 반드시 "demo data" 또는 시각화 컨텍스트 명시
```

---

## Part 4 설계와의 차이점

### 설계 vs 구현

| 항목 | Part 4 설계 | settings.json (확정) | 결정 |
|------|-------------|---------------------|------|
| Primary | #2563EB (Blue) | #171717 (Black) | **모노크롬** |
| Secondary | #10B981 (Emerald) | #262626 (Gray) | **모노크롬** |
| Warning | #F59E0B (Amber) | (사용 안함) | 아이콘/텍스트로 대체 |
| Danger | #EF4444 (Red) | (사용 안함) | 아이콘/텍스트로 대체 |

### 소스 구분 방식 변경

```yaml
# Part 4 설계 (컬러풀)
source-ted: "#003399"  # EU Blue
source-sam: "#B22234"  # US Red
source-g2b: "#003478"  # Korea Blue

# 구현 (모노크롬)
source-ted: 아이콘 + "TED" 레이블
source-sam: 아이콘 + "SAM" 레이블
source-g2b: 아이콘 + "G2B" 레이블

# 구분 방식
- 아이콘 형태로 구분 (EU 깃발, US 깃발, 한국 깃발)
- 레이블 텍스트로 명시
- 배경색이 아닌 테두리 스타일로 구분
```

### 상태 표시 변경

```yaml
# Part 4 설계 (컬러풀)
action-bid: "#10B981"     # 녹색
action-review: "#F59E0B"  # 주황색
action-skip: "#94A3B8"    # 회색

# 구현 (모노크롬)
action-bid:
  - 진한 배경 (#171717) + 흰 텍스트
  - "✓ BID" 아이콘

action-review:
  - 테두리만 (#262626) + 검은 텍스트
  - "○ REVIEW" 아이콘

action-skip:
  - 연한 배경 (#f5f5f5) + 회색 텍스트
  - "— SKIP" 아이콘
```

---

## 타이포그래피 (Part 4 유지)

```yaml
Font Family:
  Primary: "Pretendard", system-ui, sans-serif
  Mono: "JetBrains Mono", monospace

# Part 4의 폰트 크기 시스템은 그대로 유지
Font Sizes: xs, sm, base, lg, xl, 2xl, 3xl
```

---

## 컴포넌트 스타일

### 버튼

```tsx
// Primary Button
<button className="bg-neutral-900 text-white hover:bg-neutral-800">
  주요 액션
</button>

// Secondary Button
<button className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50">
  보조 액션
</button>

// Ghost Button
<button className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100">
  텍스트 링크
</button>
```

### 카드

```tsx
<div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
  {/* 카드 내용 */}
</div>
```

### 입력 필드

```tsx
<input className="border border-neutral-300 rounded-md px-4 py-2
  focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
```

---

## 검수 규칙

### UX/UI Auditor 검수 항목

1. **컬러 클래스 사용 금지 확인**
   - `bg-blue-*`, `text-green-*` 등 컬러 클래스 탐지
   - 금지 색상 사용 시 경고

2. **모노크롬 팔레트 준수**
   - `neutral-*` 계열만 사용
   - `gray-*`, `slate-*`도 허용 (유사 계열)

3. **상태 표시 방식**
   - 색상이 아닌 아이콘/텍스트로 구분
   - 접근성 고려 (색맹 사용자)

---

## 예외 사항

### 차트/시각화

```yaml
허용되는 경우:
  - 데이터 시각화 (차트, 그래프)
  - 반드시 범례 포함
  - 색상만으로 정보 전달 금지 (패턴/레이블 병행)

사용 가능 팔레트:
  - neutral-900, neutral-700, neutral-500, neutral-300
  - 4색 이내로 제한
```

### 데모 데이터

```yaml
경쟁사 분석 등 시연용 데이터:
  - "데모 데이터" 라벨 필수
  - 실제 데이터 아님 명시
```

---

*이 규칙은 settings.json의 design 섹션과 동기화됩니다.*
