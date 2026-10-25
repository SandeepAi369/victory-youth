import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Admin session — a signed, expiring cookie instead of the password itself.
 *
 * Cookie value: "v1.<expiresAtMs>.<random nonce>.<HMAC-SHA256 signature>"
 * The signing key is derived from ADMIN_PASSWORD, so changing the password
 * logs every existing session out. There is NO fallback password: if
 * ADMIN_PASSWORD is missing or too short, admin login is disabled.
 */

const COOKIE_NAME = "admin-session";
const LEGACY_COOKIE_NAME = "admin-auth"; // old plaintext-password cookie
const SESSION_SECONDS = 60 * 60 * 24; // 24 hours
const MIN_PASSWORD_LENGTH = 12;

const encoder = new TextEncoder();

function adminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < MIN_PASSWORD_LENGTH) return null;
  return password;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function signingKey(password: string): Promise<CryptoKey> {
  // Derive a dedicated signing key so the password itself never signs data directly
  const base = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const derived = await crypto.subtle.sign("HMAC", base, encoder.encode("victory-youth-admin-session-v1"));
  return crypto.subtle.importKey("raw", derived, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

/** Constant-time password check (compares SHA-256 digests byte by byte). */
export async function verifyAdminPassword(input: unknown): Promise<boolean> {
  const password = adminPassword();
  if (!password || typeof input !== "string" || input.length === 0) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(input)),
    crypto.subtle.digest("SHA-256", encoder.encode(password)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function isHttps(): Promise<boolean> {
  const h = await headers();
  return (h.get("x-forwarded-proto") || "").includes("https");
}

/** Issues a fresh signed session cookie. Call only after verifyAdminPassword(). */
export async function createAdminSession(): Promise<void> {
  const password = adminPassword();
  if (!password) throw new Error("Admin login is disabled: ADMIN_PASSWORD is not configured.");

  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  const payload = `v1.${expiresAt}.${toBase64Url(crypto.getRandomValues(new Uint8Array(16)))}`;
  const signature = await crypto.subtle.sign("HMAC", await signingKey(password), encoder.encode(payload));

  const store = await cookies();
  store.delete(LEGACY_COOKIE_NAME);
  store.set(COOKIE_NAME, `${payload}.${toBase64Url(signature)}`, {
    path: "/",
    maxAge: SESSION_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: await isHttps(),
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete(LEGACY_COOKIE_NAME);
}

/** True only for a cookie with a valid signature that has not expired. */
export async function isAdmin(): Promise<boolean> {
  const password = adminPassword();
  if (!password) return false;

  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const [version, expiresAt, nonce, signature] = parts;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Date.now()) return false;

  try {
    // crypto.subtle.verify compares signatures in constant time
    return await crypto.subtle.verify(
      "HMAC",
      await signingKey(password),
      fromBase64Url(signature),
      encoder.encode(`${version}.${expiresAt}.${nonce}`)
    );
  } catch {
    return false;
  }
}

/**
 * Guard for admin server actions and admin pages. Not logged in → redirect to
 * /login (a server action call then navigates the browser to the login page).
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/login");
}
