// Orchestrates all per-domain parsers and assembles a single cached snapshot
// of the master Excel data, exposed to the routes/controllers.

const xlsx = require('xlsx');

const { parseIndicators }     = require('../parsers/indicatorsParser');
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
    const implementation = parseImplementation(workbook);
    const burn           = parseBurnRate(workbook);
    const procurement    = parseProcurement(workbook);
    const operational    = parseOperational(workbook);
    const rmnch          = parseRmnch(workbook);

    // National KPIs: prefer indicator-derived; backfill from RMNCH for MMR
    const nationalKpis = this._buildHeroKpis(indicators.nationalKpis, rmnch);

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
  // Hero KPI builder
  // ────────────────────────────────────────────────────────────────
  _buildHeroKpis(fromIndicators, rmnch) {
    // Static defaults for the 8 hero KPIs the frontend renders. Master sheet
    // data is layered on top — anything missing falls back to these baselines.
    const HERO_DEFAULTS = [
      { id: 'mmr', title: 'Maternal Mortality Rate',     unit: 'per 100K', icon: 'Heart',         color: '#EF4444', target: 300, value: 443,  goalLower: true,  change: -8.2 },
      { id: 'tpr', title: 'Teenage Pregnancy Rate',      unit: '%',        icon: 'Baby',          color: '#F59E0B', target: 20,  value: 28.6, goalLower: true,  change: -3.1 },
      { id: 'cpu', title: 'Contraceptive Usage',         unit: '%',        icon: 'Shield',        color: '#10B981', target: 35,  value: 21.3, goalLower: false, change: 4.7  },
      { id: 'hfc', title: 'Health Facility Coverage',    unit: '%',        icon: 'Building2',     color: '#06B6D4', target: 85,  value: 67.4, goalLower: false, change: 2.8  },
      { id: 'anc', title: 'ANC 4+ Visits',               unit: '%',        icon: 'Stethoscope',   color: '#8B5CF6', target: 75,  value: 58.2, goalLower: false, change: 5.3  },
      { id: 'sba', title: 'Skilled Birth Attendance',    unit: '%',        icon: 'UserCheck',     color: '#14B8A6', target: 95,  value: 87.1, goalLower: false, change: 1.9  },
      { id: 'gbv', title: 'GBV Reports',                 unit: 'cases',    icon: 'AlertTriangle', color: '#EF4444', target: null,value: 1247, goalLower: true,  change: 12.4 },
      { id: 'rht', title: 'Districts On-Track',          unit: 'of 16',    icon: 'MapPin',        color: '#10B981', target: 16,  value: 11,   goalLower: false, change: 2    },
    ];

    const overrideMap = new Map(fromIndicators.map((k) => [k.id, k]));

    // ── MMR: derive from RMNCH Scorecard (scale per-10,000 → per-100K) ──
    if (rmnch.latestByDistrict.length) {
      const mmrVals = rmnch.latestByDistrict.map((d) => d.mmr).filter((v) => v != null);
      if (mmrVals.length) {
        // Scale: master sheet stores "per 10,000 deliveries"; dashboard shows "per 100K"
        const scaled = mmrVals.map((v) => v * 10);
        const avgMmr = Math.round(scaled.reduce((s, v) => s + v, 0) / scaled.length);

        // Trend: compare current avg against earliest available year's avg
        const allRmnchScaled = rmnch.rows
          .filter((r) => r.mmr != null && r.year)
          .map((r) => ({ year: r.year, value: r.mmr * 10 }));
        const earliestYear = Math.min(...allRmnchScaled.map((r) => r.year));
        const latestYear = Math.max(...allRmnchScaled.map((r) => r.year));
        const earliestVals = allRmnchScaled.filter((r) => r.year === earliestYear).map((r) => r.value);
        const latestVals   = allRmnchScaled.filter((r) => r.year === latestYear).map((r) => r.value);
        const avgOf = (a) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
        const prev = avgOf(earliestVals);
        const curr = avgOf(latestVals);
        const change = prev ? Number((((curr - prev) / prev) * 100).toFixed(1)) : 0;

        // Sparkline: chronologically averaged across districts per quarter/year
        const byPeriod = new Map();
        for (const r of rmnch.rows) {
          if (r.mmr == null) continue;
          const key = `${r.year}-${r.quarter}`;
          if (!byPeriod.has(key)) byPeriod.set(key, []);
          byPeriod.get(key).push(r.mmr * 10);
        }
        const sparkline = [...byPeriod.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([, vals]) => Math.round(avgOf(vals)));

        overrideMap.set('mmr', {
          id: 'mmr',
          value: avgMmr,
          target: 300,
          change,
          sparkline: sparkline.slice(-11),
          sourceKpi: 'RMNCH Scorecard (hospital MMR averaged across 16 districts, scaled to per-100K)',
        });
      }

      // ── Districts on-track: count districts at or below the national target (300 per 100K) ──
      const scaledLatest = rmnch.latestByDistrict.map((d) => d.mmr != null ? d.mmr * 10 : null).filter((v) => v != null);
      const onTrack = scaledLatest.filter((v) => v <= 300).length;
      overrideMap.set('rht', {
        id: 'rht',
        value: onTrack,
        target: 16,
        change: 0,
        sparkline: [onTrack],
        sourceKpi: 'RMNCH Scorecard (districts with MMR ≤ 300/100K)',
      });
    }

    return HERO_DEFAULTS.map((d) => {
      const override = overrideMap.get(d.id);
      const merged = { ...d };
      if (override) {
        if (override.value != null) merged.value = override.value;
        if (override.target != null) merged.target = override.target;
        if (override.change != null && override.change !== 0) merged.change = override.change;
        if (override.sparkline && override.sparkline.length >= 2) merged.sparkline = override.sparkline;
        if (override.sourceKpi) merged.sourceKpi = override.sourceKpi;
        merged.fromSheet = true;
      } else {
        merged.fromSheet = false;
      }
      merged.trend = merged.change > 0 ? 'up' : (merged.change < 0 ? 'down' : 'flat');
      if (!merged.sparkline) merged.sparkline = [merged.value];
      return merged;
    });
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
