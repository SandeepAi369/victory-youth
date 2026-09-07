const { Client } = require("pg");

(async () => {
  const connectionString = "postgresql://***REMOVED***:***REMOVED***@***REMOVED***:26257/defaultdb?ssl=true";
  const client = new Client({ connectionString });
  await client.connect();
  
  const id = Date.now().toString();
  
  // Inject Notice
  await client.query(`INSERT INTO notices (id, title, body, author_name, is_published) VALUES ($1, $2, $3, $4, $5)`, 
    ["not_" + id, "Test Notice", "This is a test notice", "Admin", false]);
    
  // Inject Note
  await client.query(`INSERT INTO important_notes (id, title, content, author_name, is_published) VALUES ($1, $2, $3, $4, $5)`, 
    ["in_" + id, "Test Note", `{"text":"test"}`, "Admin", false]);

  // Inject Event
  await client.query(`INSERT INTO events (id, day, title, description, date, timing, location, in_charge, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
    ["evt_" + id, 1, "Test Event", "Description", "2026-09-15", "10:00 AM", "Mandapam", "Admin", false]);

  // Inject Donation (Money In)
  await client.query(`INSERT INTO donations (id, receipt_no, donor_name, amount, payment_mode, status, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
    ["don_" + id, "REC-TEST", "Test Donor", 1000, "CASH", "SUCCESS", false]);

  console.log("Test data injected!");
  process.exit(0);
})();
