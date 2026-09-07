require('dotenv').config();
const { Pool } = require('pg');

async function test() {
  console.log('🔍 Testing CockroachDB connection...');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('📅 Database time:', result.rows[0].time);
    console.log('🗄️  Database name:', result.rows[0].db);
    
    const tables = await pool.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📊 Tables in database:', tables.rows[0].count);
    
    const members = await pool.query('SELECT COUNT(*) as count FROM members');
    console.log('👥 Members count:', members.rows[0].count);
    
    const donations = await pool.query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM donations');
    console.log('💰 Donations:', donations.rows[0].count, 'Total: ₹' + donations.rows[0].total);
    
    console.log('\n🎉 DATABASE IS 100% OPERATIONAL!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

test();
