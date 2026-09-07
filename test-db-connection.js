// Direct database connection test using postgres.js
const postgres = require('postgres');
require('dotenv').config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

console.log('🔍 Testing CockroachDB connection...');
console.log('📍 Database URL found: Yes');
console.log('🔗 Attempting to connect...\n');

const sql = postgres(connectionString, {
  ssl: 'require',
  connect_timeout: 10,
});

async function testConnection() {
  try {
    // Test 1: Simple query
    console.log('Test 1: Running SELECT NOW()...');
    const timeResult = await sql`SELECT NOW() as current_time`;
    console.log('✅ Current database time:', timeResult[0].current_time);
    
    // Test 2: Check existing tables
    console.log('\nTest 2: Checking existing tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log(`✅ Found ${tables.length} tables in database:`);
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    
    // Test 3: Check members table
    console.log('\nTest 3: Querying members table...');
    const members = await sql`SELECT id, member_id, name FROM members LIMIT 5`;
    console.log(`✅ Found ${members.length} members (showing first 5):`);
    members.forEach(m => console.log(`   - ${m.member_id}: ${m.name}`));
    
    // Test 4: Check donations total
    console.log('\nTest 4: Calculating total donations...');
    const donationStats = await sql`
      SELECT 
        COUNT(*) as total_donations,
        COALESCE(SUM(amount), 0) as total_amount
      FROM donations
    `;
    console.log('✅ Donation statistics:');
    console.log(`   - Total donations: ${donationStats[0].total_donations}`);
    console.log(`   - Total amount: ₹${donationStats[0].total_amount}`);
    
    // Test 5: Check events
    console.log('\nTest 5: Checking events...');
    const events = await sql`
      SELECT day, title, date 
      FROM events 
      ORDER BY day 
      LIMIT 5
    `;
    console.log(`✅ Found events (showing first 5):`);
    events.forEach(e => console.log(`   - Day ${e.day}: ${e.title} (${e.date})`));
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE CONNECTION: FULLY OPERATIONAL!');
    console.log('✅ All tests passed successfully');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error details:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

testConnection();
