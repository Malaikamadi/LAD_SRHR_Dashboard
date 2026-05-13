// Orchestrates all per-domain parsers and assembles a single cached snapshot
// of the master Excel data, exposed to the routes/controllers.

const xlsx = require('xlsx');

const { parseIndicators }     = require('../parsers/indicatorsParser');
const { parseNewDataset }     = require('../parsers/newDatasetParser');
const { parseImplementation } = require('../parsers/implementationParser');
const { parseBurnRate }       = require('../parsers/burnRateParser');
const { parseProcurement }    = require('../parsers/procurementParser');
const { parseOperational }    = require('../parsers/operationalParser');
const { parseRmnch }          = require('../parsers/rmnchParser');

const { CANONICAL_ENTITIES, getEntity } = require('../utils/entityNameMap');
const { OBJECTIVE_TITLES }              = require('../utils/objectiveUtils');

class ExcelService {
  constructor() {
    this.snapshot = null;
    this.lastSyncedAt = null;
    this.lastError = null;
  }

  _parseExcelBuffer(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    const indicators     = parseIndicators(workbook);
    const newDataset     = parseNewDataset(workbook);
    const implementation = parseImplementation(workbook);
    const burn           = parseBurnRate(workbook);
    const procurement    = parseProcurement(workbook);
    const operational    = parseOperational(workbook);
    const rmnch          = parseRmnch(workbook);

    // National hero KPIs: 8 cards pulled entirely from live data sources
    const nationalKpis = this._buildHeroKpis(newDataset, rmnch);

    // Entity-level enriched data: implementation summary + KPIs + finance
    const entities = this._buildEntities(implementation, indicators, procurement, operational);

    // Objectives: collect all objective IDs we know about (from milestones + procurement)
    const objectives = this._buildObjectives(implementation, indicators, procurement);

    this.snapshot = {
      meta: {
        generatedAt: new Date().toISOString(),
        sheets: workbook.SheetNames,
      },
      nationalKpis,
      entities,
      objectives,
      milestones: implementation.milestones,
      indicators: indicators.rows,
      procurement: procurement.rows,
      operational: operational.rows,
      finance: {
        summary: burn.summary,
        fundFlow: burn.fundFlow,
        monthlyBurn: burn.monthlyBurn,
      },
      rmnch: {
        rows: rmnch.rows,
        latestByDistrict: rmnch.latestByDistrict,
      },
    };

    this.lastSyncedAt = new Date().toISOString();
    this.lastError = null;
  }

  // ────────────────────────────────────────────────────────────────
  // Hero KPI builder — all 8 cards from live master-sheet data
  // ────────────────────────────────────────────────────────────────
  _buildHeroKpis(newDataset, rmnch) {
    // KPI catalog. Each entry declares the card's UI metadata + how to find
    // its value in the parsed sheets. `sourceMatch` is a regex against the
    // KPI name in "New dataset"; `sourceType` selects a special handler.
    const HERO_CATALOG = [
      {
        id: 'mmr',
        title: 'Maternal Mortality Rate',
        unit: 'per 100K',
        icon: 'Heart',
        color: '#EF4444',
        target: 300,
        goalLower: true,
        sourceType: 'rmnch_mmr',
      },
      {
        id: 'pregReg',
        title: 'Pregnant Women Registered',
        unit: 'women',
        icon: 'Baby',
        color: '#F59E0B',
        goalLower: false,
        sourceMatch: /pregnant women registered.*real ?time pregnancy/i,
      },
      {
        id: 'emergRef',
        title: 'Emergency Referral Success',
        unit: '%',
        icon: 'Activity',
        color: '#10B981',
        goalLower: false,
        sourceMatch: /emergency calls received.*successful referrals/i,
      },
      {
        id: 'highRiskDeliv',
        title: 'High-Risk Pregnancies Delivered',
        unit: 'cases',
        icon: 'Stethoscope',
        color: '#8B5CF6',
        goalLower: false,
        sourceMatch: /high risk preg.*successfully delivered/i,
      },
      {
        id: 'delivRec',
        title: 'Deliveries Recorded',
        unit: '%',
        icon: 'Building2',
        color: '#06B6D4',
        goalLower: false,
        sourceMatch: /deliveries recorded from total number of pregnancies/i,
      },
      {
        id: 'dataComplete',
        title: 'SRH Data Completeness',
        unit: '%',
        icon: 'Shield',
        color: '#14B8A6',
        goalLower: false,
        sourceMatch: /completeness of SRH data.*programme indicators/i,
      },
      {
        id: 'ambulance',
        title: 'Functioning Ambulances',
        unit: 'of 68',
        icon: 'AlertTriangle',
        color: '#EC4899',
        target: 68,
        goalLower: false,
        sourceMatch: /smooth functioning ambulances/i,
      },
      {
        id: 'rht',
        title: 'Districts On-Track',
        unit: 'of 16',
        icon: 'MapPin',
        color: '#10B981',
        target: 16,
        goalLower: false,
        sourceType: 'rmnch_districts',
      },
    ];

    return HERO_CATALOG.map((meta) => {
      if (meta.sourceType === 'rmnch_mmr')        return this._buildMmrKpi(meta, rmnch);
      if (meta.sourceType === 'rmnch_districts')  return this._buildDistrictsKpi(meta, rmnch);
      return this._buildKpiFromNewDataset(meta, newDataset);
    });
  }

  // MMR from RMNCH Scorecard (per 10K → per 100K)
  _buildMmrKpi(meta, rmnch) {
    const base = { ...meta, value: null, change: 0, sparkline: [], fromSheet: false };
    if (!rmnch?.latestByDistrict?.length) return { ...base, trend: 'flat' };

    const latestVals = rmnch.latestByDistrict.map((d) => d.mmr).filter((v) => v != null).map((v) => v * 10);
    if (!latestVals.length) return { ...base, trend: 'flat' };

    const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
    const value = Math.round(avg(latestVals));

    // Trend across earliest vs latest year
    const scaled = rmnch.rows.filter((r) => r.mmr != null && r.year).map((r) => ({ year: r.year, value: r.mmr * 10 }));
    const earliestYear = Math.min(...scaled.map((r) => r.year));
    const latestYear   = Math.max(...scaled.map((r) => r.year));
    const prev = avg(scaled.filter((r) => r.year === earliestYear).map((r) => r.value));
    const curr = avg(scaled.filter((r) => r.year === latestYear).map((r) => r.value));
    const change = prev ? Number((((curr - prev) / prev) * 100).toFixed(1)) : 0;

    // Sparkline by year-quarter
    const buckets = new Map();
    for (const r of rmnch.rows) {
      if (r.mmr == null) continue;
      const key = `${r.year}-${r.quarter}`;
      (buckets.get(key) ?? buckets.set(key, []).get(key)).push(r.mmr * 10);
    }
    const sparkline = [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, vals]) => Math.round(avg(vals)))
      .slice(-11);

    return {
      ...meta,
      value,
      change,
      sparkline: sparkline.length >= 2 ? sparkline : [value],
      sourceKpi: 'RMNCH Scorecard — Hospital MMR per 10K deliveries (averaged across districts, scaled to per-100K)',
      fromSheet: true,
      trend: change > 0 ? 'up' : (change < 0 ? 'down' : 'flat'),
    };
  }

  // Districts at/below the national MMR target
  _buildDistrictsKpi(meta, rmnch) {
    const base = { ...meta, value: 0, change: 0, sparkline: [0], fromSheet: false, trend: 'flat' };
    if (!rmnch?.latestByDistrict?.length) return base;

    const scaledLatest = rmnch.latestByDistrict
      .map((d) => d.mmr != null ? d.mmr * 10 : null)
      .filter((v) => v != null);
    const onTrack = scaledLatest.filter((v) => v <= 300).length;

    return {
      ...meta,
      value: onTrack,
      change: 0,
      sparkline: [onTrack],
      sourceKpi: 'RMNCH Scorecard — districts with hospital MMR ≤ 300 per 100K',
      fromSheet: true,
      trend: 'flat',
    };
  }

  // Generic KPI from the New dataset tab
  _buildKpiFromNewDataset(meta, newDataset) {
    const base = { ...meta, value: null, change: 0, sparkline: [], fromSheet: false, trend: 'flat' };
    if (!newDataset?.byKpi) return base;

    // Find first KPI in byKpi map whose name matches meta.sourceMatch
    let match = null;
    for (const entry of newDataset.byKpi.values()) {
      if (meta.sourceMatch.test(entry.name)) { match = entry; break; }
    }
    if (!match || !match.series.length) return base;

    // Build sparkline: last ~11 actuals (normalize percentages stored as fractions)
    const normalize = (v) => {
      if (v == null) return null;
      if (match.isPercent && Math.abs(v) <= 1.5) return Number((v * 100).toFixed(1));
      return v;
    };

    const series = match.series
      .filter((s) => s.actual != null)
      .map((s) => ({
        year: s.year,
        period: s.period,
        actual: normalize(s.actual),
        target: normalize(s.target),
      }));
    if (!series.length) return base;

    const sparkline = series.slice(-11).map((s) => s.actual);
    const latest = series[series.length - 1];
    const first  = series[0];
    const change = first.actual ? Number((((latest.actual - first.actual) / first.actual) * 100).toFixed(1)) : 0;

    // Target: prefer the latest period's target if present, else meta.target, else project target
    const periodTarget = latest.target;
    const projectTarget = match.rows.find((r) => r.projectTarget != null)?.projectTarget;
    const target = meta.target != null
      ? meta.target
      : (periodTarget != null
        ? periodTarget
        : (projectTarget != null ? (match.isPercent && projectTarget <= 1.5 ? projectTarget * 100 : projectTarget) : null));

    return {
      ...meta,
      value: latest.actual,
      target,
      change,
      sparkline: sparkline.length >= 2 ? sparkline : [latest.actual],
      sourceKpi: match.name,
      fromSheet: true,
      trend: change > 0 ? 'up' : (change < 0 ? 'down' : 'flat'),
    };
  }

  // ────────────────────────────────────────────────────────────────
  // Entity builder
  // ────────────────────────────────────────────────────────────────
  _buildEntities(implementation, indicators, procurement, operational) {
    const summaryById = Object.fromEntries(implementation.entitySummary.map((s) => [s.entityId, s]));

    return CANONICAL_ENTITIES.map((entity) => {
      const summary = summaryById[entity.id] || { tasksTotal: 0, tasksCompleted: 0, ongoing: 0, overdue: 0, pending: 0, progress: 0 };

      const procRows = procurement.byEntity[entity.id] || [];
      const opsRows = operational.byEntity[entity.id] || [];

      const budget = procRows.reduce((s, r) => s + (r.amountReq || 0), 0) + opsRows.reduce((s, r) => s + (r.amountReq || 0), 0);
      const spent = procRows.filter((r) => r.status === 'complete').reduce((s, r) => s + (r.amountReq || 0), 0)
                  + opsRows.filter((r) => r.status === 'complete').reduce((s, r) => s + (r.amountReq || 0), 0);

      // KPI rollup for this entity from indicators
      const entityIndicators = indicators.byEntity[entity.id] || [];
      const kpis = this._aggregateEntityKpis(entityIndicators);

      // Latest milestones (most recent ~30) for activities panel
      const milestones = (implementation.byEntity[entity.id] || [])
        .slice()
        .sort((a, b) => {
          const ad = a.actualEnd || a.plannedEnd || '';
          const bd = b.actualEnd || b.plannedEnd || '';
          return bd.localeCompare(ad);
        });

      // Objectives this entity contributes to (from milestones)
      const objectiveSet = new Set();
      for (const m of milestones) if (m.objectiveId) objectiveSet.add(m.objectiveId);

      return {
        id: entity.id,
        abbrev: entity.abbrev,
        name: entity.name,
        color: entity.color,
        lat: entity.lat,
        lng: entity.lng,
        tasksTotal: summary.tasksTotal,
        tasksCompleted: summary.tasksCompleted,
        ongoing: summary.ongoing,
        overdue: summary.overdue,
        pending: summary.pending,
        progress: summary.progress,
        budget,
        spent,
        objectives: [...objectiveSet].map((id) => ({ id, name: OBJECTIVE_TITLES[id] || id })),
        kpis,
        activities: milestones.slice(0, 50).map((m) => ({
          activity: m.subActivity || m.milestone,
          milestone: m.milestone,
          actualEnd: m.actualEndPretty,
          plannedEnd: m.plannedEndPretty,
          lead: m.lead,
          status: m.status,
        })),
      };
    });
  }

  // Collapses per-KPI rows for an entity into a list of {name, type, target, actual, year, status}
  _aggregateEntityKpis(indicatorRows) {
    const byKpi = {};
    for (const r of indicatorRows) {
      const key = r.kpi;
      if (!byKpi[key]) byKpi[key] = { name: key, type: r.kpiType, latest: r, all: [] };
      byKpi[key].all.push(r);
      // Pick latest by year
      if ((r.year || 0) > (byKpi[key].latest.year || 0)) byKpi[key].latest = r;
    }

    return Object.values(byKpi).slice(0, 12).map(({ name, type, latest }) => {
      const target = latest.yearTarget ?? latest.quarterlyTarget ?? latest.monthlyTarget ?? null;
      const actual = latest.yearActual ?? latest.quarterlyActual ?? latest.monthlyActual ?? null;
      let status = 'on-track';
      if (target != null && actual != null) {
        const ratio = actual / target;
        if (ratio >= 1) status = 'achieved';
        else if (ratio >= 0.75) status = 'on-track';
        else status = 'behind';
      }
      return { name, type, target, actual, year: latest.year, status };
    });
  }

  // ────────────────────────────────────────────────────────────────
  // Objective builder
  // ────────────────────────────────────────────────────────────────
  _buildObjectives(implementation, indicators, procurement) {
    const ids = new Set([
      ...Object.keys(implementation.byObjective || {}),
      ...Object.keys(procurement.byObjective || {}),
    ]);

    return [...ids].sort().map((id) => {
      const milestones = implementation.byObjective[id] || [];
      const procs = procurement.byObjective[id] || [];
      const tasksTotal = milestones.length;
      const tasksCompleted = milestones.filter((m) => m.status === 'complete').length;
      const progress = tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

      // Entities involved in this objective
      const entitySet = new Set();
      for (const m of milestones) if (m.entityId) entitySet.add(m.entityId);

      return {
        id,
        name: OBJECTIVE_TITLES[id] || id,
        tasksTotal,
        tasksCompleted,
        progress,
        entities: [...entitySet].map((eid) => {
          const e = getEntity(eid);
          return e ? { id: e.id, abbrev: e.abbrev, color: e.color } : null;
        }).filter(Boolean),
        procurementCount: procs.length,
        procurementValue: procs.reduce((s, p) => s + (p.amountReq || 0), 0),
      };
    });
  }

  // ────────────────────────────────────────────────────────────────
  // Public accessors
  // ────────────────────────────────────────────────────────────────
  isReady()         { return this.snapshot != null; }
  getSnapshot()     { return this.snapshot; }
  getNationalKpis() { return this.snapshot?.nationalKpis || []; }
  getEntities()     { return this.snapshot?.entities || []; }
  getEntity(id)     { return (this.snapshot?.entities || []).find((e) => e.id === id) || null; }
  getObjectives()   { return this.snapshot?.objectives || []; }
  getObjective(id)  { return (this.snapshot?.objectives || []).find((o) => o.id === id) || null; }
  getFinance()      { return this.snapshot?.finance || null; }
  getProcurement()  { return this.snapshot?.procurement || []; }
  getOperational()  { return this.snapshot?.operational || []; }
  getRmnch()        { return this.snapshot?.rmnch || null; }
  getMilestones()   { return this.snapshot?.milestones || []; }
  getMeta() {
    return {
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
      sheets: this.snapshot?.meta?.sheets || [],
    };
  }
}

module.exports = new ExcelService();
