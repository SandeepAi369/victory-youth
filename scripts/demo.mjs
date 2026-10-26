#!/usr/bin/env node
// Demo mode: a fully working local copy of the site filled with realistic FAKE data.
//
//   npm run demo                 build fresh demo data and start the dev server
//   npm run demo -- --seed-only  only build the demo data (e.g. for screenshots)
//
// Everything lives in .demo/ (git-ignored). This script never reads a database URL
// from .env and never touches Turso or the real D1 database.
import { rmSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { migrateLocalCore, migrateMedia, run } from "./lib.mjs";

const CORE_FILE = ".demo/core.db";
const MEDIA_STATE = ".demo/wrangler";
const ADMIN_PASSWORD = "demo-admin-password";
const SEED_ONLY = process.argv.includes("--seed-only");

const now = Math.floor(Date.now() / 1000);
const DAY = 86400;
const daysAgo = (d) => now - d * DAY;
const isoDate = (ts) => new Date(ts * 1000).toISOString().slice(0, 10);

// ---------- demo content (all fictional) ----------
const members = [
  ["Arjun Reddy", "PRESIDENT"], ["Kiran Kumar", "SECRETARY"], ["Suresh Goud", "TREASURER"],
  ["Ravi Teja", "EVENT_INCHARGE"], ["Mahesh Yadav", "MEMBER"], ["Naveen Rao", "MEMBER"],
  ["Prakash Varma", "MEMBER"], ["Srikanth Naidu", "MEMBER"], ["Vamshi Krishna", "MEMBER"],
  ["Ajay Chary", "MEMBER"], ["Harish Patel", "MEMBER"], ["Sai Charan", "MEMBER"],
  ["Rohit Sharma", "MEMBER"], ["Venkat Raman", "MEMBER"],
];
const inactiveMembers = ["Old Member One", "Old Member Two"];

const donors = [
  ["Lakshmi Textiles", 25000, "Golden Jubilee Utsav Seva"], ["Ramesh & Family", 11116, "Annadanam Sponsorship"],
  ["Sri Sai Traders", 15000, "Mandapam Decoration"], ["Padma Devi", 5116, "Daily Pooja Seva"],
  ["Gopal Rao", 2116, "Golden Jubilee Utsav Seva"], ["Anitha Reddy", 1116, "Prasadam"],
  ["Vijaya Medicals", 10000, "Lighting & Sound"], ["Krishna Murthy", 3116, "Annadanam Sponsorship"],
  ["Sunitha & Kids", 1516, "Daily Pooja Seva"], ["Balaji Electricals", 7500, "Lighting & Sound"],
  ["Shankar Goud", 2500, "Golden Jubilee Utsav Seva"], ["Deepika Rao", 1001, "Prasadam"],
];
const anonymousDonors = [["Hidden Name A", 51000, "Golden Jubilee Utsav Seva"], ["Hidden Name B", 21116, "Annadanam Sponsorship"]];
const chanda = [
  ["Arjun Reddy", 500], ["Kiran Kumar", 500], ["Suresh Goud", 500], ["Ravi Teja", 300],
  ["Mahesh Yadav", 300], ["Naveen Rao", 300], ["Prakash Varma", 200], ["Srikanth Naidu", 200],
];
const events = [
  [1, "Ganesh Sthapana & Pran Pratishtha", "POOJA", "06:00 AM – 09:00 AM"],
  [2, "Ganapathi Homam", "POOJA", "07:00 AM – 10:00 AM"],
  [3, "Annadanam for 1,000 Devotees", "ANNADANAM", "12:00 PM – 03:00 PM"],
  [4, "Cultural Night & Kolatam", "CULTURAL", "07:00 PM – 10:00 PM"],
  [5, "Laddu Auction", "AUCTION", "08:00 PM – 09:30 PM"],
  [6, "Kids Drawing Competition", "CULTURAL", "04:00 PM – 06:00 PM"],
  [7, "Maha Aarti", "POOJA", "07:00 PM – 08:00 PM"],
  [8, "Grand Visarjan Shobhayatra", "VISARJAN", "03:00 PM – 11:00 PM"],
];
const notices = [
  ["Volunteer meeting on Sunday", "All volunteers please meet at the mandapam at 10 AM to finalise duties."],
  ["Annadanam timing changed", "Annadanam on Day 3 starts at 12 PM sharp. Please bring your own plates."],
  ["Parking arrangements", "Two-wheeler parking is available behind the community hall."],
  ["Visarjan route announced", "The Shobhayatra will pass through Main Road, Market Street and Lake Road."],
];
const notes = [
  ["Golden Jubilee planning", "Committee agreed on an 8-day programme for the 50th year."],
  ["Donation receipts", "Every donation gets a receipt link; anonymous donors stay anonymous publicly."],
  ["Thank you, volunteers!", "Over 40 volunteers helped with Annadanam this year."],
];
const inventory = [
  ["Plastic Chairs", "Furniture", 150, "pcs"], ["Tent (20x40)", "Shamiana", 2, "pcs"],
  ["Sound System", "Electronics", 1, "set"], ["LED Serial Lights", "Decoration", 40, "pcs"],
  ["Cooking Vessels", "Kitchen", 12, "pcs"], ["Generator 15 KVA", "Electronics", 1, "pcs"],
];
// Festival-themed placeholder "photos" (inline SVG) — no external image hosts needed
const PALETTES = [["#9a3412", "#f97316"], ["#7f1d1d", "#ea580c"], ["#78350f", "#f59e0b"], ["#831843", "#f97316"], ["#4c1d95", "#db2777"], ["#1e3a8a", "#f59e0b"]];
const EMOJI = ["🪔", "🌺", "🎉", "🥁", "🍬", "🙏", "✨", "🌼"];
function photo(seed, caption = "Victory Youth", width = 900, height = 650) {
  const n = [...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [from, to] = PALETTES[n % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/><circle cx="${width * 0.8}" cy="${height * 0.2}" r="${height * 0.35}" fill="#fff" opacity=".08"/>
<text x="50%" y="46%" font-size="${height * 0.22}" text-anchor="middle" dominant-baseline="middle">${EMOJI[n % EMOJI.length]}</text>
<text x="50%" y="78%" font-family="Georgia,serif" font-size="${height * 0.065}" fill="#fff7ed" text-anchor="middle">${caption}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
const galleryMonths = [
  [70, ["Mandapam setup begins", "Idol arrival", "Decoration work"]],
  [40, ["Sthapana pooja", "Ganapathi Homam", "Annadanam queue", "Cultural night"]],
  [8, ["Kids competition", "Maha Aarti", "Laddu auction", "Visarjan procession", "Thank-you meet"]],
];

async function seedCore() {
  rmSync(".demo", { recursive: true, force: true });
  const db = await migrateLocalCore(CORE_FILE);
  const exec = (sql, args = []) => db.execute({ sql, args });

  await exec(
    `INSERT INTO association_settings (id, association_name, short_name, registration_no, address, president_name, secretary_name, treasurer_name,
      contact_phone, contact_email, upi_vpa, upi_name, bank_name, bank_account_no, bank_ifsc, bank_branch, tax_80g_no, donation_target, golden_jubilee_target)
     VALUES ('settings', 'Victory Youth Association (Demo)', 'Victory Youth', 'DEMO/REG/0001', 'Gudem Gally, Banswada, Telangana',
      'Arjun Reddy', 'Kiran Kumar', 'Suresh Goud', '+91 90000 00000', 'demo@example.org', 'demo@upi', 'Victory Youth (Demo)',
      'Demo Bank', '000000000000', 'DEMO0000000', 'Demo Branch', 'DEMO-80G-0000', 500000, 500000)`
  );
  for (const [i, [name, role]] of members.entries())
    await exec("INSERT INTO members (id, member_id, name, phone, role, committee_role, is_active, listed_publicly, join_date, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)",
      [`mem_demo_${i}`, `VY-${String(i + 1).padStart(3, "0")}`, name, `90000${String(10000 + i)}`, role === "MEMBER" ? "MEMBER" : "COMMITTEE", role, i < 10 ? 1 : 0, isoDate(daysAgo(300 - i * 9)), daysAgo(300 - i * 9)]);
  for (const [i, name] of inactiveMembers.entries())
    await exec("INSERT INTO members (id, member_id, name, phone, is_active) VALUES (?, ?, ?, ?, 0)", [`mem_demo_old_${i}`, `VY-9${i}`, name, `90000${i}9999`]);
  // Every member's fee is their first payment; Arjun (mem_demo_0) also paid again last year
  await exec(`INSERT INTO member_payments (id, member_id, receipt_no, amount, payment_mode, purpose, date, created_at)
    SELECT 'mpay_' || id, id, 'MEM-DEMO-' || member_id, membership_fee, 'CASH', 'Membership', coalesce(join_date, date(created_at, 'unixepoch'), date('now')), coalesce(created_at, unixepoch())
    FROM members WHERE coalesce(membership_fee, 0) > 0`);
  await exec("INSERT INTO member_payments (id, member_id, receipt_no, amount, payment_mode, purpose, date, created_at) VALUES ('mpay_demo_extra', 'mem_demo_0', 'MEM-DEMO-EXTRA', 1000, 'UPI', 'Festival fund', ?, ?)", [isoDate(daysAgo(380)), daysAgo(380)]);
  await exec("UPDATE members SET membership_fee = (SELECT sum(amount) FROM member_payments WHERE member_id = members.id) WHERE id = 'mem_demo_0'");

  // One contributor profile per name PER CATEGORY (Chanda and Donations are separate books)
  const contributorIds = new Map();
  const contributor = async (name, category, anonymous) => {
    const book = category === "CHANDA" ? "CHANDA" : "DONATION";
    const key = `${book}:${name}`;
    if (!contributorIds.has(key)) {
      const id = `ctr_demo_${contributorIds.size}`;
      await exec("INSERT INTO contributors (id, name, phone, category, is_anonymous, created_at) VALUES (?, ?, '9000000000', ?, ?, ?)", [id, name, book, anonymous ? 1 : 0, daysAgo(500)]);
      contributorIds.set(key, id);
    }
    return contributorIds.get(key);
  };
  const donation = async (id, name, amount, purpose, category, ago, { anonymous = false, published = true } = {}) =>
    exec(`INSERT INTO donations (id, receipt_no, contributor_id, donor_name, phone, amount, purpose, category, payment_mode, status, is_published, is_anonymous, date, created_at)
          VALUES (?, ?, ?, ?, '9000000000', ?, ?, ?, ?, 'SUCCESS', ?, ?, ?, ?)`,
      [id, `DEMO-${id.toUpperCase()}`, await contributor(name, category, anonymous), name, amount, purpose, category, ago % 2 ? "UPI" : "CASH", published && !anonymous ? 1 : 0, anonymous ? 1 : 0, isoDate(daysAgo(ago)), daysAgo(ago)]);
  for (const [i, [name, amount, purpose]] of donors.entries()) await donation(`don${i}`, name, amount, purpose, "DONATION", 2 + i * 3);
  for (const [i, [name, amount, purpose]] of anonymousDonors.entries()) await donation(`anon${i}`, name, amount, purpose, "DONATION", 5 + i * 7, { anonymous: true });
  await donation("draft0", "Not Yet Published", 999, "Golden Jubilee Utsav Seva", "DONATION", 1, { published: false });
  for (const [i, [name, amount]] of chanda.entries()) await donation(`ch${i}`, name, amount, "Monthly Chanda", "CHANDA", 4 + i * 2, { anonymous: i === 7 });
  // Recurring contributors: last year's chanda from the same people
  for (const [i, [name, amount]] of chanda.slice(0, 5).entries()) await donation(`ch_prev${i}`, name, amount, "Monthly Chanda", "CHANDA", 370 + i * 5);
  // Arjun also donates: a separate Donations profile, independent of his Chanda one
  await donation("don_arjun", "Arjun Reddy", 5000, "Golden Jubilee Utsav Seva", "DONATION", 6);

  for (const [day, title, type, timing] of events)
    await exec("INSERT INTO events (id, day, title, type, description, date, timing, location, in_charge, is_published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, 'Gudem Gally Mandapam', ?, 1, ?)",
      [`evt_demo_${day}`, day, title, type, `${title} — part of the Golden Jubilee celebrations.`, isoDate(now + (day - 3) * DAY), timing, members[day % members.length][0], day]);
  for (const [i, [title, body]] of notices.entries())
    await exec("INSERT INTO notices (id, title, body, status, sent_by, created_at) VALUES (?, ?, ?, 'PUBLISHED', 'Committee', ?)", [`not_demo_${i}`, title, body, daysAgo(1 + i * 4)]);
  for (const [i, [title, content]] of notes.entries())
    await exec("INSERT INTO important_notes (id, title, content, author_name, is_published, created_at) VALUES (?, ?, ?, 'Committee', 1, ?)", [`note_demo_${i}`, title, JSON.stringify(content), daysAgo(2 + i * 5)]);
  for (const [i, [name, category, qty, unit]] of inventory.entries())
    await exec("INSERT INTO inventory_items (id, name, category, quantity, unit, condition, in_charge) VALUES (?, ?, ?, ?, ?, 'Good', ?)", [`inv_demo_${i}`, name, category, qty, unit, members[i][0]]);
  const ledger = [["INCOME", "Donations", 120000], ["INCOME", "Chanda", 2800], ["EXPENSE", "Decoration", 35000], ["EXPENSE", "Annadanam", 42000], ["EXPENSE", "Sound & Lighting", 18000]];
  for (const [i, [type, category, amount]] of ledger.entries())
    await exec("INSERT INTO transactions (id, voucher_no, type, category, amount, recorded_by, date, is_published) VALUES (?, ?, ?, ?, ?, 'Treasurer', ?, 1)", [`txn_demo_${i}`, `V-DEMO-${i}`, type, category, amount, isoDate(daysAgo(3 + i))]);
  db.close();
  return contributorIds.size;
}

function seedMedia() {
  migrateMedia({ persistTo: MEDIA_STATE });
  const q = (s) => `'${String(s).replaceAll("'", "''")}'`;
  const rows = [];
  let n = 0;
  for (const [ago, titles] of galleryMonths)
    for (const [i, title] of titles.entries()) {
      n++;
      rows.push(`INSERT INTO gallery (id, title, url, category, year, is_published, uploaded_by, uploaded_at) VALUES (${q(`gal_demo_${n}`)}, ${q(title)}, ${q(photo(n, title))}, 'Festival', 2026, 1, 'demo', ${daysAgo(ago + i * 3)});`);
    }
  rows.push(`INSERT INTO banners (id, url, label, sort_order, is_published) VALUES ('ban_demo_1', ${q(photo("banner-1", "Golden Jubilee — 50 Years", 1600, 600))}, 'Golden Jubilee — 50 Years', 1, 1);`);
  rows.push(`INSERT INTO banners (id, url, label, sort_order, is_published) VALUES ('ban_demo_2', ${q(photo("banner-2", "Annadanam for everyone", 1600, 600))}, 'Annadanam for everyone', 2, 1);`);
  for (let i = 1; i <= 3; i++) rows.push(`INSERT INTO hero_images (id, url, sort_order) VALUES ('hero_demo_${i}', ${q(photo(`hero-${i}`, ["Ganesh Utsav 2026", "Golden Jubilee Celebrations", "Victory Youth, Banswada"][i - 1], 1600, 900))}, ${i});`);
  writeFileSync(".demo/media-seed.sql", rows.join("\n"));
  run("npx", ["wrangler", "d1", "execute", "MEDIA_DB", "--local", "--persist-to", MEDIA_STATE, "--file", ".demo/media-seed.sql", "--yes"], { capture: true });
}

console.log("Building demo data in .demo/ (local only) ...");
const contributorCount = await seedCore();
seedMedia();
console.log(`\n✔ Demo data ready: ${members.length + inactiveMembers.length} members, ${donors.length + anonymousDonors.length + 2} donations, ${chanda.length + 5} chanda (5 from last year), ${contributorCount} contributors, ${events.length} events, 12 photos.`);
console.log(`  Admin login for the demo: \x1b[1m${ADMIN_PASSWORD}\x1b[0m`);

if (!SEED_ONLY) {
  console.log("\nStarting the dev server in demo mode → http://localhost:3000\n");
  const env = { ...process.env, VY_DEMO: "1", TURSO_CORE_DATABASE_URL: `file:${CORE_FILE}`, ADMIN_PASSWORD };
  delete env.TURSO_CORE_AUTH_TOKEN;
  spawn("npx", ["next", "dev", "-p", "3000"], { stdio: "inherit", env, shell: process.platform === "win32" });
}
