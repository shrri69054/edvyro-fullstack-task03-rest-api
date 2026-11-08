# EdVyro Full Stack Development – Task 3: REST API and Persistent Data

Node.js + Express REST API for internship records with validation, pagination and SQLite persistence.

## Setup
```bash
npm install
npm run seed        # loads seed/internships.json (use `-- --reset` to reseed)
npm start           # http://localhost:3000/api/internships
npm test
```
Env vars: `PORT` (default 3000), `DB_PATH` (default `data/internships.db`).

## Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/internships?page&limit&q&domain&mode` | Paginated list |
| GET | `/api/internships/:id` | Detail |
| POST | `/api/internships` | Create (201 + Location) |
| PUT | `/api/internships/:id` | Replace |
| PATCH | `/api/internships/:id` | Partial update |
| DELETE | `/api/internships/:id` | Delete (204) |
| GET | `/api/internships/meta/options` | Domains and modes |

Schema: [`db/schema.sql`](db/schema.sql) · Seed data: [`seed/internships.json`](seed/internships.json) · Examples: [`docs/api-examples.md`](docs/api-examples.md)

## Design notes
- Layered: routes → validation → repository (`src/repo.js`) → SQLite
- Parameterized SQL only; body limited to 10 KB; consistent JSON error format
