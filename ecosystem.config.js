/**
 * PM2 Ecosystem Config
 *
 * ⚠️  IMPORTANT: This config is for LOCAL DEVELOPMENT and STAGING ONLY.
 *
 * PRODUCTION deployment uses Cloudflare Workers via:
 *   npm run build:cloudflare
 *   wrangler deploy
 *
 * DO NOT use PM2 in production — it creates a Node.js server process
 * which conflicts with Cloudflare Edge Runtime behavior.
 *
 * Key differences (LOCAL vs PRODUCTION):
 * ┌─────────────────────────┬─────────────────────────────┐
 * │ Local (PM2/next start)  │ Production (Cloudflare)     │
 * ├─────────────────────────┼─────────────────────────────┤
 * │ Node.js process         │ Edge Worker (stateless)     │
 * │ DATABASE_URL from .env  │ DATABASE_URL wrangler secret│
 * │ File system cache       │ No persistent cache         │
 * │ next start -p 3000      │ wrangler deploy             │
 * └─────────────────────────┴─────────────────────────────┘
 *
 * For local dev, prefer: npm run dev
 * PM2 is only useful if you need to keep the dev server persistent in background.
 */
module.exports = {
  apps: [
    {
      name: "ganesh-bns-dev",
      script: "node_modules/.bin/next",
      args: "dev -H 0.0.0.0 -p 3000",
      watch: false,
      env: {
        NODE_ENV: "development",
        // DATABASE_URL must be set in your .env file
        // ADMIN_PASSWORD must be set in your .env file
      },
      // PM2 log settings
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
