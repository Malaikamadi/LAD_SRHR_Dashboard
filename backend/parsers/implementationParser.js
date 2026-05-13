// Parses the "Implementation Tracker" tab (1,690 rows of milestones) and produces:
//   - milestones (normalized rows)
//   - byEntity (milestones grouped by canonical entity id)
//   - byObjective (milestones grouped by Obj id)
//   - entitySummary (counts + progress per entity, used by HealthMap & AnalyticsSection)

const xlsx = require('xlsx');
const { resolveEntityId } = require('../utils/entityNameMap');
const { normalizeStatus } = require('../utils/statusNormalizer');
const { toISODate, toPrettyDate } = require('../utils/dateUtils');

function parseImplementation(workbook) {
  const ws = workbook.Sheets['Implementation Tracker'];
  if (!ws) return { milestones: [], byEntity: {}, byObjective: {}, entitySummary: [] };

  const raw = xlsx.utils.sheet_to_json(ws, { defval: null });

  // The entity column is unlabeled (empty string header " "). xlsx renames blanks as `__EMPTY*`,
  // but here the export has a single space key. We support both.
  const ENTITY_KEY_CANDIDATES = [' ', '__EMPTY', 'Entity', 'Implementing Entity'];

  const milestones = raw
    .map((r) => {
      let entityRaw = null;
      for (const k of ENTITY_KEY_CANDIDATES) {
        if (r[k] != null && r[k] !== '') { entityRaw = r[k]; break; }
      }

      const objNum = r['SN_Objective'] != null ? Number(r['SN_Objective']) : null;

      const plannedStart = toISODate(r['Planned Start date']);
      const plannedEnd = toISODate(r['Planned End date']);
      const actualEnd = toISODate(r['Actual End Date']);

      // Status normalization: trust the sheet's Status if present, otherwise derive
      let status = normalizeStatus(r['Status']);
      if (!r['Status']) {
        if (actualEnd) status = 'complete';
        else if (plannedEnd && new Date(plannedEnd) < new Date()) status = 'overdue';
        else status = 'ongoing';
      }

      return {
        objectiveNum: objNum,
        objectiveId: objNum ? `Obj${objNum}` : null,
        objective: r['Objectives'] ? String(r['Objectives']).trim() : null,
        mainActivityNum: r['SN_Main Activity'] || null,
        mainActivity: r['Main Activities'] ? String(r['Main Activities']).trim() : null,
        subActivityNum: r['SN_Subactivity'] || null,
        subActivity: r['Sub Activities (Strategies)'] ? String(r['Sub Activities (Strategies)']).trim() : null,
        milestoneNum: r['SN_Milestone'] || null,
        milestone: r['Milestones '] ? String(r['Milestones ']).trim() : null,
        month: r['Month'] || null,
        year: r['Year'] != null ? Number(r['Year']) : null,
        plannedStart,
        plannedEnd,
        actualEnd,
        plannedStartPretty: toPrettyDate(r['Planned Start date']),
        plannedEndPretty: toPrettyDate(r['Planned End date']),
        actualEndPretty: toPrettyDate(r['Actual End Date']),
        lead: r['Lead'] || null,
        status,
        rawStatus: r['Status'] || null,
        note: r['Note'] || null,
        entityRaw,
        entityId: resolveEntityId(entityRaw),
      };
    })
    .filter((m) => m.milestone || m.subActivity);

  const byEntity = {};
  const byObjective = {};
  for (const m of milestones) {
    if (m.entityId) {
      if (!byEntity[m.entityId]) byEntity[m.entityId] = [];
      byEntity[m.entityId].push(m);
    }
    if (m.objectiveId) {
      if (!byObjective[m.objectiveId]) byObjective[m.objectiveId] = [];
      byObjective[m.objectiveId].push(m);
    }
  }

  const entitySummary = Object.entries(byEntity).map(([entityId, list]) => {
    const tasksTotal = list.length;
    const tasksCompleted = list.filter((m) => m.status === 'complete').length;
    const overdue = list.filter((m) => m.status === 'overdue').length;
    const ongoing = list.filter((m) => m.status === 'ongoing').length;
    const pending = list.filter((m) => m.status === 'pending').length;
    const progress = tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
    return { entityId, tasksTotal, tasksCompleted, ongoing, overdue, pending, progress };
  });

  return { milestones, byEntity, byObjective, entitySummary };
}

module.exports = { parseImplementation };
