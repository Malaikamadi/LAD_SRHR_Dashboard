require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const excelSyncService = require('./services/excelSyncService');
const excelService = require('./services/excelService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

// Friendly status page at the root so visitors to http://localhost:5001/ aren't
// greeted with "Cannot GET /".
app.get('/', (req, res) => {
  const meta = excelService.getMeta();
  const sourceUrl = process.env.EXCEL_SOURCE_URL || '(not set)';
  const schedule = process.env.SYNC_INTERVAL || '*/5 * * * *';
  res.type('html').send(`<!doctype html>
<html><head><meta charset="utf-8"><title>LAD SRHR Backend</title>
<style>
  :root { color-scheme: dark; }
  body { font-family: -apple-system, system-ui, sans-serif; background: #0F172A; color: #E2E8F0;
         max-width: 880px; margin: 40px auto; padding: 0 24px; line-height: 1.55; }
  h1 { color: #14B8A6; margin: 0 0 4px; font-size: 1.6rem; }
  .sub { color: #94A3B8; margin-bottom: 28px; }
  .card { background: #1E293B; border: 1px solid #334155; border-radius: 12px;
          padding: 18px 22px; margin-bottom: 16px; }
  .card h2 { margin: 0 0 12px; font-size: 0.85rem; letter-spacing: .08em;
             text-transform: uppercase; color: #94A3B8; font-weight: 600; }
  .row { display: flex; justify-content: space-between; padding: 6px 0;
         border-bottom: 1px solid #334155; }
  .row:last-child { border: 0; }
  .row b { color: #CBD5E1; font-weight: 500; }
  .row span { color: #14B8A6; font-family: ui-monospace, Menlo, monospace; font-size: 0.85rem; }
  .pill { display: inline-block; padding: 2px 10px; border-radius: 999px;
          font-size: 0.75rem; font-weight: 600; }
  .ok   { background: rgba(16,185,129,0.15); color: #10B981; }
  .err  { background: rgba(239,68,68,0.15); color: #EF4444; }
  a { color: #06B6D4; text-decoration: none; }
  a:hover { text-decoration: underline; }
  code { background: #0F172A; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; }
  ul { padding-left: 18px; margin: 0; }
  li { margin: 6px 0; font-family: ui-monospace, Menlo, monospace; font-size: 0.85rem; }
</style></head>
<body>
  <h1>LAD SRHR Dashboard — Backend</h1>
  <p class="sub">Serves the master Google Sheet to the React frontend at <a href="http://localhost:5173" target="_blank">http://localhost:5173</a>.</p>

  <div class="card">
    <h2>Status</h2>
    <div class="row"><b>Service</b><span class="pill ${excelService.isReady() ? 'ok' : 'err'}">${excelService.isReady() ? 'READY' : 'LOADING'}</span></div>
    <div class="row"><b>Last sync</b><span>${meta.lastSyncedAt || '(not yet)'}</span></div>
    <div class="row"><b>Last error</b><span class="${meta.lastError ? 'pill err' : ''}">${meta.lastError || 'none'}</span></div>
    <div class="row"><b>Sheets parsed</b><span>${(meta.sheets || []).length} tabs</span></div>
  </div>

  <div class="card">
    <h2>Auto-sync</h2>
    <div class="row"><b>Source</b><span style="font-size:.75rem; word-break:break-all; max-width:560px; text-align:right;">${sourceUrl}</span></div>
    <div class="row"><b>Schedule</b><span>${schedule}  (every 5 min by default)</span></div>
    <p style="margin-top:14px; color:#94A3B8; font-size:.85rem;">
      Any time you update the master Google Sheet, the new data will appear in the dashboard
      within ~5 minutes (next cron tick) + 30 seconds (frontend re-poll). To force an immediate
      re-fetch, restart the backend.
    </p>
  </div>

  <div class="card">
    <h2>API endpoints</h2>
    <ul>
      <li><a href="/api/meta">/api/meta</a> — sync status</li>
      <li><a href="/api/kpis/national">/api/kpis/national</a> — 8 hero KPIs</li>
      <li><a href="/api/entities">/api/entities</a> — implementing entities list</li>
      <li><a href="/api/entities/rch">/api/entities/:id</a> — entity deep-dive</li>
      <li><a href="/api/objectives">/api/objectives</a> — strategic objectives</li>
      <li><a href="/api/objectives/Obj5">/api/objectives/:id</a> — objective deep-dive</li>
      <li><a href="/api/finance">/api/finance</a> — burn rate + fund flow</li>
      <li><a href="/api/procurement">/api/procurement</a> — procurement requests</li>
      <li><a href="/api/operational">/api/operational</a> — operational payments</li>
      <li><a href="/api/rmnch">/api/rmnch</a> — district scorecard</li>
      <li><a href="/api/milestones">/api/milestones</a> — implementation milestones</li>
    </ul>
  </div>
</body></html>`);
});

excelSyncService.initializeSync();

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
