import { cache } from "react";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Returns the database connection string from DATABASE_URL.
 * Throws a clear error — never silently falls back to hardcoded credentials.
 *
 * TODO(new-db): No database is configured yet. Wire the new database's
 * connection here (and add its binding/secret to wrangler.jsonc if needed).
 */
function getConnectionString(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "For local development, add it to your .env file. " +
        "For Cloudflare production, set it with `wrangler secret put DATABASE_URL`."
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
