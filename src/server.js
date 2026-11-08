const { createApp } = require('./app');
const { openDb } = require('./db');
const port = process.env.PORT || 3000;
const app = createApp(openDb());
app.listen(port, () => console.log(`API listening on http://localhost:${port}/api/internships`));
