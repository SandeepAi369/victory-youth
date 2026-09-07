const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://***REMOVED***:***REMOVED***@***REMOVED***:26257/defaultdb?ssl=true',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    // Check all tables
    const tables = ['association_settings', 'important_notes', 'events', 'donations', 'notices', 'sponsors', 'transactions', 'members'];
    for (const table of tables) {
      const cols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, [table]);
      console.log(`\n=== ${table} (${cols.rows.length} cols) ===`);
      console.log(cols.rows.map(r => r.column_name).join(', '));
    }
  } finally {
    client.release();
    await pool.end();
  }
}
run().catch(console.error);
