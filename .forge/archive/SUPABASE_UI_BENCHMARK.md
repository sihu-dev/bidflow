# Supabase UI 100% 벤치마킹 가이드

> **목적**: FORGE LABS UI 설계를 위한 Supabase 디자인 시스템 벤치마킹
> **작성일**: 2025-12-19
> **참조**: Supabase UI Library, Design System, Design Tokens

---

## 1. Supabase 디자인 철학

### 핵심 원칙

| 원칙 | 설명 | FORGE LABS 적용 |
|------|------|----------------|
| **Timelessness** | 트렌드 추종 X, 몇 년 후에도 좋은 디자인 | 클래식한 다크 테마 |
| **Less is more** | 불필요한 정보/장식 제거 | 미니멀 대시보드 |
| **SQL-first** | 개발자 친화적 경험 | 트레이딩 로직 중심 |
| **Kaizen** | 빠른 배포 후 디자인 개선 | MVP 우선 |
| **80/20** | 다수 사용자에게 집중 | 초보 트레이더 타겟 |

### 디자인 워크플로우

```
Figma 디자인 → CSS Variables 추출 → TailwindCSS 적용
                     ↓
            프로덕션 UI 스크린샷
                     ↓
            Figma에서 오버레이 수정
                     ↓
               빠른 반복
```

---

## 2. 컬러 시스템

### 브랜드 컬러

| 이름 | HEX | 용도 |
|------|-----|------|
| **Jungle Green** | `#34B27B` | Primary (성장, 성공) |
| **Athens Gray** | `#F8F9FA` | Light Background |
| **Bunker** | `#11181C` | Dark Background |
| **Accent** | `#3ECF8E` | 강조, CTA |

### Radix Colors 기반 스케일

```css
/* Grayscale (Dark Mode) */
--gray-1: #161616;
--gray-2: #1c1c1c;
--gray-3: #232323;
--gray-4: #282828;
--gray-5: #2e2e2e;
--gray-6: #343434;
--gray-7: #3e3e3e;
--gray-8: #505050;
--gray-9: #707070;
--gray-10: #7e7e7e;
--gray-11: #a0a0a0;
--gray-12: #ededed;

/* Slate (Light Mode) */
--slate-1: #fbfcfd;
--slate-2: #f8f9fa;
--slate-3: #f1f3f5;
--slate-4: #eceef0;
--slate-5: #e6e8eb;
--slate-6: #dfe3e6;
--slate-7: #d7dbdf;
--slate-8: #c1c8cd;
--slate-9: #889096;
--slate-10: #7e868c;
--slate-11: #687076;
--slate-12: #11181c;
```

### CSS Variables 매핑

```css
/* Supabase → TailwindCSS */
--background-default     →  bg
--background-alternative →  bg-alternative
--foreground-DEFAULT     →  text
--foreground-light       →  text-light
--foreground-muted       →  text-muted
--surface-100            →  surface
--overlay                →  overlay
--brand                  →  brand
```

### FORGE LABS 적용

```css
:root {
  /* Dark Theme (Default) */
  --forge-bg: #0a0a0a;
  --forge-bg-alt: #111111;
  --forge-surface: #1a1a1a;
  --forge-border: #2a2a2a;

  /* Brand */
  --forge-primary: #3ECF8E;      /* Supabase Green */
  --forge-accent: #34B27B;

  /* Text */
  --forge-text: #ededed;
  --forge-text-light: #a0a0a0;
  --forge-text-muted: #707070;

  /* Status */
  --forge-success: #3ECF8E;
  --forge-warning: #F5A623;
  --forge-error: #EF4444;
  --forge-info: #3B82F6;
}
```

---

## 3. 타이포그래피

### 폰트 패밀리

| 용도 | 폰트 | 대체 |
|------|------|------|
| **Headings** | Inter | system-ui |
| **Body** | Circular Std | -apple-system |
| **Code** | Office Code Pro / Source Code Pro | monospace |

### 사이즈 스케일

```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
```

### Line Height

```css
--leading-heading: 1.1;      /* 헤딩 */
--leading-tight:   1.25;     /* 타이트 */
--leading-normal:  1.5;      /* 본문 기본 */
--leading-relaxed: 1.75;     /* 여유 */
--leading-loose:   2.25;     /* 넓음 */
```

---

## 4. 스페이싱 & 사이징

### Spacing Scale

```css
--space-1:  4px;    /* xs */
--space-2:  8px;    /* sm */
--space-3:  12px;
--space-4:  16px;   /* md */
--space-5:  20px;
--space-6:  24px;   /* lg */
--space-8:  32px;   /* xl */
--space-10: 40px;
--space-12: 48px;   /* xxl */
--space-16: 64px;
```

### Border Radius

```css
--radius-xs:   2px;
--radius-sm:   4px;
--radius-md:   6px;
--radius-lg:   8px;
--radius-xl:   16px;
--radius-full: 9999px;
```

---

## 5. 컴포넌트 구조 (3-Tier)

### Tier 1: Atoms (60+ 컴포넌트)

| 카테고리 | 컴포넌트 |
|---------|---------|
| **Form** | Input, Textarea, Checkbox, Radio, Select, Toggle, Switch, Slider |
| **Feedback** | Alert, AlertDialog, Badge, Progress, Skeleton, Toast |
| **Navigation** | Breadcrumb, Menubar, Pagination, Tabs, Command |
| **Content** | Card, Avatar, Accordion, Collapsible, Carousel |
| **Overlay** | Dialog, Drawer, Modal, Popover, HoverCard, Tooltip, Sheet |
| **Data** | Table, Calendar, DatePicker, Combobox, TreeView |

### Tier 2: Fragments (18개 조합 컴포넌트)

| 컴포넌트 | 용도 |
|---------|------|
| **PageContainer** | 페이지 레이아웃 래퍼 |
| **PageHeader** | 페이지 상단 헤더 |
| **PageSection** | 섹션 구분 |
| **MetricCard** | 핵심 지표 카드 |
| **LogsBarChart** | 로그 바 차트 |
| **DataInput** | 데이터 입력 폼 |
| **FormItemLayout** | 폼 아이템 레이아웃 |
| **MultiSelect** | 다중 선택 |
| **FilterBar** | 필터 바 |
| **ConfirmationModal** | 확인 모달 |
| **TextConfirmDialog** | 텍스트 확인 다이얼로그 |
| **InnerSideMenu** | 내부 사이드 메뉴 |
| **Admonition** | 경고/정보 박스 |
| **AssistantChat** | AI 어시스턴트 채팅 |
| **EmptyState** | 빈 상태 표시 |
| **InfoTooltip** | 정보 툴팁 |
| **TableOfContents** | 목차 |

### Tier 3: Blocks (Supabase 통합)

| 블록 | 기능 |
|------|------|
| **Password Auth** | 이메일/비밀번호 인증 |
| **Social Auth** | 소셜 로그인 |
| **Dropzone** | 파일 업로드 |
| **RealtimeCursor** | 실시간 커서 |
| **RealtimeAvatarStack** | 실시간 아바타 |
| **RealtimeChat** | 실시간 채팅 |
| **InfiniteQueryHook** | 무한 스크롤 |

---

## 6. UI 패턴

### 레이아웃 패턴

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Main Content (flex-1)                      │
│                   │                                             │
│  ┌─────────────┐  │  ┌─────────────────────────────────────────┐│
│  │ Logo        │  │  │ Page Header                             ││
│  ├─────────────┤  │  ├─────────────────────────────────────────┤│
│  │ Nav Items   │  │  │                                         ││
│  │ - Dashboard │  │  │  Content Area                           ││
│  │ - Projects  │  │  │                                         ││
│  │ - Settings  │  │  │                                         ││
│  └─────────────┘  │  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 테이블 패턴

```
┌─────────────────────────────────────────────────────────────────┐
│ Filter Bar: [Search] [Filter 1 ▼] [Filter 2 ▼]        [Actions]│
├─────────────────────────────────────────────────────────────────┤
│ ☐ │ Name          │ Status   │ Created    │ Actions            │
├───┼───────────────┼──────────┼────────────┼────────────────────┤
│ ☐ │ Project Alpha │ 🟢 Active│ 2024-12-19 │ [Edit] [Delete]    │
│ ☐ │ Project Beta  │ 🟡 Draft │ 2024-12-18 │ [Edit] [Delete]    │
├─────────────────────────────────────────────────────────────────┤
│ Showing 1-10 of 100                    [< Prev] [1] [2] [Next >]│
└─────────────────────────────────────────────────────────────────┘
```

### 모달 패턴

```
┌─────────────────────────────────────────────┐
│ Modal Title                            [X]  │
├─────────────────────────────────────────────┤
│                                             │
│  Modal Content                              │
│                                             │
│  - Form fields                              │
│  - Description text                         │
│                                             │
├─────────────────────────────────────────────┤
│                    [Cancel]  [Confirm]      │
└─────────────────────────────────────────────┘
```

---

## 7. FORGE LABS 매핑 계획

### 패키지 구조

```
packages/ui/
├── src/
│   ├── atoms/           # Supabase Atoms 대응
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── fragments/       # Supabase Fragments 대응
│   │   ├── PageHeader.tsx
│   │   ├── MetricCard.tsx
│   │   └── ...
│   ├── blocks/          # FORGE LABS 전용 블록
│   │   ├── StrategyBuilder.tsx
│   │   ├── BacktestResults.tsx
│   │   └── ...
│   ├── tokens/          # 디자인 토큰
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   └── index.ts
```

### 우선 구현 목록 (MVP)

| # | 컴포넌트 | Supabase 참조 | 용도 |
|---|---------|--------------|------|
| 1 | Button | Button | 모든 액션 |
| 2 | Input | Input | 폼 입력 |
| 3 | Card | Card | 컨텐츠 래퍼 |
| 4 | MetricCard | MetricCard | 지표 표시 |
| 5 | Dialog | Dialog | 모달 |
| 6 | Table | Table | 데이터 테이블 |
| 7 | Tabs | Tabs | 탭 네비게이션 |
| 8 | Badge | Badge | 상태 표시 |
| 9 | Alert | Alert | 알림 |
| 10 | Toast | Toast | 토스트 알림 |

---

## 8. 기술 스택 정합성

### Supabase UI 스택

```
- React 18+
- shadcn/ui (Radix UI 기반)
- Tailwind CSS
- CSS Variables (디자인 토큰)
- TypeScript
```

### FORGE LABS 적용

```
- Next.js 15 (App Router)
- shadcn/ui 설치
- Tailwind CSS 4
- Radix Colors
- TypeScript 5.7
```

### 설치 명령

```bash
# shadcn/ui 초기화
npx shadcn@latest init

# Supabase UI 컴포넌트 설치
npx shadcn add button card dialog table tabs badge alert
```

---

## 9. 참조 링크

### 공식 문서
- [Supabase UI Library](https://supabase.com/ui)
- [Supabase Design System](https://supabase-design-system.vercel.app/)
- [Supabase Brand Assets](https://supabase.com/brand-assets)

### GitHub
- [supabase/ui](https://github.com/supabase/ui)
- [supabase/design-tokens](https://github.com/supabase/design-tokens)

### Figma
- [Supabase UI (Figma Community)](https://www.figma.com/community/file/1048935165760060357)
- [Supabase Official](https://www.figma.com/community/file/1217163409285183102)

### 블로그
- [How Design Works at Supabase](https://supabase.com/blog/how-design-works-at-supabase)

### 연관 기술
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Radix Colors](https://www.radix-ui.com/colors)

---

*Supabase UI 100% 벤치마킹 완료*
*FORGE LABS v1.0 UI 기반 문서*
*2025-12-19*
