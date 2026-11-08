const DOMAINS = ['Full Stack Development', 'Data Science', 'UI/UX Design', 'Digital Marketing', 'Cybersecurity', 'Cloud & DevOps'];
const MODES = ['remote', 'hybrid', 'onsite'];

/** Validates an internship payload. partial=true allows missing fields (PATCH). */
function validateInternship(body, { partial = false } = {}) {
  const errors = [];
  const value = {};
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { errors: [{ field: 'body', message: 'must be a JSON object' }], value };
  }
  const present = (k) => body[k] !== undefined;
  const need = (k) => {
    if (!present(k)) { if (!partial) errors.push({ field: k, message: 'is required' }); return false; }
    return true;
  };
  const text = (k, min, max) => {
    if (!need(k)) return;
    const v = body[k];
    if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max) {
      errors.push({ field: k, message: `must be a string of ${min}-${max} characters` });
    } else value[k] = v.trim();
  };
  const int = (k, min, max, dflt) => {
    if (!present(k)) { if (!partial && dflt === undefined) errors.push({ field: k, message: 'is required' }); else if (!partial) value[k] = dflt; return; }
    const v = body[k];
    if (!Number.isInteger(v) || v < min || v > max) errors.push({ field: k, message: `must be an integer between ${min} and ${max}` });
    else value[k] = v;
  };

  text('title', 3, 100);
  text('company', 2, 80);
  text('location', 2, 80);
  text('description', 10, 1000);
  if (need('domain')) {
    if (!DOMAINS.includes(body.domain)) errors.push({ field: 'domain', message: `must be one of: ${DOMAINS.join(', ')}` });
    else value.domain = body.domain;
  }
  if (need('mode')) {
    if (!MODES.includes(body.mode)) errors.push({ field: 'mode', message: `must be one of: ${MODES.join(', ')}` });
    else value.mode = body.mode;
  }
  int('stipend', 0, 1000000, 0);
  int('durationWeeks', 1, 52);
  if (present('skills')) {
    const s = body.skills;
    if (!Array.isArray(s) || s.length > 10 || s.some((x) => typeof x !== 'string' || !x.trim() || x.length > 30)) {
      errors.push({ field: 'skills', message: 'must be an array of up to 10 non-empty strings (max 30 chars each)' });
    } else value.skills = s.map((x) => x.trim());
  } else if (!partial) value.skills = [];
  if (present('deadline') && body.deadline !== null) {
    if (typeof body.deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.deadline) || Number.isNaN(Date.parse(body.deadline))) {
      errors.push({ field: 'deadline', message: 'must be a date in YYYY-MM-DD format' });
    } else value.deadline = body.deadline;
  } else if (!partial) value.deadline = null;
  if (partial && Object.keys(value).length === 0 && errors.length === 0) {
    errors.push({ field: 'body', message: 'must contain at least one updatable field' });
  }
  return { errors, value };
}
module.exports = { validateInternship, DOMAINS, MODES };
