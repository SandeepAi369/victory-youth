import { readFileSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Load .env so `npm run db:push` works without exporting variables first
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the environment
}

// MEDIA database — Cloudflare D1, tables in src/db/schema-media.ts.
// The database ID comes from the MEDIA_DB binding in wrangler.jsonc (single
// source of truth); the account ID and token come from .env. Uses the D1 HTTP
// API, so CLOUDFLARE_API_TOKEN needs the D1:Edit permission.
function mediaDatabaseId(): string {
  const jsonc = readFileSync("wrangler.jsonc", "utf8").replace(/^\s*\/\/.*$/gm, "");
  const binding = JSON.parse(jsonc).d1_databases?.find((d: { binding: string }) => d.binding === "MEDIA_DB");
  if (!binding?.database_id) throw new Error("MEDIA_DB binding with a database_id is missing in wrangler.jsonc");
  return binding.database_id;
}

export default defineConfig({
  schema: "./src/db/schema-media.ts",
  out: "./drizzle/media",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: mediaDatabaseId(),
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
