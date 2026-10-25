/**
 * Combined schema namespace, so callers can keep using `schema.<table>`.
 * Tables live in two Turso databases — see src/db/index.ts:
 *   - schema-core.ts  → getDb()
 *   - schema-media.ts → getMediaDb()
 */
export * from "./schema-core";
export * from "./schema-media";
