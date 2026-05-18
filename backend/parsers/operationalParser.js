// Parses "Operational payments" tab into a normalized list keyed by entity.

const xlsx = require('xlsx');
const { resolveEntityId, getEntity } = require('../utils/entityNameMap');
const { normalizeStatus } = require('../utils/statusNormalizer');
const { toPrettyDate, toISODate } = require('../utils/dateUtils');
const { extractObjectiveId } = require('../utils/objectiveUtils');

function _toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function _trim(v) {
  return v == null ? null : String(v).trim();
}

// Probe rows 0..5 to find the real header row (sheet has a merged
// "title" row above headers). Keys are normalized (trim + collapse
// whitespace + lowercase) so column lookups survive whitespace jitter.
function _normKey(k) {
  return String(k).trim().replace(/\s+/g, ' ').toLowerCase();
}
function _readSheetWithHeaderProbe(ws, expectedKey, maxSkip = 5) {
  const normExpected = _normKey(expectedKey);
  for (let skip = 0; skip <= maxSkip; skip++) {
    const rows = xlsx.utils.sheet_to_json(ws, { defval: null, range: skip });
    if (rows.length === 0) continue;
    if (Object.keys(rows[0]).some((k) => _normKey(k) === normExpected)) {
      return rows.map((r) => {
        const out = {};
        for (const [k, v] of Object.entries(r)) out[_normKey(k)] = v;
        return out;
      });
    }
  }
  return xlsx.utils.sheet_to_json(ws, { defval: null }).map((r) => {
    const out = {};
    for (const [k, v] of Object.entries(r)) out[_normKey(k)] = v;
    return out;
  });
}
const _G = (row, name) => row[_normKey(name)];

function parseOperational(workbook) {
  const ws = workbook.Sheets['Operational payments'];
  if (!ws) return { rows: [], byEntity: {} };

  const raw = _readSheetWithHeaderProbe(ws, 'Implementing Entity');

  const rows = raw
    .map((r, i) => {
      const entityRaw = _G(r, 'Implementing Entity');
      const entityId = resolveEntityId(entityRaw);
      const entity = entityId ? getEntity(entityId) : null;
      const status = normalizeStatus(_G(r, 'Status'));

      return {
        id: i + 1,
        entity: entity ? entity.abbrev : (entityRaw ? String(entityRaw).slice(0, 32) : 'Unknown'),
        entityId,
        item: _trim(_G(r, 'Details of request (if applicable)')) || 'Operational payment',
        requestedBy: _trim(_G(r, 'Requesting Authority')),
        approvedBy: _trim(_G(r, 'Approving Authority')),
        category: _trim(_G(r, 'Expenditure Category as Project Implementation Manual (PIM)')),
        objective: extractObjectiveId(_G(r, 'Associated Objective')),
        amountReq: _toNum(_G(r, 'Total Amount Requested ($)')) || 0,
        amountReqLe: _toNum(_G(r, 'Total Amount Requested (Le)')) || 0,
        submittedDate: toPrettyDate(_G(r, 'Date Submitted to IHPAU')),
        estCompletion: toPrettyDate(_G(r, 'Estimated completion date')),
        actualCompletion: toPrettyDate(_G(r, 'Actual completion date')),
        method: _trim(_G(r, 'Procurement method')),
        disbursementYear: _trim(_G(r, 'Disbursement Year')),
        status,
      };
    })
    .filter((r) => r.amountReq > 0);

  const byEntity = {};
  for (const r of rows) {
    if (r.entityId) (byEntity[r.entityId] ||= []).push(r);
  }

  return { rows, byEntity };
}

module.exports = { parseOperational };
