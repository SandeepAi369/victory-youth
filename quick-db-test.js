const postgres = require('postgres');
require('dotenv').config({ path: '.env' });

async function test() {
  console.log('🔍 Testing CockroachDB connection...');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND');
  
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', connect_timeout: 10 });
  
  try {
    const result = await sql`SELECT NOW() as time, current_database() as db`;
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('📅 Database time:', result[0].time);
    console.log('🗄️  Database name:', result[0].db);
    
    const tables = await sql`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('📊 Tables in database:', tables[0].count);
    
    console.log('\n🎉 DATABASE IS 100% OPERATIONAL!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

test();
