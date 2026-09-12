import { cache } from "react";
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
      "For Cloudflare production, use the HYPERDRIVE binding."
    );
  }
  return dbUrl;
}

/**
 * Request-scoped database instance.
 * React.cache() ensures ONE drizzle instance per HTTP request.
 * On the next request, a fresh connection is created automatically.
 * On Cloudflare, the connection goes through Hyperdrive's pool.
 */
export const getDb = cache(() => {
  return drizzle(getConnectionString(), { schema });
});

// Re-export schema for convenience
export { schema };
