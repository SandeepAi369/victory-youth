const { Pool } = require('pg');
const p = new Pool({
  connectionString: 'postgresql://***REMOVED***:***REMOVED***@***REMOVED***:26257/defaultdb?ssl=true',
  ssl: { rejectUnauthorized: false }
});
p.query('SELECT 1 as test')
  .then(r => console.log('✅ DB OK:', r.rows[0]))
  .catch(e => console.error('❌ DB FAIL:', e.message, '\nFull error:', e))
  .finally(() => p.end());
