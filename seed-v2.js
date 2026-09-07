const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://***REMOVED***:***REMOVED***@***REMOVED***:26257/defaultdb?ssl=true",
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  console.log("🌱 Connected. Adding missing columns...\n");

  // Add missing columns
  const alters = [
    `ALTER TABLE donations ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false`,
    `ALTER TABLE donations ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'CHANDA'`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false`,
  ];
  for (const sql of alters) {
    try { await client.query(sql); console.log("✅ " + sql.substring(0, 60)); }
    catch(e) { console.log("⚠️ " + e.message); }
  }

  console.log("\n🌱 Seeding data...\n");

  // 1. Donations
  const donations = [
    ["don_f1","REC-2026-0001","Rajesh Kumar Sharma","9848012345",11000,"CHANDA","Golden Jubilee Fund","UPI","2026-08-20",true,"SUCCESS"],
    ["don_f2","REC-2026-0002","Suresh Reddy","9490123456",5100,"DONATION","Stage Decoration","CASH","2026-08-21",true,"SUCCESS"],
    ["don_f3","REC-2026-0003","Venkatesh Goud","8978654321",21000,"SPONSORSHIP","Sound System Sponsor","BANK_TRANSFER","2026-08-22",true,"SUCCESS"],
    ["don_f4","REC-2026-0004","Lakshmi Devi","9876543210",2100,"ANNADANAM","Prasadam Seva","CASH","2026-08-23",true,"SUCCESS"],
    ["don_f5","REC-2026-0005","Ramesh Yadav","9848099999",51000,"SPONSORSHIP","Main Mandapam","CHEQUE","2026-08-24",true,"SUCCESS"],
    ["don_f6","REC-2026-0006","Prakash Rao","9440011111",1100,"CHANDA","General Fund","UPI","2026-08-25",false,"SUCCESS"],
    ["don_f7","REC-2026-0007","Anjali Kumari","9701234567",5001,"DONATION","Pooja Items","CASH","2026-08-26",false,"SUCCESS"],
    ["don_f8","REC-2026-0008","Srinivas Murthy","8885551234",11100,"CHANDA","Golden Jubilee Fund","UPI","2026-08-27",true,"SUCCESS"],
    ["don_f9","REC-2026-0009","Kavitha Reddy","9848077777",3100,"ANNADANAM","Day 5 Annadanam","CASH","2026-08-28",true,"SUCCESS"],
    ["don_f10","REC-2026-0010","Nagaraj Patel","9440099999",25000,"SPONSORSHIP","Lighting Sponsor","BANK_TRANSFER","2026-08-29",true,"SUCCESS"],
  ];
  for (const d of donations) {
    try {
      await client.query(`INSERT INTO donations (id,receipt_no,donor_name,phone,amount,category,purpose,payment_mode,date,is_published,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) ON CONFLICT (id) DO NOTHING`, d);
    } catch(e) { console.log("Don skip:", e.message); }
  }
  console.log("✅ 10 Donations");

  // 2. Expenses
  const expenses = [
    ["txn_f1","VCH-2026-0001","EXPENSE","Decoration",35000,"Grand Mandapam Decoration","Balaji Tent House","BANK_TRANSFER","2026-08-18","APPROVED","Admin",false],
    ["txn_f2","VCH-2026-0002","EXPENSE","Sound System",18000,"DJ & Sound System Rental","Kumar Sound Systems","CASH","2026-08-19","APPROVED","Admin",false],
    ["txn_f3","VCH-2026-0003","EXPENSE","Prasadam",12000,"Laddu & Sweet Materials","Sri Krishna Sweets","CASH","2026-08-20","APPROVED","Admin",false],
    ["txn_f4","VCH-2026-0004","EXPENSE","Electricity",8500,"Generator & Electrical Work","Power Solutions","UPI","2026-08-21","APPROVED","Admin",false],
    ["txn_f5","VCH-2026-0005","EXPENSE","Transport",5000,"Idol Transport from Hyderabad","Sri Balaji Transport","CASH","2026-08-22","APPROVED","Admin",false],
  ];
  for (const e of expenses) {
    try {
      await client.query(`INSERT INTO transactions (id,voucher_no,type,category,amount,title,paid_to,mode,date,status,recorded_by,is_published,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()) ON CONFLICT (id) DO NOTHING`, e);
    } catch(e2) { console.log("Txn skip:", e2.message); }
  }
  console.log("✅ 5 Expenses");

  // 3. Notices
  const notices = [
    ["ntc_f1","Ganesh Chaturthi Dates Announced!","The 50th Golden Jubilee celebrations will be held from August 27 to September 6, 2026.","PUBLISHED","Admin"],
    ["ntc_f2","Volunteer Registration Open","Youth volunteers needed for seva duties during all 11 days.","PUBLISHED","Admin"],
    ["ntc_f3","Parking Arrangements","Free parking at the community ground. Follow signboards.","DRAFT","Admin"],
  ];
  for (const n of notices) {
    try {
      await client.query(`INSERT INTO notices (id,title,body,status,sent_by,created_at) VALUES ($1,$2,$3,$4,$5,NOW()) ON CONFLICT (id) DO NOTHING`, n);
    } catch(e) { console.log("Notice skip:", e.message); }
  }
  console.log("✅ 3 Notices");

  // 4. Notes
  const notes = [
    ["note_f1","Committee Meeting Minutes","Discussed budget for sound & catering. Approved Rs 35,000 for mandapam.","committee","Secretary",true,true,1],
    ["note_f2","Sponsorship Update","Total sponsorship: Rs 97,100. Target Rs 5,00,000.","financial","Treasurer",true,false,1],
    ["note_f3","Stage Design Finalized","LED panel stage design confirmed. Delivery by Aug 25.","event","Admin",false,false,1],
  ];
  for (const n of notes) {
    try {
      await client.query(`INSERT INTO important_notes (id,title,content,category,author_name,is_published,is_pinned,version,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) ON CONFLICT (id) DO NOTHING`, n);
    } catch(e) { console.log("Note skip:", e.message); }
  }
  console.log("✅ 3 Notes");

  // 5. Events
  const events = [
    ["evt_f1",1,"Ganesh Sthapana & Maha Pooja","Grand idol installation with Vedic rituals by 11 priests.","2026-08-27","06:00 AM","Main Mandapam",true,1],
    ["evt_f2",3,"Cultural Night & Music Concert","Live music with local artists and Bollywood songs.","2026-08-29","07:00 PM","Stage Area",true,3],
    ["evt_f3",5,"Maha Annadanam (5000+ Devotees)","Grand feast. Special menu with 12 varieties.","2026-08-31","12:00 PM","Dining Hall",true,5],
    ["evt_f4",9,"Grand Procession & Palaki Seva","Palanquin procession with band and fireworks.","2026-09-04","05:00 PM","Main Streets",true,9],
    ["evt_f5",11,"Visarjan & Maha Aarti","Final immersion with grand aarti.","2026-09-06","04:00 PM","Lake",true,11],
  ];
  for (const e of events) {
    try {
      await client.query(`INSERT INTO events (id,day,title,description,date,timing,location,is_published,sort_order,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) ON CONFLICT (id) DO NOTHING`, e);
    } catch(e2) { console.log("Evt skip:", e2.message); }
  }
  console.log("✅ 5 Events");

  // Verify counts
  const counts = await client.query(`
    SELECT 'donations' as t, count(*) as c FROM donations
    UNION ALL SELECT 'transactions', count(*) FROM transactions
    UNION ALL SELECT 'notices', count(*) FROM notices
    UNION ALL SELECT 'notes', count(*) FROM important_notes
    UNION ALL SELECT 'events', count(*) FROM events
    UNION ALL SELECT 'members', count(*) FROM members
  `);
  console.log("\n📊 Table counts:");
  for (const row of counts.rows) { console.log(`   ${row.t}: ${row.c} rows`); }

  client.release();
  await pool.end();
  console.log("\n🎉 Done!");
}

seed().catch(e => { console.error("SEED ERROR:", e); process.exit(1); });
