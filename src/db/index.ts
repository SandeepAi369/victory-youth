import { cache } from "react";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Returns the database connection string.
 * Priority:
 *   1. Cloudflare Hyperdrive connectionString (production edge)
 *   2. DATABASE_URL env variable (local dev / staging)
 *   3. Throws a clear error — never silently fails with hardcoded credentials
 */
function getConnectionString(): string {
  try {
    // On Cloudflare Workers, use Hyperdrive for managed connection pooling
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    if (env?.HYPERDRIVE?.connectionString) {
      return env.HYPERDRIVE.connectionString;
    }
  } catch {
    // Local dev or build time — fall through to DATABASE_URL
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
 * ONE pool + drizzle instance per HTTP request.
 * Uses pg Pool so drizzle receives a proper Client (not a raw string),
 * which fixes the drizzle-orm RC type: drizzle(pool, { schema }) is valid.
 */
export const getDb = cache(() => {
  const pool = new Pool({ connectionString: getConnectionString() });
  return drizzle(pool, { schema });
});

// Re-export schema for convenience
export { schema };
