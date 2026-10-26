# Contributing to Victory Youth

Thanks for your interest in improving Victory Youth! Bug reports, fixes, docs and new ideas are all welcome.

## Quick start (no accounts needed)

```bash
git clone https://github.com/SandeepAi369/victory-youth.git
cd victory-youth
npm install
npm run demo        # local site full of fake sample data → http://localhost:3000
```

`npm run demo` builds a throw-away database in `.demo/` and starts the dev server. Admin login: `demo-admin-password`.

For a clean local setup without sample data:

```bash
npm run setup -- --local
npm run dev
```

Both modes run entirely on your machine (a local SQLite file plus a local D1 copy). They never touch any real database.

## Development workflow

1. **Fork** the repo and create a branch from `main`: `git checkout -b fix/short-description`.
2. Make your change. Keep pull requests **small and focused**: one fix or feature per PR.
3. Run the same checks CI runs:
   ```bash
   npm run lint
   npm run typecheck
   npm run build:cloudflare
   ```
4. Commit with a clear message (we loosely follow [Conventional Commits](https://www.conventionalcommits.org/): `fix:`, `feat:`, `docs:`, `chore:` …).
5. Open a pull request and fill in the template. CI must be green before review.

## Project conventions

- **Two databases.** Core records live in Turso (`src/db/schema-core.ts`, accessed with `getDb()`); media metadata lives in Cloudflare D1 (`src/db/schema-media.ts`, `getMediaDb()`). A query must use the database that owns its table; there are no cross-database joins.
- **Images go to Cloudinary**, uploaded straight from the browser. Store only the `secure_url` / `public_id`, never image data.
- **Admin actions must call `requireAdmin()`** first (see `src/lib/admin-session.ts`), and admin pages must export `dynamic = "force-dynamic"`.
- **Public pages must never expose private data.** Select only the columns a page shows. Anonymous contributors are admin-only: public queries exclude them inside SQL (see `isAnonymousContribution` in `src/lib/queries/public.ts`).
- **Money sections (Chanda, Donations, Members) are independent.** Never mix their profiles, totals or search; every server action is scoped to one category.
- **Amounts are itemized.** New money is a new dated entry (date set on the server, India time); never merge or overwrite an amount.
- **Publishing is one button per section.** Don't add per-entry publish controls; new entries follow the section's state.
- **No secrets in code.** Everything sensitive comes from environment variables / Worker secrets. See `.env.example`.
- **Schema changes:** edit the schema file, then run `npm run db:generate` and commit the generated migration in `drizzle/`.
- TypeScript strict, no `any`; lint and type check must pass with zero problems.

## Finding something to work on

Look for issues labelled [**good first issue**](https://github.com/SandeepAi369/victory-youth/labels/good%20first%20issue) or [**help wanted**](https://github.com/SandeepAi369/victory-youth/labels/help%20wanted). Comment on the issue before you start so work isn't duplicated. Questions and ideas are welcome in [Discussions](https://github.com/SandeepAi369/victory-youth/discussions).

## Reporting bugs and requesting features

Use the issue forms. For security problems, **do not open a public issue**; see [SECURITY.md](SECURITY.md).

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
