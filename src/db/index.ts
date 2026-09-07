import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// drizzle-orm v1 unified API - pass connection string directly
const CONNECTION_STRING = process.env.DATABASE_URL || "postgresql://***REMOVED***:***REMOVED***@***REMOVED***:26257/defaultdb?sslmode=require";

console.log("[DB] Using drizzle() with direct connection string");

export const db = drizzle(CONNECTION_STRING, { 
  schema,
  connection: {
    ssl: { rejectUnauthorized: false },
  }
});
export { schema };

console.log("[DB] Drizzle instance created.");
