# IntegraMind AI × Minoan Lines S.A.
## AI-Powered IT & Operations Platform

Built by **IntegraMind AI** (integramindai.com) for **Minoan Lines S.A.**, Heraklion, Crete.

> **Client contact:** Michalis Orfanoudakis, IT Department Manager
> **Platform version:** 2.0.0
> **Last deployed:** 2026-05-14
> **AI model:** DeepSeek Chat (via OpenAI-compatible API)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript strict) |
| Styling | Tailwind CSS + custom maritime design system |
| i18n | react-i18next · 20 languages |
| Auth | Supabase Auth (email/password) |
| Database + Realtime | Supabase (PostgreSQL + WebSocket Realtime) |
| AI | DeepSeek Chat via OpenAI SDK |
| AIS | AISstream.io WebSocket (live vessel positions) |
| Security | Next.js Middleware (rate limiting, OWASP headers, CSP) |
| PWA | next-pwa (service worker, offline support) |
| Deploy | Vercel (Hobby / Pro) |

---

## Platform Modules (11 total)

| # | Module | Route | Description |
|---|--------|-------|-------------|
| 1 | Reserve a Ferry | `/book` | Online ticket booking — instant email confirmation |
| 2 | Vessel Operations | `/vessels` | Real-time AIS tracking, delay prediction, fuel monitoring |
| 3 | AI Customer Agent | `/chat` | Multi-language AI assistant (20 languages) |
| 4 | EU Compliance | `/compliance` | EU ETS & FuelEU Maritime reports with AI narrative |
| 5 | IT Helpdesk | `/helpdesk` | AI-triaged tickets, SLA tracking, escalation |
| 6 | Analytics & Insights | `/analytics` | Demand forecasting, revenue intelligence |
| 7 | Crew & Personnel | `/employees` | Seafarer records, STCW/medical expiry, leave management |
| 8 | Fleet Maintenance | `/maintenance` | Work orders, PM schedules, parts inventory, fuel logs |
| 9 | Operations Dashboard | `/dashboard` | Real-time KPIs across all operations |
| 10 | System Health | `/health` | API, DB and service uptime monitoring |
| 11 | Audit Log | `/audit` | Compliance trail for all system events |

---

## Security

- **Rate limiting** — 100 req/min general API, 10 req/15min auth endpoints (in-memory; replace with Redis/@upstash for multi-instance)
- **OWASP headers** — X-Frame-Options DENY, HSTS, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **Content Security Policy** — strict CSP via next.config.js
- **Path traversal guard** — middleware rejects `../` and encoded variants
- **Input validation** — `src/lib/validation.ts` sanitizes all API inputs (string, email, date, enum, int, float)
- **Parameterized queries** — all DB access via Supabase ORM (no raw SQL)
- **Authentication** — Supabase Auth (email/password with secure session management)

---

## i18n — 20 Languages

Every word in the interface translates. Supported languages:

English · Greek · Spanish · French · German · Italian · Portuguese · Arabic · Chinese · Japanese · Russian · Turkish · Dutch · Polish · Swedish · Korean · Hindi · Ukrainian · Romanian · Czech

Language auto-detected from browser; persists in `localStorage`. Fallback: English.

---

## Realtime (WebSocket)

- **AIS vessel positions** — `wss://stream.aisstream.io/v0/stream` (server-side, live positions)
- **Supabase Realtime** — `src/lib/realtime.ts` provides `useTableSubscription()` hook for live updates on `work_orders`, `leave_requests`, `employees` tables
- **SSE** — compliance and analytics streaming responses from AI

---

## Horizontal Scaling

All API routes are stateless. Session state is stored in Supabase (not server memory). In-memory rate limiter in `src/middleware.ts` works per-instance — replace with `@upstash/ratelimit` + Redis for true horizontal scaling. Supabase connection pooling via pgBouncer is enabled by default on hosted projects.

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- Supabase project (free tier works) — [supabase.com](https://supabase.com)
- DeepSeek API key — [platform.deepseek.com](https://platform.deepseek.com)

### 1. Install dependencies

```bash
cd minoan-ai-platform
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local:
# DEEPSEEK_API_KEY=sk-...
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
# AISSTREAM_API_KEY=your-key (optional — mock data used if absent)
```

### 3. Set up Supabase schema (optional)

Run `supabase/employees-maintenance.sql` in your Supabase SQL editor. The platform works without this — all modules fall back to realistic seed data.

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any Supabase Auth user or create one at `/auth`.

### 5. Build for production

```bash
npm run build   # must pass before any git push
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | **Yes** | DeepSeek Chat API key |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Service role key (server-side only) |
| `AISSTREAM_API_KEY` | No | AISstream.io key for live AIS data |
| `RESEND_API_KEY` | No | Email confirmation for bookings |

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│          Next.js 14 App (Vercel Edge / Serverless)             │
│  /book /vessels /chat /compliance /helpdesk /analytics          │
│  /employees /maintenance /dashboard /health /audit              │
│  ──────────────────────────────────────────────────             │
│  src/middleware.ts  (rate limiting · OWASP headers · CSP)       │
│  src/lib/validation.ts  (input sanitization at API boundaries)  │
│  src/lib/i18n.ts  (20 languages · react-i18next)                │
│  src/lib/realtime.ts  (Supabase Realtime WebSocket hooks)        │
└──────────────┬──────────────────────────────┬──────────────────┘
               │  Supabase SDK                 │  OpenAI-compat SDK
   ┌───────────▼──────────────┐   ┌───────────▼───────────────┐
   │  Supabase Cloud           │   │  DeepSeek API             │
   │  PostgreSQL + pgBouncer   │   │  deepseek-chat model      │
   │  Auth (email/password)    │   └───────────────────────────┘
   │  Realtime (WebSocket)     │
   └───────────────────────────┘
               │
   ┌───────────▼───────────────────────────────────────┐
   │  AISstream.io  (wss://stream.aisstream.io/v0/stream) │
   │  Live AIS vessel positions for Minoan fleet          │
   └──────────────────────────────────────────────────────┘
```

---

## Deployment (Vercel)

1. Connect repo to Vercel → auto-detects Next.js
2. Set environment variables (Settings → Environment Variables)
3. Deploy — Vercel handles builds, edge middleware, and CDN

Push to `master` triggers automatic redeploy via Vercel GitHub integration.

---

## Compliance Disclaimer

> Reports generated by this platform include the notice:
> *"Generated by IntegraMind AI for Minoan Lines S.A. — verify against official regulatory filings."*
>
> **EU ETS** figures are calculated per Regulation (EU) 2023/957.
> **FuelEU Maritime** figures are calculated per Regulation (EU) 2023/1805.
> All outputs must be verified by a qualified compliance officer before submission to regulators.

---

## Support

- **Platform issues:** contact@integramindai.com
- **Minoan Lines IT:** Michalis Orfanoudakis, IT Department Manager

---

*Built with Claude Sonnet 4.6 by IntegraMind AI · 2026*