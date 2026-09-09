import { cache } from "react";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const FALLBACK_URL = process.env.DATABASE_URL || "postgresql://***REMOVED***:***REMOVED***@***REMOVED***:26257/defaultdb?sslmode=require";

function getConnectionString(): string {
  try {
    // On Cloudflare Workers, use Hyperdrive for managed connection pooling
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    if (env?.HYPERDRIVE?.connectionString) {
      return env.HYPERDRIVE.connectionString;
    }
  } catch {
    // Local dev or build time — use direct DATABASE_URL
  }
  return FALLBACK_URL;
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
