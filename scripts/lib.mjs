// Shared helpers for scripts/setup.mjs and scripts/demo.mjs (plain Node, no extra deps).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { createClient } from "@libsql/client";

const isWindows = process.platform === "win32";

/** Run a command, streaming its output. Returns stdout when `capture` is true. */
export function run(cmd, args, { capture = false, env, dryRun = false } = {}) {
  const shown = [cmd, ...args].join(" ");
  if (dryRun) {
    console.log(`  [dry-run] ${shown}`);
    return "";
  }
  const out = execFileSync(cmd, args, {
    stdio: capture ? ["inherit", "pipe", "inherit"] : "inherit",
    env: env ? { ...process.env, ...env } : process.env,
    shell: isWindows,
    encoding: "utf8",
  });
  return capture ? out : "";
}

/** True if a command can be executed (e.g. `turso --version`). */
export function hasCommand(cmd, args = ["--version"]) {
  try {
    execFileSync(cmd, args, { stdio: "ignore", shell: isWindows });
    return true;
  } catch {
    return false;
  }
}

/** Migration folders (oldest first) for "core" or "media". */
export function migrationFiles(kind) {
  const dir = `drizzle/${kind}`;
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .map((name) => `${dir}/${name}/migration.sql`);
}

/**
 * Applies the core migrations to a libSQL database (local file or remote Turso).
 * Applied migrations are recorded in _vy_migrations, so re-running is safe.
 */
export async function migrateCore(client) {
  await client.execute("CREATE TABLE IF NOT EXISTS _vy_migrations (name TEXT PRIMARY KEY, applied_at INTEGER)");
  const applied = new Set((await client.execute("SELECT name FROM _vy_migrations")).rows.map((r) => r.name));
  let count = 0;
  for (const migration of migrationFiles("core")) {
    const name = migration.split("/").at(-2);
    if (applied.has(name)) continue;
    for (const stmt of readFileSync(migration, "utf8").split("--> statement-breakpoint")) {
      if (!stmt.trim()) continue;
      try {
        await client.execute(stmt);
      } catch (error) {
        // Tables created earlier by `npm run db:push` — the statement already took effect
        if (!/already exists|duplicate column/i.test(String(error))) throw error;
      }
    }
    await client.execute({ sql: "INSERT INTO _vy_migrations VALUES (?, ?)", args: [name, Math.floor(Date.now() / 1000)] });
    count++;
  }
  return count;
}

/** Opens (creating if needed) a local SQLite core database file and migrates it. */
export async function migrateLocalCore(file) {
  mkdirSync(dirname(file), { recursive: true });
  const client = createClient({ url: `file:${file}` });
  await migrateCore(client);
  return client;
}

/** Copy of a media migration with CREATE … IF NOT EXISTS, so it can be re-applied. */
function idempotentCopy(migration) {
  const sql = readFileSync(migration, "utf8")
    .replace(/CREATE TABLE `/g, "CREATE TABLE IF NOT EXISTS `")
    .replace(/CREATE (UNIQUE )?INDEX `/g, "CREATE $1INDEX IF NOT EXISTS `");
  const file = join(tmpdir(), `vy-${migration.split("/").at(-2)}.sql`);
  writeFileSync(file, sql);
  return file;
}

/** Applies the media migrations to D1: the local copy by default, or the real one with `remote`. */
export function migrateMedia({ remote = false, persistTo, dryRun } = {}) {
  for (const migration of migrationFiles("media")) {
    const args = ["wrangler", "d1", "execute", "MEDIA_DB", remote ? "--remote" : "--local", "--file", dryRun ? migration : idempotentCopy(migration), "--yes"];
    if (persistTo) args.push("--persist-to", persistTo);
    run("npx", args, { dryRun, capture: true }); // quiet: errors still surface
  }
}

/** Reads KEY=value pairs from a .env file (missing file → empty object). */
export function readEnvFile(path = ".env") {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

/**
 * Adds values to .env without touching existing non-empty keys.
 * Returns the list of keys that were written.
 */
export function mergeEnvFile(values, path = ".env") {
  const existing = readEnvFile(path);
  let text = existsSync(path) ? readFileSync(path, "utf8") : "";
  const written = [];
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") continue;
    if (existing[key]) continue;
    const line = `${key}=${value}`;
    if (new RegExp(`^${key}=.*$`, "m").test(text)) text = text.replace(new RegExp(`^${key}=.*$`, "m"), line);
    else text += (text && !text.endsWith("\n") ? "\n" : "") + line + "\n";
    written.push(key);
  }
  writeFileSync(path, text);
  return written;
}

/** Random admin password (24 chars) for local setups. */
export function randomPassword() {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
