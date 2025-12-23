# BIDFLOW 배포 가이드

> **버전**: v0.1.0  
> **플랫폼**: Vercel (권장), AWS, Docker  
> **업데이트**: 2025-12-21

---

## 📋 배포 전 체크리스트

### 1. 환경 변수 설정

#### 필수 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App 설정
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# API 키 (선택)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

#### 선택 환경 변수

```bash
# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# 크롤링 (Inngest)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# 알림
SENDGRID_API_KEY=...
SLACK_WEBHOOK_URL=...
```

### 2. 데이터베이스 마이그레이션

```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push

# 확인
supabase db remote ls
```

### 3. 빌드 테스트

```bash
# 의존성 설치
pnpm install

# 타입 체크
pnpm typecheck

# ESLint
pnpm lint

# 프로덕션 빌드
pnpm build

# 로컬 프로덕션 서버
pnpm start
```

---

## 🚀 Vercel 배포 (권장)

### 방법 1: GitHub 연동 (자동 배포)

1. **Vercel 계정 생성**
   - https://vercel.com/signup

2. **프로젝트 Import**
   - New Project → Import Git Repository
   - 저장소 선택: `yourusername/bidflow`

3. **환경 변수 설정**
   - Settings → Environment Variables
   - 위의 필수 환경 변수 모두 입력

4. **빌드 설정 확인**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

5. **배포**
   - Deploy 버튼 클릭
   - 자동 빌드 및 배포 시작

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel --prod

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... 나머지 환경 변수
```

### 커스텀 도메인 설정

```bash
# Vercel 대시보드에서:
Settings → Domains → Add Domain
→ yourdomain.com 입력
→ DNS 설정 (A 레코드 또는 CNAME)
```

---

## 🐳 Docker 배포

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# 의존성 설치
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# 프로덕션
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3010
ENV PORT=3010

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  bidflow:
    build: .
    ports:
      - "3010:3010"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    env_file:
      - .env.production
```

### 빌드 및 실행

```bash
# 빌드
docker build -t bidflow:0.1.0 .

# 실행
docker run -p 3010:3010 --env-file .env.production bidflow:0.1.0

# Docker Compose
docker-compose up -d
```

---

## ☁️ AWS 배포 (EC2 + PM2)

### 1. EC2 인스턴스 생성

- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.medium (최소)
- Security Group: 80, 443, 22 포트 오픈

### 2. 서버 설정

```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm 설치
npm install -g pnpm

# PM2 설치
npm install -g pm2

# 프로젝트 클론
git clone https://github.com/yourusername/bidflow.git
cd bidflow

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.production
nano .env.production

# 빌드
pnpm build

# PM2로 실행
pm2 start npm --name "bidflow" -- start
pm2 save
pm2 startup
```

### 3. Nginx 리버스 프록시

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 배포 후 확인

### 1. Health Check

```bash
# 홈페이지 로드
curl https://yourdomain.com

# API 상태
curl https://yourdomain.com/api/v1/stats

# 빌드 정보
curl https://yourdomain.com/_next/static/
```

### 2. 성능 측정

```bash
# Lighthouse
npx lighthouse https://yourdomain.com --view

# WebPageTest
# https://www.webpagetest.org/
```

### 3. 모니터링 설정

#### Vercel Analytics (무료)

```javascript
// src/app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Sentry (에러 추적)

```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

---

## 🔄 지속적 배포 (CI/CD)

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ["v*"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

---

## 🛡️ 보안 체크리스트

- [ ] `.env` 파일을 `.gitignore`에 추가 확인
- [ ] API 키를 환경 변수로 관리
- [ ] CORS 설정 확인
- [ ] Rate Limiting 활성화
- [ ] HTTPS 강제 (Vercel은 자동)
- [ ] CSP (Content Security Policy) 설정
- [ ] Supabase RLS (Row Level Security) 활성화

---

## 📞 문제 해결

### 빌드 실패

```bash
# 캐시 삭제
rm -rf .next node_modules
pnpm install
pnpm build
```

### 환경 변수 인식 안 됨

```bash
# Vercel: 재배포 필요
vercel --prod --force

# Docker: 컨테이너 재시작
docker-compose restart
```

### 데이터베이스 연결 실패

```bash
# Supabase 상태 확인
supabase status

# 연결 테스트
curl https://your-project.supabase.co/rest/v1/
```

---

## 📅 배포 이력

| 버전   | 날짜       | 변경사항    | 배포자      |
| ------ | ---------- | ----------- | ----------- |
| v0.1.0 | 2025-12-21 | 초기 릴리스 | Claude Code |

---

**배포 문의**: support@bidflow.com
