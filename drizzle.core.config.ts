import { defineConfig } from "drizzle-kit";

// CORE Turso database — tables in src/db/schema-core.ts
export default defineConfig({
  schema: "./src/db/schema-core.ts",
  out: "./drizzle/core",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_CORE_DATABASE_URL!,
    authToken: process.env.TURSO_CORE_AUTH_TOKEN,
  },
});
