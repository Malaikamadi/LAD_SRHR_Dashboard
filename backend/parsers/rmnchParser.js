// Parses "RMNCH Scorecard Indicators" — district-level hospital MMR / Neonatal / Child mortality.

const xlsx = require('xlsx');

const COLS = {
  area:        'Area',
  quarter:     'Quarter',
  year:        'Year',
  label:       'Q/YR',
  mmr:         'Hospital Maternal Mortality Rate per 10,000 delivery',
  neonatal:    'Hospital Neonatal Mortality rate (0-28 days) % of neonatal admissions (%)',
  child:       'Hospital Child Mortality (0-59 m) per admission rate (%)',
};

function _toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function parseRmnch(workbook) {
  const ws = workbook.Sheets['RMNCH Scorecard Indicators'];
  if (!ws) return { rows: [], byDistrict: {}, latestByDistrict: [] };

  const raw = xlsx.utils.sheet_to_json(ws, { defval: null });

  const rows = raw
    .filter((r) => r[COLS.area])
    .map((r) => ({
      district: String(r[COLS.area]).trim(),
      quarter: r[COLS.quarter],
      year: _toNum(r[COLS.year]),
      label: r[COLS.label],
      mmr: _toNum(r[COLS.mmr]),
      neonatalMortality: _toNum(r[COLS.neonatal]),
      childMortality: _toNum(r[COLS.child]),
    }));

  const byDistrict = {};
  for (const row of rows) {
    (byDistrict[row.district] ||= []).push(row);
  }

  // Latest record per district (max year + quarter rank)
  const qRank = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
  const latestByDistrict = Object.entries(byDistrict).map(([district, list]) => {
    const sorted = [...list].sort((a, b) => {
      if ((b.year || 0) !== (a.year || 0)) return (b.year || 0) - (a.year || 0);
      return (qRank[b.quarter] || 0) - (qRank[a.quarter] || 0);
    });
    return sorted[0];
  });

  return { rows, byDistrict, latestByDistrict };
}

module.exports = { parseRmnch };
