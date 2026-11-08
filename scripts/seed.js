const fs = require('fs');
const path = require('path');
const { openDb } = require('../src/db');
const repo = require('../src/repo');
const { validateInternship } = require('../src/validate');

const db = openDb();
if (process.argv.includes('--reset')) { db.exec("DELETE FROM internships; DELETE FROM sqlite_sequence WHERE name='internships';"); }
if (repo.count(db) > 0) { console.log('Table already has data. Use `npm run seed -- --reset` to reseed.'); process.exit(0); }
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'seed', 'internships.json'), 'utf8'));
const tx = db.transaction((items) => items.forEach((r) => {
  const { errors, value } = validateInternship(r);
  if (errors.length) throw new Error(`Invalid seed record "${r.title}": ${JSON.stringify(errors)}`);
  repo.create(db, value);
}));
tx(rows);
console.log(`Seeded ${rows.length} internships.`);
