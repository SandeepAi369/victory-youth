# Security Policy

## Reporting a vulnerability

**Please do not report security issues in public issues or pull requests.**

Use GitHub's **private vulnerability reporting**: go to the repository's **Security** tab → **Report a vulnerability**. Include:

- what the issue is and where it lives (file, route or action),
- steps to reproduce,
- the impact you expect (for example: data exposure, admin bypass).

You can expect an acknowledgement within a few days. Once a fix is released, we are happy to credit you (unless you prefer to stay anonymous).

## Scope and design notes

- Admin access uses a single password (`ADMIN_PASSWORD`, at least 12 characters) and a signed, expiring, httpOnly session cookie. Every admin server action and admin API route checks the session.
- Public pages select only the columns they display; anonymous contributors are excluded inside the database query and never appear on the public site.
- Admin money actions are scoped to their category (Chanda, Donations, Members) on the server.
- No credentials live in the repository; they come from environment variables / Cloudflare Worker secrets.

If you find a place where any of this does not hold, that is a vulnerability we want to hear about.
