// Applies the MEDIA schema (drizzle/media/*/migration.sql) to the LOCAL D1 copy
// that `npm run dev` uses. Safe to re-run. Production D1 is updated by `npm run db:push`.
import { migrateMedia } from "./lib.mjs";

migrateMedia();
