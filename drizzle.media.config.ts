import { defineConfig } from "drizzle-kit";

// MEDIA database — Cloudflare D1 "victory-youth-media", tables in src/db/schema-media.ts.
// Uses the D1 HTTP API, so CLOUDFLARE_API_TOKEN needs the D1:Edit permission.
export default defineConfig({
  schema: "./src/db/schema-media.ts",
  out: "./drizzle/media",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: "3599fd84a57a8884da174cd015d96e1e",
    databaseId: "4dc7d7ca-db64-4a2f-a405-d016a2e3f819",
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
