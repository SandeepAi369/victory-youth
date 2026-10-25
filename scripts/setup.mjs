#!/usr/bin/env node
// One-command project setup.
//
//   npm run setup -- --local     No accounts needed: local SQLite file for core data
//                                + local D1 copy for media. Perfect for contributors.
//   npm run setup                Cloud: creates the Turso core DB and the Cloudflare D1
//                                media DB with your logged-in `turso` / `wrangler` CLIs.
//
// Flags: --yes (accept defaults, no prompts)  --dry-run (print the cloud commands only)
// Existing values in .env are never overwritten.
import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { createClient } from "@libsql/client";
import { hasCommand, mergeEnvFile, migrateCore, migrateLocalCore, migrateMedia, migrationFiles, randomPassword, readEnvFile, run } from "./lib.mjs";

const args = new Set(process.argv.slice(2));
const LOCAL = args.has("--local");
const YES = args.has("--yes");
const DRY = args.has("--dry-run");

const rl = createInterface({ input: process.stdin, output: process.stdout });
async function ask(question, fallback = "") {
  if (YES) return fallback;
  const answer = (await rl.question(`${question}${fallback ? ` [${fallback}]` : ""}: `)).trim();
  return answer || fallback;
}
const step = (n, text) => console.log(`\n\x1b[1m${n}. ${text}\x1b[0m`);
const done = (text) => console.log(`   \x1b[32m✔\x1b[0m ${text}`);
function fail(text) {
  console.error(`\n\x1b[31m✖ ${text}\x1b[0m`);
  rl.close();
  process.exit(1);
}

const major = Number(process.versions.node.split(".")[0]);
if (major < 22) fail(`Node.js 22 or newer is required (you have ${process.versions.node}).`);

const env = readEnvFile();

async function adminPassword() {
  if (env.ADMIN_PASSWORD) return undefined; // keep existing
  const generated = randomPassword();
  const value = await ask("Admin password (min 12 characters, Enter = generate one)", generated);
  if (value.length < 12) fail("ADMIN_PASSWORD must be at least 12 characters.");
  if (value === generated) console.log(`   Generated admin password: \x1b[1m${generated}\x1b[0m  (saved to .env)`);
  return value;
}

async function setupLocal() {
  console.log("\nVictory Youth — local setup (no cloud accounts needed)");

  step(1, "Core database → local SQLite file");
  const file = ".local/core.db";
  const client = await migrateLocalCore(file);
  client.close();
  done(`${file} ready (schema up to date)`);

  step(2, "Media database → local D1 copy (.wrangler/state)");
  migrateMedia();
  done("local MEDIA_DB ready");

  step(3, "Environment (.env)");
  const written = mergeEnvFile({ TURSO_CORE_DATABASE_URL: `file:${file}`, ADMIN_PASSWORD: await adminPassword() });
  done(written.length ? `wrote ${written.join(", ")}` : "kept your existing .env values");

  console.log("\nAll set! Start the app with \x1b[1mnpm run dev\x1b[0m and open http://localhost:3000");
  console.log("Want sample data instead? Run \x1b[1mnpm run demo\x1b[0m.");
}

async function setupCloud() {
  console.log("\nVictory Youth — cloud setup (Turso + Cloudflare D1)" + (DRY ? "  [dry run: nothing is created]" : ""));

  step(1, "Checking tools");
  if (!DRY) {
    if (!hasCommand("turso")) fail("Turso CLI not found. Install it: https://docs.turso.tech/cli/introduction — then run `turso auth login`.");
    if (!hasCommand("turso", ["auth", "whoami"])) fail("Not logged in to Turso. Run `turso auth login` first.");
    if (!hasCommand("npx", ["wrangler", "whoami"])) fail("Not logged in to Cloudflare. Run `npx wrangler login` first.");
  }
  done("turso + wrangler are ready");

  const coreName = await ask("Turso core database name", "victory-youth-core");
  const location = await ask("Turso location (e.g. aws-ap-south-1 = Mumbai)", "aws-ap-south-1");
  const mediaName = await ask("Cloudflare D1 media database name", "victory-youth-media");

  step(2, `Turso core database "${coreName}"`);
  let coreUrl = env.TURSO_CORE_DATABASE_URL && !env.TURSO_CORE_DATABASE_URL.startsWith("file:") ? env.TURSO_CORE_DATABASE_URL : "";
  let coreToken = env.TURSO_CORE_AUTH_TOKEN || "";
  if (coreUrl) {
    done(`using existing TURSO_CORE_DATABASE_URL from .env`);
  } else {
    try {
      run("turso", ["db", "create", coreName, "--location", location], { dryRun: DRY });
    } catch {
      console.log("   (database may already exist — continuing)");
    }
    coreUrl = DRY ? "libsql://<core-db>.turso.io" : run("turso", ["db", "show", coreName, "--url"], { capture: true }).trim();
    coreToken = DRY ? "<token>" : run("turso", ["db", "tokens", "create", coreName], { capture: true }).trim();
    done(coreUrl);
  }

  step(3, `Cloudflare D1 media database "${mediaName}"`);
  const wranglerPath = "wrangler.jsonc";
  let wranglerText = readFileSync(wranglerPath, "utf8");
  let databaseId = "";
  if (!DRY) {
    try {
      const out = run("npx", ["wrangler", "d1", "create", mediaName], { capture: true });
      databaseId = out.match(/"database_id":\s*"([0-9a-f-]{36})"/)?.[1] ?? "";
    } catch {
      console.log("   (database may already exist — looking it up)");
    }
    if (!databaseId) {
      const list = JSON.parse(run("npx", ["wrangler", "d1", "list", "--json"], { capture: true }));
      databaseId = list.find((d) => d.name === mediaName)?.uuid ?? "";
    }
    if (!databaseId) fail(`Could not find the D1 database id for "${mediaName}".`);
    wranglerText = wranglerText
      .replace(/("database_name":\s*")[^"]*(")/, `$1${mediaName}$2`)
      .replace(/("database_id":\s*")[^"]*(")/, `$1${databaseId}$2`);
    writeFileSync(wranglerPath, wranglerText);
  } else {
    run("npx", ["wrangler", "d1", "create", mediaName], { dryRun: true });
  }
  done(`MEDIA_DB → ${mediaName} ${databaseId}`.trim());

  step(4, "Environment (.env)");
  let accountId = env.CLOUDFLARE_ACCOUNT_ID || "";
  if (!accountId && !DRY) accountId = run("npx", ["wrangler", "whoami"], { capture: true }).match(/\b[0-9a-f]{32}\b/)?.[0] ?? "";
  const cloudName = env.CLOUDINARY_CLOUD_NAME ? "" : await ask("Cloudinary cloud name (optional, Enter to skip)");
  const values = {
    TURSO_CORE_DATABASE_URL: coreUrl,
    TURSO_CORE_AUTH_TOKEN: coreToken,
    CLOUDFLARE_ACCOUNT_ID: accountId,
    ADMIN_PASSWORD: await adminPassword(),
    CLOUDINARY_CLOUD_NAME: cloudName,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: cloudName,
  };
  if (DRY) console.log("   [dry-run] would add to .env:", Object.keys(values).filter((k) => values[k]).join(", "));
  else {
    const written = mergeEnvFile(values);
    done(written.length ? `wrote ${written.join(", ")}` : "kept your existing .env values");
  }

  step(5, "Creating tables");
  if (DRY) console.log(`  [dry-run] apply ${migrationFiles("core").length} core migration(s) to ${coreUrl}`);
  else {
    const client = createClient({ url: coreUrl, authToken: coreToken });
    const applied = await migrateCore(client);
    client.close();
    done(`Turso: ${applied} new core migration(s) applied`);
  }
  migrateMedia({ remote: true, dryRun: DRY });
  migrateMedia({ dryRun: DRY });
  done("D1: media tables created (remote + local copy for npm run dev)");

  console.log("\nAll set! Run \x1b[1mnpm run dev\x1b[0m. To deploy, see README → Deployment.");
}

try {
  if (LOCAL) await setupLocal();
  else await setupCloud();
} finally {
  rl.close();
}
