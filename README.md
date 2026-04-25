# IntegraMind AI × Minoan Lines S.A.
## AI-Powered IT & Operations Platform

Built by **IntegraMind AI** (integramindai.com) for **Minoan Lines S.A.**, Heraklion, Crete.

> **Client contact:** Michalis Orfanoudakis, IT Department Manager
> **Platform version:** 1.0.0
> **AI model:** `claude-sonnet-4-20250514`

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Flutter 3 (web · Android · iOS) |
| State management | Riverpod 2 |
| Navigation | go_router |
| Backend | FastAPI (Python 3.11) |
| Database + Realtime | Supabase (PostgreSQL) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Rate limiting | slowapi (3 tiers: 20 / 30 / 120 req/min) |
| Frontend deploy | Vercel |
| Backend deploy | Railway |
| CI/CD | GitHub Actions |

---

## Platform Modules

| # | Module | Endpoint prefix | Description |
|---|--------|----------------|-------------|
| 1 | Vessel Ops Dashboard | `/vessels` | Live AIS tracking, delay prediction, NL fleet queries |
| 2 | Customer Support Agent | `/chat` | Streaming Claude agent (Greek + English), auto-escalation |
| 3 | Compliance & Reporting | `/reports`, `/compliance` | EU ETS, FuelEU Maritime, ISO 9001, ATHEX PDF reports |
| 4 | IT Helpdesk Triage | `/tickets` | AI ticket classification, SLA tracking |
| 5 | Analytics & Forecasting | `/analytics` | Prophet demand forecasting, NL revenue intelligence |

---

## Quick Start (Local)

### Prerequisites
- Python 3.11+
- Flutter 3.24+
- Supabase project (free tier works) — [supabase.com](https://supabase.com)
- `ANTHROPIC_API_KEY` from [console.anthropic.com](https://console.anthropic.com)

### 1. Configure environment

```bash
cd minoan-ai-platform
cp .env.example .env
# Edit .env — fill in ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

### 2. Set up Supabase schema

In your Supabase project → SQL Editor → New query, paste and run:

```
backend/supabase/schema.sql
```

This creates all tables, indexes, RLS policies, and seeds the 8 Minoan vessels.

### 3. Run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Run the Flutter app

```bash
cd app
flutter pub get

# Web (dev)
flutter run -d chrome \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=API_BASE_URL=http://localhost:8000

# Android / iOS
flutter run \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=API_BASE_URL=https://your-api.railway.app
```

### 5. Verify

```bash
# Backend health
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs
```

---

## API Reference

### Module 1 — Vessel Ops

```
GET  /vessels                           All vessel live statuses + delay probability
GET  /vessels/{name}/status             Single vessel (e.g. "Knossos Palace")
GET  /vessels/{name}/delay-prediction   Delay model output
POST /vessels/query                     NL fleet query {"question": "..."}
POST /vessels/sync                      Manual AIS sync trigger
```

**NL fleet query example:**
```bash
curl -X POST http://localhost:8000/vessels/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Which vessels are running more than 30 minutes late today?"}'
```

### Module 2 — Customer Support Agent

```
POST /chat                              Streaming SSE chat
GET  /chat/{session_id}/history         Conversation history
POST /chat/{session_id}/close           Mark resolved
```

**Streaming (Greek):**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Πότε φεύγει το επόμενο πλοίο για Ηράκλειο;"}' \
  --no-buffer
```

### Module 3 — Compliance

```
POST /reports/generate                  Generate PDF report
GET  /reports/{type}/latest             Latest report (eu_ets|fueleu|iso9001|athex_quarterly)
GET  /reports/{id}/download             Download PDF
POST /compliance/fuel-data              Ingest SCADA fuel record (idempotent)
GET  /compliance/fuel-data              List fuel records
```

**Generate EU ETS report:**
```bash
curl -X POST http://localhost:8000/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"report_type": "eu_ets", "report_period": "2025-Q1", "vessel_name": "Knossos Palace"}'
```

### Module 4 — Helpdesk

```
POST   /tickets                         Create + AI-triage ticket (201)
GET    /tickets                         List (?status=open&priority=critical&category=Network/Connectivity)
GET    /tickets/{id}                    Get ticket
PATCH  /tickets/{id}                    Update status / resolution
```

**Submit ticket:**
```bash
curl -X POST http://localhost:8000/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "VSAT on Knossos Palace losing connection every hour",
    "description": "Satellite comms have been dropping for 24h. Affects crew internet and AIS reporting.",
    "submitted_by": "Captain Papadopoulos"
  }'
```

### Module 5 — Analytics

```
POST /analytics/forecast                Run passenger/revenue forecast
GET  /analytics/performance-summary     NL summary via Claude (?query=...)
POST /analytics/upload?route=...        Upload historical CSV (date,passengers columns)
GET  /analytics/routes                  List available routes
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | **Yes** | Claude API key |
| `SUPABASE_URL` | **Yes** | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Service role key (server-side only) |
| `AIS_API_KEY` | No | AISStream.io key (mock data used if absent) |
| `SLACK_WEBHOOK_URL` | No | Delay alerts when probability > 70% |
| `SMTP_*` | No | Email report delivery |

See `.env.example` for the full list.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Flutter App (web · Android · iOS)           │
│     Dashboard · Chat · Compliance · Helpdesk · Analytics │
│               Riverpod · go_router · fl_chart            │
└──────────────────────┬──────────────────────────────────┘
                       │  REST + SSE (Dio)
          ┌────────────▼──────────────────────────────┐
          │           FastAPI Backend                   │
          │  /vessels /chat /reports /tickets           │
          │  /compliance /analytics                     │
          │  slowapi rate limiting (3 tiers)            │
          └───────────┬──────────────┬─────────────────┘
                      │              │
          ┌───────────▼──────┐  ┌───▼──────────────────┐
          │   Supabase Cloud  │  │  Anthropic Claude     │
          │   PostgreSQL      │  │  claude-sonnet-4-...  │
          │   Realtime        │  └──────────────────────┘
          │   (vessels, chat, │
          │    tickets)       │
          └───────────────────┘
                      │
          ┌───────────▼───────────────────────────────┐
          │  AIS API · ReportLab PDFs · Prophet · SMTP │
          └────────────────────────────────────────────┘
```

---

## Deployment

### Vercel (Flutter web)

1. Connect repo to Vercel
2. Set **Build Command:** `cd app && flutter build web --release --web-renderer canvaskit --dart-define=SUPABASE_URL=$SUPABASE_URL --dart-define=API_BASE_URL=$API_BASE_URL`
3. Set **Output Directory:** `app/build/web`
4. Add env vars: `SUPABASE_URL`, `API_BASE_URL`

Or use GitHub Actions (`deploy.yml`) which builds and deploys automatically on push to `main`.

### Railway (FastAPI backend)

1. Create a Railway project, add a service pointing to the repo root
2. Set root directory to `backend/`
3. Railway auto-detects `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2`
4. Add all env vars from `.env.example` as Railway variables

### GitHub Actions secrets required

| Secret | Used by |
|--------|---------|
| `VERCEL_TOKEN` | deploy.yml — Flutter web |
| `VERCEL_ORG_ID` | deploy.yml |
| `VERCEL_PROJECT_ID` | deploy.yml |
| `RAILWAY_TOKEN` | deploy.yml — FastAPI |
| `SUPABASE_URL` | deploy.yml — build-time dart-define |
| `API_BASE_URL` | deploy.yml — build-time dart-define |

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
- **Anthropic Claude API:** console.anthropic.com

---

*Built with Claude claude-sonnet-4-20250514 by IntegraMind AI · 2025*