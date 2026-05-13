// Strips Excel-quoting from objective text and extracts a canonical Obj ID
// (e.g. "Obj5") plus the trimmed full name.

const OBJECTIVE_TITLES = {
  Obj1: 'Create awareness and generate evidence to address SRH access barriers',
  Obj2: 'Increase domestic financing for SRH services',
  Obj3: 'Increase the number and quality of health professionals',
  Obj4: 'Strengthen and institutionalise sustainable health financing through SLeSHI',
  Obj5: 'Expand integrated SRH service infrastructure and referral systems',
  Obj6: 'Ensure uninterrupted supply and availability of SRH commodities',
  Obj7: 'Improve SRHR program leadership and governance',
};

function _cleanText(raw) {
  if (raw == null) return '';
  return String(raw)
    .replace(/["'\u201C\u201D\u2018\u2019]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extracts "Obj5" (or similar) from values like:
//   '"Obj5: Expand integrated SRH service infrastructure  "'
//   'Obj 5: ...'
//   '5. Expand integrated...'
function extractObjectiveId(raw) {
  const s = _cleanText(raw);
  if (!s) return null;
  let m = s.match(/Obj\s*(\d+)/i);
  if (m) return `Obj${m[1]}`;
  // Lone leading digit like "5. ..." or just "5"
  m = s.match(/^(\d)\b/);
  if (m) return `Obj${m[1]}`;
  return null;
}

function parseObjective(raw) {
  const id = extractObjectiveId(raw);
  const cleaned = _cleanText(raw);
  const titleFromMap = id && OBJECTIVE_TITLES[id];
  const name = titleFromMap || cleaned.replace(/^Obj\s*\d+:\s*/i, '') || cleaned;
  return { id, name };
}

module.exports = {
  OBJECTIVE_TITLES,
  extractObjectiveId,
  parseObjective,
};
