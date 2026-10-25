# Victory Youth

A modern community, youth-impact and donation management platform for **Victory Youth Association** (Gudem Gally, Banswada, Telangana), built to run a festival season end to end: events and pooja schedules, donations and chanda collection, members and ID cards, notices, and a photo gallery, all managed from one private admin panel.

It is designed to run for years on free tiers: **Next.js** on **Cloudflare Workers**, **Turso** for core records, **Cloudflare D1** for media metadata, and **Cloudinary** for the images themselves.

---

## Features

### Public site
- **Home page**: hero carousel, banners, live totals (members, donations, events), notices and recent donations.
- **Events & schedule**: day-by-day pooja and event programme with timings, locations and people in charge.
- **Donations & chanda**: published donor lists and running totals. Entries only appear once an admin publishes them, and donors marked **Anonymous** are always shown as "Anonymous Devotee" (the real name never leaves the database for public pages).
- **Donation receipts**: shareable receipt page (`/receipt/<id>`) with a downloadable 80G receipt PDF. Only successful transactions get a receipt.
- **Member ID verifier**: look up an active member by exact member ID or phone number and download a printable ID card (PDF with QR code). Phone numbers are masked unless the visitor searched by that number.
- **Notices & notes**: committee announcements and important updates.
- **Photo gallery**: Cloudinary-hosted photos in a masonry grid.
- **Light and dark mode**, responsive on every screen size.

### Admin panel (`/admin`)
- Manage **members**, **donations**, **chanda**, **events**, **inventory** (with Excel export), **notices**, **notes**, **gallery**, **banners** and **hero images**.
- **Master financial summary** across donations, sponsors and auctions.
- **Association settings**: name, registration and 80G numbers, contact details, and UPI / bank details shown to donors.
- Publish / unpublish switches on most content, so nothing goes live until it is ready, plus an **Anonymous** switch per donation.
- Image uploads go **directly from the browser to Cloudinary**; the database stores only the `secure_url` and `public_id`.

### Security
- Single admin password (`ADMIN_PASSWORD`) with **no fallback**: if it is not configured, admin login is disabled.
- **Signed, expiring, httpOnly session cookie** (HMAC-SHA256); the password is never stored in the browser. Changing the password signs out every session.
- **Every admin server action and admin API route checks the session**, so none of them can be called without logging in.
- All credentials come from environment variables / Cloudflare Worker secrets; nothing is hardcoded.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions), React 19, TypeScript |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com) via [OpenNext](https://opennext.js.org/cloudflare) |
| Core database | [Turso](https://turso.tech) (libSQL / SQLite): 20 tables for members, donations, events, finance, notices, settings and more |
| Media database | [Cloudflare D1](https://developers.cloudflare.com/d1/): 5 tables for gallery, gallery categories, banners, hero images and documents |
| ORM | [Drizzle ORM](https://orm.drizzle.team) + drizzle-kit |
| Images | [Cloudinary](https://cloudinary.com) (unsigned browser uploads, signed server-side deletes) |
| UI | Tailwind CSS 4, Framer Motion, Lucide icons |
| Documents | jsPDF (receipts and ID cards), SheetJS (Excel export) |
| CI/CD | GitHub Actions → `wrangler deploy` on every push to `main` |

### How the data is split

```
                    ┌──────────────────────────┐
  Browser ─────────▶│  Next.js on CF Workers   │
     │              └────┬───────────────┬─────┘
     │ (direct upload)   │ getDb()       │ getMediaDb()
     ▼                   ▼               ▼
  Cloudinary        Turso (core)    Cloudflare D1 (media)
  image files       members,        gallery, banners,
                    donations, ...  hero images, documents
                                    (URLs + metadata only)
```

`src/db/index.ts` exposes both connections. Each query uses the database that owns its table; there are no joins across the two.

---

## Local Development Setup

### Prerequisites
- **Node.js 22** and npm
- A free [Turso](https://turso.tech) account and the [Turso CLI](https://docs.turso.tech/cli/introduction)
- A free [Cloudflare](https://dash.cloudflare.com) account (Workers + D1)
- A free [Cloudinary](https://cloudinary.com) account

### 1. Clone and install

```bash
git clone https://github.com/SandeepAi369/victory-youth.git
cd victory-youth
npm install
```

### 2. Create the databases

```bash
# Core database on Turso
turso db create victory-youth-core
turso db show victory-youth-core --url        # → TURSO_CORE_DATABASE_URL
turso db tokens create victory-youth-core     # → TURSO_CORE_AUTH_TOKEN

# Media database on Cloudflare D1
npx wrangler d1 create victory-youth-media
```

Put the D1 `database_id` that Wrangler prints into **`wrangler.jsonc`** (`d1_databases`) and **`drizzle.media.config.ts`**, together with your Cloudflare account ID.

### 3. Environment variables

Create a `.env` file in the project root (it is git-ignored):

```bash
# Turso core database
TURSO_CORE_DATABASE_URL=libsql://victory-youth-core-<your-org>.turso.io
TURSO_CORE_AUTH_TOKEN=<turso token>

# Admin login (at least 12 characters)
ADMIN_PASSWORD=<a long passphrase>

# Cloudinary (server-side image deletes)
CLOUDINARY_CLOUD_NAME=<cloud name>
CLOUDINARY_API_KEY=<api key>
CLOUDINARY_API_SECRET=<api secret>

# Cloudflare API token with Workers + D1 Edit (used by db:push for D1 and by wrangler)
CLOUDFLARE_API_TOKEN=<token>
```

Optional, only for the notice broadcast endpoint: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, `RESEND_API_KEY`.

Browser uploads use an **unsigned upload preset**. Set the cloud name and preset name in the admin upload components (`src/app/admin/{gallery,banners,story}/client.tsx`) to match your Cloudinary account.

### 4. Create the tables

```bash
npm run db:push          # creates the core tables in Turso and the media tables in D1
npm run db:media:local   # creates the media tables in the local D1 copy used by `npm run dev`
```

### 5. Run it

```bash
npm run dev
```

Open http://localhost:3000. Log in to the admin panel at http://localhost:3000/login with your `ADMIN_PASSWORD`.

To test in the real Workers runtime instead of the Node dev server:

```bash
npm run preview
```

### Useful scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server (with Cloudflare bindings through OpenNext) |
| `npm run preview` | Build for Workers and run locally with `wrangler dev` |
| `npm run deploy` | Build for Workers and deploy with `wrangler deploy` |
| `npm run db:generate` | Generate SQL migrations for both databases |
| `npm run db:push` | Apply the schema to Turso (core) and D1 (media) |
| `npm run db:media:local` | Apply the media schema to the local D1 copy |
| `npm run lint` | Run ESLint |

---

## Deployment

Every push to `main` deploys automatically through GitHub Actions (`.github/workflows/deploy.yml`).

1. Add a repository secret **`CLOUDFLARE_API_TOKEN`** (Settings → Secrets and variables → Actions).
2. Set the runtime secrets on the Worker once:

```bash
npx wrangler secret put TURSO_CORE_DATABASE_URL
npx wrangler secret put TURSO_CORE_AUTH_TOKEN
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put CLOUDINARY_CLOUD_NAME
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
```

The media database needs no secret: the Worker reaches D1 through the `MEDIA_DB` binding in `wrangler.jsonc`.

---

## Project Structure

```
src/
├── app/               # Next.js routes: public pages, /admin panel, API routes
├── components/        # Public, admin and shared UI components
├── db/
│   ├── index.ts       # getDb() → Turso, getMediaDb() → D1
│   ├── schema-core.ts # 20 core tables (Turso)
│   └── schema-media.ts# 5 media tables (D1)
└── lib/
    ├── admin-session.ts   # signed admin sessions + requireAdmin()
    ├── cloudinary-admin.ts# signed Cloudinary deletes
    ├── queries/           # public and financial read queries
    └── actions/           # admin server actions
drizzle/               # generated SQL migrations (core/ and media/)
```

---

## License

Released under the [MIT License](LICENSE) © 2026 Sandeep CH.
