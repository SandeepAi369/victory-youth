const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://***REMOVED***:***REMOVED***@***REMOVED***:26257/defaultdb?ssl=true",
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  console.log("🌱 Connected.\n");

  // Create important_notes table if missing
  await client.query(`
    CREATE TABLE IF NOT EXISTS important_notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT DEFAULT 'general',
      tags TEXT,
      author_name TEXT NOT NULL DEFAULT 'Admin',
      is_published BOOLEAN DEFAULT false,
      is_pinned BOOLEAN DEFAULT false,
      version INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log("✅ important_notes table ensured");

  // Notes
  const notes = [
    ["note_f1","Committee Meeting Minutes","Discussed budget for sound & catering. Approved Rs 35,000 for mandapam.","committee","Secretary",true,true,1],
    ["note_f2","Sponsorship Update","Total sponsorship: Rs 97,100. Target Rs 5,00,000.","financial","Treasurer",true,false,1],
    ["note_f3","Stage Design Finalized","LED panel stage design confirmed. Delivery by Aug 25.","event","Admin",false,false,1],
  ];
  for (const n of notes) {
    await client.query(`INSERT INTO important_notes (id,title,content,category,author_name,is_published,is_pinned,version,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) ON CONFLICT (id) DO NOTHING`, n);
  }
  console.log("✅ 3 Notes seeded");

  // Events - with in_charge
  const events = [
    ["evt_f1",1,"Ganesh Sthapana & Maha Pooja","Grand idol installation with Vedic rituals by 11 priests.","2026-08-27","06:00 AM","Main Mandapam",true,1,"Committee"],
    ["evt_f2",3,"Cultural Night & Music Concert","Live music with local artists and Bollywood songs.","2026-08-29","07:00 PM","Stage Area",true,3,"Youth Wing"],
    ["evt_f3",5,"Maha Annadanam (5000+ Devotees)","Grand feast. Special menu with 12 varieties.","2026-08-31","12:00 PM","Dining Hall",true,5,"Catering Team"],
    ["evt_f4",9,"Grand Procession & Palaki Seva","Palanquin procession with band and fireworks.","2026-09-04","05:00 PM","Main Streets",true,9,"Procession Team"],
    ["evt_f5",11,"Visarjan & Maha Aarti","Final immersion with grand aarti.","2026-09-06","04:00 PM","Lake",true,11,"Full Committee"],
  ];
  // Delete old failed attempts and re-insert
  for (const e of events) {
    await client.query(`DELETE FROM events WHERE id = $1`, [e[0]]);
    await client.query(`INSERT INTO events (id,day,title,description,date,timing,location,is_published,sort_order,in_charge,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`, e);
  }
  console.log("✅ 5 Events seeded");

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
  for (const row of counts.rows) { console.log("   " + row.t + ": " + row.c + " rows"); }

  // Check published donations
  const pub = await client.query(`SELECT donor_name, amount FROM donations WHERE is_published = true ORDER BY amount DESC`);
  console.log("\n👁️ Published donations (visible on frontend):");
  for (const r of pub.rows) { console.log("   " + r.donor_name + " → ₹" + r.amount); }

  client.release();
  await pool.end();
  console.log("\n🎉 All done!");
}

seed().catch(e => { console.error("ERROR:", e); process.exit(1); });
