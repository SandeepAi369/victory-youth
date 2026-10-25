// Applies the MEDIA schema (drizzle/media/*/migration.sql, oldest first) to the
// LOCAL D1 copy that `next dev` uses. Production D1 is updated by `npm run db:push`.
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const dirs = readdirSync("drizzle/media", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const dir of dirs) {
  console.log(`Applying drizzle/media/${dir}/migration.sql to local D1...`);
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "victory-youth-media", "--local", "--file", `drizzle/media/${dir}/migration.sql`],
    { stdio: "inherit", shell: process.platform === "win32" }
  );
}
