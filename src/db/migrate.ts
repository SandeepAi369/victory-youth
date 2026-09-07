import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const connectionString = 'postgresql://***REMOVED***:***REMOVED***@***REMOVED***:26257/defaultdb?sslmode=verify-full';
const sql = postgres(connectionString, { ssl: "require", max: 1 });

async function runMigrate() {
  console.log("Running manual migration...");
  try {
    const migrationFile = path.join(process.cwd(), "drizzle", "20260903084608_superb_adam_destine", "migration.sql");
    const queries = fs.readFileSync(migrationFile, "utf8");
    
    // Split queries by semicolon and execute them sequentially (some might need to be run together but postgres-js can execute multiple statements)
    console.log("Executing SQL...");
    await sql.unsafe(queries);
    console.log("Migrations complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigrate();
