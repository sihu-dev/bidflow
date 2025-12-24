# BIDFLOW - Global Procurement Intelligence Platform

> **AI-Powered International Tender Automation for Korean SME Exporters**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Claude](https://img.shields.io/badge/Claude-API-orange)](https://www.anthropic.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**BIDFLOW automates international tender discovery and proposal generation for Korean manufacturing SMEs looking to export globally.**

---

## Development Status

| Component | Status | Score | Notes |
|-----------|--------|-------|-------|
| **International Bid APIs** | Implemented | 68/100 | TED, SAM.gov, G2B clients complete |
| **Claude API Optimization** | Partial | 58/100 | Design complete, implementation gap |
| **Spreadsheet Engine** | Implemented | 73/100 | HyperFormula + AI functions |
| **Cross-Integration** | Good | 79/100 | Data pipeline established |

**Overall Progress: Phase 4 (Production Launch) - 75%**

---

## Problem Statement

Korean SME manufacturers face critical barriers to international expansion:

| Pain Point           | Impact                                          | Current Solution                    |
| -------------------- | ----------------------------------------------- | ----------------------------------- |
| **Information Gap**  | 85% of EU/US tenders go undiscovered            | Manual search on unfamiliar portals |
| **Language Barrier** | English procurement docs = 6+ hours translation | Google Translate (unreliable)       |
| **Market Knowledge** | Zero understanding of foreign buyer preferences | Trial and error                     |
| **Proposal Costs**   | $2,000-5,000 per international bid              | Hire expensive consultants          |

**Result:** Most Korean SMEs never attempt international tenders, missing a $2.5T global market.

---

## Solution

**BIDFLOW = Your AI Export Advisor**

```
Automated Discovery → AI Translation → Smart Matching → Proposal Generation
   (TED/SAM.gov)       (Claude API)     (175-point)      (Template-based)
```

### Core Value Proposition

1. **Never Miss a Tender** - Auto-collect from 45+ sources (EU TED, US SAM.gov, etc.)
2. **Instant Understanding** - AI translates & summarizes in Korean
3. **Smart Matching** - 175-point algorithm matches your products to tenders
4. **1-Click Proposals** - Generate English proposals in 45 minutes (vs 3 days)

---

## Key Features

### 1. Global Tender Discovery

```yaml
Data Sources (45+):
  EU: TED API (Tenders Electronic Daily) - 815B EUR/year
  US: SAM.gov API (System for Award Management) - Federal procurement
  Korea: G2B (Nara Jangto), Public Procurement Service
  Asia: Singapore GeBIZ, Hong Kong eTender (planned)

API Clients (Implemented):
  - src/lib/clients/ted-api.ts (330 lines)
  - src/lib/clients/sam-gov-api.ts (436 lines)
  - src/lib/clients/narajangto-api.ts (321 lines)

Auto-Collection:
  - Scheduled crawling via Inngest (3x daily)
  - Keyword filtering by industry
  - Real-time notifications
```

### 2. AI-Powered Matching Engine

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
EU Tender: Water Flow Meters (EUR 500K)
   Match Score: 92/100 (Excellent)
   - Technical: 34/35 (Your UR-1000PLUS meets DN200-500 spec)
   - Price: 28/30 (Budget EUR 500K, your range EUR 450-480K)
   - Org: 45/50 (Buyer prefers Korean suppliers, you have EU cert)
   - Competition: High (8 expected bidders)

   Recommendation: APPLY - High win probability
```

### 3. AI-Powered Spreadsheet Interface

**Excel-Like UI with AI Functions:**

```excel
=AI_SUMMARY(A2)    -> "EU Water Authority seeks ultrasonic flowmeters..."
=AI_SCORE(A2)      -> 92 (Match score 0-100)
=AI_MATCH(A2)      -> "UR-1000PLUS" (Best matching product)
=AI_KEYWORDS(A2)   -> "ultrasonic, water, flowmeter"
=AI_DEADLINE(A2)   -> "D-7 - Submit technical docs"
```

**Implementation:**
- Formula Engine: HyperFormula (395+ Excel functions, lazy loaded)
- UI Component: Handsontable (dynamic import, 912KB separated)
- AI Backend: Claude API (Sonnet model)

### 4. Claude API Integration

**Model Selection Strategy:**

| Use Case | Model | Response Time | Cost |
|----------|-------|---------------|------|
| Quick analysis | Claude Haiku 4.5 | <500ms | Low |
| Standard analysis | Claude Sonnet 4.5 | 1-2s | Medium |
| High-value bids (>100M KRW) | Claude Opus 4.5 | 2-5s | High |

**Optimization Features (Designed):**
- Prompt Caching: 90% cost reduction
- Extended Thinking: 40% accuracy improvement for complex bids
- Batch Processing: 50% cost reduction for overnight jobs

---

## Tech Stack

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
  LLM: Claude API (Anthropic) - Haiku/Sonnet/Opus
  Matching: Enhanced Matcher (175-point rule-based)
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

## Quick Start

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

## Project Structure

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
│   │   ├── clients/            # External API clients (TED, SAM.gov, G2B)
│   │   ├── notifications/      # Multi-channel notifications
│   │   └── spreadsheet/        # HyperFormula engine
│   │
│   └── components/             # React components (63)
│
├── supabase/migrations/        # Database schema (11 migrations)
├── .forge/                     # Design docs, business plans
├── .claude/                    # Claude API optimization docs
├── tests/e2e/                  # Playwright E2E tests
└── types/                      # TypeScript branded types
```

---

## Roadmap

### Phase 1-3: MVP Complete (81%)

- [x] Infrastructure setup (Supabase, Upstash, Inngest)
- [x] 5-layer security implementation
- [x] 175-point matching engine (Enhanced Matcher)
- [x] AI cell functions (5 functions defined)
- [x] Multi-channel notifications (Slack, Email, Kakao)
- [x] Dashboard UI (spreadsheet-like)
- [x] International API clients (TED, SAM.gov, G2B)
- [x] HyperFormula lazy loading (912KB separated)

### Phase 4: Production Launch (In Progress)

- [x] TED API client implementation
- [x] SAM.gov API client implementation
- [x] G2B (Nara Jangto) API client
- [ ] **Claude API optimization** (Prompt Caching, Model Selection)
- [ ] Realtime spreadsheet sync
- [ ] AI function auto-execution in cells
- [ ] E2E testing completion
- [ ] Production deployment (Vercel)

### Phase 5: Scale (Planned)

- [ ] Multilingual support (EN, KO, CN, JP)
- [ ] Mobile app (React Native)
- [ ] Competitor intelligence dashboard
- [ ] Automated bidding workflow
- [ ] Integration with ERP systems

---

## Known Issues & Improvements Needed

Based on code review (Dec 2024):

### Critical (P0)
| Issue | Location | Impact |
|-------|----------|--------|
| Claude API Prompt Caching not implemented | `api/v1/ai/*.ts` | 90% cost savings lost |
| SAM.gov API key in URL | `sam-gov-api.ts:258` | Security vulnerability |
| Model selection hardcoded | `ai/formula/route.ts:82` | Cost inefficiency |

### High (P1)
| Issue | Location | Impact |
|-------|----------|--------|
| No retry logic in API clients | All 3 clients | Network failures |
| No timeout settings | All 3 clients | Potential hangs |
| CORS set to `*` | `ai/score/route.ts` | Security risk |
| Realtime not connected to spreadsheet | `SpreadsheetView.tsx` | No live updates |

### Medium (P2)
| Issue | Location | Impact |
|-------|----------|--------|
| AI function name mismatch | `FormulaBar.tsx` | SCORE vs AI_SCORE |
| No debouncing on AI calls | `SpreadsheetContainer.tsx` | API overload |
| Missing caching layer | API clients | Redundant requests |

---

## Security

**5-Layer Defense:**

1. **Authentication** - Supabase Auth + JWT
2. **Authorization** - Row Level Security (RLS) policies
3. **CSRF Protection** - Double-submit cookie pattern
4. **Rate Limiting** - Upstash Redis (100 req/min per user)
5. **Input Validation** - Zod schemas on all inputs

**AI-Specific Security:**
- Prompt Injection prevention (`validatePromptInput`)
- Rate limiting on AI endpoints (10 req/min)

**Compliance:**
- GDPR ready (EU data protection)
- ISO 27001 guidelines
- SOC 2 Type II (planned)

---

## Testing

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

---

## Documentation

- **Design Docs:** [.forge/](/.forge/) - System architecture, business plans
- **Claude Optimization:** [.claude/CHROME_EXTENSION_OPTIMIZATION.md](/.claude/)
- **API Sources:** [BID_DATA_SOURCES.md](/.forge/BID_DATA_SOURCES.md)
- **Spreadsheet Architecture:** [AI_SPREADSHEET_ARCHITECTURE.md](/.forge/AI_SPREADSHEET_ARCHITECTURE.md)

---

## Business Model

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

---

## Contributing

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

## License

MIT License - see [LICENSE](LICENSE) file

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Anthropic Claude](https://www.anthropic.com/) - AI capabilities
- [Handsontable](https://handsontable.com/) - Spreadsheet component
- [Inngest](https://www.inngest.com/) - Background jobs
- [HyperFormula](https://hyperformula.handsontable.com/) - Formula engine

---

## Notes

**CMNTech References:** Some files in `.forge/` reference "CMNTech" (a flowmeter company). These are **demo scenarios** for concept demonstration.

**Focus:** International tender platform for Korean SME exporters (TED, SAM.gov, G2B integration).

---

<div align="center">

**Built for Korean SMEs going global**

[Website](https://bidflow.app) | [Docs](/.forge/) | [Issues](https://github.com/yourusername/bidflow/issues)

</div>
