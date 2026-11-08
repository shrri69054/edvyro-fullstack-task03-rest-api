// All SQL is parameterized (no string concatenation of user input).
const toApi = (r) => r && ({
  id: r.id, title: r.title, company: r.company, domain: r.domain, location: r.location, mode: r.mode,
  stipend: r.stipend, durationWeeks: r.duration_weeks, description: r.description,
  skills: JSON.parse(r.skills), deadline: r.deadline, createdAt: r.created_at, updatedAt: r.updated_at,
});
const esc = (s) => s.replace(/[\\%_]/g, (c) => '\\' + c);

function list(db, { page, limit, q, domain, mode }) {
  const params = { q: q ? `%${esc(q)}%` : null, domain: domain || null, mode: mode || null };
  const where = `WHERE (@q IS NULL OR title LIKE @q ESCAPE '\\' OR company LIKE @q ESCAPE '\\' OR skills LIKE @q ESCAPE '\\')
                   AND (@domain IS NULL OR domain = @domain) AND (@mode IS NULL OR mode = @mode)`;
  const total = db.prepare(`SELECT COUNT(*) AS n FROM internships ${where}`).get(params).n;
  const rows = db.prepare(`SELECT * FROM internships ${where} ORDER BY id LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit, offset: (page - 1) * limit });
  return { data: rows.map(toApi), meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}
const get = (db, id) => toApi(db.prepare('SELECT * FROM internships WHERE id = ?').get(id));

function create(db, v) {
  const info = db.prepare(`INSERT INTO internships (title, company, domain, location, mode, stipend, duration_weeks, description, skills, deadline)
    VALUES (@title, @company, @domain, @location, @mode, @stipend, @durationWeeks, @description, @skills, @deadline)`)
    .run({ ...v, skills: JSON.stringify(v.skills) });
  return get(db, info.lastInsertRowid);
}
function update(db, id, v) {
  const info = db.prepare(`UPDATE internships SET title=@title, company=@company, domain=@domain, location=@location, mode=@mode,
    stipend=@stipend, duration_weeks=@durationWeeks, description=@description, skills=@skills, deadline=@deadline,
    updated_at=datetime('now') WHERE id=@id`).run({ ...v, skills: JSON.stringify(v.skills), id });
  return info.changes ? get(db, id) : null;
}
const remove = (db, id) => db.prepare('DELETE FROM internships WHERE id = ?').run(id).changes > 0;
const count = (db) => db.prepare('SELECT COUNT(*) AS n FROM internships').get().n;

module.exports = { list, get, create, update, remove, count };
