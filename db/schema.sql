CREATE TABLE IF NOT EXISTS internships (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT    NOT NULL CHECK (length(title) BETWEEN 3 AND 100),
  company        TEXT    NOT NULL CHECK (length(company) BETWEEN 2 AND 80),
  domain         TEXT    NOT NULL,
  location       TEXT    NOT NULL,
  mode           TEXT    NOT NULL CHECK (mode IN ('remote','hybrid','onsite')),
  stipend        INTEGER NOT NULL DEFAULT 0 CHECK (stipend >= 0),
  duration_weeks INTEGER NOT NULL CHECK (duration_weeks BETWEEN 1 AND 52),
  description    TEXT    NOT NULL,
  skills         TEXT    NOT NULL DEFAULT '[]',   -- JSON array
  deadline       TEXT,                            -- YYYY-MM-DD
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_internships_domain ON internships(domain);
CREATE INDEX IF NOT EXISTS idx_internships_mode   ON internships(mode);
