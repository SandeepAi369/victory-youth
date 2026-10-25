"use server";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, verifyAdminPassword } from "@/lib/admin-session";

export async function loginAction(formData: FormData) {
  // No fallback password: if ADMIN_PASSWORD is not configured, nobody can log in
  if (!(await verifyAdminPassword(formData.get("password")))) {
    redirect("/login?error=Incorrect+password.+Please+try+again.");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}
