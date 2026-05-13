// Parses the "New dataset" tab — the master KPI grid with monthly/quarterly Actual
// and Target values per KPI, per Implementing Entity, per period.
//
// This is the primary source for the dashboard's national hero KPIs. Each row carries:
//   - KPI name + type (Output / Outcome / Input)
//   - Reporting Frequency (Monthly / Quarterly / Annual)
//   - Period (Jan, Q1, Dec, etc.) + Year
//   - Actual for the period, Target for the period, Project Target (End 2025)
//   - Implementing Entity, Status, Notes
//
// We expose two views:
//   - `rows`      : flattened, normalized rows for arbitrary querying
//   - `byKpi`     : keyed by KPI name → { rows, series } where series is a
//                   chronologically sorted array of { year, period, actual, target }.

const xlsx = require('xlsx');
const { resolveEntityId } = require('../utils/entityNameMap');

const COL = {
  id:         'ID',
  objectives: 'Objectives',
  activities: 'Activities',
  kpiType:    'KPI_Type',
  kpi:        'KPI',
  frequency:  'Reporting Frequency',
  period:     'Period',
  year:       'Year',
  actual:     'Actual for the period',
  target:     'Target for the period',
  status:     'Status',
  projectTarget: 'Project Target (End 2025)',
  entity:     'Implementing Entity',
  quarter:    'Quarter',
};

const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function _toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function _periodRank(period) {
  if (!period) return 0;
  const p = String(period).trim();
  const m = MONTH_ORDER.indexOf(p.slice(0, 3));
  if (m >= 0) return m + 1;
  if (/^Q1$/i.test(p)) return 3;
  if (/^Q2$/i.test(p)) return 6;
  if (/^Q3$/i.test(p)) return 9;
  if (/^Q4$/i.test(p)) return 12;
  return 0;
}

function parseNewDataset(workbook) {
  const ws = workbook.Sheets['New dataset'];
  if (!ws) return { rows: [], byKpi: new Map() };

  const raw = xlsx.utils.sheet_to_json(ws, { defval: null });

  const rows = raw
    .filter((r) => r[COL.kpi])
    .map((r) => ({
      id: r[COL.id] ? String(r[COL.id]).trim() : null,
      objective: r[COL.objectives] ? String(r[COL.objectives]).trim() : null,
      activity: r[COL.activities] ? String(r[COL.activities]).trim() : null,
      kpiType: r[COL.kpiType] || null,
      kpi: String(r[COL.kpi]).trim(),
      frequency: r[COL.frequency] || null,
      period: r[COL.period] || null,
      year: _toNum(r[COL.year]),
      actual: _toNum(r[COL.actual]),
      target: _toNum(r[COL.target]),
      status: r[COL.status] || null,
      projectTarget: _toNum(r[COL.projectTarget]),
      entityRaw: r[COL.entity],
      entityId: resolveEntityId(r[COL.entity]),
      quarter: r[COL.quarter] || null,
    }));

  // Group by KPI name (case-insensitive trim)
  const byKpi = new Map();
  for (const row of rows) {
    const key = row.kpi.toLowerCase();
    if (!byKpi.has(key)) byKpi.set(key, { name: row.kpi, type: row.kpiType, frequency: row.frequency, rows: [], series: [] });
    byKpi.get(key).rows.push(row);
  }

  // Build a chronological series per KPI: sort by (year, periodRank), aggregate across entities
  for (const entry of byKpi.values()) {
    const buckets = new Map();
    for (const r of entry.rows) {
      if (r.year == null) continue;
      const rank = _periodRank(r.period);
      if (rank === 0) continue;
      const key = `${r.year}-${String(rank).padStart(2,'0')}-${r.period}`;
      if (!buckets.has(key)) {
        buckets.set(key, { year: r.year, period: r.period, rank, actuals: [], targets: [] });
      }
      const b = buckets.get(key);
      if (r.actual != null) b.actuals.push(r.actual);
      if (r.target != null) b.targets.push(r.target);
    }

    const isPercent = /%/.test(entry.name) || /rate|completeness|coverage/i.test(entry.name);
    const aggregate = isPercent
      ? (arr) => arr.reduce((s, v) => s + v, 0) / arr.length
      : (arr) => arr.reduce((s, v) => s + v, 0);

    entry.series = [...buckets.values()]
      .sort((a, b) => (a.year - b.year) || (a.rank - b.rank))
      .map((b) => ({
        year: b.year,
        period: b.period,
        actual: b.actuals.length ? aggregate(b.actuals) : null,
        target: b.targets.length ? aggregate(b.targets) : null,
      }));
    entry.isPercent = isPercent;
  }

  return { rows, byKpi };
}

module.exports = { parseNewDataset };
