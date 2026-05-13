// Canonicalize the 13+ status variants found across the master sheet into:
//   'complete' | 'ongoing' | 'pending' | 'overdue'

const STATUS_MAP = {
  complete:        ['complete', 'completed'],
  overdue:         ['overdue', 'completed late'],
  pending:         ['pending', 'not done', 'no training conducted', 'not due for action'],
  // ongoing handles both happy path and "with slight delays"
  ongoing:         [
    'ongoing',
    'on-going',
    'on going',
    'on-track',
    'on track',
    'ongoing-on track',
    'ongoing on track',
    'on-going on track',
    'ongoing-with slight delays',
    'ongoing with slight delay',
    'ongoing-with slight delay',
    'in progress',
    'in-progress',
  ],
};

function _normalize(raw) {
  if (raw == null) return '';
  return String(raw).replace(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeStatus(raw) {
  const n = _normalize(raw);
  if (!n) return 'pending';

  // Direct exact match first
  for (const [canonical, variants] of Object.entries(STATUS_MAP)) {
    if (variants.includes(n)) return canonical;
  }

  // Fallback substring scan (covers messy values like "Ongoing-with slight delays.")
  if (/overdue|late/.test(n)) return 'overdue';
  if (/complete|completed|achieved|done/.test(n)) return 'complete';
  if (/ongoing|on[-\s]?going|on[-\s]?track|in[-\s]?progress|delay/.test(n)) return 'ongoing';
  if (/not\s*due|pending|not\s*done|no\s*training/.test(n)) return 'pending';

  return 'pending';
}

module.exports = { normalizeStatus };
