import { cache } from "react";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Returns the database connection string.
 * Priority:
 *   1. Cloudflare Hyperdrive connectionString (production edge)
 *   2. DATABASE_URL env variable (local dev / staging)
 *   3. Throws a clear error — never silently falls back to hardcoded credentials
 */
function getConnectionString(): string {
  try {
    // On Cloudflare Workers, Hyperdrive provides a managed connection pool
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    if (env?.HYPERDRIVE?.connectionString) {
      return env.HYPERDRIVE.connectionString;
    }
  } catch {
    // Not in Cloudflare context (local dev / build time) — fall through
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "For local development, add it to your .env file. " +
        "For Cloudflare production, configure the HYPERDRIVE binding."
    );
  }
  return dbUrl;
}

/**
 * Request-scoped database instance via React.cache().
 *
 * Note on schema: This drizzle-orm RC version does not expose a typed
 * overload for drizzle(connectionString, { schema }). The schema is
 * passed directly in every query (db.select().from(schema.table)) which
 * is how this entire codebase works — no relational query API used.
 */
export const getDb = cache(() => drizzle(getConnectionString()));

// Re-export schema so callers can do: import { getDb, schema } from "@/db"
export { schema };
