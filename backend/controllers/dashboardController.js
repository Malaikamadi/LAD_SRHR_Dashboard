const excelService = require('../services/excelService');

function _send(res, data) {
  if (!excelService.isReady()) {
    return res.status(503).json({
      success: false,
      error: 'Master Excel data not yet loaded. Try again in a few seconds.',
      meta: excelService.getMeta(),
    });
  }
  res.json({ success: true, data, meta: excelService.getMeta() });
}

const getMeta = (req, res) => {
  res.json({
    success: true,
    ready: excelService.isReady(),
    ...excelService.getMeta(),
  });
};

const getNationalKpis = (req, res) => _send(res, excelService.getNationalKpis());

const getEntities = (req, res) => {
  const data = excelService.getEntities().map((e) => ({
    id: e.id,
    abbrev: e.abbrev,
    name: e.name,
    color: e.color,
    lat: e.lat,
    lng: e.lng,
    tasksTotal: e.tasksTotal,
    tasksCompleted: e.tasksCompleted,
    progress: e.progress,
    budget: e.budget,
    spent: e.spent,
    overdue: e.overdue,
    ongoing: e.ongoing,
    pending: e.pending,
    objectiveCount: e.objectives.length,
  }));
  _send(res, data);
};

const getEntity = (req, res) => {
  const entity = excelService.getEntity(req.params.id);
  if (!entity) return res.status(404).json({ success: false, error: `Unknown entity '${req.params.id}'` });
  _send(res, entity);
};

const getObjectives = (req, res) => _send(res, excelService.getObjectives());

const getObjective = (req, res) => {
  const obj = excelService.getObjective(req.params.id);
  if (!obj) return res.status(404).json({ success: false, error: `Unknown objective '${req.params.id}'` });

  // Add the milestones + procurement items that belong to this objective
  const milestones = excelService.getMilestones().filter((m) => m.objectiveId === obj.id);
  const procurement = excelService.getProcurement().filter((p) => p.objective === obj.id);
  _send(res, { ...obj, milestones, procurement });
};

const getFinance = (req, res) => _send(res, excelService.getFinance());

const getProcurement = (req, res) => _send(res, excelService.getProcurement());

const getOperational = (req, res) => _send(res, excelService.getOperational());

const getRmnch = (req, res) => _send(res, excelService.getRmnch());

const getMilestones = (req, res) => _send(res, excelService.getMilestones());

// Legacy endpoints kept for backwards compatibility with the frontend's existing DataContext
const getOverview = (req, res) => {
  if (!excelService.isReady()) return _send(res, null);
  const kpis = excelService.getNationalKpis();
  const mmr = kpis.find((k) => k.id === 'mmr');
  const cpu = kpis.find((k) => k.id === 'cpu');
  const anc = kpis.find((k) => k.id === 'anc');
  const tpr = kpis.find((k) => k.id === 'tpr');
  _send(res, {
    maternalMortalityRate: mmr?.value || null,
    contraceptivePrevalence: cpu?.value || null,
    ancAttendance: anc?.value || null,
    skilledBirthAttendance: kpis.find((k) => k.id === 'sba')?.value || null,
    totalTeenagePregnancies: tpr?.value || null,
  });
};

const getDistricts = (req, res) => {
  const rmnch = excelService.getRmnch();
  if (!rmnch) return _send(res, []);
  _send(res, rmnch.latestByDistrict.map((d) => ({
    district: d.district,
    quarter: d.quarter,
    year: d.year,
    label: d.label,
    maternalMortalityRate: d.mmr != null ? d.mmr * 10 : null,
    neonatalMortality: d.neonatalMortality,
    childMortality: d.childMortality,
  })));
};

module.exports = {
  getMeta,
  getNationalKpis,
  getEntities,
  getEntity,
  getObjectives,
  getObjective,
  getFinance,
  getProcurement,
  getOperational,
  getRmnch,
  getMilestones,
  getOverview,
  getDistricts,
};
