// Excel serial date conversion + flexible date string parsing
// Excel epoch is 1899-12-30 (accounting for the 1900 leap year bug).

const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 86400000;

function isExcelSerial(value) {
  if (typeof value !== 'number') return false;
  // Excel serials in the modern range: ~36500 (1999) to ~55000 (2050)
  return value > 20000 && value < 60000;
}

function excelSerialToDate(serial) {
  if (!isExcelSerial(serial)) return null;
  return new Date(EXCEL_EPOCH_MS + Math.round(serial) * MS_PER_DAY);
}

function toISODate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date && !isNaN(value)) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') {
    const d = excelSerialToDate(value);
    return d ? d.toISOString().slice(0, 10) : null;
  }
  // Try common string formats
  const s = String(value).trim();
  // DD/MM/YYYY
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Fallback to Date parsing
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

function toPrettyDate(value) {
  const iso = toISODate(value);
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

module.exports = {
  isExcelSerial,
  excelSerialToDate,
  toISODate,
  toPrettyDate,
};
