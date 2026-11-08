const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function openDb(file = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'internships.db')) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8'));
  return db;
}
module.exports = { openDb };
