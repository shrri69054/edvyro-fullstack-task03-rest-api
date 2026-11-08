const { Router } = require('express');
const repo = require('../repo');
const { validateInternship, DOMAINS, MODES } = require('../validate');

const fail = (res, status, code, message, details) =>
  res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });

module.exports = function internshipsRouter(db) {
  const r = Router();

  r.get('/meta/options', (_req, res) => res.json({ domains: DOMAINS, modes: MODES }));

  r.param('id', (req, res, next, id) => {
    if (!/^\d+$/.test(id)) return fail(res, 400, 'INVALID_ID', 'id must be a positive integer');
    req.id = Number(id); next();
  });

  r.get('/', (req, res) => {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    const bad = [];
    if (!Number.isInteger(page) || page < 1) bad.push({ field: 'page', message: 'must be an integer >= 1' });
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) bad.push({ field: 'limit', message: 'must be an integer between 1 and 50' });
    const str = (v) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 100) : undefined);
    if (req.query.mode && !MODES.includes(req.query.mode)) bad.push({ field: 'mode', message: `must be one of: ${MODES.join(', ')}` });
    if (bad.length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid query parameters', bad);
    res.json(repo.list(db, { page, limit, q: str(req.query.q), domain: str(req.query.domain), mode: str(req.query.mode) }));
  });

  r.get('/:id', (req, res) => {
    const item = repo.get(db, req.id);
    return item ? res.json({ data: item }) : fail(res, 404, 'NOT_FOUND', `Internship ${req.id} not found`);
  });

  r.post('/', (req, res) => {
    const { errors, value } = validateInternship(req.body);
    if (errors.length) return fail(res, 422, 'VALIDATION_ERROR', 'Invalid internship data', errors);
    const item = repo.create(db, value);
    res.status(201).location(`${req.baseUrl}/${item.id}`).json({ data: item });
  });

  r.put('/:id', (req, res) => {
    const { errors, value } = validateInternship(req.body);
    if (errors.length) return fail(res, 422, 'VALIDATION_ERROR', 'Invalid internship data', errors);
    const item = repo.update(db, req.id, value);
    return item ? res.json({ data: item }) : fail(res, 404, 'NOT_FOUND', `Internship ${req.id} not found`);
  });

  r.patch('/:id', (req, res) => {
    const current = repo.get(db, req.id);
    if (!current) return fail(res, 404, 'NOT_FOUND', `Internship ${req.id} not found`);
    const { errors, value } = validateInternship(req.body, { partial: true });
    if (errors.length) return fail(res, 422, 'VALIDATION_ERROR', 'Invalid internship data', errors);
    res.json({ data: repo.update(db, req.id, { ...current, ...value }) });
  });

  r.delete('/:id', (req, res) =>
    repo.remove(db, req.id) ? res.status(204).end() : fail(res, 404, 'NOT_FOUND', `Internship ${req.id} not found`));

  return r;
};
