// Parses "BURN RATE SUMMARY SHEET" + "Operational payments" to produce:
//   - summary: totals (funds, dispensed, unspent) + burn rates by year + total
//   - fundFlow: array of disbursement events (used by the waterfall in BurnRate.jsx)
//   - monthlyBurn: 12-month operational vs procurement breakdown

const xlsx = require('xlsx');
const { toISODate } = require('../utils/dateUtils');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function _toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function _firstNonNull(rows, key) {
  for (const r of rows) {
    if (r[key] != null && r[key] !== '') return r[key];
  }
  return null;
}

function parseBurnRate(workbook) {
  const wsBurn = workbook.Sheets['BURN RATE SUMMARY SHEET'];
  const wsOps  = workbook.Sheets['Operational payments'];
  const wsProc = workbook.Sheets['Procurement Activities'];

  // ────────────────────────────────────────────────────────────────
  // BURN RATE SUMMARY SHEET
  // ────────────────────────────────────────────────────────────────
  const burnRows = wsBurn ? xlsx.utils.sheet_to_json(wsBurn, { defval: null }) : [];

  const totalFunds = _toNum(_firstNonNull(burnRows, 'Total Amount disbursed')) || 0;
  const totalUnspent = _toNum(_firstNonNull(burnRows, 'Total Amount Unspent')) || 0;
  const spentY1 = _toNum(_firstNonNull(burnRows, 'Total Amount spent in Year 1 ($)')) || 0;
  const spentY2 = _toNum(_firstNonNull(burnRows, 'Total Amount spent in Year 2 ($)')) || 0;
  const spentY3 = _toNum(_firstNonNull(burnRows, 'Total Amount spent in Year 3 ($)')) || 0;
  const totalDispensed = spentY1 + spentY2 + spentY3;

  const y2023 = _toNum(_firstNonNull(burnRows, 'Burn Rate\nYear 1'));
  const y2024 = _toNum(_firstNonNull(burnRows, 'Burn Rate\nYear 2'));
  const y2025 = _toNum(_firstNonNull(burnRows, 'Burn Rate\nYear 3'));
  const totalBR = _toNum(_firstNonNull(burnRows, 'Burn Rate @ Current Disbursement'));

  const summary = {
    totalFunds,
    totalDispensed,
    totalUnspent,
    burnRates: {
      y2023: y2023 != null ? Number((y2023 * 100).toFixed(2)) : null,
      y2024: y2024 != null ? Number((y2024 * 100).toFixed(2)) : null,
      y2025: y2025 != null ? Number((y2025 * 100).toFixed(2)) : null,
      total: totalBR != null ? Number((totalBR * 100).toFixed(2)) : null,
    },
  };

  // Fund flow: each row in the sheet that has an "Amount ($) Disbursed" is one event
  const fundFlow = burnRows
    .filter((r) => _toNum(r['Amount ($) Disbursed']) != null)
    .map((r) => ({
      date: toISODate(r['Disbursement Year']) || (r['Disbursement Period'] || ''),
      period: r['Disbursement Period'] || null,
      amount: _toNum(r['Amount ($) Disbursed']),
    }));

  // ────────────────────────────────────────────────────────────────
  // Monthly burn: combine Operational payments + Procurement Activities
  // by month using "Date Submitted to IHPAU" -> month, summed $ amounts.
  // ────────────────────────────────────────────────────────────────
  const monthlyMap = MONTHS.reduce((acc, m) => {
    acc[m] = { month: m, operational: 0, procurement: 0 };
    return acc;
  }, {});

  function addMonthlyFromSheet(ws, category, amountKey) {
    if (!ws) return;
    const rows = xlsx.utils.sheet_to_json(ws, { defval: null });
    for (const r of rows) {
      const iso = toISODate(r['Date Submitted to IHPAU']);
      if (!iso) continue;
      const monthIdx = new Date(iso).getUTCMonth();
      const monthKey = MONTHS[monthIdx];
      const amount = _toNum(r[amountKey]);
      if (!amount) continue;
      monthlyMap[monthKey][category] += amount;
    }
  }

  addMonthlyFromSheet(wsOps,  'operational', ' Total  Amount Requested ($)');
  addMonthlyFromSheet(wsProc, 'procurement', ' Total  Amount Requested ($)');

  const monthlyBurn = MONTHS.map((m) => ({
    month: m,
    operational: Math.round(monthlyMap[m].operational),
    procurement: Math.round(monthlyMap[m].procurement),
  }));

  return { summary, fundFlow, monthlyBurn };
}

module.exports = { parseBurnRate };
