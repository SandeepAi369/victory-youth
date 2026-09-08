"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");
  const adminPassword = process.env.ADMIN_PASSWORD || "ganesh2026";

  if (!password || password !== adminPassword) {
    redirect("/login?error=Incorrect+password.+Please+try+again.");
  }

  // Detect if running on HTTPS (Cloudflare) or HTTP (local dev)
  const headersList = await headers();
  const proto = headersList.get("x-forwarded-proto") || "http";
  const isSecure = proto === "https";

  const cookieStore = await cookies();
  cookieStore.set("admin-auth", adminPassword, {
    path: "/",
    maxAge: 86400,
    httpOnly: false,
    sameSite: "lax",
    secure: isSecure,
  });

  redirect("/admin");
}
