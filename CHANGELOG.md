# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-26

First public release.

### Money sections (Chanda, Donations, Committee/Members)
- Contributor profiles, one per person per section; sections are fully independent (profiles, totals, search).
- Public and admin lists show each person once, with number of contributions, last date and total; a `›` opens their profile.
- Itemized history: every payment is its own dated entry with a receipt number; adding money creates a new entry and never overwrites one.
- Entry dates are set on the server in India time.
- Year-wise public visibility (default: current year) with "Total for 2026" labels; public profiles show the all-time history.
- Anonymous contributors are admin-only: excluded from every public page and total, and cannot be published until unticked.
- One Publish / Unpublish button per section; new entries follow the section's state.
- Simple add form (name, phone, amount) with suggestions of existing people in the same section.
- Full-page admin profiles for contributors and members, with Edit and Delete per entry.
- Committee members' contributions are itemized payments, with a public page per member.
- Dashboard and Summary show separate ledgers for Chanda, Donations and Members.

### Platform
- Next.js 16 on Cloudflare Workers (OpenNext), Turso for core data, Cloudflare D1 for media metadata, Cloudinary for images — all on free tiers.
- Public site: home page, events, notices, notes, gallery, Active Members, 80G receipts, member ID cards, calculator with 24-hour history, light/dark mode.
- Admin panel with signed session cookies; every admin action checks the session.
- `npm run demo` (fake data, no accounts) and `npm run setup` (local or cloud).
- CI (lint, type check, Workers build), CodeQL, Dependabot, issue forms, Contributor Covenant.

[1.0.0]: https://github.com/SandeepAi369/victory-youth/releases/tag/v1.0.0
