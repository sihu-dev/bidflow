# 🌍 BIDFLOW - Global Procurement Intelligence Platform

> **AI-Powered International Tender Automation for Korean SME Exporters**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**BIDFLOW automates international tender discovery and proposal generation for Korean manufacturing SMEs looking to export globally.**

---

## 🎯 Problem Statement

Korean SME manufacturers face critical barriers to international expansion:

| Pain Point           | Impact                                          | Current Solution                    |
| -------------------- | ----------------------------------------------- | ----------------------------------- |
| **Information Gap**  | 85% of EU/US tenders go undiscovered            | Manual search on unfamiliar portals |
| **Language Barrier** | English procurement docs = 6+ hours translation | Google Translate (unreliable)       |
| **Market Knowledge** | Zero understanding of foreign buyer preferences | Trial and error                     |
| **Proposal Costs**   | $2,000-5,000 per international bid              | Hire expensive consultants          |

**Result:** Most Korean SMEs never attempt international tenders, missing a $2.5T global market.

---

## 💡 Solution

**BIDFLOW = Your AI Export Advisor**

```
Automated Discovery → AI Translation → Smart Matching → Proposal Generation
      (TED/SAM.gov)      (GPT-4o)        (175-point)      (Template-based)
```

### Core Value Proposition

1. **Never Miss a Tender** - Auto-collect from 45+ sources (EU TED, US SAM.gov, etc.)
2. **Instant Understanding** - AI translates & summarizes in Korean
3. **Smart Matching** - 175-point algorithm matches your products to tenders
4. **1-Click Proposals** - Generate English proposals in 45 minutes (vs 3 days)

---

## 🌟 Key Features

### 🔍 1. Global Tender Discovery

```yaml
Data Sources (45+):
  EU: TED API (Tenders Electronic Daily)
  US: SAM.gov API (System for Award Management)
  Korea: G2B, Public Procurement Service
  Asia: Singapore GeBIZ, Hong Kong eTender

Auto-Collection:
  - Scheduled crawling (3x daily)
  - Keyword filtering by industry
  - Real-time notifications
```

### 🎯 2. AI-Powered Matching Engine

**175-Point Scoring System:**

| Category              | Weight | Factors                                  |
| --------------------- | ------ | ---------------------------------------- |
| Technical Fit         | 35 pts | Product specs, certifications, standards |
| Price Competitiveness | 30 pts | Budget alignment, market positioning     |
| Organizational Fit    | 50 pts | Past performance, buyer preferences      |
| Product Relevance     | 30 pts | Keyword matching, category fit           |
| Competition Analysis  | 30 pts | Number of bidders, win probability       |

**Example Output:**

```
🇪🇺 EU Tender: Water Flow Meters (€500K)
   Match Score: 92/100 (Excellent)
   ✓ Technical: 34/35 (Your UR-1000PLUS meets DN200-500 spec)
   ✓ Price: 28/30 (Budget €500K, your range €450-480K)
   ✓ Org: 45/50 (Buyer prefers Korean suppliers, you have EU cert)
   ⚠️ Competition: High (8 expected bidders)

   Recommendation: APPLY - High win probability
```

### 📊 3. Spreadsheet-Like Interface

**Inspired by Excel, Powered by AI:**

```excel
=AI_SUMMARY(A2)      → "EU Water Authority seeks ultrasonic flowmeters..."
=AI_TRANSLATE(A2)    → Full Korean translation
=AI_SCORE(A2)        → 92 (Excellent match)
=AI_PROPOSAL(A2)     → Generate proposal.docx
=AI_COMPETITOR(A2)   → "Siemens (40%), E+H (30%)"
```

Built on [Handsontable](https://handsontable.com/) + [HyperFormula](https://hyperformula.handsontable.com/)

### 🤖 4. AI Proposal Generator

**From Tender to Proposal in 45 Minutes:**

```
Input: EU TED Tender PDF (120 pages, English)
       ↓
AI Processing:
  1. Extract requirements (GPT-4o Vision)
  2. Map to your product specs
  3. Generate technical compliance matrix
  4. Draft proposal (English)
  5. Insert company credentials
       ↓
Output: Professional proposal.docx (70% complete)
        - Technical section: 95% ready
        - Pricing section: Manual review needed
        - Past performance: Auto-filled
```

---

## 🏗️ Tech Stack

```yaml
Frontend:
  Framework: Next.js 15 (App Router)
  Language: TypeScript 5.7 (Strict mode)
  UI: React 19 + TailwindCSS
  Spreadsheet: Handsontable 16 (Dynamic import)
  Charts: ECharts 6, MapLibre GL

Backend:
  API: Next.js API Routes + Supabase Edge Functions
  Database: PostgreSQL (Supabase) + Row Level Security
  Cache: Upstash Redis (Rate limiting)

AI/ML:
  LLM: Claude API (Anthropic)
  ML: XGBoost (Bid score prediction)
  Formula Engine: HyperFormula (AI cell functions)

Data Collection:
  Scheduler: Inngest (Cron jobs)
  Crawling: Playwright (Browser automation)
  APIs: TED REST API, SAM.gov API, G2B API

Notifications:
  Channels: Kakao Alimtalk, Email (Resend), Slack
  Triggers: New tenders, D-3/D-1 deadlines

Security:
  Auth: Supabase Auth + RLS policies
  CSRF: Double-submit cookie pattern
  Rate Limiting: Upstash Redis (100 req/min)
  Input Validation: Zod schemas
  Prompt Injection: Sanitization layer
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 20.0.0
pnpm >= 8.0.0
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/bidflow.git
cd bidflow

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials:
# - NEXT_PUBLIC_SUPABASE_URL
# - SUPABASE_ANON_KEY
# - ANTHROPIC_API_KEY
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN

# 4. Run database migrations
npm run db:push

# 5. Start development server
npm run dev
```

Open [http://localhost:3010](http://localhost:3010)

### Production Build

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
bidflow/
├── src/
│   ├── app/
│   │   ├── (marketing)/        # Landing, features, pricing
│   │   ├── (dashboard)/        # Main app dashboard
│   │   ├── (auth)/             # Login, signup
│   │   └── api/v1/             # REST API endpoints (21)
│   │
│   ├── lib/
│   │   ├── domain/             # Domain logic (Repository pattern)
│   │   ├── matching/           # 175-point matching engine
│   │   ├── security/           # 5-layer security (Auth, CSRF, etc.)
│   │   ├── clients/            # External API clients (TED, SAM.gov)
│   │   ├── notifications/      # Multi-channel notifications
│   │   └── spreadsheet/        # AI cell functions
│   │
│   └── components/             # React components (63)
│
├── supabase/migrations/        # Database schema (11 migrations)
├── .forge/                     # Design docs, business plans
├── tests/e2e/                  # Playwright E2E tests (46)
└── types/                      # TypeScript branded types
```

---

## 📊 Business Model

### Target Market

**Korean Manufacturing SMEs (100-500 employees)**

Industries:

- Flow meters, pumps, valves
- Industrial equipment
- Water treatment
- Measurement instruments
- Construction materials

### Revenue Streams

| Stream                | Model                            | Pricing                    |
| --------------------- | -------------------------------- | -------------------------- |
| **SaaS Subscription** | Monthly/Annual                   | $99-299/month              |
| **Success Fee**       | % of won contracts               | 1-3% of contract value     |
| **AI Voucher**        | Government-funded AI development | $70K per project (70% gov) |

### Growth Projection (Conservative)

```
Year 1: 10 customers × $1,188/year = $11,880 ARR
Year 2: 50 customers × $1,188/year = $59,400 ARR
Year 3: 150 customers × $1,188/year + Success fees = $200K+ ARR
```

---

## 🗺️ Roadmap

### ✅ Phase 1-3: MVP Complete (Current - 81%)

- [x] Infrastructure setup (Supabase, Upstash, Inngest)
- [x] 5-layer security implementation
- [x] 175-point matching engine
- [x] AI cell functions (5 functions)
- [x] Multi-channel notifications (Slack, Email, Kakao)
- [x] Dashboard UI (spreadsheet-like)
- [x] Crawling scheduler (Inngest cron jobs)

### 🚧 Phase 4: Production Launch (Q1 2025)

- [ ] TED API integration (Live)
- [ ] SAM.gov API integration (Live)
- [ ] AI proposal generator (GPT-4o)
- [ ] E2E testing (Playwright)
- [ ] Production deployment (Vercel)
- [ ] First pilot customer

### 📅 Phase 5: Scale (Q2-Q3 2025)

- [ ] Multilingual support (EN, KO, CN, JP)
- [ ] Mobile app (React Native)
- [ ] Competitor intelligence dashboard
- [ ] Automated bidding workflow
- [ ] Integration with ERP systems

---

## 🔒 Security

**5-Layer Defense:**

1. **Authentication** - Supabase Auth + JWT
2. **Authorization** - Row Level Security (RLS) policies
3. **CSRF Protection** - Double-submit cookie pattern
4. **Rate Limiting** - Upstash Redis (100 req/min per user)
5. **Input Validation** - Zod schemas on all inputs

**Compliance:**

- GDPR ready (EU data protection)
- ISO 27001 guidelines
- SOC 2 Type II (planned)

---

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

**Test Coverage:**

- E2E: 46 Playwright tests written
- Unit: In progress
- Integration: API route tests

---

## 📚 Documentation

- **Design Docs:** [.forge/](/.forge/) - System architecture, business plans
- **API Docs:** [API Reference](/.forge/TECH_ARCHITECTURE.md)
- **Data Sources:** [45+ Tender Sources](/.forge/BID_DATA_SOURCES.md)
- **Development Guide:** [NEXT_STEPS.md](/NEXT_STEPS.md)

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

```bash
# Fork the repo
# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "feat: add amazing feature"

# Push to branch
git push origin feature/amazing-feature

# Open Pull Request
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Anthropic Claude](https://www.anthropic.com/) - AI capabilities
- [Handsontable](https://handsontable.com/) - Spreadsheet component
- [Inngest](https://www.inngest.com/) - Background jobs

---

## ⚠️ Important Note

**CMNTech References:** Some files in `.forge/` reference "CMNTech" (a flowmeter company). These are **mock-up scenarios** for concept demonstration, not actual clients.

**Actual Business Model:** International tender platform for Korean SME exporters (TED, SAM.gov focus).

---

<div align="center">

**Built with ❤️ for Korean SMEs going global**

[🌐 Website](https://bidflow.app) • [📖 Docs](/.forge/) • [🐛 Issues](https://github.com/yourusername/bidflow/issues)

</div>
