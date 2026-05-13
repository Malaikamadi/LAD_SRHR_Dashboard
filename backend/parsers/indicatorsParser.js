// Parses the "Indicators- SRHR" tab (3,048 rows of monthly KPIs per entity)
// into shapes the dashboard needs: national KPIs + entity-level KPIs.

const xlsx = require('xlsx');
const { resolveEntityId } = require('../utils/entityNameMap');

// The Indicators tab holds activity-level KPIs (meeting counts, training counts, etc.)
// which DON'T directly correspond to the hero KPIs the frontend renders.
// Hero rates (MMR per 100K, TPR%, CPU%, ANC%, SBA%) are only directly available from
// the RMNCH Scorecard tab (MMR) and from external sources. Activity-level KPIs surface
// in the entity deep-dives instead.
//
// We still expose a `nationalKpis` field for compatibility, but it's intentionally
// empty here — the orchestrating service layers RMNCH data on top.
const KPI_RULES = [];

function _toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function parseIndicators(workbook) {
  const ws = workbook.Sheets['Indicators- SRHR'];
  if (!ws) return { rows: [], byEntity: {}, nationalKpis: [] };

  const raw = xlsx.utils.sheet_to_json(ws, { defval: null });

  // Normalize every row
  const rows = raw
    .map((r) => {
      const entityId = resolveEntityId(r['Implementing Entity']);
      return {
        objective: r['Objectives'] ? String(r['Objectives']).trim() : null,
        activity: r['Activities'] ? String(r['Activities']).trim() : null,
        entityId,
        entityRaw: r['Implementing Entity'],
        kpiType: r['KPI_Type'] || null,
        kpi: r['KPI'] ? String(r['KPI']).trim() : null,
        frequency: r['Reporting Frequency'] || null,
        quarter: r['Quarter'] || null,
        month: r['Month'] || null,
        year: _toNum(r['Year']),
        monthlyTarget: _toNum(r['Monthly Target']),
        monthlyActual: _toNum(r['Monthly Actual']),
        quarterlyTarget: _toNum(r['Quarterly Target']),
        quarterlyActual: _toNum(r['Quarterly Actual']),
        yearTarget: _toNum(r['Target for the Year']),
        yearActual: _toNum(r['Actual for the Year']),
      };
    })
    .filter((r) => r.kpi);

  // Group by entity
  const byEntity = {};
  for (const row of rows) {
    if (!row.entityId) continue;
    if (!byEntity[row.entityId]) byEntity[row.entityId] = [];
    byEntity[row.entityId].push(row);
  }

  // Build the 8 national hero KPIs by matching KPI rules
  const nationalKpis = _buildNationalKpis(rows);

  return { rows, byEntity, nationalKpis };
}

function _buildNationalKpis(rows) {
  const out = [];

  for (const rule of KPI_RULES) {
    // Find latest matching row (by year desc) that has data
    const matches = rows
      .filter((r) => r.kpi && rule.match(r.kpi.toLowerCase()))
      .filter((r) => r.yearActual != null || r.monthlyActual != null);

    if (matches.length === 0) continue;

    // Sort by year then prefer monthly entries (which usually carry latest data)
    matches.sort((a, b) => (b.year || 0) - (a.year || 0));

    const latest = matches[0];
    const value = latest.yearActual ?? latest.monthlyActual ?? null;
    const target = latest.yearTarget ?? latest.monthlyTarget ?? null;

    // Build sparkline: take last ~11 monthly actuals for this KPI sorted by date
    const series = matches
      .filter((r) => r.month && r.monthlyActual != null)
      .sort((a, b) => {
        const ay = a.year || 0;
        const by = b.year || 0;
        if (ay !== by) return ay - by;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      })
      .map((r) => r.monthlyActual);

    const sparkline = series.slice(-11);

    // Trend: compare last two sparkline points if available
    let change = 0;
    if (sparkline.length >= 2) {
      const prev = sparkline[sparkline.length - 2];
      const curr = sparkline[sparkline.length - 1];
      if (prev) change = Number((((curr - prev) / prev) * 100).toFixed(1));
    }

    out.push({
      id: rule.id,
      value,
      target,
      change,
      sparkline,
      sourceKpi: latest.kpi,
      goalLower: rule.goalLower,
    });
  }

  return out;
}

module.exports = { parseIndicators };
