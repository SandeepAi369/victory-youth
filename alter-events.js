const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://***REMOVED***:***REMOVED***@***REMOVED***:26257/defaultdb?ssl=true",
  ssl: { rejectUnauthorized: false }
});
async function run() {
  const client = await pool.connect();
  try {
    await client.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;");
    console.log("Added image_url to events table.");
  } catch(e) {
    console.error(e.message);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
