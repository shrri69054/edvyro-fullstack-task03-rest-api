const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { openDb } = require('../src/db');

const sample = { title: 'Backend Intern', company: 'Acme Corp', domain: 'Full Stack Development', location: 'Remote', mode: 'remote',
  stipend: 5000, durationWeeks: 6, description: 'Build and test REST endpoints.', skills: ['Node.js'], deadline: '2026-12-31' };
const fresh = () => request(createApp(openDb(':memory:')));

test('create, read, update, delete', async () => {
  const api = fresh();
  const created = await api.post('/api/internships').send(sample).expect(201);
  const id = created.body.data.id;
  assert.equal((await api.get(`/api/internships/${id}`).expect(200)).body.data.title, 'Backend Intern');
  await api.patch(`/api/internships/${id}`).send({ stipend: 7000 }).expect(200);
  const put = await api.put(`/api/internships/${id}`).send({ ...sample, title: 'Senior Backend Intern' }).expect(200);
  assert.equal(put.body.data.title, 'Senior Backend Intern');
  await api.delete(`/api/internships/${id}`).expect(204);
  await api.get(`/api/internships/${id}`).expect(404);
});

test('validation returns 422 with field errors', async () => {
  const res = await fresh().post('/api/internships').send({ title: 'x', mode: 'moon' }).expect(422);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  assert.ok(res.body.error.details.some((d) => d.field === 'title'));
});

test('pagination, filters and bad params', async () => {
  const api = fresh();
  for (let i = 0; i < 5; i++) await api.post('/api/internships').send({ ...sample, title: `Intern ${i}` });
  const res = await api.get('/api/internships?page=2&limit=2').expect(200);
  assert.equal(res.body.data.length, 2);
  assert.equal(res.body.meta.total, 5);
  assert.equal(res.body.meta.totalPages, 3);
  assert.equal((await api.get('/api/internships?q=Intern 3')).body.meta.total, 1);
  await api.get('/api/internships?limit=999').expect(400);
  await api.get('/api/internships/abc').expect(400);
});

test('SQL injection attempt is treated as plain text', async () => {
  const api = fresh();
  await api.post('/api/internships').send(sample);
  const res = await api.get('/api/internships').query({ q: "' OR 1=1 --" }).expect(200);
  assert.equal(res.body.meta.total, 0);
});

test('malformed JSON returns 400', async () => {
  await fresh().post('/api/internships').set('Content-Type', 'application/json').send('{bad').expect(400);
});
