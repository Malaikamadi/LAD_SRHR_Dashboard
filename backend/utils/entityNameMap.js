// Canonicalizes the inconsistent entity names found across the master sheet tabs
// into the stable IDs/abbreviations that the frontend uses.

// Canonical entities (mirrors frontend's `implementingEntities` in src/data/dashboardData.js)
const CANONICAL_ENTITIES = [
  { id: 'sleshi',       abbrev: 'SLeSHI',       name: 'Sierra Leone Social Health Insurance (SLeSHI)',                      lat: 8.484,  lng: -13.234, color: '#14B8A6' },
  { id: 'phc',          abbrev: 'PHC',          name: 'Directorate of Primary Health Care (PHC)',                            lat: 8.38,   lng: -13.15,  color: '#06B6D4' },
  { id: 'rch',          abbrev: 'RCH',          name: 'Directorate of Reproductive and Child Health (RCH)',                  lat: 7.964,  lng: -11.738, color: '#8B5CF6' },
  { id: 'dppi',         abbrev: 'DPPI',         name: 'Directorate of Policy Planning and Information (DPPI)',               lat: 9.083,  lng: -12.050, color: '#F59E0B' },
  { id: 'nems',         abbrev: 'NEMS',         name: 'Directorate of National Emergency Medical Services (NEMS)',           lat: 7.526,  lng: -12.505, color: '#EF4444' },
  { id: 'gender',       abbrev: 'Gender',       name: 'Directorate of Gender Sciences (Gender)',                             lat: 8.284,  lng: -10.572, color: '#EC4899' },
  { id: 'nmsa',         abbrev: 'NMSA',         name: 'National Medical Supplies Agency (NMSA)',                             lat: 9.126,  lng: -12.917, color: '#10B981' },
  { id: 'donor_coord',  abbrev: 'Donor Coord.', name: 'Directorate of Donor Coordination',                                   lat: 8.644,  lng: -10.850, color: '#3B82F6' },
  { id: 'comahs',       abbrev: 'COMAHS',       name: 'College of Medicine and Allied Health Sciences (COMAHS)',             lat: 8.159,  lng: -12.431, color: '#F97316' },
  { id: 'postgraduate', abbrev: 'Postgraduate', name: 'Directorate of Post Graduate College of Health Specialties',          lat: 8.767,  lng: -12.787, color: '#6366F1' },
  { id: 'dhas',         abbrev: 'DHAS',         name: 'Directorate of Hospital and Ambulance Services (DHAS)',               lat: 8.500,  lng: -12.300, color: '#0EA5E9' },
];

// Strips quotes, normalises whitespace, lowercases
function _normalize(raw) {
  if (raw == null) return '';
  return String(raw)
    .replace(/["'\u201C\u201D\u2018\u2019]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Substring patterns mapped to canonical id.
// Order matters: more specific patterns first.
const PATTERNS = [
  { id: 'sleshi',       tokens: ['sleshi', 'social health insurance'] },
  { id: 'rch',          tokens: ['rch', 'reproductive', 'reproductive & child', 'reproductive and child'] },
  { id: 'phc',          tokens: ['phc', 'primary health care'] },
  { id: 'dppi',         tokens: ['dppi', 'planning, policy', 'policy planning', 'planning policy', 'directorate of planning'] },
  { id: 'nems',         tokens: ['nems', 'national emergency medical'] },
  { id: 'gender',       tokens: ['gender'] },
  { id: 'nmsa',         tokens: ['nmsa', 'national medical supply', 'national medical supplies'] },
  { id: 'donor_coord',  tokens: ['donor coord', 'donor coordination'] },
  { id: 'comahs',       tokens: ['comahs', 'cohmas', 'college of medicine'] },
  { id: 'postgraduate', tokens: ['post graduate', 'postgraduate', 'pgchs'] },
  { id: 'dhas',         tokens: ['dhas', 'hospital and ambulance'] },
];

function resolveEntityId(raw) {
  const n = _normalize(raw);
  if (!n) return null;
  for (const p of PATTERNS) {
    for (const tok of p.tokens) {
      if (n.includes(tok)) return p.id;
    }
  }
  return null;
}

function getEntity(id) {
  return CANONICAL_ENTITIES.find((e) => e.id === id) || null;
}

function getEntityByRawName(raw) {
  const id = resolveEntityId(raw);
  return id ? getEntity(id) : null;
}

module.exports = {
  CANONICAL_ENTITIES,
  resolveEntityId,
  getEntity,
  getEntityByRawName,
};
