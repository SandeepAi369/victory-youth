import { cache } from "react";
// "@libsql/client" resolves to the fetch-based web client on Cloudflare Workers
// (workerd export condition) and to the full Node client in `next dev`, which
// also supports local `file:` databases (used by `npm run setup -- --local` and demo mode).
import { createClient } from "@libsql/client";
import { drizzle as drizzleTurso } from "drizzle-orm/libsql";
import { drizzle as drizzleD1, type AnyD1Database } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

/**
 * Hybrid database setup:
 *   - CORE  (getDb)      → Turso, tables in schema-core.ts
 *   - MEDIA (getMediaDb) → Cloudflare D1, tables in schema-media.ts (gallery,
 *                          gallery_categories, banners, hero_images, documents)
 *
 * Images themselves live in Cloudinary — the media DB only stores their
 * secure_url / public_id and metadata. Each query must use the database that
 * holds its table; there are no joins across the two.
 */

declare global {
  interface CloudflareEnv {
    // D1 binding declared in wrangler.jsonc
    MEDIA_DB: AnyD1Database;
  }
}

function readEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} environment variable is not set. ` +
        "For local development, add it to your .env file. " +
        `For Cloudflare production, set it with \`wrangler secret put ${name}\`.`
    );
  }
  return value;
}

/** Request-scoped connection to the CORE database on Turso (React.cache). */
export const getDb = cache(() => {
  const url = readEnv("TURSO_CORE_DATABASE_URL");
  // A local `file:` database (development / demo mode) needs no auth token
  const authToken = url.startsWith("file:") ? undefined : readEnv("TURSO_CORE_AUTH_TOKEN");
  return drizzleTurso({ client: createClient({ url, authToken }) });
});

/**
 * Request-scoped connection to the MEDIA database on Cloudflare D1 (React.cache).
 * In `next dev` the binding is a local D1 copy (see initOpenNextCloudflareForDev
 * in next.config.ts); in production it is the real D1 database.
 */
export const getMediaDb = cache(() => {
  const { env } = getCloudflareContext();
  if (!env.MEDIA_DB) {
    throw new Error("MEDIA_DB D1 binding is missing — check d1_databases in wrangler.jsonc.");
  }
  return drizzleD1(env.MEDIA_DB);
});

// Re-export schema so callers can do: import { getDb, schema } from "@/db"
export { schema };
