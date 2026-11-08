# API examples (base URL `http://localhost:3000`)

**Error format** (all errors): `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [{ "field": "title", "message": "..." }] } }`

| Status | Meaning |
|---|---|
| 200 / 201 / 204 | OK / created / deleted |
| 400 | Bad id, bad query params, malformed JSON |
| 404 | Record or route not found |
| 413 | Body too large |
| 422 | Body failed validation |

```bash
# List (pagination + filters)
curl "http://localhost:3000/api/internships?page=1&limit=5&domain=Data%20Science&mode=onsite&q=python"
# Response: { "data": [ ... ], "meta": { "page": 1, "limit": 5, "total": 1, "totalPages": 1 } }

# Detail
curl http://localhost:3000/api/internships/1

# Create
curl -X POST http://localhost:3000/api/internships -H "Content-Type: application/json" -d '{
 "title":"Backend Intern","company":"Acme Corp","domain":"Full Stack Development","location":"Remote",
 "mode":"remote","stipend":5000,"durationWeeks":6,"description":"Build REST endpoints.","skills":["Node.js"],"deadline":"2026-12-31"}'

# Replace (all fields) / partial update
curl -X PUT   http://localhost:3000/api/internships/1 -H "Content-Type: application/json" -d '{...full object...}'
curl -X PATCH http://localhost:3000/api/internships/1 -H "Content-Type: application/json" -d '{"stipend":9000}'

# Delete
curl -X DELETE http://localhost:3000/api/internships/1

# Dropdown options
curl http://localhost:3000/api/internships/meta/options
```
