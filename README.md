# LAD SRHR Dashboard

Sierra Leone Ministry of Health — Sexual and Reproductive Health and Rights delivery tracker.

A React + Vite frontend backed by a Node/Express service that pulls live data from a master Google Sheet ("Sierra Leone Dashboard Feeder") every 5 minutes.

- **Frontend** (`/`): React 19 + Vite + Recharts + Leaflet
- **Backend** (`/backend`): Express + xlsx + node-cron, parses 11 tabs of the master sheet into clean REST endpoints
- **Source of truth**: [master Google Sheet](https://docs.google.com/spreadsheets/d/13BdhsV2kybmVf2Hg1FRJB3wsARjfES6ctTiHbX_pYFk/edit) (publicly readable)

## Local development

```bash
# 1. Install deps
npm install
cd backend && npm install && cd ..

# 2. Configure backend env
cp backend/.env.example backend/.env

# 3. Start the backend (port 5001)
cd backend && npm run dev       # nodemon-watched
# or: npm start                 # plain node

# 4. In a second terminal, start the frontend (port 5173)
npm run dev
```

Visit `http://localhost:5173` for the dashboard and `http://localhost:5001` for the backend status page.

## How the data flows

```
 Google Sheet                Backend                       Frontend
 ────────────                ───────                       ────────
 11 tabs of                  every 5 min: pull xlsx →      every 30s: GET /api/...
 raw data         ──────►    parse → cache snapshot   ◄──  hydrate DataContext
 (publicly        every      ↓                              ↓
  readable)       sync       11 endpoints under /api       React components render
                                                            from live snapshot
```

So when you upload new data to the master sheet, the dashboard reflects it within ~5.5 minutes (5 min cron tick + 30 sec frontend re-poll). No code changes, no rebuild.

## Architecture

### Backend (`/backend`)

| Concern | File |
|---|---|
| Entry point | `index.js` (Express, mounts `/api`, status page at `/`) |
| Sync orchestration | `services/excelSyncService.js` (cron + axios + disk fallback) |
| Parser orchestration | `services/excelService.js` (assembles cached snapshot) |
| Per-domain parsers | `parsers/{indicators,implementation,burnRate,procurement,operational,rmnch}Parser.js` |
| Normalization utils | `utils/{entityNameMap,statusNormalizer,dateUtils,objectiveUtils}.js` |
| HTTP layer | `controllers/dashboardController.js` + `routes/api.js` |

### API endpoints

```
GET /api/meta                  System status + last sync time
GET /api/kpis/national         8 hero KPIs (MMR from RMNCH, rest are defaults)
GET /api/entities              Implementing entities with task progress
GET /api/entities/:id          Entity deep-dive (objectives + KPIs + activities)
GET /api/objectives            7 strategic objectives with linked entities
GET /api/objectives/:id        Objective deep-dive (milestones + procurement)
GET /api/finance               Burn rate + fund flow + monthly breakdown
GET /api/procurement           All procurement requests
GET /api/operational           All operational payments
GET /api/rmnch                 District-level scorecard (per quarter)
GET /api/milestones            Implementation milestones
```

### Frontend (`/src`)

- `context/DataContext.jsx` — fetches the main endpoints on mount, re-polls every 30s, exposes `useEntityDetail(id)` and `useObjectiveDetail(id)` for deep-dives
- Components live in `src/components/`; each subscribes to whatever slice of `useData()` it needs

## Environment variables

### Backend (`backend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5001` | Port to listen on (set automatically on Render) |
| `EXCEL_SOURCE_URL` | (none) | Public xlsx download URL for the master sheet |
| `SYNC_INTERVAL` | `*/5 * * * *` | Cron schedule for re-fetching the sheet |

### Frontend (`.env` or Vercel env)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE` | `http://localhost:5001` | Backend base URL — set this in Vercel to your Render URL for production |

## Deployment

The frontend deploys to Vercel; the backend to Render. Both free tiers are sufficient.

### 1. Deploy the backend to Render

The repo includes a `render.yaml` Blueprint that wires up everything declaratively.

1. Sign up / log in at <https://render.com>.
2. **New** → **Blueprint** → connect this GitHub repo → pick the `render.yaml` at repo root.
3. Render reads the Blueprint, creates the `lad-srhr-backend` web service, builds it (`npm install` in `/backend`), and starts it (`npm start`).
4. After ~3 minutes you'll get a public HTTPS URL like `https://lad-srhr-backend.onrender.com`. Open it — you should see the status landing page with "Service: READY" and "11 tabs parsed".

The `render.yaml` already sets `EXCEL_SOURCE_URL` and `SYNC_INTERVAL` for you. To change them later, edit env vars in the Render dashboard.

**Free-tier caveat**: instances spin down after 15 min idle, so the first request after a quiet period takes ~30-60s (cold start). On wake-up the cron resumes normally.

### 2. Point Vercel at the Render backend

1. Open the Vercel project (lad-seven) → **Settings** → **Environment Variables**.
2. Add `VITE_API_BASE` = `https://lad-srhr-backend.onrender.com` (use your actual Render URL, no trailing slash).
3. **Redeploy** the project so the new env var gets baked into the build.

Open `https://lad-seven.vercel.app` — the dashboard now pulls from the Render backend instead of trying to hit `localhost`.

## Master sheet structure

The backend expects these tabs in the master sheet (existing names work; the parser is tolerant of whitespace and quote inconsistencies):

| Tab | What it powers |
|---|---|
| `Indicators- SRHR` | Entity-level KPIs (rolled up per entity & objective) |
| `New dataset` | Reserved for richer KPI metadata |
| `BURN RATE SUMMARY SHEET` | Burn rate %, totals, fund flow waterfall |
| `Main Indicators- since 2024` | KPI baselines / targets |
| `Implementation Tracker` | All milestones (powers MilestoneTracking, HealthMap progress) |
| `Procurement Activities` | Procurement table + analytics |
| `Operational payments` | Monthly operational burn split |
| `RMNCH Scorecard Indicators` | District-level MMR / Neonatal / Child mortality |
| `Routines-Final` | Implementation routines reference |
| `Procurement Milestones` | Procurement-method timeline reference |

## Notable normalization choices

- **Entity names** appear with 11+ variants across tabs (`"NEMS"`, `"National Emergency Medical Services (NEMS)"`, `'"""Directorate of Planning, Policy and Information(DPPI)"""'`). All are canonicalized in `utils/entityNameMap.js` to stable IDs.
- **Status values** appear with 13+ variants (`Complete`, `completed`, `Ongoing-with slight delays`, `On-going on track`…). Canonicalized to `complete | ongoing | pending | overdue` in `utils/statusNormalizer.js`.
- **MMR** in the dashboard is shown per 100K, but the RMNCH Scorecard stores it per 10K. The backend scales it by 10× when building the national MMR KPI.
- **Hero KPIs not present in the master sheet** (TPR%, CPU%, ANC%, SBA%, GBV) fall back to static defaults and are flagged with `fromSheet: false` in the API response so consumers can tell which numbers are live and which are placeholders.
