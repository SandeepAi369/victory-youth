"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");

  if (!password || password !== "ganesh2026") {
    redirect("/login?error=Incorrect+password.+Please+try+again.");
  }

  // Next.js 15+ cookies() is a Promise
  const cookieStore = await cookies();
  cookieStore.set("admin-auth", "ganesh2026", {
    path: "/",
    maxAge: 86400,
    httpOnly: false,
    sameSite: "lax",
    secure: false,
  });

  redirect("/admin");
}