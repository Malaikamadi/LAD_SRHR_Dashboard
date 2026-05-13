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

function parseOperational(workbook) {
  const ws = workbook.Sheets['Operational payments'];
  if (!ws) return { rows: [], byEntity: {} };

  const raw = xlsx.utils.sheet_to_json(ws, { defval: null });

  const rows = raw
    .map((r, i) => {
      const entityRaw = r['Implementing Entity'];
      const entityId = resolveEntityId(entityRaw);
      const entity = entityId ? getEntity(entityId) : null;
      const status = normalizeStatus(r[' Status'] || r['Status']);

      return {
        id: i + 1,
        entity: entity ? entity.abbrev : (entityRaw ? String(entityRaw).slice(0, 32) : 'Unknown'),
        entityId,
        item: _trim(r['__EMPTY']) || _trim(r['Details of request (if applicable)']) || 'Operational payment',
        requestedBy: _trim(r['Requesting Authority']),
        approvedBy: _trim(r['Approving Authority']),
        category: _trim(r['Expenditure Category as\nProject Implementation Manual (PIM)']),
        objective: extractObjectiveId(r['Associated Objective  \n'] || r['Associated Objective']),
        amountReq: _toNum(r[' Total  Amount Requested ($)']) || 0,
        amountReqLe: _toNum(r[' Total  Amount Requested (Le)']) || 0,
        submittedDate: toPrettyDate(r['Date Submitted to IHPAU']),
        estCompletion: toPrettyDate(r['Estimated completion date']),
        actualCompletion: toPrettyDate(r['Actual completion date']),
        method: _trim(r['Procurement method']),
        disbursementYear: _trim(r['Disbursement Year']),
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
