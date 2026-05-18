// Parses "Procurement Activities" into the shape ProcurementTracker.jsx expects.

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

// Probe rows 0..5 to find the row that contains the expected header
// (covers the case where the sheet has a merged "title" row above headers).
// Once found, rows are returned with normalized keys (trim + collapse
// internal whitespace + lowercase) so column lookups are resilient to
// whitespace jitter in the source sheet.
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

function parseProcurement(workbook) {
  const ws = workbook.Sheets['Procurement Activities'];
  if (!ws) return { rows: [], byEntity: {}, byStatus: {}, byObjective: {} };

  const raw = _readSheetWithHeaderProbe(ws, 'Implementing Entity');

  const rows = raw
    .map((r, i) => {
      const entityRaw = _G(r, 'Implementing Entity');
      const entityId = resolveEntityId(entityRaw);
      const entity = entityId ? getEntity(entityId) : null;

      // Derive status: prefer explicit Status column, fallback by date
      const rawStatus = _G(r, 'Status');
      let status = normalizeStatus(rawStatus);
      const actualEnd = toISODate(_G(r, 'Actual completion date'));
      const estEnd = toISODate(_G(r, 'Estimated completion date'));
      if (!rawStatus) {
        if (actualEnd) status = 'complete';
        else if (estEnd && new Date(estEnd) < new Date()) status = 'overdue';
        else status = 'ongoing';
      }

      const objectiveId = extractObjectiveId(_G(r, 'Associated Objective'));

      return {
        id: i + 1,
        entity: entity ? entity.abbrev : (entityRaw ? String(entityRaw).slice(0, 32) : 'Unknown'),
        entityId,
        item: _trim(_G(r, 'Details of request (if applicable)')) || _trim(_G(r, 'Activity Code')) || 'Procurement request',
        requestedBy: _trim(_G(r, 'Requesting Authority')),
        approvedBy: _trim(_G(r, 'Approving Authority')),
        submittedDate: toPrettyDate(_G(r, 'Date submitted for Approval')) || toPrettyDate(_G(r, 'Date Submitted to IHPAU')),
        estCompletion: toPrettyDate(_G(r, 'Estimated completion date')),
        actualCompletion: toPrettyDate(_G(r, 'Actual completion date')),
        amountReq: _toNum(_G(r, 'Total Amount Requested ($)')) || 0,
        amountReqLe: _toNum(_G(r, 'Total Amount Requested (Le)')) || 0,
        method: _trim(_G(r, 'Procurement method')),
        currentStep: _trim(_G(r, 'Current step as per Procurement Milestones in PIM')),
        nextStep: _trim(_G(r, 'Next step as Procurement Milestones in PIM')),
        category: _trim(_G(r, 'Expenditure Category as Project Implementation Manual (PIM)')),
        activityCode: _trim(_G(r, 'Activity Code')),
        disbursementYear: _trim(_G(r, 'Disbursement Year')),
        objective: objectiveId,
        status,
        rawStatus: rawStatus || null,
        notes: _trim(_G(r, 'Comments, Challenges, or Asks of IEs, PMC, or PSC')),
      };
    })
    .filter((row) => row.amountReq > 0 || row.item !== 'Procurement request');

  const byEntity = {};
  const byStatus = {};
  const byObjective = {};
  for (const r of rows) {
    if (r.entityId) (byEntity[r.entityId] ||= []).push(r);
    (byStatus[r.status] ||= []).push(r);
    if (r.objective) (byObjective[r.objective] ||= []).push(r);
  }

  return { rows, byEntity, byStatus, byObjective };
}

module.exports = { parseProcurement };
