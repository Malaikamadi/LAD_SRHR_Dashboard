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

function parseProcurement(workbook) {
  const ws = workbook.Sheets['Procurement Activities'];
  if (!ws) return { rows: [], byEntity: {}, byStatus: {}, byObjective: {} };

  const raw = xlsx.utils.sheet_to_json(ws, { defval: null });

  const rows = raw
    .map((r, i) => {
      const entityRaw = r['Implementing Entity'];
      const entityId = resolveEntityId(entityRaw);
      const entity = entityId ? getEntity(entityId) : null;

      // Derive status: prefer explicit Status column, fallback by date
      let status = normalizeStatus(r['Status']);
      const actualEnd = toISODate(r['Actual completion date']);
      const estEnd = toISODate(r['Estimated completion date']);
      if (!r['Status']) {
        if (actualEnd) status = 'complete';
        else if (estEnd && new Date(estEnd) < new Date()) status = 'overdue';
        else status = 'ongoing';
      }

      const objectiveId = extractObjectiveId(r['Associated Objective  \n'] || r['Associated Objective']);

      return {
        id: i + 1,
        entity: entity ? entity.abbrev : (entityRaw ? String(entityRaw).slice(0, 32) : 'Unknown'),
        entityId,
        item: _trim(r['Details of request (if applicable)']) || _trim(r[' Activity Code']) || 'Procurement request',
        requestedBy: _trim(r['Requesting Authority']),
        approvedBy: _trim(r['Approving Authority']),
        submittedDate: toPrettyDate(r['Date submitted for Approval']) || toPrettyDate(r['Date Submitted to IHPAU']),
        estCompletion: toPrettyDate(r['Estimated completion date']),
        actualCompletion: toPrettyDate(r['Actual completion date']),
        amountReq: _toNum(r[' Total  Amount Requested ($)']) || _toNum(r['Total Amount Requested ($)']) || 0,
        amountReqLe: _toNum(r[' Total Amount Requested (Le)']) || _toNum(r['Total Amount Requested (Le)']) || 0,
        method: _trim(r['Procurement method']),
        currentStep: _trim(r['Current step as per Procurement Milestones in PIM']),
        nextStep: _trim(r['Next step as Procurement Milestones in PIM']),
        category: _trim(r['Expenditure Category as\nProject Implementation Manual (PIM)']),
        activityCode: _trim(r[' Activity Code']),
        disbursementYear: _trim(r['Disbursement Year']),
        objective: objectiveId,
        status,
        rawStatus: r['Status'] || null,
        notes: _trim(r['Comments, Challenges, \nor Asks of IEs, PMC, or PSC']),
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
