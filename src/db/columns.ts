import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

/**
 * SQLite (Turso) equivalents of the Postgres column types this schema used.
 */

// Postgres boolean → INTEGER 0/1, read back as true/false
export const boolean = (name: string) => integer(name, { mode: "boolean" });

// Postgres timestamp → INTEGER unix seconds, read back as Date
export const timestamp = (name: string) => integer(name, { mode: "timestamp" });

// Postgres jsonb → TEXT holding JSON, parsed on read
export const json = (name: string) => text(name, { mode: "json" });

// Postgres defaultNow() / NOW()
export const now = sql`(unixepoch())`;

export const emptyJsonObject = sql`'{}'`;
export const emptyJsonArray = sql`'[]'`;
